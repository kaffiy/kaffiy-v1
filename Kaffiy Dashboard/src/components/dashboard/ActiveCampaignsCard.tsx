import { useState } from "react";
import { Megaphone, Clock, Users, TrendingUp, Pause, Play, Trash2, Edit, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { NewCampaignModal } from "./NewCampaignModal";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, parse, format } from "date-fns";
import { tr } from "date-fns/locale";

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "ended" | "scheduled";
  daysLeft?: number;
  reach: number;
  conversions: number;
  conversionRate: number;
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
    daysLeft: 180,
    reach: 84,
    conversions: 26,
    conversionRate: 31,
  },
  {
    id: "2",
    name: "Kahve Yanı Tatlı İndirimi",
    description: "Kahve alana yanında tatlı %25 indirimli",
    status: "active",
    daysLeft: 180,
    reach: 210,
    conversions: 92,
    conversionRate: 44,
  },
];

export const ActiveCampaignsCard = () => {
  const { toast } = useToast();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [isOpen, setIsOpen] = useState(true);

  // Calculate daysLeft from dates if not present
  const calculateDaysLeft = (campaign: Campaign): number => {
    if (campaign.daysLeft !== undefined) return campaign.daysLeft;
    if (campaign.endDate) {
      try {
        const monthMap: { [key: string]: string } = {
          "Oca": "Jan", "Şub": "Feb", "Mar": "Mar", "Nis": "Apr", "May": "May", "Haz": "Jun",
          "Tem": "Jul", "Ağu": "Aug", "Eyl": "Sep", "Eki": "Oct", "Kas": "Nov", "Ara": "Dec"
        };
        let englishDateStr = campaign.endDate;
        for (const [tr, en] of Object.entries(monthMap)) {
          englishDateStr = englishDateStr.replace(tr, en);
        }
        const endDate = parse(englishDateStr, "d MMM yyyy", new Date());
        const daysLeft = differenceInDays(endDate, new Date());
        return Math.max(0, daysLeft);
      } catch (e) {
        return 0;
      }
    }
    return 0;
  };

  const activeCampaigns = campaigns.filter(c => c.status === "active");
  const totalReach = campaigns.reduce((sum, c) => sum + c.reach, 0);

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === id 
        ? { ...c, status: c.status === "active" ? "paused" : "active" as const }
        : c
    ));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const handleEdit = (campaign: Campaign) => {
    // Convert to format expected by NewCampaignModal
    const modalCampaign = {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      type: campaign.type || "discount",
      status: campaign.status,
      startDate: campaign.startDate || format(new Date(), "d MMM yyyy", { locale: tr }),
      endDate: campaign.endDate || format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "d MMM yyyy", { locale: tr }),
      targetAudience: campaign.targetAudience || "Tüm Müşteriler",
      reach: campaign.reach,
      conversions: campaign.conversions,
      conversionRate: campaign.conversionRate,
    };
    setEditingCampaign(modalCampaign as any); // Type assertion needed due to interface differences
    setIsNewCampaignOpen(true);
  };

  const handleSaveCampaign = (campaignData: Partial<Campaign>) => {
    if (editingCampaign) {
      // Update existing campaign
      const updatedCampaign: Campaign = {
        ...editingCampaign,
        name: campaignData.name || editingCampaign.name,
        description: campaignData.description || editingCampaign.description,
        type: campaignData.type || editingCampaign.type || "discount",
        startDate: campaignData.startDate || editingCampaign.startDate || "",
        endDate: campaignData.endDate || editingCampaign.endDate || "",
        targetAudience: campaignData.targetAudience || editingCampaign.targetAudience || "",
      };
      
      // Calculate daysLeft if endDate is provided
      if (updatedCampaign.endDate) {
        updatedCampaign.daysLeft = calculateDaysLeft(updatedCampaign);
      }
      
      setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? updatedCampaign : c));
      setEditingCampaign(null);
      setIsNewCampaignOpen(false);
      toast({
        title: "Kampanya güncellendi",
        description: `${updatedCampaign.name} başarıyla güncellendi.`,
      });
    } else {
      // Create new campaign
      const newCampaign: Campaign = {
        id: campaignData.id || Date.now().toString(),
        name: campaignData.name || "",
        description: campaignData.description || "",
        type: campaignData.type || "discount",
        status: "active" as Campaign["status"], // New campaigns should be active to show immediately
        startDate: campaignData.startDate || "",
        endDate: campaignData.endDate || "",
        targetAudience: campaignData.targetAudience || "",
        reach: campaignData.reach || 0,
        conversions: campaignData.conversions || 0,
        conversionRate: campaignData.conversionRate || 0,
      };
      
      // Calculate daysLeft if endDate is provided
      if (newCampaign.endDate) {
        newCampaign.daysLeft = calculateDaysLeft(newCampaign);
      }
      
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
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden h-full flex flex-col">
          {/* Header */}
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Megaphone className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-foreground">Aktif Kampanyalar</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {activeCampaigns.length} aktif • {totalReach} kişiye ulaştı
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPanelOpen(true);
                  }}
                  className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted/30"
                >
                  Tüm Kampanyalar
                </button>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            {/* Mini Campaign List */}
            <div className="px-4 pb-4 space-y-1.5">
              {activeCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between py-1.5 px-2 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-xs font-medium text-foreground truncate max-w-[140px]">
                      {campaign.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px]">{campaign.daysLeft} gün</span>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

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

          <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-180px)]">
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card/60 border border-border/50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">{activeCampaigns.length}</p>
                <p className="text-[10px] text-muted-foreground">Aktif</p>
              </div>
              <div className="bg-card/60 border border-border/50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">{totalReach}</p>
                <p className="text-[10px] text-muted-foreground">Ulaşım</p>
              </div>
              <div className="bg-card/60 border border-border/50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">
                  {campaigns.reduce((sum, c) => sum + c.conversions, 0)}
                </p>
                <p className="text-[10px] text-muted-foreground">Dönüşüm</p>
              </div>
            </div>

            {/* Campaign List */}
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className={cn(
                    "bg-card/60 border rounded-xl p-4 transition-all",
                    campaign.status === "active" 
                      ? "border-success/30" 
                      : "border-border/50 opacity-75"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          campaign.status === "active" ? "bg-success animate-pulse" : "bg-muted-foreground"
                        )} />
                        <h4 className="font-semibold text-foreground text-sm">{campaign.name}</h4>
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full",
                          campaign.status === "active" 
                            ? "bg-success/10 text-success" 
                            : "bg-muted text-muted-foreground"
                        )}>
                          {campaign.status === "active" ? "Aktif" : "Duraklatıldı"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{campaign.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-medium">{calculateDaysLeft(campaign)} gün</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-foreground font-medium">{campaign.reach}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-foreground font-medium">{campaign.conversions}</span>
                    </div>
                    <div className="text-xs text-success font-medium">
                      %{campaign.conversionRate.toFixed(1)}
                    </div>
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
          </div>

          {/* Fixed Bottom Action */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
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
        </SheetContent>
      </Sheet>

      <NewCampaignModal 
        open={isNewCampaignOpen} 
        onOpenChange={(open) => {
          setIsNewCampaignOpen(open);
          if (!open) {
            setEditingCampaign(null); // Clear editing campaign when modal closes
          }
        }}
        editingCampaign={editingCampaign as any}
        onSave={handleSaveCampaign}
      />
    </>
  );
};
