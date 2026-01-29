import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  Users,
  Megaphone,
  Gift,
  Settings,
  Store,
  Bell,
  Palette,
  Layout,
  Shield,
  CreditCard,
  HelpCircle,
  User,
  TrendingUp,
  Zap,
  BarChart3,
  Target,
  AlertCircle,
  Timer,
} from "lucide-react";
import { DASHBOARD_CARDS } from "@/contexts/DashboardCardsContext";
import { cn } from "@/lib/utils";

interface SearchItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ElementType;
  category: "page" | "settings" | "card";
  path: string;
  keywords?: string[];
}

const searchItems: SearchItem[] = [
  // Pages
  {
    id: "page-dashboard",
    title: "Dashboard",
    description: "Ana sayfa ve genel bakış",
    icon: Home,
    category: "page",
    path: "/",
    keywords: ["ana sayfa", "genel bakış", "özet"],
  },
  {
    id: "page-customers",
    title: "Müşteriler",
    description: "Müşteri listesi ve yönetimi",
    icon: Users,
    category: "page",
    path: "/customers",
    keywords: ["müşteri listesi", "müşteri yönetimi", "kişiler"],
  },
  {
    id: "page-campaigns",
    title: "Kampanyalar",
    description: "Kampanya oluşturma ve yönetimi",
    icon: Megaphone,
    category: "page",
    path: "/campaigns",
    keywords: ["kampanya", "pazarlama", "promosyon"],
  },
  {
    id: "page-rewards",
    title: "Ödüller",
    description: "Ödül programları ve yönetimi",
    icon: Gift,
    category: "page",
    path: "/rewards",
    keywords: ["ödül", "hediye", "promosyon"],
  },
  {
    id: "page-profile",
    title: "Profil",
    description: "Hesap ve profil bilgileri",
    icon: User,
    category: "page",
    path: "/profile",
    keywords: ["hesap", "profil", "kullanıcı"],
  },
  // Settings Tabs
  {
    id: "settings-store",
    title: "Mağaza Ayarları",
    description: "Mağaza bilgileri ve detayları",
    icon: Store,
    category: "settings",
    path: "/settings?tab=store",
    keywords: ["mağaza", "cafe", "işletme", "bilgiler"],
  },
  {
    id: "settings-notifications",
    title: "Bildirim Ayarları",
    description: "Bildirim tercihleri ve ayarları",
    icon: Bell,
    category: "settings",
    path: "/settings?tab=notifications",
    keywords: ["bildirim", "uyarı", "haber"],
  },
  {
    id: "settings-appearance",
    title: "Görünüm Ayarları",
    description: "Tema ve görünüm tercihleri",
    icon: Palette,
    category: "settings",
    path: "/settings?tab=appearance",
    keywords: ["görünüm", "tema", "renk", "stil"],
  },
  {
    id: "settings-dashboard",
    title: "Dashboard Ayarları",
    description: "Dashboard kartları ve düzeni",
    icon: Layout,
    category: "settings",
    path: "/settings?tab=dashboard",
    keywords: ["dashboard", "kart", "panel", "düzen"],
  },
  {
    id: "settings-security",
    title: "Güvenlik Ayarları",
    description: "Güvenlik ve gizlilik ayarları",
    icon: Shield,
    category: "settings",
    path: "/settings?tab=security",
    keywords: ["güvenlik", "şifre", "gizlilik"],
  },
  {
    id: "settings-billing",
    title: "Faturalandırma",
    description: "Fatura ve ödeme ayarları",
    icon: CreditCard,
    category: "settings",
    path: "/settings?tab=billing",
    keywords: ["fatura", "ödeme", "abonelik", "fiyat"],
  },
  {
    id: "settings-help",
    title: "Yardım",
    description: "Yardım ve destek",
    icon: HelpCircle,
    category: "settings",
    path: "/settings?tab=help",
    keywords: ["yardım", "destek", "sss", "soru"],
  },
  // Dashboard Cards
  {
    id: "card-visits-chart",
    title: "Ziyaret İstatistikleri",
    description: "Günlük, haftalık ve aylık ziyaret grafikleri",
    icon: TrendingUp,
    category: "card",
    path: "/",
    keywords: ["ziyaret", "istatistik", "grafik", "ziyaretçi", "traffic"],
  },
  {
    id: "card-quick-actions",
    title: "Bugünün Özeti",
    description: "Hızlı özet ve işlemler",
    icon: Zap,
    category: "card",
    path: "/",
    keywords: ["özet", "bugün", "hızlı", "işlem"],
  },
  {
    id: "card-weekly-stats",
    title: "Haftalık İstatistikler",
    description: "Tahmin edilen ziyaretler ve istatistikler",
    icon: BarChart3,
    category: "card",
    path: "/",
    keywords: ["haftalık", "istatistik", "tahmin", "prediction"],
  },
  {
    id: "card-active-campaigns",
    title: "Aktif Kampanyalar",
    description: "Aktif kampanyalar ve performansları",
    icon: Target,
    category: "card",
    path: "/",
    keywords: ["kampanya", "aktif", "performans", "promosyon"],
  },
  {
    id: "card-churn-alert",
    title: "Müşteri Kaybı Uyarısı",
    description: "Kayıp müşteri uyarıları",
    icon: AlertCircle,
    category: "card",
    path: "/",
    keywords: ["müşteri kaybı", "churn", "uyarı", "risk"],
  },
  {
    id: "card-trial-progress",
    title: "Deneme İlerlemesi",
    description: "Premium deneme süresi takibi",
    icon: Timer,
    category: "card",
    path: "/",
    keywords: ["deneme", "trial", "premium", "abonelik"],
  },
];

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SearchModal = ({ open, onOpenChange }: SearchModalProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const filteredItems = searchItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    const matchesTitle = item.title.toLowerCase().includes(query);
    const matchesDescription = item.description?.toLowerCase().includes(query);
    const matchesKeywords = item.keywords?.some((keyword) =>
      keyword.toLowerCase().includes(query)
    );
    
    return matchesTitle || matchesDescription || matchesKeywords;
  });

  const groupedItems = {
    page: filteredItems.filter((item) => item.category === "page"),
    settings: filteredItems.filter((item) => item.category === "settings"),
    card: filteredItems.filter((item) => item.category === "card"),
  };

  const handleSelect = (item: SearchItem) => {
    if (item.category === "card") {
      // For cards, navigate to dashboard and scroll to the card
      navigate("/");
      onOpenChange(false);
      // Give time for navigation, then try to scroll (if the card has an ID)
      setTimeout(() => {
        const cardElement = document.querySelector(`[data-card-id="${item.id}"]`);
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      // For pages and settings, just navigate
      navigate(item.path);
      onOpenChange(false);
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Ara... (sayfa, ayar, grafik kartı)"
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
        
        {groupedItems.page.length > 0 && (
          <>
            <CommandGroup heading="Sayfalar">
              {groupedItems.page.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item)}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {(groupedItems.settings.length > 0 || groupedItems.card.length > 0) && (
              <CommandSeparator />
            )}
          </>
        )}

        {groupedItems.settings.length > 0 && (
          <>
            <CommandGroup heading="Ayarlar">
              {groupedItems.settings.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item)}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {groupedItems.card.length > 0 && <CommandSeparator />}
          </>
        )}

        {groupedItems.card.length > 0 && (
          <CommandGroup heading="Dashboard Kartları">
            {groupedItems.card.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item)}
                  className="cursor-pointer"
                >
                  <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};
