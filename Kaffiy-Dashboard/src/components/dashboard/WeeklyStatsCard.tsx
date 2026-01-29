import { useState } from "react";
import { Users, UserCheck, UserPlus, TrendingUp, Calendar, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardDateRange } from "@/contexts/DashboardDateRangeContext";

type TabType = "thisWeek" | "nextWeek";

interface PredictiveAnalyticsProps {
  predictedVisits?: number;
  confidence?: number;
  peakDay?: string;
  peakHour?: string;
}

export const WeeklyStatsCard = ({
  predictedVisits = 120,
  confidence = 85,
  peakDay = "Cumartesi",
  peakHour = "14:00-16:00"
}: PredictiveAnalyticsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("thisWeek");
  const { isCustomRange, rangeDays } = useDashboardDateRange();

  // Last week same day comparison
  const scaleValue = (value: number) => Math.round(value * rangeDays);
  const lastWeekSameDay = isCustomRange ? scaleValue(38) : 38;
  const todayVisits = isCustomRange ? scaleValue(45) : 45;
  const comparisonPercent = Math.round(((todayVisits - lastWeekSameDay) / lastWeekSameDay) * 100);
  const dayName = "Salı";
  const returningCount = isCustomRange ? scaleValue(32) : 32;
  const newCount = isCustomRange ? scaleValue(13) : 13;
  const predictedVisitCount = isCustomRange ? scaleValue(predictedVisits) : predictedVisits;
  const nextReturningCount = isCustomRange ? scaleValue(78) : 78;
  const nextNewCount = isCustomRange ? scaleValue(42) : 42;

  const thisWeekStats = [
    {
      label: "Bugün",
      value: todayVisits,
      icon: Users,
      trend: { value: comparisonPercent, isPositive: comparisonPercent > 0 },
      color: "text-primary"
    },
    {
      label: "Dönen",
      value: returningCount,
      icon: UserCheck,
      color: "text-sage-dark"
    },
    {
      label: "Yeni",
      value: newCount,
      icon: UserPlus,
      color: "text-gold"
    }
  ];

  const nextWeekStats = [
    {
      label: "Tahmini",
      value: predictedVisitCount,
      icon: Sparkles,
      trend: { value: 8, isPositive: true },
      color: "text-sage-dark"
    },
    {
      label: "Dönen",
      value: nextReturningCount,
      icon: UserCheck,
      color: "text-sage-dark"
    },
    {
      label: "Yeni",
      value: nextNewCount,
      icon: UserPlus,
      color: "text-gold"
    }
  ];

  return (
    <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
      {/* Tab Buttons */}
      <div className="flex border-b border-border/30">
        <button
          onClick={() => setActiveTab("thisWeek")}
          className={cn(
            "flex-1 py-2.5 px-3 text-xs font-semibold transition-all",
            activeTab === "thisWeek"
              ? "bg-primary/10 text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
          )}
        >
          Bu Hafta
        </button>
        <button
          onClick={() => setActiveTab("nextWeek")}
          className={cn(
            "flex-1 py-2.5 px-3 text-xs font-semibold transition-all",
            activeTab === "nextWeek"
              ? "bg-sage/10 text-sage-dark border-b-2 border-sage"
              : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
          )}
        >
          Gelecek Hafta
        </button>
      </div>

      {/* Content - Side by Side */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Left Side - This Week Stats */}
          <div className={cn(
            "space-y-2 transition-all duration-300 relative",
            activeTab === "thisWeek" 
              ? "opacity-100" 
              : "opacity-30 blur-[1px] pointer-events-none"
          )}>
            {thisWeekStats.map((stat, index) => (
              <div 
                key={stat.label}
                className="flex items-center justify-between py-0.5"
              >
                <div className="flex items-center gap-2">
                  <stat.icon className={cn(
                    "w-3.5 h-3.5 transition-colors",
                    activeTab === "thisWeek" ? stat.color : "text-muted-foreground/50"
                  )} />
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <span className="text-base font-semibold text-foreground">
                  {stat.value}
                </span>
              </div>
            ))}
            
            {/* Motivational message under left column */}
            {activeTab === "thisWeek" && (
              <div className="pt-1">
                <div className="text-[9px] text-center py-1 px-2 rounded-md bg-success/10 text-success font-medium">
                  ✨ Geçen {dayName}'ya göre %{Math.abs(comparisonPercent)} {comparisonPercent > 0 ? "daha iyi" : "düşük"}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Next Week Predictions */}
          <div className={cn(
            "space-y-2 transition-all duration-300 border-l border-border/20 pl-3 relative",
            activeTab === "nextWeek" 
              ? "opacity-100" 
              : "opacity-30 blur-[1px] pointer-events-none"
          )}>
            {nextWeekStats.map((stat) => (
              <div 
                key={stat.label}
                className="flex items-center justify-between py-0.5"
              >
                <div className="flex items-center gap-2">
                  <stat.icon className={cn(
                    "w-3.5 h-3.5 transition-colors",
                    activeTab === "nextWeek" ? stat.color : "text-muted-foreground/50"
                  )} />
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <span className={cn(
                  "text-base font-semibold transition-colors",
                  activeTab === "nextWeek" ? "text-sage-dark" : "text-muted-foreground"
                )}>
                  {stat.value}
                </span>
              </div>
            ))}
            
            {/* Operational Insight Box */}
            {activeTab === "nextWeek" && (
              <div className="mt-3 pt-3 border-t border-border/20">
                <div className="bg-gradient-to-r from-sage/10 to-primary/5 rounded-lg p-2.5 border border-sage/20">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-sage-dark mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-foreground font-medium leading-tight">
                        Gelecek hafta {peakDay} günü {peakHour} saatlerinde %15 yoğunluk artışı bekleniyor
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};