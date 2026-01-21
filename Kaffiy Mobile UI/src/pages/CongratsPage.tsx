import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import PoweredByFooter from "@/components/PoweredByFooter";


const CongratsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="mobile-container min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Celebration Icon */}
        <div className="animate-celebrate">
          <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-6">
            <span className="text-5xl">🎉</span>
          </div>
        </div>

        {/* Message */}
        <div className="text-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Tebrikler!
          </h1>
          <p className="text-xl text-primary font-semibold mb-2">
            1 Puan Kazandınız
          </p>
          <p className="text-muted-foreground">
            Devam etmek için giriş yapın veya hesap oluşturun
          </p>
        </div>

        {/* Coffee Animation */}
        <div className="mt-8 text-6xl animate-float">
          ☕
        </div>
      </main>

      {/* Action Buttons */}
      <footer className="px-6 pb-4 space-y-3 animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <Button
          variant="cafe"
          size="xl"
          className="w-full"
          onClick={() => navigate("/signup")}
        >
          Kayıt Ol
        </Button>
        <Button
          variant="cafe-outline"
          size="lg"
          className="w-full"
          onClick={() => navigate("/login")}
        >
          Giriş Yap
        </Button>
      </footer>

      <PoweredByFooter />
    </div>
  );
};

export default CongratsPage;
