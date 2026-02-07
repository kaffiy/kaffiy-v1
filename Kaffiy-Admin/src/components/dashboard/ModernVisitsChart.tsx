import { useState, useRef, useEffect } from "react";
import { TrendingUp, Maximize2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

type PeriodType = "daily" | "weekly" | "monthly";

// Modern gradient colors - Consistent with theme
const gradientColors = {
  primary: {
    start: "#6366f1",
    end: "#818cf8",
    fill: "url(#primaryGradient)"
  },
  success: {
    start: "#10b981",
    end: "#34d399",
    fill: "url(#successGradient)"
  },
  warning: {
    start: "#f59e0b",
    end: "#fbbf24",
    fill: "url(#warningGradient)"
  }
};

const periodData = {
  daily: {
    label: "Bugünkü",
    compareLabel: "Dün",
    visits: 45,
    compareVisits: 40,
    returning: 70,
    new: 30,
    chartData: [
      { time: "8", visits: 3 },
      { time: "10", visits: 6 },
      { time: "12", visits: 8 },
      { time: "14", visits: 11, isPeak: true },
      { time: "16", visits: 9 },
      { time: "18", visits: 5 },
      { time: "20", visits: 3 },
    ]
  },
  weekly: {
    label: "Bu Haftaki",
    compareLabel: "Geçen Hafta",
    visits: 312,
    compareVisits: 285,
    returning: 65,
    new: 35,
    chartData: [
      { time: "Pzt", visits: 42 },
      { time: "Sal", visits: 38 },
      { time: "Çar", visits: 45 },
      { time: "Per", visits: 52, isPeak: true },
      { time: "Cum", visits: 48 },
      { time: "Cmt", visits: 41 },
      { time: "Paz", visits: 35 },
      { time: "Paz", visits: 11 },
    ]
  },
  monthly: {
    label: "Bu Ay",
    compareLabel: "Geçen Ay",
    visits: 1248,
    compareVisits: 1120,
    returning: 68,
    new: 32,
    chartData: [
      { time: "Hafta 1", visits: 280 },
      { time: "Hafta 2", visits: 310 },
      { time: "Hafta 3", visits: 295 },
      { time: "Hafta 4", visits: 320, isPeak: true },
      { time: "Hafta 5", visits: 285 },
      { time: "Hafta 6", visits: 265 },
      { time: "Hafta 7", visits: 293 },
    ]
  }
};

export const ModernVisitsChart = () => {
  const [period, setPeriod] = useState<PeriodType>("weekly");
  const currentData = periodData[period];
  const change = currentData.visits - currentData.compareVisits;
  const changePercent = currentData.compareVisits > 0 ? (change / currentData.compareVisits) * 100 : 0;
  const isPositive = change > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Ziyaret Grafiği</h2>
          <p className="text-sm text-gray-500">Müşteri ziyaret eğilimi</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">{currentData.label}:</span>
            <span className="text-2xl font-bold text-gray-900">
              {currentData.visits.toLocaleString()}
            </span>
            <div className="flex items-center gap-1 text-xs">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
              )}
              <span className={cn(
                "font-medium",
                isPositive ? "text-green-600" : "text-red-600"
              )}>
                {changePercent > 0 ? "+" : ""}{changePercent.toFixed(1)}%
              </span>
              <span className="text-gray-500">vs {currentData.compareLabel}</span>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center bg-gray-100 rounded-full p-0.5">
          {(["daily", "weekly", "monthly"] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200",
                period === p
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {p === "daily" ? "G" : p === "weekly" ? "H" : "A"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={currentData.chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientColors.primary.start} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={gradientColors.primary.end} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
                padding: "8px 12px"
              }}
              labelStyle={{ color: "#374151", fontWeight: 500 }}
              itemStyle={{ color: "#374151" }}
            />
            <Area
              type="monotone"
              dataKey="visits"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#primaryGradient)"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Yeni Müşterler</p>
          <p className="text-lg font-semibold text-gray-900">{currentData.new}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Geri Dönenler</p>
          <p className="text-lg font-semibold text-gray-900">{currentData.returning}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Ziyaret/Oran</p>
          <p className="text-lg font-semibold text-gray-900">
            {Math.round(currentData.visits / 8)}
          </p>
        </div>
      </div>
    </div>
  );
};
