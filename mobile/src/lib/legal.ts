import type { Session } from '@supabase/supabase-js';

import legal from '@/content/legal.json';
import { supabase } from '@/lib/supabase';

/**
 * The terms of use and privacy policy, inside the app (D188, Angad 2026-10-17). The words
 * come from site/terms.html and site/privacy.html through site/legal-for-app.mjs, and the
 * site build fails if this copy falls behind, so the app and the site always agree.
 */
export type LegalSpan = { text: string; href?: string; bold?: boolean };
export type LegalBlock = { kind: 'heading'; text: string } | { kind: 'paragraph' | 'item'; spans: LegalSpan[] };
export type LegalDoc = { title: string; updated: string; blocks: LegalBlock[] };
export type LegalDocId = 'terms' | 'privacy';

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = { terms: legal.terms as LegalDoc, privacy: legal.privacy as LegalDoc };

/** Both documents' dates. A new date on either one asks everyone with an account again. */
export const LEGAL_VERSION: string = legal.version;

type Accepted = { version?: string; at?: string };

/** What this account last agreed to, kept on the account itself, so every phone knows. */
export function acceptedVersion(session: Session | null): string | null {
  const accepted = session?.user.user_metadata?.legal_accepted as Accepted | undefined;
  return accepted?.version ?? null;
}

/** Signed in, and hasn't agreed to the current terms and privacy policy. */
export function needsLegalConsent(session: Session | null): boolean {
  return !!session && acceptedVersion(session) !== LEGAL_VERSION;
}

/** Records the agreement on the account: which version, and when. False if it didn't save. */
export async function acceptLegal(now: Date = new Date()): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.auth.updateUser({
    data: { legal_accepted: { version: LEGAL_VERSION, at: now.toISOString() } },
  });
  return !error;
}
