import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PoweredByFooter from "@/components/PoweredByFooter";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // TODO: Implement actual login
    navigate("/home");
  };

  const isFormValid = email && password;

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
            Giriş Yap
          </h1>
          <p className="text-muted-foreground mb-8">
            Hesabınıza giriş yapın
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Şifre</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button 
            variant="link" 
            className="p-0 h-auto text-muted-foreground"
            onClick={(e) => {
              e.preventDefault();
              navigate("/forgot-password");
            }}
          >
            Şifremi unuttum
          </Button>
        </form>
      </main>

      {/* Action Buttons */}
      <footer className="px-6 pb-4 space-y-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <Button
          variant="cafe"
          size="xl"
          className="w-full"
          onClick={handleLogin}
          disabled={!isFormValid}
        >
          Giriş Yap
        </Button>
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={() => navigate("/signup")}
        >
          Hesabınız yok mu? Kayıt olun
        </Button>
      </footer>

      <PoweredByFooter />
    </div>
  );
};

export default LoginPage;
