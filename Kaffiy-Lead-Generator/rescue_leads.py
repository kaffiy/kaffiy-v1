import json
import sys
import os
import pandas as pd

# Add bot directory to path for imports
sys.path.insert(0, 'kaffiy_bot')
from bot import analyze_customer_sentiment, clean_phone, load_dashboard_leads, save_dashboard_leads, connect_google_sheets, _with_retry

# Paths
conversations_path = "kaffiy-growth-dashboard/kaffiy-growth-hub-main/src/data/conversations.json"
leads_path = "kaffiy-growth-dashboard/kaffiy-growth-hub-main/src/data/leads_data.json"

def rescue_leads():
    # 1. Load Conversations
    with open(conversations_path, "r", encoding="utf-8") as f:
        conversations = json.load(f)
    
    # 2. Load Dashboard Leads
    leads = load_dashboard_leads()
    existing_phones = {str(l.get("Phone", "")).replace("+", "").replace(" ", "").replace("-", ""): l for l in leads}
    
    # 3. Load from Google Sheets to get company names
    print("📋 Google Sheets'ten veriler çekiliyor...")
    try:
        sheet = connect_google_sheets()
        all_values = sheet.get_all_values()
        headers = [str(c).strip() for c in all_values[0]]
        df = pd.DataFrame(all_values[1:], columns=headers)
        sheet_leads = df.to_dict('records')
    except Exception as e:
        print(f"❌ Sheets hatası: {e}")
        sheet_leads = []

    updated_count = 0
    added_count = 0

    print("\n🔍 Konuşmalar analiz ediliyor...")
    for chat_id, conv_data in conversations.items():
        phone = chat_id.replace("@c.us", "").replace("@lid", "")
        
        # Determine sentiment from last customer message
        last_customer_msg = None
        if isinstance(conv_data, dict) and "history" in conv_data:
            cust_msgs = [m for m in conv_data["history"] if m.get("sender") == "customer"]
            if cust_msgs:
                last_customer_msg = cust_msgs[-1]["text"]
        
        sentiment = "Pending"
        if last_customer_msg:
            sentiment = analyze_customer_sentiment(last_customer_msg)
        
        # Check if lead exists in dashboard
        matched_lead = None
        for p, l in existing_phones.items():
            if phone in p or p in phone:
                matched_lead = l
                break
        
        if matched_lead:
            # Update existing status
            old_status = matched_lead.get("WhatsApp Status", "Not Sent")
            if sentiment != old_status:
                matched_lead["WhatsApp Status"] = sentiment
                print(f"✅ Güncellendi: {matched_lead.get('Company Name')} -> {sentiment}")
                updated_count += 1
        else:
            # Add missing lead from sheet or conversations
            company_name = "Bilinmeyen Esnaf"
            for s_lead in sheet_leads:
                s_phone = str(s_lead.get("Phone", "")).replace("+", "").replace(" ", "").replace("-", "")
                if phone in s_phone or s_phone in phone:
                    company_name = s_lead.get("Company Name", "Bilinmeyen Esnaf")
                    break
            
            new_lead = {
                "ID": str(len(leads) + 100),
                "Company Name": company_name,
                "Phone": phone,
                "Lead Type": "WhatsApp",
                "WhatsApp Status": sentiment,
                "Phone Status": "Sent",
                "City": "İstanbul"
            }
            leads.append(new_lead)
            existing_phones[phone] = new_lead
            print(f"➕ Eklendi: {company_name} ({phone}) -> {sentiment}")
            added_count += 1

    # Save results
    save_dashboard_leads(leads)
    print(f"\n📊 Özet: {added_count} yeni lead eklendi, {updated_count} lead güncellendi.")

if __name__ == "__main__":
    rescue_leads()
