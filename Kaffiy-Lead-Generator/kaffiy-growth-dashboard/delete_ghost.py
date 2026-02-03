import json
import os

path = r"src\data\leads_data.json"

try:
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            leads = json.load(f)
        
        before = len(leads)
        # Delete specific ghost lead ID
        leads = [l for l in leads if str(l.get("ID")) != "G-1769879214"]
        after = len(leads)
        
        if before != after:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(leads, f, indent=4, ensure_ascii=False)
            print("Deleted ghost lead G-1769879214.")
        else:
            print("Ghost lead not found.")
    else:
        print("File not found")
except Exception as e:
    print(f"Error: {e}")
