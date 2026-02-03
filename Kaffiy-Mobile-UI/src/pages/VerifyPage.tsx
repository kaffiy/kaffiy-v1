import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PoweredByFooter from "@/components/PoweredByFooter";
import StepProgress from "@/components/StepProgress";

const VerifyPage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newCode = [...code];
      newCode[index] = value.replace(/\D/g, "");
      setCode(newCode);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleRegister = () => {
    // TODO: Implement actual verification
    localStorage.setItem("registration-complete", "true");
    navigate("/home");
  };

  const isCodeComplete = code.every((digit) => digit !== "");

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
        currentStep={3} 
        totalSteps={3} 
        compact
      />

      {/* Main Content */}
      <main className="flex-1 px-6 py-4">
        <div className="animate-slide-up">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Doğrulama Kodu
          </h1>
          <p className="text-muted-foreground mb-8">
            E-posta adresinize gönderilen 6 haneli kodu girin
          </p>
        </div>

        {/* Code Input */}
        <div className="flex justify-center gap-3 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-semibold rounded-xl border-2 border-input bg-card transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          ))}
        </div>

        {/* Resend Link */}
        <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <Button variant="link" className="text-muted-foreground">
            Kod gelmedi mi? Tekrar gönder
          </Button>
        </div>
      </main>

      {/* Action Button */}
      <footer className="px-6 pb-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <Button
          variant="cafe"
          size="xl"
          className="w-full"
          onClick={handleRegister}
          disabled={!isCodeComplete}
        >
          Kayıt Ol
        </Button>
      </footer>

      <PoweredByFooter />
    </div>
  );
};

export default VerifyPage;
