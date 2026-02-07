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
    const checkAdminRole = async (userEmail: string): Promise<boolean> => {
        console.log('🔍 Starting admin check for:', userEmail);
        
        try {
            const { data: worker, error } = await supabase
                .from('worker_tb')
                .select('role, company_id')
                .eq('email', userEmail)
                .single() as { data: { role: string; company_id: string } | null; error: any };

            console.log('🔍 Admin check result:', { email: userEmail, worker, error });

            if (error) {
                console.error('❌ Worker role check error:', error);
                return false;
            }

            if (!worker) {
                console.error('❌ No worker record found for:', userEmail);
                return false;
            }

            const adminRoles = ['admin', 'brand_admin', 'brand_manager', 'store_manager'];
            const isAdmin = adminRoles.includes(worker.role);
            console.log('✅ Admin status:', { email: userEmail, role: worker.role, isAdmin });
            
            return isAdmin;
        } catch (error) {
            console.error('❌ Unexpected error in admin check:', error);
            return false;
        }
    };

    /**
     * Handle session and verify admin access
     */
    const handleSession = async (session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user?.email) {
            const hasAccess = await checkAdminRole(session.user.email);

            if (hasAccess) {
                // Fetch worker role details
                const { data: worker } = await supabase
                    .from('worker_tb')
                    .select('role, company_id')
                    .eq('email', session.user.email)
                    .single() as { data: { role: string; company_id: string } | null; error: any };
                if (worker) {
                    setWorkerRole({ role: worker.role, company_id: worker.company_id });
                    setIsAdmin(true);
                }
            } else {
                // User is not an admin - sign them out
                console.warn('⛔ Access denied: User is not an admin');

                // Show error message
                if (typeof window !== 'undefined') {
                    alert('Erişim Reddedildi: Bu panele sadece Kaffiy yöneticileri erişebilir.');
                }

                // Sign out the user
                await supabase.auth.signOut();
                setSession(null);
                setUser(null);
                setWorkerRole(null);
                setIsAdmin(false);
            }
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
        }).catch((error) => {
            console.error("Auth session error:", error);
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
