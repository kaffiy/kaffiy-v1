import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { Company } from '@/types/database';

interface CompanyContextType {
    company: Company | null;
    companyId: string | null;
    isLoading: boolean;
    loadCompanyBySlug: (slug: string) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [company, setCompany] = useState<Company | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Load company by slug (from URL parameter)
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
     * Check URL for cafe parameter on mount
     * Auto-load company if present
     */
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const cafeSlug = urlParams.get('cafe');

        if (cafeSlug) {
            loadCompanyBySlug(cafeSlug);
        } else {
            // Try to load from localStorage
            const savedSlug = localStorage.getItem('current_company_slug');
            if (savedSlug) {
                loadCompanyBySlug(savedSlug);
            }
        }
    }, []);

    return (
        <CompanyContext.Provider
            value={{
                company,
                companyId,
                isLoading,
                loadCompanyBySlug,
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
