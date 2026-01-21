import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

// Entry point - redirects to QR display page (simulating QR scan entry)
const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate QR code scan entry - redirect to QR display
    navigate("/qr");
  }, [navigate]);

  return (
    <div className="mobile-container min-h-screen flex items-center justify-center bg-background">
      <div className="text-center animate-soft-pulse">
        <span className="text-6xl">☕</span>
        <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
      </div>
    </div>
  );
};

export default Index;
