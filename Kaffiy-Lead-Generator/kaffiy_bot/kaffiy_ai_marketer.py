import pandas as pd
import time
import os
import re
import json
import webbrowser
import urllib.parse
import pyautogui
import pygetwindow as gw
import gspread
import random
import argparse
import logging
import sys
import tempfile
from datetime import datetime, timezone
from oauth2client.service_account import ServiceAccountCredentials
from openai import OpenAI
from dotenv import load_dotenv

# --- AYARLAR ---
load_dotenv()

import waha
from anti_ban_utils import (
    paraphrase_message,
    add_natural_jitter,
    is_business_hours,
    check_and_handle_errors
)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SHEET_NAME = "Kaffiy_Lead_DB" 
WORKSHEET_NAME = "Leads"
CREDENTIALS_FILE = "credentials.json"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.normpath(
    os.path.join(BASE_DIR, "..", "kaffiy-growth-dashboard", "src", "data")
)
DASHBOARD_DATA_PATH = os.path.join(DATA_DIR, "leads_data.json")
BRAIN_JSON_PATH = os.path.join(DATA_DIR, "marketing_brain.json")
SETTINGS_PATH = os.path.join(DATA_DIR, "settings.json")
BOT_STATUS_PATH = os.path.join(DATA_DIR, "bot_status.json")
BOT_STATS_PATH = os.path.join(DATA_DIR, "bot_stats.json")
PRESS_ENTER_PATH = os.path.join(DATA_DIR, "press_enter.json")
SENT_MESSAGES_PATH = os.path.join(DATA_DIR, "sent_messages.json")
CONVERSATIONS_PATH = os.path.join(DATA_DIR, "conversations.json")
WAHA_PROCESSED_PATH = os.path.join(DATA_DIR, "waha_processed.json")
CORRECT_EXAMPLES_PATH = os.path.join(DATA_DIR, "correct_examples.json")
WAHA_POLL_INTERVAL = 15  # Gelen mesajlar daha seyrek taranır (mesaj biriktirme için)
MAX_PROCESSED_IDS = 2000
# İki müşteri arası bekleme (saniye); WhatsApp spam olarak işaretlemesin diye (30–60 sn önerilir)
MESSAGE_DELAY_SECONDS = 60
BLACKLIST_PATH = os.path.join(DATA_DIR, "blacklist.json")
PASSIVE_LEADS_PATH = os.path.join(DATA_DIR, "passive_leads.json")
HARD_REJECT_KEYWORDS = [
    "istemiyorum", "yazma", "rahatsız etme", "sil beni", "spam", 
    "şikayet", "küfür", "engelliyorum", "yeter", "don't write", 
    "stop", "unsubscribe"
]

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
pyautogui.FAILSAFE = True
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("kaffiy_bot")
_MARKETING_BRAIN_CACHE = {"mtime": None, "data": []}
sent_statuses = ["Sent", "Interested", "Rejected", "Requested", "Accepted", "Demo", "Action Required", "Greeting_Sent", "Follow-up", "Approval Required"]
RECENT_PROCESSED_IDS = set() # Global in-memory cache to prevent race conditions

# Windows stdout encoding can be cp1252; force utf-8 so emoji/logs don't crash.
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

def _atomic_write_json(path, data, indent=2):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    try:
        with tempfile.NamedTemporaryFile("w", delete=False, encoding="utf-8") as tmp:
            json.dump(data, tmp, ensure_ascii=False, indent=indent)
            tmp_path = tmp.name
        os.replace(tmp_path, path)
    except Exception as e:
        logger.warning("JSON yazma hatası: %s", e)

def _read_json(path, default, retries=2, delay=0.2):
    if not os.path.exists(path):
        return default
    attempt = 0
    while True:
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except PermissionError:
            attempt += 1
            if attempt > retries:
                return default
            time.sleep(delay)
        except Exception as e:
            logger.warning("JSON okuma hatası: %s", e)
            return default

def _with_retry(action, retries=3, base_delay=1):
    attempt = 0
    while True:
        try:
            return action()
        except Exception as e:
            attempt += 1
            if attempt > retries:
                raise
            wait_time = base_delay * (2 ** (attempt - 1))
            logger.warning("Geçici hata: %s. %ss sonra tekrar denenecek.", e, wait_time)
            time.sleep(wait_time)

def log_ai_event(action, detail):
    """Log an AI event to bot_stats.json for the dashboard live feed."""
    stats = _read_json(BOT_STATS_PATH, {})
    if not isinstance(stats, dict):
        stats = {}
    
    # Initialize keys if missing (structure compatibility)
    stats.setdefault("ai_log", [])
    
    # Create event
    event = {
        "time": datetime.now().isoformat(),
        "action": action,
        "detail": str(detail)[:200]
    }
    
    # Append and trim (keep last 50)
    stats["ai_log"].append(event)
    if len(stats["ai_log"]) > 50:
        stats["ai_log"] = stats["ai_log"][-50:]
        
    # Refresh top-level updated_at so dashboard knows it's fresh
    stats["updated_at"] = datetime.now(timezone.utc).isoformat()
        
    _atomic_write_json(BOT_STATS_PATH, stats)

def update_bot_status(status, details=None, last_interest_alert=None):
    path = BOT_STATUS_PATH
    existing = _read_json(path, {})
    if not isinstance(existing, dict):
        existing = {}
    payload = {
        **existing,
        "status": status,
        "details": details if details is not None else existing.get("details", ""),
        "updated_at": datetime.now().isoformat(timespec="seconds"),
    }
    if last_interest_alert is not None:
        payload["last_interest_alert"] = last_interest_alert
    _atomic_write_json(path, payload)

def _countdown(seconds, prefix):
    for remaining in range(seconds, 0, -1):
        print(f"{prefix} {remaining}...")
        time.sleep(1)

def check_daily_limit(limit):
    """Check if daily autonomous message limit is reached."""
    if limit <= 0: return False # No limit
    today_str = datetime.now().strftime("%Y-%m-%d")
    sent_msgs = _read_json(SENT_MESSAGES_PATH, [])
    
    count = 0
    for m in sent_msgs:
        ts = m.get("sentAt", "")
        src = m.get("source", "")
        if ts.startswith(today_str) and "autonomous" in src:
            count += 1
            
    return count >= limit

def check_time_delay(minutes):
    """Check if enough time passed since last autonomous message."""
    if minutes <= 0: return True
    sent_msgs = _read_json(SENT_MESSAGES_PATH, [])
    if not sent_msgs: return True
    
    # Filter for autonomous only
    auto_msgs = [m for m in sent_msgs if "autonomous" in m.get("source", "")]
    if not auto_msgs: return True
    
    last_msg = auto_msgs[-1]
    last_ts_str = last_msg.get("sentAt", "")
    try:
        last_ts = datetime.fromisoformat(last_ts_str)
        diff = datetime.now() - last_ts
        return diff.total_seconds() / 60 >= minutes
    except:
        return True

def connect_google_sheets():
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds = ServiceAccountCredentials.from_json_keyfile_name(CREDENTIALS_FILE, scope)
    client_gs = gspread.authorize(creds)
    return client_gs.open(SHEET_NAME).worksheet(WORKSHEET_NAME)

def clean_phone(phone):
    if not phone: return None
    clean = re.sub(r'\D', '', str(phone))
    # German Support
    if clean.startswith('49'):
        return clean
    # TR Support
    if clean.startswith('90'): clean = clean[2:]
    if clean.startswith('0'): clean = clean[1:]
    if len(clean) == 10 and clean.startswith('5'):
        return '90' + clean
    # Fallback: if it looks like a full international number (10+ digits), return it
    if len(clean) >= 10:
        return clean
    return None

# Kaffiy Pilot Program: 4 stratejik mesaj şablonu (A, B, C, D)
# Kaffiy Pilot Program: 4 stratejik mesaj şablonu (A, B, C, D)
# Templates now stripped of greetings for 2-step sending
STRATEGIES = {
    "A": {
        "name": "The Visionary (Tech-First)",
        "description": "Tech İstanbul bünyesinde, butik kafelerin büyük zincirlerin veri gücüyle rekabet etmesini sağlayan Akıllı Ara Katman.",
        "template": "Merhabalar, kolay gelsin :) Tech İstanbul bünyesinde geliştirdiğimiz 'Akıllı Ara Katman' projesi için 10 öncü işletme seçiyoruz. Müşteri yorumlarınız harika. Sizin vizyoner bakış açınızla bu pilot programda yer alıp sistemimizi yorumlamanızı çok isteriz. Kısaca bahsedeyim mi?",
    },
    "B": {
        "name": "The Neighbor (Community & Ecosystem)",
        "description": "Yerel esnaf dayanışma ağı.",
        "template": "Merhabalar, kolay gelsin :) Ben de mahallenin bir girişimcisiyim. Tech İstanbul çatısı altında, yerel esnafın birbirine müşteri yönlendirdiği bir dayanışma ağı kuruyoruz. Komşu bir işletme olarak bu ağın ilk parçası olup fikrinizi belirtirseniz çok sevinirim. Detayları ileteyim mi?",
    },
    "C": {
        "name": "The Analyst (Data & Retention)",
        "description": "Müşteri Kurtarma odaklı.",
        "template": "Merhabalar, kolay gelsin :) [Kafe]'nin sevenleri çoktur ama ya gelmeyi bırakanlar? Sistemimiz gelmeyi bırakan müşteriyi otomatik tespit edip ona 'Seni Özledik' mesajı atıyor. Pilot programımızda 1 ay ücretsiz deneyip cironuzdaki değişimi görmek ister misiniz?",
    },
    "D": {
        "name": "The Closer (Churn Recovery)",
        "description": "Müşteri Kaybı odaklı.",
        "template": "Merhabalar, kolay gelsin :) En büyük soruna odaklandık: Müşteri Kaybı. Algoritmamız müşterinin gelme periyodunu analiz edip gelmeyeni otomatik geri çağırıyor. Global öncesi bu sistemi 1 ay ücretsiz denemek ister misiniz? 30 saniyelik demo linkini iletiyorum.",
    },
}

def _get_lead_strategy(lead):
    """Lead için strateji kodu: selected_strategy veya Active Strategy (A, B, C, D)."""
    code = str(lead.get("selected_strategy") or lead.get("Active Strategy", "A")).strip().upper()
    return code if code in STRATEGIES else "A"


def generate_ai_message(cafe_name, review, city, strategy_code="A"):
    if not client:
        return f"Selamlar {cafe_name}, Kaffiy müşteri geri kazanma ve dijital sadakat sistemini denemek ister misiniz? ☕"

    brain_examples = load_marketing_brain()
    examples_text = ""
    if brain_examples:
        examples_text = "\n".join([f"- {msg}" for msg in brain_examples[:5]])

    strategy = STRATEGIES.get(strategy_code, STRATEGIES["A"])
    strategy_name = strategy["name"]
    strategy_desc = strategy["description"]
    strategy_template = strategy["template"]

    prompt = (
        f"Sen Kaffiy'in kurucusu Oğuz'sun. {strategy_name} stratejisini kullanıyorsun ama İLİK MESAJDA SATIŞ YAPMAYACAKSIN.\n\n"
        f"Strateji Açıklaması: {strategy_desc}\n\n"
        "GÖREVİN: Sadece sohbet başlatmak. Asla ürün anlatma, sadece merak uyandırıcı bir soru sor.\n"
        "1. Önce saate bakıp 'Merhaba, Günaydın / İyi Akşamlar / Tünaydın' de.\n"
        "2. Sonra şu soruyu sor: 'Müşterileriniz için kullandığınız bir puan toplama kartınız veya sadakat sisteminiz var mıydı?'\n\n"
        "HİTAP KURALLARI:\n"
        "- Kesinlikle 'Siz' dilini kullan.\n"
        "- ASLA 'hocam', 'üstat', 'canım' gibi samimiyet dışı ifadeler kullanma.\n"
        "Talimat: Gönderilecek kafe: "
        f"'{cafe_name}' ({city}). "
        "Mesaj strictly under 2 sentences. Asla uzun yazma. Profesyonel ve vizyoner ol, emoji max 1 tane.\n"
    )
    if examples_text:
        prompt += (
            f"\nReferans Örnekler (Başarılı Mesajlar):\n{examples_text}\n"
            "Bu örneklerdeki gibi kısa ama profesyonel 'siz' diliyle yaz.\n"
        )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100, # Reduced tokens to enforce brevity
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"⚠️ OpenAI hatası: {e}")
        return f"Merhabalar {cafe_name}, iyi çalışmalar :) Müşterileriniz için kullandığınız bir puan toplama kartı veya sadakat sistemi mevcut mu?"

def export_to_dashboard(df):
    os.makedirs(os.path.dirname(DASHBOARD_DATA_PATH), exist_ok=True)
    try:
        payload = df.to_dict(orient="records")
        _atomic_write_json(DASHBOARD_DATA_PATH, payload, indent=4)
        print(f"✅ JSON güncellendi: {DASHBOARD_DATA_PATH}")
    except Exception as e:
        print(f"⚠️ JSON yazma hatası: {e}")

def load_dashboard_leads():
    data = _read_json(DASHBOARD_DATA_PATH, [])
    return data if isinstance(data, list) else []

def save_dashboard_leads(leads):
    _atomic_write_json(DASHBOARD_DATA_PATH, leads, indent=4)
    # Note: update_bot_stats_file should be called separately when needed

def update_bot_stats_file(leads):
    """Calculate stats from leads and update bot_stats.json"""
    try:
        existing_stats = _read_json(BOT_STATS_PATH, {})
        # Funnel Calculation
        total = len(leads)
        contacted = 0
        interested = 0
        converted = 0
        
        # Strategy Performance
        strategy_stats = {"A": {"sent": 0, "interested": 0}, "B": {"sent": 0, "interested": 0}, 
                          "C": {"sent": 0, "interested": 0}, "D": {"sent": 0, "interested": 0}}

        # Helper to check if any value in a list of fields matches a whitelist
        def has_status(lead, whitelist):
            for key in ["Lead Status", "Phone Status", "WhatsApp Status", "Status"]:
                val = str(lead.get(key, "")).strip().lower()
                if any(w.lower() in val for w in whitelist): # Partial match allowed for flexibility
                    return True
            return False

        contacted_wh = ["Sent", "Accepted", "Rejected", "Pending", "Interested", "Converted", "Contacted", "Action Required", "Greeting_Sent", "Follow-up"]
        interested_wh = ["Interested", "Accepted", "Demo", "Görüştü", "Olumlu", "Kurulacak"]
        converted_wh = ["Converted", "Sale", "Satış", "Tamamlandı"]

        for lead in leads:
            if has_status(lead, contacted_wh):
                contacted += 1
            if has_status(lead, interested_wh):
                interested += 1
            if has_status(lead, converted_wh):
                converted += 1
                
            strat = str(lead.get("Active Strategy", "A")).strip().upper()
            if strat in strategy_stats:
                # Useเฉพาะ Phone/WA status for strategy performance to avoid double-counting high-level overrides
                p_wa_status = [str(lead.get(k, "")).strip().lower() for k in ["Phone Status", "WhatsApp Status"]]
                if any(any(w.lower() in s for w in contacted_wh) for s in p_wa_status):
                    strategy_stats[strat]["sent"] += 1
                    if any(any(w.lower() in s for w in interested_wh) for s in p_wa_status):
                        strategy_stats[strat]["interested"] += 1

        # AI Learning Insights
        insights = []
        pending_approvals = [] # NEW: For Manual Approval Tab
        for l in leads:
            if not isinstance(l, dict): continue
            p_s = str(l.get("Phone Status", ""))
            w_s = str(l.get("WhatsApp Status", ""))
            if p_s in ["Approval Required", "Action Required"] or w_s in ["Approval Required", "Action Required"]:
                # Get the last incoming message the bot is replying to
                incoming = l.get("Last_Incoming_Body") or l.get("Last_Message") or "Mesaj bulunamadı."
                
                pending_approvals.append({
                    "id": l.get("ID"),
                    "company": l.get("Company Name"),
                    "message": l.get("Suggested_Response") or l.get("Ready Message") or "Mesaj hazırlanamadı.",
                    "type": "İlk Mesaj" if p_s == "Approval Required" else "Yanıt",
                    "phone": l.get("Phone"),
                    "last_incoming": incoming
                })

        # Calculate conversion rate per strategy
        strat_performance = []
        for s_code, s_vals in strategy_stats.items():
            rate = (s_vals["interested"] / max(1, s_vals["sent"])) * 100
            strat_performance.append((s_code, rate, s_vals["sent"]))
        
        best_strat = max(strat_performance, key=lambda x: x[1])
        if best_strat[2] > 0:
            insights.append({
                "title": "🏆 En İyi Strateji",
                "insight": f"Strateji {best_strat[0]}, %{best_strat[1]:.1f} ilgi oranıyla en verimli yaklaşım."
            })
        else:
            insights.append({
                "title": "📊 Veri Toplanıyor",
                "insight": "Henüz yeterli strateji verisi oluşmadı."
            })
            
        if contacted > 0:
            rate = (interested / contacted) * 100
            insights.append({
                "title": "🎯 İlgi Oranı",
                "insight": f"Ulaşılan {contacted} işletmeden {interested} tanesi (%{rate:.1f}) olumlu dönüş yaptı."
            })

        # Calculate Queue / Next Schedule
        next_schedule = {"target": "Yok", "eta": "Beklemede"}
        
        try:
            settings = load_settings()
            if settings.get("autonomous_mode", False):
                # 1. Calculate Time
                sent_msgs = _read_json(SENT_MESSAGES_PATH, [])
                last_time = 0
                if sent_msgs and isinstance(sent_msgs, list):
                    last_entry = sent_msgs[-1]
                    if "sentAt" in last_entry:
                        try:
                            last_time = datetime.fromisoformat(last_entry["sentAt"]).timestamp()
                        except: pass
                
                delay_min = settings.get("message_delay_minutes", 30)
                next_run_ts = last_time + (delay_min * 60)
                remaining_sec = next_run_ts - time.time()
                
                # 2. Find Next Target
                next_lead_name = "Yok"
                for l in leads:
                    # Logic mirrors the main loop filter
                    if str(l.get("Phone Status", "")).strip() in ["Sent", "Requested", "Send Requested"]:
                         continue
                    if str(l.get("Lead Type", "")).strip() != "WhatsApp":
                        continue
                    if _is_existing_customer(l):
                        continue
                    # Found candidate
                    next_lead_name = l.get("Company Name", "Bilinmiyor")
                    break
                
                if next_lead_name != "Yok":
                    if remaining_sec > 0:
                        eta_time = datetime.fromtimestamp(next_run_ts).strftime("%H:%M")
                        next_schedule = {
                            "target": next_lead_name, 
                            "eta": f"Bugün {eta_time} (Kalan: {int(remaining_sec/60)} dk)",
                            "status": "Bekliyor"
                        }
                    else:
                        next_schedule = {
                            "target": next_lead_name,
                            "eta": "Şimdi (İşleniyor...)",
                            "status": "Aktif"
                        }
        except Exception as queue_e:
            print(f"Queue calc error: {queue_e}")

        new_stats = {
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "bot_status": existing_stats.get("bot_status", "idle"),
            "queue": next_schedule, # NEW FIELD
            "funnel": {
                "total_leads": total,
                "contacted": contacted,
                "interested": interested,
                "converted": converted
            },
            "ai_log": existing_stats.get("ai_log", []),
            "last_conversations": existing_stats.get("last_conversations", []),
            "ai_learning": insights,
            "pending_approvals": pending_approvals, # NEW FIELD
            "learned_behaviors": _read_json(CORRECT_EXAMPLES_PATH, [])
        }
        
        _atomic_write_json(BOT_STATS_PATH, new_stats, indent=2)
    except Exception as e:
        print(f"Stats update error: {e}")

def _phone_digits(s):
    return re.sub(r"\D", "", str(s or ""))

def _append_sent_message(cafe_name, phone, message, source="bot"):
    """Gönderilen mesajı kesinlikle kaydet (ilk mesaj veya follow-up)."""
    existing = _read_json(SENT_MESSAGES_PATH, [])
    if not isinstance(existing, list):
        existing = []
    phone_d = _phone_digits(phone)
    is_follow_up = any(_phone_digits(e.get("phone")) == phone_d for e in existing)
    entry = {
        "companyName": cafe_name or "",
        "phone": phone or "",
        "message": message or "",
        "sentAt": datetime.now().isoformat(),
        "source": source,
        "type": "follow_up" if is_follow_up else "initial",
    }
    existing.append(entry)
    _atomic_write_json(SENT_MESSAGES_PATH, existing, indent=2)

def log_conversation_message(chat_id, sender, text, phone=None):
    """Log message to deep memory (conversations.json). Returns message count."""
    convs = _read_json(CONVERSATIONS_PATH, {})
    if not isinstance(convs, dict):
        convs = {}
    
    if chat_id not in convs or not isinstance(convs[chat_id], dict):
        convs[chat_id] = {"phone": phone, "history": []}
    
    entry = {
        "timestamp": datetime.now().isoformat(),
        "sender": sender,
        "text": text
    }
    convs[chat_id]["history"].append(entry)
    
    # Keep last 100 per user
    if len(convs[chat_id]["history"]) > 100:
        convs[chat_id]["history"] = convs[chat_id]["history"][-100:]
        
    _atomic_write_json(CONVERSATIONS_PATH, convs)
    
    # Return message count (for strategic analysis trigger)
    return len(convs[chat_id]["history"])

def analyze_customer_sentiment(message_text):
    """
    Analyze customer message sentiment and return WhatsApp Status.
    Returns: 'Accepted', 'Rejected', or 'Pending'
    """
    if not message_text:
        return "Pending"
    
    msg_lower = message_text.lower().strip()
    
    # AGGRESSIVE - Tepkili/Sert cevaplar
    aggressive_keywords = [
        "kes", "rahatsız etme", "sapık mı", "dolandırıcı", "saçma",
        "alakası yok", "ne alaka", "birden fazla mesaj", "spam", "şikayet",
        "polise", "savcılığa", "avukat", "lan", "be", "haddini bil"
    ]
    
    for kw in aggressive_keywords:
        if kw in msg_lower:
            return "Aggressive"

    # REJECTED - Olumsuz cevaplar
    rejected_keywords = [
        "düşünmüyorum", "düşünmüyoruz", "ilgilenmiyorum", "ilgilenmiyoruz",
        "hayır", "istemiyorum", "istemiyoruz", "vaktim yok", "zamanım yok",
        "gerek yok", "ihtiyacım yok", "teşekkürler", "teşekkür ederim",
        "sağol", "sağolun", "iyi akşamlar", "iyi günler", "hoşçakal",
        "rahatsız etmeyin", "aramayın", "yazmayın", "siliyorum"
    ]
    
    for keyword in rejected_keywords:
        if keyword in msg_lower:
            return "Rejected"
    
    # ACCEPTED - Olumlu/İlgili cevaplar
    accepted_keywords = [
        "evet", "olur", "tamam", "anlatın", "anlat", "dinleyelim", "dinliyorum",
        "ilginç", "güzel", "iyi", "iyiymiş", "hoş", "merak ettim", "nasıl",
        "detay", "bilgi", "fiyat", "ücret", "demo", "görüşelim", "konuşalım",
        "toplantı", "randevu", "ne zaman", "buluşalım", "gelin"
    ]
    
    for keyword in accepted_keywords:
        if keyword in msg_lower:
            return "Accepted"
    
    # PENDING - Belirsiz/Kararsız cevaplar (default)
    return "Pending"


def load_marketing_brain():
    if not os.path.exists(BRAIN_JSON_PATH):
        return []
    try:
        mtime = os.path.getmtime(BRAIN_JSON_PATH)
    except OSError:
        return []
    if _MARKETING_BRAIN_CACHE["mtime"] == mtime:
        return _MARKETING_BRAIN_CACHE["data"]
    data = _read_json(BRAIN_JSON_PATH, [])
    if isinstance(data, list):
        _MARKETING_BRAIN_CACHE["mtime"] = mtime
        _MARKETING_BRAIN_CACHE["data"] = data
        return data
    return []

def save_marketing_brain(messages):
    _atomic_write_json(BRAIN_JSON_PATH, messages, indent=2)

def load_settings():
    data = _read_json(SETTINGS_PATH, {"is_bot_running": False, "autonomous_mode": False, "test_mode": False, "test_phone": "", "daily_limit": 5, "message_delay_minutes": 30})
    if not isinstance(data, dict):
        data = {"is_bot_running": False, "autonomous_mode": False, "test_mode": False, "test_phone": "", "daily_limit": 5, "message_delay_minutes": 30}
    return data

def ensure_marketing_brain_seed():
    if os.path.exists(BRAIN_JSON_PATH):
        try:
            with open(BRAIN_JSON_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, list) and len(data) > 0:
                return len(data)
        except Exception:
            pass
    seed = [
        "Selam! [Cafe Name] ekibinin kahvelerine bayılıyorum, özellikle White Mocha favorim! Kaffiy olarak yerel kafelerin sadık müşteri kitlesini %30 artıracak bir büyüme aracı geliştirdik. Müsait olduğunuzda kısaca bahsedebilir miyim?"
    ]
    save_marketing_brain(seed)
    return len(seed)

def update_marketing_brain_from_leads(leads):
    brain = load_marketing_brain()
    existing = set([msg.strip() for msg in brain if isinstance(msg, str)])
    updated = False
    for lead in leads:
        if str(lead.get('WhatsApp Status', '')).strip() != 'Accepted':
            continue
        message = str(lead.get('Ready Message', '') or lead.get('AI Message', '')).strip()
        if message and message not in existing:
            brain.append(message)
            existing.add(message)
            updated = True
    if updated:
        save_marketing_brain(brain)

def export_all_leads_from_sheets():
    try:
        sheet = _with_retry(connect_google_sheets, retries=2)
        all_values = _with_retry(sheet.get_all_values, retries=2)
        if not all_values:
            print("⚠️ Sheets verisi boş.")
            return
        headers = [str(c).strip() for c in all_values[0]]
        rows = []
        for row in all_values[1:]:
            row_dict = {}
            for idx, header in enumerate(headers):
                row_dict[header] = row[idx] if idx < len(row) else ""
            rows.append(row_dict)
        save_dashboard_leads(rows)
        print("✅ Google Sheets verileri Dashboard JSON'a yazıldı.")
    except Exception as e:
        print(f"❌ Sheets çekme hatası: {e}")

def _find_sheet_row_index(df, lead):
    if "ID" not in df.columns:
        return None
    lead_id = str(lead.get('ID', '')).strip()
    if lead_id:
        matches = df[df['ID'].astype(str) == lead_id]
        if not matches.empty:
            return matches.index[0]
    if "Company Name" not in df.columns or "Phone" not in df.columns:
        return None
    company_name = str(lead.get('Company Name', '')).strip()
    phone = str(lead.get('Phone', '')).strip()
    if company_name or phone:
        matches = df[
            (df['Company Name'].astype(str) == company_name) &
            (df['Phone'].astype(str) == phone)
        ]
        if not matches.empty:
            return matches.index[0]
    return None


def delete_lead_from_sheets(lead_dict):
    """Remove one lead row from Google Sheets by ID or Company Name + Phone. Returns True if deleted."""
    try:
        sheet = _with_retry(connect_google_sheets, retries=2)
        all_values = _with_retry(sheet.get_all_values, retries=2)
        if not all_values:
            return False
        headers = [str(c).strip() for c in all_values[0]]
        df = pd.DataFrame(all_values[1:], columns=headers)
        row_index = _find_sheet_row_index(df, lead_dict)
        if row_index is None:
            return False
        # gspread row numbers are 1-based; row 1 = header, first data = row 2
        sheet.delete_rows(row_index + 2)
        return True
    except Exception as e:
        logger.warning("Sheets delete error: %s", e)
        return False

def _lead_key(lead):
    lead_id = str(lead.get('ID', '')).strip()
    if lead_id:
        return f"id:{lead_id}"
    company_name = str(lead.get('Company Name', '')).strip()
    phone = str(lead.get('Phone', '')).strip()
    return f"name:{company_name}|phone:{phone}"

def _lead_key_from_row(row):
    lead_id = str(row.get('ID', '')).strip()
    if lead_id:
        return f"id:{lead_id}"
    company_name = str(row.get('Company Name', '')).strip()
    phone = str(row.get('Phone', '')).strip()
    return f"name:{company_name}|phone:{phone}"

def _get_status_field(lead):
    for key in ("Status", "Lead Status", "Phone Status"):
        if key in lead:
            return key
    return "Lead Status"

def _get_status_value(lead):
    for key in ("Status", "Lead Status", "Phone Status"):
        value = str(lead.get(key, "")).strip()
        if value:
            return key, value
    return _get_status_field(lead), ""


def _is_existing_customer(lead: dict) -> bool:
    """Eski müşteri / daha önce mesaj atılmış lead mi?"""
    old_statuses = {
        "Sent",
        "Accepted",
        "Rejected",
        "Interested",
        "Converted",
        "Pending",
        "Demo Scheduled",
        "Number Not Found",
        "Not Interested",
        "Contacted",
    }
    for key in ("Phone Status", "WhatsApp Status", "Lead Status", "Status"):
        value = str(lead.get(key, "")).strip()
        if value in old_statuses:
            return True
    # Ek göstergeler
    if lead.get("Last_Action") in ("Automated_Sent", "Automated_Error"):
        return True
    if lead.get("sent_strategy"):
        return True
    return False


def _message_id(m: dict, chat_id: str) -> str:
    """Her mesaj için benzersiz ID; WAHA bazen id dönmüyor, aynı sohbette 2. mesaj atlanmasın diye fallback."""
    mid = m.get("id") or m.get("messageId")
    if isinstance(mid, str) and mid.strip():
        return mid.strip()
    if mid is not None and str(mid).strip():
        return str(mid).strip()
    ts = m.get("timestamp") or 0
    body = (m.get("body") or m.get("content") or m.get("text") or "")[:80]
    return f"{chat_id}|{ts}|{body}"


def _load_processed_message_ids():
    global RECENT_PROCESSED_IDS
    data = _read_json(WAHA_PROCESSED_PATH, {"processed_ids": []})
    ids = data.get("processed_ids") or []
    if not isinstance(ids, list): ids = []
    # Merge with in-memory to be safe
    for i in ids: RECENT_PROCESSED_IDS.add(i)
    return list(RECENT_PROCESSED_IDS)


def _save_processed_message_id(msg_id):
    global RECENT_PROCESSED_IDS
    if msg_id in RECENT_PROCESSED_IDS:
        return
    RECENT_PROCESSED_IDS.add(msg_id)
    # Persist to disk
    ids = list(RECENT_PROCESSED_IDS)
    if len(ids) > MAX_PROCESSED_IDS:
        ids = ids[-MAX_PROCESSED_IDS:]
        RECENT_PROCESSED_IDS = set(ids)
    _atomic_write_json(WAHA_PROCESSED_PATH, {"processed_ids": ids})



import kaffiy_ai

# Re-using previous helpers...

def _lead_by_chat_id(leads: list, chat_id: str):
    """Find lead whose Phone or LID matches chat_id."""
    for lead in leads:
        # 1. Check LID field (Specific mapping)
        if lead.get("LID") == chat_id:
            logger.info(f"🎯 Match found via LID mapping: {chat_id} -> {lead.get('Company Name')}")
            return lead
            
        # 2. Check Phone field (Normal @c.us match)
        ph = clean_phone(lead.get("Phone", ""))
        if not ph:
            continue
        cid = waha.phone_to_chat_id(ph)
        if cid == chat_id:
            return lead
    return None

def _get_chat_history_text(chat_id):
    if not waha.is_available():
        return ""
    try:
        previous_msgs = waha.get_messages(chat_id, limit=10)
        previous_msgs.sort(key=lambda x: x.get("timestamp", 0))
        history_lines = []
        for m in previous_msgs:
            sender = "Biz" if m.get("fromMe") else "Müşteri"
            body = (m.get("body") or "").strip()
            if body:
                history_lines.append(f"{sender}: {body}")
        return "\n".join(history_lines)
    except Exception as e:
        logger.warning("History fetch error: %s", e)
        return ""

def _poll_waha_incoming(dashboard_leads: list, reply_enabled: bool, security_lock_enabled: bool, extra_phones: list | None = None, sheet=None, headers=None, df=None):
    """Poll WAHA for new messages; analyze interest, set Suggested_Response, optionally auto-reply."""
    if not waha.is_available():
        return False
        
    updated = False
    current_time = time.time()
    
    # Get own ID
    me_info = waha.get_me()
    raw_id = me_info.get("id")
    my_id = raw_id.get("_serialized") if isinstance(raw_id, dict) else raw_id
    
    # 1. Listen to ALL chats
    try:
        active_chats = waha.get_chats(limit=50)
    except Exception as e:
        logger.error("WAHA get_chats error: %s", e)
        return False
        
    chat_ids = set()
    # A. Top 40 active chats
    for chat in active_chats[:40]:
        cid = chat.get("id", {}).get("_serialized") or chat.get("id")
        if cid: chat_ids.add(cid)
        
    # B. Explicitly add IDs for whitelisted phones to ensure they ALWAYS get replies
    for p in kaffiy_ai.WHITELIST_PHONES:
        ph = clean_phone(p)
        if ph: chat_ids.add(waha.phone_to_chat_id(ph))
            
    # C. Extra phones
    if extra_phones:
        for p in extra_phones:
            ph = clean_phone(p)
            if ph: chat_ids.add(waha.phone_to_chat_id(ph))

    processed_ids = set(_load_processed_message_ids())
    logger.info("🕵️ Polling %s chats.", len(chat_ids))
    
    poll_start = time.time()
    for chat_id in chat_ids:
        # Prevent long hanging
        if time.time() - poll_start > 12.0:
            logger.warning("🕒 Polling timeout (>12s), skipping rest.")
            break
            
        try:
            messages = waha.get_messages(chat_id, limit=20)
        except:
            messages = []
            
        unhandled_messages = []
        for m in messages:
            msg_id = _message_id(m, chat_id)
            if msg_id in processed_ids:
                continue
            
            from_me = m.get("fromMe", False)
            if from_me:
                _save_processed_message_id(msg_id)
                continue
                
            body = (m.get("body") or m.get("content", "")).strip()
            if not body:
                _save_processed_message_id(msg_id)
                continue
            
            unhandled_messages.append(m)

        if not unhandled_messages:
            continue

        # --- BURST LOGIC: Wait for more messages if user is typing a sequence ---
        logger.info("⏳ New message detected for %s. Waiting 60s to group sequence...", chat_id)
        
        settings = load_settings()
        delay = float(settings.get("message_delay_min", 0.16)) * 60 # Default to 10s if not set
        if delay < 5: delay = 5 # Minimum 5s safety

        time.sleep(10) # Initial wait for burst detection
        
        # Poll again to get the full burst
        try:
            burst_messages = waha.get_messages(chat_id, limit=30)
            unhandled_messages = []
            for m in burst_messages:
                m_id = _message_id(m, chat_id)
                if m_id in processed_ids: continue
                if m.get("fromMe", False): 
                    _save_processed_message_id(m_id)
                    continue
                m_body = (m.get("body") or m.get("content", "")).strip()
                if not m_body: 
                    _save_processed_message_id(m_id)
                    continue
                unhandled_messages.append(m)
        except:
            pass

        if not unhandled_messages:
            continue

        if not unhandled_messages:
            continue

        # Mark all as processed
        for m in unhandled_messages:
            _save_processed_message_id(_message_id(m, chat_id))

        latest_m = unhandled_messages[-1]
        # Combine bodies for analysis (handle burst messages)
        body = "\n".join([(m.get("body") or m.get("content", "")).strip() for m in unhandled_messages])
        sender_id = latest_m.get("participant") or chat_id if "@g.us" in chat_id else chat_id
        
        # HOUSEKEEPING: Blacklist check
        blacklist = set(_read_json(BLACKLIST_PATH, []))
        sender_phone = sender_id.replace("@c.us","").replace("@lid","")
        if sender_phone in blacklist:
            logger.info(f"🚫 Blacklist check: {sender_phone} engellenmiş, mesaj yoksayılıyor.")
            continue

        # Group Mention Check
        if "@g.us" in chat_id:
            mentions = latest_m.get("mentionedIds") or []
            is_mentioned = False
            
            # 1. Direct Mention
            if my_id and my_id in mentions:
                is_mentioned = True
            
            # 2. Quote Check (Replying to bot)
            if not is_mentioned and my_id:
                 quoted_part = latest_m.get("_data", {}).get("quotedParticipant") or latest_m.get("quotedParticipant")
                 # Handle dict format from WAHA _data
                 quoted_id = quoted_part.get("_serialized") if isinstance(quoted_part, dict) else quoted_part
                 
                 # Check both self IDs: standard and LID format
                 my_lid = "118644847689957@lid" # Detected from group chat logs
                 if quoted_id and (quoted_id == my_id or quoted_id == my_lid):
                     is_mentioned = True

            # 3. Contextual fallback (Keywords)
            if not is_mentioned:
                body_lower = body.lower()
                # Expanded keywords
                keywords = ["kaffiy", "@kaffiy", "bot", "@bot", "asistan", "oğuz", "oguz"]
                if any(k in body_lower for k in keywords):
                    is_mentioned = True

            # 4. Aggressive Fallback: Any message starting with @ (Ignore mentions list check)
            # This ensures we catch @Bot even if WAHA returns empty mentionedIds
            if not is_mentioned and body.strip().startswith("@"):
                 is_mentioned = True
            
            if not is_mentioned:
                continue # Skip group msgs if not mentioned
            
            log_ai_event("🏷️ Etiketlendi", f"Grupta etiketlendi: {chat_id[:10]}")

        # Log all to history
        for m in unhandled_messages:
            m_body = (m.get("body") or m.get("content", "")).strip()
            msg_count = log_conversation_message(chat_id, "customer", m_body, phone=chat_id.replace("@c.us",""))
            log_ai_event("📩 Yeni Mesaj", f"{sender_id}: {m_body[:50]}")

        # Find Lead
        lead = _lead_by_chat_id(dashboard_leads, chat_id)
        if lead:
            # QUEUE FOR THINKING (5 MIN DELAY)
            lead["Pending_Reply_Since"] = time.time()
            lead["Last_Incoming_Body"] = body
            logger.info(f"🤔 {lead.get('Company Name')} yanıt için sıraya alındı (Thinking Mode).")
            updated = True
        else:
            # DUPLICATE CHECK: Check if lead with same phone already exists
            phone_clean = sender_id.replace("@c.us","").replace("@lid","")
            existing_lead = None
            for l in dashboard_leads:
                l_phone = str(l.get("Phone", "")).replace("@c.us","").replace("@lid","")
                if l_phone == phone_clean:
                    existing_lead = l
                    break
            
            if existing_lead:
                # Update existing lead instead of creating duplicate
                existing_lead["Pending_Reply_Since"] = time.time()
                existing_lead["Last_Incoming_Body"] = body
                if not existing_lead.get("LID"):
                    existing_lead["LID"] = chat_id  # Update LID if missing
                logger.info(f"🔄 Mevcut lead güncellendi: {existing_lead.get('Company Name')}. Düşünme modu aktif.")
                updated = True
            else:
                # Create a GUEST entry for unknown/group interactions so they show up in dashboard
                new_id = f"G-{int(time.time())}"
                lead_name = "Misafir"
                if "@g.us" in chat_id:
                    lead_name = f"Grup ({chat_id[:8]})"
                    
                new_lead = {
                    "ID": new_id,
                    "Company Name": lead_name,
                    "Phone": sender_id.replace("@c.us",""),
                    "LID": chat_id,
                    "Phone Status": "New",
                    "WhatsApp Status": "Pending",
                    "Lead Type": "WhatsApp",
                    "Pending_Reply_Since": time.time(),
                    "Last_Incoming_Body": body,
                    "Is_Guest": True
                }
                dashboard_leads.append(new_lead)
                logger.info(f"🆕 Yeni Misafir kaydı oluşturuldu: {lead_name}. Düşünme modu aktif.")
                updated = True
            
    return updated

def _process_pending_replies(dashboard_leads: list, client, is_test_mode=False):
    """Check leads for expired thinking timers and send AI replies."""
    updated = False
    now = time.time()
    for lead in dashboard_leads:
        since = lead.get("Pending_Reply_Since")
        if not since:
            continue
            
        elapsed = now - since
        settings = load_settings()
        delay = float(settings.get("message_delay_min", 0.2)) * 60 # Default to 12s if not set
        if delay < 5: delay = 5 # Minimum 5s safety

        elapsed = now - since
        if elapsed < delay:
            # Still thinking...
            continue
            
        # TIMER EXPIRED! Generate and send reply.
        chat_id = lead.get("LID") or waha.phone_to_chat_id(clean_phone(lead.get("Phone")))
        if not chat_id:
            del lead["Pending_Reply_Since"]
            continue
            
        settings = load_settings()
        manual_approval = settings.get("manual_approval", False)
        
        body = lead.get("Last_Incoming_Body", "")
        cafe_name = lead.get("Company Name", "İşletme")
        history_text = _get_chat_history_text(chat_id)
        
        # Double check triple spam using local history (more reliable than WAHA)
        local_history = []
        convs = _read_json(CONVERSATIONS_PATH, {})
        if chat_id in convs:
            for m in convs[chat_id].get("history", []):
                s = "Biz" if m.get("sender") == "bot" else "Müşteri"
                local_history.append(f"{s}: {m.get('text','')}")
        
        bot_consecutive = 0
        for line in reversed(local_history):
            if line.strip().startswith("Biz:"): bot_consecutive += 1
            elif line.strip().startswith("Müşteri:"): break
        
        if bot_consecutive >= 3:
            logger.warning(f"🛑 Triple-spam prevention triggered for {chat_id}. Local history shows {bot_consecutive} bot messages.")
            del lead["Pending_Reply_Since"]
            continue

        # Analyze Criticality
        critical_keywords = ["fiyat", "ücret", "ne kadar", "pahalı", "randevu", "demo", "bildirim"]
        is_critical = any(kw in body.lower() for kw in critical_keywords)
        
        suggested = None
        if is_critical:
            logger.warning(f"🚨 KRİTİK MESAJ ONAYI BEKLENİYOR: {cafe_name}")
            lead["WhatsApp Status"] = "Action Required"
            lead["Suggested_Response"] = kaffiy_ai.generate_suggested_response(lead, body, client=client, chat_history_text=history_text)
            suggested = None # Don't auto-send critical ones
        else:
            suggested = kaffiy_ai.generate_suggested_response(lead, body, client=client, chat_history_text=history_text)
            lead["Suggested_Response"] = suggested

        # Interest Analysis
        auto_status = analyze_customer_sentiment(body)
        interest_changed = False
        
        # IF MANUAL APPROVAL IS ON, WE STOP HERE
        if manual_approval:
            logger.info(f"🛡️ Safety Mode: Reply for {cafe_name} queued for approval.")
            lead["WhatsApp Status"] = "Approval Required"
            if "Pending_Reply_Since" in lead: del lead["Pending_Reply_Since"]
            # Keep Last_Incoming_Body for dashboard display
            updated = True
            continue

        if auto_status == "Aggressive":
             suggested = "Kusura bakmayın, vaktinizi aldım. Olumsuz bir deneyim yaşatmak istemezdim, iyi çalışmalar dilerim."
             lead["WhatsApp Status"] = "Rejected"
             interest_changed = True
        elif kaffiy_ai.analyze_interest(body) == "Positive":
             if lead.get("Phone Status") != "Interested":
                 lead["Phone Status"] = "Interested"
                 interest_changed = True
                 update_bot_status("interested", f"{cafe_name} ilgileniyor.")
        
        # Email Request Detection
        email_keywords = ["mail", "e-posta", "eposta", "email", "mail gönder", "mail at", "mail ile"]
        body_lower = body.lower()
        if any(keyword in body_lower for keyword in email_keywords):
            lead["Email_Requested"] = True
            lead["WhatsApp Status"] = "Email Requested"
            logger.info(f"📧 {cafe_name} mail ile bilgi talep etti.")
            log_ai_event("📧 Mail Talebi", f"{cafe_name} e-posta ile bilgi istedi.")
            interest_changed = True
        
        if lead.get("WhatsApp Status") != auto_status and auto_status != "Aggressive":
            # Don't overwrite Email Requested status
            if not lead.get("Email_Requested"):
                lead["WhatsApp Status"] = auto_status
                interest_changed = True

        if suggested:
            # --- CONCURRENCY LOCK ---
            lock_name = f"reply_{chat_id.replace('@','_')}"
            lock_file = os.path.join(DATA_DIR, "locks", f"{lock_name}.lock")
            os.makedirs(os.path.dirname(lock_file), exist_ok=True)
            
            if os.path.exists(lock_file) and (time.time() - os.path.getmtime(lock_file) < 60):
                logger.warning(f"🔒 Lock active for {chat_id}, skipping duplicate reply attempt.")
                del lead["Pending_Reply_Since"]
                continue
                
            try:
                with open(lock_file, "w") as f: f.write(str(os.getpid()))
                
                logger.info(f"📤 Sending scheduled reply to {cafe_name} after 5 min thinking.")
                add_natural_jitter()
                waha.seen(chat_id)
                varied_reply = paraphrase_message(suggested, client)
                if is_test_mode:
                    varied_reply = f"🧪 BU BİR TEST MESAJIDIR:\n{varied_reply}"
                waha.start_typing(chat_id)
                time.sleep(random.randint(5, 10))
                success = waha.send_text(chat_id, varied_reply)
                waha.stop_typing(chat_id)
                if success:
                    log_ai_event("💬 Yanıt Gönderildi (Süreli)", f"{cafe_name}: {varied_reply[:50]}")
                    log_conversation_message(chat_id, "bot", varied_reply)
            finally:
                try: os.remove(lock_file)
                except: pass
        
        # Cleanup
        if "Pending_Reply_Since" in lead: del lead["Pending_Reply_Since"]
        if "Last_Incoming_Body" in lead: del lead["Last_Incoming_Body"]
        updated = True
        
    return updated

def _process_autonomous_mode(dashboard_leads, outbound_enabled_arg, security_lock_enabled, is_test_mode=False):
    """Otonom mod: 'Reach Customers' açıksa yeni leadlere yaz."""
    if not outbound_enabled_arg:
        return False
        
    # 4. AKILLI MESAİ SAATLERİ (10:00-12:00 ve 15:00-20:00)
    if not is_business_hours():
        update_bot_status("idle", "Mesai saatleri bekleniyor (10-12, 15-20:00)")
        logger.info("⏰ Mesai saatleri dışında (10-12 veya 15-20 arası değil). Gönderim durduruldu.")
        return False

    # LOAD LIMITS
    settings = load_settings()
    daily_limit = settings.get("daily_limit", 5)
    delay_min = settings.get("message_delay_minutes", 30)
    json_updated = False
    
    for lead in dashboard_leads:
        # Check limits inside the loop to prevent mass-sending in one burst
        if check_daily_limit(daily_limit):
            logger.info("🛑 Daily limit reached. Stopping autonomous mode.")
            break
            
        if not check_time_delay(delay_min):
            # Not enough time passed yet, skip this run
            break

        status_field, status = _get_status_value(lead)
        if status in sent_statuses:
            continue
        
        if str(lead.get("Lead Type", "")).strip() != "WhatsApp":
            continue
            
        if _is_existing_customer(lead):
            continue

        cafe_name = lead.get("Company Name", "İşletme")
        phone = lead.get("Phone", "")
        if not kaffiy_ai.check_security_lock(phone, security_lock_enabled):
            continue

        # 2. RASTGELE "DÜŞÜNME" SÜRESİ (Natural Jitter: 5-15s)
        add_natural_jitter()

        print(f"🔍 Otonom Sıra: {cafe_name}")
        
        # Generate message if needed
        ready_message = lead.get("Ready Message", "")
        if not ready_message:
             ready_message = kaffiy_ai.generate_intro_message(lead, strategy="A")
             lead["Ready Message"] = ready_message

        # Safety Mode Check
        if settings.get("manual_approval", False):
            logger.info(f"🛡️ Safety Mode: Initial greeting for {cafe_name} queued for approval.")
            lead["Phone Status"] = "Approval Required"
            json_updated = True
            continue

        # Send via WAHA (Human-like 2-step)
        phone_clean = clean_phone(phone)
        chat_id = waha.phone_to_chat_id(phone_clean)
        
        # 3. YAZIYOR... VE OKUNDU SİMÜLASYONU
        waha.seen(chat_id) # Mark as Read
        
        # 1. DİNAMİK MESAJ VARYASYONU (AI Paraphrasing)
        greeting = "Selamlar hocam müsait misiniz"
        greeting = paraphrase_message(greeting, client)
        if is_test_mode:
            greeting = f"🧪 BU BİR TEST MESAJIDIR:\n{greeting}"
        
        print(f"🤖 Human-like Greeting: {cafe_name}...")
        
        # Typing for greeting (3-8 seconds)
        waha.start_typing(chat_id)
        typing_sec = random.randint(3, 8)
        time.sleep(typing_sec) 
        waha.stop_typing(chat_id)
        
        success = waha.send_text(chat_id, greeting)
        
        # 5. OTOMATİK DURAKLATMA (Safety Pause)
        if not check_and_handle_errors(success):
            break # Safety pause triggered, stop the loop

        if success:
             lead["Phone Status"] = "Sent"
             lead["WhatsApp Status"] = "Pending"
             lead["Last_Action"] = "Greeting_Sent"
             lead["Ready Message"] = ready_message
             
             update_bot_status("sent", f"{cafe_name} selam verildi.")
             _append_sent_message(cafe_name, phone, greeting, source="autonomous_greeting")
             log_conversation_message(chat_id, "bot", greeting)
             log_ai_event("📤 Selam Verildi", f"{cafe_name} ({phone})")
             print(f"✅ Selam Gönderildi: {cafe_name}")
             json_updated = True
             
             # Update Google Sheets immediately
             try:
                 sheet = _with_retry(connect_google_sheets, retries=2)
                 all_values = _with_retry(sheet.get_all_values, retries=2)
                 if all_values:
                     headers = [str(c).strip() for c in all_values[0]]
                     df = pd.DataFrame(all_values[1:], columns=headers)
                     row_index = _find_sheet_row_index(df, lead)
                     if row_index is not None and "Phone Status" in headers:
                         _with_retry(
                             lambda: sheet.update_cell(
                                 row_index + 2,
                                 headers.index("Phone Status") + 1,
                                 "Sent",
                             ),
                             retries=2,
                         )
                         if "WhatsApp Status" in headers:
                             _with_retry(
                                 lambda: sheet.update_cell(
                                     row_index + 2,
                                     headers.index("WhatsApp Status") + 1,
                                     "Pending",
                                 ),
                                 retries=2,
                             )
                         print(f"📄 Sheets güncellendi: {cafe_name}")
             except Exception as e:
                 logger.warning(f"Sheets güncelleme hatası: {e}")
             
             # Save to dashboard JSON immediately
             save_dashboard_leads(dashboard_leads)
        else:
            lead[status_field] = "Error"
            log_ai_event("⚠️ Hata", "Selam gönderilemedi.")
    
    return json_updated


def add_test_lead(test_phone=None):
    phone = test_phone or os.getenv("TEST_PHONE", "").strip()
    if not phone:
        print("⚠️ Test telefonu bulunamadı. TEST_PHONE env ekleyin veya fonksiyona numara verin.")
        return
    leads = load_dashboard_leads()
    for lead in leads:
        if str(lead.get("Phone", "")).strip() == phone:
            print("ℹ️ Test lead zaten mevcut.")
            return
    leads.append({
        "ID": str(len(leads)),
        "Country": "TR",
        "City": "İstanbul",
        "Company Name": "Test Cafe",
        "Phone": phone,
        "Lead Type": "WhatsApp",
        "Lead Status": "New",
        "Last Review": "",
        "Active Strategy": "A",
        "selected_strategy": "A",
    })
    save_dashboard_leads(leads)
    print("✅ Test lead eklendi.")

def _focus_whatsapp_window():
    # WhatsApp Desktop, WhatsApp Web (browser), or any window with "WhatsApp" in title
    windows = []
    for title_part in ("WhatsApp", "WhatsApp Web", "WhatsApp Desktop"):
        windows = gw.getWindowsWithTitle(title_part)
        if windows:
            break
    if not windows:
        logger.warning("WhatsApp penceresi bulunamadı. WhatsApp Desktop veya tarayıcıda WhatsApp Web açık olmalı.")
        print("⚠️ WhatsApp penceresi bulunamadı. Pencereyi açık tutun ve başlıkta 'WhatsApp' geçmeli.")
        return
    window = windows[0]
    try:
        window.restore()
    except Exception:
        pass
    try:
        window.activate()
    except Exception:
        pass
    try:
        window.maximize()
    except Exception:
        pass
    try:
        pyautogui.click(window.left + window.width // 2, window.top + window.height - 80)
    except Exception:
        pass

def _send_whatsapp_message(phone, message, cafe_name):
    """
    WhatsApp mesajı gönder: Önce WAHA dene, olmazsa PyAutoGUI fallback.
    Anti-Ban: Jitter, Typing, Seen, Paraphrase simülasyonu içerir.
    """
    # 2. RASTGELE "DÜŞÜNME" SÜRESİ (Natural Jitter: 5-15s)
    add_natural_jitter()

    phone_clean = clean_phone(phone)
    if waha.is_available() and phone_clean:
        chat_id = waha.phone_to_chat_id(phone_clean)
        
        # 3. YAZIYOR... VE OKUNDU SİMÜLASYONU
        waha.seen(chat_id) # Mark as Read
        
        # 1. DİNAMİK MESAJ VARYASYONU (AI Paraphrasing)
        varied_message = paraphrase_message(message, client)
        
        # Typing based on length (3-8 seconds)
        waha.start_typing(chat_id)
        typing_sec = random.randint(3, 8)
        time.sleep(typing_sec)
        
        success = waha.send_text(chat_id, varied_message)
        
        # 5. OTOMATİK DURAKLATMA (Safety Pause)
        if not check_and_handle_errors(success):
            waha.stop_typing(chat_id)
            return False

        if success:
            print(f"🤖 WAHA: {cafe_name} mesajı gönderildi.")
            waha.stop_typing(chat_id)
            return True
        waha.stop_typing(chat_id)

    # Fallback to PyAutoGUI
    print(f"🤖 PyAutoGUI: {cafe_name} için pencere açılıyor...")
    whatsapp_url = f"whatsapp://send?phone={phone}&text={urllib.parse.quote(message)}"
    webbrowser.open(whatsapp_url)
    time.sleep(5)
    _focus_whatsapp_window()
    time.sleep(2)
    pyautogui.press('enter')
    return True

PRESS_ENTER_COOLDOWN = 10  # saniye; aynı kişiye tekrar Enter basmadan önce bekle

def run_housekeeping(leads):
    """
    KARA LİSTE, ARŞİV ve CEVAPSIZLARI TEMİZLEME modülü.
    """
    logger.info("🧹 Housekeeping başlatılıyor...")
    blacklist = _read_json(BLACKLIST_PATH, [])
    passive_leads = _read_json(PASSIVE_LEADS_PATH, [])
    updated_main = False
    
    current_time = time.time()
    PROTECTED_STATUSES = ["Interested", "Accepted", "Demo", "Converted", "Appointment", "Görüştü", "Olumlu", "Kurulacak"]
    
    new_dashboard_leads = []
    
    for lead in leads:
        # KORUMA: İlgilenenleri asla taşıma/arşivleme
        status = str(lead.get("WhatsApp Status", "")).strip()
        lead_type = lead.get("Lead Type", "WhatsApp")
        
        should_archive = False
        should_blacklist = False
        should_move_to_passive = False
        
        # 3. KORUMA: 'Interested' veya 'Appointment' aşamasındakileri asla arşivleme
        is_protected = any(s.lower() in status.lower() for s in PROTECTED_STATUSES)
        
        if is_protected:
            new_dashboard_leads.append(lead)
            continue
            
        # 1. KARA LİSTE VE ARŞİV (Hard Reject)
        last_incoming = str(lead.get("Last_Incoming_Body", "")).lower()
        if any(kw in last_incoming for kw in HARD_REJECT_KEYWORDS):
            should_blacklist = True
            should_archive = True
            logger.info(f"🚫 Hard Reject tespit edildi: {lead.get('Company Name')} ({lead.get('Phone')})")
            
        # 2. CEVAPSIZLARI TEMİZLE (Ghost Archive - 48 Saat)
        # Eğer bir müşteriye son mesajı atalı 48 saat geçtiyse ve müşteri hiç cevap vermediyse
        # (status: 'Sent' veya 'Greeting_Sent' ama Last_Incoming_Body hala başlangıç mesajıyla aynı veya boşsa)
        last_activity = lead.get("last_activity_at")
        if last_activity and not should_blacklist:
            try:
                # API formatı: 2026-01-30T16:27:04.083Z
                ts = datetime.fromisoformat(last_activity.replace('Z', '+00:00')).timestamp()
                diff_hours = (current_time - ts) / 3600
                
                # Sadece 'Sent' veya 'Greeting_Sent' olan ve 48 saattir tık yoksa
                if diff_hours >= 48 and status in ["Sent", "Greeting_Sent"]:
                    should_move_to_passive = True
                    should_archive = True
                    logger.info(f"👻 Ghost Lead (48s): {lead.get('Company Name')} pasife alınıyor.")
            except:
                pass

        # Uygulama
        chat_id = lead.get("LID") or waha.phone_to_chat_id(lead.get("Phone", ""))
        
        if should_blacklist:
            phone = str(lead.get("Phone", ""))
            if phone not in blacklist:
                blacklist.append(phone)
            lead["WhatsApp Status"] = "Blacklisted"
            updated_main = True
            if waha.is_available(): waha.archive_chat(chat_id)
            new_dashboard_leads.append(lead) # Kara listedekiler dashboard'da 'Rejected' olarak da kalabilir
            
        elif should_move_to_passive:
            passive_leads.append(lead)
            if waha.is_available(): waha.archive_chat(chat_id)
            updated_main = True
            # new_dashboard_leads'e EKLEMİYORUZ (Ana ekrandan temizlensin)
            
        elif should_archive:
             if waha.is_available(): waha.archive_chat(chat_id)
             new_dashboard_leads.append(lead)
        else:
            new_dashboard_leads.append(lead)

    if updated_main:
        _atomic_write_json(BLACKLIST_PATH, blacklist)
        _atomic_write_json(PASSIVE_LEADS_PATH, passive_leads)
        # dashboard_leads listesini orijinal yerinde güncellemek için:
        leads[:] = new_dashboard_leads 
        save_dashboard_leads(leads)
        
    logger.info("🧹 Housekeeping tamamlandı.")
    return updated_main

def run_robot():
    daily_counter = 0
    last_day = time.strftime("%Y-%m-%d")
    last_running_state = None
    last_waha_poll = 0.0
    last_press_enter_at = 0.0
    last_housekeeping_at = 0.0
    last_sheet_sync = 0.0 # Rate limit for Google Sheets API
    last_limit_log = 0.0 # Track when we last logged the limit hit
    brain_count = ensure_marketing_brain_seed()
    print(f"🧠 Kaffiy Marketing Brain aktif: {brain_count} örnek hafızada.")
    print(f"🤖 Robot: Dashboard gönderimlerini izliyorum... ({DASHBOARD_DATA_PATH})")
    if waha.ensure_session():
        print("📡 WAHA Bağlantısı: Tamam")
    else:
        print("📡 WAHA kullanılamıyor (localhost:3000); pyautogui fallback kullanılacak.")

    while True:
        settings = load_settings()
        # Use message_delay_minutes for outbound spacing
        global MESSAGE_DELAY_SECONDS
        delay_min = settings.get("message_delay_minutes", 1)
        MESSAGE_DELAY_SECONDS = int(delay_min * 60)
        
        is_running = settings.get("is_bot_running", False)
        inbound_enabled = settings.get("inbound_enabled", True)
        outbound_enabled = settings.get("outbound_enabled", True)
        is_test_mode = settings.get("test_mode", False)
        test_phone = clean_phone(settings.get("test_phone", "")) or ""
        
        # New Security Lock
        security_lock_enabled = settings.get("security_lock", True)
        
        if is_running != last_running_state:
            state_label = "aktif" if is_running else "uykuda"
            print(f"🤖 Bot durumu: {state_label}.")
            last_running_state = is_running
        if not is_running and not (inbound_enabled or outbound_enabled):
            update_bot_status("idle", "Dashboard komutu bekleniyor.")
            print("💤 Bot uykuda, dashboard'dan komut bekleniyor...")
            time.sleep(3)
            continue

        # Periyodik Housekeeping (1 saatte bir)
        if time.time() - last_housekeeping_at > 3600:
            dashboard_leads = load_dashboard_leads()
            if run_housekeeping(dashboard_leads):
                # stats already saved inside run_housekeeping via save_dashboard_leads
                pass
            last_housekeeping_at = time.time()

        # Dashboard "Send via WhatsApp" açtıysa tek seferlik Enter bas (çoklu gönderim engeli)
        try:
            press_data = _read_json(PRESS_ENTER_PATH, {})
            if press_data.get("requested") and isinstance(press_data.get("at"), (int, float)):
                t0 = float(press_data["at"]) / 1000.0
                if time.time() - t0 < 60:
                    # İsteği hemen tüket; çift tıklamada tekrar Enter basılmasın
                    _atomic_write_json(PRESS_ENTER_PATH, {"requested": False, "at": 0})
                    # Cooldown: aynı anda birden fazla Enter basılmasın
                    if time.time() - last_press_enter_at >= PRESS_ENTER_COOLDOWN:
                        time.sleep(4)
                        _focus_whatsapp_window()
                        time.sleep(0.8)
                        pyautogui.press("enter")
                        last_press_enter_at = time.time()
                        print("🤖 Robot: Dashboard isteğiyle Enter basıldı.")
                else:
                    _atomic_write_json(PRESS_ENTER_PATH, {"requested": False, "at": 0})
        except Exception as e:
            logger.warning("Press-enter okuma/handle hatası: %s", e)

        if time.strftime("%Y-%m-%d") != last_day:
            daily_counter = 0
            last_day = time.strftime("%Y-%m-%d")
            
        daily_limit = settings.get("daily_limit", 50)
        bot_stopped_by_limit = False
        if daily_counter >= daily_limit:
            update_bot_status("paused", f"Günlük limit ({daily_limit}) doldu. Sadece gelen mesajlar cevaplanıyor.")
            if time.time() - last_limit_log > 3600:
                print(f"Günlük güvenli gönderim limitine ({daily_limit}) ulaşıldı! Yeni outbound yapılmayacak.")
                last_limit_log = time.time()
            bot_stopped_by_limit = True

        dashboard_leads = load_dashboard_leads()
        if not dashboard_leads:
            update_bot_status("idle", "Dashboard'da kayıt yok.")
            time.sleep(5)
            continue
        update_marketing_brain_from_leads(dashboard_leads)
        json_updated = False

        if inbound_enabled and waha.is_available() and (time.time() - last_waha_poll) >= WAHA_POLL_INTERVAL:
            last_waha_poll = time.time()
            extra = [test_phone] if test_phone else None
            # Fetch sheet data for real-time sync (Rate Limited: 60s)
            sheet, headers, df = None, None, None
            if time.time() - last_sheet_sync > 60:
                try:
                    sheet = connect_google_sheets()
                    all_values = sheet.get_all_values()
                    if all_values:
                        headers = [str(c).strip() for c in all_values[0]]
                        df = pd.DataFrame(all_values[1:], columns=headers)
                        last_sheet_sync = time.time()
                except Exception as e:
                    logger.warning(f"Sheets Sync Error (Quota?): {e}")
            
            if _poll_waha_incoming(dashboard_leads, inbound_enabled, security_lock_enabled, extra_phones=extra, sheet=sheet, headers=headers, df=df):
                save_dashboard_leads(dashboard_leads)
                json_updated = True

        if waha.is_available():
            # Handle Manually Approved Messages (Always send approved)
            # User might want manual sends to bypass limit, but let's be safe.
            # For now, allow manual sends to bypass the "bot_stopped_by_limit" if it's explicitly Approved.
            for lead in dashboard_leads:
                ws = lead.get("WhatsApp Status")
                ps = lead.get("Phone Status")
                if ws == "Approved" or ps == "Approved":
                    phone = str(lead.get("Phone", ""))
                    msg = lead.get("Suggested_Response") or lead.get("Ready Message") or ""
                    
                    if phone and msg:
                        logger.info(f"✅ Onaylı mesaj gönderiliyor: {phone}")
                        # Fix: Use LID for groups, Phone for individuals
                        chat_id = lead.get("LID") or None  # Groups have LID field
                        if not chat_id:
                            # LID detection: If phone is long string of digits but not a valid TR/DE mobile
                            if phone.isdigit() and len(phone) > 12:
                                chat_id = f"{phone}@lid"
                            else:
                                c_phone = clean_phone(phone)
                                if c_phone:
                                    chat_id = waha.phone_to_chat_id(c_phone)
                        
                        if is_test_mode:
                             msg = f"🧪 BU BİR TEST MESAJIDIR:\n{msg}"
                                    
                        if chat_id:
                            success = waha.send_text(chat_id, msg)
                        else:
                            success = False
                            logger.warning(f"❌ Invalid Phone/ChatID for manual send: {phone}")
                        
                        if success:
                            lead["WhatsApp Status"] = "Contacted" 
                            lead["Phone Status"] = "Contacted"
                        else:
                            # CRITICAL: Mark as Error to prevent infinite retry loop
                            logger.error(f"❌ Manuel gönderim başarısız ({phone}), durumu Hataya çekiyorum.")
                            lead["WhatsApp Status"] = "Error"
                            lead["Phone Status"] = "Error"
                        
                        # Fix: Move these outside the else block so they run on success too!
                        if "Pending_Reply_Since" in lead: del lead["Pending_Reply_Since"]
                        json_updated = True
                        save_dashboard_leads(dashboard_leads) # IMMEDIATE SAVE to prevent re-approval loop
                        update_bot_stats_file(dashboard_leads) # Update stats immediately to clear pending
                        daily_counter += 1
                        log_ai_event("📤 Onaylı Mesaj", f"{phone}: {msg[:50]}")
                    else:
                        logger.warning(f"⚠️ Onaylı mesaj için veri eksik: {phone}")
                        lead["WhatsApp Status"] = "Error" 
                        json_updated = True

            # Process Autonomous Actions (Only if enabled)
            if outbound_enabled:
                update_bot_status("autonomous", "WAHA outbound aktif (Otonom).")
                # security_lock_enabled argument added
                json_updated = _process_autonomous_mode(dashboard_leads, outbound_enabled, security_lock_enabled, is_test_mode=is_test_mode) or json_updated
                if json_updated:
                    save_dashboard_leads(dashboard_leads)
            else:
                 update_bot_status("manual", "Bot Manuel Modda (Otonom Kapalı).")

        # --- PROCESS PENDING REPLIES (5-MIN THINKING DELAY) ---
        if inbound_enabled and waha.is_available():
            if _process_pending_replies(dashboard_leads, client, is_test_mode=is_test_mode):
                save_dashboard_leads(dashboard_leads)
                json_updated = True

        for lead in dashboard_leads:
            if str(lead.get("Phone Status", "")).strip() == "New":
                if not str(lead.get("Ready Message", "")).strip():
                    cafe_name = lead.get("Company Name", "İşletme")
                    review = lead.get("Last Review", "White mocha was my favorite.")
                    city = lead.get("City", "İstanbul")
                    lead["Ready Message"] = generate_ai_message(cafe_name, review, city, "A")
                    lead["Active Strategy"] = "A"
                    lead["selected_strategy"] = "A"
                    json_updated = True

        for lead in dashboard_leads:
            requested_strategy = str(lead.get("request_strategy_change", "")).strip().upper()
            if requested_strategy in ["A", "B", "C", "D"]:
                cafe_name = lead.get("Company Name", "İşletme")
                review = lead.get("Last Review", "White mocha was my favorite.")
                city = lead.get("City", "İstanbul")
                lead["Ready Message"] = generate_ai_message(cafe_name, review, city, requested_strategy)
                lead["Active Strategy"] = requested_strategy
                lead["selected_strategy"] = requested_strategy
                if "request_strategy_change" in lead:
                    del lead["request_strategy_change"]
                json_updated = True
                print(f"🔄 {cafe_name} için mesaj Strateji {requested_strategy} ile güncellendi.")

        try:
            sheet = _with_retry(connect_google_sheets, retries=2)
            all_values = _with_retry(sheet.get_all_values, retries=2)
            if not all_values:
                update_bot_status("warn", "Sheets verisi boş.")
                time.sleep(5)
                continue
            headers = [str(c).strip() for c in all_values[0]]
            if 'Phone Status' not in headers:
                update_bot_status("error", "Sheets'te Phone Status kolonu bulunamadı.")
                time.sleep(5)
                continue
            df = pd.DataFrame(all_values[1:], columns=headers)
        except Exception as e:
            update_bot_status("error", f"Sheets bağlantı hatası: {e}")
            print(f"❌ Bağlantı hatası: {e}")
            time.sleep(5)
            continue

          # ---------------------------------------------------------------------
        # OUTBOUND / AUTONOMOUS SECTION
        # ---------------------------------------------------------------------
        if bot_stopped_by_limit or not outbound_enabled:
             time.sleep(10)
             continue
             
        if not autonomous_mode:
             time.sleep(10)
             continue

        phone_status_col = 'Phone Status'

        requested_count = 0
        requested_names = []
        for lead in dashboard_leads:
            status = str(lead.get(phone_status_col, '')).strip()
            wa_status = str(lead.get('WhatsApp Status', '')).strip()
            
            # Manual 'Requested' OR User 'Approved' from safety queue
            is_manual_request = status in ['Requested', 'Send Requested', 'Approved']
            is_wa_approved = wa_status in ['Approved']
            
            if not is_manual_request and not is_wa_approved:
                continue
            requested_count += 1
            requested_names.append(lead.get('Company Name', 'İşletme'))
            
            # STRICT SWITCH CHECK: If Reach Customers (outbound_enabled) is OFF, skip new messages
            # Unless it's a manual 'Requested' status, but even then, follow user's general rule
            if not outbound_enabled and status not in ['Requested', 'Send Requested']:
                 continue
            
            if not outbound_enabled:
                 # USER REQUEST: "müsteri reach secenegi kapali iken yeni müsterlere yazmsasin"
                 # We skip even requested ones if outbound is off? 
                 # Let's be safe and skip if you said "yeni müşterilere yazmasın".
                 if str(lead.get("Phone Status", "")).lower() == "new" or not lead.get("Last_Action"):
                     continue
            if _is_existing_customer(lead):
                print(f"⛔ Eski müşteri atlandı: {lead.get('Company Name', 'İşletme')}")
                continue

            cafe_name = lead.get('Company Name', 'İşletme')
            if str(lead.get('Lead Type', '')).strip() != 'WhatsApp':
                continue
            phone = clean_phone(lead.get('Phone', ''))
            if not phone:
                continue

            strategy_code = _get_lead_strategy(lead)
            # Use 'Suggested_Response' if it's a WA approval, else 'Ready Message'
            message_to_send = ""
            if is_wa_approved:
                message_to_send = str(lead.get('Suggested_Response', '')).strip()
            
            if not message_to_send:
                message_to_send = str(lead.get('Ready Message', '')).strip()

            if not message_to_send:
                review = lead.get('Last Review', 'White mocha was my favorite.')
                city = lead.get('City', 'İstanbul')
                message_to_send = generate_ai_message(cafe_name, review, city, strategy_code)
                lead['Ready Message'] = message_to_send
                json_updated = True

            try:
                send_phone = test_phone if is_test_mode else phone
                send_cafe = "Test Kafe" if is_test_mode else cafe_name
                if is_test_mode:
                    if not send_phone:
                        print("⚠️ Test modu açık ama test_phone ayarlı değil; ayarlardan test numarası girin. Gönderim atlanıyor.")
                        continue
                    print(f"🧪 Test Modu: {cafe_name} yerine Test Kafe ({send_phone})'ye gönderiliyor...")
                else:
                    print(f"🤖 Robot: {cafe_name} gönderim için işleniyor...")
                update_bot_status("sending", f"{send_cafe} için WhatsApp gönderiliyor." + (" [TEST]" if is_test_mode else ""))
                log_ai_event("📤 Mesaj Gönderiliyor", f"{send_cafe} ({send_phone})")
                _send_whatsapp_message(send_phone, message_to_send, send_cafe)
                _append_sent_message(send_cafe, send_phone, message_to_send, source="bot_test" if is_test_mode else "bot")
                if not is_test_mode:
                    lead["sent_strategy"] = strategy_code
                    daily_counter += 1
                    lead[phone_status_col] = "Sent"
                    lead["WhatsApp Status"] = "Pending"  # Mark as Pending for follow-up tracking
                    if "Suggested_Response" in lead:
                        del lead["Suggested_Response"] # Clean up after send
                    json_updated = True
                    save_dashboard_leads(dashboard_leads)
                else:
                    print(f"🧪 Test Kafe'ye gönderildi (gerçek lead: {cafe_name} değişmedi).")
                # Spam önleme: sonraki mesajdan önce bekle; beklerken dashboard Enter isteğini kontrol et
                # Spam prevention: WAIT while still polling for replies
                print(f"⏳ Sonraki mesaj için bekleniyor ({MESSAGE_DELAY_SECONDS}sn)... Cevaplar takip ediliyor.")
                wait_start = time.time()
                while time.time() - wait_start < MESSAGE_DELAY_SECONDS:
                    # 1. Call Poll inside wait loop! (Critical for responsiveness)
                    if inbound_enabled and waha.is_available():
                        if _poll_waha_incoming(dashboard_leads, inbound_enabled, security_lock_enabled, extra_phones=[test_phone] if test_phone else None):
                            json_updated = True
                            save_dashboard_leads(dashboard_leads) # Save immediately if reply handled
                    
                    # 2. Check Dashboard Press Enter request
                    try:
                        press_data = _read_json(PRESS_ENTER_PATH, {})
                        if press_data.get("requested"):
                             t0 = float(press_data["at"]) / 1000.0
                             if time.time() - t0 < 60:
                                _atomic_write_json(PRESS_ENTER_PATH, {"requested": False, "at": 0})
                                time.sleep(2)
                                _focus_whatsapp_window()
                                pyautogui.press("enter")
                                print("🤖 Robot: Dashboard isteğiyle Enter basıldı.")
                    except: pass
                    
                    time.sleep(5) # Granular check every 5s
                
                print("✅ Bekleme tamamlandı, sıradaki lead'e geçiliyor.")
            except pyautogui.FailSafeException:
                update_bot_status("error", "Fail-safe tetiklendi.")
                print("⚠️ Fail-safe tetiklendi. İşlem durduruldu.")
                return
            except Exception as e:
                update_bot_status("error", f"WhatsApp gönderim hatası: {e}")
                print(f"⚠️ WhatsApp gönderim hatası: {e}")
                # If an exception occurs during _send_whatsapp_message,
                # we still want to mark the lead as "Sent" locally if it was a manual send attempt
                # and update the sheet if possible.
                # This ensures the dashboard JSON reflects the update and prevents resending.
                if not is_test_mode:
                    lead[phone_status_col] = "Sent"
                    lead["Last_Action"] = "Manual_Send" # Added for clarity on dashboard
                    json_updated = True
                    # Attempt to update Google Sheets even if there was a sending error
                    row_index = _find_sheet_row_index(df, lead)
                    if row_index is not None:
                        try:
                            _with_retry(
                                lambda: sheet.update_cell(
                                    row_index + 2,
                                    headers.index(phone_status_col) + 1,
                                    "Sent",
                                ),
                                retries=2,
                            )
                        except Exception as sheet_e:
                            update_bot_status("warn", f"Sheets güncelleme hatası (gönderim hatası sonrası): {sheet_e}")
                            print(f"⚠️ Sheets güncelleme hatası (gönderim hatası sonrası): {sheet_e}")
                continue

            if not is_test_mode:
                row_index = _find_sheet_row_index(df, lead)
                if row_index is not None:
                    try:
                        _with_retry(
                            lambda: sheet.update_cell(
                                row_index + 2,
                                headers.index(phone_status_col) + 1,
                                "Sent",
                            ),
                            retries=2,
                        )
                    except Exception as e:
                        update_bot_status("warn", f"Sheets güncelleme hatası: {e}")
                        print(f"⚠️ Sheets güncelleme hatası: {e}")

        if json_updated:
            save_dashboard_leads(dashboard_leads)
        
        # Always update stats to keep pending_approvals and insights fresh
        update_bot_stats_file(dashboard_leads)

        if requested_count == 0:
            update_bot_status("idle", "Bekleyen gönderim yok.")
            print("🤖 Robot: Bekleyen gönderim yok.")
        else:
            update_bot_status("queued", f"Bekleyen {requested_count} kayıt var.")
            print(f"🤖 Robot: Bekleyen {requested_count} kayıt bulundu: {', '.join(requested_names)}")

        # Keep loop fast for responsiveness (replying to users)
        # Autonomous speed is handled inside _process_autonomous_mode via message_delay_minutes
        time.sleep(5)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--export", action="store_true", help="Sheets -> JSON export")
    parser.add_argument("--add-test-lead", action="store_true", help="Test lead ekle")
    parser.add_argument("--test-phone", type=str, default="", help="Test lead telefon numarası")
    parser.add_argument("--delete-lead", action="store_true", help="Read lead JSON from stdin and delete that row from Google Sheets")
    args = parser.parse_args()
    if args.export:
        export_all_leads_from_sheets()
    elif args.add_test_lead:
        add_test_lead(args.test_phone.strip() if args.test_phone else None)
    elif args.delete_lead:
        try:
            lead_json = sys.stdin.read()
            lead_dict = json.loads(lead_json)
            if delete_lead_from_sheets(lead_dict):
                print("OK")
            else:
                print("NOT_FOUND")
        except Exception as e:
            logger.error("delete_lead error: %s", e)
            sys.exit(1)
    else:
        run_robot()