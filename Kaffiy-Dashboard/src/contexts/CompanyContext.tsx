import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";
import { Company } from "@/types/database";

interface CompanyContextType {
    company: Company | null;
    companyId: string | null;
    isLoading: boolean;
    refreshCompany: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, session } = useAuth();
    const [company, setCompany] = useState<Company | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCompany = async () => {
        if (!user?.email) {
            setCompany(null);
            setCompanyId(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);

            // 1. Get worker record to find company_id
            const { data: worker, error: workerError } = await supabase
                .from("worker_tb")
                .select("company_id")
                .eq("email", user.email)
                .single();

            if (workerError) throw workerError;

            const workerData = worker as any;

            if (!workerData || !workerData.company_id) {
                throw new Error("Bu kullanıcıya ait bir işletme bulunamadı.");
            }

            setCompanyId(workerData.company_id);

            // 2. Get company details
            const { data: companyData, error: companyError } = await supabase
                .from("company_tb")
                .select("*")
                .eq("id", workerData.company_id)
                .single();

            if (companyError) throw companyError;

            setCompany(companyData);
        } catch (error) {
            console.error("Company fetch error:", error);
            setCompany(null);
            setCompanyId(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchCompany();
        } else {
            setCompany(null);
            setCompanyId(null);
            setIsLoading(false);
        }
    }, [session, user]);

    const refreshCompany = async () => {
        await fetchCompany();
    };

    return (
        <CompanyContext.Provider value={{ company, companyId, isLoading, refreshCompany }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error("useCompany must be used within a CompanyProvider");
    }
    return context;
};
