import { useState, useEffect } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2, User, Coins, QrCode } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function PointTerminal() {
    const { workerRole } = useAuth();
    const [scannedUserId, setScannedUserId] = useState<string | null>(null);
    const [customer, setCustomer] = useState<any | null>(null);
    const [points, setPoints] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const { toast } = useToast();

    // 1. QR Scanner Setup
    useEffect(() => {
        if (!scanning) return;

        // Scanner configuration
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        };

        const scanner = new Html5QrcodeScanner("reader", config, false);

        scanner.render(
            (decodedText) => {
                // Determine format (e.g., "u:USER_ID" or direct "USER_ID")
                let userId = decodedText;
                if (decodedText.startsWith("u:")) {
                    userId = decodedText.substring(2);
                }

                console.log("QR Scanned:", userId);
                setScannedUserId(userId);
                setScanning(false);
                scanner.clear();

                // Fetch customer immediately
                fetchCustomer(userId);
            },
            (error) => {
                // Ignore frequent scan errors
                // console.warn(error);
            }
        );

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, [scanning]);

    // 2. Fetch Customer Data
    const fetchCustomer = async (userId: string) => {
        try {
            setLoading(true);

            // Get user profile
            const { data: userProfile, error: profileError } = await supabase
                .from("user_tb")
                .select("*")
                .eq("id", userId)
                .single();

            if (profileError) throw profileError;

            // Get current loyalty points for this company (if worker belongs to one)
            let currentPoints = 0;
            if (workerRole?.company_id) {
                const { data: royalty } = await supabase
                    .from("royalty_tb")
                    .select("points")
                    .eq("user_id", userId)
                    .eq("company_id", workerRole.company_id)
                    .single();

                if (royalty) currentPoints = royalty.points;
            }

            setCustomer({ ...userProfile, currentPoints });
            toast({
                title: "Müşteri Bulundu",
                description: `${userProfile.name || "Misafir"} başarıyla sisteme yüklendi.`,
            });

        } catch (error: any) {
            console.error("Customer fetch error:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Müşteri bulunamadı veya QR hatalı.",
            });
            setScannedUserId(null);
            setCustomer(null);
        } finally {
            setLoading(false);
        }
    };

    // 3. Add Points Transaction
    const handleAddPoints = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!workerRole?.company_id) {
            toast({ variant: "destructive", title: "Hata", description: "Bir şirkete bağlı değilsiniz." });
            return;
        }

        try {
            setLoading(true);
            const amount = parseInt(points);

            if (isNaN(amount) || amount <= 0) {
                throw new Error("Geçersiz puan miktarı.");
            }

            // Call RPC function or update directly
            // Using RPC is safer: update_loyalty_points
            // But for now let's do direct DB update as simplest approach first

            // Check if royalty record exists
            const { data: existingRoyalty } = await supabase
                .from("royalty_tb")
                .select("*")
                .eq("user_id", customer.id)
                .eq("company_id", workerRole.company_id)
                .single();

            let newTotal = amount;
            let error;

            if (existingRoyalty) {
                newTotal = existingRoyalty.points + amount;
                const { error: updateError } = await supabase
                    .from("royalty_tb")
                    .update({
                        points: newTotal,
                        last_visit: new Date().toISOString()
                    })
                    .eq("id", existingRoyalty.id);
                error = updateError;
            } else {
                // Create new record
                const { error: insertError } = await supabase
                    .from("royalty_tb")
                    .insert({
                        user_id: customer.id,
                        company_id: workerRole.company_id,
                        points: amount,
                        level: 'explorer', // Default level
                        total_spent: 0,
                        visits_count: 1,
                        last_activity: new Date().toISOString()
                    });
                error = insertError;
            }

            if (error) throw error;

            toast({
                title: "İşlem Başarılı!",
                description: `${amount} puan müşteriye eklendi. Yeni toplam: ${newTotal}`,
            });

            // Reset
            setPoints("");
            setCustomer({ ...customer, currentPoints: newTotal });

            // Optional: Close customer view after success
            // setScannedUserId(null); 

        } catch (error: any) {
            console.error("Transaction error:", error);
            toast({
                variant: "destructive",
                title: "İşlem Başarısız",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Puan Terminali</h2>
                    <p className="text-muted-foreground">Müşteri QR kodunu okutarak puan ekleyin.</p>
                </div>

                {/* Initial State / Scanner */}
                {!scannedUserId ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Müşteri Tanımla</CardTitle>
                            <CardDescription>
                                Kamerayı kullanarak müşteri QR kodunu okutun veya ID girin.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {scanning ? (
                                <div id="reader" className="w-full max-w-md mx-auto aspect-square bg-black/5 rounded-lg overflow-hidden" />
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/50">
                                    <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
                                    <Button onClick={() => setScanning(true)} size="lg">
                                        <QrCode className="mr-2 h-5 w-5" />
                                        QR Kod Tara
                                    </Button>
                                </div>
                            )}

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Veya manuel giriş
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Müşteri ID veya Referans Kodu"
                                    onChange={(e) => {
                                        // Simple manual entry logic
                                        if (e.target.value.length > 5) {
                                            // setScannedUserId(e.target.value);
                                        }
                                    }}
                                />
                                <Button variant="secondary" onClick={() => {
                                    const input = document.querySelector('input');
                                    if (input?.value) fetchCustomer(input.value);
                                }}>Ara</Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    /* Customer Found & Point Entry */
                    <Card className="animate-in fade-in zoom-in-95 duration-300">
                        <CardHeader className="bg-muted/30 pb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">{customer?.name || "Bilinmeyen Müşteri"}</CardTitle>
                                    <CardDescription>{customer?.email}</CardDescription>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-sm font-medium text-muted-foreground">Mevcut Puan</p>
                                    <p className="text-3xl font-bold text-primary">{customer?.currentPoints || 0}</p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-8">
                            <form onSubmit={handleAddPoints} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="points" className="text-base">Eklenecek Puan Miktarı</Label>
                                    <div className="relative">
                                        <Coins className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="points"
                                            type="number"
                                            placeholder="0"
                                            className="pl-10 text-lg h-12"
                                            value={points}
                                            onChange={(e) => setPoints(e.target.value)}
                                            autoFocus
                                            required
                                            min="1"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Örnek: 1 Kahve = 10 Puan (veya işletme kuralına göre)
                                    </p>
                                </div>

                                <Button type="submit" size="lg" className="w-full h-12 text-lg" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Coins className="mr-2 h-5 w-5" />}
                                    Puan Gönder
                                </Button>
                            </form>
                        </CardContent>

                        <CardFooter className="bg-muted/30 flex justify-between">
                            <Button variant="ghost" onClick={() => {
                                setScannedUserId(null);
                                setCustomer(null);
                                setPoints("");
                                setScanning(false);
                            }}>
                                İptal / Yeni Müşteri
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
