import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Megaphone, 
  Calendar, 
  Users, 
  TrendingUp, 
  Play, 
  Pause, 
  MoreVertical,
  Gift,
  Percent,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NewCampaignModal } from "@/components/dashboard/NewCampaignModal";
import { CampaignDetailsModal } from "@/components/campaigns/CampaignDetailsModal";
import { useToast } from "@/hooks/use-toast";

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

const mockCampaigns: Campaign[] = [
  { 
    id: "1", 
    name: "Doğum Günü Kampanyası", 
    type: "reward", 
    status: "active", 
    startDate: "1 Oca 2026", 
    endDate: "31 Ara 2026", 
    targetAudience: "Doğum Günü Olan Müşteriler",
    reach: 84,
    conversions: 26,
    conversionRate: 31,
    description: "Doğum gününde 1 dilim pasta hediye"
  },
  { 
    id: "2", 
    name: "Kahve Yanı Tatlı İndirimi", 
    type: "discount", 
    status: "active", 
    startDate: "1 Oca 2026", 
    endDate: "31 Ara 2026", 
    targetAudience: "Kahve Satın Alan Müşteriler",
    reach: 210,
    conversions: 92,
    conversionRate: 44,
    description: "Kahve alana yanında tatlı %25 indirimli"
  },
];

const Campaigns = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [detailsCampaign, setDetailsCampaign] = useState<Campaign | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | Campaign["status"]>("all");

  const filteredCampaigns = campaigns.filter(
    c => filterStatus === "all" || c.status === filterStatus
  );

  // Check if campaigns reached their person limit and deactivate them
  useEffect(() => {
    setCampaigns(prev => {
      const updated = prev.map(campaign => {
        // Only check active campaigns with a person limit
        if (campaign.status === "active" && campaign.personLimit && campaign.conversions >= campaign.personLimit) {
          toast({
            title: "Kampanya limiti doldu",
            description: `${campaign.name} kampanyası kişi limitine ulaştığı için otomatik olarak duraklatıldı.`,
          });
          return { ...campaign, status: "paused" as const };
        }
        return campaign;
      });
      // Only update if something changed
      const hasChanges = updated.some((c, i) => c.status !== prev[i]?.status);
      return hasChanges ? updated : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaigns.map(c => `${c.id}-${c.conversions}-${c.personLimit}`).join(",")]);

  const stats = {
    active: campaigns.filter(c => c.status === "active").length,
    scheduled: campaigns.filter(c => c.status === "scheduled").length,
    totalReach: campaigns.reduce((acc, c) => acc + c.reach, 0),
    avgConversion: Math.round(campaigns.filter(c => c.conversions > 0).reduce((acc, c) => acc + c.conversionRate, 0) / campaigns.filter(c => c.conversions > 0).length) || 0,
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleCopy = (campaign: Campaign) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: Date.now().toString(),
      name: `${campaign.name} (Kopya)`,
      status: "scheduled" as const,
      reach: 0,
      conversions: 0,
      conversionRate: 0,
    };
    setCampaigns(prev => [...prev, newCampaign]);
    toast({
      title: "Kampanya kopyalandı",
      description: `${newCampaign.name} başarıyla oluşturuldu.`,
    });
  };

  const handleToggleStatus = (campaign: Campaign) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaign.id 
        ? { ...c, status: (c.status === "active" ? "paused" : "active") as Campaign["status"] }
        : c
    ));
    toast({
      title: campaign.status === "active" ? "Kampanya duraklatıldı" : "Kampanya devam ediyor",
      description: `${campaign.name} ${campaign.status === "active" ? "duraklatıldı" : "aktif hale getirildi"}.`,
    });
  };

  const handleDeleteClick = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (campaignToDelete) {
      setCampaigns(prev => prev.filter(c => c.id !== campaignToDelete.id));
      toast({
        title: "Kampanya silindi",
        description: `${campaignToDelete.name} başarıyla silindi.`,
      });
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleShowDetails = (campaign: Campaign) => {
    setDetailsCampaign(campaign);
  };

  const getStatusIcon = (status: Campaign["status"]) => {
    switch (status) {
      case "active": return <Play className="w-3 h-3" />;
      case "scheduled": return <Clock className="w-3 h-3" />;
      case "ended": return <CheckCircle2 className="w-3 h-3" />;
      case "paused": return <Pause className="w-3 h-3" />;
    }
  };

  const getTypeIcon = (type: Campaign["type"]) => {
    switch (type) {
      case "discount": return <Percent className="w-3.5 h-3.5" />;
      case "reward": return <Gift className="w-3.5 h-3.5" />;
      case "event": return <Calendar className="w-3.5 h-3.5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Aktif Kampanya</p>
              </div>
            </div>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.scheduled}</p>
                <p className="text-xs text-muted-foreground">Planlanmış</p>
              </div>
            </div>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalReach}</p>
                <p className="text-xs text-muted-foreground">Toplam Erişim</p>
              </div>
            </div>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-sage" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">%{stats.avgConversion}</p>
                <p className="text-xs text-muted-foreground">Ort. Dönüşüm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            {(["all", "active", "scheduled", "ended"] as const).map((filter) => (
              <Button
                key={filter}
                variant={filterStatus === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(filter)}
                className={cn(
                  "rounded-lg text-xs",
                  filterStatus === filter && "bg-primary"
                )}
              >
                {filter === "all" ? "Tümü" : filter === "active" ? "Aktif" : filter === "scheduled" ? "Planlanmış" : "Biten"}
              </Button>
            ))}
          </div>
          <Button size="sm" className="rounded-xl gap-2 bg-primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Yeni Kampanya
          </Button>
        </div>

        {/* Campaign Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCampaigns.map((campaign) => (
            <div 
              key={campaign.id} 
              className="bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 p-3 hover:border-border transition-colors"
            >
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    campaign.type === "discount" && "bg-gold/10 text-gold",
                    campaign.type === "reward" && "bg-sage/10 text-sage",
                    campaign.type === "event" && "bg-primary/10 text-primary"
                  )}>
                    {getTypeIcon(campaign.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{campaign.name}</h3>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{campaign.description}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md flex-shrink-0">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => handleEdit(campaign)}>Düzenle</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopy(campaign)}>Kopyala</DropdownMenuItem>
                    {campaign.status === "active" ? (
                      <DropdownMenuItem onClick={() => handleToggleStatus(campaign)}>Duraklat</DropdownMenuItem>
                    ) : campaign.status === "paused" ? (
                      <DropdownMenuItem onClick={() => handleToggleStatus(campaign)}>Devam Et</DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem 
                      className="text-destructive" 
                      onClick={() => handleDeleteClick(campaign)}
                    >
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2 mb-2.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-0.5">
                  <Calendar className="w-2.5 h-2.5" />
                  <span className="truncate">{campaign.startDate} - {campaign.endDate}</span>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Users className="w-2.5 h-2.5" />
                  <span className="truncate">{campaign.targetAudience}</span>
                </div>
              </div>

              {campaign.status !== "scheduled" && (
                <div className="space-y-1.5 mb-2.5">
                  {campaign.personLimit && (
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">Kişi Limiti</span>
                      <span className={cn(
                        "font-semibold",
                        campaign.conversions >= campaign.personLimit ? "text-destructive" : "text-foreground"
                      )}>
                        {campaign.conversions} / {campaign.personLimit}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Dönüşüm</span>
                    <span className="font-semibold text-foreground">{campaign.conversionRate}%</span>
                  </div>
                  <Progress value={campaign.conversionRate} className="h-1" />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{campaign.reach}</span>
                    <span>{campaign.conversions}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                {(campaign.status === "active" || campaign.status === "paused") ? (
                  <Button
                    onClick={() => handleToggleStatus(campaign)}
                    className={cn(
                      "flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full h-auto",
                      campaign.status === "active" && "bg-success/10 text-success hover:bg-success/20",
                      campaign.status === "paused" && "bg-destructive/10 text-destructive hover:bg-destructive/20"
                    )}
                    variant="ghost"
                    size="sm"
                  >
                    {getStatusIcon(campaign.status)}
                    {campaign.status === "active" ? "Aktif" : "Duraklatıldı"}
                  </Button>
                ) : (
                  <span className={cn(
                    "flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
                    campaign.status === "scheduled" && "bg-gold/10 text-gold",
                    campaign.status === "ended" && "bg-muted/50 text-muted-foreground"
                  )}>
                    {getStatusIcon(campaign.status)}
                    {campaign.status === "scheduled" ? "Planlanmış" : "Bitti"}
                  </span>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-md text-[10px] h-6 px-2"
                  onClick={() => handleShowDetails(campaign)}
                >
                  Detaylar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <NewCampaignModal 
        open={isModalOpen} 
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingCampaign(null);
        }}
        editingCampaign={editingCampaign}
        onSave={(campaignData) => {
          if (editingCampaign) {
            // Update existing campaign
            const updatedCampaign = { ...editingCampaign, ...campaignData };
            // Check if limit is reached
            if (updatedCampaign.personLimit && updatedCampaign.conversions >= updatedCampaign.personLimit && updatedCampaign.status === "active") {
              updatedCampaign.status = "paused";
            }
            setCampaigns(prev => prev.map(c => 
              c.id === editingCampaign.id 
                ? updatedCampaign as Campaign
                : c
            ));
            toast({
              title: "Kampanya güncellendi",
              description: `${campaignData.name} başarıyla güncellendi.`,
            });
            setEditingCampaign(null);
          } else {
            // Create new campaign
            const newCampaign = campaignData as Campaign;
            // Check if limit is reached
            if (newCampaign.personLimit && newCampaign.conversions >= newCampaign.personLimit && newCampaign.status === "active") {
              newCampaign.status = "paused";
            }
            setCampaigns(prev => [...prev, newCampaign]);
            toast({
              title: "Kampanya oluşturuldu",
              description: `${campaignData.name} başarıyla oluşturuldu.`,
            });
          }
        }}
      />
      
      <CampaignDetailsModal 
        open={!!detailsCampaign} 
        onOpenChange={(open) => !open && setDetailsCampaign(null)}
        campaign={detailsCampaign}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Kampanyayı sil?</AlertDialogTitle>
            <AlertDialogDescription>
              {campaignToDelete && (
                <>
                  <strong>{campaignToDelete.name}</strong> kampanyasını silmek istediğinize emin misiniz? 
                  Bu işlem geri alınamaz.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 rounded-xl"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Campaigns;
