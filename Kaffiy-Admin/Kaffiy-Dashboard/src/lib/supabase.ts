import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Load Supabase configuration based on your environment (Vite uses import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // If we're missing env vars (e.g., in a CI context), throw error or log warning.
    console.warn('Supabase credentials missing! Please check .env file.');
}

// Create the Supabase client
export const supabase = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
        realtime: {
            params: {
                eventsPerSecond: 10,
            },
        },
        global: {
            headers: {
                'X-Client-Info': 'kaffiy-dashboard/1.0.0',
            },
        },
    }
);
