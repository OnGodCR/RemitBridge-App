import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { prefs } from '@/lib/prefs';
import { supabase } from '@/lib/supabase';

/**
 * First-party metrics (DECISIONS.md D31). Fire-and-forget: a lost event never blocks or
 * breaks the app. Names are snake_case and must match the `events.name` check in the
 * schema. Props hold choices (a route, a method), never amounts tied to a person.
 */
export function track(name: string, props: Record<string, string | number | boolean> = {}) {
  if (!supabase) return;
  const client = supabase;
  client.auth
    .getSession()
    .then(({ data }) =>
      client.from('events').insert({
        install_id: prefs.installId(),
        user_id: data.session?.user.id ?? null,
        name,
        props,
        platform: Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : null,
        app_version: Constants.expoConfig?.version ?? null,
      }),
    )
    .then(
      () => undefined,
      () => undefined,
    );
}
