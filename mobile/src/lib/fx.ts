/**
 * Mid-market reference rates for the tools, straight from Frankfurter v2 (DECISIONS.md D35,
 * D58): free, keyless, dated, and the same source the engine and the website use. The app
 * asks only for a currency pair and sometimes a date; no amount or anything about the
 * person goes over the wire.
 *
 * Frankfurter answers with the date the rate is actually for, which can differ from the
 * date asked for. That date is carried through and shown, never assumed.
 */

import { useEffect, useState } from 'react';

const API = 'https://api.frankfurter.dev/v2';
export const FX_SOURCE = 'Frankfurter';

export interface MidRate {
  rate: number;
  /** The day the rate is for (YYYY-MM-DD). */
  date: string;
  source: string;
}

export interface RatePoint {
  date: string;
  rate: number;
}

type Row = { date: string; base: string; quote: string; rate: number };

async function get(params: Record<string, string>): Promise<Row[]> {
  const res = await fetch(`${API}/rates?${new URLSearchParams(params)}`);
  if (!res.ok) throw new Error(`Frankfurter answered ${res.status}`);
  const data = (await res.json()) as Row[];
  if (!Array.isArray(data)) throw new Error('Unexpected answer from Frankfurter');
  return data;
}

/** The mid-market rate for base -> quote, today or on a given day (YYYY-MM-DD). */
export async function fetchMidRate(base: string, quote: string, date?: string): Promise<MidRate> {
  if (base === quote) return { rate: 1, date: date ?? today(), source: FX_SOURCE };
  const rows = await get({ base, quotes: quote, ...(date ? { date } : {}) });
  const row = rows.find((r) => r.quote === quote);
  if (!row || !(row.rate > 0)) throw new Error(`No rate for ${base} to ${quote}`);
  return { rate: row.rate, date: row.date, source: FX_SOURCE };
}

/** One point per day between two dates, oldest first. */
export async function fetchRateSeries(
  base: string,
  quote: string,
  from: string,
  to: string,
): Promise<RatePoint[]> {
  const rows = await get({ base, quotes: quote, from, to });
  return rows
    .filter((r) => r.quote === quote && r.rate > 0)
    .map((r) => ({ date: r.date, rate: r.rate }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Today in the device's own time zone, as YYYY-MM-DD. */
export function today(): string {
  return isoDay(new Date());
}

export function isoDay(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDay(d);
}

/** "Sep 29, 2026" for a YYYY-MM-DD day, without time-zone drift. */
export function formatDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export type MidRateState = { state: 'loading' } | { state: 'error' } | ({ state: 'ready' } & MidRate);

/**
 * The mid-market rate for a pair (and optional day), refetched when either changes. The
 * answer is kept with the key it was for, so a stale answer never shows for a new pair.
 */
export function useMidRate(base: string, quote: string, date?: string): MidRateState {
  const key = `${base}|${quote}|${date ?? ''}`;
  const [answer, setAnswer] = useState<{ key: string; value: MidRate | 'error' } | null>(null);
  useEffect(() => {
    let live = true;
    fetchMidRate(base, quote, date).then(
      (value) => live && setAnswer({ key, value }),
      () => live && setAnswer({ key, value: 'error' }),
    );
    return () => {
      live = false;
    };
  }, [base, quote, date, key]);
  if (!answer || answer.key !== key) return { state: 'loading' };
  return answer.value === 'error' ? { state: 'error' } : { state: 'ready', ...answer.value };
}
