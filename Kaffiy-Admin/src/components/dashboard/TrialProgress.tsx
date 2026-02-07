import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TrialProgressProps {
  current: number;
  limit: number;
}

export const TrialProgress = ({ current, limit }: TrialProgressProps) => {
  const navigate = useNavigate();
  const percentage = (current / limit) * 100;
  const isCritical = current >= 48;
  const isNearingLimit = current >= 40;

  const getProgressColor = () => {
    if (current >= limit) return "[&>div]:bg-destructive";
    if (isCritical) return "[&>div]:bg-gradient-to-r [&>div]:from-destructive [&>div]:to-destructive/80";
    if (isNearingLimit) return "[&>div]:bg-gradient-to-r [&>div]:from-gold [&>div]:to-terracotta";
    return "";
  };

  return (
    <div className={cn(
      "rounded-2xl p-4 transition-all duration-500",
      isCritical
        ? "bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent border border-destructive/30"
        : isNearingLimit 
          ? "bg-gradient-to-r from-gold/10 via-gold/5 to-transparent border border-gold/20" 
          : "bg-card/60 border border-border/50"
    )}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Crown className={cn(
            "w-4 h-4",
            isCritical ? "text-destructive" : isNearingLimit ? "text-gold" : "text-gold/60"
          )} />
          <span className="text-xs text-muted-foreground font-medium">Müşteri Limiti</span>
        </div>
        
        {isCritical && (
          <div className="flex items-center gap-1 text-destructive text-[11px] font-medium animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{limit - current} kaldı!</span>
          </div>
        )}
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-baseline gap-1 mb-2 cursor-help">
              <span className={cn(
                "text-2xl font-bold font-serif tracking-tight transition-colors",
                isCritical ? "text-destructive" : isNearingLimit ? "text-gold" : "text-foreground"
              )}>
                {current}
              </span>
              <span className="text-sm text-muted-foreground font-normal">/ {limit}</span>
            </div>
          </TooltipTrigger>
          {isCritical && (
            <TooltipContent className="rounded-xl shadow-lg bg-card border border-destructive/20 max-w-[200px]">
              <p className="text-xs font-medium text-foreground">
                Kritik Sınır! Ücretsiz dönemin bitmesine son {limit - current} müşteri kaldı
              </p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      <Progress value={percentage} className={cn("h-1.5 transition-all", getProgressColor())} />
      
      <Button 
        onClick={() => navigate("/settings?tab=billing")}
        className={cn(
          "w-full mt-3 h-8 text-xs font-semibold rounded-lg transition-all relative overflow-hidden group",
          isCritical 
            ? "bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive hover:to-destructive text-destructive-foreground" 
            : "bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary text-primary-foreground"
        )}
      >
        <span className="relative z-10 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Premium'a Geç
        </span>
        {isCritical && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        )}
      </Button>
      
      {!isCritical && (
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Premium'a yükselterek sınırsız müşteri ekleyin
        </p>
      )}
    </div>
  );
};