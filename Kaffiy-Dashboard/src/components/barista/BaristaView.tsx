import { useState } from "react";
import { QrCode, Gift, Check, User, Coffee, Star, Sparkles, ChevronDown, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type ActiveTab = "qr" | "reward";

const mockBaristas = [
  { id: "1", name: "Ayşe K." },
  { id: "2", name: "Mehmet Y." },
  { id: "3", name: "Zeynep A." },
  { id: "4", name: "Can D." },
];

export const BaristaView = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>("qr");
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [currentStamps, setCurrentStamps] = useState(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedBarista, setSelectedBarista] = useState<string | null>(null);
  const [isBaristaDialogOpen, setIsBaristaDialogOpen] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState(1);
  const dailyRewardLimit = 1;
  const rewardCost = 5;
  const rewardGoal = 5;
  const [dailyRewardsUsed, setDailyRewardsUsed] = useState(0);
  const { toast } = useToast();

  const handleQRScan = () => {
    const basePoints = customerName ? currentStamps : 3;
    setCustomerName("Ahmet Y.");
    setCurrentStamps(Math.min(rewardGoal, basePoints + pointsToAdd));
    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 2000);
    toast({
      title: "Müşteri bulundu",
      description: `Ahmet Y. - +${pointsToAdd} puan`,
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
      isDark 
        ? "bg-[#000000]" 
        : "bg-[#F8FAFC]"
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
            <h1 
              className={cn(
                "text-xl font-medium tracking-tighter transition-colors",
                isDark ? "text-white" : "text-[#1E293B]"
              )}
              style={{ 
                fontFamily: "'DM Sans', 'Inter', ui-sans-serif, system-ui, sans-serif",
                letterSpacing: '-0.02em'
              }}
            >
              Halic Kahve
            </h1>
          </div>
          
          {/* Theme Switcher - Top Right */}
          <button
            onClick={toggleTheme}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
              "shadow-lg active:scale-95",
              isDark
                ? "bg-[#1a1a1a] border border-[#C2410C]/20 hover:border-[#C2410C]/40"
                : "bg-white border border-border/30 hover:border-border/50"
            )}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-[#C2410C]" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
        
        {/* Barista Selector */}
        <button
          onClick={() => setIsBaristaDialogOpen(true)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all",
            isDark
              ? selectedBarista
                ? "bg-white/5 border-[#C2410C]/30 hover:bg-white/10 backdrop-blur-sm"
                : "bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-sm"
              : selectedBarista
                ? "bg-primary/5 border-primary/30 hover:bg-primary/10"
                : "bg-white border-border/30 hover:bg-muted/50 shadow-sm"
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              isDark
                ? selectedBarista 
                  ? "bg-[#C2410C]/20" 
                  : "bg-white/10"
                : selectedBarista 
                  ? "bg-primary/10" 
                  : "bg-muted"
            )}>
              <User className={cn(
                "w-4 h-4",
                isDark
                  ? selectedBarista ? "text-[#C2410C]" : "text-white/60"
                  : selectedBarista ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div className="text-left">
              <p className={cn(
                "text-xs font-medium transition-colors",
                isDark ? "text-white" : "text-foreground"
              )}>
                {selectedBarista 
                  ? mockBaristas.find(b => b.id === selectedBarista)?.name || "Barista Seç"
                  : "Barista Seç"}
              </p>
              <p className={cn(
                "text-[10px] transition-colors",
                isDark ? "text-white/60" : "text-muted-foreground"
              )}>
                {selectedBarista ? "Aktif barista" : "Baristanızı seçin"}
              </p>
            </div>
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 transition-colors",
            isDark ? "text-white/60" : "text-muted-foreground"
          )} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 flex flex-col">
        {/* Customer Card - Enhanced design */}
        {customerName ? (
          <div className={cn(
            "rounded-3xl p-6 mb-4 animate-fade-in relative overflow-hidden transition-all duration-300",
            isCloseToReward 
              ? isDark
                ? "bg-gradient-to-br from-gold/20 via-gold/10 to-gold/5 border border-gold/30 shadow-[0_0_30px_rgba(212,175,55,0.3)] backdrop-blur-sm"
                : "bg-gradient-to-br from-gold/15 via-gold/10 to-gold/5 border border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
              : isDark
                ? "bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                : "bg-white border border-border/50 shadow-sm"
          )}>
            {/* Decorative elements for close to reward */}
            {isCloseToReward && (
              <>
                <div className="absolute top-3 right-3">
                  <Sparkles className="w-5 h-5 text-gold animate-pulse" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold/10 rounded-full blur-2xl" />
              </>
            )}
            
            <div className="flex items-center gap-3.5 mb-6 relative">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                isCloseToReward 
                  ? "bg-gradient-to-br from-gold/30 to-gold/10"
                  : isDark
                    ? "bg-[#C2410C]/20"
                    : "bg-sage/10"
              )}>
                <User className={cn(
                  "w-6 h-6", 
                  isCloseToReward 
                    ? "text-gold" 
                    : isDark 
                      ? "text-[#C2410C]" 
                      : "text-sage"
                )} />
              </div>
              <div className="flex-1">
                <h2 className={cn(
                  "text-base font-semibold transition-colors",
                  isDark ? "text-white" : "text-foreground"
                )}>{customerName}</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Star className="w-3 h-3 text-gold fill-gold" />
                  <p className={cn(
                    "text-xs transition-colors",
                    isDark ? "text-white/70" : "text-muted-foreground"
                  )}>Sadık müşteri • 23 ziyaret</p>
                </div>
              </div>
            </div>
            
            {/* Customer Points - Hero Display */}
            <div className="mb-5 text-center">
              <p className={cn(
                "text-[56px] font-extrabold leading-none mb-1 transition-colors",
                isDark ? "text-white" : "text-[#1E293B]"
              )} style={{ 
                fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
                fontWeight: 800,
                letterSpacing: '-0.03em'
              }}>
                {currentStamps}
              </p>
              <p className={cn(
                "text-sm font-medium transition-colors",
                isDark ? "text-white/60" : "text-muted-foreground"
              )}>Puan</p>
            </div>
            
            {/* Stamp Progress - Coffee cup icons */}
            <div className="space-y-3 relative">
              <div className="flex justify-between items-center">
                <span className={cn(
                  "text-xs font-medium transition-colors",
                  isDark ? "text-white/70" : "text-muted-foreground"
                )}>Puan Durumu</span>
                <span className={cn(
                  "text-sm font-bold px-3 py-1 rounded-full",
                  isCloseToReward 
                    ? "bg-gold/20 text-gold"
                    : isDark
                      ? "bg-[#C2410C]/20 text-[#C2410C]"
                      : "bg-sage/10 text-sage"
                )}>
                  {currentStamps}/{rewardGoal}
                </span>
              </div>
              
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: rewardGoal }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "aspect-square rounded-xl flex items-center justify-center transition-all duration-300",
                      i < currentStamps 
                        ? isCloseToReward
                          ? "bg-gradient-to-br from-gold to-gold/80 shadow-sm"
                          : isDark
                            ? "bg-[#C2410C] shadow-[0_0_10px_rgba(194,65,12,0.4)]"
                            : "bg-sage shadow-sm"
                        : isDark
                          ? "bg-white/10"
                          : "bg-muted/40"
                    )}
                  >
                    <Coffee className={cn(
                      "w-3 h-3",
                      i < currentStamps ? "text-white" : isDark ? "text-white/20" : "text-muted-foreground/30"
                    )} />
                  </div>
                ))}
              </div>
              
              {isCloseToReward && (
                <div className="flex items-center justify-center gap-2 pt-1">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                  <p className="text-xs text-gold font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {rewardGoal - currentStamps} puan kaldı!
                  </p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={cn(
            "rounded-3xl p-8 border-2 border-dashed mb-4 flex flex-col items-center justify-center transition-all duration-300",
            isDark
              ? "border-white/10 bg-white/5 backdrop-blur-sm"
              : "border-border/60 bg-gradient-to-b from-muted/20 to-muted/5"
          )}>
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
              isDark ? "bg-[#C2410C]/20" : "bg-sage/10"
            )}>
              <QrCode className={cn(
                "w-8 h-8",
                isDark ? "text-[#C2410C]/60" : "text-sage/60"
              )} />
            </div>
            <p className={cn(
              "text-sm font-medium text-center transition-colors",
              isDark ? "text-white/80" : "text-muted-foreground"
            )}>
              Müşteri QR kodunu okutun
            </p>
            <p className={cn(
              "text-xs text-center mt-1 transition-colors",
              isDark ? "text-white/50" : "text-muted-foreground/60"
            )}>
              İşlem yapmak için müşteriyi tanımlayın
            </p>
          </div>
        )}

        {/* Action Area - Hero Section for QR */}
        <div className="flex-1 flex flex-col justify-center pb-4">
          {activeTab === "qr" && (
            <div className="animate-fade-in space-y-4">
              {/* Camera Viewfinder - Hero Section */}
              <div className="flex justify-center">
                <button
                  onClick={() => setIsCameraOpen(!isCameraOpen)}
                  className={cn(
                    "relative w-[90vw] max-w-[400px] aspect-square rounded-3xl overflow-hidden",
                    "border-2 flex items-center justify-center transition-all duration-300",
                    "active:scale-[0.98]",
                    isDark
                      ? isCameraOpen
                        ? "bg-white/5 border-[#C2410C]/50 shadow-lg shadow-[#C2410C]/20 backdrop-blur-sm"
                        : "bg-white/5 border-white/10 hover:border-white/20 backdrop-blur-sm"
                      : isCameraOpen
                        ? "bg-gradient-to-br from-muted/40 to-muted/20 border-primary/50 shadow-lg shadow-primary/10"
                        : "bg-gradient-to-br from-muted/40 to-muted/20 border-border/50 hover:border-border"
                  )}
                >
                  {isCameraOpen ? (
                    <div className={cn(
                      "absolute inset-0 flex items-center justify-center",
                      isDark 
                        ? "bg-gradient-to-br from-[#C2410C]/10 to-[#C2410C]/5" 
                        : "bg-gradient-to-br from-primary/10 to-primary/5"
                    )}>
                      <div className="text-center space-y-2">
                        <QrCode className={cn(
                          "w-16 h-16 mx-auto",
                          isDark ? "text-[#C2410C]/60" : "text-primary/60"
                        )} strokeWidth={1.5} />
                        <p className={cn(
                          "text-sm font-medium transition-colors",
                          isDark ? "text-white/70" : "text-muted-foreground"
                        )}>Kamera Aktif</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className={cn(
                          "text-base font-medium animate-pulse transition-colors",
                          isDark ? "text-white/50" : "text-muted-foreground/40"
                        )}>
                          Müşteri Kartını Göster
                        </p>
                      </div>
                    </>
                  )}
                </button>
              </div>

              {/* Points Selector */}
              <div className="flex items-center justify-center">
                <div className={cn(
                  "inline-flex items-center gap-3 rounded-2xl px-3 py-2 border",
                  isDark
                    ? "bg-white/5 border-white/10"
                    : "bg-white border-border/50 shadow-sm"
                )}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setPointsToAdd((prev) => Math.max(1, prev - 1))}
                    className={cn(
                      "w-9 h-9 rounded-xl",
                      isDark ? "text-white/80 hover:text-white" : "text-foreground"
                    )}
                    aria-label="Puan azalt"
                  >
                    -
                  </Button>
                  <div className="text-center min-w-[64px]">
                    <p className={cn(
                      "text-[10px] uppercase tracking-wide",
                      isDark ? "text-white/50" : "text-muted-foreground"
                    )}>
                      Puan
                    </p>
                    <p className={cn(
                      "text-lg font-bold",
                      isDark ? "text-white" : "text-foreground"
                    )}>
                      {pointsToAdd}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setPointsToAdd((prev) => Math.min(rewardGoal, prev + 1))}
                    className={cn(
                      "w-9 h-9 rounded-xl",
                      isDark ? "text-white/80 hover:text-white" : "text-foreground"
                    )}
                    aria-label="Puan artır"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Primary Action Button - Always Brand Orange */}
              <Button
                onClick={() => {
                  setIsCameraOpen(!isCameraOpen);
                  if (!isCameraOpen) {
                    handleQRScan();
                  }
                }}
                className={cn(
                  "w-full h-16 rounded-2xl text-base font-bold shadow-lg transition-all duration-300",
                  "bg-[#C2410C] hover:bg-[#C2410C]/90 text-white",
                  "active:scale-[0.98]",
                  isDark && "shadow-[0_0_30px_rgba(194,65,12,0.4)] hover:shadow-[0_0_40px_rgba(194,65,12,0.5)]"
                )}
                style={{ paddingTop: "18px", paddingBottom: "18px" }}
              >
                QR TARA
              </Button>

              {/* Secondary Action - Text Only */}
              <button
                onClick={() => {
                  // Kod girme işlevselliği buraya eklenecek
                  toast({
                    title: "Yakında",
                    description: "Kod ile giriş yakında eklenecek",
                  });
                }}
                className={cn(
                  "w-full text-center text-sm transition-colors py-3",
                  isDark 
                    ? "text-white/60 hover:text-white/80" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                veya kodu gir
              </button>
            </div>
          )}

          {activeTab === "reward" && (
            <div className="space-y-5 animate-fade-in">
              <div className={cn(
                "rounded-3xl p-6 border text-center relative overflow-hidden transition-all duration-300",
                isDark
                  ? "bg-gradient-to-br from-gold/20 via-gold/10 to-gold/5 border-gold/30 backdrop-blur-sm shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                  : "bg-gradient-to-br from-gold/15 via-gold/10 to-gold/5 border-gold/25"
              )}>
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-gold/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gold/15 rounded-full blur-xl" />
                
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center mx-auto mb-3">
                    <Gift className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className={cn(
                    "text-lg font-semibold mb-1 transition-colors",
                    isDark ? "text-white" : "text-foreground"
                  )}>Ücretsiz Kahve</h3>
                  <p className={cn(
                    "text-sm transition-colors",
                    isDark ? "text-white/70" : "text-muted-foreground"
                  )}>{rewardCost} puan karşılığı hediye</p>
                </div>
              </div>

              <div className={cn(
                "rounded-2xl px-4 py-3 border flex items-center justify-between text-xs",
                isDark ? "bg-white/5 border-white/10 text-white/70" : "bg-white border-border/50 text-muted-foreground"
              )}>
                <span>Günlük limit</span>
                <span className={cn(
                  "font-semibold",
                  dailyRewardsUsed >= dailyRewardLimit ? "text-destructive" : "text-success"
                )}>
                  {dailyRewardsUsed}/{dailyRewardLimit}
                </span>
              </div>
              
              <Button
                onClick={handleGiveReward}
                disabled={!customerName}
                className={cn(
                  "w-full h-16 rounded-2xl text-white text-base font-bold shadow-lg transition-all",
                  "bg-gradient-to-r from-gold to-gold/90 hover:from-gold/90 hover:to-gold",
                  "disabled:opacity-40 disabled:shadow-none active:scale-[0.98]",
                  isDark && "shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]"
                )}
                style={{ paddingTop: "18px", paddingBottom: "18px" }}
              >
                <Check className="w-5 h-5 mr-2" />
                Ödül Ver
              </Button>
              
              {!customerName && (
                <p className={cn(
                  "text-center text-xs transition-colors",
                  isDark ? "text-white/60" : "text-muted-foreground"
                )}>
                  Önce QR okutarak müşteriyi tanımlayın
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation - Refined */}
      <nav className={cn(
        "border-t safe-area-bottom transition-all duration-300",
        isDark
          ? "bg-black/80 backdrop-blur-lg border-white/10"
          : "bg-card/80 backdrop-blur-lg border-border/50"
      )}>
        <div className="flex px-4 py-3">
          {[
            { id: "qr" as const, label: "QR Okut", icon: QrCode },
            { id: "reward" as const, label: "Ödül", icon: Gift },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-200",
                activeTab === tab.id
                  ? "text-[#C2410C]"
                  : isDark
                    ? "text-white/60 hover:text-white/80"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
                activeTab === tab.id 
                  ? isDark
                    ? "bg-[#C2410C]/20"
                    : "bg-[#C2410C]/10" 
                  : "bg-transparent"
              )}>
                <tab.icon 
                  className={cn(
                    "w-5 h-5 transition-transform",
                    activeTab === tab.id && "scale-110"
                  )}
                  strokeWidth={activeTab === tab.id ? 2.5 : 2}
                />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                activeTab === tab.id 
                  ? "text-[#C2410C] font-semibold" 
                  : isDark 
                    ? "text-white/60" 
                    : "text-muted-foreground"
              )}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Barista Selection Dialog */}
      <Dialog open={isBaristaDialogOpen} onOpenChange={setIsBaristaDialogOpen}>
        <DialogContent className={cn(
          "max-w-[340px] rounded-2xl p-0 gap-0 border transition-all duration-300",
          isDark
            ? "bg-black/95 backdrop-blur-xl border-white/10"
            : "bg-card border-border/50"
        )}>
          <DialogHeader className={cn(
            "px-5 pt-5 pb-4 border-b transition-colors",
            isDark ? "border-white/10" : "border-border/30"
          )}>
            <DialogTitle className={cn(
              "text-base font-semibold transition-colors",
              isDark ? "text-white" : "text-foreground"
            )}>Barista Seç</DialogTitle>
            <DialogDescription className={cn(
              "text-xs mt-1 transition-colors",
              isDark ? "text-white/60" : "text-muted-foreground"
            )}>
              Çalışan baristanızı seçin
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-5 py-4 space-y-2">
            {mockBaristas.map((barista) => (
              <button
                key={barista.id}
                onClick={() => {
                  setSelectedBarista(barista.id);
                  setIsBaristaDialogOpen(false);
                  toast({
                    title: "Barista seçildi",
                    description: `${barista.name} olarak giriş yaptınız`,
                  });
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-4 rounded-xl border transition-all text-left",
                  isDark
                    ? selectedBarista === barista.id
                      ? "bg-[#C2410C]/20 border-[#C2410C]/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    : selectedBarista === barista.id
                      ? "bg-primary/10 border-primary/30"
                      : "bg-muted/20 border-border/30 hover:bg-muted/40 hover:border-border/50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isDark
                    ? selectedBarista === barista.id ? "bg-[#C2410C]/30" : "bg-white/10"
                    : selectedBarista === barista.id ? "bg-primary/20" : "bg-muted"
                )}>
                  <User className={cn(
                    "w-5 h-5",
                    isDark
                      ? selectedBarista === barista.id ? "text-[#C2410C]" : "text-white/60"
                      : selectedBarista === barista.id ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium transition-colors",
                    isDark
                      ? selectedBarista === barista.id ? "text-[#C2410C]" : "text-white"
                      : selectedBarista === barista.id ? "text-primary" : "text-foreground"
                  )}>
                    {barista.name}
                  </p>
                  {selectedBarista === barista.id && (
                    <p className={cn(
                      "text-[10px] mt-0.5 transition-colors",
                      isDark ? "text-[#C2410C]/70" : "text-primary/70"
                    )}>Aktif</p>
                  )}
                </div>
                {selectedBarista === barista.id && (
                  <Check className={cn(
                    "w-4 h-4",
                    isDark ? "text-[#C2410C]" : "text-primary"
                  )} />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
