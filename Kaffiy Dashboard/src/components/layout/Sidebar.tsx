import { useState, useEffect } from "react";
import { Home, Users, Megaphone, Gift, Settings, Coffee, ChevronRight, Sparkles, Crown, User, LogOut, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { usePremium } from "@/contexts/PremiumContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/", disabled: false },
  { id: "customers", label: "Müşteriler", icon: Users, path: "/customers", disabled: false },
  { id: "campaigns", label: "Kampanyalar", icon: Megaphone, path: "/campaigns", disabled: false },
  { id: "team", label: "Ekip", icon: UserCog, path: "/team", disabled: false },
  { id: "rewards", label: "Ödüller", icon: Gift, path: "/rewards", disabled: true },
  { id: "settings", label: "Ayarlar", icon: Settings, path: "/settings", disabled: false },
];

export const Sidebar = () => {
  const { isPremium, togglePremium } = usePremium();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Force re-render when theme changes by observing document class
  const [isDarkMode, setIsDarkMode] = useState(isDark);
  
  useEffect(() => {
    setIsDarkMode(isDark);
    // Also check document class for immediate updates
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    // Initial check
    checkDarkMode();
    
    return () => observer.disconnect();
  }, [isDark]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-56 h-full bg-sidebar flex flex-col border-r border-sidebar-border/40">
      {/* Logo - kaffiy */}
      <div className="h-16 lg:h-[72px] px-4 flex items-center border-b border-sidebar-border/30">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity w-full text-left"
        >
          <div className="w-full">
            <div className="flex items-center gap-2 mb-1">
              <h1 
                className={cn(
                  "brand-logo text-left transition-colors",
                  isDarkMode ? "text-white" : "text-[#1E293B]"
                )}
                style={{ 
                  fontFamily: "'Inter', 'Outfit', ui-sans-serif, system-ui, sans-serif",
                  textTransform: 'lowercase',
                  fontWeight: 700,
                  fontSize: '24px',
                  letterSpacing: '-0.03em',
                  marginBottom: 0
                }}
              >
                kaff<span>i</span>y
              </h1>
              {/* Minimalist color dots */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span className="w-1.5 h-1.5 rounded-full bg-destructive/80" />
          </div>
        </div>
            <p 
          className={cn(
                "text-left lowercase transition-colors",
                isDarkMode ? "text-white/80" : "text-[#64748B]"
              )}
              style={{ 
                fontFamily: "'Inter', 'Outfit', ui-sans-serif, system-ui, sans-serif",
                fontWeight: 400,
                fontSize: '11px'
              }}
            >
              Akıllı Sadakat Sistemi
            </p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-5 overflow-y-auto">
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isDisabled = item.disabled;
            
            const menuButton = (
                <button
                onClick={() => !isDisabled && navigate(item.path)}
                disabled={isDisabled}
                  className={cn(
                    "group flex items-center gap-2.5 px-2.5 py-2 rounded-lg w-full transition-all duration-150 text-[13px]",
                  isDisabled && "cursor-not-allowed opacity-50",
                  !isDisabled && active 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                    : !isDisabled && "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  isDisabled && "text-sidebar-foreground/30"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 flex-shrink-0",
                  isDisabled && "text-sidebar-muted/30",
                  !isDisabled && active ? "text-primary-foreground" : !isDisabled && "text-sidebar-muted group-hover:text-sidebar-foreground"
                  )} />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {item.hasSubmenu && (
                    <ChevronRight className={cn(
                      "w-3.5 h-3.5 opacity-50",
                      active && "rotate-90"
                    )} />
                  )}
                </button>
            );

            if (isDisabled) {
              return (
                <TooltipProvider key={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <li>{menuButton}</li>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-popover text-popover-foreground border-border">
                      <p className="text-xs font-medium">Pek yakında</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }

            return (
              <li key={item.id}>
                {menuButton}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Premium Badge */}
      {/* {isPremium && (
        <div className="px-3 pb-3">
          <div className="rounded-lg px-3 py-2 bg-gradient-to-r from-gold/10 to-transparent border-l-2 border-gold/40">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-gold" />
              <span className="text-[10px] font-medium text-gold">Premium Aktif</span>
            </div>
          </div>
        </div>
      )} */}

      {/* Footer - Powered by kaffiy */}
      <div className="px-3 pb-3 pt-2 border-t border-sidebar-border/30">
        <div className="px-2 py-1.5">
        <button 
            onClick={() => navigate("/")}
            className="w-full text-center cursor-pointer hover:opacity-80 transition-opacity"
        >
            <p 
              className="text-[9px] text-sidebar-muted/70 leading-tight"
              style={{ 
                fontFamily: "'DM Sans', 'Inter', ui-sans-serif, system-ui, sans-serif"
              }}
            >
              Powered by <span className="font-medium text-sidebar-muted">kaffiy</span>
            </p>
          </button>
          </div>
      </div>
    </aside>
  );
};
