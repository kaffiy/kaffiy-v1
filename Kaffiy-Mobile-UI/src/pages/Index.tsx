import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useCafe } from "@/contexts/CafeContext";
import { useUser } from "@/contexts/UserContext";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cafe, isLoading: cafeLoading, error } = useCafe();
  const { user, isLoading: userLoading } = useUser();

  const isLoading = cafeLoading || userLoading;

  useEffect(() => {
    if (!isLoading && !error && cafe) {
      if (user) {
        // Mevcut müşteri: direkt ana sayfaya
        navigate("/home");
      } else {
        // Yeni müşteri: QR sayfasına (baristaya göster)
        navigate(`/qr${window.location.search}`);
      }
    }
  }, [isLoading, error, cafe, user, navigate]);

  if (isLoading) {
    return (
      <div className="mobile-container min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-soft-pulse">
          <span className="text-6xl">☕</span>
          <p className="mt-4 text-muted-foreground italic font-medium">Kaffiy Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!searchParams.get("cafe")) {
    return <Navigate to="/qr" replace />;
  }

  if (error) {
    return (
      <div className="mobile-container min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center p-8 rounded-3xl bg-secondary/30 backdrop-blur-sm border border-border">
          <span className="text-6xl mb-4 block">⚠️</span>
          <h1 className="text-xl font-bold text-foreground mb-2">Kafe Bulunamadı</h1>
          <p className="text-sm text-muted-foreground">
            Lütfen geçerli bir QR kod okuttuğunuzdan emin olun.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
