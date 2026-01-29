import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type PeriodType = "daily" | "weekly" | "monthly";

const periodData = {
  daily: { returning: 70, new: 30 },
  weekly: { returning: 65, new: 35 },
  monthly: { returning: 72, new: 28 },
};

interface LoyaltyDonutProps {
  period?: PeriodType;
  customData?: { returning: number; new: number };
}

export const LoyaltyDonut = ({ period = "daily", customData }: LoyaltyDonutProps) => {
  const dataValues = customData ?? periodData[period];
  const data = [
    { name: "Geri Dönen", value: dataValues.returning, color: "hsl(72 22% 38%)" },
    { name: "Yeni", value: dataValues.new, color: "hsl(42 55% 55%)" },
  ];

  return (
    <div className="stat-card">
      <div className="mb-2">
        <p className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase mb-1">Geri Dönen vs Yeni</p>
        <p className="text-2xl font-serif font-semibold text-foreground">{dataValues.returning}% <span className="text-muted-foreground font-sans text-lg">/</span> {dataValues.new}%</p>
      </div>
      <div className="h-36 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/>
              </filter>
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
              filter="url(#shadow)"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(40 45% 99%)',
                border: '1px solid hsl(35 25% 88%)',
                borderRadius: '12px',
                boxShadow: '0 10px 40px -10px rgba(45, 40, 30, 0.15)',
                padding: '10px 14px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-1">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2.5">
            <div 
              className="w-3 h-3 rounded-full shadow-sm" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
