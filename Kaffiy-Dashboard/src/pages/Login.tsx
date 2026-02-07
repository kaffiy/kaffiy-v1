import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            if (data.session) {
                toast({
                    title: "Hoş geldiniz!",
                    description: "Başarıyla giriş yaptınız.",
                });
                navigate("/");
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Giriş Başarısız",
                description: error.message || "Giriş yapılırken bir hata oluştu.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4 dark:bg-gray-900/50">
            <div className="w-full max-w-md">
                <div className="mb-8 flex flex-col items-center gap-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <span className="text-2xl font-bold">K</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Kaffiy Dashboard</h1>
                    <p className="text-sm text-muted-foreground">İşletmenizi yönetmek için giriş yapın</p>
                </div>

                <Card className="border-border/50 shadow-xl">
                    <CardHeader>
                        <CardTitle>Giriş Yap</CardTitle>
                        <CardDescription>
                            Size tanımlanan e-posta ve şifrenizle giriş yapın.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ornek@kaffiy.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Şifre</Label>
                                    <a
                                        href="#"
                                        className="text-xs text-muted-foreground hover:text-primary hover:underline"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toast({
                                                description: "Lütfen sistem yöneticinizle iletişime geçin.",
                                            });
                                        }}
                                    >
                                        Şifremi Unuttum?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Giriş Yapılıyor...
                                    </>
                                ) : (
                                    "Giriş Yap"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                    Henüz bir hesabınız yok mu?{" "}
                    <a href="mailto:support@kaffiy.com" className="font-medium text-primary hover:underline">
                        Bize ulaşın
                    </a>
                </p>
            </div>
        </div>
    );
}
