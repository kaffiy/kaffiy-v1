"""
İşletme web sitelerinden Instagram, telefon ve e-posta kazıma.
Google sonuçlarındaki lead'lerin Website alanı varsa sayfa çekilip bilgi çıkarılır.
"""
import logging
import re
import time
from typing import Any

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger("kaffiy_scraper_bot")

# Sayfa boyutu sınırı (bayt), büyük sayfaları kes
MAX_PAGE_BYTES = 500_000
REQUEST_TIMEOUT = 12
REQUEST_DELAY_SEC = 1.0
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

# Instagram URL/handle regex
INSTAGRAM_URL_PATTERN = re.compile(
    r"https?://(?:www\.)?instagram\.com/([a-zA-Z0-9_.]+)/?",
    re.IGNORECASE,
)
INSTAGRAM_HANDLE_PATTERN = re.compile(r"@([a-zA-Z0-9_.]{1,30})\b")
# Türkiye mobil: 05xx xxx xx xx
PHONE_PATTERNS = [
    re.compile(r"\+90\s*5\d{2}\s*\d{3}\s*\d{2}\s*\d{2}"),
    re.compile(r"0\s*5\d{2}\s*\d{3}\s*\d{2}\s*\d{2}"),
    re.compile(r"5\d{2}[\s.\-]?\d{3}[\s.\-]?\d{2}[\s.\-]?\d{2}"),
]
EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")


def _normalize_phone(match: re.Match) -> str | None:
    digits = re.sub(r"\D", "", match.group(0))
    if digits.startswith("90"):
        digits = digits[2:]
    if digits.startswith("0"):
        digits = digits[1:]
    if len(digits) == 10 and digits.startswith("5"):
        return "+90" + digits
    return None


def _fetch_page(url: str) -> str | None:
    """URL'yi çeker, HTML metnini döner. Hata/ timeout'ta None."""
    if not url or not url.strip().startswith("http"):
        return None
    try:
        resp = requests.get(
            url.strip(),
            timeout=REQUEST_TIMEOUT,
            headers={"User-Agent": USER_AGENT},
            allow_redirects=True,
        )
        resp.raise_for_status()
        content = resp.content
        if len(content) > MAX_PAGE_BYTES:
            content = content[:MAX_PAGE_BYTES]
        return content.decode(resp.encoding or "utf-8", errors="replace")
    except Exception as e:
        logger.debug("Sayfa alınamadı %s: %s", url, e)
        return None


def _get_text_and_links(html: str) -> tuple[str, list[str]]:
    """HTML'den görünür metin ve tüm href linklerini çıkarır (script/style atlanır)."""
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup.find_all(["script", "style", "noscript"]):
        tag.decompose()
    text = soup.get_text(separator=" ", strip=True)
    links: list[str] = []
    for a in soup.find_all("a", href=True):
        href = (a.get("href") or "").strip()
        if href.startswith("http"):
            links.append(href)
    return text, links


def _extract_instagram_from_text_and_links(text: str, links: list[str]) -> str:
    """Metin ve link listesinden Instagram profil linki veya @handle bulur."""
    seen: set[str] = set()
    # 1) instagram.com/... linkleri (href'lerden)
    for href in links:
        m = INSTAGRAM_URL_PATTERN.search(href)
        if m:
            handle = (m.group(1) or "").strip().rstrip("/")
            if handle and handle.lower() not in ("share", "p", "reel", "stories", "explore", "accounts"):
                seen.add(handle.lower())
    # 2) @handle geçen yerler (sayfa metninde)
    for m in INSTAGRAM_HANDLE_PATTERN.finditer(text):
        handle = (m.group(1) or "").strip()
        if handle and handle.lower() not in ("instagram", "com", "www"):
            seen.add(handle.lower())
    if not seen:
        return ""
    best = min(seen, key=len)
    return f"https://www.instagram.com/{best}/"


def _extract_phones(html: str) -> list[str]:
    """Sayfa metninden Türkiye mobil numaraları."""
    found: set[str] = set()
    for pat in PHONE_PATTERNS:
        for m in pat.finditer(html):
            p = _normalize_phone(m)
            if p:
                found.add(p)
    return list(found)


def _extract_emails(html: str) -> list[str]:
    """Sayfa metninden e-posta adresleri (genel mailleri atlayabiliriz)."""
    found: set[str] = set()
    for m in EMAIL_PATTERN.finditer(html):
        addr = (m.group(0) or "").strip().lower()
        if addr and "example" not in addr and "domain" not in addr:
            found.add(addr)
    return list(found)


def scrape_website(url: str) -> dict[str, Any]:
    """
    Verilen URL'yi çeker; Instagram, telefon ve e-posta çıkarır.
    Returns: {"instagram": str, "phone": str, "email": str} (bulunamayanlar "").
    """
    out: dict[str, Any] = {"instagram": "", "phone": "", "email": ""}
    html = _fetch_page(url)
    if not html:
        return out
    text, links = _get_text_and_links(html)
    out["instagram"] = _extract_instagram_from_text_and_links(text, links)
    phones = _extract_phones(text)
    if phones:
        out["phone"] = phones[0]
    emails = _extract_emails(text)
    if emails:
        out["email"] = emails[0]
    return out


def enrich_lead(lead: dict[str, Any]) -> None:
    """
    Lead sözlüğünü yerinde günceller: Website varsa sayfayı çekip
    Instagram (ve boşsa Phone/Mail) alanlarını doldurur.
    """
    url = (lead.get("Website") or "").strip()
    if not url or not url.startswith("http"):
        return
    data = scrape_website(url)
    if data.get("instagram"):
        lead["Instagram"] = data["instagram"]
    if data.get("phone") and not (lead.get("Phone") or "").strip():
        lead["Phone"] = data["phone"]
    if data.get("email") and not (lead.get("Mail") or "").strip():
        lead["Mail"] = data["email"]
    if data.get("phone") or data.get("email"):
        lead["Lead Type"] = "WhatsApp" if (lead.get("Phone") or "").strip() else ("Email" if (lead.get("Mail") or "").strip() else "Web")


def enrich_leads_from_websites(leads: list[dict[str, Any]], delay_sec: float = REQUEST_DELAY_SEC) -> None:
    """
    Listedeki her lead için Website varsa sayfadan bilgi çeker ve lead'i günceller.
    Rate limit için istekler arası delay kullanır.
    """
    for i, lead in enumerate(leads):
        url = (lead.get("Website") or "").strip()
        if not url or not url.startswith("http"):
            continue
        if i > 0:
            time.sleep(delay_sec)
        enrich_lead(lead)
