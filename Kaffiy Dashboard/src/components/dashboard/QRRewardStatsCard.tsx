import { useState } from "react";
import { QrCode, Gift, TrendingUp, TrendingDown, Users, CalendarIcon, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useDashboardDateRange } from "@/contexts/DashboardDateRangeContext";

type PeriodType = "daily" | "weekly" | "monthly";

const statsData = {
  daily: {
    visits: { value: 45, previous: 40, label: "QR Kullanıldı" },
    qrGiven: { value: 31, previous: 28, label: "Kampanya Kullanıldı" },
    rewardUsed: { value: 5, previous: 3, label: "Ödül Verildi" },
  },
  weekly: {
    visits: { value: 312, previous: 285, label: "QR Kullanıldı" },
    qrGiven: { value: 218, previous: 195, label: "Kampanya Kullanıldı" },
    rewardUsed: { value: 34, previous: 28, label: "Ödül Verildi" },
  },
  monthly: {
    visits: { value: 1248, previous: 1120, label: "QR Kullanıldı" },
    qrGiven: { value: 892, previous: 756, label: "Kampanya Kullanıldı" },
    rewardUsed: { value: 142, previous: 128, label: "Ödül Verildi" },
  },
};

const StatCard = ({ 
  data, 
  icon: Icon, 
  iconColor, 
  gradientColor,
  iconTextColor,
  infoText,
}: { 
  data: { value: number; previous: number; label: string };
  icon: React.ElementType;
  iconColor: string;
  gradientColor: string;
  iconTextColor: string;
  infoText?: string;
}) => {
  const change = ((data.value - data.previous) / data.previous) * 100;
  const isPositive = change >= 0;

  return (
    <div className={cn(
      "rounded-xl p-4 border",
      gradientColor
    )}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          iconColor
        )}>
          <Icon className={cn("w-4 h-4", iconTextColor)} />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{data.label}</span>
        {infoText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground/70 hover:text-muted-foreground transition-colors"
                  aria-label="Bilgi"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {infoText}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold text-foreground">{data.value}</span>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium",
          isPositive ? "text-success" : "text-destructive"
        )}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{Math.abs(change).toFixed(1)}%</span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">Önceki: {data.previous}</p>
    </div>
  );
};

export const QRRewardStatsCard = () => {
  const [period, setPeriod] = useState<PeriodType>("daily");
  const { preset, setPreset, range, setRange, rangeDays, isCustomRange } = useDashboardDateRange();

  const scaleValue = (value: number) => Math.round(value * rangeDays);
  const customStats = {
    visits: {
      ...statsData.daily.visits,
      value: scaleValue(statsData.daily.visits.value),
      previous: scaleValue(statsData.daily.visits.previous),
    },
    qrGiven: {
      ...statsData.daily.qrGiven,
      value: scaleValue(statsData.daily.qrGiven.value),
      previous: scaleValue(statsData.daily.qrGiven.previous),
    },
    rewardUsed: {
      ...statsData.daily.rewardUsed,
      value: scaleValue(statsData.daily.rewardUsed.value),
      previous: scaleValue(statsData.daily.rewardUsed.previous),
    },
  };

  const activeStats = isCustomRange ? customStats : statsData[period];

  const handleRangeSelect = (selectedRange: { from?: Date; to?: Date } | undefined) => {
    setRange(selectedRange);
    setPreset("custom");
  };

  return (
    <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-4 lg:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">QR ve Ödül İstatistikleri</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-7 rounded-full px-2 text-[11px] font-medium border-border/60 bg-muted/30",
                  isCustomRange && "text-primary border-primary/40 bg-primary/10"
                )}
              >
                <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                {range?.from && range?.to
                  ? `${format(range.from, "d MMM", { locale: tr })} - ${format(range.to, "d MMM", { locale: tr })}`
                  : "Tarih Aralığı"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={range}
                onSelect={handleRangeSelect}
                numberOfMonths={2}
                locale={tr}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center bg-muted/40 rounded-full p-0.5">
          <button
            onClick={() => {
              setPeriod("daily");
              setPreset("daily");
            }}
            className={cn(
              "w-7 h-7 rounded-full text-xs font-semibold transition-all duration-200",
              period === "daily" && !isCustomRange
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            G
          </button>
          <button
            onClick={() => {
              setPeriod("weekly");
              setPreset("weekly");
            }}
            className={cn(
              "w-7 h-7 rounded-full text-xs font-semibold transition-all duration-200",
              period === "weekly" && !isCustomRange
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            H
          </button>
          <button
            onClick={() => {
              setPeriod("monthly");
              setPreset("monthly");
            }}
            className={cn(
              "w-7 h-7 rounded-full text-xs font-semibold transition-all duration-200",
              period === "monthly" && !isCustomRange
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            A
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          data={activeStats.visits}
          icon={Users}
          iconColor="bg-sage/20"
          gradientColor="bg-gradient-to-br from-sage/10 via-sage/5 to-transparent border-sage/20"
          iconTextColor="text-sage"
          infoText="QR okutmuş ziyaretçi sayısı"
        />
        <StatCard
          data={activeStats.qrGiven}
          icon={QrCode}
          iconColor="bg-primary/20"
          gradientColor="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20"
          iconTextColor="text-primary"
        />
        <StatCard
          data={activeStats.rewardUsed}
          icon={Gift}
          iconColor="bg-gold/20"
          gradientColor="bg-gradient-to-br from-gold/10 via-gold/5 to-transparent border-gold/20"
          iconTextColor="text-gold"
        />
      </div>
    </div>
  );
};
