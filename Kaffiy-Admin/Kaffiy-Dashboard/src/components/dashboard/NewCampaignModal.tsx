import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, Users, QrCode, Bell, Sparkles, Percent, Gift, CalendarDays } from "lucide-react";
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

interface NewCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCampaign?: Campaign | null;
  onSave?: (campaignData: Partial<Campaign>) => void;
}

export const NewCampaignModal = ({ open, onOpenChange, editingCampaign, onSave }: NewCampaignModalProps) => {
  const [campaignName, setCampaignName] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [offerType, setOfferType] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [personLimit, setPersonLimit] = useState<string>("");

  // Parse Turkish date string to Date object
  const parseTurkishDate = (dateStr: string): Date | undefined => {
    try {
      // Map Turkish month names
      const monthMap: { [key: string]: string } = {
        "Oca": "Jan", "Şub": "Feb", "Mar": "Mar", "Nis": "Apr", "May": "May", "Haz": "Jun",
        "Tem": "Jul", "Ağu": "Aug", "Eyl": "Sep", "Eki": "Oct", "Kas": "Nov", "Ara": "Dec"
      };
      
      // Replace Turkish month names with English
      let englishDateStr = dateStr;
      for (const [tr, en] of Object.entries(monthMap)) {
        englishDateStr = englishDateStr.replace(tr, en);
      }
      
      // Try parsing with English month names
      const parsed = parse(englishDateStr, "d MMM yyyy", new Date());
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch (e) {
      // If parsing fails, return undefined
    }
    return undefined;
  };

  // Load editing campaign data when modal opens
  useEffect(() => {
    if (open && editingCampaign) {
      setCampaignName(editingCampaign.name);
      setCampaignMessage(editingCampaign.description);
      // Map targetAudience
      let mappedAudience = "all";
      if (editingCampaign.targetAudience === "Tüm Müşteriler") {
        mappedAudience = "all";
      } else if (editingCampaign.targetAudience === "Sadık Müşteriler" || editingCampaign.targetAudience === "Sık Ziyaret Edenler") {
        mappedAudience = "frequent";
      } else {
        mappedAudience = "passive";
      }
      setTargetAudience(mappedAudience);
      setOfferType(editingCampaign.type);
      const parsedStartDate = parseTurkishDate(editingCampaign.startDate);
      const parsedEndDate = parseTurkishDate(editingCampaign.endDate);
      setStartDate(parsedStartDate);
      setEndDate(parsedEndDate);
      setPersonLimit(editingCampaign.personLimit?.toString() || "");
    } else if (open && !editingCampaign) {
      // Set default values for new campaign
      setCampaignName("Hafta Sonu İndirimi");
      setCampaignMessage("Bu hafta sonu özel indirim fırsatını kaçırma! Tüm ürünlerde %20 indirim.");
      setTargetAudience("all");
      setOfferType("discount");
      // Set start date to today and end date to 7 days from today
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      setStartDate(today);
      setEndDate(nextWeek);
      setPersonLimit("");
    }
  }, [open, editingCampaign]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!campaignName || !campaignMessage || !targetAudience || !offerType || !startDate || !endDate) {
      return;
    }

    const targetAudienceLabel = targetAudience === "all" ? "Tüm Müşteriler" : targetAudience === "frequent" ? "Sık Ziyaret Edenler" : "Pasif Müşteriler (30+ gün)";
    const campaignType = offerType as "discount" | "reward" | "event";

    const campaignData = {
      id: editingCampaign?.id || Date.now().toString(),
      name: campaignName,
      description: campaignMessage,
      type: campaignType,
      status: editingCampaign?.status || ("active" as const),
      startDate: format(startDate, "d MMM yyyy", { locale: tr }),
      endDate: format(endDate, "d MMM yyyy", { locale: tr }),
      targetAudience: targetAudienceLabel,
      reach: editingCampaign?.reach || 0,
      conversions: editingCampaign?.conversions || 0,
      conversionRate: editingCampaign?.conversionRate || 0,
      personLimit: personLimit ? parseInt(personLimit, 10) : undefined,
    };

    if (onSave) {
      onSave(campaignData);
    }
    
    onOpenChange(false);
  };

  const targetAudienceOptions = [
    { value: "all", label: "Tüm Müşteriler", icon: Users },
    { value: "passive", label: "Pasif Müşteriler (30+ gün)", icon: Users },
    { value: "frequent", label: "Sık Ziyaret Edenler", icon: Users },
  ];

  const offerTypeOptions = [
    { value: "discount", label: "İndirim Kampanyası", icon: Percent, description: "Müşterilere indirim teklifi" },
    { value: "reward", label: "Ödül Kampanyası", icon: Gift, description: "Sadakat ödülleri ve bonuslar" },
    { value: "event", label: "Etkinlik", icon: CalendarDays, description: "Özel etkinlik ve aktiviteler" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-card border-border/50 rounded-xl overflow-hidden shadow-premium max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="px-5 pt-3 pb-2 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-serif text-lg text-foreground">
                {editingCampaign ? "Kampanyayı Düzenle" : "Yeni Kampanya"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs mt-0.5">
                {editingCampaign ? "Kampanya bilgilerini güncelleyin" : "Müşterilerinize özel kampanya oluşturun"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-3 space-y-3">
          {/* Campaign Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium text-foreground">
              Kampanya Adı
            </Label>
            <Input
              id="name"
              placeholder="Örn: Hafta Sonu İndirimi"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="h-9 rounded-lg border-border/50 bg-muted/30 focus:bg-background transition-colors placeholder:text-muted-foreground/60 text-sm"
            />
          </div>

          {/* Campaign Message */}
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-xs font-medium text-foreground">
              Kampanya Mesajı
            </Label>
            <Textarea
              id="message"
              placeholder="Müşterilerinize gösterilecek mesaj..."
              value={campaignMessage}
              onChange={(e) => setCampaignMessage(e.target.value)}
              className="min-h-[56px] rounded-lg border-border/50 bg-muted/30 focus:bg-background transition-colors resize-none placeholder:text-muted-foreground/60 text-sm"
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">Hedef Kitle</Label>
            <Select value={targetAudience} onValueChange={setTargetAudience}>
              <SelectTrigger className="h-9 rounded-lg border-border/50 bg-muted/30 focus:bg-background transition-colors text-sm">
                <SelectValue placeholder="Hedef kitle seçin" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-border/50 bg-card shadow-lg">
                {targetAudienceOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="rounded-md cursor-pointer focus:bg-primary/10 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <option.icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Offer Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">Kampanya Türü</Label>
            <div className="grid grid-cols-3 gap-2">
              {offerTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setOfferType(option.value)}
                  className={cn(
                    "p-2 rounded-lg border text-left transition-all duration-200",
                    offerType === option.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/50 bg-muted/30 hover:border-border hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <option.icon className={cn(
                      "w-3.5 h-3.5",
                      offerType === option.value ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "font-medium text-xs",
                      offerType === option.value ? "text-foreground" : "text-foreground/80"
                    )}>
                      {option.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">Zamanlama</Label>
            <div className="grid grid-cols-2 gap-2">
              {/* Start Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 rounded-lg border-border/50 bg-muted/30 hover:bg-muted/50 justify-start text-left font-normal text-sm",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {startDate ? format(startDate, "d MMM yyyy", { locale: tr }) : "Başlangıç"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-lg border-border/50 shadow-lg" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-2 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              {/* End Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 rounded-lg border-border/50 bg-muted/30 hover:bg-muted/50 justify-start text-left font-normal text-sm",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {endDate ? format(endDate, "d MMM yyyy", { locale: tr }) : "Bitiş"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-lg border-border/50 shadow-lg" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="p-2 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Person Limit */}
          <div className="space-y-1.5">
            <Label htmlFor="personLimit" className="text-xs font-medium text-foreground">
              Kişi Limiti (Opsiyonel)
            </Label>
            <Input
              id="personLimit"
              type="number"
              min="1"
              placeholder="Örn: 100 (boş bırakılırsa limit yok)"
              value={personLimit}
              onChange={(e) => setPersonLimit(e.target.value)}
              className="h-9 rounded-lg border-border/50 bg-muted/30 focus:bg-background transition-colors placeholder:text-muted-foreground/60 text-sm"
            />
            <p className="text-[10px] text-muted-foreground">
              Belirtilen kişi sayısına ulaşıldığında kampanya otomatik olarak duraklatılacaktır.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-9 rounded-lg border-border/50 hover:bg-muted/50 text-sm"
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="flex-1 h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-sm"
            >
              {editingCampaign ? "Değişiklikleri Kaydet" : "Kampanya Oluştur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
