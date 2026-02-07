import { Lock, Crown, AlertTriangle, User, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePremium } from "@/contexts/PremiumContext";
import { useNavigate } from "react-router-dom";

export const LockedChurnAlert = () => {
  const { isPremium } = usePremium();
  const navigate = useNavigate();

  // If premium, show nothing (the real ChurnAlert will be shown instead)
  if (isPremium) return null;

  return (
    <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-4 overflow-hidden min-h-[160px]">
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[6px] z-10 flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-2">
          <Lock className="w-5 h-5 text-gold" />
        </div>
        <p className="text-xs font-semibold text-foreground mb-1">Otomatik Geri Kazanma</p>
        <p className="text-[10px] text-muted-foreground mb-3 text-center max-w-[200px]">
          Kayıp müşterilere otomatik kupon gönderin
        </p>
        <Button 
          size="sm" 
          className="bg-gold hover:bg-gold/90 text-gold-foreground text-xs h-8 px-4"
          onClick={() => navigate("/settings?tab=billing")}
        >
          <Crown className="w-3.5 h-3.5 mr-1.5" />
          Premium'a Geç
        </Button>
      </div>

      {/* Background content (blurred) */}
      <div className="opacity-30">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
          </div>
          <span className="text-xs font-medium">Geri Kazanma</span>
        </div>
        
        <div className="space-y-2">
          {["Ahmet Y.", "Elif K.", "Mehmet S."].map((name, i) => (
            <div key={name} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-[11px]">{name}</span>
              </div>
              <Send className="w-3 h-3 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
