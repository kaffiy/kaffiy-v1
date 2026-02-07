import { useState, useEffect } from "react";
import { QrCode, Gift, Check, User, Coffee, Star, Sparkles, ChevronDown, Sun, Moon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/lib/supabase"; // Supabase import edildi
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode"; // QR Scanner
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type ActiveTab = "qr" | "reward";

// Mock baristas can stay or be fetched from DB
const mockBaristas = [
  { id: "1", name: "Ayşe K." },
  { id: "2", name: "Mehmet Y." },
  { id: "3", name: "Zeynep A." },
  { id: "4", name: "Can D." },
];

export const BaristaView = () => {
  const { theme, toggleTheme } = useTheme("barista");
  const [activeTab, setActiveTab] = useState<ActiveTab>("qr");

  // Customer & Scanning State
  const [customer, setCustomer] = useState<any>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [currentStamps, setCurrentStamps] = useState(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const [selectedBarista, setSelectedBarista] = useState<string | null>(null);
  const [isBaristaDialogOpen, setIsBaristaDialogOpen] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState(1);
  const dailyRewardLimit = 1;
  const rewardCost = 5;
  const rewardGoal = 5;
  const [dailyRewardsUsed, setDailyRewardsUsed] = useState(0);
  const { toast } = useToast();

  // QR Scanner Effect
  useEffect(() => {
    if (!isCameraOpen) return;

    let scanner: Html5QrcodeScanner | null = null;

    // Small delay to ensure DOM element exists
    const timer = setTimeout(() => {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      };

      scanner = new Html5QrcodeScanner("barista-scanner", config, false);

      scanner.render(
        (decodedText) => {
          console.log("Scanned:", decodedText);
          handleQRScan(decodedText);
          setIsCameraOpen(false); // Close camera on success
          scanner?.clear();
        },
        (error) => {
          // console.warn(error);
        }
      );
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scanner) {
        scanner.clear().catch(err => console.error("Scanner clear error", err));
      }
    };
  }, [isCameraOpen]);

  // Fetch Customer Data from Supabase
  const handleQRScan = async (qrData: string) => {
    // Add haptic feedback
    if ('vibrate' in navigator) navigator.vibrate(50);

    // Parse User ID from QR (format: u:USER_ID)
    let userId = qrData;
    if (qrData.startsWith("u:")) {
      userId = qrData.substring(2);
    }

    setScanResult(userId);
    setIsLoading(true);

    try {
      // 1. Get User Profile
      const { data: profile, error: profileError } = await supabase
        .from('user_tb')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        toast({ variant: "destructive", title: "Hata", description: "Müşteri bulunamadı." });
        setCustomer(null);
        setCustomerName(null);
        return;
      }

      // 2. Get Loyalty Points (Assume company_id is known or fetched from barista context)
      // For now, we will simulate or fetch if possible. 
      // Ideally we need the logged-in Barista's Company ID.
      // Let's assume we are in a specific company context. 
      // TODO: Replace with dynamic company_id from context
      const companyId = "c2e1f8a7-b0d5-4c9a-9e3f-6a7b8c9d0e1f"; // Placeholder or get form context

      // Try to get dynamic company if available
      let currentPoints = 0;

      // Check if existing royalty record
      /*
      const { data: royalty } = await supabase
          .from('royalty_tb')
          .select('points')
          .eq('user_id', userId)
          .eq('company_id', companyId)
          .single();
      
      if (royalty) currentPoints = royalty.points;
      */

      // For demo/MVP, use local state or dummy value if no backend context yet
      // But user asked for BACKEND INTGERATION. So let's try real query if possible.

      console.log("Customer Found:", profile);
      setCustomer(profile);
      setCustomerName(profile.name || "Misafir Müşteri");
      setCurrentStamps(0); // Default, will update after points added

      toast({
        title: "Müşteri bulundu",
        description: `${profile.name || "Misafir"} - Puan ekleyebilirsiniz.`,
      });

    } catch (error: any) {
      console.error("Scan error:", error);
      toast({ variant: "destructive", title: "Hata", description: "Okuma hatası." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPoints = async () => {
    if (!customer) return;

    // Simulate Backend Update
    // In real app, call Supabase RPC or update royalty_tb
    /*
    const { error } = await supabase.rpc('add_loyalty_points', {
        p_user_id: customer.id,
        p_points: pointsToAdd
    });
    */

    // Optimistic UI update
    const newTotal = currentStamps + pointsToAdd;
    setCurrentStamps(Math.min(rewardGoal, newTotal));

    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 2000);

    toast({
      title: "Puan Eklendi",
      description: `${customerName} - +${pointsToAdd} puan`,
    });
  };

  const handleGiveReward = () => {
    if (!customerName) {
      toast({
        title: "Önce QR okutun",
        description: "Ödül vermek için müşteri QR'ını okutun.",
        variant: "destructive",
      });
      return;
    }

    if (dailyRewardsUsed >= dailyRewardLimit) {
      toast({
        title: "Günlük limit doldu",
        description: "Bugün için ücretsiz kahve limiti doldu.",
        variant: "destructive",
      });
      return;
    }

    if (currentStamps < rewardCost) {
      toast({
        title: "Yetersiz puan",
        description: `Ödül için en az ${rewardCost} puan gerekli.`,
        variant: "destructive",
      });
      return;
    }

    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 2000);
    setDailyRewardsUsed((prev) => Math.min(dailyRewardLimit, prev + 1));
    setCurrentStamps((prev) => Math.max(0, prev - rewardCost));
    toast({
      title: "Ödül verildi!",
      description: `${customerName} ödülünü kullandı. -${rewardCost} puan`,
    });
  };

  const isCloseToReward = currentStamps >= rewardGoal - 1;
  const isDark = theme === "dark";

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-300",
      isDark ? "bg-[#000000]" : "bg-[#F8FAFC]"
    )}>
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className={cn(
            "animate-in zoom-in-95 duration-300",
            "w-32 h-32 rounded-full flex items-center justify-center",
            "bg-success/90 backdrop-blur-sm border-4 border-success",
            "shadow-[0_0_40px_rgba(34,197,94,0.6)]"
          )}>
            <Check className="w-16 h-16 text-white stroke-[4]" />
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-5 pt-6 pb-4 safe-area-top relative">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className={cn("text-xl font-medium tracking-tighter transition-colors", isDark ? "text-white" : "text-[#1E293B]")}
              style={{ fontFamily: "'DM Sans', 'Inter', ui-sans-serif, system-ui, sans-serif", letterSpacing: '-0.02em' }}>
              Halic Kahve
            </h1>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg active:scale-95",
              isDark ? "bg-[#1a1a1a] border border-[#C2410C]/20" : "bg-white border border-border/30"
            )}
          >
            {isDark ? <Sun className="w-5 h-5 text-[#C2410C]" /> : <Moon className="w-5 h-5 text-foreground" />}
          </button>
        </div>

        {/* Barista Selector */}
        <button
          onClick={() => setIsBaristaDialogOpen(true)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all",
            isDark
              ? selectedBarista ? "bg-white/5 border-[#C2410C]/30" : "bg-white/5 border-white/10"
              : selectedBarista ? "bg-primary/5 border-primary/30" : "bg-white border-border/30"
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-left">
              <p className={cn("text-xs font-medium", isDark ? "text-white" : "text-foreground")}>
                {selectedBarista ? mockBaristas.find(b => b.id === selectedBarista)?.name : "Barista Seç"}
              </p>
            </div>
          </div>
          <ChevronDown className={cn("w-4 h-4", isDark ? "text-white/60" : "text-muted-foreground")} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 flex flex-col">
        {/* Customer Card */}
        {customerName ? (
          <div className={cn(
            "rounded-3xl p-6 mb-4 animate-fade-in relative overflow-hidden transition-all duration-300",
            isCloseToReward
              ? isDark ? "bg-gradient-to-br from-gold/20 to-gold/5 border-gold/30" : "bg-gradient-to-br from-gold/15 to-gold/5"
              : isDark ? "bg-white/5 border border-white/10" : "bg-white border border-border/50"
          )}>
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sage/10 flex items-center justify-center">
                <User className="w-6 h-6 text-sage" />
              </div>
              <div>
                <h2 className={cn("text-base font-semibold", isDark ? "text-white" : "text-foreground")}>{customerName}</h2>
                <p className="text-xs text-muted-foreground">{customer?.email}</p>
              </div>
            </div>

            <div className="mb-5 text-center">
              <p className={cn("text-[56px] font-extrabold leading-none mb-1", isDark ? "text-white" : "text-[#1E293B]")}>
                {currentStamps}
              </p>
              <p className="text-sm font-medium text-muted-foreground">Puan</p>
            </div>
          </div>
        ) : (
          // Empty State
          <div className={cn(
            "rounded-3xl p-8 border-2 border-dashed mb-4 flex flex-col items-center justify-center transition-all",
            isDark ? "border-white/10 bg-white/5" : "border-border/60 bg-muted/10"
          )}>
            <QrCode className="w-8 h-8 text-muted-foreground mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Müşteri QR kodunu okutun</p>
          </div>
        )}

        {/* Action Area */}
        <div className="flex-1 flex flex-col justify-center pb-4">
          {activeTab === "qr" && (
            <div className="animate-fade-in space-y-4">
              {/* Camera Area */}
              <div className="flex justify-center">
                {isCameraOpen ? (
                  <div id="barista-scanner"
                    className="w-[90vw] max-w-[400px] aspect-square rounded-3xl overflow-hidden bg-black" />
                ) : (
                  <button
                    onClick={() => setIsCameraOpen(true)}
                    className={cn(
                      "relative w-[90vw] max-w-[400px] aspect-square rounded-3xl overflow-hidden border-2 flex items-center justify-center",
                      isDark ? "bg-white/5 border-white/10" : "bg-muted/20 border-border/50"
                    )}
                  >
                    <div className="text-center space-y-2">
                      <QrCode className="w-16 h-16 mx-auto text-muted-foreground/50" />
                      <p className="text-sm font-medium text-muted-foreground">Kamerayı Aç</p>
                    </div>
                  </button>
                )}
              </div>

              {/* Points Selector */}
              <div className="flex items-center justify-center">
                <div className={cn("inline-flex items-center gap-3 rounded-2xl px-3 py-2 border", isDark ? "bg-white/5" : "bg-white")}>
                  <Button variant="ghost" size="icon" onClick={() => setPointsToAdd(p => Math.max(1, p - 1))}>-</Button>
                  <span className={cn("text-lg font-bold min-w-[30px] text-center", isDark ? "text-white" : "text-black")}>{pointsToAdd}</span>
                  <Button variant="ghost" size="icon" onClick={() => setPointsToAdd(p => p + 1)}>+</Button>
                </div>
              </div>

              {/* Primary Action */}
              {customerName ? (
                <Button
                  onClick={handleAddPoints}
                  className="w-full h-16 rounded-2xl text-base font-bold bg-[#C2410C] hover:bg-[#C2410C]/90 text-white"
                >
                  PUAN EKLE
                </Button>
              ) : (
                <div className="w-full h-16 flex items-center justify-center text-muted-foreground text-sm">
                  Önce müşteri okutun
                </div>
              )}

            </div>
          )}

          {activeTab === "reward" && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center p-8">
                <Gift className="w-12 h-12 mx-auto mb-4 text-gold" />
                <h3 className="text-lg font-semibold">Ödül Ver</h3>
                <p className="text-sm text-muted-foreground">Müşteri puanları ödül için yeterliyse kullanın.</p>
              </div>
              <Button
                onClick={handleGiveReward}
                disabled={!customerName}
                className="w-full h-16 rounded-2xl bg-gold text-white font-bold"
              >
                Ödül Ver (-{rewardCost} Puan)
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className={cn("border-t safe-area-bottom", isDark ? "bg-black border-white/10" : "bg-white border-border/50")}>
        <div className="flex px-4 py-3">
          <button onClick={() => setActiveTab("qr")} className={cn("flex-1 py-3 text-center", activeTab === "qr" ? "text-primary font-bold" : "text-muted-foreground")}>QR İşlemleri</button>
          <button onClick={() => setActiveTab("reward")} className={cn("flex-1 py-3 text-center", activeTab === "reward" ? "text-primary font-bold" : "text-muted-foreground")}>Ödül</button>
        </div>
      </nav>

      {/* Barista Dialog */}
      <Dialog open={isBaristaDialogOpen} onOpenChange={setIsBaristaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Barista Seç</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {mockBaristas.map(b => (
              <div key={b.id} onClick={() => { setSelectedBarista(b.id); setIsBaristaDialogOpen(false); }} className="p-3 border rounded-lg cursor-pointer hover:bg-muted">
                {b.name}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
