import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Flame, MapPin, Instagram, Phone, Globe, Gift, Percent, Coffee, Bell, BellOff, Trophy, TrendingUp, Sparkles, UserMinus, UserPlus } from "lucide-react";
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
// Mock data for all cafes
const allCafesData: Record<number, any> = {
  1: {
    id: 1,
    name: "Halic Kahve",
    visits: 2,
    totalForReward: 5,
    logoType: "halic",
    logoEmoji: "☕",
    isLoyalCustomer: true,
    address: "Bağdat Caddesi No:123, Kadıköy/İstanbul",
    phone: "+90 216 123 45 67",
    instagram: "@kaffiycafe",
    website: "www.kaffiy.com",
    campaigns: [
      {
        id: 1,
        title: "Doğum Günü Kampanyası",
        description: "Doğum gününüzde 1 dilim pasta hediye.",
        highlight: "Doğum gününde geçerli",
        details: "Doğum tarihinizi profilinize ekleyin ve doğum gününüzde 1 dilim pasta hediyenizi alın.",
        icon: "gift",
        color: "bg-rose-500/10 text-rose-500",
      },
      {
        id: 2,
        title: "Kahve Yanında Tatlı %25 İndirim",
        description: "Her kahve alımında yanında tatlı %25 indirimli.",
        highlight: "Her zaman geçerli",
        details: "Kahve aldığınızda seçtiğiniz tatlıda %25 indirim uygulanır.",
        icon: "percent",
        color: "bg-amber-500/10 text-amber-500",
      },
    ],
  },
  2: {
    id: 2,
    name: "Brew House",
    visits: 3,
    totalForReward: 5,
    logoType: undefined,
    logoEmoji: "🫖",
    isLoyalCustomer: false,
    address: "İstiklal Caddesi No:456, Beyoğlu/İstanbul",
    phone: "+90 212 234 56 78",
    instagram: "@brewhouse",
    website: "www.brewhouse.com",
    campaigns: [
      {
        id: 1,
        title: "Doğum Günü Kampanyası",
        description: "Doğum gününüzde 1 dilim pasta hediye.",
        highlight: "Doğum gününde geçerli",
        details: "Doğum tarihinizi profilinize ekleyin ve doğum gününüzde 1 dilim pasta hediyenizi alın.",
        icon: "gift",
        color: "bg-rose-500/10 text-rose-500",
      },
      {
        id: 2,
        title: "Kahve Yanında Tatlı %25 İndirim",
        description: "Her kahve alımında yanında tatlı %25 indirimli.",
        highlight: "Her zaman geçerli",
        details: "Kahve aldığınızda seçtiğiniz tatlıda %25 indirim uygulanır.",
        icon: "percent",
        color: "bg-amber-500/10 text-amber-500",
      },
    ],
  },
};

const getCampaignIcon = (iconType: string) => {
  switch (iconType) {
    case "gift":
      return Gift;
    case "percent":
      return Percent;
    case "coffee":
      return Coffee;
    default:
      return Gift;
  }
};

const CafeDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const cafeId = id ? parseInt(id) : 1;
  
  // Get cafe data based on ID, fallback to cafe 1 if not found
  const mockCafeData = allCafesData[cafeId] || allCafesData[1];
  
  const [activeTab, setActiveTab] = useState<"qr" | "profile">("qr");
  const [selectedCampaignIndex, setSelectedCampaignIndex] = useState<number | null>(null);
  const [showCafeInfo, setShowCafeInfo] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalCarouselApi, setModalCarouselApi] = useState<CarouselApi>();
  const [modalCurrentSlide, setModalCurrentSlide] = useState(0);
  const [isFollowing, setIsFollowing] = useState(() => {
    // Load from localStorage
    const stored = localStorage.getItem(`following-${mockCafeData.id}`);
    return stored === "true";
  });
  const [isMember, setIsMember] = useState(() => {
    // Load from localStorage
    const stored = localStorage.getItem(`member-${mockCafeData.id}`);
    return stored === "true";
  });
  const [showLoyaltyStats, setShowLoyaltyStats] = useState(false);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<number[]>(() => {
    // Load from localStorage
    const stored = localStorage.getItem(`selected-campaigns-${mockCafeData.id}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Legacy support: if it's a single number, convert to array
        const num = parseInt(stored);
        return isNaN(num) ? [] : [num];
      }
    }
    return [];
  });

  const remainingForReward = mockCafeData.totalForReward - mockCafeData.visits;
  const selectedCampaign = selectedCampaignIndex !== null ? mockCafeData.campaigns[selectedCampaignIndex] : null;

  const onSelect = useCallback(() => {
    if (!carouselApi) return;
    setCurrentSlide(carouselApi.selectedScrollSnap());
    // Don't auto-open modal, only update current slide for pagination dots
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
              {mockCafeData.logoType === "halic" ? (
                <HalicKahveLogo size={40} />
              ) : (
                <span className="text-xl">{mockCafeData.logoEmoji}</span>
              )}
            </div>
          </button>
          
          {/* Notification Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const newValue = !isFollowing;
              setIsFollowing(newValue);
              localStorage.setItem(`following-${mockCafeData.id}`, String(newValue));
            }}
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
            variant={isMember ? "ghost" : "default"}
            size="icon"
            onClick={() => {
              if (isMember) {
                // Unfollow - navigate to home
                setIsMember(false);
                localStorage.removeItem(`member-${mockCafeData.id}`);
                // Save cafe data for search
                const unfollowedCafes = JSON.parse(localStorage.getItem("unfollowedCafes") || "[]");
                if (!unfollowedCafes.find((c: any) => c.id === mockCafeData.id)) {
                  unfollowedCafes.push({
                    id: mockCafeData.id,
                    name: mockCafeData.name,
                    visits: mockCafeData.visits,
                    totalForReward: mockCafeData.totalForReward,
                    logoType: mockCafeData.logoType,
                    logoEmoji: (mockCafeData as any).logoEmoji || "☕",
                  });
                  localStorage.setItem("unfollowedCafes", JSON.stringify(unfollowedCafes));
                }
                navigate("/home");
              } else {
                // Follow
                setIsMember(true);
                localStorage.setItem(`member-${mockCafeData.id}`, "true");
                // Remove from unfollowed list if exists
                const unfollowedCafes = JSON.parse(localStorage.getItem("unfollowedCafes") || "[]");
                const updated = unfollowedCafes.filter((c: any) => c.id !== mockCafeData.id);
                localStorage.setItem("unfollowedCafes", JSON.stringify(updated));
              }
            }}
            className={`w-9 h-9 rounded-full transition-all ${
              isMember 
                ? "bg-secondary text-muted-foreground hover:text-foreground" 
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isMember ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Cafe Name */}
      <section className="px-6 pb-2 text-center animate-fade-in">
        <h1 className="text-xl font-bold text-foreground">{mockCafeData.name}</h1>
        {mockCafeData.isLoyalCustomer && (
          <button
            onClick={() => setShowLoyaltyStats(true)}
            className="flex items-center justify-center gap-1 bg-accent/10 text-accent px-2 py-1 rounded-full mt-2 w-fit mx-auto hover:bg-accent/20 transition-colors active:scale-95"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Sadık</span>
          </button>
        )}
      </section>

      {/* Progress Section - Compact */}
      <section className="px-6 py-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <ProgressBar 
          current={mockCafeData.visits} 
          total={mockCafeData.totalForReward} 
          size="lg"
        />
      </section>

      {/* Center Message */}
      <section className="px-6 py-8 flex-1 flex items-center justify-center animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Bedava kahvene <span className="text-accent">{remainingForReward} ziyaret</span> kaldı ☕
          </h2>
        </div>
      </section>

      {/* Campaigns Section - Visual Cards with Swipe */}
      <section className="pb-6 mt-auto">
        <h2 className="text-xs font-medium text-muted-foreground mb-3 px-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Kampanyalar
        </h2>
        
        <div className="animate-slide-up" style={{ animationDelay: "0.25s" }}>
          <Carousel
            setApi={setCarouselApi}
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 px-4">
              {mockCafeData.campaigns.map((campaign, index) => {
                const IconComponent = getCampaignIcon(campaign.icon);
                const isSelected = selectedCampaignIds.includes(campaign.id);
                return (
                  <CarouselItem key={campaign.id} className="pl-2 basis-[85%]">
                    <button
                      onClick={() => setSelectedCampaignIndex(index)}
                      className="w-full text-left p-4 rounded-2xl bg-card border transition-all active:scale-[0.98] hover:border-primary/30"
                      style={{
                        borderColor: isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${campaign.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
                            {campaign.title}
                          </h3>
                          {campaign.highlight && (
                            <span className="text-xs text-accent font-medium">
                              {campaign.highlight}
                            </span>
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
            {mockCafeData.campaigns.map((_, index) => (
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

      {/* Campaign Detail Modal with Swipe */}
      <Dialog open={selectedCampaignIndex !== null} onOpenChange={() => setSelectedCampaignIndex(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[85vh] p-0 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <Carousel
              setApi={setModalCarouselApi}
              opts={{
                align: "start",
                startIndex: selectedCampaignIndex ?? 0,
                dragFree: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {mockCafeData.campaigns.map((campaign) => {
                  const IconComponent = getCampaignIcon(campaign.icon);
                  return (
                    <CarouselItem key={campaign.id} className="basis-full">
                      <div className="pt-2">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${campaign.color}`}>
                          <IconComponent className="w-7 h-7" />
                        </div>
                        
                        <DialogHeader className="px-0 pt-0 pb-3">
                          <DialogTitle className="text-xl font-bold text-left">
                            {campaign.title}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <p className="text-muted-foreground">{campaign.description}</p>
                          {campaign.details && (
                            <div className="bg-secondary/50 p-4 rounded-xl">
                              <p className="text-sm text-foreground">{campaign.details}</p>
                            </div>
                          )}
                          {campaign.highlight && (
                            <div className="flex items-center gap-2 text-accent font-medium">
                              <span>⏰</span>
                              <span>{campaign.highlight}</span>
                            </div>
                          )}
                          {selectedCampaignIndex !== null && (
                            <div className="pt-2 pb-3">
                              <Button
                                variant={selectedCampaignIds.includes(mockCafeData.campaigns[modalCurrentSlide !== undefined ? modalCurrentSlide : selectedCampaignIndex].id) ? "cafe" : "default"}
                                size="sm"
                                className="h-8 px-3 text-xs w-full"
                                onClick={() => {
                                  const currentIndex = modalCurrentSlide !== undefined ? modalCurrentSlide : selectedCampaignIndex;
                                  const campaign = mockCafeData.campaigns[currentIndex];
                                  const isSelected = selectedCampaignIds.includes(campaign.id);
                                  const newSelectedIds = isSelected
                                    ? selectedCampaignIds.filter(id => id !== campaign.id)
                                    : [...selectedCampaignIds, campaign.id];
                                  setSelectedCampaignIds(newSelectedIds);
                                  localStorage.setItem(`selected-campaigns-${mockCafeData.id}`, JSON.stringify(newSelectedIds));
                                }}
                              >
                                {selectedCampaignIds.includes(mockCafeData.campaigns[modalCurrentSlide !== undefined ? modalCurrentSlide : selectedCampaignIndex].id) ? "✓ Seçili" : "Kampanyayı Kullan"}
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
                  {mockCafeData.logoType === "halic" ? (
                    <HalicKahveLogo size={56} />
                  ) : (
                    <span className="text-2xl">{mockCafeData.logoEmoji}</span>
                  )}
                </div>
                <div>
                  <DrawerTitle>{mockCafeData.name}</DrawerTitle>
                  {mockCafeData.isLoyalCustomer && (
                    <div className="flex items-center gap-1 text-accent mt-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">En sadık müşterilerimizdensiniz!</span>
                    </div>
                  )}
                </div>
              </div>
            </DrawerHeader>
            
            <div className="space-y-3 mt-4">
              <a href={`https://maps.google.com/?q=${mockCafeData.address}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm">{mockCafeData.address}</span>
              </a>
              <a href={`tel:${mockCafeData.phone}`} className="flex items-center gap-3 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-sm">{mockCafeData.phone}</span>
              </a>
              <a href={`https://instagram.com/${mockCafeData.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
                <Instagram className="w-5 h-5 text-primary" />
                <span className="text-sm">{mockCafeData.instagram}</span>
              </a>
              <a href={`https://${mockCafeData.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-sm">{mockCafeData.website}</span>
              </a>
              
              {/* Membership Management */}
              <div className="pt-2 border-t border-border/50">
                <button
                  onClick={() => {
                    setIsMember(false);
                    localStorage.removeItem(`member-${mockCafeData.id}`);
                    // Save cafe data for search
                    const unfollowedCafes = JSON.parse(localStorage.getItem("unfollowedCafes") || "[]");
                    if (!unfollowedCafes.find((c: any) => c.id === mockCafeData.id)) {
                      unfollowedCafes.push({
                        id: mockCafeData.id,
                        name: mockCafeData.name,
                        visits: mockCafeData.visits,
                        totalForReward: mockCafeData.totalForReward,
                        logoType: mockCafeData.logoType,
                        logoEmoji: (mockCafeData as any).logoEmoji || "☕",
                      });
                      localStorage.setItem("unfollowedCafes", JSON.stringify(unfollowedCafes));
                    }
                    navigate("/home");
                  }}
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
        cafeId={mockCafeData.id}
        selectedCampaigns={selectedCampaignIds.map(id => mockCafeData.campaigns.find(c => c.id === id)).filter(Boolean) as typeof mockCafeData.campaigns}
        onRemoveCampaign={(campaignId) => {
          const newSelectedIds = selectedCampaignIds.filter(id => id !== campaignId);
          setSelectedCampaignIds(newSelectedIds);
          localStorage.setItem(`selected-campaigns-${mockCafeData.id}`, JSON.stringify(newSelectedIds));
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
                  {mockCafeData.name} ile yolculuğunuz
                </p>
              </div>
            </DrawerHeader>

            <div className="space-y-2.5">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 gap-2">
                {/* Total Savings */}
                <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-lg p-2.5 border border-success/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-success shrink-0" />
                    <span className="text-[10px] font-medium text-muted-foreground leading-tight">Toplam Tasarruf</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-foreground">₺450</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">Harika biriktirdiniz! 💰</p>
                </div>
              </div>

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
                      <p className="text-base font-bold text-primary">{mockCafeData.visits}</p>
                      <p className="text-[9px] text-muted-foreground">ziyaret</p>
                    </div>
                  </div>
                </div>

                {/* Money Saved */}
                <div className="bg-card rounded-lg p-2.5 border border-border">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground">Toplam Tasarruf</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">İndirimler ve ödüllerle</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-success">₺450</p>
                      <p className="text-[9px] text-muted-foreground">tasarruf</p>
                    </div>
                  </div>
                  <div className="bg-success/10 rounded p-1.5">
                    <p className="text-[9px] text-success font-medium leading-tight">💰 Bu tutarı başka şeylere harcayabilirsiniz!</p>
                  </div>
                </div>

                {/* Loyalty Level */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-2.5 border border-primary/20">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground">Sadakat Seviyesi</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">Mükemmel performans!</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Flame className="w-4 h-4 text-accent" />
                      <span className="text-sm font-bold text-accent">VIP</span>
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
