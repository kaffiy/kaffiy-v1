import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Geri Dönen", value: 70 },
  { name: "Yeni", value: 30 },
];

const COLORS = ["hsl(35, 30%, 45%)", "hsl(35, 35%, 75%)"];

export const CustomerDonut = () => {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase mb-1">
            Geri Dönen vs Yeni
          </p>
          <p className="text-xl font-semibold text-foreground">
            70% <span className="text-muted-foreground font-normal">/</span> 30%
          </p>
        </div>
        
        <div className="w-20 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={22}
                outerRadius={35}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
