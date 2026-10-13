import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

/**
 * The name the app greets someone by (DECISIONS.md D114): the one they typed in Account,
 * else the one Google or Apple gave at sign-in. First name only. Kept in the account's
 * metadata, so it's deleted with the account; signed out, there's no name. The first letter
 * is capitalized.
 */
export function firstName(session: Session | null): string | null {
  const m = (session?.user.user_metadata ?? {}) as Record<string, unknown>;
  const raw = [m.name, m.full_name, m.given_name].find((v) => typeof v === 'string' && v.trim()) as string | undefined;
  const first = raw?.trim().split(/\s+/)[0]?.slice(0, 30);
  // A name typed as "angad" is still greeted as "Angad" (Angad, 2026-10-07). Only the first
  // letter changes, so "McKenzie" or "DeShawn" stay as typed.
  return first ? first.charAt(0).toLocaleUpperCase() + first.slice(1) : null;
}

export function fullName(session: Session | null): string {
  const m = (session?.user.user_metadata ?? {}) as Record<string, unknown>;
  return ((m.name ?? m.full_name ?? '') as string).trim();
}

/** Saves the name on the account. The session updates, and the greeting with it. */
export async function saveName(name: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.auth.updateUser({ data: { name: name.trim().slice(0, 40) } });
  return !error;
}

/** Morning until noon, afternoon until 5 pm, evening after, by the phone's own clock. */
export function partOfDay(now = new Date()): 'morning' | 'afternoon' | 'evening' {
  const h = now.getHours();
  return h >= 4 && h < 12 ? 'morning' : h >= 12 && h < 17 ? 'afternoon' : 'evening';
}
