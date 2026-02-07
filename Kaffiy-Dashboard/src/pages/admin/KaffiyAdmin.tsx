import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { Company, TypePayment } from "@/types/database";

export default function KaffiyAdmin() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        email: "", // Initial manager email
        phone: "",
        address: "",
        description: "",
        payment_tier: "free" as TypePayment,
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("company_tb")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setCompanies(data || []);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Şirketler yüklenirken bir sorun oluştu: " + error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // 1. Create Company
            const { data: company, error: companyError } = await supabase
                .from("company_tb")
                .insert({
                    name: formData.name,
                    slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    description: formData.description,
                    payment_tier: formData.payment_tier,
                    is_active: true,
                } as any)
                .select()
                .single();

            if (companyError) throw companyError;

            // 2. Create Initial Manager (Worker)
            if (formData.email && company) {
                const { error: workerError } = await supabase
                    .from("worker_tb")
                    .insert({
                        company_id: company.id,
                        email: formData.email,
                        first_name: "Manager", // Placeholder
                        last_name: "Admin",    // Placeholder
                        role: "brand_admin",
                        permissions: {},
                        is_active: true,
                    } as any);

                if (workerError) {
                    console.error("Worker creation error:", workerError);
                    toast({
                        variant: "destructive",
                        title: "Uyarı",
                        description: "Şirket oluşturuldu ancak yönetici eklenemedi.",
                    });
                }
            }

            toast({
                title: "Başarılı",
                description: "Yeni kafe başarıyla sisteme eklendi.",
            });

            setIsOpen(false);
            setFormData({
                name: "",
                slug: "",
                email: "",
                phone: "",
                address: "",
                description: "",
                payment_tier: "free",
            });
            fetchCompanies(); // Refresh list
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: error.message || "İşlem başarısız oldu.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Kaffiy Yönetim Paneli</h2>
                        <p className="text-muted-foreground">Sisteme kayıtlı tüm kafeleri buradan yönetebilirsiniz.</p>
                    </div>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Yeni Kafe Ekle
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Yeni Kafe Kaydı</DialogTitle>
                                <DialogDescription>
                                    Gerekli bilgileri girerek sistemi kullanacak yeni bir kafe oluşturun.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateCompany} className="space-y-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Kafe Adı</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Örn: Haliç Kahve"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="slug">Slug (URL Kısa Adı)</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="halic-kahve (Otomatik dolar)"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Yönetici E-posta</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="manager@cafe.com"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Telefon</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+90 555 123 4567"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tier">Ödeme Planı</Label>
                                    <Select
                                        value={formData.payment_tier}
                                        onValueChange={(val) => setFormData({ ...formData, payment_tier: val as TypePayment })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Plan seçin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="free">Ücretsiz (Free)</SelectItem>
                                            <SelectItem value="economy">Ekonomi</SelectItem>
                                            <SelectItem value="standard">Standart</SelectItem>
                                            <SelectItem value="premium">Premium</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {submitting ? "Oluşturuluyor..." : "Kaydet"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kafe Adı</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Durum</TableHead>
                                <TableHead className="text-right">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Yükleniyor...
                                    </TableCell>
                                </TableRow>
                            ) : companies.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Henüz kayıtlı kafe bulunmuyor.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                companies.map((company) => (
                                    <TableRow key={company.id}>
                                        <TableCell className="font-medium">{company.name}</TableCell>
                                        <TableCell>{company.slug}</TableCell>
                                        <TableCell>{company.email}</TableCell>
                                        <TableCell className="capitalize">{company.payment_tier}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${company.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {company.is_active ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            {/* Delete functionality can be added later safely */}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DashboardLayout>
    );
}
