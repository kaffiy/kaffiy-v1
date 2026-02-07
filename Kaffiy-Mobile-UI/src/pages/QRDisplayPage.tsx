import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabase";
import PoweredByFooter from "@/components/PoweredByFooter";
import StepProgress from "@/components/StepProgress";
import { Loader2 } from "lucide-react";

/**
 * Get or create a permanent guest ID stored in localStorage.
 * Format: kahvesever123456 (6 digit random number)
 * This ID is permanent — the user keeps it until they register and change their name.
 * Used in QR code so barista can identify the customer.
 */
const getGuestId = (): string => {
  const stored = localStorage.getItem("kaffiy_guest_id");
  if (stored) return stored;
  const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
  const newId = `kahvesever${randomSuffix}`;
  localStorage.setItem("kaffiy_guest_id", newId);
  return newId;
};

const QRDisplayPage = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useUser();
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    if (user) {
      setQrValue(`u:${user.id}`);
    } else if (!isLoading) {
      setQrValue(`g:${getGuestId()}`);
    }
  }, [user, isLoading]);

  // Listen for barista broadcast (points_added event)
  useEffect(() => {
    const listenId = user ? user.id : getGuestId();
    const channel = supabase.channel(`scan_${listenId}`);

    channel
      .on('broadcast', { event: 'points_added' }, (payload: any) => {
        const data = payload.payload;
        // Save points to localStorage for guest
        if (!user) {
          const existing = JSON.parse(localStorage.getItem("kaffiy_guest_points") || "[]");
          existing.push({
            points: data.points,
            company_id: data.company_id,
            timestamp: new Date().toISOString(),
          });
          localStorage.setItem("kaffiy_guest_points", JSON.stringify(existing));
        }
        // Navigate to congrats page
        navigate(`/congrats?points=${data.points}`);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Kaffiy Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="flex items-center px-4 py-3">
        <div className="w-10 h-10" />
      </header>

      {/* Progress Bar */}
      <StepProgress
        currentStep={1}
        totalSteps={3}
        compact
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <h2 className="text-2xl font-bold mb-2 animate-fade-in">Hoş Geldin!</h2>
        <p className="text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          İlk puanını kazanmak için QR kodunu baristaya göster
        </p>

        {/* QR Code Area */}
        <div className="animate-scale-in">
          <div className="w-64 h-64 bg-white rounded-3xl shadow-card flex items-center justify-center border border-border p-4">
            {qrValue ? (
              <QRCode
                value={qrValue}
                size={220}
                viewBox={`0 0 256 256`}
              />
            ) : (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <p className="text-sm text-muted-foreground max-w-xs">
            ☕ Bu QR kodu baristaya gösterin ve puan kazanın!
          </p>
        </div>
      </main>

      <PoweredByFooter />
    </div>
  );
};

export default QRDisplayPage;
