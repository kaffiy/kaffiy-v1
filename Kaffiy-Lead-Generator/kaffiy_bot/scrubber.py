import json
import os
from datetime import datetime


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LEADS_PATH = os.path.join(
    BASE_DIR,
    "..",
    "kaffiy-growth-dashboard",
    "kaffiy-growth-hub-main",
    "src",
    "data",
    "leads_data.json",
)
REJECTED_PATH = os.path.join(
    BASE_DIR,
    "..",
    "kaffiy-growth-dashboard",
    "kaffiy-growth-hub-main",
    "src",
    "data",
    "rejected_leads.json",
)

BLACKLIST = {
    "kıraathane",
    "kiraathane",
    "kahvehane",
    "oyun salonu",
    "internet kafe",
    "playstation",
    "bilardo",
    "dernek",
    "lokal",
    "kooperatif",
    "shell",
    "petrol",
    "opet",
    "total",
    "bp",
    "gaz",
    "otogaz",
    "aytemiz",
    "lukoil",
    "holding",
    "lojistik",
    "inşaat",
    "ticaret",
    "ltd",
    "şti",
    "a.ş.",
    "fabrika",
    "sanayi",
    "otomotiv",
    "emlak",
    "sigorta",
    "kargo",
    "market",
    "tekel",
    "bakkal",
    "kırtasiye",
    "eczane",
    "terzi",
    "berber",
    "kuaför",
}

CHAIN_BLACKLIST = {"starbucks", "espresso lab", "kahve dünyası"}


def classify_phone(value):
    if not value:
        return None, "Invalid"
    digits = "".join(ch for ch in str(value) if ch.isdigit())
    if digits.startswith("90"):
        digits = digits[2:]
    if digits.startswith("0"):
        digits = digits[1:]
    if len(digits) != 10:
        return None, "Invalid"
    if digits.startswith("5"):
        return f"+90{digits}", "WhatsApp"
    if digits.startswith(("850", "212", "216")):
        return f"+90{digits}", "Call Only"
    return None, "Invalid"


def is_blacklisted(name, include_chains):
    haystack = (name or "").lower()
    for word in BLACKLIST:
        if word in haystack:
            return True
    if include_chains:
        for word in CHAIN_BLACKLIST:
            if word in haystack:
                return True
    return False


def load_json(path, default):
    if not os.path.exists(path):
        return default
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def scrub(include_chains=False):
    leads = load_json(LEADS_PATH, [])
    rejected = load_json(REJECTED_PATH, [])

    total = len(leads)
    rejected_irrelevant = 0
    rejected_invalid_phone = 0
    whatsapp_count = 0
    call_only_count = 0
    kept = []

    timestamp = datetime.now().isoformat(timespec="seconds")

    for lead in leads:
        name = lead.get("Company Name") or lead.get("Company") or ""
        if is_blacklisted(name, include_chains):
            lead["rejected_reason"] = "irrelevant"
            lead["rejected_at"] = timestamp
            rejected.append(lead)
            rejected_irrelevant += 1
            continue

        phone_raw = lead.get("Phone") or lead.get("Phone Number")
        phone, lead_type = classify_phone(phone_raw)
        if not phone:
            lead["rejected_reason"] = "invalid_phone"
            lead["rejected_at"] = timestamp
            lead["Lead Type"] = "Invalid"
            rejected.append(lead)
            rejected_invalid_phone += 1
            continue

        lead["Phone"] = phone
        lead["Lead Type"] = lead_type
        if lead_type == "WhatsApp":
            whatsapp_count += 1
        elif lead_type == "Call Only":
            call_only_count += 1
        kept.append(lead)

    save_json(LEADS_PATH, kept)
    save_json(REJECTED_PATH, rejected)

    print(f"🔍 Toplam İncelenen: {total}")
    print(f"🚫 Elenen (Alakasız): {rejected_irrelevant}")
    print(f"📱 Elenen (Hatalı No): {rejected_invalid_phone}")
    print(f"💎 Dashboard'a Eklenen: {len(kept)}")
    print(f"📱 {whatsapp_count} adet cep telefonu (WhatsApp uyumlu) bulundu.")
    print(f"☎️ {call_only_count} adet sabit hat (Manuel arama için) ayrıldı.")


if __name__ == "__main__":
    scrub(include_chains=False)
