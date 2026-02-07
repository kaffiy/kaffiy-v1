import { useState } from "react";
import { AlertTriangle, Send, Check, Clock, User, Power, ChevronDown, ChevronUp, Zap, TrendingDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ChurnCustomer {
  id: string;
  name: string;
  daysAgo: number;
  totalVisits: number;
  lastOrder: string;
  favoriteProduct?: string;
  frequency?: string;
}

const mockChurnCustomers: ChurnCustomer[] = [
  { id: "1", name: "Ahmet Y.", daysAgo: 15, totalVisits: 23, lastOrder: "Latte", favoriteProduct: "Latte Seven", frequency: "Haftada 2" },
  { id: "2", name: "Elif K.", daysAgo: 17, totalVisits: 45, lastOrder: "Americano", favoriteProduct: "Americano Seven", frequency: "Haftada 3" },
  { id: "3", name: "Mehmet S.", daysAgo: 19, totalVisits: 67, lastOrder: "Cappuccino", favoriteProduct: "Cappuccino Seven", frequency: "Haftada 4" },
  { id: "4", name: "Zeynep A.", daysAgo: 21, totalVisits: 12, lastOrder: "Mocha", favoriteProduct: "Mocha Seven", frequency: "Haftada 1" },
];

type OfferType = "%20" | "%10" | "Bedava Kahve";

export const ChurnAlert = () => {
  const [sentOffers, setSentOffers] = useState<Set<string>>(new Set());
  const [offerTypes, setOfferTypes] = useState<Record<string, OfferType>>({});
  const [isSendingAll, setIsSendingAll] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const { toast } = useToast();

  const atRiskCount = mockChurnCustomers.filter(c => !sentOffers.has(c.id)).length;

  const handleSendOffer = (customerId: string, customerName: string, offerType: OfferType = "%20") => {
    setSentOffers(prev => new Set([...prev, customerId]));
    setOfferTypes(prev => ({ ...prev, [customerId]: offerType }));
    toast({ title: "Gönderildi!", description: `${customerName} - ${offerType === "Bedava Kahve" ? "Bedava Kahve" : offerType + " kupon"}` });
  };

  const getOfferLabel = (offerType: OfferType) => {
    if (offerType === "Bedava Kahve") return "Bedava Kahve";
    return offerType;
  };

  const handleSendAll = () => {
    setIsSendingAll(true);
    setTimeout(() => {
      mockChurnCustomers.forEach(customer => {
        if (!sentOffers.has(customer.id)) {
          setOfferTypes(prev => ({ ...prev, [customer.id]: "%20" }));
        }
      });
      setSentOffers(new Set(mockChurnCustomers.map(c => c.id)));
      setIsSendingAll(false);
      toast({ title: "Toplu gönderim tamamlandı!" });
    }, 1000);
  };

  const getTotalCost = () => {
    const unsentCustomers = mockChurnCustomers.filter(c => !sentOffers.has(c.id));
    // Mock cost calculation: %20 = ₺30, %10 = ₺15, Bedava Kahve = ₺50
    return unsentCustomers.length * 30;
  };

  const handleAutoModeToggle = (checked: boolean) => {
    if (!checked && autoMode) {
      setShowDisableDialog(true);
    } else {
      setAutoMode(checked);
      if (checked) toast({ title: "Oto-mod aktif 🤖" });
    }
  };

  const confirmDisableAutoMode = () => {
    setAutoMode(false);
    setShowDisableDialog(false);
  };

  const unsentCount = mockChurnCustomers.filter(c => !sentOffers.has(c.id)).length;

  // Helper functions for customer cards
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      { bg: "bg-blue-100", text: "text-blue-700" },
      { bg: "bg-purple-100", text: "text-purple-700" },
      { bg: "bg-pink-100", text: "text-pink-700" },
      { bg: "bg-green-100", text: "text-green-700" },
      { bg: "bg-yellow-100", text: "text-yellow-700" },
      { bg: "bg-indigo-100", text: "text-indigo-700" },
      { bg: "bg-teal-100", text: "text-teal-700" },
      { bg: "bg-orange-100", text: "text-orange-700" },
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getRiskLevel = (daysAgo: number, multiplier: number) => {
    if (daysAgo >= 20 || multiplier >= 4) return "high";
    if (daysAgo >= 15 || multiplier >= 3) return "medium";
    return "low";
  };

  const getRiskColor = (riskLevel: string) => {
    if (riskLevel === "high") return "bg-destructive";
    if (riskLevel === "medium") return "bg-orange-500";
    return "bg-orange-400";
  };

  const getReturnProbability = (riskLevel: string) => {
    if (riskLevel === "high") return { text: "Geri Dönme İhtimali: Yüksek", color: "text-destructive" };
    if (riskLevel === "medium") return { text: "Geri Dönme İhtimali: Orta", color: "text-orange-500" };
    return { text: "Geri Dönme İhtimali: Düşük", color: "text-orange-400" };
  };

  const getOfferButtonText = (offerType: OfferType) => {
    if (offerType === "Bedava Kahve") return "Bedava Kahve Gönder";
    return `${offerType} İndirim Gönder`;
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className={cn(
          "backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-300",
          autoMode 
            ? "bg-gradient-to-br from-success/10 via-success/5 to-card/60 border-success/30" 
            : "bg-card/60 border-border/50"
        )}>
          {/* Header */}
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">Müşteri Geri Kazanma</h3>
                    <span className="text-[9px] bg-success/20 text-success px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Beta AI
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Kayıp riski olan müşteriler</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {unsentCount > 0 && (
                  <div className="flex items-center gap-1.5 bg-destructive/10 px-2.5 py-1 rounded-full">
                    <span className="text-xs font-bold text-destructive">{unsentCount}</span>
                    <span className="text-[10px] text-destructive/70">bekliyor</span>
                  </div>
                )}
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4">
              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Aylık Kayıp Riski */}
                <div className="bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-xl p-3 border border-destructive/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                    <span className="text-[10px] text-destructive/80 font-medium">Aylık Kayıp Riski</span>
                  </div>
                  <p className="text-xl font-bold text-destructive">₺704</p>
                </div>

                {/* Auto Mode Card */}
                <div className={cn(
                  "rounded-xl p-3 border transition-all",
                  autoMode 
                    ? "bg-gradient-to-br from-success/10 to-success/5 border-success/20" 
                    : "bg-muted/30 border-border/50"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Zap className={cn("w-3.5 h-3.5", autoMode ? "text-success" : "text-muted-foreground")} />
                      <span className={cn("text-[10px] font-medium", autoMode ? "text-success" : "text-muted-foreground")}>
                        Otomatik Pilot
                      </span>
                    </div>
                    <Switch 
                      checked={autoMode} 
                      onCheckedChange={handleAutoModeToggle} 
                      className="scale-75 data-[state=checked]:bg-success" 
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {autoMode ? "Sistem sizin yerinize müşterileri takip ediyor" : "Manuel gönderim"}
                  </p>
                </div>
              </div>

              {/* Customer List Header */}
              {!autoMode && unsentCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Müşteri Listesi</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          onClick={handleSendAll} 
                          disabled={isSendingAll} 
                          className="bg-gold hover:bg-gold/90 text-gold-foreground text-[10px] h-7 px-3 rounded-lg"
                        >
                          {isSendingAll ? (
                            <Clock className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-3 h-3 mr-1.5" />
                              Tümüne Gönder
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-lg shadow-lg bg-card border border-border/50 max-w-[250px]">
                        <p className="text-xs text-foreground">
                          {unsentCount} kişiye toplam <span className="font-semibold">₺{getTotalCost()}</span> değerinde indirim tanımlanacak.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

              {/* Customer Cards Grid */}
              <div className="grid grid-cols-2 gap-2">
                {mockChurnCustomers.map((customer) => {
                  const isSent = sentOffers.has(customer.id);
                  const selectedOffer = offerTypes[customer.id] || "%20";
                  const normalDays = customer.frequency === "Haftada 1" ? 7 : customer.frequency === "Haftada 2" ? 3.5 : customer.frequency === "Haftada 3" ? 2.3 : 1.75;
                  const multiplier = Math.round(customer.daysAgo / normalDays);
                  const riskLevel = getRiskLevel(customer.daysAgo, multiplier);
                  const riskColor = getRiskColor(riskLevel);
                  const returnProbability = getReturnProbability(riskLevel);
                  const avatarColor = getAvatarColor(customer.name);
                  const initials = getInitials(customer.name);
                  
                  return (
                    <div 
                      key={customer.id} 
                      className={cn(
                        "rounded-xl p-3 transition-all border relative overflow-hidden",
                        isSent 
                          ? "bg-success/5 border-success/20" 
                          : "bg-muted/20 border-border/30 hover:bg-muted/40 hover:border-border/50"
                      )}
                    >
                      {/* Left Border - Risk Indicator */}
                      <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        riskColor
                      )} />

                      {/* Left: Profile */}
                      <div className="flex items-start gap-2.5 mb-2.5 pl-1">
                        {/* Avatar */}
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-semibold",
                          avatarColor.bg,
                          avatarColor.text
                        )}>
                          {initials}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-xs font-semibold text-foreground truncate">{customer.name}</p>
                            {/* AI Return Probability */}
                            <span className={cn(
                              "text-[9px] font-medium whitespace-nowrap flex-shrink-0",
                              returnProbability.color
                            )}>
                              {returnProbability.text}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {customer.favoriteProduct && (
                              <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                                {customer.favoriteProduct}
                              </span>
                            )}
                            {customer.frequency && (
                              <span className="text-[9px] text-muted-foreground">Sıklık: {customer.frequency}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Status */}
                      <div className="flex items-center gap-1.5 mb-1.5 pl-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                        <p className="text-[10px] text-muted-foreground">{customer.daysAgo} gün önce</p>
                      </div>
                      <p className="text-[9px] text-muted-foreground/70 mb-2.5 pl-1">
                        Son ziyaret: {new Date(Date.now() - customer.daysAgo * 24 * 60 * 60 * 1000).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-[9px] text-muted-foreground/70 mb-2.5 pl-1">
                        Normal rutininin {multiplier} katı süredir yok
                      </p>
                      
                      {/* Right: Action */}
                      <div className="flex items-center justify-between pl-1">
                        <div className="text-[10px] text-muted-foreground">
                          <span className="text-foreground font-medium">{customer.totalVisits}</span> ziyaret • <span className="text-foreground">{customer.lastOrder}</span>
                        </div>
                        
                        {!isSent && !autoMode && (
                          <div className="flex items-center gap-0.5">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSendOffer(customer.id, customer.name, selectedOffer)} 
                              className="h-6 text-[10px] text-gold border-gold/30 hover:text-gold hover:bg-gold/10 hover:border-gold/50 px-2 rounded-l-md rounded-r-none"
                            >
                              <Send className="w-2.5 h-2.5 mr-1" />
                              {getOfferButtonText(selectedOffer)}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 w-6 p-0 border-l-0 border-gold/30 hover:bg-gold/10 hover:border-gold/50 rounded-r-md rounded-l-none"
                                >
                                  <ChevronDown className="w-3 h-3 text-gold" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-lg">
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setOfferTypes(prev => ({ ...prev, [customer.id]: "%10" }));
                                  }}
                                  className="text-xs"
                                >
                                  %10
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setOfferTypes(prev => ({ ...prev, [customer.id]: "%20" }));
                                  }}
                                  className="text-xs"
                                >
                                  %20
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setOfferTypes(prev => ({ ...prev, [customer.id]: "Bedava Kahve" }));
                                  }}
                                  className="text-xs"
                                >
                                  Bedava Kahve
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                        
                        {isSent && (
                          <span className="text-[10px] text-success font-medium">
                            Gönderildi ✓ {getOfferLabel(selectedOffer)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Power className="w-5 h-5 text-destructive" />
              </div>
              Robotu durdur?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Robot sizin yerinize kayıp müşterilere otomatik indirim kuponu gönderiyordu. 
              Durdurmak istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Vazgeç</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDisableAutoMode} 
              className="bg-destructive hover:bg-destructive/90 rounded-xl"
            >
              Evet, Durdur
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
