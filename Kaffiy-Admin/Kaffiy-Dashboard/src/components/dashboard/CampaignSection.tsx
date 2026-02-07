import { useState } from "react";
import { Clock, Gift, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { CampaignFunnel } from "./CampaignFunnel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const CampaignSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="campaign-card">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-start gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Gift className="w-4 h-4 text-gold" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-semibold text-foreground text-sm">Özel Teklif</h4>
                <Sparkles className="w-3.5 h-3.5 text-gold" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                14:00–17:00 arası %10 indirim
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                <span className="text-xs font-medium">3 gün</span>
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          {/* Campaign Funnel */}
          <div className="mt-4 pt-4 border-t border-border/30">
            <CampaignFunnel />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};