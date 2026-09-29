import { computeTransferCost } from '@remitbridge/formula';

import { AMOUNTS, type DeliveryMethod } from '@/lib/routes';
import { supabase } from '@/lib/supabase';

/**
 * A row of the `latest_quotes` view: the newest published quote per provider, no older
 * than 48 hours. Every cost figure was computed by the engine with the one formula
 * (packages/formula). The app only recomputes for an amount that wasn't checked, with
 * the same formula (atAmount below), and labels the result as an estimate.
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

/** A quote as shown for the amount the person typed. */
export interface ShownQuote extends LatestQuote {
  /** The checked amount this was worked out from, or null when the amount was checked. */
  basedOn: number | null;
}

/**
 * Prices are checked at the grid amounts only (PRD 9.11). For any other amount, use the
 * largest checked amount at or below it (the smallest one if it's below the grid): same
 * fee and same rate, run through the one formula. Fees often change at tier breaks, so
 * these are labelled as estimates wherever they show.
 */
export function checkedAmountFor(amount: number): number {
  const below = AMOUNTS.filter((a) => a <= amount);
  return below.length ? below[below.length - 1] : AMOUNTS[0];
}

export function atAmount(q: LatestQuote, amount: number): ShownQuote | null {
  if (amount === Number(q.send_amount)) return { ...q, basedOn: null };
  const c = computeTransferCost({
    sent: amount,
    fee: Number(q.fee),
    quotedRate: Number(q.offered_rate),
    midRate: Number(q.mid_market_rate),
    pickupCharge: Number(q.pickup_charge),
  });
  if (c.amountReceived <= 0) return null; // the fee alone would eat the whole amount
  return {
    ...q,
    send_amount: amount,
    amount_received: c.amountReceived,
    markup_pct: c.markupPct,
    total_cost: c.totalCost,
    total_cost_pct: c.totalCostPct,
    basedOn: Number(q.send_amount),
  };
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
