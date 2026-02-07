import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { DashboardCardsProvider } from "@/contexts/DashboardCardsContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Login from "./pages/Login";
import { Navigate, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import Customers from "./pages/Customers";
import Campaigns from "./pages/Campaigns";
import Team from "./pages/Team";
// import Rewards from "./pages/Rewards"; // Gelecekte kullanılmak üzere saklandı
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import SuperAdmin from "./pages/admin/SuperAdmin";

const queryClient = new QueryClient();

const ProtectedRoute = () => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PremiumProvider>
          <DashboardCardsProvider>
            <SidebarProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoute />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/campaigns" element={<Campaigns />} />
                      <Route path="/team" element={<Team />} />
                      {/* <Route path="/rewards" element={<Rewards />} /> */} {/* Gelecekte kullanılmak üzere saklandı */}
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/admin/onboarding" element={<SuperAdmin />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </SidebarProvider>
          </DashboardCardsProvider>
        </PremiumProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
