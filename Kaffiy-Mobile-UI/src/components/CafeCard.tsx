import { cn } from "@/lib/utils";
import { HalicKahveLogo } from "./HalicKahveLogo";

interface CafeCardProps {
  name: string;
  visits: number;
  totalForReward: number;
  logoEmoji?: string;
  logoType?: string;
  onClick?: () => void;
  compact?: boolean;
}

const CafeCard = ({ name, visits, totalForReward, logoEmoji = "☕", logoType, onClick, compact = false }: CafeCardProps) => {
  const progress = (visits / totalForReward) * 100;
  
  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border min-w-[90px]",
          "transition-all duration-200 hover:shadow-card hover:border-primary/20",
          "active:scale-[0.98]"
        )}
      >
        {/* Logo */}
        <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-2xl overflow-hidden">
          {logoType === "halic" ? (
            <HalicKahveLogo size={56} />
          ) : (
            logoEmoji
          )}
        </div>
        
        {/* Name */}
        <p className="text-xs font-medium text-foreground text-center truncate w-full">
          {name}
        </p>
        
        {/* Mini Progress Bar */}
        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </button>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border",
        "transition-all duration-200 hover:shadow-card hover:border-primary/20",
        "active:scale-[0.98]"
      )}
    >
      {/* Logo */}
      <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0 overflow-hidden">
        {logoType === "halic" ? (
          <HalicKahveLogo size={56} />
        ) : (
          logoEmoji
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0 text-left">
        <h3 className="font-semibold text-foreground truncate">{name}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          {visits}/{totalForReward} ziyaret
        </p>
        {/* Mini Progress */}
        <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </button>
  );
};

export default CafeCard;
