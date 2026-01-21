import { AreaChart, Area, XAxis, ResponsiveContainer, Bar, ComposedChart } from "recharts";

type PeriodType = "daily" | "weekly" | "monthly";

const periodData = {
  daily: {
    label: "Günlük Dağılım",
    data: [
      { time: "8 AM", visits: 3, current: 0 },
      { time: "10 AM", visits: 6, current: 0 },
      { time: "12 PM", visits: 8, current: 0 },
      { time: "2 PM", visits: 11, current: 0 },
      { time: "4 PM", visits: 9, current: 0 },
      { time: "6 PM", visits: 5, current: 0 },
      { time: "Şu an", visits: 0, current: 3 },
    ]
  },
  weekly: {
    label: "Haftalık Dağılım",
    data: [
      { time: "Pzt", visits: 42, current: 0 },
      { time: "Sal", visits: 38, current: 0 },
      { time: "Çar", visits: 45, current: 0 },
      { time: "Per", visits: 52, current: 0 },
      { time: "Cum", visits: 48, current: 0 },
      { time: "Cmt", visits: 55, current: 0 },
      { time: "Paz", visits: 32, current: 0 },
    ]
  },
  monthly: {
    label: "Aylık Dağılım",
    data: [
      { time: "1.H", visits: 280, current: 0 },
      { time: "2.H", visits: 320, current: 0 },
      { time: "3.H", visits: 290, current: 0 },
      { time: "4.H", visits: 358, current: 0 },
    ]
  }
};

interface DailyVisitsChartProps {
  period?: PeriodType;
  customData?: { label: string; data: { time: string; visits: number; current: number }[] };
}

export const DailyVisitsChart = ({ period = "daily", customData }: DailyVisitsChartProps) => {
  const chartData = customData ?? periodData[period];
  const gradientId = `visitGradient-${period}`;

  return (
    <div className="stat-card">
      <p className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase mb-1">
        Tekil Ziyaretler
      </p>
      <p className="text-lg font-semibold text-foreground mb-3">
        {chartData.label}
      </p>
      
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData.data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(72, 22%, 38%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(72, 22%, 38%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 8, fill: 'hsl(25, 12%, 55%)' }}
              interval={period === "daily" ? 1 : 0}
              dy={3}
            />
            <Area 
              type="monotone"
              dataKey="visits"
              stroke="hsl(72, 22%, 38%)"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
            />
            <Bar 
              dataKey="current"
              fill="hsl(35, 30%, 55%)"
              radius={[3, 3, 0, 0]}
              barSize={16}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
