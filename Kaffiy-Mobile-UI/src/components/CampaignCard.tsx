import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface CampaignCardProps {
  title: string;
  description?: string;
  highlight?: string;
  onClick?: () => void;
  compact?: boolean;
}

const CampaignCard = ({ title, description, highlight, onClick, compact = false }: CampaignCardProps) => {
  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-secondary/50",
          "transition-all duration-200 hover:bg-secondary",
          "active:scale-[0.98] text-left"
        )}
      >
        <span className="text-sm text-foreground line-clamp-1">{title}</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl bg-campaign-bg border border-campaign-border",
        "transition-all duration-200 hover:shadow-card hover:border-primary/30",
        "active:scale-[0.98]"
      )}
    >
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {highlight && (
          <span className="inline-block mt-1 text-sm font-medium text-accent">
            {highlight}
          </span>
        )}
      </div>
    </button>
  );
};

export default CampaignCard;
