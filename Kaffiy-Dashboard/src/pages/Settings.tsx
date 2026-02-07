import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  User, 
  Coffee, 
  TrendingUp, 
  Star, 
  Crown, 
  Moon, 
  Sun, 
  Palette, 
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useDashboardCards } from "@/contexts/DashboardCardsContext";
import { useTheme } from "@/hooks/use-theme";
import { useDashboardView } from "@/hooks/use-dashboard-view";
import { usePremium } from "@/contexts/PremiumContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isPremium, togglePremium } = usePremium();
  const { toast } = useToast();
  const { cardVisibility, toggleCard, resetToDefault, isCardLocked } = useDashboardCards();
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
      id: "default",
      name: "Indigo",
      primary: "#6366f1",
      secondary: "#818cf8",
      accent: "#e0e7ff",
    },
    {
      id: "emerald",
      name: "Emerald",
      primary: "#10b981",
      secondary: "#34d399",
      accent: "#d1fae5",
    },
    {
      id: "amber",
      name: "Amber",
      primary: "#f59e0b",
      secondary: "#fbbf24",
      accent: "#fef3c7",
    },
    {
      id: "rose",
      name: "Rose",
      primary: "#f43f5e",
      secondary: "#fb7185",
      accent: "#ffe4e6",
    },
    {
      id: "violet",
      name: "Violet",
      primary: "#8b5cf6",
      secondary: "#a78bfa",
      accent: "#ede9fe",
    },
    {
      id: "slate",
      name: "Slate",
      primary: "#64748b",
      secondary: "#94a3b8",
      accent: "#f1f5f9",
    },
    {
      id: "zinc",
      name: "Zinc",
      primary: "#71717a",
      secondary: "#a1a1aa",
      accent: "#fafafa",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
          <Button
            onClick={handleSave}
            disabled={!isEditing}
            className="rounded-xl"
          >
            Değişiklikleri Kaydet
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
              <SettingsIcon className="w-4 h-4" />
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg p-4">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full bg-white border-gray-200 hover:bg-gray-50"
                  >
                    Değiştir
                  </Button>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Admin User</h2>
                  <p className="text-gray-500">admin@kaffiy.com</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                      Premium
                    </Badge>
                    <Badge variant="outline">Admin</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", 
                      stat.color === "text-sage" && "bg-sage/10",
                      stat.color === "text-gold" && "bg-gold/10",
                      stat.color === "text-success" && "bg-success/10"
                    )}>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">İşletme Bilgileri</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName" className="text-sm font-medium text-gray-700">
                      İşletme Adı
                    </Label>
                    <Input
                      id="businessName"
                      defaultValue="Halik Kahve"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                      Adres
                    </Label>
                    <Input
                      id="address"
                      defaultValue="İstanbul, Türkiye"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Telefon
                    </Label>
                    <Input
                      id="phone"
                      defaultValue="+90 212 555 0123"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
                  
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-between rounded-xl">
                      <span>Profil Düzenle</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between rounded-xl">
                      <span>Şifre Değiştir</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between rounded-xl">
                      <span>İki Faktörlü Doğrulama</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Logout */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <Button variant="outline" className="w-full rounded-xl gap-2 text-red-600 border-red-200 hover:bg-red-50">
                    <LogOut className="w-4 h-4" />
                    Çıkış Yap
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Bildirim Ayarları</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">E-posta Bildirimleri</p>
                    <p className="text-sm text-gray-500">Önemli güncellemeler için e-posta alın</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Push Bildirimleri</p>
                    <p className="text-sm text-gray-500">Tarayıcı bildirimleri alın</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Kampanya Bildirimleri</p>
                    <p className="text-sm text-gray-500">Yeni kampanyalar hakkında bilgilendirilme</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="mt-6">
            <div className="space-y-4">
              {/* Premium Toggle */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      isPremium ? "bg-indigo-100" : "bg-gray-100"
                    )}>
                      <Crown className={cn(
                        "w-5 h-5",
                        isPremium ? "text-indigo-600" : "text-gray-500"
                      )} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Premium Özellikler</p>
                      <p className="text-sm text-gray-500">
                        {isPremium ? "Tüm premium özellikler aktif" : "Premium özellikleri aç/kapat"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isPremium}
                    onCheckedChange={togglePremium}
                  />
                </div>
                {isPremium && (
                  <div className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                    <p className="text-xs text-indigo-700">
                      ✅ Churn Alert ✅ Gelişmiş analitik ✅ Sınırsız kampanya
                    </p>
                  </div>
                )}
              </div>

              {/* Theme Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Görünüm Ayarları</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-3">
                      {theme === "dark" ? (
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                          <Moon className="w-5 h-5 text-orange-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                          <Sun className="w-5 h-5 text-yellow-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">Karanlık Mod</p>
                        <p className="text-sm text-gray-500">
                          {theme === "dark" ? "Karanlık tema aktif" : "Aydınlık tema aktif"}
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={theme === "dark"}
                      onCheckedChange={toggleTheme}
                    />
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">Renk Paleti</p>
                        <p className="text-sm text-gray-500">Dashboard renk temasını seçin</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {paletteOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setPalette(option.id)}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all",
                            palette === option.id
                              ? "border-indigo-600 bg-indigo-50 shadow-sm"
                              : "border-gray-200 bg-white hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-center gap-1">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: option.primary }}
                            />
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: option.secondary }}
                            />
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: option.accent }}
                            />
                          </div>
                          <span className="text-xs font-medium">{option.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Other Tabs - Placeholder */}
          {["dashboard", "security", "billing", "help"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tab.charAt(0).toUpperCase() + tab.slice(1)} Ayarları</h3>
                <p className="text-gray-500">Bu bölüm yakında eklenecek.</p>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Reset Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ayarları Sıfırla</DialogTitle>
              <DialogDescription>
                Dashboard kartlarını varsayılan ayarlara döndürmek istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                İptal
              </Button>
              <Button onClick={handleReset}>
                Sıfırla
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
