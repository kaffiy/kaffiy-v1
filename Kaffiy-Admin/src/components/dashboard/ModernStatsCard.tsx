import { TrendingUp, TrendingDown, Users, Calendar, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModernStatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon?: React.ElementType;
  description?: string;
  trend?: "up" | "down" | "stable";
  color?: "primary" | "success" | "warning" | "destructive";
}

const colorClasses = {
  primary: {
    bg: "bg-indigo-50",
    icon: "text-indigo-600",
    trend: "text-indigo-600"
  },
  success: {
    bg: "bg-green-50",
    icon: "text-green-600",
    trend: "text-green-600"
  },
  warning: {
    bg: "bg-yellow-50",
    icon: "text-yellow-600",
    trend: "text-yellow-600"
  },
  destructive: {
    bg: "bg-red-50",
    icon: "text-red-600",
    trend: "text-red-600"
  }
};

export const ModernStatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  description,
  trend = "stable",
  color = "primary"
}: ModernStatsCardProps) => {
  const colors = colorClasses[color];
  const isPositive = changeType === "increase" || (change && change > 0);
  const isNeutral = changeType === "neutral" || (!change || change === 0);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-xl", colors.bg)}>
          {Icon && <Icon className={cn("w-5 h-5", colors.icon)} />}
        </div>
        
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs">
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-green-600" />
            ) : isNeutral ? (
              <div className="w-3 h-3 rounded-full bg-gray-300" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-600" />
            )}
            <span className={cn(
              "font-medium",
              isPositive ? "text-green-600" : isNeutral ? "text-gray-500" : "text-red-600"
            )}>
              {isNeutral ? "0%" : `${Math.abs(change)}%`}
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        <p className="text-sm text-gray-600 font-medium">
          {title}
        </p>
        {description && (
          <p className="text-xs text-gray-500 mt-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
