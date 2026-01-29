import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  MoreVertical, 
  User, 
  Star, 
  Coffee, 
  Gift,
  TrendingUp,
  Calendar,
  Mail,
  Phone
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

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  stamps: number;
  totalVisits: number;
  lastVisit: string;
  visitFrequency: string;
  status: "active" | "at-risk" | "lost";
  joinDate: string;
  favoriteItem: string;
}

const mockCustomers: Customer[] = [
  { id: "1", name: "Ahmet Yılmaz", email: "ahmet@email.com", phone: "532 123 4567", stamps: 7, totalVisits: 23, lastVisit: "Bugün", visitFrequency: "Haftada 3x", status: "active", joinDate: "15 Oca 2024", favoriteItem: "Latte" },
  { id: "2", name: "Elif Kaya", email: "elif@email.com", phone: "533 234 5678", stamps: 3, totalVisits: 45, lastVisit: "Dün", visitFrequency: "Haftada 4x", status: "active", joinDate: "3 Ara 2023", favoriteItem: "Cappuccino" },
  { id: "3", name: "Mehmet Demir", email: "mehmet@email.com", phone: "534 345 6789", stamps: 9, totalVisits: 67, lastVisit: "2 gün önce", visitFrequency: "Haftada 5x", status: "active", joinDate: "20 Eki 2023", favoriteItem: "Americano" },
  { id: "4", name: "Zeynep Aksoy", email: "zeynep@email.com", phone: "535 456 7890", stamps: 1, totalVisits: 12, lastVisit: "15 gün önce", visitFrequency: "Ayda 2x", status: "at-risk", joinDate: "1 Şub 2024", favoriteItem: "Mocha" },
  { id: "5", name: "Can Özkan", email: "can@email.com", phone: "536 567 8901", stamps: 5, totalVisits: 34, lastVisit: "3 gün önce", visitFrequency: "Haftada 2x", status: "active", joinDate: "8 Kas 2023", favoriteItem: "Flat White" },
  { id: "6", name: "Ayşe Çelik", email: "ayse@email.com", phone: "537 678 9012", stamps: 0, totalVisits: 8, lastVisit: "25 gün önce", visitFrequency: "Ayda 1x", status: "lost", joinDate: "10 Mar 2024", favoriteItem: "Türk Kahvesi" },
];

// Masking functions for privacy
const maskLastName = (fullName: string): string => {
  const parts = fullName.split(" ");
  if (parts.length <= 1) return fullName;
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");
  if (lastName.length <= 1) return fullName;
  const maskedLastName = lastName[0] + "***";
  return `${firstName} ${maskedLastName}`;
};

const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split("@");
  if (!domain) return email;
  
  const [domainName, ...tldParts] = domain.split(".");
  const tld = tldParts.join(".");
  
  const maskedLocal = localPart.length > 1 
    ? `${localPart[0]}***` 
    : localPart;
  
  const maskedDomain = domainName.length > 1 
    ? `${domainName[0]}***` 
    : domainName;
  
  return `${maskedLocal}@${maskedDomain}${tld ? `.${tld}` : ""}`;
};

const maskPhone = (phone: string): string => {
  // Remove spaces and get digits
  const digits = phone.replace(/\s/g, "");
  if (digits.length <= 3) return phone;
  
  // Format: XXX XXX XXXX -> XXX *** XXXX (keep area code and last 4 digits)
  if (digits.length >= 7) {
    const areaCode = digits.slice(0, 3);
    const last4 = digits.slice(-4);
    return `${areaCode} *** ${last4}`;
  }
  
  // If shorter, keep first 3 and mask rest
  const visible = digits.slice(0, 3);
  return `${visible} ***`;
};

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "at-risk" | "lost">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const { toast } = useToast();

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    favoriteItem: "",
    status: "active" as "active" | "at-risk" | "lost",
    visitFrequency: "Haftada 2x",
  });

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" || customer.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === "active").length,
    atRisk: customers.filter(c => c.status === "at-risk").length,
    lost: customers.filter(c => c.status === "lost").length,
  };

  const handleExport = () => {
    // Create CSV content with masked customer data (same as displayed on dashboard)
    const headers = ["Ad Soyad", "E-posta", "Telefon", "Puan", "Toplam Ziyaret", "Son Ziyaret", "Ziyaret Sıklığı", "Durum", "Katılım Tarihi", "Favori Ürün"];
    const rows = customers.map(customer => [
      maskLastName(customer.name),
      maskEmail(customer.email),
      maskPhone(customer.phone),
      customer.stamps.toString(),
      customer.totalVisits.toString(),
      customer.lastVisit,
      customer.visitFrequency,
      customer.status === "active" ? "Aktif" : customer.status === "at-risk" ? "Riskli" : "Kayıp",
      customer.joinDate,
      customer.favoriteItem,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Add BOM for UTF-8 (Turkish characters support)
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `musteriler_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Dışa aktarma tamamlandı!",
      description: `${customers.length} müşteri CSV dosyası olarak indirildi.`,
    });
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      toast({
        title: "Eksik bilgi",
        description: "Lütfen ad, e-posta ve telefon bilgilerini doldurun.",
        variant: "destructive",
      });
      return;
    }

    // Create new customer object
    const customer: Customer = {
      id: (customers.length + 1).toString(),
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      stamps: 0,
      totalVisits: 0,
      lastVisit: "Henüz yok",
      visitFrequency: newCustomer.visitFrequency,
      status: newCustomer.status,
      joinDate: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }),
      favoriteItem: newCustomer.favoriteItem || "Belirtilmemiş",
    };

    setCustomers([...customers, customer]);
    
    // Reset form
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      favoriteItem: "",
      status: "active",
      visitFrequency: "Haftada 2x",
    });
    
    setIsAddModalOpen(false);
    
    toast({
      title: "Müşteri eklendi!",
      description: `${customer.name} müşteri listesine eklendi.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center">
                <User className="w-5 h-5 text-sage" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Toplam Müşteri</p>
              </div>
            </div>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
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
                <Coffee className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.atRisk}</p>
                <p className="text-xs text-muted-foreground">Risk Altında</p>
              </div>
            </div>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <User className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.lost}</p>
                <p className="text-xs text-muted-foreground">Kayıp</p>
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
                placeholder="Müşteri ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-border/50"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "active", "at-risk", "lost"] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  className={cn(
                    "rounded-lg text-xs",
                    selectedFilter === filter && "bg-primary"
                  )}
                >
                  {filter === "all" ? "Tümü" : filter === "active" ? "Aktif" : filter === "at-risk" ? "Riskli" : "Kayıp"}
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
              Müşteri Ekle
            </Button>
          </div>
        </div>

        {/* Customer List */}
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground">Müşteri</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground hidden md:table-cell">İletişim</th>
                  <th className="text-center p-4 text-xs font-semibold text-muted-foreground">Puan</th>
                  <th className="text-center p-4 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Ziyaret</th>
                  <th className="text-center p-4 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Sıklık</th>
                  <th className="text-center p-4 text-xs font-semibold text-muted-foreground">Durum</th>
                  <th className="text-right p-4 text-xs font-semibold text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {customer.name.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{maskLastName(customer.name)}</p>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Star className="w-3 h-3 text-gold fill-gold" />
                            <span>{customer.favoriteItem}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{maskEmail(customer.email)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{maskPhone(customer.phone)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <div className="flex items-center gap-1 bg-sage/10 px-2.5 py-1 rounded-full">
                          <Coffee className="w-3 h-3 text-sage" />
                          <span className="text-xs font-semibold text-sage">{customer.stamps}/10</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center hidden lg:table-cell">
                      <span className="text-sm font-medium text-foreground">{customer.totalVisits}</span>
                    </td>
                    <td className="p-4 text-center hidden lg:table-cell">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{customer.visitFrequency}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <span className={cn(
                          "text-[10px] font-semibold px-2.5 py-1 rounded-full",
                          customer.status === "active" && "bg-success/10 text-success",
                          customer.status === "at-risk" && "bg-gold/10 text-gold",
                          customer.status === "lost" && "bg-destructive/10 text-destructive"
                        )}>
                          {customer.status === "active" ? "Aktif" : customer.status === "at-risk" ? "Riskli" : "Kayıp"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem>Profili Görüntüle</DropdownMenuItem>
                          <DropdownMenuItem>Puan Ekle</DropdownMenuItem>
                          <DropdownMenuItem>Mesaj Gönder</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Sil</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
            <DialogDescription>
              Yeni müşteri bilgilerini girin. Ad, e-posta ve telefon alanları zorunludur.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad *</Label>
              <Input
                id="name"
                placeholder="Örn: Ahmet Yılmaz"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta *</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                placeholder="532 123 4567"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="favoriteItem">Favori Ürün</Label>
              <Input
                id="favoriteItem"
                placeholder="Örn: Latte, Cappuccino"
                value={newCustomer.favoriteItem}
                onChange={(e) => setNewCustomer({ ...newCustomer, favoriteItem: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select
                  value={newCustomer.status}
                  onValueChange={(value: "active" | "at-risk" | "lost") => 
                    setNewCustomer({ ...newCustomer, status: value })
                  }
                >
                  <SelectTrigger id="status" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="at-risk">Riskli</SelectItem>
                    <SelectItem value="lost">Kayıp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Ziyaret Sıklığı</Label>
                <Select
                  value={newCustomer.visitFrequency}
                  onValueChange={(value) => 
                    setNewCustomer({ ...newCustomer, visitFrequency: value })
                  }
                >
                  <SelectTrigger id="frequency" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ayda 1x">Ayda 1x</SelectItem>
                    <SelectItem value="Ayda 2x">Ayda 2x</SelectItem>
                    <SelectItem value="Haftada 1x">Haftada 1x</SelectItem>
                    <SelectItem value="Haftada 2x">Haftada 2x</SelectItem>
                    <SelectItem value="Haftada 3x">Haftada 3x</SelectItem>
                    <SelectItem value="Haftada 4x">Haftada 4x</SelectItem>
                    <SelectItem value="Haftada 5x">Haftada 5x</SelectItem>
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
              onClick={handleAddCustomer}
              className="rounded-xl bg-primary"
            >
              Müşteri Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Customers;
