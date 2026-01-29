import { useState, useEffect } from "react";

type Theme = "light" | "dark";
type Palette = "terracotta" | "sage" | "charcoal" | "latte" | "sand" | "mist";

const THEME_STORAGE_KEY = "barista-theme";
const PALETTE_STORAGE_KEY = "barista-palette";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored === "light" || stored === "dark") {
        return stored;
      }
    }
    return "light";
  });

  const [palette, setPalette] = useState<Palette>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(PALETTE_STORAGE_KEY) as Palette | null;
      if (
        stored === "terracotta" ||
        stored === "sage" ||
        stored === "charcoal" ||
        stored === "latte" ||
        stored === "sand" ||
        stored === "mist"
      ) {
        return stored;
      }
    }
    return "terracotta";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.palette = palette;
    localStorage.setItem(PALETTE_STORAGE_KEY, palette);
  }, [palette]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme, setTheme, palette, setPalette };
};
