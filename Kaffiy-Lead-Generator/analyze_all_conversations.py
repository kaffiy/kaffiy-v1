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

print("=" * 60)
print("📊 WHATSAPP KONUŞMA ANALİZİ")
print("=" * 60)

# Analyze all conversations
results = {
    "Accepted": [],
    "Rejected": [],
    "Pending": [],
    "No Response": []
}

for chat_id, conv_data in conversations.items():
    if isinstance(conv_data, dict) and "history" in conv_data:
        # Get all customer messages
        customer_messages = [msg for msg in conv_data["history"] if msg.get("sender") == "customer"]
        
        if customer_messages:
            # Analyze last customer message
            last_msg = customer_messages[-1]
            last_text = last_msg["text"]
            sentiment = analyze_customer_sentiment(last_text)
            
            # Find matching lead
            phone = chat_id.replace("@c.us", "").replace("@lid", "")
            lead_name = "Unknown"
            lead_obj = None
            
            for lead in leads:
                lead_phone = str(lead.get("Phone", "")).replace("+", "").replace(" ", "").replace("-", "")
                if phone in lead_phone or lead_phone in phone:
                    lead_name = lead.get("Company Name", "Unknown")
                    lead_obj = lead
                    
                    # Update WhatsApp Status
                    old_status = lead.get("WhatsApp Status", "Not Sent")
                    if sentiment != old_status:
                        lead["WhatsApp Status"] = sentiment
                    break
            
            results[sentiment].append({
                "name": lead_name,
                "phone": phone,
                "last_message": last_text,
                "timestamp": last_msg.get("timestamp", "")
            })
        else:
            # No customer response yet
            phone = chat_id.replace("@c.us", "").replace("@lid", "")
            lead_name = "Unknown"
            
            for lead in leads:
                lead_phone = str(lead.get("Phone", "")).replace("+", "").replace(" ", "").replace("-", "")
                if phone in lead_phone or lead_phone in phone:
                    lead_name = lead.get("Company Name", "Unknown")
                    break
            
            results["No Response"].append({
                "name": lead_name,
                "phone": phone
            })

# Print results
print("\n✅ OLUMLU CEVAPLAR (Accepted):")
print("-" * 60)
for item in results["Accepted"]:
    print(f"  • {item['name']}")
    print(f"    Son mesaj: '{item['last_message']}'")
    print()

print("\n❌ OLUMSUZ CEVAPLAR (Rejected):")
print("-" * 60)
for item in results["Rejected"]:
    print(f"  • {item['name']}")
    print(f"    Son mesaj: '{item['last_message']}'")
    print()

print("\n⏳ KARARSIZ/BELİRSİZ (Pending):")
print("-" * 60)
for item in results["Pending"]:
    print(f"  • {item['name']}")
    print(f"    Son mesaj: '{item['last_message']}'")
    print()

print("\n📭 HENÜZ CEVAP YOK (No Response):")
print("-" * 60)
for item in results["No Response"]:
    print(f"  • {item['name']}")
print()

# Save updated leads
with open(leads_path, "w", encoding="utf-8") as f:
    json.dump(leads, f, ensure_ascii=False, indent=2)

# Summary
print("=" * 60)
print("📊 ÖZET:")
print("=" * 60)
print(f"  ✅ Olumlu (Accepted):     {len(results['Accepted'])}")
print(f"  ❌ Olumsuz (Rejected):    {len(results['Rejected'])}")
print(f"  ⏳ Kararsız (Pending):    {len(results['Pending'])}")
print(f"  📭 Cevap Yok:             {len(results['No Response'])}")
print()

if results["Rejected"]:
    print("⚠️  UYARI: Olumsuz cevaplar tespit edildi!")
    print("   Bot mesaj stratejisini revize etmeli.")
    print("   Bu müşteriler artık 'Rejected' olarak işaretlendi.")
    print("   Bot bir daha ısrar etmeyecek.")
print()
print("✅ Tüm WhatsApp Status'ları güncellendi!")
print("=" * 60)
