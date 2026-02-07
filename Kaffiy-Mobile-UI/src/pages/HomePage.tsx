import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CafeCard from "@/components/CafeCard";
import BottomNav from "@/components/BottomNav";
import QRModal from "@/components/QRModal";
import { Input } from "@/components/ui/input";
import { Coffee, TrendingUp, Search, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabase";

const REWARD_GOAL = 5;

const HomePage = () => {
  const navigate = useNavigate();
  const { user, profile, loyaltyPoints, totalPoints, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState<"qr" | "profile">("qr");
  const [showQRModal, setShowQRModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<{ day: string; value: number }[]>([]);
  const [thisWeekPoints, setThisWeekPoints] = useState(0);
  const [streak, setStreak] = useState(0);

  // Display name from DB profile or fallback
  const displayName = profile?.name || profile?.email?.split("@")[0] || user?.user_metadata?.name || "Kullanıcı";

  // Show birthday prompt if no date_of_birth in profile
  const showBirthdayPrompt = profile && !profile.date_of_birth;

  // Fetch weekly activity from qr_tb (last 7 days)
  useEffect(() => {
    if (!user) return;

    const fetchWeeklyData = async () => {
      const now = new Date();
      const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
      const days: { day: string; value: number }[] = [];
      let weekTotal = 0;
      let currentStreak = 0;
      let streakBroken = false;

      // Get start of week (Monday)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      startOfWeek.setHours(0, 0, 0, 0);

      // Fetch QR scans for last 7 days
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const { data: scans } = await supabase
        .from("qr_tb")
        .select("created_at, points_earned")
        .eq("user_id", user.id)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      // Build daily activity for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const dayScans = (scans || []).filter((s) => {
          const scanDate = new Date(s.created_at);
          return scanDate >= dayStart && scanDate <= dayEnd;
        });

        const dayPoints = dayScans.reduce((sum, s) => sum + (s.points_earned || 0), 0);
        days.push({ day: dayNames[date.getDay()], value: dayPoints });

        // Count this week's points
        if (date >= startOfWeek) {
          weekTotal += dayPoints;
        }

        // Calculate streak (consecutive days with activity, from today backwards)
        if (!streakBroken) {
          if (dayScans.length > 0) {
            currentStreak++;
          } else if (i < 6) {
            streakBroken = true;
          }
        }
      }

      setWeeklyActivity(days);
      setThisWeekPoints(weekTotal);
      setStreak(currentStreak);
    };

    fetchWeeklyData();
  }, [user]);

  // Search cafes from DB
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("company_tb")
        .select("id, name, slug, logo_url")
        .ilike("name", `%${searchQuery}%`)
        .eq("is_active", true)
        .limit(10);

      setSearchResults(data || []);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Max activity for bar chart scaling
  const maxActivity = useMemo(
    () => Math.max(...weeklyActivity.map((d) => d.value), 1),
    [weeklyActivity]
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="mobile-container min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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

      {/* Cafes Section */}
      <section className="py-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between mb-4 px-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Coffee className="w-5 h-5" />
            Üye Kafelerim
          </h2>
          <span className="text-sm text-muted-foreground">{loyaltyPoints.length} kafe</span>
        </div>

        {/* Search Bar */}
        <div className="px-6 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Kafe ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Search Results */}
        {searchQuery.trim().length > 0 && searchResults.length > 0 && (
          <div className="px-6 mb-4 space-y-2">
            {searchResults.map((cafe) => {
              const loyalty = loyaltyPoints.find((lp) => lp.company_id === cafe.id);
              return (
                <button
                  key={cafe.id}
                  onClick={() => navigate(`/cafe/${cafe.slug}`)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border bg-card border-border hover:shadow-card hover:border-primary/20 active:scale-[0.98] transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                    {cafe.logo_url ? (
                      <img src={cafe.logo_url} alt={cafe.name} className="w-full h-full object-cover" />
                    ) : (
                      "☕"
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="font-semibold text-foreground truncate">{cafe.name}</h3>
                    {loyalty ? (
                      <>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {loyalty.points} puan · {loyalty.level}
                        </p>
                        <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((loyalty.points / REWARD_GOAL) * 100, 100)}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-0.5">Henüz üye değilsiniz</p>
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

        {/* Horizontal Scroll - Member Cafes from DB */}
        {searchQuery.trim().length === 0 && (
          <div
            className="flex gap-3 overflow-x-auto pb-2 px-6 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {loyaltyPoints.length > 0 ? (
              loyaltyPoints.map((lp) => (
                <div key={lp.company_id} className="snap-start">
                  <CafeCard
                    name={lp.company_name}
                    visits={lp.points}
                    totalForReward={REWARD_GOAL}
                    logoEmoji="☕"
                    onClick={() => navigate(`/cafe/${lp.company_slug}`)}
                    compact
                  />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-8">
                <p className="text-muted-foreground text-sm">Henüz üye olduğunuz kafe yok</p>
                <p className="text-muted-foreground text-xs mt-1">Bir kafenin QR kodunu taratarak başlayın</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Spacer to push activity to bottom */}
      <div className="flex-1" />

      {/* Activity Section */}
      <section className="px-6 mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5" />
          Aktivite
        </h2>

        {/* Weekly Bar Graph */}
        <div className="flex items-end justify-between gap-3 h-16 mb-6 px-2">
          {weeklyActivity.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full max-w-[24px] mx-auto bg-primary rounded-full transition-all duration-300"
                style={{
                  height: item.value > 0 ? `${(item.value / maxActivity) * 100}%` : "6px",
                  opacity: item.value > 0 ? 0.8 : 0.2,
                }}
              />
              <span className="text-[10px] text-muted-foreground">{item.day}</span>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-around py-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{totalPoints}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Toplam</p>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{streak} 🔥</p>
            <p className="text-[10px] text-muted-foreground mt-1">Seri</p>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{thisWeekPoints}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Bu Hafta</p>
          </div>
        </div>
      </section>

      {/* QR Modal */}
      <QRModal open={showQRModal} onOpenChange={setShowQRModal} />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "qr") {
            setShowQRModal(true);
          } else if (tab === "profile") {
            navigate("/profile");
          }
          setActiveTab(tab);
        }}
      />
    </div>
  );
};

export default HomePage;
