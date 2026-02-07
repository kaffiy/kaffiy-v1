import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { useCompany } from '@/contexts/CompanyContext';
import { QrCode, CheckCircle, XCircle, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// ========================================
// TYPES
// ========================================

interface QRScanResult {
    success: boolean;
    points_earned?: number;
    new_total_points?: number;
    new_level?: string;
    company_id?: string;
    message?: string;
    error?: string;
    code?: string;
}

// ========================================
// QR SCANNER COMPONENT
// ========================================

export const QRScanner = () => {
    const { user, refreshLoyalty } = useUser();
    const { loadCompanyBySlug } = useCompany();
    const { toast } = useToast();

    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
    const [qrInput, setQrInput] = useState('');

    /**
     * Process QR code scan using secure RPC function
     */
    const processQRCode = async (qrCode: string) => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Giriş Gerekli',
                description: 'QR kod taramak için giriş yapmalısınız.',
            });
            return;
        }

        try {
            setIsScanning(true);

            // Get user's IP address
            let ipAddress = null;
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipResponse.json();
                ipAddress = ipData.ip;
            } catch {
                // IP fetch failed, continue without it
            }

            // Get geolocation if available
            let location = { lat: null, lng: null };
            if (navigator.geolocation) {
                await new Promise<void>((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            location = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                            };
                            resolve();
                        },
                        () => resolve()
                    );
                });
            }

            // Call the secure RPC function
            const { data, error } = await supabase.rpc('process_qr_scan', {
                p_qr_code: qrCode,
                p_user_id: user.id,
                p_ip_address: ipAddress,
                p_user_agent: navigator.userAgent,
                p_location_lat: location.lat,
                p_location_lng: location.lng,
            });

            if (error) throw error;

            const result = data as QRScanResult;
            setScanResult(result);

            if (result.success) {
                // Success! Refresh loyalty points
                await refreshLoyalty();

                toast({
                    title: '🎉 Başarılı!',
                    description: `${result.points_earned} puan kazandınız! Toplam: ${result.new_total_points}`,
                });

                // Load company info if we have company_id
                if (result.company_id) {
                    // Optionally load company details
                    const { data: company } = await supabase
                        .from('company_tb')
                        .select('slug')
                        .eq('id', result.company_id)
                        .single();

                    if (company?.slug) {
                        loadCompanyBySlug(company.slug);
                    }
                }
            } else {
                // Error handling
                let errorMessage = result.error || 'QR kod taranamadı';

                switch (result.code) {
                    case 'INVALID_QR':
                        errorMessage = 'Geçersiz veya aktif olmayan QR kod';
                        break;
                    case 'EXPIRED_QR':
                        errorMessage = 'Bu QR kodun süresi dolmuş';
                        break;
                    case 'MAX_USES_REACHED':
                        errorMessage = 'Bu QR kod maksimum kullanım sayısına ulaşmış';
                        break;
                }

                toast({
                    variant: 'destructive',
                    title: 'Hata',
                    description: errorMessage,
                });
            }
        } catch (error: any) {
            console.error('QR scan error:', error);
            toast({
                variant: 'destructive',
                title: 'Hata',
                description: error.message || 'QR kod işlenirken bir hata oluştu',
            });
        } finally {
            setIsScanning(false);
        }
    };

    /**
     * Handle manual QR code input
     */
    const handleManualScan = () => {
        if (qrInput.trim()) {
            processQRCode(qrInput.trim());
            setQrInput('');
        }
    };

    /**
     * Check URL for QR code parameter
     */
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const qrCode = urlParams.get('qr');

        if (qrCode && user) {
            // Auto-scan QR code from URL
            processQRCode(qrCode);

            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [user]);

    return (
        <div className="space-y-6">
            {/* Scanner Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <QrCode className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">QR Kod Tara</h2>
                <p className="text-muted-foreground mt-2">
                    Puan kazanmak için QR kodu tarayın
                </p>
            </div>

            {/* Camera Scanner (Placeholder - requires camera library) */}
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                    Kamera tarayıcı yakında eklenecek
                </p>
            </div>

            {/* Manual Input */}
            <div className="space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                        placeholder="QR kodunu manuel girin"
                        disabled={isScanning || !user}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <Button
                    onClick={handleManualScan}
                    disabled={isScanning || !qrInput.trim() || !user}
                    className="w-full rounded-xl"
                >
                    {isScanning ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            İşleniyor...
                        </>
                    ) : (
                        'QR Kodu Tara'
                    )}
                </Button>
            </div>

            {/* Scan Result */}
            {scanResult && (
                <div
                    className={`p-4 rounded-xl border ${scanResult.success
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                        }`}
                >
                    <div className="flex items-start gap-3">
                        {scanResult.success ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                            <p
                                className={`font-medium ${scanResult.success
                                        ? 'text-green-900 dark:text-green-100'
                                        : 'text-red-900 dark:text-red-100'
                                    }`}
                            >
                                {scanResult.success ? 'Başarılı!' : 'Hata'}
                            </p>
                            <p
                                className={`text-sm mt-1 ${scanResult.success
                                        ? 'text-green-700 dark:text-green-300'
                                        : 'text-red-700 dark:text-red-300'
                                    }`}
                            >
                                {scanResult.message || scanResult.error}
                            </p>
                            {scanResult.success && (
                                <div className="mt-2 space-y-1 text-sm">
                                    <p className="text-green-700 dark:text-green-300">
                                        <strong>Kazanılan Puan:</strong> {scanResult.points_earned}
                                    </p>
                                    <p className="text-green-700 dark:text-green-300">
                                        <strong>Toplam Puan:</strong> {scanResult.new_total_points}
                                    </p>
                                    <p className="text-green-700 dark:text-green-300">
                                        <strong>Seviye:</strong> {scanResult.new_level}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Login Prompt */}
            {!user && (
                <div className="text-center p-6 bg-muted/50 rounded-xl">
                    <p className="text-sm text-muted-foreground">
                        QR kod taramak için giriş yapmalısınız
                    </p>
                    <Button className="mt-4" onClick={() => (window.location.href = '/login')}>
                        Giriş Yap
                    </Button>
                </div>
            )}
        </div>
    );
};
