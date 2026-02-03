import json
import sys
import os

# Add bot directory to path
sys.path.insert(0, 'kaffiy_bot')
from bot import analyze_customer_sentiment

# Paths
conversations_path = "kaffiy-growth-dashboard/kaffiy-growth-hub-main/src/data/conversations.json"
leads_path = "kaffiy-growth-dashboard/kaffiy-growth-hub-main/src/data/leads_data.json"

# Load conversations
with open(conversations_path, "r", encoding="utf-8") as f:
    conversations = json.load(f)

# Load leads
with open(leads_path, "r", encoding="utf-8") as f:
    leads = json.load(f)

# Analyze past conversations and update leads
updated_count = 0
for chat_id, conv_data in conversations.items():
    if isinstance(conv_data, dict) and "history" in conv_data:
        # Get last customer message
        customer_messages = [msg for msg in conv_data["history"] if msg.get("sender") == "customer"]
        
        if customer_messages:
            last_customer_msg = customer_messages[-1]["text"]
            sentiment_status = analyze_customer_sentiment(last_customer_msg)
            
            # Find matching lead by phone
            phone = chat_id.replace("@c.us", "").replace("@lid", "")
            
            for lead in leads:
                lead_phone = str(lead.get("Phone", "")).replace("+", "").replace(" ", "").replace("-", "")
                if phone in lead_phone or lead_phone in phone:
                    old_status = lead.get("WhatsApp Status", "Not Sent")
                    if sentiment_status != old_status:
                        lead["WhatsApp Status"] = sentiment_status
                        print(f"✅ Updated: {lead.get('Company Name')} → {sentiment_status} (was: {old_status})")
                        print(f"   Last message: '{last_customer_msg}'")
                        updated_count += 1
                    break

# Save updated leads
if updated_count > 0:
    with open(leads_path, "w", encoding="utf-8") as f:
        json.dump(leads, f, ensure_ascii=False, indent=2)
    print(f"\n📊 Total updated: {updated_count} leads")
else:
    print("\n📊 No leads needed updating")
