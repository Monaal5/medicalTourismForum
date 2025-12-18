
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables');
}

// Prevent build crashes if env vars are missing
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SERVICE_KEY;

if (!supabaseServiceKey) {
    console.warn("⚠️ SUPABASE SERVICE KEY IS MISSING. Admin operations will fail RLS checks.");
} else {
    console.log("✅ Supabase Service Key loaded.");
}

export const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : supabase; // Fallback to anon (will fail RLS) or handle error

