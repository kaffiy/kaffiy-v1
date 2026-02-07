import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { useUser } from "@/contexts/UserContext";
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
  const { user, profile, isLoading } = useUser();
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    if (user) {
      // Logged-in user: use real user ID
      setQrValue(`u:${user.id}`);
    } else if (!isLoading) {
      // Guest: use temp guest ID
      setQrValue(`g:${getGuestId()}`);
    }
  }, [user, isLoading]);

  const isGuest = !user;
  const guestId = getGuestId();
  const displayName = profile?.name
    || (user ? `${user.email?.split('@')[0] || 'Kullanıcı'}` : guestId);
  const backupCode = user?.id?.substring(0, 6)?.toUpperCase() || guestId.replace('kahvesever', '');

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
        <h2 className="text-xl font-semibold mb-2">Hoş Geldin!</h2>
        <p className="text-muted-foreground mb-6">{displayName}</p>

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

        {/* Backup Code */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <p className="text-sm text-muted-foreground mb-2">Müşteri Kodunuz</p>
          <div className="flex items-center justify-center gap-2">
            <span className="px-4 py-2 bg-secondary rounded-lg text-2xl font-bold text-primary tracking-widest">
              {backupCode}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <p className="mt-8 text-sm text-muted-foreground text-center max-w-xs animate-fade-in" style={{ animationDelay: "0.3s" }}>
          Bu QR kodu baristaya gösterin ve puan kazanın!
        </p>

        {/* Registration/Login Reminder for guests */}
        {isGuest && (
          <div className="mt-8 px-4 py-3 bg-accent/10 border border-accent/20 rounded-xl max-w-sm animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <p className="text-sm text-foreground text-center font-medium leading-relaxed">
              Puanlarınızı kalıcı yapmak için{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors"
              >
                hemen üye olun
              </button>
            </p>
          </div>
        )}
      </main>

      <PoweredByFooter />
    </div>
  );
};

export default QRDisplayPage;
