import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CardId = 
  "card-visits-chart" | 
  "card-quick-actions" | 
  "card-weekly-stats" | 
  "card-active-campaigns" | 
  "card-churn-alert" | 
  "card-trial-progress";

interface DashboardCard {
  id: CardId;
  name: string;
  description?: string;
}

export const DASHBOARD_CARDS: DashboardCard[] = [
  { id: "card-visits-chart", name: "Ziyaret İstatistikleri", description: "Günlük, haftalık ve aylık ziyaret grafikleri" },
  { id: "card-quick-actions", name: "Bugünün Özeti", description: "Hızlı özet ve işlemler" },
  { id: "card-weekly-stats", name: "Haftalık İstatistikler", description: "Tahmin edilen ziyaretler ve istatistikler" },
  { id: "card-active-campaigns", name: "Aktif Kampanyalar", description: "Aktif kampanyalar ve performansları" },
  { id: "card-churn-alert", name: "Müşteri Kaybı Uyarısı", description: "Kayıp müşteri uyarıları" },
  { id: "card-trial-progress", name: "Deneme İlerlemesi", description: "Premium deneme süresi takibi" },
];

type DashboardCardVisibility = { [key in CardId]: boolean };

const defaultVisibility: DashboardCardVisibility = {
  "card-visits-chart": true,
  "card-quick-actions": true,
  "card-weekly-stats": true,
  "card-active-campaigns": true,
  "card-churn-alert": true,
  "card-trial-progress": true,
};

const COOKIE_NAME = "fidelio-dashboard-cards";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// Cookie utility functions
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

const setCookie = (name: string, value: string, maxAge: number) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
};

interface DashboardCardsContextType {
  cardVisibility: DashboardCardVisibility;
  toggleCard: (cardId: CardId) => void;
  setCardVisibility: (cardId: CardId, visible: boolean) => void;
  resetToDefault: () => void;
  getCardVisibility: (cardId: CardId) => boolean;
}

const DashboardCardsContext = createContext<DashboardCardsContextType | undefined>(undefined);

export const DashboardCardsProvider = ({ children }: { children: ReactNode }) => {
  const [cardVisibility, setCardVisibilityState] = useState<DashboardCardVisibility>(() => {
    try {
      const stored = getCookie(COOKIE_NAME);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge stored settings with default to handle new cards or removed cards gracefully
        return { ...defaultVisibility, ...parsed };
      }
    } catch (error) {
      console.error("Error loading dashboard card settings:", error);
    }
    return defaultVisibility;
  });

  useEffect(() => {
    try {
      setCookie(COOKIE_NAME, JSON.stringify(cardVisibility), COOKIE_MAX_AGE);
    } catch (error) {
      console.error("Error saving dashboard card settings:", error);
    }
  }, [cardVisibility]);

  const toggleCard = (cardId: CardId) => {
    setCardVisibilityState((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const setCardVisibility = (cardId: CardId, visible: boolean) => {
    setCardVisibilityState((prev) => ({
      ...prev,
      [cardId]: visible,
    }));
  };

  const resetToDefault = () => {
    setCardVisibilityState(defaultVisibility);
  };

  const getCardVisibility = (cardId: CardId): boolean => {
    return cardVisibility[cardId] ?? true;
  };

  return (
    <DashboardCardsContext.Provider
      value={{
        cardVisibility,
        toggleCard,
        setCardVisibility,
        resetToDefault,
        getCardVisibility,
      }}
    >
      {children}
    </DashboardCardsContext.Provider>
  );
};

export const useDashboardCards = () => {
  const context = useContext(DashboardCardsContext);
  if (context === undefined) {
    throw new Error("useDashboardCards must be used within a DashboardCardsProvider");
  }
  return context;
};
