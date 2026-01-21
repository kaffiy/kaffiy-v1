import { useState } from "react";
import { Coffee, Croissant, CupSoda, Gift, ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const rewards = [
  { id: 1, name: "Ücretsiz Kahve", visits: 10, icon: Coffee, claimed: 34 },
  { id: 2, name: "Ücretsiz Kruvasan", visits: 5, icon: Croissant, claimed: 28 },
  { id: 3, name: "Mevsimlik İçecek", visits: 8, icon: CupSoda, claimed: 12 },
];

export const RewardsGrid = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="stat-card">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <h3 className="text-[10px] lg:text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Ödüller</h3>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-muted-foreground/50" />
              {isOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="space-y-2 lg:space-y-3 mt-3 lg:mt-4">
            {rewards.map((reward) => {
              const Icon = reward.icon;
              return (
                <div 
                  key={reward.id} 
                  className="flex items-center gap-2 lg:gap-3 p-2.5 lg:p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-sage/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-sage-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-xs lg:text-sm">{reward.name}</h4>
                    <p className="text-[10px] lg:text-xs text-muted-foreground">{reward.visits} puan</p>
                  </div>
                  <span className="text-xs lg:text-sm font-semibold text-foreground">{reward.claimed}</span>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
