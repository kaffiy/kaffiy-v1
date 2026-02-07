import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Load Supabase configuration based on your environment (Vite uses import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ivuhmjtnnhieguiblnbr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dWhtanRubmhpZWd1aWJsbmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MzY4OTcsImV4cCI6MjA4NDMxMjg5N30.SDOsi9-uSVtGt7faeu7fSZsZTXzk4mHSA9R0ky9mSfg';

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
