import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  Globe,
  Palette, 
  LayoutDashboard,
  CreditCard, 
  HelpCircle,
  Home
} from "lucide-react";
import { HalicKahveLogo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { usePremium } from "@/contexts/PremiumContext";
import { useToast } from "@/hooks/use-toast";
import { useDashboardCards, DASHBOARD_CARDS } from "@/contexts/DashboardCardsContext";
import { useTheme } from "@/hooks/use-theme";
import { useDashboardView } from "@/hooks/use-dashboard-view";
import { Sun, Moon } from "lucide-react";

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isPremium, togglePremium } = usePremium();
  const { toast } = useToast();
  const { cardVisibility, toggleCard, resetToDefault } = useDashboardCards();
  const { theme, toggleTheme, palette, setPalette } = useTheme();
  const { isSimpleView, setViewMode } = useDashboardView();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profil güncellendi",
      description: "Değişiklikleriniz başarıyla kaydedildi.",
    });
  };

  const handleReset = () => {
    resetToDefault();
    setShowResetDialog(false);
    toast({
      title: "Ayarlar sıfırlandı",
      description: "Dashboard kartları varsayılan ayarlara döndürüldü.",
    });
  };

  const stats = [
    { label: "Toplam Müşteri", value: "1,234", icon: User, color: "text-sage" },
    { label: "Bu Ay Ziyaret", value: "856", icon: Coffee, color: "text-gold" },
    { label: "Büyüme", value: "+12%", icon: TrendingUp, color: "text-success" },
    { label: "Puan", value: "4.8", icon: Star, color: "text-gold" },
  ];

  const paletteOptions = [
    {
      id: "terracotta",
      label: "Kiremit",
      description: "Sıcak kiremit tonu",
      swatch: "hsl(18 40% 62%)",
    },
    {
      id: "sage",
      label: "Adaçayı",
      description: "Doğal yeşil ton",
      swatch: "hsl(75 26% 48%)",
    },
    {
      id: "charcoal",
      label: "Soluk Siyah",
      description: "Premium kömür tonu",
      swatch: "hsl(0 0% 28%)",
    },
    {
      id: "latte",
      label: "Latte",
      description: "Yumuşak kahve tonu",
      swatch: "hsl(25 30% 55%)",
    },
    {
      id: "sand",
      label: "Kum",
      description: "Sıcak kum beji",
      swatch: "hsl(38 35% 60%)",
    },
    {
      id: "mist",
      label: "Sis",
      description: "Soğuk gri-mavi",
      swatch: "hsl(210 10% 55%)",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Ayarlar</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="rounded-xl gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard'a Dön
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-7 rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="profile" className="rounded-lg gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Bildirimler</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-lg gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Görünüm</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="rounded-lg gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Güvenlik</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="rounded-lg gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Faturalandırma</span>
            </TabsTrigger>
            <TabsTrigger value="help" className="rounded-lg gap-2">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Yardım</span>
              </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6 space-y-6">
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
                    <button 
                      onClick={() => handleTabChange("security")}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Güvenlik Ayarları</p>
                        <p className="text-xs text-muted-foreground">Şifre ve 2FA yönetimi</p>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => handleTabChange("notifications")}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-gold" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Bildirim Tercihleri</p>
                        <p className="text-xs text-muted-foreground">E-posta ve push ayarları</p>
                      </div>
                    </button>
                    
                    {/* <button 
                      onClick={() => handleTabChange("billing")}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center">
                        <Crown className="w-5 h-5 text-sage" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Abonelik Yönetimi</p>
                        <p className="text-xs text-muted-foreground">Plan ve faturalandırma</p>
                      </div>
                    </button> */}
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
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Bildirim Ayarları</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">E-posta Bildirimleri</p>
                    <p className="text-sm text-muted-foreground">Önemli güncellemeler için e-posta alın</p>
                  </div>
                  <Switch />
                      </div>
                <div className="flex items-center justify-between">
                      <div>
                    <p className="font-medium text-foreground">Push Bildirimleri</p>
                    <p className="text-sm text-muted-foreground">Tarayıcı bildirimleri alın</p>
                  </div>
                  <Switch />
                      </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Kampanya Bildirimleri</p>
                    <p className="text-sm text-muted-foreground">Yeni kampanyalar hakkında bilgilendirilme</p>
                    </div>
                  <Switch defaultChecked />
                  </div>
              </div>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="mt-6">
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Görünüm Ayarları</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30">
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? (
                      <div className="w-10 h-10 rounded-xl bg-[#C2410C]/10 flex items-center justify-center">
                        <Moon className="w-5 h-5 text-[#C2410C]" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                        <Sun className="w-5 h-5 text-gold" />
                    </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">Karanlık Mod</p>
                      <p className="text-sm text-muted-foreground">
                        {theme === "dark" ? "Karanlık tema aktif" : "Aydınlık tema aktif"}
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                  />
                </div>
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">Renk Paleti</p>
                      <p className="text-sm text-muted-foreground">Doğal pastel tema seçin</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {paletteOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          setPalette(
                            option.id as
                              | "terracotta"
                              | "sage"
                              | "charcoal"
                              | "latte"
                              | "sand"
                              | "mist"
                          )
                        }
                        className={cn(
                          "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
                          palette === option.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border/40 bg-background hover:bg-muted/40"
                        )}
                      >
                        <span
                          className="h-6 w-6 rounded-full border border-border/40"
                          style={{ backgroundColor: option.swatch }}
                        />
                        <span className="flex-1">
                          <span className="block text-sm font-medium text-foreground">
                            {option.label}
                          </span>
                          <span className="block text-[11px] text-muted-foreground">
                            {option.description}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30">
                <div>
                    <p className="font-medium text-foreground">Kompakt Görünüm</p>
                    <p className="text-sm text-muted-foreground">Daha az boşluk kullan</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6 space-y-4">
            {/* Dashboard View Mode */}
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Dashboard Görünümü</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30">
                  <div>
                    <p className="font-medium text-foreground">Basit Görünüm</p>
                    <p className="text-sm text-muted-foreground">Sadeleştirilmiş dashboard görünümü</p>
                </div>
                  <Switch
                    checked={isSimpleView}
                    onCheckedChange={(checked) => setViewMode(checked ? "simple" : "standard")}
                  />
                  </div>
                  </div>
                </div>

            {/* Dashboard Cards (only show in standard view) */}
            {!isSimpleView && (
              <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Dashboard Kartları</h3>
                    <p className="text-sm text-muted-foreground">Gösterilecek kartları seçin</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResetDialog(true)}
                    className="rounded-xl"
                  >
                    Varsayılana Sıfırla
                  </Button>
                    </div>
                <div className="space-y-3">
                  {DASHBOARD_CARDS.map((card) => (
                    <div key={card.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                    <div>
                        <p className="font-medium text-foreground">{card.name}</p>
                        {card.description && (
                          <p className="text-xs text-muted-foreground">{card.description}</p>
                        )}
                    </div>
                      <Switch
                        checked={cardVisibility[card.id]}
                        onCheckedChange={() => toggleCard(card.id)}
                      />
                  </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Güvenlik Ayarları</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Mevcut Şifre</Label>
                  <Input type="password" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Yeni Şifre</Label>
                  <Input type="password" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Yeni Şifre (Tekrar)</Label>
                  <Input type="password" className="rounded-xl" />
                </div>
                <Button className="rounded-xl">Şifreyi Güncelle</Button>
              </div>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="mt-6">
            <div className="space-y-4">
              {/* Premium Toggle */}
              <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      isPremium ? "bg-gold/10" : "bg-muted/40"
                    )}>
                      <Crown className={cn(
                        "w-5 h-5",
                        isPremium ? "text-gold" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Premium</p>
                      <p className="text-sm text-muted-foreground">
                        {isPremium ? "Premium özellikler aktif" : "Premium özellikler kapalı"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isPremium}
                    onCheckedChange={togglePremium}
                  />
                </div>
              </div>

              {/* Current Plan Info */}
              <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Faturalandırma</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground">Mevcut Plan</p>
                      {isPremium ? (
                        <span className="flex items-center gap-1 bg-gold/10 text-gold text-xs font-semibold px-2.5 py-1 rounded-full">
                          <Crown className="w-3 h-3" />
                          Premium
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Ücretsiz</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isPremium ? "Premium özellikler aktif" : "Premium'a geçerek daha fazla özellik kullanın"}
                    </p>
                  </div>
                  {!isPremium && (
                    <Button className="w-full rounded-xl gap-2">
                      <Crown className="w-4 h-4" />
                      Premium'a Geç
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Help Tab */}
          <TabsContent value="help" className="mt-6">
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Yardım ve Destek</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/20">
                  <p className="font-medium text-foreground mb-2">Sıkça Sorulan Sorular</p>
                  <p className="text-sm text-muted-foreground">
                    SSS sayfasını ziyaret ederek yaygın soruların cevaplarını bulabilirsiniz.
                  </p>
                    </div>
                <div className="p-4 rounded-xl bg-muted/20">
                  <p className="font-medium text-foreground mb-2">Destek Ekibi</p>
                  <p className="text-sm text-muted-foreground">
                    Sorularınız için destek ekibimizle iletişime geçebilirsiniz.
                  </p>
                    </div>
                <Button variant="outline" className="w-full rounded-xl">
                  Destek İletişim
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Reset Dialog */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
              <AlertDialogDescription>
                Dashboard kartları varsayılan ayarlara döndürülecek. Bu işlem geri alınamaz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">İptal</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset} className="rounded-xl">
                Sıfırla
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
