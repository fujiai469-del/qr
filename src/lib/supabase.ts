import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseUrl(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

function getSupabaseAnonKey(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

// Client-side Supabase client (lazy initialization)
export function getSupabaseClient(): SupabaseClient {
    if (!supabaseInstance) {
        const url = getSupabaseUrl();
        const key = getSupabaseAnonKey();
        if (url && key) {
            supabaseInstance = createClient(url, key);
        } else {
            throw new Error('Supabase is not configured');
        }
    }
    return supabaseInstance;
}

// Server-side Supabase client with service role key
export function createServerSupabaseClient(): SupabaseClient {
    const supabaseUrl = getSupabaseUrl();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase server configuration is missing');
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

// Helper function to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
    return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

// Export for backward compatibility (but prefer getSupabaseClient())
export const supabase = {
    get client() {
        return getSupabaseClient();
    }
};
