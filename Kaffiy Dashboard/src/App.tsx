import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { DashboardCardsProvider } from "@/contexts/DashboardCardsContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Index from "./pages/Index";
import Customers from "./pages/Customers";
import Campaigns from "./pages/Campaigns";
import Team from "./pages/Team";
// import Rewards from "./pages/Rewards"; // Gelecekte kullanılmak üzere saklandı
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PremiumProvider>
      <DashboardCardsProvider>
        <SidebarProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/team" element={<Team />} />
            {/* <Route path="/rewards" element={<Rewards />} /> */} {/* Gelecekte kullanılmak üzere saklandı */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
        </SidebarProvider>
      </DashboardCardsProvider>
    </PremiumProvider>
  </QueryClientProvider>
);

export default App;
