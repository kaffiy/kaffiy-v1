
import json
import os
import datetime
from collections import Counter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "kaffiy-growth-dashboard", "kaffiy-growth-hub-main", "src", "data")
LEADS_PATH = os.path.join(DATA_DIR, "leads_data.json")
STATS_PATH = os.path.join(DATA_DIR, "bot_stats.json")
SENT_MSGS_PATH = os.path.join(DATA_DIR, "sent_messages.json")

def update_stats():
    print("Updating stats...")
    
    if not os.path.exists(LEADS_PATH):
        print("No leads data found.")
        return

    try:
        with open(LEADS_PATH, "r", encoding="utf-8") as f:
            leads = json.load(f)
    except Exception as e:
        print(f"Error reading leads: {e}")
        leads = []

    # Funnel Calculation
    total = len(leads)
    contacted = 0
    interested = 0
    converted = 0
    
    # Strategy Performance
    strategy_stats = {"A": {"sent": 0, "interested": 0}, "B": {"sent": 0, "interested": 0}, 
                      "C": {"sent": 0, "interested": 0}, "D": {"sent": 0, "interested": 0}}
    
    for lead in leads:
        # Check all status fields
        p_status = str(lead.get("Phone Status", "")).strip()
        w_status = str(lead.get("WhatsApp Status", "")).strip()
        l_status = str(lead.get("Lead Status", "")).strip()
        
        # Determine effective status (if any is Sent/Interested etc)
        is_contacted = False
        is_interested = False
        is_converted = False
        
        statuses = [p_status, w_status, l_status]
        
        for s in statuses:
            if s in ["Sent", "Accepted", "Rejected", "Pending", "Interested", "Converted", "Following Up"]:
                is_contacted = True
            if "Interested" in s or s == "Accepted" or "Demo" in s:
                is_interested = True
            if "Converted" in s or "Sale" in s:
                is_converted = True
                
        if lead.get("Last_Action") in ["Automated_Sent", "Manual_Sent"]:
            is_contacted = True

        if is_contacted: contacted += 1
        if is_interested: interested += 1
        if is_converted: converted += 1
            
        # Strategy Analysis
        strat = lead.get("Active Strategy", "A")
        if strat in strategy_stats and is_contacted:
            strategy_stats[strat]["sent"] += 1
            if is_interested:
                strategy_stats[strat]["interested"] += 1

    # AI Learning Insights
    insights = []
    
    # generate insights based on data
    best_strat = max(strategy_stats.items(), key=lambda x: (x[1]['interested'] / max(1, x[1]['sent'])))
    if best_strat[1]['sent'] > 0:
        rate = (best_strat[1]['interested'] / best_strat[1]['sent']) * 100
        insights.append({
            "title": "🏆 En İyi Strateji",
            "insight": f"Strateji {best_strat[0]}, %{rate:.1f} dönüşüm oranıyla en verimli yaklaşım."
        })
    else:
        insights.append({
            "title": "📊 Veri Toplanıyor",
            "insight": "Henüz yeterli strateji verisi oluşmadı."
        })
        
    if interested > 0:
        insights.append({
            "title": "🎯 İlgi Oranı",
            "insight": f"Ulaşılan müşterilerin %{(interested/max(1, contacted))*100:.1f}'i olumlu dönüş yaptı."
        })

    # Read existing stats
    existing_stats = {}
    if os.path.exists(STATS_PATH):
        try:
            with open(STATS_PATH, "r", encoding="utf-8") as f:
                existing_stats = json.load(f)
        except:
            pass
            
    # Load recent conversations from sent_messages.json
    last_conversations = []
    if os.path.exists(SENT_MSGS_PATH):
        try:
            with open(SENT_MSGS_PATH, "r", encoding="utf-8") as f:
                sent_msgs = json.load(f)
                # Take last 5, reverse order
                recent = sent_msgs[-5:]
                recent.reverse()
                for m in recent:
                    last_conversations.append({
                        "cafe": m.get("companyName", "Kafe"),
                        "message": m.get("message", "")[:60] + "...",
                        "time": m.get("sentAt", "")
                    })
        except Exception as e:
            print(f"Error reading sent logs: {e}")

    if not last_conversations:
        last_conversations = existing_stats.get("last_conversations", [])
            
    # Update structure
    new_stats = {
        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "bot_status": existing_stats.get("bot_status", "idle"),
        "funnel": {
            "total_leads": total,
            "contacted": contacted,
            "interested": interested,
            "converted": converted
        },
        "ai_log": existing_stats.get("ai_log", []),
        "last_conversations": last_conversations,
        "ai_learning": insights
    }
    
    try:
        with open(STATS_PATH, "w", encoding="utf-8") as f:
            json.dump(new_stats, f, indent=2, ensure_ascii=False)
        print("Stats updated successfully.")
    except Exception as e:
        print(f"Error writing stats: {e}")

if __name__ == "__main__":
    update_stats()
