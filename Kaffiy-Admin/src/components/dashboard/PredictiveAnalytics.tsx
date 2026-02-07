import { TrendingUp, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PredictiveAnalyticsProps {
  predictedVisits?: number;
  confidence?: number;
  peakDay?: string;
  peakHour?: string;
}

export const PredictiveAnalytics = ({
  predictedVisits = 120,
  confidence = 85,
  peakDay = "Cmt",
  peakHour = "14-16"
}: PredictiveAnalyticsProps) => {
  return (
    <div className="bg-gradient-to-br from-sage/10 via-card/60 to-gold/5 backdrop-blur-sm border border-sage/20 rounded-2xl p-4">
      {/* Compact Header with Main Number */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl lg:text-4xl font-bold font-serif text-sage-dark">
            {predictedVisits}
          </span>
          <span className="text-[10px] lg:text-xs text-muted-foreground">gelecek hafta</span>
        </div>
        <div className="flex items-center gap-1 text-success text-xs font-medium bg-success/10 px-1.5 py-0.5 rounded">
          <TrendingUp className="w-3 h-3" />
          <span>+8%</span>
        </div>
      </div>

      {/* Confidence bar - minimal */}
      <div className="mb-3">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-sage to-sage-dark rounded-full"
            style={{ width: `${confidence}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 text-right">%{confidence} güven</p>
      </div>

      {/* Compact Insights */}
      <div className="flex gap-2">
        <div className="flex-1 bg-muted/30 rounded-lg p-2 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">{peakDay}</span>
        </div>
        <div className="flex-1 bg-muted/30 rounded-lg p-2 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">{peakHour}</span>
        </div>
      </div>
    </div>
  );
};
