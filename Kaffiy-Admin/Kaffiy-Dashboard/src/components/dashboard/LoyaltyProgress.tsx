import { useState, useEffect, useRef } from "react";
import { Gift, QrCode, ChevronDown, ChevronUp, X, FileText, GripVertical, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface RewardDetail {
  id: string;
  customerName: string;
  rewardName: string;
  rewardType: string;
  stampCost: number;
  timestamp: Date;
}

const getTimeAgo = (date: Date) => {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "şimdi";
  if (minutes < 60) return `${minutes}dk`;
  return `${Math.floor(minutes / 60)}sa`;
};

const mockRewardDetails: RewardDetail[] = [
  { id: "1", customerName: "Ahmet Yılmaz", rewardName: "Ücretsiz Kahve", rewardType: "Kahve", stampCost: 10, timestamp: new Date(Date.now() - 15 * 60000) },
  { id: "2", customerName: "Selin Kaya", rewardName: "Ücretsiz Kruvasan", rewardType: "Yiyecek", stampCost: 5, timestamp: new Date(Date.now() - 45 * 60000) },
  { id: "3", customerName: "Mehmet Demir", rewardName: "Ücretsiz Kahve", rewardType: "Kahve", stampCost: 10, timestamp: new Date(Date.now() - 2 * 3600000) },
  { id: "4", customerName: "Zeynep Aksoy", rewardName: "Mevsimlik İçecek", rewardType: "İçecek", stampCost: 8, timestamp: new Date(Date.now() - 4 * 3600000) },
];

export const LoyaltyProgress = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Puan Kullanıldı kaldırıldı, sadece QR Tarama ve Ödül Kullanıldı
  const todayActivity: Array<{ label: string; value: number; icon: typeof QrCode | typeof Gift; clickable: boolean }> = [
    { label: "QR Tarama", value: 31, icon: QrCode, clickable: false },
    { label: "Ödül Kullanıldı", value: 4, icon: Gift, clickable: true },
  ];

  const totalActivity = todayActivity.reduce((acc, item) => acc + item.value, 0);

  // Draggable functionality for reward modal
  useEffect(() => {
    if (!showRewardModal) {
      setPosition({ x: 0, y: 0 });
      return;
    }

    if (showRewardModal && dialogRef.current) {
      setTimeout(() => {
        if (dialogRef.current) {
          const rect = dialogRef.current.getBoundingClientRect();
          if (rect.width === 0) return;
          setPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          });
        }
      }, 10);
    }
  }, [showRewardModal]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!dialogRef.current) return;
    e.preventDefault();
    const rect = dialogRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleClose = () => {
    setShowRewardModal(false);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <>
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="stat-card">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between cursor-pointer group">
            <h3 className="text-sm font-semibold text-foreground">Bugünkü Hareketler</h3>
            <div className="flex items-center gap-1.5">
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="mt-3">
            <div className="grid grid-cols-2 gap-3">
              {todayActivity.map((item) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.label}
                    onClick={() => item.clickable && setShowRewardModal(true)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl transition-all group",
                      item.clickable 
                        ? "bg-muted/30 hover:bg-muted/50 cursor-pointer hover:border-primary/30 border border-transparent" 
                        : "bg-muted/30 border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-sage/10 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-sage-dark" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{item.label}</span>
                      {item.clickable && (
                        <Maximize2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    <span className="text-lg font-bold text-foreground">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>

      {/* Reward Details Modal - Draggable */}
      <Dialog open={showRewardModal} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent
          ref={dialogRef}
          className={cn(
            "fixed max-w-2xl w-full max-h-[85vh] overflow-hidden p-0 gap-0 rounded-2xl shadow-2xl border-border/60",
            "cursor-move select-none",
            isDragging && "cursor-grabbing",
            "[&>button]:hidden"
          )}
          style={{
            ...(position.x > 0 && position.y > 0 
              ? {
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  transform: "translate(-50%, -50%)",
                }
              : {}),
            margin: 0,
          }}
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Draggable Header */}
          <div
            onMouseDown={handleMouseDown}
            className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-muted/30 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <GripVertical className="w-4 h-4" />
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Kullanılan Ödüller Detayı
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bugün kullanılan tüm ödüller ve detayları
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-60px)] p-6">
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-xl p-4 border border-gold/20">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{mockRewardDetails.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Toplam Ödül</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {mockRewardDetails.reduce((sum, r) => sum + r.stampCost, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Kullanılan Puan</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {new Set(mockRewardDetails.map(r => r.customerName)).size}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Müşteri Sayısı</p>
                  </div>
                </div>
              </div>

              {/* Reward Details Table */}
              <div className="border border-border/60 rounded-xl overflow-hidden">
                <div className="bg-muted/40 px-4 py-3 border-b border-border/60">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Ödül Detayları
                  </h4>
                </div>
                <div className="divide-y divide-border/60 max-h-64 overflow-y-auto">
                  {mockRewardDetails.map((reward, index) => (
                    <div
                      key={reward.id}
                      className="px-4 py-3 grid grid-cols-4 gap-4 text-sm hover:bg-muted/20 transition-colors"
                    >
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Müşteri</p>
                        <p className="font-semibold text-foreground">{reward.customerName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Ödül</p>
                        <p className="font-medium text-foreground">{reward.rewardName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Kategori</p>
                        <p className="font-medium text-foreground">{reward.rewardType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Puan / Zaman</p>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-primary">{reward.stampCost} puan</p>
                          <span className="text-[10px] text-muted-foreground">
                            {getTimeAgo(reward.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 bg-muted/30 border-t-2 border-border/60">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Toplam</p>
                      <p className="font-bold text-foreground">Genel</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Ödül</p>
                      <p className="font-bold text-primary">{mockRewardDetails.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Puan</p>
                      <p className="font-bold text-primary">
                        {mockRewardDetails.reduce((sum, r) => sum + r.stampCost, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Ortalama</p>
                      <p className="font-bold text-foreground">
                        {Math.round(mockRewardDetails.reduce((sum, r) => sum + r.stampCost, 0) / mockRewardDetails.length)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
};
