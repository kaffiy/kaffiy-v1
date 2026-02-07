import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  isDesktopSidebarCollapsed: boolean;
  setIsDesktopSidebarCollapsed: (collapsed: boolean) => void;
  toggleDesktopSidebar: () => void;
  toggleMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarCollapsed((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        isDesktopSidebarCollapsed,
        setIsDesktopSidebarCollapsed,
        toggleDesktopSidebar,
        toggleMobileSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
