import { useState, useEffect } from "react";
import { QrCode, Gift, Percent, Coffee, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import StampAnimation from "./StampAnimation";

interface QRModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cafeId?: number;
  selectedCampaigns?: {
    id: number;
    title: string;
    icon: string;
    color: string;
  }[];
  onRemoveCampaign?: (campaignId: number) => void;
}

const QR_REFRESH_SECONDS = 60;

const getCampaignIcon = (iconType: string) => {
  switch (iconType) {
    case "gift":
      return Gift;
    case "percent":
      return Percent;
    case "coffee":
      return Coffee;
    default:
      return Gift;
  }
};

const QRModal = ({ open, onOpenChange, cafeId, selectedCampaigns = [], onRemoveCampaign }: QRModalProps) => {
  const [timeLeft, setTimeLeft] = useState(QR_REFRESH_SECONDS);
  const [qrCode, setQrCode] = useState("127456");
  const [showStamp, setShowStamp] = useState(false);

  const generateNewCode = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setQrCode(newCode);
    setTimeLeft(QR_REFRESH_SECONDS);
  };

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateNewCode();
          return QR_REFRESH_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (open) generateNewCode();
  }, [open]);

  // Simüle: QR tarandığında tetiklenir (test için QR'a tıklayın)
  const handleQRScanned = () => {
    setShowStamp(true);
  };

  const handleStampComplete = () => {
    setShowStamp(false);
    onOpenChange(false);
  };

  const progress = (timeLeft / QR_REFRESH_SECONDS) * 100;
  const circumference = 2 * Math.PI * 72;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[280px] p-5 rounded-3xl border-none bg-card [&>button]:hidden">
          <DialogTitle className="sr-only">QR Kod</DialogTitle>
          <div className="flex flex-col items-center">
            {/* Selected Campaigns */}
            {selectedCampaigns.length > 0 && (
              <div className="w-full mb-4 space-y-2 animate-fade-in">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide text-center mb-2">
                  Seçili Kampanyalar ({selectedCampaigns.length})
                </p>
                {selectedCampaigns.map((campaign) => (
                  <div key={campaign.id} className="p-2.5 rounded-xl bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${campaign.color}`}>
                        {(() => {
                          const IconComponent = getCampaignIcon(campaign.icon);
                          return <IconComponent className="w-3 h-3" />;
                        })()}
                      </div>
                      <p className="text-[11px] font-semibold text-foreground line-clamp-1 flex-1">
                        {campaign.title}
                      </p>
                      {onRemoveCampaign && (
                        <button
                          onClick={() => onRemoveCampaign(campaign.id)}
                          className="w-5 h-5 rounded-full bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors shrink-0"
                          aria-label="Kampanyayı kaldır"
                        >
                          <X className="w-3 h-3 text-destructive" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* QR Code with circular progress */}
            <button 
              onClick={handleQRScanned}
              className="relative w-40 h-40 cursor-pointer hover:scale-105 transition-transform active:scale-95"
              title="Test için tıklayın"
            >
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80" cy="80" r="72"
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="4"
                />
                <circle
                  cx="80" cy="80" r="72"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-3 bg-background rounded-2xl flex items-center justify-center p-2">
                <QrCode className="w-full h-full text-primary" />
              </div>
            </button>

            {/* Timer */}
            <p className="mt-3 text-xl font-bold text-foreground">{timeLeft}s</p>
            <p className="text-[11px] text-muted-foreground">Yenilenmeye kalan süre</p>

            {/* Backup Code */}
            <div className="mt-4 text-center">
              <p className="text-[11px] text-muted-foreground mb-1.5">Yedek Kod</p>
              <div className="flex items-center justify-center gap-1">
                {qrCode.split("").map((digit, index) => (
                  <span
                    key={index}
                    className="w-7 h-8 flex items-center justify-center bg-secondary rounded-md text-sm font-semibold text-foreground"
                  >
                    {digit}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-3 text-[11px] text-muted-foreground text-center">
              Bu QR kodu kasada gösterin
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stamp Animation Overlay */}
      <StampAnimation 
        show={showStamp} 
        onComplete={handleStampComplete}
        cafeName="Ahlic Kafe"
      />
    </>
  );
};

export default QRModal;
