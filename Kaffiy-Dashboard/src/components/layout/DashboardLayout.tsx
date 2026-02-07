import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Calendar as CalendarIcon, Bell, Search, Menu, PanelLeftClose, PanelLeft, CheckCircle2, AlertCircle, Megaphone, Percent, Gift, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Palette, Settings, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";
import { KaffiyLogo, KaffiyLogoMark } from "@/components/KaffiyLogo";
import { SearchModal } from "@/components/search/SearchModal";
import { useDashboardView } from "@/hooks/use-dashboard-view";
import { usePremium } from "@/contexts/PremiumContext";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const getTitleFromPath = (pathname: string): string => {
  const routes: Record<string, string> = {
    "/": "Dashboard",
    "/customers": "Müşteriler",
    "/campaigns": "Kampanyalar",
    "/team": "Ekip",
    "/rewards": "Ödüller",
    "/settings": "Ayarlar",
    "/profile": "Profil",
  };
  return routes[pathname] || "Dashboard";
};

export const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const {
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isDesktopSidebarCollapsed,
    setIsDesktopSidebarCollapsed,
    toggleDesktopSidebar,
    toggleMobileSidebar,
  } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { isSimpleView } = useDashboardView();
  const { isPremium } = usePremium();
  const pageTitle = title || getTitleFromPath(location.pathname);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Yeni Kampanya Oluşturuldu",
      description: '"Hafta Sonu İndirimi" kampanyası başarıyla oluşturuldu ve aktif hale getirildi.',
      time: "5 dakika önce",
      type: "success" as const,
    },
    {
      id: "2",
      title: "Yeni Müşteri Eklendi",
      description: "Ahmet Yılmaz müşteri listesine eklendi.",
      time: "1 saat önce",
      type: "warning" as const,
    },
  ]);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
      // Close search with Escape
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex flex-col h-full transition-all duration-300 ease-in-out flex-shrink-0",
        isDesktopSidebarCollapsed ? "w-0 overflow-hidden" : "w-56"
      )}>
        <div className="w-56 h-full">
          <Sidebar />
        </div>
      </div>

      {/* Mobile/Tablet Sidebar - Sheet */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 lg:h-[72px] border-b border-gray-200 bg-white flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Menu Button - Mobile/Tablet */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileSidebar}
              className="lg:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg w-6 h-6 p-0"
            >
              {isMobileSidebarOpen ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
            
            {/* Sidebar Toggle - Desktop */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDesktopSidebar}
              className="hidden lg:flex text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg w-6 h-6 p-0"
            >
              {isDesktopSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center gap-1 lg:gap-2">
            {/* Premium Badge */}
            {isPremium && (
              <div className="hidden sm:flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2.5 py-1.5 rounded-full text-xs font-semibold">
                <Crown className="w-3 h-3" />
                Premium
              </div>
            )}
            
            {!isSimpleView && (
              <>
                <Button
                  variant="ghost" 
                  size="icon" 
                  disabled
                  className="text-gray-400 opacity-50 cursor-not-allowed rounded-xl w-9 h-9 lg:w-10 lg:h-10"
                  aria-label="Ara"
                >
                  <Search className="w-4 h-4 lg:w-5 lg:h-5" />
                </Button>
              </>
            )}
            <div>
              <Button 
                variant="ghost" 
                size="icon" 
                disabled
                className="text-gray-400 opacity-50 cursor-not-allowed rounded-xl w-9 h-9 lg:w-10 lg:h-10 relative pointer-events-none"
              >
                <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 w-2 h-2 bg-indigo-600 rounded-full" />
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings?tab=appearance")}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl w-9 h-9 lg:w-10 lg:h-10"
              aria-label="Görünüm Ayarları"
            >
              <Palette className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl w-9 h-9 lg:w-10 lg:h-10"
              aria-label="Ayarlar"
            >
              <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                <KaffiyLogoMark className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@kaffiy.com</p>
              </div>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
