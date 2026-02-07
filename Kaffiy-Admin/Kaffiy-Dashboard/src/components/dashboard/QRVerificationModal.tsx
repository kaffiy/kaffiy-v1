import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { QrCode, Camera, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QRVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type VerificationStatus = "idle" | "scanning" | "success" | "error";

export const QRVerificationModal = ({ open, onOpenChange }: QRVerificationModalProps) => {
  const [backupCode, setBackupCode] = useState("");
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setStatus("scanning");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      // Simulate QR detection after 3 seconds for demo
      setTimeout(() => {
        handleVerificationSuccess();
      }, 3000);
    } catch (error) {
      console.error("Camera access denied:", error);
      setStatus("error");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleVerificationSuccess = () => {
    stopCamera();
    setStatus("success");
    setTimeout(() => {
      onOpenChange(false);
      setStatus("idle");
      setBackupCode("");
    }, 2000);
  };

  const handleBackupCodeSubmit = () => {
    if (backupCode.length === 6) {
      setStatus("scanning");
      // Simulate verification
      setTimeout(() => {
        if (backupCode === "123456") {
          handleVerificationSuccess();
        } else {
          setStatus("error");
          setTimeout(() => setStatus("idle"), 2000);
        }
      }, 1000);
    }
  };

  useEffect(() => {
    if (!open) {
      stopCamera();
      setStatus("idle");
      setBackupCode("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] sm:max-w-[360px] p-0 gap-0 bg-card border-border/50 rounded-2xl overflow-hidden shadow-premium">
        {/* Header */}
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border/50 bg-gradient-to-r from-olive/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-olive/20 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-olive-dark" />
            </div>
            <div>
              <DialogTitle className="text-lg text-foreground font-semibold">Puan Doğrulama</DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs mt-0.5">
                Müşteri QR kodunu tarayın veya backup kodu girin
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-4 py-4 space-y-4">
          {/* Camera Section */}
          <div className="space-y-2.5">
            <div 
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden bg-muted/50 border-2 border-dashed border-border/50 transition-all duration-300",
                isCameraActive && "border-solid border-olive"
              )}
            >
              {isCameraActive ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 border-2 border-olive rounded-xl relative">
                      <div className="absolute inset-0 border-2 border-olive/50 rounded-xl animate-pulse" />
                      {/* Corner markers */}
                      <div className="absolute top-0 left-0 w-5 h-5 border-t-3 border-l-3 border-olive rounded-tl-md" />
                      <div className="absolute top-0 right-0 w-5 h-5 border-t-3 border-r-3 border-olive rounded-tr-md" />
                      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-3 border-l-3 border-olive rounded-bl-md" />
                      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-3 border-r-3 border-olive rounded-br-md" />
                    </div>
                  </div>
                  {/* Status indicator */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/70 rounded-full flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 text-olive animate-spin" />
                    <span className="text-xs text-white font-medium">QR Taranıyor...</span>
                  </div>
                </>
              ) : status === "success" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-success/10">
                  <CheckCircle2 className="w-12 h-12 text-success mb-2" />
                  <span className="text-success font-semibold text-base">Puan Onaylandı!</span>
                  <span className="text-muted-foreground text-xs mt-0.5">+1 puan eklendi</span>
                </div>
              ) : status === "error" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10">
                  <XCircle className="w-12 h-12 text-destructive mb-2" />
                  <span className="text-destructive font-semibold text-base">Geçersiz Kod</span>
                  <span className="text-muted-foreground text-xs mt-0.5">Tekrar deneyin</span>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Camera className="w-10 h-10 text-muted-foreground/50 mb-2" />
                  <span className="text-muted-foreground text-xs">Kamerayı başlatmak için tıklayın</span>
                </div>
              )}
            </div>

            {status === "idle" && (
              <Button 
                onClick={startCamera}
                className="w-full h-10 rounded-lg bg-olive hover:bg-olive-dark text-white font-semibold gap-1.5 transition-all duration-200 text-sm"
              >
                <Camera className="w-4 h-4" />
                QR Tara
              </Button>
            )}

            {isCameraActive && (
              <Button 
                variant="outline"
                onClick={stopCamera}
                className="w-full h-10 rounded-lg border-border/50 hover:bg-muted/50 font-medium text-sm"
              >
                İptal
              </Button>
            )}
          </div>

          {/* Divider */}
          {status === "idle" && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-4 text-xs text-muted-foreground uppercase tracking-wide">veya</span>
                </div>
              </div>

              {/* Backup Code Section */}
              <div className="space-y-2.5">
                <label className="text-xs font-medium text-foreground">
                  Backup Kodu Girin
                </label>
                <InputOTP 
                  maxLength={6} 
                  value={backupCode} 
                  onChange={setBackupCode}
                  className="justify-center"
                >
                  <InputOTPGroup className="gap-1.5">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot 
                        key={index}
                        index={index} 
                        className="w-9 h-10 rounded-lg border-border/50 bg-muted/30 text-sm font-semibold"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <Button 
                  onClick={handleBackupCodeSubmit}
                  disabled={backupCode.length !== 6}
                  className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold disabled:opacity-50 transition-all duration-200 text-sm"
                >
                  Doğrula
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
