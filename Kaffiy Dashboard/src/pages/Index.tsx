import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VisitsChart } from "@/components/dashboard/VisitsChart";
import { TrialProgress } from "@/components/dashboard/TrialProgress";
import { ChurnAlert } from "@/components/dashboard/ChurnAlert";
import { LockedChurnAlert } from "@/components/dashboard/LockedChurnAlert";
import { QuickActions, QuickActionButtons, AnalyticsCard } from "@/components/dashboard/QuickActions";
import { WeeklyStatsCard } from "@/components/dashboard/WeeklyStatsCard";
import { ActiveCampaignsCard } from "@/components/dashboard/ActiveCampaignsCard";
import { LiveFeed } from "@/components/dashboard/LiveFeed";
import { LiveActivityCard } from "@/components/dashboard/LiveActivityCard";
import { VisitAnalysisCard } from "@/components/dashboard/VisitAnalysisCard";
import { SimpleCampaignsCard } from "@/components/dashboard/SimpleCampaignsCard";
import { Chatbot } from "@/components/dashboard/Chatbot";
import { BaristaView } from "@/components/barista/BaristaView";
import { QRRewardStatsCard } from "@/components/dashboard/QRRewardStatsCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePremium } from "@/contexts/PremiumContext";
import { useDashboardCards } from "@/contexts/DashboardCardsContext";
import { useDashboardView } from "@/hooks/use-dashboard-view";
import { DashboardDateRangeProvider } from "@/contexts/DashboardDateRangeContext";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const isMobile = useIsMobile();
  const { isPremium } = usePremium();
  const { getCardVisibility } = useDashboardCards();
  const { isSimpleView } = useDashboardView();
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate("/settings?tab=dashboard");
  };

  // Mobile: Show Barista View
  if (isMobile) {
    return <BaristaView />;
  }

  // Desktop & Tablet: Show Dashboard based on view mode
  return (
    <DashboardDateRangeProvider>
      <DashboardLayout>
      {/* Dashboard Panels Shortcut - Fixed top right */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSettingsClick}
        className={cn(
          "fixed top-20 right-4 z-50 w-8 h-8 rounded-full",
          "bg-background/80 backdrop-blur-sm border border-border/50",
          "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          "shadow-sm transition-all duration-200",
          "lg:top-24 lg:right-6"
        )}
        aria-label="Dashboard Panelleri"
      >
        <LayoutDashboard className="w-4 h-4" />
      </Button>

      {isSimpleView ? (
        // Simple View - 3 Card Layout
        <div 
          className="space-y-5 lg:space-y-6 relative"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
            {/* Kart 1: Canlı Akış (Sol Üst) */}
            <div className="lg:col-span-4">
              <LiveActivityCard />
            </div>

            {/* Kart 2: Ziyaret Analizi (Orta) */}
            <div className="lg:col-span-8">
              <VisitAnalysisCard />
            </div>
          </div>

          {/* Kart 3: Aktif Kampanyalar (Alt Geniş Alan) */}
          <div className="lg:col-span-12">
            <SimpleCampaignsCard />
          </div>
        </div>
      ) : (
        // Standard View - Full Dashboard
        <div className="space-y-4 lg:space-y-5">
          {/* Trial Progress Banner - Show at very top for non-premium users */}
          {!isPremium && (
            <div className="lg:hidden">
              <TrialProgress current={47} limit={50} />
            </div>
          )}
          
          {/* Main Grid - Responsive for tablet */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
            
            {/* Left Column - Main Content */}
            <div className="lg:col-span-8 space-y-4 lg:space-y-5">
              {/* QR and Reward Stats Card */}
              {getCardVisibility("card-visits-chart") && (
                <div data-card-id="card-visits-chart">
                  <QRRewardStatsCard />
                </div>
              )}

              {/* Tablet: Important widgets row */}
              {(getCardVisibility("card-quick-actions") || getCardVisibility("card-weekly-stats")) && (
                <div className="grid grid-cols-2 gap-4 lg:hidden">
                  {getCardVisibility("card-quick-actions") && (
                    <div data-card-id="card-quick-actions">
                      <QuickActions />
                    </div>
                  )}
                  {getCardVisibility("card-weekly-stats") && (
                    <div data-card-id="card-weekly-stats">
                      <WeeklyStatsCard 
                        predictedVisits={120}
                        confidence={85}
                        peakDay="Cumartesi"
                        peakHour="14:00-16:00"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Active Campaigns with Live Feed - Side by side */}
              {getCardVisibility("card-active-campaigns") && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 items-stretch" data-card-id="card-active-campaigns">
                  <ActiveCampaignsCard />
                  <LiveFeed />
                </div>
              )}

              {/* Churn Alert - Premium only, otherwise show locked version */}
              {getCardVisibility("card-churn-alert") && (
                <div data-card-id="card-churn-alert">
                  {isPremium ? <ChurnAlert /> : <LockedChurnAlert />}
                </div>
              )}
            </div>

            {/* Right Column - Desktop Only Sidebar */}
            <div className="hidden lg:block lg:col-span-4 space-y-5">
              {/* Trial Progress - Top priority for non-premium */}
              {!isPremium && getCardVisibility("card-trial-progress") && (
                <div data-card-id="card-trial-progress">
                  <TrialProgress current={47} limit={50} />
                </div>
              )}
              
              {/* Quick Action Buttons (QR Oku, Kampanya) */}
              {getCardVisibility("card-quick-actions") && (
                <div data-card-id="card-quick-actions">
                  <QuickActionButtons />
                </div>
              )}
              
              {/* Weekly Stats Card */}
              {getCardVisibility("card-weekly-stats") && (
                <div data-card-id="card-weekly-stats">
                  <WeeklyStatsCard 
                    predictedVisits={120}
                    confidence={85}
                    peakDay="Cumartesi"
                    peakHour="14:00-16:00"
                  />
                </div>
              )}
              
              {/* Analytics Card (Collapsible, at the bottom) */}
              {getCardVisibility("card-quick-actions") && (
                <div data-card-id="card-quick-actions-analytics">
                  <AnalyticsCard />
                </div>
              )}
              
            </div>
          </div>
        </div>
      )}

      {/* Chatbot - Fixed bottom right */}
      <Chatbot />
      </DashboardLayout>
    </DashboardDateRangeProvider>
  );
};

export default Index;
