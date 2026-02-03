import json
import os

stats_path = "c:\\Users\\gokce\\OneDrive\\Desktop\\KAFFIY_PROJECT\\Kaffiy-Lead-Generator\\kaffiy-growth-dashboard\\src\\data\\bot_stats.json"
examples_path = "c:\\Users\\gokce\\OneDrive\\Desktop\\KAFFIY_PROJECT\\Kaffiy-Lead-Generator\\kaffiy-growth-dashboard\\src\\data\\correct_examples.json"

try:
    with open(examples_path, "r", encoding="utf-8") as f:
        clean_examples = json.load(f)
    
    with open(stats_path, "r", encoding="utf-8") as f:
        stats = json.load(f)
        
    stats["learned_behaviors"] = clean_examples
    
    with open(stats_path, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
        
    print("Successfully cleaned bot_stats.json")
except Exception as e:
    print(f"Error: {e}")
