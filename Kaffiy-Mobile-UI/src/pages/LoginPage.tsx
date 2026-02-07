import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PoweredByFooter from "@/components/PoweredByFooter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await signIn(email, password);
      toast.success("Giriş başarılı!");
      navigate("/home");
    } catch (error) {
      // Error is already handled by AuthContext
    }
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
        <form onSubmit={handleLogin} className="space-y-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">E-posta</label>
            <Input
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Şifre</label>
            <Input
              type="password"
              placeholder="•••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>

        {/* Forgot Password */}
        <div className="text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Şifrenizi mi unuttunuz?
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <p className="text-sm text-muted-foreground">
            Hesabınız yok mu?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-foreground hover:underline transition-colors"
            >
              Kayıt ol
            </button>
          </p>
        </div>
      </main>

      {/* Footer */}
      <PoweredByFooter />
    </div>
  );
};

export default LoginPage;
