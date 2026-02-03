import json
import os

stats_path = r"c:\Users\gokce\OneDrive\Desktop\KAFFIY_PROJECT\Kaffiy-Lead-Generator\kaffiy-growth-dashboard\src\data\bot_stats.json"

try:
    if os.path.exists(stats_path):
        with open(stats_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # WIPE ALL PENDING APPROVALS
        data["pending_approvals"] = []
        
        with open(stats_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        
        print("Success: All pending approvals cleared.")

except Exception as e:
    print(f"Error: {e}")
