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
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Kaffiy Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const PublicRoute = () => {
  const { session, isLoading } = useAuth();

  if (isLoading) return null; // Or a minimal spinner

  if (session) {
    return <Navigate to="/" replace />;
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
                    {/* Public Routes (Login) */}
                    <Route element={<PublicRoute />}>
                      <Route path="/login" element={<Login />} />
                    </Route>

                    {/* Protected Routes (Dashboard) */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/campaigns" element={<Campaigns />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/admin/kaffiy" element={<KaffiyAdmin />} />
                    </Route>

                    {/* Catch all - Redirect to login or dashboard depending on auth */}
                    <Route path="*" element={<Navigate to="/" replace />} />
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
