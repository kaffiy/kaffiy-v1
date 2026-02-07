import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { cn } from "@/lib/utils";
import { useDashboardDateRange } from "@/contexts/DashboardDateRangeContext";

// Haftalık veri
const weeklyData = [
  { day: "Pzt", visits: 42 },
  { day: "Sal", visits: 38 },
  { day: "Çar", visits: 45 },
  { day: "Per", visits: 52 },
  { day: "Cum", visits: 48 },
  { day: "Cmt", visits: 55 },
  { day: "Paz", visits: 32 },
];

export const VisitAnalysisCard = () => {
  const returningCustomerRate = 65; // Geri gelen müşteri oranı %
  const { isCustomRange, rangeDays } = useDashboardDateRange();
  const multiplier = isCustomRange ? rangeDays / 7 : 1;
  const chartData = weeklyData.map((item) => ({
    ...item,
    visits: Math.round(item.visits * multiplier),
  }));

  return (
    <div 
      className="relative rounded-3xl p-6 lg:p-7 backdrop-blur-xl transition-all duration-300 hover:shadow-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        border: '1px solid rgba(226, 232, 240, 0.6)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 0 rgba(255, 255, 255, 0.8) inset',
      }}
    >
      <h3 className="text-xl font-semibold text-foreground mb-7 tracking-tight">Ziyaret Analizi</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Grafik */}
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold text-foreground/80 uppercase tracking-wide mb-5">
            {isCustomRange ? "Seçili Aralık Ziyaret Trendi" : "Haftalık Ziyaret Trendi"}
          </p>
          <div className="h-72 rounded-2xl bg-muted/10 p-4 border border-border/40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0, 0%, 40%)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="hsl(0, 0%, 40%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(0, 0%, 45%)', fontWeight: 500 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(0, 0%, 45%)', fontWeight: 500 }}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    padding: '8px 12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  name="Ziyaretler"
                  stroke="hsl(0, 0%, 30%)"
                  strokeWidth={3}
                  fill="url(#visitGradient)"
                  dot={{ r: 5, fill: 'hsl(0, 0%, 30%)', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ 
                    r: 8, 
                    fill: '#C2410C',
                    stroke: '#fff',
                    strokeWidth: 3,
                    style: { filter: 'drop-shadow(0 0 8px rgba(194, 65, 12, 0.6))' }
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geri Gelen Müşteri Oranı */}
        <div className="flex flex-col justify-center items-center lg:items-start">
          <div className="w-full p-6 rounded-2xl bg-muted/20 border border-border/40">
            <p className="text-sm font-semibold text-foreground/80 uppercase tracking-wide mb-4 text-center lg:text-left">Geri Gelen Müşteri</p>
            <div className="text-center lg:text-left">
              <p className="text-6xl font-bold text-foreground mb-3 tabular-nums tracking-tight">{returningCustomerRate}%</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Müşterilerinizin %{returningCustomerRate}'i tekrar ziyaret ediyor
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
