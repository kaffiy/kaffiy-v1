import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface PremiumContextType {
  isPremium: boolean;
  togglePremium: () => void;
  setPremium: (premium: boolean) => void;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

const PREMIUM_STORAGE_KEY = 'kaffiy_premium_status';

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const [isPremium, setIsPremium] = useState(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem(PREMIUM_STORAGE_KEY);
    return stored === 'true';
  });
  
  const { toast } = useToast();

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(PREMIUM_STORAGE_KEY, isPremium.toString());
  }, [isPremium]);

  const togglePremium = () => {
    const newPremium = !isPremium;
    setIsPremium(newPremium);
    
    // Show toast notification
    toast({
      title: newPremium ? "Premium Aktif!" : "Premium Deaktif",
      description: newPremium 
        ? "🎉 Tüm premium özellikler kullanıma açıldı!" 
        : "📦 Premium özellikler kapatıldı.",
      duration: 3000,
    });
  };

  const setPremium = (premium: boolean) => {
    setIsPremium(premium);
    
    // Show toast notification
    toast({
      title: premium ? "Premium Aktif!" : "Premium Deaktif",
      description: premium 
        ? "🎉 Tüm premium özellikler kullanıma açıldı!" 
        : "📦 Premium özellikler kapatıldı.",
      duration: 3000,
    });
  };

  return (
    <PremiumContext.Provider value={{ isPremium, togglePremium, setPremium }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error("usePremium must be used within a PremiumProvider");
  }
  return context;
};