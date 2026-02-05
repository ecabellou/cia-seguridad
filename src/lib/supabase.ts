
import { createClient } from '@supabase/supabase-js';

// Setup Supabase client
// These will be populated with env vars later
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (!import.meta.env.VITE_SUPABASE_URL) {
    console.error('CRITICAL: VITE_SUPABASE_URL is missing. Check your .env file or deployment settings.');
}
