import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ArrowLeft, Pencil, Check, X, Bell, Mail, Moon, LogOut, CalendarIcon, Info, Trash2, Palette, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const avatars = [
  { id: "guru", emoji: "☕", label: "Kahve Gurusu" },
  { id: "tiryaki", emoji: "🫖", label: "Tiryaki" },
  { id: "kafeci", emoji: "🧑‍🍳", label: "Kafeci" },
  { id: "barista", emoji: "👨‍🍳", label: "Barista" },
  { id: "kahvesever", emoji: "🥤", label: "Kahve Sever" },
  { id: "kahveci", emoji: "☕️", label: "Kahveci" },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useUser();
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state — initialized from DB profile
  const [selectedAvatar, setSelectedAvatar] = useState("guru");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [gender, setGender] = useState<string>("");
  const [tempGender, setTempGender] = useState("");
  const [birthdate, setBirthdate] = useState<Date | undefined>(undefined);
  const [favoriteProduct, setFavoriteProduct] = useState("");
  const [tempFavoriteProduct, setTempFavoriteProduct] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Settings
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const { isDark, setTheme, colorScheme, setColorScheme, autoThemeEnabled, enableAutoTheme } = useTheme();
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);

  // Load profile data from DB
  useEffect(() => {
    if (!profile) return;
    setUsername(profile.name || profile.first_name || "");
    setEmail(profile.email || user?.email || "");
    setPhone(profile.phone || "");
    setTempPhone(profile.phone || "");
    setGender(profile.gender || "");
    setTempGender(profile.gender || "");
    if (profile.date_of_birth) {
      setBirthdate(new Date(profile.date_of_birth));
    }
    // avatar_url stores avatar id
    if (profile.avatar_url && avatars.some(a => a.id === profile.avatar_url)) {
      setSelectedAvatar(profile.avatar_url);
    }
    // Load settings from auth metadata
    const meta = user?.user_metadata;
    if (meta) {
      setNotifications(meta.push_notification_accepted ?? true);
      setEmailUpdates(meta.email_updates ?? false);
      setFavoriteProduct(meta.favorite_product || "");
      setTempFavoriteProduct(meta.favorite_product || "");
    }
  }, [profile, user]);

  const handleSaveAll = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      // 1. Update user_tb profile
      const updates: Record<string, any> = {
        first_name: username.trim() || profile?.first_name,
        phone: tempPhone.trim() || null,
        gender: tempGender || null,
        avatar_url: selectedAvatar,
        date_of_birth: birthdate ? birthdate.toISOString().split("T")[0] : null,
      };

      const { error: profileError } = await supabase
        .from("user_tb")
        .update(updates)
        .eq("id", user.id);

      if (profileError) throw profileError;

      // 2. Update auth metadata (notifications, favorite product)
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          push_notification_accepted: notifications,
          email_updates: emailUpdates,
          favorite_product: tempFavoriteProduct.trim(),
        },
      });

      if (metaError) throw metaError;

      // 3. Password change (if provided)
      if (newPassword && newPassword === confirmPassword) {
        if (newPassword.length < 6) {
          toast.error("Şifre en az 6 karakter olmalıdır");
          setIsSaving(false);
          return;
        }
        const { error: pwError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (pwError) throw pwError;
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Şifre güncellendi");
      }

      // Update local state
      setPhone(tempPhone.trim());
      setGender(tempGender);
      setFavoriteProduct(tempFavoriteProduct.trim());
      setIsEditingMode(false);
      toast.success("Profil güncellendi");
    } catch (error: any) {
      console.error("Profile save error:", error);
      toast.error(error.message || "Profil güncellenemedi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset temp values to saved values
    setTempPhone(phone);
    setTempGender(gender);
    setTempFavoriteProduct(favoriteProduct);
    setNewPassword("");
    setConfirmPassword("");
    setIsEditingMode(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  const handleDeleteAccount = async () => {
    // Note: Full account deletion requires a server-side function
    // For now, sign out and navigate to login
    setIsDeleteAccountDialogOpen(false);
    toast.info("Hesap silme talebi alındı. En kısa sürede işleme alınacaktır.");
    await handleLogout();
  };

  // Handle notification toggle with immediate save
  const handleNotificationToggle = async (checked: boolean) => {
    setNotifications(checked);
    await supabase.auth.updateUser({ data: { push_notification_accepted: checked } });
  };

  const handleEmailUpdatesToggle = async (checked: boolean) => {
    setEmailUpdates(checked);
    await supabase.auth.updateUser({ data: { email_updates: checked } });
  };

  return (
    <div className="mobile-container min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-foreground h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-base font-semibold ml-2">Profil</h1>
        </div>
        {!isEditingMode ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingMode(true)}
            className="text-primary h-8"
          >
            <Pencil className="w-4 h-4 mr-1.5" />
            Düzenle
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              className="text-muted-foreground h-8"
            >
              <X className="w-4 h-4 mr-1.5" />
              İptal
            </Button>
            <Button
              variant="cafe"
              size="sm"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="h-8"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
              Kaydet
            </Button>
          </div>
        )}
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* Avatar Selection */}
        <section className="animate-fade-in mb-8">
          <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Avatar</h2>
          <div className="flex gap-3">
            {avatars.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar.id)}
                className={`flex flex-col items-center gap-1.5 transition-all ${
                  selectedAvatar === avatar.id
                    ? "opacity-100"
                    : "opacity-40 hover:opacity-70"
                }`}
              >
                <span className={`text-2xl ${selectedAvatar === avatar.id ? "scale-110" : ""} transition-transform`}>
                  {avatar.emoji}
                </span>
                <span className={`text-[10px] ${selectedAvatar === avatar.id ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {avatar.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* User Info */}
        <section className="space-y-3 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          {/* First Row: Kullanıcı Adı and E-posta */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Kullanıcı Adı</h2>
              {isEditingMode ? (
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-8 text-sm border-0 border-b border-primary rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary w-full"
                />
              ) : (
                <span className="text-sm text-foreground">{username}</span>
              )}
            </div>

            <div>
              <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">E-posta</h2>
              <span className="text-sm text-muted-foreground">{email}</span>
            </div>
          </div>

          {/* Second Row: Telefon and Cinsiyet */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Telefon</h2>
                <span className="text-[10px] text-muted-foreground/60">(opsiyonel)</span>
              </div>
              {isEditingMode ? (
                <Input
                  type="tel"
                  placeholder="+90 5XX XXX XX XX"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value)}
                  className="h-8 text-sm border-0 border-b border-primary rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary w-full"
                />
              ) : (
                <div className="h-8 flex items-center">
                  <span className="text-sm text-muted-foreground">
                    {phone || "Belirtilmemiş"}
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Cinsiyet</h2>
                <span className="text-[10px] text-muted-foreground/60">(opsiyonel)</span>
              </div>
              {isEditingMode ? (
                <Select value={tempGender} onValueChange={setTempGender}>
                  <SelectTrigger className="h-8 text-sm border-0 border-b border-primary rounded-none px-0 focus:ring-0 focus:border-primary w-full bg-transparent shadow-none">
                    <SelectValue placeholder="Seçin" className="text-sm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="erkek">Erkek</SelectItem>
                    <SelectItem value="kadın">Kadın</SelectItem>
                    <SelectItem value="belirtmek_istemiyorum">Belirtmek İstemiyorum</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-8 flex items-center">
                  <span className="text-sm text-muted-foreground">
                    {gender === "erkek" ? "Erkek" : gender === "kadın" ? "Kadın" : gender === "belirtmek_istemiyorum" ? "Belirtmek İstemiyorum" : "Belirtilmemiş"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Third Row: Doğum Tarihi and En Sevdiğim Ürün */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Doğum Tarihi</h2>
                <span className="text-[10px] text-muted-foreground/60">(opsiyonel)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px] text-center">
                      <p className="text-xs">Doğum tarihinize özel kampanyaları kaçırmayın!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-2 text-sm transition-colors w-full h-8 text-left",
                      birthdate ? "text-foreground" : "text-muted-foreground",
                      isEditingMode && "border-b border-primary"
                    )}
                  >
                    <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex-1">
                      {birthdate ? format(birthdate, "d MMMM yyyy", { locale: tr }) : "Tarih seçin"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={birthdate}
                    onSelect={setBirthdate}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">En Sevdiğim Ürün</h2>
                <span className="text-[10px] text-muted-foreground/60">(opsiyonel)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px] text-center">
                      <p className="text-xs">Kampanyalarınızı en sevdiğiniz ürüne göre kişiselleştiriyoruz</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {isEditingMode ? (
                <Input
                  type="text"
                  placeholder="Örn: Cappuccino, Latte, Espresso..."
                  value={tempFavoriteProduct}
                  onChange={(e) => setTempFavoriteProduct(e.target.value)}
                  className="h-8 text-sm border-0 border-b border-primary rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary w-full"
                />
              ) : (
                <div className="h-8 flex items-center">
                  <span className="text-sm text-muted-foreground">
                    {favoriteProduct || "Belirtilmemiş"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="h-px bg-border/50" />

        {/* Password Change */}
        <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Şifre Değiştir</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="password"
              placeholder="Yeni şifre"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={!isEditingMode}
              className={cn(
                "h-9 text-sm bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0 w-full",
                isEditingMode 
                  ? "border-primary focus-visible:border-primary" 
                  : "border-border/70"
              )}
            />
            <Input
              type="password"
              placeholder="Yeni şifre (tekrar)"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={!isEditingMode}
              className={cn(
                "h-9 text-sm bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0 w-full",
                isEditingMode 
                  ? "border-primary focus-visible:border-primary" 
                  : "border-border/70"
              )}
            />
          </div>
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-[11px] text-destructive mt-2 col-span-2">Şifreler eşleşmiyor</p>
          )}
        </section>

        <div className="h-px bg-border/50" />

        {/* Settings */}
        <section className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Ayarlar</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Bildirimler</span>
              </div>
              <Switch checked={notifications} onCheckedChange={handleNotificationToggle} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">E-posta güncellemeleri</span>
              </div>
              <Switch checked={emailUpdates} onCheckedChange={handleEmailUpdatesToggle} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Karanlık mod</span>
              </div>
              <Switch checked={isDark} onCheckedChange={(checked) => {
                setTheme(checked ? "dark" : "light");
              }} />
            </div>
          </div>
        </section>

        <div className="h-px bg-border/50" />

        {/* Color Theme Selection */}
        <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Renk Teması</h2>
            </div>
            {!autoThemeEnabled && (
              <button
                onClick={enableAutoTheme}
                className="text-[10px] text-primary hover:underline"
              >
                Otomatik Aç
              </button>
            )}
          </div>
          {autoThemeEnabled && (
            <div className="mb-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-[10px] text-muted-foreground text-center">
                🎨 Tema her 5 dakikada bir otomatik değişiyor
              </p>
            </div>
          )}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: "default", name: "Kiremit", color: "bg-[hsl(25_55%_28%)]" },
              { id: "ocean", name: "Okyanus", color: "bg-[hsl(200_55%_35%)]" },
              { id: "lavender", name: "Lavanta", color: "bg-[hsl(270_45%_35%)]" },
              { id: "sunset", name: "Gün Batımı", color: "bg-[hsl(15_60%_40%)]" },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => setColorScheme(theme.id as any)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all ${
                  colorScheme === theme.id
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-secondary border-2 border-transparent hover:bg-secondary/80"
                }`}
                title={theme.name}
              >
                <div className={`w-7 h-7 rounded-full ${theme.color} ${colorScheme === theme.id ? "ring-1.5 ring-primary ring-offset-1" : ""}`} />
                <span className={`text-[9px] ${colorScheme === theme.id ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {theme.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="h-px bg-border/50" />

        {/* Logout and Delete Account */}
        <section className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <div className="flex flex-col gap-2">
            <div className="flex justify-end">
              <span className="text-[9px] text-destructive/70 font-medium uppercase tracking-wider">⚠️ Tehlikeli Bölge</span>
            </div>
            <div className="flex items-center justify-between">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-destructive hover:opacity-70 transition-opacity h-6"
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </button>
              <button 
                onClick={() => setIsDeleteAccountDialogOpen(true)}
                className="flex items-center gap-2 text-sm text-destructive hover:opacity-70 transition-opacity h-6"
              >
                <Trash2 className="w-4 h-4" />
                Hesabı Sil
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Hesabı Sil</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground pt-2">
              Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinecektir:
              <ul className="list-disc list-inside mt-3 space-y-1 text-left">
                <li>Profil bilgileriniz</li>
                <li>Topladığınız tüm puanlar</li>
                <li>Kazandığınız ödüller</li>
                <li>Kafe ziyaret geçmişiniz</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Evet, Hesabı Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfilePage;
