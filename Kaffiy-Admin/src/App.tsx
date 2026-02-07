import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Login from "./pages/Login";
import KaffiyAdmin from "./pages/admin/KaffiyAdmin";
import PointTerminal from "./pages/PointTerminal";

const queryClient = new QueryClient();

const ProtectedRoute = () => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Kaffiy Admin Yükleniyor...</p>
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

  if (isLoading) return null;

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SidebarProvider>
          <PremiumProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes (Login) */}
                  <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                  </Route>

                  {/* Protected Routes (Admin Only) */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<KaffiyAdmin />} />
                    <Route path="/terminal" element={<PointTerminal />} />
                  </Route>

                  {/* Catch all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </PremiumProvider>
        </SidebarProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
