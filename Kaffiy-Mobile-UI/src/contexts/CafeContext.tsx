import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "react-router-dom";

interface CafeDetails {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    description: string | null;
}

interface Campaign {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    reward_points: number;
    type: string;
}

interface CafeContextType {
    cafe: CafeDetails | null;
    campaigns: Campaign[];
    isLoading: boolean;
    error: string | null;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export const CafeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [searchParams] = useSearchParams();
    const cafeSlug = searchParams.get("cafe");

    const [cafe, setCafe] = useState<CafeDetails | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCafeData = async () => {
            if (!cafeSlug) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                // Fetch Cafe by Slug
                const { data: cafeData, error: cafeError } = await supabase
                    .from("company_tb")
                    .select("id, name, slug, logo_url, description")
                    .eq("slug", cafeSlug)
                    .eq("is_active", true)
                    .single();

                if (cafeError || !cafeData) {
                    throw new Error("Cafe not found");
                }

                setCafe(cafeData);

                // Fetch Campaigns for this Cafe
                const { data: campaignsData, error: campaignsError } = await supabase
                    .from("campaign_tb")
                    .select("id, title, description, image_url, reward_points, type")
                    .eq("company_id", cafeData.id)
                    .eq("is_active", true)
                    .eq("status", "active");

                if (campaignsError) {
                    console.error("Error fetching campaigns:", campaignsError);
                } else {
                    setCampaigns(campaignsData || []);
                }

            } catch (err: any) {
                setError(err.message || "Something went wrong");
                setCafe(null);
                setCampaigns([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCafeData();
    }, [cafeSlug]);

    return (
        <CafeContext.Provider value={{ cafe, campaigns, isLoading, error }}>
            {children}
        </CafeContext.Provider>
    );
};

export const useCafe = () => {
    const context = useContext(CafeContext);
    if (context === undefined) {
        throw new Error("useCafe must be used within a CafeProvider");
    }
    return context;
};
