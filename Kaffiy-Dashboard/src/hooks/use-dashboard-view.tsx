import { useState, useEffect } from "react";

const STORAGE_KEY = "dashboard-view-mode";
const DEFAULT_MODE = "standard"; // "standard" or "simple"

export const useDashboardView = () => {
  const [viewMode, setViewModeState] = useState<"standard" | "simple">(() => {
    if (typeof window === "undefined") return DEFAULT_MODE;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "simple" || stored === "standard") {
        return stored;
      }
    } catch (error) {
      console.error("Error loading dashboard view mode:", error);
    }
    return DEFAULT_MODE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, viewMode);
    } catch (error) {
      console.error("Error saving dashboard view mode:", error);
    }
  }, [viewMode]);

  const setViewMode = (mode: "standard" | "simple") => {
    setViewModeState(mode);
  };

  const isSimpleView = viewMode === "simple";

  return {
    viewMode,
    setViewMode,
    isSimpleView,
  };
};
