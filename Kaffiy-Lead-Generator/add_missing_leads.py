import json
import os

# Paths
leads_path = "kaffiy-growth-dashboard/kaffiy-growth-hub-main/src/data/leads_data.json"

# Load existing leads
with open(leads_path, "r", encoding="utf-8") as f:
    leads = json.load(f)

# New leads to add
new_leads = [
    {
        "ID": "AUTO_001",
        "Company Name": "miam organizasyon, parti malzemeleri & cafe",
        "Phone": "+905447489558",
        "Lead Type": "WhatsApp",
        "Phone Status": "Sent",
        "WhatsApp Status": "Pending",
        "Lead Status": "Contacted",
        "Last_Action": "Greeting_Sent",
        "Active Strategy": "A",
        "City": "İstanbul",
        "Country": "TR"
    },
    {
        "ID": "AUTO_002",
        "Company Name": "SØLVI COFFEE CO.",
        "Phone": "+905352207038",
        "Lead Type": "WhatsApp",
        "Phone Status": "Sent",
        "WhatsApp Status": "Pending",
        "Lead Status": "Contacted",
        "Last_Action": "Greeting_Sent",
        "Active Strategy": "A",
        "City": "İstanbul",
        "Country": "TR"
    }
]

# Check if already exists
for new_lead in new_leads:
    phone = new_lead["Phone"]
    exists = any(l.get("Phone") == phone for l in leads)
    if not exists:
        leads.append(new_lead)
        print(f"✅ Added: {new_lead['Company Name']}")
    else:
        print(f"⏭️ Already exists: {new_lead['Company Name']}")

# Save
with open(leads_path, "w", encoding="utf-8") as f:
    json.dump(leads, f, ensure_ascii=False, indent=2)

print(f"\n📊 Total leads: {len(leads)}")
print(f"📤 Sent status: {len([l for l in leads if l.get('Phone Status') == 'Sent'])}")
