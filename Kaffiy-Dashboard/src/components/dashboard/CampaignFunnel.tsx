import { Eye, MousePointer, ShoppingBag } from "lucide-react";

interface FunnelStep {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

const funnelData: FunnelStep[] = [
  { label: "Görüntüleme", value: 245, icon: Eye, color: "bg-blue-500" },
  { label: "Tıklama", value: 89, icon: MousePointer, color: "bg-amber-500" },
  { label: "Kullanım", value: 34, icon: ShoppingBag, color: "bg-success" },
];

export const CampaignFunnel = () => {
  const maxValue = funnelData[0].value;

  return (
    <div className="pt-4 border-t border-border/50">
      <div className="space-y-2.5">
        {funnelData.map((step, index) => {
          const percentage = Math.round((step.value / maxValue) * 100);
          const conversionRate = index > 0 
            ? Math.round((step.value / funnelData[index - 1].value) * 100) 
            : 100;
          
          return (
            <div key={step.label} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-md ${step.color}/10 flex items-center justify-center flex-shrink-0`}>
                <step.icon className={`w-3 h-3 ${step.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="flex-1">
                <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${step.color} rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-right min-w-[70px]">
                <span className="text-sm font-semibold text-foreground">{step.value}</span>
                {index > 0 && (
                  <span className="text-xs text-muted-foreground">{conversionRate}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
