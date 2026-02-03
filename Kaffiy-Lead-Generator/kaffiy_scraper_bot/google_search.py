"""
Google Custom Search JSON API ile arama.
https://developers.google.com/custom-search/v1/overview
"""
import logging
import time
from typing import Any

import requests

from .config import GOOGLE_API_KEY, GOOGLE_CSE_ID, MAX_RESULTS_PER_QUERY

logger = logging.getLogger("kaffiy_scraper_bot")


def search(query: str, num: int = 10, start: int = 1) -> list[dict[str, Any]]:
    """
    Google Custom Search JSON API ile arama yapar.
    num: max 10 per request.
    start: 1-based index (1, 11, 21 ...)
    Returns list of items with: title, link, snippet, displayLink.
    """
    if not GOOGLE_API_KEY or not GOOGLE_CSE_ID:
        logger.warning("GOOGLE_API_KEY veya GOOGLE_CSE_ID tanımlı değil.")
        return []

    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": GOOGLE_API_KEY,
        "cx": GOOGLE_CSE_ID,
        "q": query,
        "num": min(num, MAX_RESULTS_PER_QUERY),
        "start": start,
    }

    try:
        resp = requests.get(url, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        items = data.get("searchInformation", {}).get("totalResults", "0")
        logger.info("Arama tamamlandı: %s sonuç", items)
        return data.get("items") or []
    except requests.RequestException as e:
        logger.error("Google API hatası: %s", e)
        return []
    except Exception as e:
        logger.error("Parse hatası: %s", e)
        return []


def search_many_queries(queries: list[str], max_total: int = 20) -> list[dict[str, Any]]:
    """
    Birden fazla sorgu çalıştırır, toplam max_total sonuç döner.
    Her istekten sonra kısa bekleme (rate limit).
    """
    seen_links: set[str] = set()
    results: list[dict[str, Any]] = []

    for q in queries:
        if len(results) >= max_total:
            break
        start = 1
        remaining = max_total - len(results)
        num = min(MAX_RESULTS_PER_QUERY, remaining)

        while num > 0:
            items = search(q, num=num, start=start)
            if not items:
                break
            for item in items:
                link = (item.get("link") or "").strip()
                if link and link not in seen_links:
                    seen_links.add(link)
                    results.append(item)
                    if len(results) >= max_total:
                        break
            if len(results) >= max_total:
                break
            start += num
            if start > 100:  # API genelde 100 sonuç sınırı
                break
            time.sleep(0.5)  # rate limit

    return results
