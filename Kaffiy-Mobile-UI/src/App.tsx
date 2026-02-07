import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CafeProvider } from "./contexts/CafeContext";
import Index from "./pages/Index";
import QRDisplayPage from "./pages/QRDisplayPage";
import CongratsPage from "./pages/CongratsPage";
import SignupPage from "./pages/SignupPage";
import VerifyPage from "./pages/VerifyPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import CafeDetailPage from "./pages/CafeDetailPage";
import ProfilePage from "./pages/ProfilePage";
import LogoPreview from "./pages/LogoPreview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CafeProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/qr" element={<QRDisplayPage />} />
              <Route path="/congrats" element={<CongratsPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/cafe/:id" element={<CafeDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/logo" element={<LogoPreview />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CafeProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
