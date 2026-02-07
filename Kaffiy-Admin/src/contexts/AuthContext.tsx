import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";

interface WorkerRole {
    role: string;
    company_id?: string;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    workerRole: WorkerRole | null;
    isLoading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [workerRole, setWorkerRole] = useState<WorkerRole | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    /**
     * Check if user has admin privileges
     */
    const checkAdminRole = async (userEmail: string): Promise<{ role: string; company_id: string } | null> => {
        try {
            const { data: worker, error } = await supabase
                .from('worker_tb')
                .select('role, company_id')
                .eq('email', userEmail)
                .single() as { data: { role: string; company_id: string } | null; error: any };

            if (error || !worker) return null;

            const adminRoles = ['admin', 'brand_admin', 'brand_manager', 'store_manager'];
            return adminRoles.includes(worker.role) ? worker : null;
        } catch {
            return null;
        }
    };

    /**
     * Handle session - no access restriction
     */
    const handleSession = async (session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user?.email) {
            const worker = await checkAdminRole(session.user.email);
            if (worker) {
                setWorkerRole({ role: worker.role, company_id: worker.company_id });
            }
            setIsAdmin(true);
        } else {
            setWorkerRole(null);
            setIsAdmin(false);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        }).catch(() => {
            setIsLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            await handleSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setWorkerRole(null);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{
            session,
            user,
            workerRole,
            isLoading,
            isAdmin,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
