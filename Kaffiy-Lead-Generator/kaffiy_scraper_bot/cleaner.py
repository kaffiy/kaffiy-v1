"""
Scraped sonuçları lead formatına çevirir ve blacklist ile temizler.
scrubber ile uyumlu alan isimleri kullanır.
"""
import logging
import re
from datetime import datetime
from typing import Any

# Blacklist (scrubber ile aynı mantık)
BLACKLIST = {
    "kıraathane", "kiraathane", "kahvehane", "oyun salonu", "internet kafe",
    "playstation", "bilardo", "dernek", "lokal", "kooperatif",
    "shell", "petrol", "opet", "total", "bp", "gaz", "otogaz",
    "holding", "lojistik", "inşaat", "ticaret", "ltd", "şti", "a.ş.",
    "fabrika", "sanayi", "otomotiv", "emlak", "sigorta", "kargo",
    "market", "tekel", "bakkal", "kırtasiye", "eczane", "terzi", "berber", "kuaför",
}
CHAIN_BLACKLIST = {"starbucks", "espresso lab", "kahve dünyası"}

# Alakasız sorgu tespiti: bu kelimeler varsa ve kafe/kahve ile ilgili kelime yoksa arama yapma
QUERY_CAFE_KEYWORDS = {
    "kahve", "kafe", "cafe", "kafé", "çay", "pastane", "brunch", "mekan",
    "restoran", "breakfast", "kafeterya", "coffee", "kafeterya", "tatlı",
}
QUERY_IRRELEVANT_TERMS = {
    "oyun", "playstation", "film", "sinema", "maç", "spor", "emlak", "kiralık",
    "satılık", "iş ilanı", "cv", "tatil", "otel", "araç", "oto", "bilgisayar",
    "laptop", "giyim", "takı", "dernek", "parti", "siyaset", "oyun salonu",
}


logger = logging.getLogger("kaffiy_scraper_bot")


def is_query_irrelevant(query: str) -> bool:
    """
    Sorgu kafe/kahve ile alakasız mı? Alakasızsa arama yapılmaz.
    Kafe ile ilgili en az bir kelime varsa alakalı sayılır; yoksa ve alakasız
    kelime varsa true döner.
    """
    if not (query or "").strip():
        return True
    q = (query or "").lower().strip()
    has_cafe = any(kw in q for kw in QUERY_CAFE_KEYWORDS)
    has_irrelevant = any(term in q for term in QUERY_IRRELEVANT_TERMS)
    return has_irrelevant and not has_cafe


def _normalize_title(title: str) -> str:
    if not title:
        return ""
    # Site adı vb. ayırıcıları temizle
    for sep in [" - ", " | ", " – ", " — "]:
        if sep in title:
            title = title.split(sep)[0]
    return title.strip()


def is_blacklisted(name: str, include_chains: bool = True) -> bool:
    haystack = (name or "").lower()
    for word in BLACKLIST:
        if word in haystack:
            return True
    if include_chains:
        for word in CHAIN_BLACKLIST:
            if word in haystack:
                return True
    return False


def _extract_phone_from_snippet(snippet: str) -> str | None:
    """Snippet içinden 05xx veya +90 5xx formatında telefon arar."""
    if not snippet:
        return None
    # 05xx xxx xx xx veya +90 5xx
    patterns = [
        r"\+90\s*5\d{2}\s*\d{3}\s*\d{2}\s*\d{2}",
        r"0\s*5\d{2}\s*\d{3}\s*\d{2}\s*\d{2}",
        r"5\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}",
    ]
    for pat in patterns:
        m = re.search(pat, re.sub(r"\s+", " ", snippet))
        if m:
            digits = re.sub(r"\D", "", m.group(0))
            if digits.startswith("90"):
                digits = digits[2:]
            if digits.startswith("0"):
                digits = digits[1:]
            if len(digits) == 10 and digits.startswith("5"):
                return "+90" + digits
    return None


def _extract_email_from_snippet(snippet: str) -> str | None:
    if not snippet:
        return None
    m = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", snippet)
    return m.group(0) if m else None


def item_to_lead(item: dict[str, Any], city: str, index: int) -> dict[str, Any]:
    """
    Google Custom Search veya Places API item -> dashboard lead formatı.
    Places item'da _details_phone, _details_website kullanılır.
    """
    title = _normalize_title(item.get("title") or "")
    link = (item.get("link") or "").strip()
    snippet = (item.get("snippet") or "").strip()
    display_link = (item.get("displayLink") or "").strip()

    phone = (item.get("_details_phone") or "").strip() or _extract_phone_from_snippet(snippet)
    mail = _extract_email_from_snippet(snippet)
    website = (item.get("_details_website") or "").strip() or link
    if website and not website.startswith("http"):
        website = link  # fallback

    lead: dict[str, Any] = {
        "ID": f"scrape-{index}",
        "Country": "TR",
        "City": city or "İstanbul",
        "Company Name": title or display_link or (link[:50] if link else ""),
        "Website": website or link,
        "Mail": mail or "",
        "Instagram": "",
        "Phone": phone or "",
        "Rating": str(item.get("_rating") or "") if item.get("_rating") is not None else "",
        "Last Review": snippet[:500] if snippet else "",
        "Lead Status": "Scraped",
        "Lead Type": "WhatsApp" if phone else ("Email" if mail else "Web"),
        "Active Strategy": "A",
        "_scraped_at": datetime.now().isoformat(timespec="seconds"),
        "_source": "google_places" if item.get("_place_id") else "google_search",
    }
    return lead


def items_to_leads(items: list[dict[str, Any]], city: str) -> list[dict[str, Any]]:
    """Google sonuçlarını lead listesine çevirir (filtre uygulanmaz)."""
    return [item_to_lead(item, city, i + 1) for i, item in enumerate(items)]


def lead_matches_category(lead: dict[str, Any], include_words: list[str]) -> bool:
    """Apify only_includes: lead adı veya snippet en az bir kategori kelimesi içermeli."""
    if not include_words:
        return True
    haystack = (
        (lead.get("Company Name") or "")
        + " "
        + (lead.get("Last Review") or "")
    ).lower()
    return any(w.strip().lower() in haystack for w in include_words if w.strip())


def filter_leads(
    leads: list[dict[str, Any]],
    include_chains: bool = False,
    category_include_words: list[str] | None = None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """
    Lead listesine blacklist, only_includes (kategori) ve kontakt kontrolü uygular.
    category_include_words verilirse lead en az birini içermeli (Apify searchMatching: only_includes).
    Returns (kept_leads, rejected_leads).
    """
    kept: list[dict[str, Any]] = []
    rejected: list[dict[str, Any]] = []
    timestamp = datetime.now().isoformat(timespec="seconds")

    for lead in leads:
        name = lead.get("Company Name") or ""

        if is_blacklisted(name, include_chains=include_chains):
            lead["rejected_reason"] = "irrelevant"
            lead["rejected_at"] = timestamp
            rejected.append(lead)
            continue

        if category_include_words and not lead_matches_category(lead, category_include_words):
            lead["rejected_reason"] = "irrelevant"
            lead["rejected_at"] = timestamp
            rejected.append(lead)
            continue

        has_contact = bool((lead.get("Phone") or "").strip() or (lead.get("Mail") or "").strip())
        if not has_contact:
            lead["rejected_reason"] = "no_contact"
            lead["rejected_at"] = timestamp
            rejected.append(lead)
            continue

        kept.append(lead)

    logger.info("Temizleme: %d eklendi, %d elendi", len(kept), len(rejected))
    return kept, rejected


def clean_and_convert(
    items: list[dict[str, Any]],
    city: str,
    include_chains: bool = False,
    category_include_words: list[str] | None = None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """
    Google sonuçlarını lead'e çevirir, blacklist ve kontakt kontrolü uygular.
    (Website zenginleştirmesi yapılmaz; run.py'de önce items_to_leads -> enrich -> filter_leads kullanın.)
    Returns (kept_leads, rejected_leads).
    """
    leads = items_to_leads(items, city)
    return filter_leads(leads, include_chains=include_chains, category_include_words=category_include_words)
