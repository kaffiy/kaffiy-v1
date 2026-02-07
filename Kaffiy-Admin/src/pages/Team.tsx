import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Plus, 
  Download, 
  MoreVertical, 
  User, 
  Shield,
  Coffee,
  UserCog,
  Mail,
  Phone,
  Crown,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type TeamRole = "admin" | "barista" | "cashier" | "manager";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: TeamRole;
  status: "active" | "inactive";
  joinDate: string;
  avatar?: string;
}

const mockTeamMembers: TeamMember[] = [
  { id: "1", name: "Ayşe Yılmaz", email: "ayse@halickahve.com", phone: "532 123 4567", role: "admin", status: "active", joinDate: "15 Oca 2024" },
  { id: "2", name: "Mehmet Demir", email: "mehmet@halickahve.com", phone: "533 234 5678", role: "barista", status: "active", joinDate: "20 Şub 2024" },
  { id: "3", name: "Zeynep Kaya", email: "zeynep@halickahve.com", phone: "534 345 6789", role: "barista", status: "active", joinDate: "5 Mar 2024" },
  { id: "4", name: "Can Özkan", email: "can@halickahve.com", phone: "535 456 7890", role: "cashier", status: "active", joinDate: "10 Mar 2024" },
  { id: "5", name: "Elif Aksoy", email: "elif@halickahve.com", phone: "536 567 8901", role: "manager", status: "active", joinDate: "1 Oca 2024" },
];

const roleConfig: Record<TeamRole, { label: string; icon: typeof User; color: string; bgColor: string }> = {
  admin: { label: "Admin", icon: Crown, color: "text-gold", bgColor: "bg-gold/10" },
  manager: { label: "Yönetici", icon: UserCog, color: "text-primary", bgColor: "bg-primary/10" },
  barista: { label: "Barista", icon: Coffee, color: "text-sage", bgColor: "bg-sage/10" },
  cashier: { label: "Kasiyer", icon: User, color: "text-blue-500", bgColor: "bg-blue-500/10" },
};

const Team = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<TeamRole | "all">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const { toast } = useToast();

  // New team member form state
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    role: "barista" as TeamRole,
    status: "active" as "active" | "inactive",
  });

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.status === "active").length,
    admin: teamMembers.filter(m => m.role === "admin").length,
    barista: teamMembers.filter(m => m.role === "barista").length,
    cashier: teamMembers.filter(m => m.role === "cashier").length,
    manager: teamMembers.filter(m => m.role === "manager").length,
  };

  const handleExport = () => {
    const headers = ["Ad Soyad", "E-posta", "Telefon", "Rol", "Durum", "Katılım Tarihi"];
    const rows = teamMembers.map(member => [
      member.name,
      member.email,
      member.phone,
      roleConfig[member.role].label,
      member.status === "active" ? "Aktif" : "Pasif",
      member.joinDate,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `ekip_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Dışa aktarma tamamlandı!",
      description: `${teamMembers.length} ekip üyesi CSV dosyası olarak indirildi.`,
    });
  };

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email || !newMember.phone) {
      toast({
        title: "Eksik bilgi",
        description: "Lütfen ad, e-posta ve telefon bilgilerini doldurun.",
        variant: "destructive",
      });
      return;
    }

    const member: TeamMember = {
      id: (teamMembers.length + 1).toString(),
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone,
      role: newMember.role,
      status: newMember.status,
      joinDate: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }),
    };

    setTeamMembers([...teamMembers, member]);
    
    setNewMember({
      name: "",
      email: "",
      phone: "",
      role: "barista",
      status: "active",
    });
    
    setIsAddModalOpen(false);
    
    toast({
      title: "Ekip üyesi eklendi!",
      description: `${member.name} ekip listesine eklendi.`,
    });
  };

  const handleDeleteMember = (id: string, name: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
    toast({
      title: "Ekip üyesi silindi",
      description: `${name} ekip listesinden kaldırıldı.`,
    });
  };

  const getInitials = (name: string): string => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      { bg: "bg-blue-100", text: "text-blue-700" },
      { bg: "bg-purple-100", text: "text-purple-700" },
      { bg: "bg-pink-100", text: "text-pink-700" },
      { bg: "bg-green-100", text: "text-green-700" },
      { bg: "bg-yellow-100", text: "text-yellow-700" },
      { bg: "bg-indigo-100", text: "text-indigo-700" },
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Toplam Ekip</p>
              </div>
            </div>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Aktif</p>
              </div>
            </div>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <Crown className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.admin}</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </div>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-sage" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.barista}</p>
                <p className="text-xs text-muted-foreground">Barista</p>
              </div>
            </div>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.cashier}</p>
                <p className="text-xs text-muted-foreground">Kasiyer</p>
              </div>
            </div>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <UserCog className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.manager}</p>
                <p className="text-xs text-muted-foreground">Yönetici</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Ekip üyesi ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-border/50"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "admin", "manager", "barista", "cashier"] as const).map((role) => (
                <Button
                  key={role}
                  variant={selectedRole === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    "rounded-lg text-xs",
                    selectedRole === role && "bg-primary"
                  )}
                >
                  {role === "all" ? "Tümü" : roleConfig[role as TeamRole].label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl gap-2"
              onClick={handleExport}
            >
              <Download className="w-4 h-4" />
              Dışa Aktar
            </Button>
            <Button 
              type="button"
              size="sm" 
              className="rounded-xl gap-2 bg-primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Ekip Üyesi Ekle
            </Button>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const roleInfo = roleConfig[member.role];
            const RoleIcon = roleInfo.icon;
            const avatarColor = getAvatarColor(member.name);
            
            return (
              <div 
                key={member.id} 
                className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-5 hover:border-border transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0",
                      avatarColor.bg,
                      avatarColor.text
                    )}>
                      {getInitials(member.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{member.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] px-2 py-0.5",
                            roleInfo.bgColor,
                            roleInfo.color,
                            "border-0"
                          )}
                        >
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {roleInfo.label}
                        </Badge>
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full",
                          member.status === "active" 
                            ? "bg-success/10 text-success" 
                            : "bg-muted text-muted-foreground"
                        )}>
                          {member.status === "active" ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem>Düzenle</DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteMember(member.id, member.name)}
                      >
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                    <span>Katılım: {member.joinDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Ekip üyesi bulunamadı</p>
          </div>
        )}
      </div>

      {/* Add Team Member Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Ekip Üyesi Ekle</DialogTitle>
            <DialogDescription>
              Yeni ekip üyesi bilgilerini girin. Ad, e-posta ve telefon alanları zorunludur.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad *</Label>
              <Input
                id="name"
                placeholder="Örn: Ahmet Yılmaz"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta *</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@halickahve.com"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                placeholder="532 123 4567"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={newMember.role}
                  onValueChange={(value: TeamRole) => 
                    setNewMember({ ...newMember, role: value })
                  }
                >
                  <SelectTrigger id="role" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Yönetici</SelectItem>
                    <SelectItem value="barista">Barista</SelectItem>
                    <SelectItem value="cashier">Kasiyer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select
                  value={newMember.status}
                  onValueChange={(value: "active" | "inactive") => 
                    setNewMember({ ...newMember, status: value })
                  }
                >
                  <SelectTrigger id="status" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Pasif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl"
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={handleAddMember}
              className="rounded-xl bg-primary"
            >
              Ekip Üyesi Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Team;
