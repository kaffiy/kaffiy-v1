import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "coffee" | "terracotta" | "sage" | "ocean";

interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  ring: string;
  warmGradient: string;
}

const themes: Record<Theme, ThemeColors> = {
  coffee: {
    primary: "28 45% 35%",
    primaryForeground: "40 33% 98%",
    secondary: "38 35% 92%",
    secondaryForeground: "30 20% 30%",
    accent: "140 20% 92%",
    accentForeground: "140 25% 30%",
    background: "40 33% 98%",
    foreground: "30 15% 18%",
    card: "40 30% 99%",
    cardForeground: "30 15% 18%",
    muted: "38 20% 94%",
    mutedForeground: "30 12% 45%",
    border: "38 20% 88%",
    ring: "28 45% 35%",
    warmGradient: "from-[hsl(40,40%,96%)] via-[hsl(38,35%,95%)] to-[hsl(140,18%,94%)]",
  },
  terracotta: {
    primary: "18 50% 45%",
    primaryForeground: "40 33% 98%",
    secondary: "25 30% 90%",
    secondaryForeground: "20 25% 25%",
    accent: "15 40% 85%",
    accentForeground: "18 45% 30%",
    background: "35 30% 97%",
    foreground: "20 20% 20%",
    card: "30 25% 98%",
    cardForeground: "20 20% 20%",
    muted: "25 25% 92%",
    mutedForeground: "20 15% 40%",
    border: "25 25% 85%",
    ring: "18 50% 45%",
    warmGradient: "from-[hsl(35,30%,97%)] via-[hsl(25,30%,95%)] to-[hsl(15,40%,92%)]",
  },
  sage: {
    primary: "140 30% 40%",
    primaryForeground: "40 33% 98%",
    secondary: "140 25% 90%",
    secondaryForeground: "140 35% 25%",
    accent: "120 20% 88%",
    accentForeground: "140 30% 30%",
    background: "140 20% 97%",
    foreground: "140 25% 20%",
    card: "140 18% 98%",
    cardForeground: "140 25% 20%",
    muted: "140 20% 92%",
    mutedForeground: "140 20% 40%",
    border: "140 20% 85%",
    ring: "140 30% 40%",
    warmGradient: "from-[hsl(140,20%,97%)] via-[hsl(140,25%,95%)] to-[hsl(120,20%,92%)]",
  },
  ocean: {
    primary: "200 60% 45%",
    primaryForeground: "40 33% 98%",
    secondary: "200 30% 92%",
    secondaryForeground: "200 40% 25%",
    accent: "180 35% 88%",
    accentForeground: "200 50% 30%",
    background: "200 25% 97%",
    foreground: "200 30% 18%",
    card: "200 20% 98%",
    cardForeground: "200 30% 18%",
    muted: "200 25% 92%",
    mutedForeground: "200 25% 40%",
    border: "200 25% 88%",
    ring: "200 60% 45%",
    warmGradient: "from-[hsl(200,25%,97%)] via-[hsl(200,30%,95%)] to-[hsl(180,35%,92%)]",
  },
};

const STORAGE_KEY = "kaffiy-dark";

function getStoredDark(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function setStoredDark(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {}
}

type ThemeModeContext = {
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  currentTheme: Theme;
  themes: Record<Theme, ThemeColors>;
};

const ThemeModeContext = createContext<ThemeModeContext | null>(null);

export function useThemeMode(): ThemeModeContext {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>("coffee");
  const [isDark, setIsDark] = useState(getStoredDark);

  useEffect(() => {
    const themeOrder: Theme[] = ["coffee", "terracotta", "sage", "ocean"];
    const startIndex = Math.floor(Date.now() / (5 * 60 * 1000)) % themeOrder.length;
    setCurrentTheme(themeOrder[startIndex]);

    const interval = setInterval(() => {
      setCurrentTheme((prev) => {
        const i = themeOrder.indexOf(prev);
        return themeOrder[(i + 1) % themeOrder.length];
      });
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    setStoredDark(isDark);
  }, [isDark]);

  useEffect(() => {
    const theme = themes[currentTheme];
    const root = document.documentElement;

    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--primary-foreground", theme.primaryForeground);
    root.style.setProperty("--secondary", theme.secondary);
    root.style.setProperty("--secondary-foreground", theme.secondaryForeground);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-foreground", theme.accentForeground);
    root.style.setProperty("--ring", theme.ring);

    if (!isDark) {
      root.style.setProperty("--background", theme.background);
      root.style.setProperty("--foreground", theme.foreground);
      root.style.setProperty("--card", theme.card);
      root.style.setProperty("--card-foreground", theme.cardForeground);
      root.style.setProperty("--muted", theme.muted);
      root.style.setProperty("--muted-foreground", theme.mutedForeground);
      root.style.setProperty("--border", theme.border);
    } else {
      root.style.removeProperty("--background");
      root.style.removeProperty("--foreground");
      root.style.removeProperty("--card");
      root.style.removeProperty("--card-foreground");
      root.style.removeProperty("--muted");
      root.style.removeProperty("--muted-foreground");
      root.style.removeProperty("--border");
    }

    document.body.classList.remove("theme-coffee", "theme-terracotta", "theme-sage", "theme-ocean");
    document.body.classList.add(`theme-${currentTheme}`);
  }, [currentTheme, isDark]);

  return (
    <ThemeModeContext.Provider value={{ isDark, setIsDark, currentTheme, themes }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

/** @deprecated Use ThemeProvider + useThemeMode. Kept for backwards compat. */
export function useTheme() {
  const ctx = useContext(ThemeModeContext);
  return ctx ? { currentTheme: ctx.currentTheme, themes: ctx.themes } : { currentTheme: "coffee" as Theme, themes };
}
