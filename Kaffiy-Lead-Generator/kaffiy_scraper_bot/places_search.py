"""
Google Places API (Text Search + Place Details) ile işletme arama.
https://maps.googleapis.com/maps/api/place/textsearch/json?query=kafe+in+kadikoy&language=tr&region=tr&type=restaurant&key=...
Place Details ile telefon ve website alınır.
"""
import logging
import time
import urllib.parse
from typing import Any

import requests

from .config import GOOGLE_API_KEY

logger = logging.getLogger("kaffiy_scraper_bot")

TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"
REQUEST_DELAY_SEC = 0.2  # Place Details rate limit


def _normalize_phone_tr(raw: str) -> str | None:
    """Türkiye mobil: +90 5xx xxx xx xx formatına getir."""
    if not raw or not isinstance(raw, str):
        return None
    import re
    digits = re.sub(r"\D", "", raw)
    if digits.startswith("90") and len(digits) >= 12:
        digits = digits[2:]
    if digits.startswith("0"):
        digits = digits[1:]
    if len(digits) == 10 and digits.startswith("5"):
        return "+90" + digits
    if len(digits) >= 10:
        return "+90" + digits[-10:] if digits[-10:].startswith("5") else None
    return None


def places_text_search(
    query: str,
    language: str = "tr",
    region: str = "tr",
    place_type: str = "restaurant",
    max_results: int = 60,
) -> list[dict[str, Any]]:
    """
    Places API Text Search. query örn: "kafe in Kadıköy".
    type: restaurant | cafe (API'de cafe ayrı type).
    """
    if not GOOGLE_API_KEY:
        logger.warning("GOOGLE_API_KEY tanımlı değil.")
        return []

    all_results: list[dict[str, Any]] = []
    next_page_token: str | None = None

    while len(all_results) < max_results:
        params: dict[str, str] = {
            "query": query,
            "language": language,
            "region": region,
            "key": GOOGLE_API_KEY,
        }
        if place_type:
            params["type"] = place_type
        if next_page_token:
            params["pagetoken"] = next_page_token

        try:
            resp = requests.get(TEXT_SEARCH_URL, params=params, timeout=15)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            logger.error("Places Text Search hatası: %s", e)
            break

        if data.get("status") != "OK" and data.get("status") != "ZERO_RESULTS":
            logger.warning("Places API status: %s", data.get("status"))
            break

        results = data.get("results") or []
        for r in results:
            if len(all_results) >= max_results:
                break
            all_results.append(r)

        next_page_token = data.get("next_page_token")
        if not next_page_token or not results:
            break
        time.sleep(1)  # next_page_token hemen kullanılamıyor

    logger.info("Places Text Search: %s -> %d sonuç", query, len(all_results))
    return all_results


def get_place_details(place_id: str) -> dict[str, Any]:
    """Place Details ile telefon ve website alır."""
    if not GOOGLE_API_KEY or not place_id:
        return {}

    params = {
        "place_id": place_id,
        "fields": "formatted_phone_number,international_phone_number,website,name,formatted_address",
        "key": GOOGLE_API_KEY,
    }

    try:
        resp = requests.get(PLACE_DETAILS_URL, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        logger.debug("Place Details hatası %s: %s", place_id, e)
        return {}

    if data.get("status") != "OK":
        return {}

    result = data.get("result") or {}
    phone = result.get("international_phone_number") or result.get("formatted_phone_number") or ""
    phone_norm = _normalize_phone_tr(phone) if phone else None
    return {
        "website": (result.get("website") or "").strip() or None,
        "phone": phone_norm or (phone.strip() or None),
        "formatted_address": result.get("formatted_address") or "",
        "name": result.get("name") or "",
    }


def fetch_places_with_details(
    queries: list[str],
    city: str,
    language: str = "tr",
    region: str = "tr",
    place_type: str = "restaurant",
    max_results: int = 60,
) -> list[dict[str, Any]]:
    """
    Her sorgu için Text Search yapar, sonuçları birleştirir (place_id ile dedupe),
    her place için Details çeker (telefon, website).
    Returns: list of {place: raw place dict, details: {website, phone, ...}}
    """
    seen_ids: set[str] = set()
    combined: list[dict[str, Any]] = []
    per_query = max(20, max_results // max(1, len(queries)))

    for q in queries:
        if len(combined) >= max_results:
            break
        places = places_text_search(
            query=q,
            language=language,
            region=region,
            place_type=place_type,
            max_results=per_query,
        )
        for p in places:
            pid = p.get("place_id")
            if not pid or pid in seen_ids:
                continue
            seen_ids.add(pid)
            time.sleep(REQUEST_DELAY_SEC)
            details = get_place_details(pid)
            combined.append({"place": p, "details": details})
            if len(combined) >= max_results:
                break

    return combined


def places_to_item(place_with_details: dict[str, Any], city: str) -> dict[str, Any]:
    """
    Place + Details -> Custom Search item formatına benzer yapı (item_to_lead uyumlu).
    title, link, snippet, displayLink; ek alanlar place_id, rating, details.
    """
    place = place_with_details.get("place") or {}
    details = place_with_details.get("details") or {}
    name = (place.get("name") or "").strip()
    addr = (place.get("formatted_address") or details.get("formatted_address") or "").strip()
    website = details.get("website") or ""
    phone = details.get("phone") or ""
    rating = place.get("rating")
    user_ratings = place.get("user_ratings_total")
    snippet_parts = [addr]
    if phone:
        snippet_parts.append(phone)
    if rating is not None:
        snippet_parts.append(f"Puan: {rating}" + (f" ({user_ratings} değerlendirme)" if user_ratings else ""))
    snippet = " | ".join(snippet_parts)
    link = website or f"https://www.google.com/maps/place/?q=place_id:{place.get('place_id', '')}"

    return {
        "title": name,
        "link": link,
        "snippet": snippet,
        "displayLink": "",
        "_place_id": place.get("place_id"),
        "_rating": rating,
        "_details_phone": phone,
        "_details_website": website,
    }
