import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PoweredByFooter from "@/components/PoweredByFooter";
import KVKKModal from "@/components/KVKKModal";
import StepProgress from "@/components/StepProgress";

const SignupPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [pushNotificationAccepted, setPushNotificationAccepted] = useState(false);
  const [isKVKKModalOpen, setIsKVKKModalOpen] = useState(false);

  const handleSendCode = () => {
    // TODO: Implement actual code sending
    navigate("/verify");
  };

  const isFormValid = email && password && passwordConfirm && password === passwordConfirm && kvkkAccepted;

  return (
    <div className="mobile-container min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="flex items-center px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-foreground shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </header>

      {/* Progress Bar */}
      <StepProgress 
        currentStep={2} 
        totalSteps={3} 
        compact
      />

      {/* Main Content */}
      <main className="flex-1 px-6 py-4">
        <div className="animate-slide-up">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Hesap Oluştur
          </h1>
          <p className="text-muted-foreground mb-8">
            Puanlarınızı takip etmek için kayıt olun
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Şifre Tekrar</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
            {passwordConfirm && password !== passwordConfirm && (
              <p className="text-sm text-destructive">Şifreler eşleşmiyor</p>
            )}
          </div>

          {/* KVKK Checkbox - Required */}
          <div className="flex items-start gap-3 pt-4">
            <Checkbox
              id="kvkk"
              checked={kvkkAccepted}
              onCheckedChange={(checked) => setKvkkAccepted(checked as boolean)}
              className="mt-0.5 shrink-0"
            />
            <label htmlFor="kvkk" className="text-sm text-muted-foreground leading-relaxed">
              Kaffiy{" "}
              <button
                type="button"
                onClick={() => setIsKVKKModalOpen(true)}
                className="text-primary font-medium underline underline-offset-2 hover:text-primary/80 transition-colors"
              >
                Aydınlatma Metni
              </button>
              'ni okudum, kişisel verilerimin işlenmesini kabul ediyorum.
              <span className="text-destructive ml-1">*</span>
            </label>
          </div>

          {/* Push Notification Checkbox - Optional */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="push-notification"
              checked={pushNotificationAccepted}
              onCheckedChange={(checked) => setPushNotificationAccepted(checked as boolean)}
              className="mt-0.5 shrink-0"
            />
            <label htmlFor="push-notification" className="text-sm text-muted-foreground leading-relaxed">
              Kampanya, indirim ve hediye duyurularının tarafıma Anlık Bildirim (Push Notification) yoluyla gönderilmesini kabul ediyorum.
            </label>
          </div>
        </form>
      </main>

      {/* Action Button */}
      <footer className="px-6 pb-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <Button
          variant="cafe"
          size="xl"
          className="w-full"
          onClick={handleSendCode}
          disabled={!isFormValid}
        >
          Kod Gönder
        </Button>
      </footer>

      <PoweredByFooter />

      {/* KVKK Modal */}
      <KVKKModal 
        open={isKVKKModalOpen} 
        onClose={() => setIsKVKKModalOpen(false)}
        onAccept={() => setKvkkAccepted(true)}
      />
    </div>
  );
};

export default SignupPage;
