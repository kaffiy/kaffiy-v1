"""
WAHA (WhatsApp HTTP API) integration for Kaffiy bot.
Uses http://localhost:3000 by default; session 'default'.
"""
import os
import re
import logging
import requests

WAHA_BASE_URL = os.getenv("WAHA_BASE_URL", "http://localhost:3000").rstrip("/")
WAHA_API_KEY = os.getenv("WAHA_API_KEY", "")
WAHA_SESSION = os.getenv("WAHA_SESSION", "default")

logger = logging.getLogger("kaffiy_bot.waha")


def _headers():
    h = {"Content-Type": "application/json", "Accept": "application/json"}
    if WAHA_API_KEY:
        h["X-Api-Key"] = WAHA_API_KEY
    return h


def phone_to_chat_id(phone: str) -> str:
    """Convert phone to WAHA chatId: digits without +, suffix @c.us."""
    digits = re.sub(r"\D", "", str(phone))
    if digits.startswith("90"):
        digits = digits[2:]
    if digits.startswith("0"):
        digits = digits[1:]
    if len(digits) == 10 and digits.startswith("5"):
        digits = "90" + digits
    return f"{digits}@c.us"


def ensure_session() -> bool:
    """
    Ensure WAHA session 'default' exists and is WORKING.
    GET /api/sessions, then GET /api/sessions/default; if missing or not WORKING, POST /api/sessions/default/start.
    """
    try:
        r = requests.get(f"{WAHA_BASE_URL}/api/sessions", headers=_headers(), timeout=10)
        r.raise_for_status()
        sessions = r.json() if isinstance(r.json(), list) else []
        default = next((s for s in sessions if s.get("name") == WAHA_SESSION), None)
        if default and str(default.get("status", "")).upper() == "WORKING":
            return True
        # Get single session (might exist but stopped)
        r2 = requests.get(
            f"{WAHA_BASE_URL}/api/sessions/{WAHA_SESSION}",
            headers=_headers(),
            timeout=10,
        )
        if r2.status_code == 200:
            info = r2.json()
            if str(info.get("status", "")).upper() == "WORKING":
                return True
        # Start session (POST start is idempotent)
        r3 = requests.post(
            f"{WAHA_BASE_URL}/api/sessions/{WAHA_SESSION}/start",
            headers=_headers(),
            json={},
            timeout=30,
        )
        if r3.status_code in (200, 201):
            return True
        logger.warning("WAHA session start returned %s: %s", r3.status_code, r3.text)
        return False
    except requests.RequestException as e:
        logger.warning("WAHA ensure_session error: %s", e)
        return False


def send_text(chat_id: str, text: str) -> bool:
    """POST /api/sendText. chat_id must be e.g. 905xxxxxxxxx@c.us."""
    try:
        r = requests.post(
            f"{WAHA_BASE_URL}/api/sendText",
            headers=_headers(),
            json={
                "session": WAHA_SESSION,
                "chatId": chat_id,
                "text": text,
            },
            timeout=15,
        )
        r.raise_for_status()
        return True
    except requests.RequestException as e:
        logger.warning("WAHA sendText error: %s", e)
        return False


def get_messages(chat_id: str, limit: int = 50) -> list:
    """
    GET /api/messages?session=default&chatId=...&limit=...
    Returns list of message dicts with id, from, body, fromMe, timestamp, etc.
    """
    try:
        r = requests.get(
            f"{WAHA_BASE_URL}/api/messages",
            headers=_headers(),
            params={"session": WAHA_SESSION, "chatId": chat_id, "limit": limit},
            timeout=10,
        )
        r.raise_for_status()
        data = r.json()
        return data if isinstance(data, list) else []
    except requests.RequestException as e:
        logger.warning("WAHA get_messages error: %s", e)
        return []


def get_chats(limit: int = 50) -> list:
    """
    GET chat list. WAHA versions differ:
    - /api/chats?session=default
    - /api/{session}/chats
    """
    endpoints = [
        (f"{WAHA_BASE_URL}/api/chats", {"session": WAHA_SESSION, "limit": limit}),
        (f"{WAHA_BASE_URL}/api/{WAHA_SESSION}/chats", {"limit": limit}),
    ]
    for url, params in endpoints:
        try:
            r = requests.get(url, headers=_headers(), params=params, timeout=10)
            if r.status_code == 404:
                continue
            r.raise_for_status()
            data = r.json()
            return data if isinstance(data, list) else []
        except requests.RequestException as e:
            logger.warning("WAHA get_chats error: %s", e)
    return []


def is_available() -> bool:
    """Quick check: GET /api/sessions and see if default is WORKING."""
    return ensure_session()

def get_me() -> dict:
    """GET /api/{session}/me or /api/me to get bot's own info."""
    endpoints = [
        (f"{WAHA_BASE_URL}/api/{WAHA_SESSION}/me", {}),
        (f"{WAHA_BASE_URL}/api/me", {"session": WAHA_SESSION}),
        (f"{WAHA_BASE_URL}/api/sessions/{WAHA_SESSION}/me", {}),
    ]
    for url, params in endpoints:
        try:
            r = requests.get(url, headers=_headers(), params=params, timeout=10)
            if r.status_code == 200:
                return r.json()
        except Exception as e:
            logger.warning("WAHA get_me fallback error: %s", e)
    return {}

def start_typing(chat_id: str) -> bool:
    """POST /api/startTyping"""
    try:
        r = requests.post(
            f"{WAHA_BASE_URL}/api/startTyping",
            headers=_headers(),
            json={"session": WAHA_SESSION, "chatId": chat_id},
            timeout=10,
        )
        return r.status_code in [200, 201]
    except Exception:
        return False

def stop_typing(chat_id: str) -> bool:
    """POST /api/stopTyping"""
    try:
        r = requests.post(
            f"{WAHA_BASE_URL}/api/stopTyping",
            headers=_headers(),
            json={"session": WAHA_SESSION, "chatId": chat_id},
            timeout=10,
        )
        return r.status_code in [200, 201]
    except Exception:
        return False

def seen(chat_id: str) -> bool:
    """POST /api/seen (Mark as Read)"""
    try:
        r = requests.post(
            f"{WAHA_BASE_URL}/api/seen",
            headers=_headers(),
            json={"session": WAHA_SESSION, "chatId": chat_id},
            timeout=10,
        )
        return r.status_code in [200, 201]
    except Exception:
        return False


def archive_chat(chat_id: str) -> bool:
    """POST /api/archiveChat or /api/archive (Archive Chat)"""
    for endpoint in ["/api/archiveChat", "/api/archive"]:
        try:
            r = requests.post(
                f"{WAHA_BASE_URL}{endpoint}",
                headers=_headers(),
                json={"session": WAHA_SESSION, "chatId": chat_id},
                timeout=10,
            )
            if r.status_code in [200, 201]:
                return True
        except Exception:
            continue
    return False
