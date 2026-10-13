import { Linking } from 'react-native';

import { supabase } from '@/lib/supabase';

/**
 * The WhatsApp bot from the app (DECISIONS.md D138): its number, chatting with it, and
 * linking a WhatsApp chat to this account. Linking never asks for a phone number: the app
 * gets a one-time code and opens WhatsApp with "LINK <code>" typed in; sending it is the
 * proof, and the bot ties its scrambled ID for that chat to the account.
 *
 * The number and whether the bot is open to everyone come from the public app_settings
 * table, so "Chat on WhatsApp" can switch on without a new app build.
 */
export interface WhatsAppSettings {
  /** Digits only, with the country code, e.g. "15551845383". */
  number: string;
  /** True once the bot can reply to anyone (Meta's restriction lifted). */
  live: boolean;
}

let cached: Promise<WhatsAppSettings | null> | null = null;

export function whatsAppSettings(): Promise<WhatsAppSettings | null> {
  cached ??= (async () => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('app_settings').select('key, value').in('key', ['whatsapp_number', 'whatsapp_live']);
    if (error || !data) return null;
    const get = (k: string) => data.find((r) => r.key === k)?.value;
    const number = (get('whatsapp_number') ?? '').replace(/\D/g, '');
    return number ? { number, live: get('whatsapp_live') === 'true' } : null;
  })();
  // A failure is retried next time rather than remembered.
  cached.then((s) => {
    if (!s) cached = null;
  });
  return cached;
}

/** "15551845383" as "+1 555-184-5383"; other countries as "+" and the digits. */
export function formatNumber(digits: string): string {
  const us = digits.match(/^1(\d{3})(\d{3})(\d{4})$/);
  return us ? `+1 ${us[1]}-${us[2]}-${us[3]}` : `+${digits}`;
}

/**
 * Opens WhatsApp on a chat with `text` typed in. WhatsApp's own link goes straight to the app;
 * the wa.me web link is the fallback when the app isn't installed. On Angad's Samsung the
 * wa.me link alone did nothing at all (2026-10-12), so each failure is logged and the caller
 * is told, to show the number instead of leaving the tap with no answer.
 */
export async function openChat(number: string, text: string): Promise<boolean> {
  const q = encodeURIComponent(text);
  for (const url of [`whatsapp://send?phone=${number}&text=${q}`, `https://wa.me/${number}?text=${q}`]) {
    try {
      await Linking.openURL(url);
      return true;
    } catch (e) {
      console.warn(`openChat: ${url.split('?')[0]} failed:`, String(e));
    }
  }
  return false;
}

export type LinkStatus = { linked: boolean; linkedAt: string | null };

/**
 * Runs a signed-in call once more after refreshing the sign-in, if the server answered as if
 * nobody were signed in (42501). On Angad's Samsung (2026-10-12) the app still showed him
 * signed in while its token had gone stale, so every link call was refused and nothing
 * happened. If the refresh fails, Supabase signs the app out, and the screens fall back to
 * their "sign in to link" state instead of a dead one.
 */
async function signedInCall<T>(call: () => PromiseLike<{ data: T; error: { code?: string; message: string } | null }>) {
  let result = await call();
  if (result.error?.code === '42501' && supabase) {
    const { error } = await supabase.auth.refreshSession();
    if (!error) result = await call();
  }
  return result;
}

export async function linkStatus(): Promise<LinkStatus | null> {
  if (!supabase) return null;
  const { data, error } = await signedInCall(() => supabase!.rpc('whatsapp_link_status'));
  if (error) console.warn('linkStatus failed:', error.code, error.message);
  if (error || !data) return null;
  const d = data as { linked: boolean; linked_at: string | null };
  return { linked: !!d.linked, linkedAt: d.linked_at };
}

/** A one-time code, valid 10 minutes, for "LINK <code>". Null if it couldn't be made. */
export async function newLinkCode(): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await signedInCall(() => supabase!.rpc('whatsapp_link_code'));
  // Logged, so a failed link says why in the development build's log (it failed silently on
  // Angad's Samsung, 2026-10-12).
  if (error) console.warn('newLinkCode failed:', error.code, error.message);
  return error || typeof data !== 'string' ? null : data;
}

export async function unlinkWhatsApp(): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await signedInCall(() => supabase!.rpc('unlink_whatsapp'));
  return !error;
}
