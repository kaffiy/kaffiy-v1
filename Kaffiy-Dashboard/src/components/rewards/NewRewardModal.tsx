import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Gift, Coffee, Cake, IceCream, Croissant, Cookie, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reward {
  id: string;
  name: string;
  description: string;
  stampsRequired: number;
  icon: "coffee" | "cake" | "icecream" | "croissant" | "cookie" | "gift";
  isActive: boolean;
  redemptions: number;
  value: number;
}

interface NewRewardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingReward?: Reward | null;
  onSave?: (rewardData: Partial<Reward>) => void;
}

const iconOptions = [
  { value: "coffee", label: "Kahve", icon: Coffee },
  { value: "cake", label: "Pasta", icon: Cake },
  { value: "icecream", label: "Dondurma", icon: IceCream },
  { value: "croissant", label: "Kruvasan", icon: Croissant },
  { value: "cookie", label: "Kurabiye", icon: Cookie },
  { value: "gift", label: "Hediye", icon: Gift },
];

export const NewRewardModal = ({ open, onOpenChange, editingReward, onSave }: NewRewardModalProps) => {
  const [rewardName, setRewardName] = useState("");
  const [description, setDescription] = useState("");
  const [stampsRequired, setStampsRequired] = useState<number>(10);
  const [selectedIcon, setSelectedIcon] = useState<Reward["icon"]>("coffee");
  const [value, setValue] = useState<number>(0);

  useEffect(() => {
    if (open && editingReward) {
      setRewardName(editingReward.name);
      setDescription(editingReward.description);
      setStampsRequired(editingReward.stampsRequired);
      setSelectedIcon(editingReward.icon);
      setValue(editingReward.value);
    } else if (open && !editingReward) {
      setRewardName("");
      setDescription("");
      setStampsRequired(10);
      setSelectedIcon("coffee");
      setValue(0);
    }
  }, [open, editingReward]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rewardName || !description || stampsRequired <= 0) {
      return;
    }

    const rewardData: Partial<Reward> = {
      id: editingReward?.id || Date.now().toString(),
      name: rewardName,
      description: description,
      stampsRequired: stampsRequired,
      icon: selectedIcon,
      value: value,
      isActive: editingReward?.isActive ?? true,
      redemptions: editingReward?.redemptions || 0,
    };

    if (onSave) {
      onSave(rewardData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 bg-card border-border/50 rounded-2xl overflow-hidden shadow-premium">
        <DialogHeader className="px-5 pt-4 pb-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-serif text-lg text-foreground">
                {editingReward ? "Ödülü Düzenle" : "Yeni Ödül"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs mt-0.5">
                {editingReward ? "Ödül bilgilerini güncelleyin" : "Müşterilerinize yeni bir ödül ekleyin"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3.5">
          {/* Reward Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium text-foreground">
              Ödül Adı
            </Label>
            <Input
              id="name"
              placeholder="Örn: Ücretsiz Kahve"
              value={rewardName}
              onChange={(e) => setRewardName(e.target.value)}
              className="h-9 rounded-lg border-border/50 bg-muted/30 focus:bg-background transition-colors placeholder:text-muted-foreground/60 text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-medium text-foreground">
              Açıklama
            </Label>
            <Textarea
              id="description"
              placeholder="Ödül hakkında açıklama..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[60px] rounded-lg border-border/50 bg-muted/30 focus:bg-background transition-colors resize-none placeholder:text-muted-foreground/60 text-sm py-2"
            />
          </div>

          {/* Stamps Required & Value */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="stamps" className="text-xs font-medium text-foreground">
                Puan Sayısı
              </Label>
              <Input
                id="stamps"
                type="number"
                min="1"
                placeholder="10"
                value={stampsRequired}
                onChange={(e) => setStampsRequired(parseInt(e.target.value) || 0)}
                className="h-9 rounded-lg border-border/50 bg-muted/30 focus:bg-background transition-colors text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="value" className="text-xs font-medium text-foreground">
                Değer (₺)
              </Label>
              <Input
                id="value"
                type="number"
                min="0"
                placeholder="45"
                value={value}
                onChange={(e) => setValue(parseInt(e.target.value) || 0)}
                className="h-9 rounded-lg border-border/50 bg-muted/30 focus:bg-background transition-colors text-sm"
              />
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">İkon</Label>
            <div className="grid grid-cols-3 gap-2">
              {iconOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedIcon(option.value as Reward["icon"])}
                    className={cn(
                      "p-2.5 rounded-lg border text-center transition-all duration-200",
                      selectedIcon === option.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/50 bg-muted/30 hover:border-border hover:bg-muted/50"
                    )}
                  >
                    <IconComponent className={cn(
                      "w-5 h-5 mx-auto mb-1",
                      selectedIcon === option.value ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-[10px] font-medium block",
                      selectedIcon === option.value ? "text-foreground" : "text-foreground/80"
                    )}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-9 rounded-lg border-border/50 hover:bg-muted/50 text-sm"
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="flex-1 h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-sm"
            >
              {editingReward ? "Kaydet" : "Oluştur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
