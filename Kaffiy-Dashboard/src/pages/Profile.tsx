import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Camera, 
  Save,
  LogOut,
  Shield,
  Bell,
  Crown,
  Coffee,
  TrendingUp,
  Star,
  Instagram,
  Globe
} from "lucide-react";
import { HalicKahveLogo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { usePremium } from "@/contexts/PremiumContext";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { isPremium } = usePremium();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profil güncellendi",
      description: "Değişiklikleriniz başarıyla kaydedildi.",
    });
  };

  const stats = [
    { label: "Toplam Müşteri", value: "1,234", icon: User, color: "text-sage" },
    { label: "Bu Ay Ziyaret", value: "856", icon: Coffee, color: "text-gold" },
    { label: "Büyüme", value: "+12%", icon: TrendingUp, color: "text-success" },
    { label: "Puan", value: "4.8", icon: Star, color: "text-gold" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-black flex items-center justify-center shadow-lg p-4">
                <HalicKahveLogo className="w-full h-full" />
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-semibold text-foreground">Halic Kahve</h2>
                {isPremium && (
                  <span className="flex items-center gap-1 bg-gold/10 text-gold text-xs font-semibold px-2.5 py-1 rounded-full">
                    <Crown className="w-3 h-3" />
                    Premium
                  </span>
                )}
              </div>
              <a
                href="mailto:info@caferosetta.com"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 inline-block"
              >
                info@caferosetta.com
              </a>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>Kadıköy, İstanbul</span>
                <span className="mx-2">•</span>
                <Calendar className="w-3.5 h-3.5" />
                <span>Mart 2023'ten beri üye</span>
              </div>
              <a
                href="https://www.instagram.com/halickahve/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@halickahve</span>
              </a>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setIsEditing(false)}>
                    İptal
                  </Button>
                  <Button size="sm" className="rounded-xl gap-2 bg-primary" onClick={handleSave}>
                    <Save className="w-4 h-4" />
                    Kaydet
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setIsEditing(true)}>
                  Düzenle
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", 
                  stat.color === "text-sage" && "bg-sage/10",
                  stat.color === "text-gold" && "bg-gold/10",
                  stat.color === "text-success" && "bg-success/10"
                )}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">İşletme Bilgileri</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>İşletme Adı</Label>
                <Input 
                  defaultValue="Halic Kahve" 
                  disabled={!isEditing}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    defaultValue="info@caferosetta.com" 
                    disabled={!isEditing}
                    className="rounded-xl pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    defaultValue="+90 216 123 4567" 
                    disabled={!isEditing}
                    className="rounded-xl pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adres</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    defaultValue="Caferağa Mah. Moda Cad. No:45, Kadıköy" 
                    disabled={!isEditing}
                    className="rounded-xl pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Web Sitesi</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <a
                    href="https://www.halickahve.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center h-10 px-3 pl-10 rounded-xl border border-border bg-background text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    halickahve.com
                  </a>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <a
                    href="https://www.instagram.com/halickahve/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center h-10 px-3 pl-10 rounded-xl border border-border bg-background text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    @halickahve
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Hızlı İşlemler</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors text-left">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Güvenlik Ayarları</p>
                    <p className="text-xs text-muted-foreground">Şifre ve 2FA yönetimi</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors text-left">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Bildirim Tercihleri</p>
                    <p className="text-xs text-muted-foreground">E-posta ve push ayarları</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors text-left">
                  <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-sage" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Abonelik Yönetimi</p>
                    <p className="text-xs text-muted-foreground">Plan ve faturalandırma</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Logout */}
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
              <Button variant="outline" className="w-full rounded-xl gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
