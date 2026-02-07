import { useState } from "react";
import { UserPlus, Coins, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardDateRange } from "@/contexts/DashboardDateRangeContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ActivityItem {
  id: string;
  customerName: string;
  action: string;
  timestamp: Date;
  campaignName?: string;
}

const getTimeAgo = (date: Date) => {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "şimdi";
  if (minutes < 60) return `${minutes} dk önce`;
  return `${Math.floor(minutes / 60)} saat önce`;
};

// Mock data
const mockActivities: ActivityItem[] = [
  { id: "1", customerName: "Ali", action: "1 kahve aldı", timestamp: new Date(Date.now() - 5 * 60000) },
  { id: "2", customerName: "Ayşe", action: "kampanya kullandı", timestamp: new Date(Date.now() - 12 * 60000), campaignName: "Özel Teklif" },
  { id: "3", customerName: "Mehmet", action: "1 kahve aldı", timestamp: new Date(Date.now() - 18 * 60000) },
  { id: "4", customerName: "Zeynep", action: "ödül kazandı", timestamp: new Date(Date.now() - 25 * 60000) },
  { id: "5", customerName: "Can", action: "1 kahve aldı", timestamp: new Date(Date.now() - 32 * 60000) },
];

export const LiveActivityCard = () => {
  const { isCustomRange, rangeDays } = useDashboardDateRange();
  const scaleValue = (value: number) => (isCustomRange ? Math.round(value * rangeDays) : value);

  return (
    <div 
      className="relative rounded-3xl p-6 lg:p-7 backdrop-blur-xl transition-all duration-300 hover:shadow-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        border: '1px solid rgba(226, 232, 240, 0.6)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 0 rgba(255, 255, 255, 0.8) inset',
      }}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-[#C2410C] animate-pulse" />
        <h3 className="text-xl font-semibold text-foreground tracking-tight">Canlı Akış</h3>
      </div>
      
      {/* 3 Metrik */}
      <div className="grid grid-cols-3 gap-3 mb-7">
        <div className="text-center p-3 rounded-2xl bg-muted/20 border border-border/40">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 rounded-xl bg-muted/40">
              <UserPlus className="w-4 h-4 text-foreground/60" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1 tabular-nums tracking-tight">
            {scaleValue(13)}
          </p>
          <p className="text-xs text-muted-foreground font-medium">Yeni Ziyaretçi</p>
        </div>
        
        <div className="text-center p-3 rounded-2xl bg-muted/20 border border-border/40">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 rounded-xl bg-muted/40">
              <Coins className="w-4 h-4 text-foreground/60" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1 tabular-nums tracking-tight">
            {scaleValue(247)}
          </p>
          <p className="text-xs text-muted-foreground font-medium">Kazanılan Puan</p>
        </div>
        
        <div className="text-center p-3 rounded-2xl bg-muted/20 border border-border/40">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 rounded-xl bg-muted/40">
              <Gift className="w-4 h-4 text-foreground/60" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1 tabular-nums tracking-tight">
            {scaleValue(5)}
          </p>
          <p className="text-xs text-muted-foreground font-medium">Harcanan Ödül</p>
        </div>
      </div>

      {/* Son 5 İşlem */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/80 uppercase tracking-wide mb-4">Son 5 İşlem</p>
        <div className="space-y-2">
          {mockActivities.map((item, index) => {
            const isCampaignAction = item.action === "kampanya kullandı" && item.campaignName;
            
            const content = (
              <div
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                  index === 0 && "animate-fade-in bg-white/40 border border-[#C2410C]/10",
                  isCampaignAction && "cursor-pointer hover:bg-white/60"
                )}
                style={{
                  background: index === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.02)',
                  border: index === 0 ? '1px solid rgba(194, 65, 12, 0.1)' : '1px solid rgba(226, 232, 240, 0.4)',
                }}
              >
                <p className="text-sm text-foreground font-medium">
                  <span className="font-semibold">{item.customerName}</span> <span className="text-muted-foreground/80">{item.action}</span>
                </p>
                <span className="text-[10px] text-muted-foreground/50 font-medium">{getTimeAgo(item.timestamp)}</span>
              </div>
            );

            if (isCampaignAction) {
              return (
                <Popover key={item.id}>
                  <PopoverTrigger asChild>
                    {content}
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="start">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kullanılan Kampanya</p>
                      <p className="text-sm font-semibold text-foreground">{item.campaignName}</p>
                    </div>
                  </PopoverContent>
                </Popover>
              );
            }

            return <div key={item.id}>{content}</div>;
          })}
        </div>
      </div>
    </div>
  );
};
