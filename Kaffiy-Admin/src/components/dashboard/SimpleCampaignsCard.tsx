import { useState } from "react";
import { Megaphone, Plus, Users, Activity, Clock, Pause, Play, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewCampaignModal } from "./NewCampaignModal";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: "active" | "paused" | "ended" | "scheduled";
  reach: number;
  usage: number;
  daysLeft?: number;
  type?: "discount" | "reward" | "event";
  startDate?: string;
  endDate?: string;
  targetAudience?: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Doğum Günü Kampanyası",
    description: "Doğum gününde 1 dilim pasta hediye",
    status: "active",
    reach: 84,
    usage: 26,
    daysLeft: 180,
    type: "reward",
  },
  {
    id: "2",
    name: "Kahve Yanı Tatlı İndirimi",
    description: "Kahve alana yanında tatlı %25 indirimli",
    status: "active",
    reach: 210,
    usage: 92,
    daysLeft: 180,
    type: "discount",
  },
];

export const SimpleCampaignsCard = () => {
  const { toast } = useToast();
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  
  const activeCampaigns = campaigns.filter(c => c.status === "active");

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(prev => {
      const campaign = prev.find(c => c.id === id);
      const newStatus = campaign?.status === "active" ? "paused" : "active";
      toast({
        title: campaign?.status === "active" ? "Kampanya duraklatıldı" : "Kampanya devam ediyor",
        description: `${campaign?.name} ${campaign?.status === "active" ? "duraklatıldı" : "aktif hale getirildi"}.`,
      });
      return prev.map(c => 
        c.id === id 
          ? { ...c, status: newStatus as Campaign["status"] }
          : c
      );
    });
  };

  const deleteCampaign = (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Kampanya silindi",
      description: `${campaign?.name} başarıyla silindi.`,
    });
  };

  const handleEdit = (campaign: Campaign) => {
    const modalCampaign = {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description || "",
      type: campaign.type || "discount",
      status: campaign.status,
      startDate: campaign.startDate || format(new Date(), "d MMM yyyy", { locale: tr }),
      endDate: campaign.endDate || format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "d MMM yyyy", { locale: tr }),
      targetAudience: campaign.targetAudience || "Tüm Müşteriler",
      reach: campaign.reach,
      conversions: campaign.usage,
      conversionRate: 0,
    };
    setEditingCampaign(modalCampaign as any);
    setIsNewCampaignOpen(true);
  };

  const handleSaveCampaign = (campaignData: any) => {
    if (editingCampaign) {
      const updatedCampaign: Campaign = {
        ...editingCampaign,
        name: campaignData.name || editingCampaign.name,
        description: campaignData.description || editingCampaign.description,
        type: campaignData.type || editingCampaign.type || "discount",
        startDate: campaignData.startDate || editingCampaign.startDate,
        endDate: campaignData.endDate || editingCampaign.endDate,
        targetAudience: campaignData.targetAudience || editingCampaign.targetAudience,
      };
      setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? updatedCampaign : c));
      setEditingCampaign(null);
      setIsNewCampaignOpen(false);
      toast({
        title: "Kampanya güncellendi",
        description: `${updatedCampaign.name} başarıyla güncellendi.`,
      });
    } else {
      const newCampaign: Campaign = {
        id: campaignData.id || Date.now().toString(),
        name: campaignData.name || "",
        description: campaignData.description || "",
        type: campaignData.type || "discount",
        status: "active" as Campaign["status"],
        startDate: campaignData.startDate || "",
        endDate: campaignData.endDate || "",
        targetAudience: campaignData.targetAudience || "",
        reach: campaignData.reach || 0,
        usage: campaignData.conversions || 0,
      };
      setCampaigns(prev => [...prev, newCampaign]);
      setIsNewCampaignOpen(false);
      toast({
        title: "Kampanya oluşturuldu",
        description: `${newCampaign.name} başarıyla oluşturuldu.`,
      });
    }
  };

  return (
    <>
      <div 
        className="relative rounded-3xl p-6 lg:p-7 backdrop-blur-xl transition-all duration-300 hover:shadow-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
          border: '1px solid rgba(226, 232, 240, 0.6)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 0 rgba(255, 255, 255, 0.8) inset',
        }}
      >
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-foreground tracking-tight">Aktif Kampanyalar</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPanelOpen(true)}
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground h-auto px-2 py-1"
            >
              Tüm Kampanyalar
            </Button>
          </div>
          <Button
            onClick={() => setIsNewCampaignOpen(true)}
            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 gap-2 rounded-xl h-11 px-5 font-semibold transition-all duration-200 hover:border-primary/30"
          >
            <Plus className="w-4 h-4" />
            Yeni Kampanya Oluştur
          </Button>
        </div>

        <div className="space-y-3">
          {activeCampaigns.map((campaign) => {
            const isActive = campaign.status === "active";
            return (
              <div
                key={campaign.id}
                className={cn(
                  "p-5 rounded-2xl relative transition-all duration-200 hover:shadow-lg hover:scale-[1.01]",
                  isActive 
                    ? "bg-sage-light/50 border-2 border-sage/20"
                    : "bg-white/40 border border-slate-200/60"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-sage/40 rounded-l-2xl" />
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                      isActive 
                        ? "bg-sage-light/60"
                        : "bg-slate-100/80"
                    )}>
                      <Megaphone className={cn(
                        "w-6 h-6",
                        isActive ? "text-sage" : "text-slate-600"
                      )} />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-base mb-1">{campaign.name}</h4>
                      {isActive && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage-light/60 border border-sage/30">
                          <div className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
                          <p className="text-xs text-sage font-semibold">Aktif</p>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="p-3 rounded-xl bg-white/60 border border-border/40">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-muted/40">
                        <Users className="w-3.5 h-3.5 text-foreground/60" />
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ulaşılan Kişi</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">{campaign.reach}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/60 border border-border/40">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-muted/40">
                        <Activity className="w-3.5 h-3.5 text-foreground/60" />
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kullanım Adedi</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">{campaign.usage}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campaign Management Panel */}
      <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <SheetContent className="w-full sm:max-w-lg p-0 bg-background border-l border-border/50">
          <SheetHeader className="px-6 py-5 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <SheetTitle className="font-serif text-xl text-foreground">Tüm Kampanyalar</SheetTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {campaigns.length} kampanya
                  </p>
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="p-6 space-y-4">
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card/60 border border-border/50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">{activeCampaigns.length}</p>
                <p className="text-[10px] text-muted-foreground">Aktif</p>
              </div>
              <div className="bg-card/60 border border-border/50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">{campaigns.filter(c => c.status === "paused").length}</p>
                <p className="text-[10px] text-muted-foreground">Duraklatıldı</p>
              </div>
              <div className="bg-card/60 border border-border/50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">{campaigns.reduce((sum, c) => sum + c.reach, 0)}</p>
                <p className="text-[10px] text-muted-foreground">Toplam Ulaşım</p>
              </div>
            </div>

            {/* Campaign List */}
            <div className="space-y-2">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-4 rounded-xl bg-card/60 border border-border/50 hover:border-border transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{campaign.name}</h4>
                        {campaign.status === "active" && (
                          <span className="inline-flex items-center gap-1 bg-success/10 text-success text-xs font-semibold px-2 py-0.5 rounded-full">
                            Aktif
                          </span>
                        )}
                        {campaign.status === "paused" && (
                          <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                            Duraklatıldı
                          </span>
                        )}
                      </div>
                      {campaign.description && (
                        <p className="text-sm text-muted-foreground">{campaign.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">Ulaşım</p>
                      </div>
                      <p className="text-lg font-bold text-foreground">{campaign.reach}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">Kullanım</p>
                      </div>
                      <p className="text-lg font-bold text-foreground">{campaign.usage}</p>
                    </div>
                    {campaign.daysLeft !== undefined && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <p className="text-[10px] text-muted-foreground">Kalan</p>
                        </div>
                        <p className="text-lg font-bold text-foreground">{campaign.daysLeft} gün</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-border/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCampaignStatus(campaign.id)}
                      className="flex-1 h-8 text-xs gap-1.5 hover:bg-muted/50"
                    >
                      {campaign.status === "active" ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          Duraklat
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          Devam Et
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(campaign)}
                      className="h-8 w-8 p-0 hover:bg-muted/50"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCampaign(campaign.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Action Button */}
            <div className="pt-4 border-t border-border/50">
              <Button
                onClick={() => {
                  setEditingCampaign(null);
                  setIsNewCampaignOpen(true);
                }}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
              >
                <Plus className="w-4 h-4" />
                Yeni Kampanya Oluştur
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <NewCampaignModal 
        open={isNewCampaignOpen} 
        onOpenChange={(open) => {
          setIsNewCampaignOpen(open);
          if (!open) {
            setEditingCampaign(null);
          }
        }}
        editingCampaign={editingCampaign as any}
        onSave={handleSaveCampaign}
      />
    </>
  );
};
