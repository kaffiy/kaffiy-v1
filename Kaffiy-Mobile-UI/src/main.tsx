import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Load theme from localStorage before rendering to prevent flash
const loadTheme = () => {
  const THEME_STORAGE_KEY = "kaffiy-theme";
  const COLOR_SCHEME_STORAGE_KEY = "kaffiy-color-scheme";
  const root = document.documentElement;
  
  // Remove all theme classes first
  root.classList.remove("light", "dark", "theme-forest", "theme-ocean", "theme-lavender", "theme-sunset");
  
  // Check localStorage for color mode
  const storedMode = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedMode === "dark" || storedMode === "light") {
    root.classList.add(storedMode);
  } else {
    // Check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.classList.add("dark");
    } else {
      root.classList.add("light");
    }
  }
  
  // Check localStorage for color scheme
  const storedScheme = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
  if (storedScheme && storedScheme !== "default") {
    root.classList.add(`theme-${storedScheme}`);
  }
};

// Load theme immediately
loadTheme();

createRoot(document.getElementById("root")!).render(<App />);
