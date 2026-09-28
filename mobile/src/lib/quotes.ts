import { supabase } from '@/lib/supabase';
import type { DeliveryMethod } from '@/lib/routes';

/**
 * A row of the `latest_quotes` view: the newest published quote per provider, no older
 * than 48 hours. Every cost figure was computed by the engine with the one formula
 * (packages/formula); the app never recomputes or rounds them into different numbers.
 */
export interface LatestQuote {
  id: number;
  provider_id: string;
  provider_name: string;
  route_id: string;
  send_currency: string;
  receive_currency: string;
  send_amount: number;
  delivery_method: DeliveryMethod;
  payment_method: string;
  fee: number;
  offered_rate: number;
  mid_market_rate: number;
  mid_market_source: string;
  pickup_charge: number;
  amount_received: number;
  markup_pct: number;
  total_cost: number;
  total_cost_pct: number;
  delivery_time: string | null;
  is_promotional: boolean;
  source: 'scraper' | 'api' | 'manual' | 'partner';
  captured_at: string;
  is_stale: boolean;
}

export type QuotesResult =
  | { kind: 'not_connected' }
  | { kind: 'error'; message: string }
  | { kind: 'ok'; standing: LatestQuote[]; promotional: LatestQuote[] };

export async function fetchQuotes(
  routeId: string,
  amount: number,
  method: DeliveryMethod,
): Promise<QuotesResult> {
  if (!supabase) return { kind: 'not_connected' };
  const { data, error } = await supabase
    .from('latest_quotes')
    .select('*')
    .eq('route_id', routeId)
    .eq('send_amount', amount)
    .eq('delivery_method', method);
  if (error) return { kind: 'error', message: error.message };
  return { kind: 'ok', ...rank((data ?? []) as LatestQuote[]) };
}

/**
 * Ranked by amount received, never by fee (PRD 5.1). Promotional first-transfer rates are
 * ranked apart from standing rates (PRD 9.7 check 6), so a one-time offer can't sit on
 * top of the list as if it were the ongoing price.
 */
export function rank(quotes: LatestQuote[]): { standing: LatestQuote[]; promotional: LatestQuote[] } {
  const byReceived = (a: LatestQuote, b: LatestQuote) => b.amount_received - a.amount_received;
  return {
    standing: quotes.filter((q) => !q.is_promotional).sort(byReceived),
    promotional: quotes.filter((q) => q.is_promotional).sort(byReceived),
  };
}
