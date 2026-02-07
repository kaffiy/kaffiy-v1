import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
}

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, className, delay = 0 }: StatCardProps) => {
  return (
    <div 
      className={cn("stat-card group", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wide uppercase text-[11px]">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-serif font-semibold text-foreground tracking-tight">{value}</p>
            {subtitle && (
              <span className="text-base text-muted-foreground font-medium">{subtitle}</span>
            )}
          </div>
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 mt-3 px-2.5 py-1 rounded-full text-xs font-semibold",
              trend.isPositive 
                ? "bg-success/10 text-success" 
                : "bg-destructive/10 text-destructive"
            )}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}% dünden</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="icon-container group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-5 h-5 text-olive-dark" />
          </div>
        )}
      </div>
    </div>
  );
};
