import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Flame, MapPin, Instagram, Phone, Globe, Gift, Percent, Coffee, Bell, BellOff, Trophy, TrendingUp, Sparkles, UserMinus, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";
import BottomNav from "@/components/BottomNav";
import QRModal from "@/components/QRModal";
import { HalicKahveLogo } from "@/components/HalicKahveLogo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabase";

const REWARD_GOAL = 5;

const getCampaignIcon = (type: string) => {
  switch (type) {
    case "birthday":
      return Gift;
    case "discount":
      return Percent;
    case "reward":
      return Coffee;
    default:
      return Gift;
  }
};

const getCampaignColor = (type: string) => {
  switch (type) {
    case "birthday":
      return "bg-rose-500/10 text-rose-500";
    case "discount":
      return "bg-amber-500/10 text-amber-500";
    case "reward":
      return "bg-emerald-500/10 text-emerald-500";
    case "event":
      return "bg-blue-500/10 text-blue-500";
    default:
      return "bg-primary/10 text-primary";
  }
};

const CafeDetailPage = () => {
  const navigate = useNavigate();
  const { id: slug } = useParams();
  const { user, loyaltyPoints } = useUser();

  // DB state
  const [cafe, setCafe] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loyalty, setLoyalty] = useState<any>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // UI state
  const [activeTab, setActiveTab] = useState<"qr" | "profile">("qr");
  const [selectedCampaignIndex, setSelectedCampaignIndex] = useState<number | null>(null);
  const [showCafeInfo, setShowCafeInfo] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalCarouselApi, setModalCarouselApi] = useState<CarouselApi>();
  const [modalCurrentSlide, setModalCurrentSlide] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showLoyaltyStats, setShowLoyaltyStats] = useState(false);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);

  // Fetch cafe data from DB
  useEffect(() => {
    if (!slug) return;

    const fetchCafe = async () => {
      setIsPageLoading(true);

      // 1. Fetch cafe info from company_tb
      const { data: cafeData, error: cafeError } = await supabase
        .from("company_tb")
        .select("id, name, slug, logo_url, description, phone, email, website, address")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (cafeError || !cafeData) {
        console.error("Cafe fetch error:", cafeError);
        setIsPageLoading(false);
        return;
      }

      setCafe(cafeData);

      // 2. Fetch campaigns for this cafe
      const { data: campaignData } = await supabase
        .from("campaign_tb")
        .select("id, title, description, type, image_url, reward_points, discount_percentage, start_date, end_date, status")
        .eq("company_id", cafeData.id)
        .eq("is_active", true)
        .eq("status", "active");

      setCampaigns(campaignData || []);

      // 3. Get loyalty for this cafe from context or DB
      if (user) {
        const lp = loyaltyPoints.find((l) => l.company_id === cafeData.id);
        if (lp) {
          setLoyalty(lp);
        } else {
          // Fetch directly
          const { data: loyaltyData } = await supabase
            .from("royalty_tb")
            .select("points, level, visits_count, last_activity")
            .eq("user_id", user.id)
            .eq("company_id", cafeData.id)
            .maybeSingle();

          if (loyaltyData) {
            setLoyalty(loyaltyData);
          }
        }

        // 4. Check follow/subscribe status
        const { data: subData } = await supabase
          .from("user_subscribe_tb")
          .select("id")
          .eq("user_id", user.id)
          .eq("company_id", cafeData.id)
          .eq("is_active", true)
          .maybeSingle();

        setIsFollowing(!!subData);
      }

      // Load selected campaigns from localStorage
      const stored = localStorage.getItem(`selected-campaigns-${cafeData.id}`);
      if (stored) {
        try {
          setSelectedCampaignIds(JSON.parse(stored));
        } catch {
          setSelectedCampaignIds([]);
        }
      }

      setIsPageLoading(false);
    };

    fetchCafe();
  }, [slug, user, loyaltyPoints]);

  // Derived values
  const visits = loyalty?.points || loyalty?.visits_count || 0;
  const level = loyalty?.level || "explorer";
  const isLoyalCustomer = level !== "explorer";
  const remainingForReward = Math.max(REWARD_GOAL - visits, 0);
  const isHalic = slug?.includes("halic");

  const onSelect = useCallback(() => {
    if (!carouselApi) return;
    setCurrentSlide(carouselApi.selectedScrollSnap());
  }, [carouselApi]);

  const onModalSelect = useCallback(() => {
    if (!modalCarouselApi) return;
    setModalCurrentSlide(modalCarouselApi.selectedScrollSnap());
  }, [modalCarouselApi]);

  useEffect(() => {
    if (!carouselApi) return;
    carouselApi.on("select", onSelect);
    onSelect();
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi, onSelect]);

  useEffect(() => {
    if (!modalCarouselApi) return;
    modalCarouselApi.on("select", onModalSelect);
    onModalSelect();
    return () => {
      modalCarouselApi.off("select", onModalSelect);
    };
  }, [modalCarouselApi, onModalSelect]);

  if (isPageLoading) {
    return (
      <div className="mobile-container min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="mobile-container min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Kafe bulunamadı</p>
        <Button variant="cafe" onClick={() => navigate("/home")}>Ana Sayfaya Dön</Button>
      </div>
    );
  }

  // Toggle follow/subscribe in DB
  const handleToggleFollow = async () => {
    if (!user || !cafe) return;
    const newValue = !isFollowing;
    setIsFollowing(newValue);

    if (newValue) {
      await supabase.from("user_subscribe_tb").upsert({
        user_id: user.id,
        company_id: cafe.id,
        is_active: true,
        subscription_date: new Date().toISOString(),
      }, { onConflict: "user_id,company_id" });
    } else {
      await supabase
        .from("user_subscribe_tb")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("company_id", cafe.id);
    }
  };

  const levelLabel = (l: string) => {
    const map: Record<string, string> = { explorer: "Keşifçi", bronze: "Bronz", silver: "Gümüş", gold: "Altın", legend: "Efsane" };
    return map[l] || l;
  };

  return (
    <div className="mobile-container min-h-screen bg-background safe-area-top pb-24 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Cafe Logo & Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCafeInfo(true)}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border-2 border-primary/20 overflow-hidden">
              {isHalic ? (
                <HalicKahveLogo size={40} />
              ) : cafe.logo_url ? (
                <img src={cafe.logo_url} alt={cafe.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">☕</span>
              )}
            </div>
          </button>
          
          {/* Notification Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFollow}
            className={`w-9 h-9 rounded-full transition-all ${
              isFollowing 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {isFollowing ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </Button>

          {/* Follow/Membership Button */}
          <Button
            variant={loyalty ? "ghost" : "default"}
            size="icon"
            onClick={() => {
              if (loyalty) {
                navigate("/home");
              }
            }}
            className={`w-9 h-9 rounded-full transition-all ${
              loyalty 
                ? "bg-secondary text-muted-foreground hover:text-foreground" 
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {loyalty ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Cafe Name */}
      <section className="px-6 pb-2 text-center animate-fade-in">
        <h1 className="text-xl font-bold text-foreground">{cafe.name}</h1>
        {isLoyalCustomer && (
          <button
            onClick={() => setShowLoyaltyStats(true)}
            className="flex items-center justify-center gap-1 bg-accent/10 text-accent px-2 py-1 rounded-full mt-2 w-fit mx-auto hover:bg-accent/20 transition-colors active:scale-95"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{levelLabel(level)}</span>
          </button>
        )}
      </section>

      {/* Progress Section */}
      <section className="px-6 py-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <ProgressBar 
          current={visits} 
          total={REWARD_GOAL} 
          size="lg"
        />
      </section>

      {/* Center Message */}
      <section className="px-6 py-8 flex-1 flex items-center justify-center animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">
            {remainingForReward > 0 ? (
              <>Bedava kahvene <span className="text-accent">{remainingForReward} ziyaret</span> kaldı ☕</>
            ) : (
              <>🎉 Bedava kahveniz hazır! ☕</>
            )}
          </h2>
        </div>
      </section>

      {/* Campaigns Section */}
      {campaigns.length > 0 && (
        <section className="pb-6 mt-auto">
          <h2 className="text-xs font-medium text-muted-foreground mb-3 px-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Kampanyalar
          </h2>
          
          <div className="animate-slide-up" style={{ animationDelay: "0.25s" }}>
            <Carousel
              setApi={setCarouselApi}
              opts={{ align: "start", loop: false }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 px-4">
                {campaigns.map((campaign, index) => {
                  const IconComponent = getCampaignIcon(campaign.type);
                  const color = getCampaignColor(campaign.type);
                  const isSelected = selectedCampaignIds.includes(campaign.id);
                  return (
                    <CarouselItem key={campaign.id} className="pl-2 basis-[85%]">
                      <button
                        onClick={() => setSelectedCampaignIndex(index)}
                        className="w-full text-left p-4 rounded-2xl bg-card border transition-all active:scale-[0.98] hover:border-primary/30"
                        style={{ borderColor: isSelected ? "hsl(var(--primary))" : "hsl(var(--border))" }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
                              {campaign.title}
                            </h3>
                            {campaign.end_date && (
                              <span className="text-xs text-accent font-medium">
                                {new Date(campaign.end_date) > new Date() ? "Aktif" : "Süresi doldu"}
                              </span>
                            )}
                            {!campaign.end_date && (
                              <span className="text-xs text-accent font-medium">Her zaman geçerli</span>
                            )}
                          </div>
                        </div>
                      </button>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
            
            {/* Pagination dots */}
            <div className="flex justify-center gap-1.5 mt-3">
              {campaigns.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    currentSlide === index ? "bg-primary w-4" : "bg-secondary w-1.5"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Campaign Detail Modal */}
      <Dialog open={selectedCampaignIndex !== null} onOpenChange={() => setSelectedCampaignIndex(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[85vh] p-0 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <Carousel
              setApi={setModalCarouselApi}
              opts={{ align: "start", startIndex: selectedCampaignIndex ?? 0, dragFree: true }}
              className="w-full"
            >
              <CarouselContent>
                {campaigns.map((campaign) => {
                  const IconComponent = getCampaignIcon(campaign.type);
                  const color = getCampaignColor(campaign.type);
                  return (
                    <CarouselItem key={campaign.id} className="basis-full">
                      <div className="pt-2">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
                          <IconComponent className="w-7 h-7" />
                        </div>
                        
                        <DialogHeader className="px-0 pt-0 pb-3">
                          <DialogTitle className="text-xl font-bold text-left">
                            {campaign.title}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <p className="text-muted-foreground">{campaign.description}</p>
                          {campaign.discount_percentage && (
                            <div className="bg-secondary/50 p-4 rounded-xl">
                              <p className="text-sm text-foreground">%{campaign.discount_percentage} indirim</p>
                            </div>
                          )}
                          {campaign.reward_points > 0 && (
                            <div className="bg-secondary/50 p-4 rounded-xl">
                              <p className="text-sm text-foreground">{campaign.reward_points} puan ödül</p>
                            </div>
                          )}
                          {!campaign.end_date && (
                            <div className="flex items-center gap-2 text-accent font-medium">
                              <span>⏰</span>
                              <span>Her zaman geçerli</span>
                            </div>
                          )}
                          {selectedCampaignIndex !== null && (
                            <div className="pt-2 pb-3">
                              <Button
                                variant={selectedCampaignIds.includes(campaigns[modalCurrentSlide !== undefined ? modalCurrentSlide : selectedCampaignIndex]?.id) ? "cafe" : "default"}
                                size="sm"
                                className="h-8 px-3 text-xs w-full"
                                onClick={() => {
                                  const currentIndex = modalCurrentSlide !== undefined ? modalCurrentSlide : selectedCampaignIndex;
                                  const c = campaigns[currentIndex];
                                  if (!c) return;
                                  const isSelected = selectedCampaignIds.includes(c.id);
                                  const newSelectedIds = isSelected
                                    ? selectedCampaignIds.filter(cid => cid !== c.id)
                                    : [...selectedCampaignIds, c.id];
                                  setSelectedCampaignIds(newSelectedIds);
                                  localStorage.setItem(`selected-campaigns-${cafe.id}`, JSON.stringify(newSelectedIds));
                                }}
                              >
                                {selectedCampaignIds.includes(campaigns[modalCurrentSlide !== undefined ? modalCurrentSlide : selectedCampaignIndex]?.id) ? "✓ Seçili" : "Kampanyayı Kullan"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              
              {/* Swipe hint and Navigation Arrows */}
              <div className="px-5 pb-4 pt-3 border-t border-border">
                <div className="flex items-center justify-between gap-3">
                  <CarouselPrevious 
                    className="relative left-0 right-0 top-0 translate-y-0 h-8 w-8 rounded-full bg-card border border-border hover:bg-secondary shrink-0"
                  />
                  <p className="text-xs text-muted-foreground text-center flex-1">
                    Sağa sola kaydırarak diğer kampanyaları gör
                  </p>
                  <CarouselNext 
                    className="relative left-0 right-0 top-0 translate-y-0 h-8 w-8 rounded-full bg-card border border-border hover:bg-secondary shrink-0"
                  />
                </div>
              </div>
            </Carousel>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cafe Info Drawer */}
      <Drawer open={showCafeInfo} onOpenChange={setShowCafeInfo}>
        <DrawerContent className="[&>[data-vaul-drawer-handle]]:hidden">
          <div className="px-4 pb-6">
            <DrawerHeader className="px-0">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {isHalic ? (
                    <HalicKahveLogo size={56} />
                  ) : cafe.logo_url ? (
                    <img src={cafe.logo_url} alt={cafe.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">☕</span>
                  )}
                </div>
                <div>
                  <DrawerTitle>{cafe.name}</DrawerTitle>
                  {isLoyalCustomer && (
                    <div className="flex items-center gap-1 text-accent mt-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">En sadık müşterilerimizdensiniz!</span>
                    </div>
                  )}
                </div>
              </div>
            </DrawerHeader>
            
            <div className="space-y-3 mt-4">
              {cafe.address && (
                <a href={`https://maps.google.com/?q=${cafe.address}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="text-sm">{cafe.address}</span>
                </a>
              )}
              {cafe.phone && (
                <a href={`tel:${cafe.phone}`} className="flex items-center gap-3 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="text-sm">{cafe.phone}</span>
                </a>
              )}
              {cafe.website && (
                <a href={`https://${cafe.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="text-sm">{cafe.website}</span>
                </a>
              )}
              
              {/* Membership Management */}
              <div className="pt-2 border-t border-border/50">
                <button
                  onClick={() => navigate("/home")}
                  className="flex items-center gap-3 p-3 w-full text-left rounded-xl hover:bg-destructive/10 transition-colors group"
                >
                  <UserMinus className="w-5 h-5 text-muted-foreground group-hover:text-destructive transition-colors" />
                  <span className="text-sm text-muted-foreground group-hover:text-destructive transition-colors">
                    Üyeliği İptal Et
                  </span>
                </button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* QR Modal */}
      <QRModal 
        open={showQRModal} 
        onOpenChange={setShowQRModal}
        cafeId={cafe.id}
        selectedCampaigns={selectedCampaignIds.map(cid => campaigns.find(c => c.id === cid)).filter(Boolean)}
        onRemoveCampaign={(campaignId) => {
          const newSelectedIds = selectedCampaignIds.filter(cid => cid !== campaignId);
          setSelectedCampaignIds(newSelectedIds);
          localStorage.setItem(`selected-campaigns-${cafe.id}`, JSON.stringify(newSelectedIds));
        }}
      />

      {/* Loyalty Stats Drawer */}
      <Drawer open={showLoyaltyStats} onOpenChange={setShowLoyaltyStats}>
        <DrawerContent className="[&>[data-vaul-drawer-handle]]:hidden max-h-[85vh] safe-area-bottom">
          <div className="px-4 pb-4 pt-1 overflow-y-auto max-h-[calc(85vh-1rem)]">
            <DrawerHeader className="px-0 pb-2">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mb-2 animate-celebrate">
                  <Trophy className="w-7 h-7 text-accent" />
                </div>
                <DrawerTitle className="text-lg font-bold text-foreground mb-1">
                  Sadık Müşteri İstatistikleri
                </DrawerTitle>
                <p className="text-[11px] text-muted-foreground">
                  {cafe.name} ile yolculuğunuz
                </p>
              </div>
            </DrawerHeader>

            <div className="space-y-2.5">
              {/* Detailed Stats */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-accent shrink-0" />
                  Detaylı İstatistikler
                </h3>

                {/* Visit Count */}
                <div className="bg-card rounded-lg p-2.5 border border-border">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground">Toplam Ziyaret</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">Bu kafeye yaptığınız ziyaretler</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-primary">{loyalty?.visits_count || visits}</p>
                      <p className="text-[9px] text-muted-foreground">ziyaret</p>
                    </div>
                  </div>
                </div>

                {/* Points */}
                <div className="bg-card rounded-lg p-2.5 border border-border">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground">Toplam Puan</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">Biriktirdiğiniz puanlar</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-success">{visits}</p>
                      <p className="text-[9px] text-muted-foreground">puan</p>
                    </div>
                  </div>
                </div>

                {/* Loyalty Level */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-2.5 border border-primary/20">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground">Sadakat Seviyesi</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Flame className="w-4 h-4 text-accent" />
                      <span className="text-sm font-bold text-accent">{levelLabel(level)}</span>
                    </div>
                  </div>
                  <div className="bg-background/50 rounded p-1.5">
                    <p className="text-[9px] text-foreground leading-tight">
                      <span className="font-semibold">🎯 Hedef:</span> Bir sonraki ziyarete {remainingForReward} kaldı!
                    </p>
                  </div>
                </div>
              </div>

              {/* Motivational Message */}
              <div className="bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg p-2 border border-accent/30 mt-2">
                <p className="text-[10px] text-center text-foreground font-medium leading-tight">
                  🎉 Harika iş çıkarıyorsunuz! Devam edin! 🎉
                </p>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => {
        if (tab === "qr") {
          setShowQRModal(true);
        } else if (tab === "profile") {
          navigate("/profile");
        }
        setActiveTab(tab);
      }} />
    </div>
  );
};

export default CafeDetailPage;
