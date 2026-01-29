import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Gift, 
  Coffee, 
  Star, 
  Edit, 
  Trash2, 
  MoreVertical,
  Cake,
  IceCream,
  Croissant,
  Cookie,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { NewRewardModal } from "@/components/rewards/NewRewardModal";

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

const mockRewards: Reward[] = [
  { id: "1", name: "Ücretsiz Kahve", description: "Herhangi bir kahve çeşidi", stampsRequired: 10, icon: "coffee", isActive: true, redemptions: 234, value: 45 },
  { id: "2", name: "Pasta Dilimi", description: "Günün pastasından bir dilim", stampsRequired: 15, icon: "cake", isActive: true, redemptions: 89, value: 65 },
];

const getRewardIcon = (icon: Reward["icon"]) => {
  switch (icon) {
    case "coffee": return Coffee;
    case "cake": return Cake;
    case "icecream": return IceCream;
    case "croissant": return Croissant;
    case "cookie": return Cookie;
    case "gift": return Gift;
  }
};

const Rewards = () => {
  const { toast } = useToast();
  const [rewards, setRewards] = useState(mockRewards);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState<Reward | null>(null);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleReward = (id: string) => {
    setRewards(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, isActive: !r.isActive };
        toast({
          title: updated.isActive ? "Ödül aktif edildi" : "Ödül pasif edildi",
          description: `${r.name} ${updated.isActive ? "aktif" : "pasif"} hale getirildi.`,
        });
        return updated;
      }
      return r;
    }));
  };

  const handleDeleteClick = (reward: Reward) => {
    setRewardToDelete(reward);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (rewardToDelete) {
      setRewards(prev => prev.filter(r => r.id !== rewardToDelete.id));
      toast({
        title: "Ödül silindi",
        description: `${rewardToDelete.name} başarıyla silindi.`,
      });
      setDeleteDialogOpen(false);
      setRewardToDelete(null);
    }
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setIsModalOpen(true);
  };

  const handleNewReward = () => {
    setEditingReward(null);
    setIsModalOpen(true);
  };

  const handleSave = (rewardData: Partial<Reward>) => {
    if (editingReward) {
      // Update existing reward
      setRewards(prev => prev.map(r => 
        r.id === editingReward.id 
          ? { ...r, ...rewardData }
          : r
      ));
      toast({
        title: "Ödül güncellendi",
        description: `${rewardData.name} başarıyla güncellendi.`,
      });
      setEditingReward(null);
    } else {
      // Create new reward
      setRewards(prev => [...prev, rewardData as Reward]);
      toast({
        title: "Ödül oluşturuldu",
        description: `${rewardData.name} başarıyla oluşturuldu.`,
      });
    }
  };

  const stats = {
    total: rewards.length,
    active: rewards.filter(r => r.isActive).length,
    totalRedemptions: rewards.reduce((acc, r) => acc + r.redemptions, 0),
    totalValue: rewards.reduce((acc, r) => acc + (r.redemptions * r.value), 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <Gift className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Toplam Ödül</p>
              </div>
            </div>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Aktif Ödül</p>
              </div>
            </div>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-sage" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalRedemptions}</p>
                <p className="text-xs text-muted-foreground">Kullanılan</p>
              </div>
            </div>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₺{(stats.totalValue / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Toplam Değer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Ödül Kataloğu</h3>
            <p className="text-sm text-muted-foreground">Müşterilerinize sunduğunuz ödülleri yönetin</p>
          </div>
          <Button size="sm" className="rounded-xl gap-2 bg-primary" onClick={handleNewReward}>
            <Plus className="w-4 h-4" />
            Yeni Ödül
          </Button>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => {
            const IconComponent = getRewardIcon(reward.icon);
            return (
              <div 
                key={reward.id} 
                className={cn(
                  "bg-card/60 backdrop-blur-sm rounded-2xl border p-5 transition-all",
                  reward.isActive 
                    ? "border-border/50 hover:border-border" 
                    : "border-border/30 opacity-60"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    reward.isActive ? "bg-gold/10" : "bg-muted/50"
                  )}>
                    <IconComponent className={cn(
                      "w-6 h-6",
                      reward.isActive ? "text-gold" : "text-muted-foreground"
                    )} />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => handleEdit(reward)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteClick(reward)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="font-semibold text-foreground mb-1">{reward.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{reward.description}</p>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 bg-sage/10 px-2.5 py-1 rounded-full">
                    <Star className="w-3 h-3 text-sage" />
                    <span className="text-xs font-semibold text-sage">{reward.stampsRequired} puan</span>
                  </div>
                  <span className="text-xs text-muted-foreground">₺{reward.value} değer</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{reward.redemptions}</span> kez kullanıldı
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {reward.isActive ? "Aktif" : "Pasif"}
                    </span>
                    <Switch 
                      checked={reward.isActive} 
                      onCheckedChange={() => toggleReward(reward.id)}
                      className="scale-75 data-[state=checked]:bg-success"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* New/Edit Reward Modal */}
        <NewRewardModal
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setEditingReward(null);
          }}
          editingReward={editingReward}
          onSave={handleSave}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Ödülü sil?</AlertDialogTitle>
              <AlertDialogDescription>
                {rewardToDelete && (
                  <>
                    <strong>{rewardToDelete.name}</strong> ödülünü silmek istediğinize emin misiniz? 
                    Bu işlem geri alınamaz.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">İptal</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                className="bg-destructive hover:bg-destructive/90 rounded-xl"
              >
                Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Rewards;
