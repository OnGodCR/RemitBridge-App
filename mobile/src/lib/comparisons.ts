import type { DeliveryMethod } from '@/lib/routes';
import { supabase } from '@/lib/supabase';

/**
 * Comparisons saved to the account (DECISIONS.md D19, D66): a route, an amount and a
 * delivery method, so Compare can be reopened on them in one tap. They live in
 * `saved_comparisons`, which RLS keeps private to the owner, and go with the account.
 * No prices are stored: opening one runs the comparison again on today's prices.
 */
export interface SavedComparison {
  id: number;
  route_id: string;
  send_amount: number;
  delivery_method: DeliveryMethod;
  created_at: string;
}

export type SaveResult = 'saved' | 'already' | 'signed_out' | 'error';

export async function saveComparison(c: {
  routeId: string;
  amount: number;
  method: DeliveryMethod;
}): Promise<SaveResult> {
  if (!supabase) return 'error';
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return 'signed_out';
  // Saving the same thing twice would only clutter the list, so check first. RLS limits
  // the lookup to this account's rows.
  const existing = await supabase
    .from('saved_comparisons')
    .select('id')
    .eq('route_id', c.routeId)
    .eq('send_amount', c.amount)
    .eq('delivery_method', c.method)
    .limit(1);
  if (existing.error) return 'error';
  if (existing.data.length > 0) return 'already';
  const { error } = await supabase.from('saved_comparisons').insert({
    user_id: userId,
    route_id: c.routeId,
    send_amount: c.amount,
    delivery_method: c.method,
  });
  return error ? 'error' : 'saved';
}

export async function fetchComparisons(): Promise<SavedComparison[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('saved_comparisons')
    .select('id, route_id, send_amount, delivery_method, created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  return (data ?? []).map((r) => ({ ...r, send_amount: Number(r.send_amount) })) as SavedComparison[];
}

export async function deleteComparison(id: number): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('saved_comparisons').delete().eq('id', id);
  return !error;
}
