import { computeTransferCost, type TransferCost } from '@remitbridge/formula';

import { supabase } from '@/lib/supabase';

/**
 * Receipts checked with TrueCost and saved to the account (DECISIONS.md D19, D30, D58).
 * They live in `saved_transfers`, which RLS keeps private to the owner, and are deleted
 * with the account. Costs are never stored: they're recomputed from the saved inputs with
 * the one formula, so a saved check can't drift from what the formula says today.
 */
export interface SavedCheck {
  id: number;
  provider_name: string;
  send_currency: string;
  receive_currency: string;
  sent: number;
  fee: number;
  quoted_rate: number;
  mid_rate: number | null;
  mid_rate_source: string | null;
  pickup_charge: number;
  sent_on: string;
  created_at: string;
}

export type NewCheck = Omit<SavedCheck, 'id' | 'created_at'>;

/** Null when saved; otherwise why not, as a key the screen turns into words. */
export type SaveCheckError = 'notConnected' | 'signedOut' | 'failed';

export async function saveCheck(check: NewCheck): Promise<SaveCheckError | null> {
  if (!supabase) return 'notConnected';
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return 'signedOut';
  const { error } = await supabase.from('saved_transfers').insert({ ...check, user_id: userId });
  return error ? 'failed' : null;
}

export async function fetchChecks(): Promise<SavedCheck[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('saved_transfers')
    .select('id, provider_name, send_currency, receive_currency, sent, fee, quoted_rate, mid_rate, mid_rate_source, pickup_charge, sent_on, created_at')
    .order('sent_on', { ascending: false })
    .limit(50);
  return (data ?? []).map((r) => ({
    ...r,
    sent: Number(r.sent),
    fee: Number(r.fee),
    quoted_rate: Number(r.quoted_rate),
    mid_rate: r.mid_rate === null ? null : Number(r.mid_rate),
    pickup_charge: Number(r.pickup_charge),
  })) as SavedCheck[];
}

export async function deleteCheck(id: number): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('saved_transfers').delete().eq('id', id);
  return !error;
}

/** The cost of a saved check, or null if it was saved without a mid-market rate. */
export function costOf(c: SavedCheck): TransferCost | null {
  if (!c.mid_rate) return null;
  return computeTransferCost({
    sent: c.sent,
    fee: c.fee,
    quotedRate: c.quoted_rate,
    midRate: c.mid_rate,
    pickupCharge: c.pickup_charge,
  });
}
