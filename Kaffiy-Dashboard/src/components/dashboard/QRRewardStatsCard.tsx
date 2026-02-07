import { useState } from "react";
import { QrCode, Gift, CalendarIcon, Info } from "lucide-react";
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
import { ModernStatsCard } from "./ModernStatsCard";

type PeriodType = "daily" | "weekly" | "monthly";

const statsData = {
  daily: {
    visits: { value: 45, previous: 40, change: 12.5 },
    qrGiven: { value: 31, previous: 28, change: 10.7 },
    rewardUsed: { value: 5, previous: 3, change: 66.7 },
  },
  weekly: {
    visits: { value: 312, previous: 285, change: 9.5 },
    qrGiven: { value: 218, previous: 195, change: 11.8 },
    rewardUsed: { value: 34, previous: 28, change: 21.4 },
  },
  monthly: {
    visits: { value: 1248, previous: 1120, change: 11.4 },
    qrGiven: { value: 892, previous: 756, change: 18.0 },
    rewardUsed: { value: 142, previous: 128, change: 10.9 },
  },
};

export const QRRewardStatsCard = () => {
  const [period, setPeriod] = useState<PeriodType>("weekly");
  const [preset, setPreset] = useState<"daily" | "weekly" | "monthly" | "custom">("weekly");
  const [isCustomRange, setIsCustomRange] = useState(false);
  const { range, setRange } = useDashboardDateRange();

  const handleRangeSelect = (range: any) => {
    setRange(range);
    setIsCustomRange(true);
    setPeriod("daily");
    setPreset("custom");
  };

  const currentData = statsData[period];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">QR & Ödül İstatistikleri</h2>
          <p className="text-sm text-gray-500">Müşteri etkileşim metrikleri</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-7 rounded-full px-2 text-[11px] font-medium border-gray-200 bg-white hover:bg-gray-50",
                  isCustomRange && "text-indigo-600 border-indigo-200 bg-indigo-50"
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
          
          <div className="flex items-center bg-gray-100 rounded-full p-0.5">
            {(["daily", "weekly", "monthly"] as PeriodType[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPeriod(p);
                  setPreset(p as "daily" | "weekly" | "monthly");
                  setIsCustomRange(false);
                }}
                className={cn(
                  "w-7 h-7 rounded-full text-xs font-semibold transition-all duration-200",
                  period === p && !isCustomRange
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {p === "daily" ? "G" : p === "weekly" ? "H" : "A"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModernStatsCard 
          title="QR Kullanıldı"
          value={currentData.visits.value}
          change={currentData.visits.change}
          icon={QrCode}
          description="Müşteriler tarafından taranan QR kod sayısı"
          color="primary"
        />
        <ModernStatsCard 
          title="Kampanya Kullanıldı"
          value={currentData.qrGiven.value}
          change={currentData.qrGiven.change}
          icon={Gift}
          description="Kampanya kodlarının kullanım sayısı"
          color="success"
        />
        <ModernStatsCard 
          title="Ödül Verildi"
          value={currentData.rewardUsed.value}
          change={currentData.rewardUsed.change}
          icon={Gift}
          description="Müşterilerin kullandığı ödül sayısı"
          color="warning"
        />
      </div>
    </div>
  );
};
