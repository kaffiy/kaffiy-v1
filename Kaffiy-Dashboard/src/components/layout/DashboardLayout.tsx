import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Calendar as CalendarIcon, Bell, Search, Menu, PanelLeftClose, PanelLeft, CheckCircle2, AlertCircle, Megaphone, Percent, Gift, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Palette, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";
import { HalicKahveLogo } from "@/components/Logo";
import { SearchModal } from "@/components/search/SearchModal";
import { useDashboardView } from "@/hooks/use-dashboard-view";

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
    <div className="flex h-screen bg-background premium-gradient overflow-hidden">
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
        <header className="h-16 lg:h-[72px] border-b border-border/50 bg-card/60 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Menu Button - Mobile/Tablet */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileSidebar}
              className="lg:hidden text-muted-foreground/60 hover:text-muted-foreground hover:bg-transparent rounded-lg w-6 h-6 p-0"
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
              className="hidden lg:flex text-muted-foreground/60 hover:text-muted-foreground hover:bg-transparent rounded-lg w-6 h-6 p-0"
            >
              {isDesktopSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-1 lg:gap-2">
            {!isSimpleView && (
              <>
                <Button
                  variant="ghost" 
                  size="icon" 
                  disabled
                  className="text-muted-foreground/30 opacity-50 cursor-not-allowed rounded-xl w-9 h-9 lg:w-10 lg:h-10"
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
                className="text-muted-foreground/30 opacity-50 cursor-not-allowed rounded-xl w-9 h-9 lg:w-10 lg:h-10 relative pointer-events-none"
              >
                <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 w-2 h-2 bg-gold/30 rounded-full" />
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings?tab=appearance")}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl w-9 h-9 lg:w-10 lg:h-10"
              aria-label="Görünüm Ayarları"
            >
              <Palette className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl w-9 h-9 lg:w-10 lg:h-10"
              aria-label="Ayarlar"
            >
              <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/50 transition-colors group"
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                <HalicKahveLogo className="w-5 h-5" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-medium text-foreground">Halic Kahve</p>
                <a
                  href="https://www.halickahve.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  halickahve.com
                </a>
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
