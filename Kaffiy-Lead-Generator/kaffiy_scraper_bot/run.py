"""
Kaffiy Scraper Bot - Ana giriş noktası.
Google arama + temizleme + scraped_leads.json / scraper_status.json yazar.
Kullanım:
  python -m kaffiy_scraper_bot --query "kafe kadıköy" --city "İstanbul" --max 20
  python run.py --query "kahveci istanbul"
"""
import argparse
import json
import logging
import sys
from datetime import datetime
from pathlib import Path

from .config import (
    CATEGORY_FILTER_WORDS,
    DEFAULT_MAX_RESULTS,
    LEADS_DATA_PATH,
    REJECTED_LEADS_PATH,
    SCRAPED_LEADS_PATH,
    SCRAPER_STATUS_PATH,
)
from .google_search import search_many_queries
from .places_search import fetch_places_with_details, places_to_item
from .cleaner import filter_leads, is_query_irrelevant, items_to_leads
from .website_scraper import enrich_leads_from_websites

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger("kaffiy_scraper_bot")


def _write_json(path: Path, data: list | dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _read_json(path: Path, default: list | dict):
    if not path.exists():
        return default
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.warning("Okuma hatası %s: %s", path, e)
        return default


def update_status(status: str, details: str = "", run_id: str = "") -> None:
    payload = {
        "status": status,
        "details": details,
        "run_id": run_id,
        "updated_at": datetime.now().isoformat(timespec="seconds"),
    }
    _write_json(SCRAPER_STATUS_PATH, payload)


def run_scraper(
    query: str = "",
    city: str = "İstanbul",
    county: str = "",
    search_strings: list[str] | None = None,
    max_results: int = DEFAULT_MAX_RESULTS,
    use_places: bool = False,
) -> int:
    """
    use_places=True: Google Places API (Text Search + Details) ile arama.
    use_places=False: Google Custom Search ile arama.
    Apify benzeri: locationQuery + searchStrings veya tek query; only_includes uygulanır.
    Returns: eklenen lead sayısı.
    """
    run_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    city = (city or "İstanbul").strip()
    location = (county or city).strip()
    use_apify_mode = bool(search_strings and len(search_strings) > 0)
    queries: list[str] = []

    if use_apify_mode:
        terms = [s.strip() for s in search_strings if (s or "").strip()]
        if not terms:
            update_status("error", "Arama terimleri boş olamaz", run_id)
            return 0
        or_query = " OR ".join(terms)
        if use_places:
            queries = [f"{or_query} in {location}"]
        else:
            queries = [f"{or_query} {location}"]
        update_status("running", f"Çoklu arama (OR): {location} ({len(terms)} terim)" + (" [Places API]" if use_places else ""), run_id)
    else:
        q = (query or "").strip()
        if not q:
            update_status("error", "Sorgu veya arama terimleri girin", run_id)
            return 0
        if not use_places and is_query_irrelevant(q):
            update_status("idle", "Alakasız sorgu tespit edildi; arama yapılmadı.", run_id)
            return 0
        queries = [f"{q} in {location}"] if use_places else [q]
        update_status("running", f"Aranıyor: {q}" + (" [Places API]" if use_places else ""), run_id)

    try:
        if use_places:
            places_with_details = fetch_places_with_details(
                queries, city=city, language="tr", region="tr", place_type="restaurant", max_results=max_results
            )
            items = [places_to_item(pwd, city) for pwd in places_with_details]
        else:
            items = search_many_queries(queries, max_total=max_results)
        if not items:
            update_status("idle", "Sonuç bulunamadı. (Mevcut liste korundu)", run_id)
            return 0

        leads = items_to_leads(items, city=city)
        update_status("running", "Web sitelerinden bilgi kazanılıyor...", run_id)
        enrich_leads_from_websites(leads)
        category_words = CATEGORY_FILTER_WORDS if use_apify_mode else None
        kept, rejected = filter_leads(leads, include_chains=False, category_include_words=category_words)

        # Rejected'ı mevcut rejected_leads.json'a ekle (opsiyonel)
        existing_rej = _read_json(REJECTED_LEADS_PATH, [])
        if isinstance(existing_rej, list):
            existing_rej.extend(rejected)
            _write_json(REJECTED_LEADS_PATH, existing_rej)

        # Bulunan lead'leri her zaman data klasöründeki listeye EKLE (sil diyene kadar kalır)
        existing = _read_json(SCRAPED_LEADS_PATH, [])
        if not isinstance(existing, list):
            existing = []
        existing_keys = set()
        for L in existing:
            w = (L.get("Website") or "").strip()
            key = w or f"{L.get('Company Name') or ''}|{L.get('City') or ''}|{L.get('Phone') or ''}"
            if key:
                existing_keys.add(key)
        max_id = 0
        for L in existing:
            try:
                sid = L.get("ID") or ""
                if isinstance(sid, str) and sid.startswith("scrape-"):
                    max_id = max(max_id, int(sid.replace("scrape-", "").strip() or 0))
                else:
                    max_id = max(max_id, int(sid) if str(sid).isdigit() else 0)
            except (ValueError, TypeError):
                pass
        added = 0
        for lead in kept:
            w = (lead.get("Website") or "").strip()
            key = w or f"{lead.get('Company Name') or ''}|{lead.get('City') or ''}|{lead.get('Phone') or ''}"
            if key and key in existing_keys:
                continue
            if key:
                existing_keys.add(key)
            max_id += 1
            lead["ID"] = f"scrape-{max_id}"
            existing.append(lead)
            added += 1
        _write_json(SCRAPED_LEADS_PATH, existing)
        update_status("idle", f"{added} yeni eklendi (toplam {len(existing)}), {len(rejected)} elendi.", run_id)
        return added
    except Exception as e:
        logger.exception("Scraper hatası: %s", e)
        update_status("error", str(e), run_id)
        return 0


def main() -> None:
    parser = argparse.ArgumentParser(description="Kaffiy Scraper Bot - Google ile lead arama (Apify benzeri)")
    parser.add_argument("--query", "-q", default="", help="Tek arama sorgusu (örn: kafe kadıköy)")
    parser.add_argument("--city", "-c", default="İstanbul", help="Şehir (lead alanı)")
    parser.add_argument("--county", default="", help="İlçe / locationQuery (örn: Kadıköy)")
    parser.add_argument("--search-strings", "-s", default="", help="Virgülle ayrılmış arama terimleri (Apify modu: kafe,kahve,coffee,cafe,espresso,roastery)")
    parser.add_argument("--max", "-n", type=int, default=DEFAULT_MAX_RESULTS, help="Maksimum sonuç sayısı (Apify modunda 100)")
    parser.add_argument("--places", "-p", action="store_true", help="Google Places API kullan (Text Search + Details)")
    args = parser.parse_args()

    search_strings: list[str] | None = None
    if (args.search_strings or "").strip():
        search_strings = [s.strip() for s in args.search_strings.split(",") if s.strip()]
    if search_strings is None or len(search_strings) == 0:
        search_strings = None  # tek sorgu modu

    count = run_scraper(
        query=args.query or "",
        city=args.city,
        county=args.county,
        search_strings=search_strings,
        max_results=args.max,
        use_places=args.places,
    )
    logger.info("Tamamlandı: %d lead scraped_leads.json'a yazıldı.", count)


if __name__ == "__main__":
    main()
