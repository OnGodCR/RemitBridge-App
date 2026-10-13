import { supabase } from '@/lib/supabase';

/**
 * The newsletter (DECISIONS.md D169): an email now and then, only to people who turn it on in
 * Account. It goes to the address the account signed in with; nothing new is asked for. Off
 * is the default, and turning it off (here, or with the link in any issue) deletes the opt-in.
 * The tables can't be read from the app at all; these database functions act only for the
 * signed-in person.
 */
export async function newsletterStatus(): Promise<boolean | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('newsletter_status');
  return error ? null : data === true;
}

/** Turns it on (with the app's language, for later issues in it) or off. True if it worked. */
export async function setNewsletter(on: boolean, language: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = on
    ? await supabase.rpc('newsletter_subscribe', { p_language: language })
    : await supabase.rpc('newsletter_unsubscribe');
  return !error;
}

/**
 * The opt-in on onboarding's sign-in step: off unless the person turns it on there, and
 * applied only once a sign-in succeeds (the database needs the account). Skipping sign-in
 * drops it.
 */
let pendingOptIn = false;

export function setPendingOptIn(on: boolean) {
  pendingOptIn = on;
}

/** After a successful sign-in: turns the newsletter on if it was asked for, once. */
export async function applyPendingOptIn(language: string): Promise<void> {
  if (!pendingOptIn) return;
  pendingOptIn = false;
  await setNewsletter(true, language);
}

/** How many people the next issue goes to. Admins only; null for anyone else. */
export async function subscriberCount(): Promise<number | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('newsletter_count');
  return error || typeof data !== 'number' ? null : data;
}

export interface SentIssue {
  id: number;
  subject: string;
  recipients: number;
  sent: number;
  failed: number;
  created_at: string;
}

/** Issues already sent, newest first. Admins only (RLS). */
export async function sentIssues(): Promise<SentIssue[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('newsletter_issues')
    .select('id, subject, recipients, sent, failed, created_at')
    .order('created_at', { ascending: false })
    .limit(20);
  return (data ?? []) as SentIssue[];
}

export type SendResult = { ok: true; sent: number; failed: number; to?: string } | { ok: false; message: string };

/** A test to the admin's own address, or the issue to everyone. */
export async function sendIssue(mode: 'test' | 'send', subject: string, body: string): Promise<SendResult> {
  if (!supabase) return { ok: false, message: 'Not connected.' };
  const { data, error } = await supabase.functions.invoke('send-newsletter', { method: 'POST', body: { mode, subject, body } });
  if (error) {
    // The function's own reason (no postal address yet, sent in the last 10 minutes) is in the body.
    let message = error.message;
    try {
      const reply = await (error as { context?: Response }).context?.json();
      if (reply?.error) message = reply.error;
    } catch {
      // Keep the client's message.
    }
    return { ok: false, message };
  }
  const d = data as { sent?: number; failed?: number; to?: string };
  return { ok: true, sent: d.sent ?? 0, failed: d.failed ?? 0, to: d.to };
}
