import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import PoweredByFooter from "@/components/PoweredByFooter";
import StepProgress from "@/components/StepProgress";

const QRDisplayPage = () => {
  const navigate = useNavigate();
  const backupCode = "127456";

  return (
    <div className="mobile-container min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="flex items-center px-4 py-3">
        {/* Empty space to match other pages */}
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
        {/* QR Code Area */}
        <div className="animate-scale-in">
          <div className="w-56 h-56 bg-card rounded-3xl shadow-card flex items-center justify-center border border-border p-4">
            {/* Placeholder QR Pattern */}
            <QrCode className="w-full h-full text-primary" />
          </div>
        </div>

        {/* Backup Code */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <p className="text-sm text-muted-foreground mb-2">Yedek Kod</p>
          <div className="flex items-center justify-center gap-2">
            {backupCode.split("").map((digit, index) => (
              <span
                key={index}
                className="w-10 h-12 flex items-center justify-center bg-secondary rounded-lg text-xl font-semibold text-foreground"
              >
                {digit}
              </span>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <p className="mt-8 text-sm text-muted-foreground text-center max-w-xs animate-fade-in" style={{ animationDelay: "0.3s" }}>
          Bu QR kodu kasada gösterin veya yedek kodu söyleyin
        </p>

        {/* Registration Reminder */}
        <div className="mt-8 px-4 py-3 bg-accent/10 border border-accent/20 rounded-xl max-w-sm animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <p className="text-sm text-foreground text-center font-medium leading-relaxed">
            Puanınızı ve bedava ürününüzü kaybetmemek için lütfen{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              kayıt olun
            </button>
          </p>
        </div>
      </main>

      {/* Bottom Login Link */}
      <footer className="px-6 pb-4 animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-primary"
          onClick={() => navigate("/login")}
        >
          Hesabınız var mı? Giriş yapın
        </Button>
      </footer>

      <PoweredByFooter />
    </div>
  );
};

export default QRDisplayPage;
