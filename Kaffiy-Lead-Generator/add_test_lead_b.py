
import json
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "kaffiy-growth-dashboard", "kaffiy-growth-hub-main", "src", "data")
LEADS_PATH = os.path.join(DATA_DIR, "leads_data.json")

def add_test_lead():
    if not os.path.exists(LEADS_PATH):
        print("Leads file not found!")
        return

    with open(LEADS_PATH, "r", encoding="utf-8") as f:
        leads = json.load(f)

    target_phone = "+491786784134"
    target_name = "Test Kafe B (Founder)"
    
    # Check if exists
    found = False
    for lead in leads:
        if lead.get("Phone") == target_phone:
            print(f"Updating existing lead: {target_phone}")
            lead["Company Name"] = target_name
            lead["Lead Type"] = "WhatsApp"
            lead["Phone Status"] = "New"
            lead["WhatsApp Status"] = ""
            lead["Lead Status"] = "New"
            lead["Active Strategy"] = "B"
            lead["Ready Message"] = "" # Clear ready message so it regenerates for Strategy B
            lead["Last_Action"] = ""
            found = True
            break
    
    if not found:
        print(f"Adding new lead: {target_phone}")
        new_lead = {
            "ID": "001_TEST_B",
            "Country": "DE",
            "City": "Berlin",
            "Company Name": target_name,
            "Phone": target_phone,
            "Lead Type": "WhatsApp",
            "Phone Status": "New",
            "WhatsApp Status": "",
            "Lead Status": "New",
            "Last Review": "Great coffee!",
            "Rating": "5",
            "Ready Message": "",
            "Message Flow": "Single",
            "Active Strategy": "B"
        }
        leads.insert(1, new_lead) # Insert at top (after 000)

    with open(LEADS_PATH, "w", encoding="utf-8") as f:
        json.dump(leads, f, indent=2, ensure_ascii=False)
    print("Done.")

if __name__ == "__main__":
    add_test_lead()
