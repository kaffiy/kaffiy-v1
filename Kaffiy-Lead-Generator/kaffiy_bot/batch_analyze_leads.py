import json
import os
import sys
import time
import re
from typing import List, Dict

# Add kaffiy_bot to path to import kaffiy_ai
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from kaffiy_ai import analyze_interest
except ImportError:
    print("❌ Error: Could not import kaffiy_ai. Ensure kaffiy_ai.py is in the same directory.")
    sys.exit(1)

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "kaffiy-growth-dashboard", "src", "data"))
LEADS_PATH = os.path.join(DATA_DIR, "leads_data.json")
CONVERSATIONS_PATH = os.path.join(DATA_DIR, "conversations.json")

def load_json(path):
    if not os.path.exists(path): return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {}

def save_leads(leads: List[Dict]):
    with open(LEADS_PATH, "w", encoding="utf-8") as f:
        json.dump(leads, f, ensure_ascii=False, indent=2)

def normalize_phone(p):
    if not p: return ""
    return re.sub(r'\D', '', str(p))

def get_latest_customer_message(data):
    """Gets the latest 'customer' message from a history list."""
    history = []
    if isinstance(data, list):
        history = data
    elif isinstance(data, dict):
        history = data.get("history", [])
    
    if not isinstance(history, list): return ""
    
    # Iterate backwards to find last customer message
    for msg in reversed(history):
        sender = msg.get("sender") or msg.get("role")
        if sender in ["customer", "user"]:
            return msg.get("text") or msg.get("content") or ""
    return ""

def batch_analyze():
    leads = load_json(LEADS_PATH)
    conversations = load_json(CONVERSATIONS_PATH)
    
    if not leads: 
        print("❌ No leads found.")
        return

    print(f"🔍 Found {len(leads)} leads. Syncing with conversations.json...")
    
    updated_count = 0
    # Terminal statuses that we shouldn't overwrite unless they are specifically targeted
    terminal_statuses = ["Interested", "Rejected", "Demo", "Converted"]

    # Map conversations by normalized phone/lid
    conv_map = {}
    for key, data in conversations.items():
        norm_key = normalize_phone(key)
        if norm_key: conv_map[norm_key] = data

    for i, lead in enumerate(leads):
        phone = normalize_phone(lead.get("Phone", ""))
        lid = lead.get("LID", "")
        norm_lid = normalize_phone(lid)
        
        # Try to find message in conversations
        latest_msg = ""
        conv_data = conv_map.get(phone) or conv_map.get(norm_lid)
        
        if conv_data:
            latest_msg = get_latest_customer_message(conv_data)
        
        # If no message in conversations.json, fallback to Last_Message in leads_data.json
        if not latest_msg:
            latest_msg = lead.get("Last_Message", "")

        whatsapp_status = str(lead.get("WhatsApp Status", "")).strip()
        
        # Criteria: Has a message and status is not already finalized
        if latest_msg and whatsapp_status not in terminal_statuses:
            print(f"🤖 Analyzing lead {i+1}/{len(leads)}: {lead.get('Company Name')} - Msg: {str(latest_msg)[:30]}...")
            
            sentiment = analyze_interest(latest_msg)
            print(f"   -> Sentiment: {sentiment}")
            
            new_status = ""
            if sentiment == "Positive":
                new_status = "Interested"
            elif sentiment == "Negative":
                new_status = "Rejected"
            elif sentiment == "Neutral":
                new_status = "Contacted"
            
            if new_status:
                lead["Last_Message"] = latest_msg # Sync the last message back
                lead["WhatsApp Status"] = new_status
                # Update Lead Status if it was at early stage
                if lead.get("Lead Status") in ["Ready", "Pending", "Greeting_Sent", ""]:
                    lead["Lead Status"] = new_status
                
                updated_count += 1
                time.sleep(0.1)

    if updated_count > 0:
        save_leads(leads)
        print(f"✅ Success: {updated_count} leads updated.")
    else:
        print("ℹ️ No leads were updated.")

if __name__ == "__main__":
    batch_analyze()
