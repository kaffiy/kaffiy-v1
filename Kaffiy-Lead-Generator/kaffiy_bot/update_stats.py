import sys
import os

# Add the current directory to path so we can import kaffiy_ai_marketer
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from kaffiy_ai_marketer import load_dashboard_leads, update_bot_stats_file

if __name__ == "__main__":
    print("🔄 Updating bot_stats.json manually...")
    leads = load_dashboard_leads()
    update_bot_stats_file(leads)
    print("✅ Done! Check the AI Learning Center now.")
