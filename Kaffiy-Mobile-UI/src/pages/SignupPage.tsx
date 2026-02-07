import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PoweredByFooter from "@/components/PoweredByFooter";
import KVKKModal from "@/components/KVKKModal";
import StepProgress from "@/components/StepProgress";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [pushNotificationAccepted, setPushNotificationAccepted] = useState(false);
  const [isKVKKModalOpen, setIsKVKKModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const transferGuestPoints = async (userId: string) => {
    try {
      const guestPoints = JSON.parse(localStorage.getItem("kaffiy_guest_points") || "[]");
      if (guestPoints.length === 0) return;

      for (const entry of guestPoints) {
        if (!entry.company_id) continue;

        const { data: existing } = await supabase
          .from("royalty_tb")
          .select("id, points")
          .eq("user_id", userId)
          .eq("company_id", entry.company_id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("royalty_tb")
            .update({ points: existing.points + entry.points, last_activity: new Date().toISOString() })
            .eq("id", existing.id);
        } else {
          await supabase
            .from("royalty_tb")
            .insert({
              user_id: userId,
              company_id: entry.company_id,
              points: entry.points,
              level: 'explorer',
              visits_count: 1,
              last_activity: new Date().toISOString(),
            });
        }
      }

      // Temizle
      localStorage.removeItem("kaffiy_guest_points");
      localStorage.removeItem("kaffiy_guest_id");
    } catch (err) {
      console.error("Guest puan aktarım hatası:", err);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);
    
    try {
      // Şifre uzunluk kontrolü
      if (password.length < 6) {
        toast.error("Şifre en az 6 karakter olmalıdır");
        return;
      }

      const name = email.split("@")[0];

      // 1. Kayıt ol (Supabase Auth + user_tb profil oluşturma)
      await signUp(email, password, name, {
        kvkk_accepted: kvkkAccepted,
        push_notification_accepted: pushNotificationAccepted,
      });

      // 2. Otomatik giriş yap (RLS için session gerekli)
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;

      if (data.user) {
        // 3. user_tb profil oluştur (session aktif, RLS geçer)
        const { error: profileError } = await supabase
          .from("user_tb")
          .insert({
            id: data.user.id,
            email,
            first_name: name,
            last_name: "",
            status: "active",
          });

        if (profileError && !profileError.message.includes("duplicate")) {
          console.error("Profile create error:", profileError);
        }

        // 4. Guest puanlarını DB'ye aktar
        await transferGuestPoints(data.user.id);
      }

      toast.success("Kayıt başarılı! Hoş geldiniz.");
      navigate("/home");
    } catch (error: any) {
      const msg = error.message || "Kayıt yapılamadı";
      if (msg.includes("already registered")) {
        toast.error("Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
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
        <form onSubmit={handleSignup} className="space-y-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Şifre Tekrar</label>
            <Input
              type="password"
              placeholder="•••••••••"
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
          onClick={handleSignup}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Kayıt Ol
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
