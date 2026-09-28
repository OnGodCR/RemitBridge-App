import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * The public Supabase client. The URL and publishable key are public by design: row-level
 * security is what protects the data (see supabase/migrations). The service-role key
 * never goes anywhere near this app.
 *
 * Null when the env isn't set, so the app can say "not connected" rather than crash.
 * Sessions aren't persisted yet: accounts arrive in a later slice (DECISIONS.md D19).
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
