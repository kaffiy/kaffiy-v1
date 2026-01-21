import { useState, useEffect } from "react";
import { Activity, Coffee, Gift, User, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FeedItem {
  id: string;
  type: "stamp" | "reward" | "visit";
  customerName: string;
  stampCount?: number;
  timestamp: Date;
  highlight?: boolean;
}

const generateMockFeed = (): FeedItem[] => [
  { id: "1", type: "stamp", customerName: "Ahmet Y.", stampCount: 9, timestamp: new Date(Date.now() - 2 * 60000), highlight: true },
  { id: "2", type: "reward", customerName: "Selin K.", timestamp: new Date(Date.now() - 8 * 60000), highlight: true },
  { id: "3", type: "stamp", customerName: "Mehmet S.", stampCount: 3, timestamp: new Date(Date.now() - 15 * 60000) },
  { id: "4", type: "visit", customerName: "Zeynep A.", timestamp: new Date(Date.now() - 22 * 60000) },
  { id: "5", type: "stamp", customerName: "Can B.", stampCount: 8, timestamp: new Date(Date.now() - 35 * 60000) },
];

// Check if customer is close to free coffee (8 or 9 stamps)
const isCloseToReward = (stampCount?: number) => stampCount && stampCount >= 8;

const getTimeAgo = (date: Date) => {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "şimdi";
  if (minutes < 60) return `${minutes}dk`;
  return `${Math.floor(minutes / 60)}sa`;
};

const getIcon = (type: FeedItem["type"]) => {
  switch (type) {
    case "stamp": return Coffee;
    case "reward": return Gift;
    case "visit": return User;
  }
};

export const LiveFeed = () => {
  const [feed, setFeed] = useState<FeedItem[]>(generateMockFeed());
  const [isLive] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setFeed(prev => prev.map(item => ({ ...item })));
    }, 60000);
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden h-full flex flex-col">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-success" />
              </div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                Canlı Akış
                {isLive && <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">{feed.length}</span>
              {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-1.5 max-h-[220px] overflow-y-auto">
            {feed.map((item, index) => {
              const Icon = getIcon(item.type);
              const closeToReward = isCloseToReward(item.stampCount);
              
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-2.5 p-2 rounded-lg transition-all relative",
                    closeToReward 
                      ? "bg-gradient-to-r from-gold/15 to-gold/5 ring-1 ring-gold/30 shadow-[0_0_12px_rgba(212,175,55,0.15)]" 
                      : item.highlight 
                        ? "bg-gold/5" 
                        : "bg-muted/20",
                    index === 0 && "animate-fade-in"
                  )}
                >
                  {/* Glow effect for close to reward */}
                  {closeToReward && (
                    <div className="absolute inset-0 rounded-lg bg-gold/5 animate-pulse pointer-events-none" />
                  )}
                  
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 relative z-10",
                    closeToReward 
                      ? "bg-gold/20 ring-1 ring-gold/40" 
                      : item.type === "reward" 
                        ? "bg-gold/10" 
                        : item.type === "stamp" 
                          ? "bg-sage/10" 
                          : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "w-3 h-3",
                      closeToReward 
                        ? "text-gold" 
                        : item.type === "reward" 
                          ? "text-gold" 
                          : item.type === "stamp" 
                            ? "text-sage-dark" 
                            : "text-muted-foreground"
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex items-center justify-between relative z-10">
                    <p className="text-[11px] lg:text-xs text-foreground truncate">
                      <span className={cn(
                        "font-medium",
                        closeToReward && "text-gold font-semibold"
                      )}>{item.customerName}</span>
                      {item.type === "stamp" && item.stampCount && (
                        <span className={cn(
                          closeToReward ? "text-gold font-semibold" : "text-muted-foreground"
                        )}> • {item.stampCount}/10 ☕</span>
                      )}
                      {closeToReward && (
                        <span className="ml-1 text-[9px] bg-gradient-to-r from-[#FF8C42]/20 to-gold/20 text-[#D2691E] px-2 py-0.5 rounded-full font-semibold animate-pulse border border-[#FF8C42]/30">
                          🔥 Hediyeye Çok Yakın!
                        </span>
                      )}
                      {item.type === "reward" && <span className="text-gold"> 🎁</span>}
                      {item.type === "visit" && <span className="text-muted-foreground"> yeni</span>}
                    </p>
                    <span className="text-[10px] text-muted-foreground ml-2">{getTimeAgo(item.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
