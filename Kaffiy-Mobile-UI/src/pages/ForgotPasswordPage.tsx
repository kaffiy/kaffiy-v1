import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PoweredByFooter from "@/components/PoweredByFooter";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    // TODO: Implement actual password reset
    setIsSubmitted(true);
  };

  const isFormValid = email && email.includes("@");

  if (isSubmitted) {
    return (
      <div className="mobile-container min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
        {/* Header */}
        <header className="flex items-center px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/login")}
            className="text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 py-4 flex items-center justify-center">
          <div className="animate-slide-up text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              E-posta Gönderildi
            </h1>
            <p className="text-muted-foreground mb-8">
              Şifre sıfırlama bağlantısı {email} adresine gönderildi. Lütfen e-posta kutunuzu kontrol edin.
            </p>
            <Button
              variant="cafe"
              size="xl"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Giriş Sayfasına Dön
            </Button>
          </div>
        </main>

        <PoweredByFooter />
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="flex items-center px-4 py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-4">
        <div className="animate-slide-up">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Şifremi Unuttum
          </h1>
          <p className="text-muted-foreground mb-8">
            Şifrenizi sıfırlamak için e-posta adresinizi girin. Size şifre sıfırlama bağlantısı göndereceğiz.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">E-posta</label>
            <Input
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </form>
      </main>

      {/* Action Buttons */}
      <footer className="px-6 pb-4 space-y-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <Button
          variant="cafe"
          size="xl"
          className="w-full"
          onClick={handleSubmit}
          disabled={!isFormValid}
        >
          Şifre Sıfırlama Bağlantısı Gönder
        </Button>
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={() => navigate("/login")}
        >
          Giriş sayfasına dön
        </Button>
      </footer>

      <PoweredByFooter />
    </div>
  );
};

export default ForgotPasswordPage;
