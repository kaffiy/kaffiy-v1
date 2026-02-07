import { useState, useEffect } from "react";
import { Home, Users, Megaphone, Gift, Settings, Crown, User, LogOut, UserCog, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { usePremium } from "@/contexts/PremiumContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { KaffiyLogo, KaffiyLogoMark } from "@/components/KaffiyLogo";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/", disabled: false },
  { id: "terminal", label: "Puan Terminali", icon: QrCode, path: "/terminal", disabled: false },
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

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center overflow-hidden">
            <KaffiyLogoMark className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Kaffiy</h1>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => !item.disabled && navigate(item.path)}
              disabled={item.disabled}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-indigo-600 bg-indigo-50 border-l-4 border-indigo-600"
                  : item.disabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.disabled && (
                <span className="ml-auto text-xs text-gray-400">Soon</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Premium Toggle */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              isPremium ? "bg-indigo-100" : "bg-gray-200"
            )}>
              <Crown className={cn(
                "w-4 h-4",
                isPremium ? "text-indigo-600" : "text-gray-500"
              )} />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">Premium</p>
              <p className="text-xs text-gray-500">
                {isPremium ? "Active" : "Upgrade"}
              </p>
            </div>
          </div>
          <Switch
            checked={isPremium}
            onCheckedChange={togglePremium}
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 rounded-lg">
          <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">admin@kaffiy.com</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
