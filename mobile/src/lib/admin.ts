import { computeTransferCost } from '@remitbridge/formula';
import { useEffect, useState } from 'react';

import { useAuth } from '@/lib/auth';
import type { DeliveryMethod } from '@/lib/routes';
import { supabase } from '@/lib/supabase';

/**
 * Admin-only price entry (DECISIONS.md D52, D54). An admin reads a provider's public
 * calculator and types in what it shows. The row is saved under RLS as "pending", and the
 * engine then runs it through the same publish gate as any other quote. This file never
 * decides whether a price is shown: it only saves what was seen and reports the outcome.
 */

/** Whether the signed-in account is an admin. Read from the caller's own profile row. */
export function useIsAdmin(): boolean {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [admin, setAdmin] = useState<{ userId: string; value: boolean } | null>(null);

  useEffect(() => {
    if (!supabase || !userId) return;
    let live = true;
    supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (live) setAdmin({ userId, value: !!data?.is_admin });
      });
    return () => {
      live = false;
    };
  }, [userId]);

  return !!userId && admin?.userId === userId && admin.value;
}

export interface Provider {
  id: string;
  name: string;
  website: string;
}

export async function fetchProviders(): Promise<Provider[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('providers')
    .select('id, name, website')
    .eq('active', true)
    .order('name');
  return (data ?? []) as Provider[];
}

export interface PriceEntry {
  provider_id: string;
  route_id: string;
  send_amount: number;
  delivery_method: DeliveryMethod;
  fee: number;
  offered_rate: number;
  amount_received: number;
  pickup_charge: number;
  delivery_time: string | null;
  promo_text: string | null;
  source_url: string;
}

export type EntryStatus = 'pending' | 'published' | 'quarantined' | 'rejected' | 'skipped';

export interface SavedEntry extends PriceEntry {
  id: number;
  status: EntryStatus;
  result_notes: string[];
  observed_at: string;
  processed_at: string | null;
}

/**
 * The gate's first check, run early so a typo shows before saving: does the amount
 * received match (sent - fee) x rate - pickup? Uses the one shared formula. The rate
 * stands in for mid-market here because markup doesn't affect this sum; the real markup
 * is measured by the engine against the mid-market rate it fetches.
 */
export function arithmeticCheck(e: Pick<PriceEntry, 'send_amount' | 'fee' | 'offered_rate' | 'pickup_charge' | 'amount_received'>) {
  const expected = computeTransferCost({
    sent: e.send_amount,
    fee: e.fee,
    quotedRate: e.offered_rate,
    midRate: e.offered_rate,
    pickupCharge: e.pickup_charge,
  }).amountReceived;
  // The engine's tolerance: 0.2% or one unit, whichever is larger (config.MATH_TOLERANCE_*).
  const tolerance = Math.max(1, Math.abs(expected) * 0.002);
  return { expected, ok: Math.abs(expected - e.amount_received) <= tolerance };
}

export async function savePrice(entry: PriceEntry): Promise<{ error: string | null; dispatched: boolean }> {
  if (!supabase) return { error: 'Not connected.', dispatched: false };
  const { error } = await supabase.from('manual_observations').insert(entry);
  if (error) {
    return {
      error: error.code === '42501' ? 'This account can’t add prices.' : 'Couldn’t save. Try again.',
      dispatched: false,
    };
  }
  // Ask for a check now. If that fails, the saved entry is still picked up by the schedule.
  const { data } = await supabase.functions.invoke('process-prices', { method: 'POST' });
  return { error: null, dispatched: !!(data as { dispatched?: boolean } | null)?.dispatched };
}

export async function fetchRecentEntries(limit = 20): Promise<SavedEntry[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('manual_observations')
    .select(
      'id, provider_id, route_id, send_amount, delivery_method, fee, offered_rate, amount_received, pickup_charge, delivery_time, promo_text, source_url, status, result_notes, observed_at, processed_at',
    )
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => ({
    ...r,
    send_amount: Number(r.send_amount),
    fee: Number(r.fee),
    offered_rate: Number(r.offered_rate),
    amount_received: Number(r.amount_received),
    pickup_charge: Number(r.pickup_charge),
  })) as SavedEntry[];
}
