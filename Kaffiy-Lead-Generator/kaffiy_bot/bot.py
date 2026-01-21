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
from oauth2client.service_account import ServiceAccountCredentials
from openai import OpenAI
from dotenv import load_dotenv

# --- AYARLAR ---
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SHEET_NAME = "Kaffiy_Lead_DB" 
WORKSHEET_NAME = "Leads"
CREDENTIALS_FILE = "credentials.json"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.normpath(
    os.path.join(BASE_DIR, "..", "kaffiy-growth-dashboard", "kaffiy-growth-hub-main", "src", "data")
)
DASHBOARD_DATA_PATH = os.path.join(DATA_DIR, "leads_data.json")
BRAIN_JSON_PATH = os.path.join(DATA_DIR, "marketing_brain.json")
SETTINGS_PATH = os.path.join(DATA_DIR, "settings.json")

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
pyautogui.FAILSAFE = True

def _countdown(seconds, prefix):
    for remaining in range(seconds, 0, -1):
        print(f"{prefix} {remaining}...")
        time.sleep(1)

def connect_google_sheets():
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds = ServiceAccountCredentials.from_json_keyfile_name(CREDENTIALS_FILE, scope)
    client_gs = gspread.authorize(creds)
    return client_gs.open(SHEET_NAME).worksheet(WORKSHEET_NAME)

def clean_phone(phone):
    if not phone: return None
    clean = re.sub(r'\D', '', str(phone))
    if clean.startswith('90'): clean = clean[2:]
    if clean.startswith('0'): clean = clean[1:]
    return '90' + clean if (len(clean) == 10 and clean.startswith('5')) else None

STRATEGIES = {
    "A": {
        "name": "Fikir Alma / Beta Testi",
        "description": "En az reddedilen yöntem. Bir şey satmıyorsun, sadece onlardan 'akıl hocası' olmalarını istiyorsun. İnsanlar fikir vermeyi sever.",
        "template": "Merhabalar, kolay gelsin :) Bir arkadaşımla birlikte Tech İstanbul bünyesinde butik kafeler için Starbucks uygulamasının daha pratik bir versiyonunu geliştiriyoruz. Şu an sadece seçtiğim birkaç işletmenin fikrini almak istiyorum. Satış değil, tamamen tecrübenize dayanarak 'olmuş mu' diye yorumunuzu rica edecektim. Kısaca bahsetmemi ister misiniz?"
    },
    "B": {
        "name": "Komşu Yaklaşımı",
        "description": "Bölgesel güven. 'Dışarıdan biri' değil, 'Bizden biri' imajı verirsin.",
        "template": "Merhabalar, kolay gelsin :) Ben de bu semtte yaşayan bir girişimciyim. Tech İstanbul çatısı altında, mahallemizdeki kafeler büyük zincirlerle daha rahat rekabet edebilsin diye bir sistem kurduk. Komşu bir işletme olarak projemize bir göz atıp fikrinizi belirtirseniz çok sevinirim."
    },
    "C": {
        "name": "Doğrudan Fayda",
        "description": "Hiç dolandırmadan, direkt acıya dokunmak. Açık sözlü yaklaşım.",
        "template": "Merhabalar, kolay gelsin :) Kahvenizin müdavimi çoktur eminim, peki ya onları dijitalde takip etmek? Bir arkadaşımla Tech İstanbul bünyesinde kurduğumuz Kaffiy ile eski usul kağıt kartları dijitale taşıyoruz. Kurulum ücreti yok, risk yok. 30 saniyelik bir göz atmak ister misiniz?"
    }
}

def generate_ai_message(cafe_name, review, city, strategy_code="A"):
    if not client: return f"Selamlar {cafe_name}, Kaffiy dijital sadakat sistemini denemek ister misiniz? ☕"
    
    brain_examples = load_marketing_brain()
    examples_text = ""
    if brain_examples:
        examples_text = "\n".join([f"- {msg}" for msg in brain_examples[:5]])
    
    strategy = STRATEGIES.get(strategy_code, STRATEGIES["A"])
    strategy_name = strategy["name"]
    strategy_desc = strategy["description"]
    strategy_template = strategy["template"]
    
    prompt = (
        f"Sen Kaffiy'in kurucusu Oğuz'sun. {strategy_name} stratejisini kullanarak mesaj yazacaksın.\n\n"
        f"Strateji Açıklaması: {strategy_desc}\n\n"
        f"Template Örneği:\n{strategy_template}\n\n"
        f"Görev:\n"
        f"- {city} şehrindeki {cafe_name} kafesine bu stratejiye uygun bir mesaj yaz.\n"
        f"- Template'deki gibi samimi, doğal ve merak uyandırıcı bir ton kullan.\n"
        f"- Asla robotik veya resmi olma. Konuşur gibi yaz.\n"
        f"- Mesaj tamamen Türkçe olsun.\n"
        f"- Mesajda tırnak işareti kullanma.\n"
        f"- Template'deki uzunluk ve yapıyı koru.\n"
        f"- Template'deki 'bu semtte', 'mahallemizdeki' gibi ifadeleri {city} şehri bağlamında kullan.\n"
        f"- Template'deki 'bir arkadaşımla' ifadesini koru.\n"
        f"- Template'deki 'Tech İstanbul' ifadesini koru.\n"
    )
    
    if examples_text:
        prompt += (
            f"\nReferans Örnekler (Başarılı Mesajlar):\n{examples_text}\n"
            "Bu örneklerdeki gibi samimi ve etkileyici yaz.\n"
        )
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini", 
            messages=[{"role": "user", "content": prompt}], 
            max_tokens=250
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"⚠️ OpenAI hatası: {e}")
        return f"Selamlar {cafe_name}, Kaffiy denemesi için test mesajıdır! 🚀"

def export_to_dashboard(df):
    os.makedirs(os.path.dirname(DASHBOARD_DATA_PATH), exist_ok=True)
    try:
        payload = df.to_dict(orient="records")
        with open(DASHBOARD_DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=4)
        print(f"✅ JSON güncellendi: {DASHBOARD_DATA_PATH}")
    except Exception as e:
        print(f"⚠️ JSON yazma hatası: {e}")

def load_dashboard_leads():
    if not os.path.exists(DASHBOARD_DATA_PATH):
        return []
    try:
        with open(DASHBOARD_DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except PermissionError:
        time.sleep(1)
        return None
    except Exception as e:
        print(f"⚠️ JSON okuma hatası: {e}")
        return []

def save_dashboard_leads(leads):
    os.makedirs(os.path.dirname(DASHBOARD_DATA_PATH), exist_ok=True)
    try:
        with open(DASHBOARD_DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(leads, f, ensure_ascii=False, indent=4)
    except PermissionError:
        time.sleep(1)
    except Exception as e:
        print(f"⚠️ JSON yazma hatası: {e}")

def load_marketing_brain():
    if not os.path.exists(BRAIN_JSON_PATH):
        return []
    try:
        with open(BRAIN_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception:
        return []

def save_marketing_brain(messages):
    os.makedirs(os.path.dirname(BRAIN_JSON_PATH), exist_ok=True)
    try:
        with open(BRAIN_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(messages, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"⚠️ Marketing brain yazma hatası: {e}")

def load_settings():
    if not os.path.exists(SETTINGS_PATH):
        return {"is_bot_running": False}
    try:
        with open(SETTINGS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, dict) else {"is_bot_running": False}
    except Exception:
        return {"is_bot_running": False}

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
        sheet = connect_google_sheets()
        all_values = sheet.get_all_values()
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
    lead_id = str(lead.get('ID', '')).strip()
    if lead_id:
        matches = df[df['ID'].astype(str) == lead_id]
        if not matches.empty:
            return matches.index[0]
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

def _focus_whatsapp_window():
    windows = gw.getWindowsWithTitle("WhatsApp")
    if not windows:
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
    whatsapp_url = f"whatsapp://send?phone={phone}&text={urllib.parse.quote(message)}"
    webbrowser.open(whatsapp_url)
    time.sleep(3)
    _focus_whatsapp_window()
    time.sleep(2)
    print(f"🤖 Robot: {cafe_name} için Enter'a basılıyor...")
    pyautogui.press('enter')

def run_robot():
    daily_counter = 0
    last_day = time.strftime("%Y-%m-%d")
    last_running_state = None
    brain_count = ensure_marketing_brain_seed()
    print(f"🧠 Kaffiy Marketing Brain aktif: {brain_count} örnek hafızada.")
    print(f"🤖 Robot: Dashboard gönderimlerini izliyorum... ({DASHBOARD_DATA_PATH})")

    while True:
        settings = load_settings()
        is_running = settings.get("is_bot_running", False)
        if is_running != last_running_state:
            state_label = "aktif" if is_running else "uykuda"
            print(f"🤖 Bot durumu: {state_label}.")
            last_running_state = is_running
        if not is_running:
            print("💤 Bot uykuda, dashboard'dan komut bekleniyor...")
            time.sleep(3)
            continue

        if time.strftime("%Y-%m-%d") != last_day:
            daily_counter = 0
            last_day = time.strftime("%Y-%m-%d")
        if daily_counter >= 50:
            print("Günlük güvenli gönderim limitine (50) ulaşıldı!")
            return

        dashboard_leads = load_dashboard_leads()
        if dashboard_leads is None:
            time.sleep(1)
            continue
        if not dashboard_leads:
            time.sleep(5)
            continue
        update_marketing_brain_from_leads(dashboard_leads)
        json_updated = False

        for lead in dashboard_leads:
            if str(lead.get("Phone Status", "")).strip() == "New":
                if not str(lead.get("Ready Message", "")).strip():
                    cafe_name = lead.get("Company Name", "İşletme")
                    review = lead.get("Last Review", "White mocha was my favorite.")
                    city = lead.get("City", "İstanbul")
                    lead["Ready Message"] = generate_ai_message(cafe_name, review, city, "A")
                    lead["Active Strategy"] = "A"
                    json_updated = True

        for lead in dashboard_leads:
            requested_strategy = str(lead.get("request_strategy_change", "")).strip().upper()
            if requested_strategy in ["A", "B", "C"]:
                cafe_name = lead.get("Company Name", "İşletme")
                review = lead.get("Last Review", "White mocha was my favorite.")
                city = lead.get("City", "İstanbul")
                lead["Ready Message"] = generate_ai_message(cafe_name, review, city, requested_strategy)
                lead["Active Strategy"] = requested_strategy
                if "request_strategy_change" in lead:
                    del lead["request_strategy_change"]
                json_updated = True
                print(f"🔄 {cafe_name} için mesaj Strateji {requested_strategy} ile güncellendi.")

        try:
            sheet = connect_google_sheets()
            all_values = sheet.get_all_values()
            if not all_values:
                time.sleep(5)
                continue
            headers = [str(c).strip() for c in all_values[0]]
            df = pd.DataFrame(all_values[1:], columns=headers)
        except Exception as e:
            print(f"❌ Bağlantı hatası: {e}")
            time.sleep(5)
            continue

        phone_status_col = 'Phone Status'

        requested_count = 0
        requested_names = []
        for lead in dashboard_leads:
            status = str(lead.get(phone_status_col, '')).strip()
            if status not in ['Requested', 'Send Requested']:
                continue
            requested_count += 1
            requested_names.append(lead.get('Company Name', 'İşletme'))

            cafe_name = lead.get('Company Name', 'İşletme')
            if str(lead.get('Lead Type', '')).strip() != 'WhatsApp':
                continue
            phone = clean_phone(lead.get('Phone', ''))
            if not phone:
                continue

            ready_message = str(lead.get('Ready Message', '')).strip()
            if not ready_message:
                review = lead.get('Last Review', 'White mocha was my favorite.')
                city = lead.get('City', 'İstanbul')
                strategy_code = str(lead.get("Active Strategy", "A")).strip().upper() or "A"
                ready_message = generate_ai_message(cafe_name, review, city, strategy_code)
                lead['Ready Message'] = ready_message
                json_updated = True

            try:
                print(f"🤖 Robot: {cafe_name} gönderim için işleniyor...")
                _send_whatsapp_message(phone, ready_message, cafe_name)
                daily_counter += 1
            except pyautogui.FailSafeException:
                print("⚠️ Fail-safe tetiklendi. İşlem durduruldu.")
                return
            except Exception as e:
                print(f"⚠️ WhatsApp gönderim hatası: {e}")
                continue

            row_index = _find_sheet_row_index(df, lead)
            if row_index is not None:
                try:
                    sheet.update_cell(row_index + 2, headers.index(phone_status_col) + 1, "Sent")
                except Exception as e:
                    print(f"⚠️ Sheets güncelleme hatası: {e}")
            lead[phone_status_col] = "Sent"
            json_updated = True

        if json_updated:
            save_dashboard_leads(dashboard_leads)
        if requested_count == 0:
            print("🤖 Robot: Bekleyen gönderim yok.")
        else:
            print(f"🤖 Robot: Bekleyen {requested_count} kayıt bulundu: {', '.join(requested_names)}")

        time.sleep(5)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--export", action="store_true", help="Sheets -> JSON export")
    args = parser.parse_args()
    if args.export:
        export_all_leads_from_sheets()
    else:
        run_robot()