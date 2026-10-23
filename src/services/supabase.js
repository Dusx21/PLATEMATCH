import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Returns true only when both env variables are set with real (non-placeholder) values.
 * When false, the app runs in full offline Demo Mode using localStorage.
 */
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim() !== '' &&
    supabaseAnonKey.trim() !== '' &&
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.startsWith('https://')
  );
};

/**
 * Centralised Supabase client.
 * Will be null when running in Demo Mode (no env vars provided).
 *
 * ⚠️ Security notes:
 *  - Only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are used here.
 *  - The anon key is public by design; data is protected via Supabase RLS policies.
 *  - Never use the service_role key in the frontend.
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,    // No auth in this app — no session to persist
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      realtime: {
        params: { eventsPerSecond: 10 },
      },
    })
  : null;
