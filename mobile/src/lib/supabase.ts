import 'expo-sqlite/localStorage/install';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

/**
 * The public Supabase client. The URL and publishable key are public by design: row-level
 * security is what protects the data (see supabase/migrations). The service-role key
 * never goes anywhere near this app.
 *
 * Sessions persist in expo-sqlite's localStorage, so people stay signed in across launches.
 * PKCE is the flow for OAuth (Google), which returns a code to exchange for a session.
 *
 * Null when the env isn't set, so the app can say "not connected" rather than crash.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: {
          storage: localStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          flowType: 'pkce',
        },
      })
    : null;

// Refresh tokens only while the app is in the foreground (Supabase's recommendation).
if (supabase) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
