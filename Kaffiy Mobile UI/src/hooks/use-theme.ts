import { useEffect, useState, useRef } from "react";

type ColorMode = "light" | "dark";
type ColorScheme = "default" | "forest" | "ocean" | "lavender" | "sunset";

const THEME_STORAGE_KEY = "kaffiy-theme";
const COLOR_SCHEME_STORAGE_KEY = "kaffiy-color-scheme";
const AUTO_THEME_ENABLED_KEY = "kaffiy-auto-theme-enabled";
const AUTO_THEME_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

const AVAILABLE_THEMES: ColorScheme[] = ["default", "ocean", "lavender", "sunset"];

export function useTheme() {
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    // Check localStorage first
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ColorMode | null;
      if (stored) {
        return stored;
      }
      // Check system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });

  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY) as ColorScheme | null;
      if (stored) {
        return stored;
      }
    }
    return "default";
  });

  const [autoThemeEnabled, setAutoThemeEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(AUTO_THEME_ENABLED_KEY);
      // Default to true if not set (auto theme enabled by default)
      return stored === null ? true : stored === "true";
    }
    return true;
  });

  const autoThemeIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes first
    root.classList.remove("light", "dark", "theme-forest", "theme-ocean", "theme-lavender", "theme-sunset");
    
    // Add color mode class
    root.classList.add(colorMode);
    
    // Add color scheme class if not default
    if (colorScheme !== "default") {
      root.classList.add(`theme-${colorScheme}`);
    }
    
    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, colorMode);
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, colorScheme);
  }, [colorMode, colorScheme]);

  // Auto theme rotation effect
  useEffect(() => {
    // Clear existing interval
    if (autoThemeIntervalRef.current) {
      clearInterval(autoThemeIntervalRef.current);
      autoThemeIntervalRef.current = null;
    }

    // Only start auto theme if enabled
    if (autoThemeEnabled) {
      const rotateTheme = () => {
        setColorScheme((currentScheme) => {
          const currentIndex = AVAILABLE_THEMES.indexOf(currentScheme);
          const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length;
          return AVAILABLE_THEMES[nextIndex];
        });
      };

      // Set up interval
      autoThemeIntervalRef.current = setInterval(rotateTheme, AUTO_THEME_INTERVAL);
    }

    // Cleanup on unmount or when auto theme is disabled
    return () => {
      if (autoThemeIntervalRef.current) {
        clearInterval(autoThemeIntervalRef.current);
        autoThemeIntervalRef.current = null;
      }
    };
  }, [autoThemeEnabled]);

  const toggleTheme = () => {
    setColorMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setLightTheme = () => {
    setColorMode("light");
  };

  const setDarkTheme = () => {
    setColorMode("dark");
  };

  const setColorSchemeTheme = (scheme: ColorScheme) => {
    // When user manually selects a theme, disable auto theme
    setAutoThemeEnabled(false);
    localStorage.setItem(AUTO_THEME_ENABLED_KEY, "false");
    setColorScheme(scheme);
  };

  const enableAutoTheme = () => {
    setAutoThemeEnabled(true);
    localStorage.setItem(AUTO_THEME_ENABLED_KEY, "true");
  };

  const disableAutoTheme = () => {
    setAutoThemeEnabled(false);
    localStorage.setItem(AUTO_THEME_ENABLED_KEY, "false");
  };

  return {
    theme: colorMode,
    isDark: colorMode === "dark",
    colorScheme,
    autoThemeEnabled,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setTheme: setColorMode,
    setColorScheme: setColorSchemeTheme,
    enableAutoTheme,
    disableAutoTheme,
  };
}
