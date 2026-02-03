import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CafeCard from "@/components/CafeCard";
import BottomNav from "@/components/BottomNav";
import QRModal from "@/components/QRModal";
import { Input } from "@/components/ui/input";
import { Coffee, TrendingUp, Search, Lock } from "lucide-react";
import { HalicKahveLogo } from "@/components/HalicKahveLogo";

// Mock data - all available cafes
const allCafes = [
  { id: 1, name: "Halic Kahve", visits: 2, totalForReward: 5, logoType: "halic" },
  { id: 2, name: "Brew House", visits: 1, totalForReward: 5, logoEmoji: "🫖" },
  { id: 3, name: "Coffee Lab", visits: 4, totalForReward: 5, logoEmoji: "🧪" },
  { id: 4, name: "Starbucks", visits: 0, totalForReward: 5, logoEmoji: "⭐" },
  { id: 5, name: "Kahve Dünyası", visits: 0, totalForReward: 5, logoEmoji: "🌍" },
];

// Mock stats
const weeklyStats = {
  totalPoints: 127,
  thisWeek: 9,
  currentStreak: 5,
};

// Weekly activity data (last 7 days)
const weeklyActivity = [
  { day: "Pzt", value: 3 },
  { day: "Sal", value: 1 },
  { day: "Çar", value: 2 },
  { day: "Per", value: 0 },
  { day: "Cum", value: 2 },
  { day: "Cmt", value: 1 },
  { day: "Paz", value: 0 },
];

const maxActivity = Math.max(...weeklyActivity.map(d => d.value), 1);

const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"qr" | "profile">("qr");
  const [showQRModal, setShowQRModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unfollowedCafes, setUnfollowedCafes] = useState<any[]>([]);
  const [memberCafes, setMemberCafes] = useState<any[]>([]);
  const [showBirthdayPrompt, setShowBirthdayPrompt] = useState(false);
  
  // Mock user data - auto-assigned username
  const getAssignedUsername = () => {
    const stored = localStorage.getItem("assigned-username");
    if (stored) {
      const validMatch = /^KahveSever\d{6}$/.test(stored);
      if (validMatch) return stored;
    }
    const randomSuffix = Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(6, "0");
    const assigned = `KahveSever${randomSuffix}`;
    localStorage.setItem("assigned-username", assigned);
    return assigned;
  };
  const displayName = getAssignedUsername();

  // Load member cafes and unfollowed cafes from localStorage
  useEffect(() => {
    // Get member cafes (cafes that user is a member of)
    const memberIds = allCafes.filter(cafe => {
      const stored = localStorage.getItem(`member-${cafe.id}`);
      return stored === "true";
    }).map(cafe => cafe.id);

    // If no memberships found, initialize with default cafes
    if (memberIds.length === 0) {
      // Initialize with first 3 cafes as default members
      allCafes.slice(0, 3).forEach(cafe => {
        localStorage.setItem(`member-${cafe.id}`, "true");
      });
      setMemberCafes(allCafes.slice(0, 3));
    } else {
      setMemberCafes(allCafes.filter(cafe => memberIds.includes(cafe.id)));
    }

    // Load unfollowed cafes
    const stored = localStorage.getItem("unfollowedCafes");
    if (stored) {
      try {
        setUnfollowedCafes(JSON.parse(stored));
      } catch {
        setUnfollowedCafes([]);
      }
    }

    // Birthday info prompt after registration
    const registrationComplete = localStorage.getItem("registration-complete") === "true";
    const storedBirthdate = localStorage.getItem("user-birthdate");
    setShowBirthdayPrompt(registrationComplete && !storedBirthdate);
  }, []);

  // Filter cafes based on search query (include all cafes and unfollowed cafes)
  const searchResults = searchQuery.trim() 
    ? [
        ...allCafes.filter(cafe => 
          cafe.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        ...unfollowedCafes.filter(cafe => 
          cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !allCafes.some(ac => ac.id === cafe.id)
        )
      ].filter((cafe, index, self) => 
        // Remove duplicates based on id
        index === self.findIndex(c => c.id === cafe.id)
      )
    : [];

  // Check if a cafe is a member cafe
  const isMemberCafe = (cafeId: number) => {
    const stored = localStorage.getItem(`member-${cafeId}`);
    return stored === "true";
  };

  // Check if a cafe is unfollowed
  const isUnfollowedCafe = (cafeId: number) => {
    return unfollowedCafes.some(cafe => cafe.id === cafeId);
  };

  // Handle re-following a cafe
  const handleReFollow = (cafe: any) => {
    localStorage.setItem(`member-${cafe.id}`, "true");
    // Remove from unfollowed list
    const updated = unfollowedCafes.filter(c => c.id !== cafe.id);
    setUnfollowedCafes(updated);
    localStorage.setItem("unfollowedCafes", JSON.stringify(updated));
    // Add to member cafes
    setMemberCafes([...memberCafes, cafe]);
    // Navigate to cafe page
    navigate(`/cafe/${cafe.id}`);
  };

  return (
    <div className="mobile-container min-h-screen bg-background safe-area-top pb-24 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">
            Merhaba, {displayName}!
          </h1>
          <button
            onClick={() => navigate("/profile")}
            className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold uppercase tracking-wide hover:bg-secondary/80 hover:text-foreground transition-colors"
            title="İsmi düzenle"
          >
            Düzenle
          </button>
        </div>
        <p className="text-muted-foreground mt-1 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Bugün kahve içmeye ne dersin?
        </p>
      </header>

      {showBirthdayPrompt && (
        <section className="px-6 pb-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3">
            <p className="text-sm text-foreground font-medium leading-relaxed text-center">
              Doğum günü kampanyasından yararlanmak için lütfen{" "}
              <button
                onClick={() => navigate("/profile")}
                className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors"
              >
                doğum gününü ekle
              </button>
              .
            </p>
          </div>
        </section>
      )}

      {/* Cafes Section - Now at top */}
      <section className="py-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between mb-4 px-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Coffee className="w-5 h-5" />
            Üye Kafelerim
          </h2>
          <span className="text-sm text-muted-foreground">{memberCafes.length} kafe</span>
        </div>

        {/* Search Bar */}
        <div className="px-6 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Kafe ara..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              onFocus={() => {
                if (searchQuery.trim().length > 0) {
                  setShowSearchResults(true);
                }
              }}
              className="pl-9"
            />
          </div>
        </div>

        {/* Search Results */}
        {searchQuery.trim().length > 0 && searchResults.length > 0 && (
          <div className="px-6 mb-4 space-y-2">
            {searchResults.map((cafe) => {
              const isMember = isMemberCafe(cafe.id);
              const isUnfollowed = isUnfollowedCafe(cafe.id);
              const isLocked = isUnfollowed && !isMember;

              return (
                <button
                  key={cafe.id}
                  onClick={() => {
                    if (isLocked) {
                      handleReFollow(cafe);
                    } else if (isMember) {
                      navigate(`/cafe/${cafe.id}`);
                    }
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    isLocked
                      ? "bg-muted/50 border-muted-foreground/30 opacity-75 hover:opacity-100 hover:border-primary/50"
                      : isMember
                      ? "bg-card border-border hover:shadow-card hover:border-primary/20"
                      : "bg-card border-border hover:shadow-card hover:border-primary/20"
                  } active:scale-[0.98]`}
                >
                  {/* Logo */}
                  <div className={`w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0 overflow-hidden ${
                    isLocked ? "opacity-60" : ""
                  }`}>
                    {cafe.logoType === "halic" ? (
                      <HalicKahveLogo size={56} />
                    ) : (
                      cafe.logoEmoji
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-foreground truncate ${isLocked ? "opacity-75" : ""}`}>
                        {cafe.name}
                      </h3>
                      {isLocked && (
                        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    {isMember && !isLocked && (
                      <>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {cafe.visits}/{cafe.totalForReward} ziyaret
                        </p>
                        {/* Mini Progress */}
                        <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${(cafe.visits / cafe.totalForReward) * 100}%` }}
                          />
                        </div>
                      </>
                    )}
                    {isLocked && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Takip etmek için tıklayın
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* No Search Results */}
        {searchQuery.trim().length > 0 && searchResults.length === 0 && (
          <div className="px-6 mb-4 text-center py-8">
            <p className="text-muted-foreground">Sonuç bulunamadı</p>
          </div>
        )}

        {/* Horizontal Scroll - Member Cafes */}
        {searchQuery.trim().length === 0 && (
          <div 
            className="flex gap-3 overflow-x-auto pb-2 px-6 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {memberCafes.map((cafe) => (
              <div key={cafe.id} className="snap-start">
                <CafeCard
                  name={cafe.name}
                  visits={cafe.visits}
                  totalForReward={cafe.totalForReward}
                  logoEmoji={cafe.logoEmoji}
                  logoType={cafe.logoType}
                  onClick={() => navigate(`/cafe/${cafe.id}`)}
                  compact
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Spacer to push activity to bottom */}
      <div className="flex-1" />

      {/* Activity Section - Minimalist */}
      <section className="px-6 mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5" />
          Aktivite
        </h2>
        
        {/* Weekly Bar Graph - Minimal */}
        <div className="flex items-end justify-between gap-3 h-16 mb-6 px-2">
          {weeklyActivity.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full max-w-[24px] mx-auto bg-primary rounded-full transition-all duration-300"
                style={{ 
                  height: item.value > 0 ? `${(item.value / maxActivity) * 100}%` : '6px',
                  opacity: item.value > 0 ? 0.8 : 0.2
                }}
              />
              <span className="text-[10px] text-muted-foreground">{item.day}</span>
            </div>
          ))}
        </div>

        {/* Minimal Stats Row */}
        <div className="flex items-center justify-around py-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{weeklyStats.totalPoints}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Toplam</p>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{weeklyStats.currentStreak} 🔥</p>
            <p className="text-[10px] text-muted-foreground mt-1">Seri</p>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{weeklyStats.thisWeek}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Bu Hafta</p>
          </div>
        </div>
      </section>

      {/* QR Modal */}
      <QRModal open={showQRModal} onOpenChange={setShowQRModal} />

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

export default HomePage;
