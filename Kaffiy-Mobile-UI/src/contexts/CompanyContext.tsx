import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { Company } from '@/types/database';

interface CompanyContextType {
    company: Company | null;
    companyId: string | null;
    isLoading: boolean;
    loadCompanyBySlug: (slug: string) => Promise<void>;
    trackQRScan: (qrCode: string) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [company, setCompany] = useState<Company | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Load company by slug (from URL parameter)
     * Used when user scans QR code with shop_id
     */
    const loadCompanyBySlug = async (slug: string) => {
        try {
            setIsLoading(true);

            const { data: companyData, error } = await supabase
                .from('company_tb')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (error) throw error;

            setCompany(companyData);
            setCompanyId(companyData.id);

            // Store in localStorage for persistence
            localStorage.setItem('current_company_slug', slug);
            localStorage.setItem('current_company_id', companyData.id);

        } catch (error) {
            console.error('Company load error:', error);
            setCompany(null);
            setCompanyId(null);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Track QR code scan
     * Logs the scan event for analytics
     */
    const trackQRScan = async (qrCode: string) => {
        try {
            // Get QR code details
            const { data: qrData, error: qrError } = await supabase
                .from('qr_tb')
                .select('id, company_id, points_earned, status')
                .eq('qr_code', qrCode)
                .single();

            if (qrError) throw qrError;

            // Only track active QR codes
            if (qrData.status !== 'active') {
                throw new Error('QR code is not active');
            }

            // Get user's IP and location (if available)
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const { ip } = await ipResponse.json();

            // Get geolocation if available
            let location = { lat: null, lng: null };
            if (navigator.geolocation) {
                await new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            location = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                            };
                            resolve(true);
                        },
                        () => resolve(false)
                    );
                });
            }

            // Log the scan
            const { error: logError } = await supabase
                .from('qr_scan_log_tb')
                .insert({
                    qr_id: qrData.id,
                    company_id: qrData.company_id,
                    user_id: user?.id || null,
                    ip_address: ip,
                    user_agent: navigator.userAgent,
                    location_lat: location.lat,
                    location_lng: location.lng,
                });

            if (logError) throw logError;

            // If user is logged in, update loyalty points
            if (user) {
                // Get current loyalty points
                const { data: loyaltyData } = await supabase
                    .from('royalty_tb')
                    .select('points')
                    .eq('user_id', user.id)
                    .eq('company_id', qrData.company_id)
                    .single();

                const currentPoints = loyaltyData?.points || 0;
                const newPoints = currentPoints + qrData.points_earned;

                // Update or insert loyalty record
                const { error: loyaltyError } = await supabase
                    .from('royalty_tb')
                    .upsert({
                        user_id: user.id,
                        company_id: qrData.company_id,
                        points: newPoints,
                        level: calculateLoyaltyLevel(newPoints),
                    });

                if (loyaltyError) throw loyaltyError;

                // Mark QR as used
                await supabase
                    .from('qr_tb')
                    .update({
                        status: 'used',
                        used_by: user.id,
                        used_at: new Date().toISOString(),
                    })
                    .eq('id', qrData.id);
            }

            return qrData;
        } catch (error) {
            console.error('QR scan tracking error:', error);
            throw error;
        }
    };

    /**
     * Calculate loyalty level based on points
     */
    const calculateLoyaltyLevel = (points: number): string => {
        if (points >= 1000) return 'legend';
        if (points >= 500) return 'gold';
        if (points >= 250) return 'silver';
        if (points >= 100) return 'bronze';
        return 'explorer';
    };

    /**
     * Check URL for shop_id parameter on mount
     * Auto-load company if present
     */
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const shopId = urlParams.get('shop_id');
        const qrCode = urlParams.get('qr');

        if (shopId) {
            loadCompanyBySlug(shopId);
        } else {
            // Try to load from localStorage
            const savedSlug = localStorage.getItem('current_company_slug');
            if (savedSlug) {
                loadCompanyBySlug(savedSlug);
            }
        }

        // If QR code is in URL, track the scan
        if (qrCode) {
            trackQRScan(qrCode).catch(console.error);
        }
    }, []);

    return (
        <CompanyContext.Provider
            value={{
                company,
                companyId,
                isLoading,
                loadCompanyBySlug,
                trackQRScan,
            }}
        >
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};
