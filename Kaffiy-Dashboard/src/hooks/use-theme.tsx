import { useState, useEffect } from "react";

type Theme = "light" | "dark";
type Palette = "default" | "indigo" | "emerald" | "amber" | "rose" | "violet" | "slate" | "zinc";
type ThemeScope = "dashboard" | "barista";

const storageKey = (scope: ThemeScope, key: "theme" | "palette") =>
  `kaffiy-${scope}-${key}`;

export const useTheme = (scope: ThemeScope = "dashboard") => {
  const defaultTheme: Theme = scope === "barista" ? "dark" : "light";

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey(scope, "theme")) as Theme | null;
      if (stored === "light" || stored === "dark") {
        return stored;
      }
    }
    return defaultTheme;
  });

  const [palette, setPalette] = useState<Palette>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey(scope, "palette")) as Palette | null;
      if (
        stored === "default" ||
        stored === "indigo" ||
        stored === "emerald" ||
        stored === "amber" ||
        stored === "rose" ||
        stored === "violet" ||
        stored === "slate" ||
        stored === "zinc"
      ) {
        return stored;
      }
    }
    return "default";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(storageKey(scope, "theme"), theme);
  }, [theme, scope]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.palette = palette;
    localStorage.setItem(storageKey(scope, "palette"), palette);
  }, [palette, scope]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme, setTheme, palette, setPalette };
};
