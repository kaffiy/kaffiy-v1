import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, Users, TrendingUp, Eye, Coffee, Percent, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  type: "discount" | "reward" | "event";
  status: "active" | "scheduled" | "ended" | "paused";
  startDate: string;
  endDate: string;
  targetAudience: string;
  reach: number;
  conversions: number;
  conversionRate: number;
  description: string;
  personLimit?: number;
}

interface CampaignDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
}

export const CampaignDetailsModal = ({ open, onOpenChange, campaign }: CampaignDetailsModalProps) => {
  if (!campaign) return null;

  const getTypeIcon = (type: Campaign["type"]) => {
    switch (type) {
      case "discount": return <Percent className="w-5 h-5" />;
      case "reward": return <Gift className="w-5 h-5" />;
      case "event": return <Calendar className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: Campaign["type"]) => {
    switch (type) {
      case "discount": return "İndirim";
      case "reward": return "Ödül";
      case "event": return "Etkinlik";
    }
  };

  const getStatusLabel = (status: Campaign["status"]) => {
    switch (status) {
      case "active": return "Aktif";
      case "scheduled": return "Planlanmış";
      case "ended": return "Bitti";
      case "paused": return "Duraklatıldı";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-card border-border/50 rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              campaign.type === "discount" && "bg-gold/10 text-gold",
              campaign.type === "reward" && "bg-sage/10 text-sage",
              campaign.type === "event" && "bg-primary/10 text-primary"
            )}>
              {getTypeIcon(campaign.type)}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-foreground">{campaign.name}</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                {campaign.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          {/* Status & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Durum</p>
              <p className="text-sm font-semibold text-foreground">{getStatusLabel(campaign.status)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tür</p>
              <p className="text-sm font-semibold text-foreground">{getTypeLabel(campaign.type)}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Tarih Aralığı
            </p>
            <p className="text-sm text-foreground">{campaign.startDate} - {campaign.endDate}</p>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              Hedef Kitle
            </p>
            <p className="text-sm text-foreground">{campaign.targetAudience}</p>
          </div>

          {/* Person Limit */}
          {campaign.personLimit && (
            <div className="space-y-2 pt-2 border-t border-border/30">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Kişi Limiti
              </p>
              <div className="flex items-baseline gap-2">
                <p className={cn(
                  "text-2xl font-bold",
                  campaign.conversions >= campaign.personLimit ? "text-destructive" : "text-foreground"
                )}>
                  {campaign.conversions}
                </p>
                <p className="text-sm text-muted-foreground">/ {campaign.personLimit}</p>
              </div>
              {campaign.conversions >= campaign.personLimit && (
                <p className="text-xs text-destructive">Limit doldu - Kampanya duraklatıldı</p>
              )}
            </div>
          )}

          {/* Stats */}
          {campaign.status !== "scheduled" && (
            <div className="space-y-4 pt-2 border-t border-border/30">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5" />
                    Erişim
                  </p>
                  <p className="text-2xl font-bold text-foreground">{campaign.reach}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Coffee className="w-3.5 h-3.5" />
                    Dönüşüm
                  </p>
                  <p className="text-2xl font-bold text-foreground">{campaign.conversions}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Dönüşüm Oranı
                  </p>
                  <p className="text-2xl font-bold text-foreground">%{campaign.conversionRate}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
