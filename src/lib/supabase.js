import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Whether the app has real Supabase credentials configured.
 * When false, the UI runs in a guarded "setup required" state instead of
 * throwing, so the app still boots against placeholder env values.
 */
export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes("your-project") &&
  !supabaseAnonKey.includes("your-anon-key");

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    "[SparePro] Supabase is not configured. Copy .env.example to .env and add " +
      "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. See README.md."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
