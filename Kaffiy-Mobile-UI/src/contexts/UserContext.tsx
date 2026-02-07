import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// ========================================
// TYPES
// ========================================

interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    avatar_url: string | null;
    created_at: string;
}

interface LoyaltyPoints {
    company_id: string;
    company_name: string;
    company_slug: string;
    points: number;
    level: string;
    last_visit: string;
}

interface UserContextType {
    user: User | null;
    profile: UserProfile | null;
    loyaltyPoints: LoyaltyPoints[];
    totalPoints: number;
    session: Session | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string, metadata?: { kvkk_accepted?: boolean; push_notification_accepted?: boolean }) => Promise<void>;
    signInAnonymously: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshLoyalty: () => Promise<void>;
}

// ========================================
// CONTEXT
// ========================================

const UserContext = createContext<UserContextType | undefined>(undefined);

// ========================================
// PROVIDER
// ========================================

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPoints[]>([]);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Calculate total points across all cafes
     */
    const totalPoints = loyaltyPoints.reduce((sum, loyalty) => sum + loyalty.points, 0);

    /**
     * Fetch user profile from user_tb
     */
    const fetchUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_tb')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Profile fetch error:', error);
            setProfile(null);
        }
    };

    /**
     * Fetch loyalty points from all cafes
     */
    const fetchLoyaltyPoints = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('royalty_tb')
                .select(`
          company_id,
          points,
          level,
          last_activity,
          company_tb (
            name,
            slug
          )
        `)
                .eq('user_id', userId)
                .order('points', { ascending: false });

            if (error) throw error;

            // Transform data to include company info
            const loyaltyData: LoyaltyPoints[] = (data || []).map((item: any) => ({
                company_id: item.company_id,
                company_name: item.company_tb?.name || 'Unknown Cafe',
                company_slug: item.company_tb?.slug || '',
                points: item.points || 0,
                level: item.level || 'explorer',
                last_visit: item.last_activity || item.created_at,
            }));

            setLoyaltyPoints(loyaltyData);
        } catch (error) {
            console.error('Loyalty fetch error:', error);
            setLoyaltyPoints([]);
        }
    };

    /**
     * Refresh loyalty points (call after QR scan)
     */
    const refreshLoyalty = async () => {
        if (user) {
            await fetchLoyaltyPoints(user.id);
        }
    };

    /**
     * Sign in with email and password
     */
    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // User and session will be set by onAuthStateChange
        } catch (error: any) {
            console.error('Sign in error:', error);
            throw new Error(error.message || 'Failed to sign in');
        }
    };

    /**
     * Sign up with email, password, and name
     */
    const signUp = async (
        email: string,
        password: string,
        name: string,
        metadata?: { kvkk_accepted?: boolean; push_notification_accepted?: boolean }
    ) => {
        try {
            // 1. Create auth user with metadata
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        kvkk_accepted: metadata?.kvkk_accepted ?? false,
                        push_notification_accepted: metadata?.push_notification_accepted ?? false,
                    },
                },
            });

            if (authError) throw authError;

            if (!authData.user) {
                throw new Error('User creation failed');
            }

            // 2. Create user profile in user_tb
            const { error: profileError } = await supabase
                .from('user_tb')
                .insert({
                    id: authData.user.id,
                    email,
                    first_name: name,
                    last_name: '',
                    status: 'active',
                });

            if (profileError) throw profileError;

            // User will be set by onAuthStateChange
        } catch (error: any) {
            console.error('Sign up error:', error);
            throw new Error(error.message || 'Failed to sign up');
        }
    };

    /**
     * Create anonymous user (guest login)
     */
    const signInAnonymously = async () => {
        try {
            const randomCode = Math.floor(100000 + Math.random() * 900000);
            const email = `guest_${randomCode}@kaffiy.com`;
            const password = `guest_${randomCode}_pass`;
            const name = `kahvesever_${randomCode}`;

            await signUp(email, password, name);
            // Auto login happens after signup usually, but let's ensure session
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

        } catch (error: any) {
            console.error('Anonymous sign in error:', error);
            throw new Error(error.message || 'Failed to sign in anonymously');
        }
    };

    /**
     * Sign out
     */
    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            // Clear state
            setUser(null);
            setProfile(null);
            setLoyaltyPoints([]);
            setSession(null);
        } catch (error: any) {
            console.error('Sign out error:', error);
            throw new Error(error.message || 'Failed to sign out');
        }
    };

    /**
     * Initialize auth state and listen for changes
     */
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchUserProfile(session.user.id);
                fetchLoyaltyPoints(session.user.id);
            }

            setIsLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchUserProfile(session.user.id);
                await fetchLoyaltyPoints(session.user.id);
            } else {
                setProfile(null);
                setLoyaltyPoints([]);
            }

            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    /**
     * Set up real-time subscription for loyalty updates
     */
    useEffect(() => {
        if (!user) return;

        // Subscribe to loyalty point changes
        const channel = supabase
            .channel('loyalty_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'royalty_tb',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log('Loyalty updated:', payload);
                    refreshLoyalty();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, refreshLoyalty]);

    return (
        <UserContext.Provider
            value={{
                user,
                profile,
                loyaltyPoints,
                totalPoints,
                session,
                isLoading,
                signIn,
                signUp,
                signInAnonymously,
                signOut,
                refreshLoyalty,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

// ========================================
// HOOK
// ========================================

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
