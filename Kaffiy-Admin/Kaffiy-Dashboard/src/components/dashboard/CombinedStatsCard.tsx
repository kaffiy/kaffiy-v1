import { useState } from "react";
import { Users, UserCheck, UserPlus, ChevronDown, ChevronUp, Stamp, Gift, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
}

interface ActivityItem {
  label: string;
  value: number;
  icon: React.ElementType;
}

export const CombinedStatsCard = () => {
  const [isOpen, setIsOpen] = useState(false);

  const stats: StatItem[] = [
    {
      label: "Bugünün Ziyaretleri",
      value: 45,
      icon: Users,
      trend: { value: 12, isPositive: true }
    },
    {
      label: "Geri Dönenler",
      value: 32,
      icon: UserCheck
    },
    {
      label: "Yeni Müşteriler",
      value: 13,
      icon: UserPlus
    }
  ];

  const activities: ActivityItem[] = [
    { label: "Puan Kullanıldı", value: 23, icon: Stamp },
    { label: "Ödül Kullanıldı", value: 4, icon: Gift },
    { label: "QR Tarama", value: 31, icon: QrCode },
  ];

  return (
    <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-4 lg:p-5">
      {/* Stats Row */}
      <div className="grid grid-cols-3 divide-x divide-border/50">
        {stats.map((stat, index) => (
          <div 
            key={stat.label}
            className={cn(
              "flex flex-col",
              index === 0 ? "pr-3 lg:pr-6" : index === 1 ? "px-3 lg:px-6" : "pl-3 lg:pl-6"
            )}
          >
            <div className="flex items-center justify-between mb-1 lg:mb-2">
              <span className="text-[10px] lg:text-xs font-medium text-muted-foreground uppercase tracking-wide line-clamp-1">
                {stat.label}
              </span>
              <stat.icon className="w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground/60 hidden sm:block" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <span className="text-2xl lg:text-3xl font-bold font-serif text-foreground">
                {stat.value}
              </span>
              {stat.trend && (
                <span className={cn(
                  "text-[10px] lg:text-xs font-medium px-1.5 py-0.5 rounded w-fit",
                  stat.trend.isPositive 
                    ? "text-success bg-success/10" 
                    : "text-destructive bg-destructive/10"
                )}>
                  {stat.trend.isPositive ? "↑" : "↓"} {stat.trend.value}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Collapsible Activities Section */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full mt-4 pt-3 border-t border-border/30">
          <div className="flex items-center justify-between cursor-pointer group">
            <span className="text-[10px] lg:text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Bugünkü Hareketler
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground/60">
                {activities.reduce((acc, a) => acc + a.value, 0)} işlem
              </span>
              {isOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-3 space-y-2">
            {activities.map((activity) => (
              <div 
                key={activity.label}
                className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-muted/40 flex items-center justify-center">
                    <activity.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{activity.label}</span>
                </div>
                <span className="text-sm font-bold font-serif text-foreground">{activity.value}</span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};