import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';

const COLORS = [
  'hsl(30, 35%, 45%)',   // Coffee brown
  'hsl(25, 40%, 35%)',   // Darker brown
  'hsl(80, 100%, 50%)',  // Cyber lime
];

interface CityChartProps {
  data: { city: string; leads: number }[];
}

export function CityChart({ data }: CityChartProps) {
  const { t } = useLanguage();
  return (
    <div className="chart-container animate-slide-up delay-300" style={{ animationFillMode: 'forwards', opacity: 0 }}>
      <h3 className="text-lg font-semibold text-foreground mb-1">{t('chart.leadDistribution')}</h3>
      <p className="text-sm text-muted-foreground mb-6">{t('chart.byCity')}</p>
      
      <div className="h-[200px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            {t('chart.waitingForData')}
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              type="number" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              dataKey="city" 
              type="category" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 500 }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
              formatter={(value: number) => [`${value} leads`, 'Count']}
            />
            <Bar 
              dataKey="leads" 
              radius={[0, 6, 6, 0]}
              barSize={28}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
