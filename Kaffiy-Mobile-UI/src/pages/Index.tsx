import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useCafe } from "@/contexts/CafeContext";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cafe, isLoading, error } = useCafe();

  useEffect(() => {
    if (!isLoading && !error && cafe) {
      // Cafe found, stay on entry or redirect to home/qr with the context
      navigate(`/qr${window.location.search}`);
    }
  }, [isLoading, error, cafe, navigate]);

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

  if (error || !searchParams.get("cafe")) {
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
