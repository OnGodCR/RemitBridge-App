import { computeTransferCost } from '@remitbridge/formula';

import { isoDay } from '@/lib/fx';
import { type DeliveryMethod } from '@/lib/routes';
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
 * A quote at the amount typed. For an amount that wasn't checked, the checked amount's fee
 * and rate run through the one formula (see checkedAmountFor in lib/routes.ts), and the
 * result is labelled as an estimate wherever it shows.
 */
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
  | {
      kind: 'ok';
      standing: LatestQuote[];
      promotional: LatestQuote[];
      /** Set when the network failed and these are the prices kept from the last visit. */
      savedAt?: string;
    };

export async function fetchQuotes(
  routeId: string,
  amount: number,
  method: DeliveryMethod,
): Promise<QuotesResult> {
  if (!supabase) return { kind: 'not_connected' };
  const key = `rb.quotes.${routeId}.${amount}.${method}`;
  const { data, error } = await supabase
    .from('latest_quotes')
    .select('*')
    .eq('route_id', routeId)
    .eq('send_amount', amount)
    .eq('delivery_method', method);
  if (error) return fromCache(key) ?? { kind: 'error', message: error.message };
  remember(key, (data ?? []) as LatestQuote[]);
  return { kind: 'ok', ...rank((data ?? []) as LatestQuote[]) };
}

/**
 * The last prices loaded for each route, amount and method, kept on the phone (PRD 14.10:
 * senders are often on older phones and slow connections). When the network fails,
 * Compare shows these, labelled with when they were loaded, instead of nothing. The same
 * rules as the view apply on the way out: nothing older than 48 hours, and "stale" is
 * worked out again from the check time, since it was computed when they were loaded.
 */
function remember(key: string, rows: LatestQuote[]) {
  try {
    localStorage.setItem(key, JSON.stringify({ at: new Date().toISOString(), rows }));
  } catch {
    // A full or unavailable store only means no offline copy.
  }
}

function fromCache(key: string): QuotesResult | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { at, rows } = JSON.parse(raw) as { at: string; rows: LatestQuote[] };
    const now = Date.now();
    const fresh = rows
      .filter((q) => now - new Date(q.captured_at).getTime() < 48 * 3600 * 1000)
      .map((q) => ({ ...q, is_stale: now - new Date(q.captured_at).getTime() > 24 * 3600 * 1000 }));
    return { kind: 'ok', ...rank(fresh), savedAt: at };
  } catch {
    return null;
  }
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

/**
 * One quote for the detail screen, by id. From `latest_quotes` first, which is what Compare
 * listed; if it has aged out of that 48-hour window since, from `quotes`, where the public
 * policy still shows it because it was published (PRD 9.7). 'missing' when neither has it.
 */
export async function fetchQuote(id: number): Promise<LatestQuote | 'missing' | 'error'> {
  if (!supabase) return 'error';
  const latest = await supabase.from('latest_quotes').select('*').eq('id', id).maybeSingle();
  if (latest.error) return 'error';
  if (latest.data) return numeric(latest.data as LatestQuote);
  const old = await supabase
    .from('quotes')
    .select(
      'id, provider_id, providers(name), route_id, send_currency, receive_currency, send_amount, delivery_method, payment_method, fee, offered_rate, mid_market_rate, mid_market_source, pickup_charge, amount_received, markup_pct, total_cost, total_cost_pct, delivery_time, is_promotional, source, captured_at',
    )
    .eq('id', id)
    .maybeSingle();
  if (old.error) return 'error';
  if (!old.data) return 'missing';
  const { providers, ...row } = old.data as unknown as LatestQuote & { providers: { name: string } | null };
  return numeric({ ...row, provider_name: providers?.name ?? row.provider_id, is_stale: true });
}

/** PostgREST returns numeric columns as strings when they don't fit a double exactly. */
function numeric(q: LatestQuote): LatestQuote {
  return {
    ...q,
    send_amount: Number(q.send_amount),
    fee: Number(q.fee),
    offered_rate: Number(q.offered_rate),
    mid_market_rate: Number(q.mid_market_rate),
    pickup_charge: Number(q.pickup_charge),
    amount_received: Number(q.amount_received),
    markup_pct: Number(q.markup_pct),
    total_cost: Number(q.total_cost),
    total_cost_pct: Number(q.total_cost_pct),
  };
}

export interface HistoryPoint {
  date: string;
  amountReceived: number;
  offeredRate: number;
  fee: number;
}

/**
 * The provider's recent published prices for the same route, amount and method, one point
 * per day (the last check that day), for the detail screen's "recent prices" (PRD 14.7).
 * Promotional prices are left out, so a one-time offer doesn't read as the usual price.
 */
export async function fetchQuoteHistory(q: LatestQuote, days = 30): Promise<HistoryPoint[] | 'error'> {
  if (!supabase) return 'error';
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from('quotes')
    .select('captured_at, amount_received, offered_rate, fee')
    .eq('provider_id', q.provider_id)
    .eq('route_id', q.route_id)
    .eq('delivery_method', q.delivery_method)
    .eq('payment_method', q.payment_method)
    .eq('send_amount', q.send_amount)
    .eq('is_promotional', false)
    .eq('validation_status', 'published')
    .gte('captured_at', since)
    .order('captured_at', { ascending: true })
    .limit(500);
  if (error) return 'error';
  const byDay = new Map<string, HistoryPoint>();
  for (const r of data ?? []) {
    // The phone's own day, like the rest of the app: a check at 9pm Pacific is that day's.
    const date = isoDay(new Date(r.captured_at));
    byDay.set(date, {
      date,
      amountReceived: Number(r.amount_received),
      offeredRate: Number(r.offered_rate),
      fee: Number(r.fee),
    });
  }
  return [...byDay.values()];
}
