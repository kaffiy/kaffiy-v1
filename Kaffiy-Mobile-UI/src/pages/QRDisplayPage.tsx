import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { useUser } from "@/contexts/UserContext";
import PoweredByFooter from "@/components/PoweredByFooter";
import StepProgress from "@/components/StepProgress";
import { Loader2 } from "lucide-react";

const QRDisplayPage = () => {
  const navigate = useNavigate();
  const { user, profile, signInAnonymously, isLoading } = useUser();
  const [qrValue, setQrValue] = useState("");
  const [initError, setInitError] = useState(false);
  const backupCode = profile?.name?.split('_')[1] || user?.id?.substring(0, 6) || "------";

  useEffect(() => {
    const initUser = async () => {
      if (!isLoading && !user) {
        try {
          await signInAnonymously();
        } catch (err) {
          console.error("Anonymous sign-in failed:", err);
          setInitError(true);
        }
      }
    };
    initUser();
  }, [user, isLoading]);

  useEffect(() => {
    if (user) {
      setQrValue(`u:${user.id}`);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Kaffiy'e bağlanılıyor...</p>
      </div>
    );
  }

  if (initError && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center p-8 rounded-3xl bg-secondary/30 backdrop-blur-sm border border-border">
          <span className="text-5xl mb-4 block">☕</span>
          <h1 className="text-xl font-bold text-foreground mb-2">Bağlantı Hatası</h1>
          <p className="text-sm text-muted-foreground mb-4">Lütfen sayfayı yenileyin.</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium">
            Yenile
          </button>
        </div>
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
        <p className="text-muted-foreground mb-6">{profile?.name || "Misafir Kullanıcı"}</p>

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

        {/* Registration Reminder */}
        {!profile?.email || profile.email.startsWith('guest_') ? (
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
        ) : null}
      </main>

      <PoweredByFooter />
    </div>
  );
};

export default QRDisplayPage;
