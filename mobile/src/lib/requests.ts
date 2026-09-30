import { prefs } from '@/lib/prefs';
import type { DeliveryMethod } from '@/lib/routes';
import { supabase } from '@/lib/supabase';

/**
 * Route requests and the route board (PRD 6.7, DECISIONS.md D64). Anyone can ask for a
 * route that isn't covered; the board shows every requested route with its count and
 * status. Requests are write-only from the app: RLS lets nobody but admins read the rows,
 * and the counts come from `route_request_counts()`, which returns aggregates only.
 */

export type RouteStatus = 'requested' | 'under_review' | 'building' | 'live' | 'not_feasible';

export interface BoardEntry {
  from: string;
  to: string;
  status: RouteStatus;
  /** Required reading when a route is not feasible. */
  reason: string | null;
  requests: number;
}

export type RequestResult = 'ok' | 'already' | 'error';

/** A plain check before sending; the database checks again (and it's the one that counts). */
export function looksLikeEmail(text: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text.trim());
}

export async function requestRoute(request: {
  from: string;
  to: string;
  method: DeliveryMethod | null;
  email: string | null;
}): Promise<RequestResult> {
  if (!supabase) return 'error';
  const { data } = await supabase.auth.getSession();
  const { error } = await supabase.from('route_requests').insert({
    send_country: request.from,
    receive_country: request.to,
    delivery_method: request.method,
    install_id: prefs.installId(),
    user_id: data.session?.user.id ?? null,
    notify_email: request.email?.trim() || null,
  });
  if (!error) return 'ok';
  // The unique index on (install, route): this phone has asked for it before.
  if (error.code === '23505') return 'already';
  return 'error';
}

/** Requests per route, each person counted once. Null when it couldn't load. */
export async function fetchRequestCounts(): Promise<Map<string, number> | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('route_request_counts');
  if (error || !data) return null;
  const counts = new Map<string, number>();
  for (const row of data as { send_country: string; receive_country: string; requests: number }[]) {
    counts.set(pairKey(row.send_country, row.receive_country), Number(row.requests));
  }
  return counts;
}

/**
 * The board: every route in the `routes` table with its status, plus every requested pair
 * that has no route yet (status "requested"). If only the counts fail, the routes still
 * show and `counted` is false, so the screen can say the numbers are missing rather than
 * claim nobody asked. Null when the routes themselves couldn't load.
 */
export async function fetchBoard(): Promise<{ entries: BoardEntry[]; counted: boolean } | null> {
  if (!supabase) return null;
  const [routes, fetched] = await Promise.all([
    supabase.from('routes').select('send_country, receive_country, status, status_reason'),
    fetchRequestCounts(),
  ]);
  if (routes.error) return null;
  const counts = fetched ?? new Map<string, number>();
  const entries = new Map<string, BoardEntry>();
  for (const r of routes.data as {
    send_country: string;
    receive_country: string;
    status: RouteStatus;
    status_reason: string | null;
  }[]) {
    const key = pairKey(r.send_country, r.receive_country);
    entries.set(key, {
      from: r.send_country,
      to: r.receive_country,
      status: r.status,
      reason: r.status_reason,
      requests: counts.get(key) ?? 0,
    });
  }
  for (const [key, requests] of counts) {
    if (entries.has(key)) continue;
    const [from, to] = key.split('-');
    entries.set(key, { from, to, status: 'requested', reason: null, requests });
  }
  return { entries: [...entries.values()], counted: fetched !== null };
}

export function pairKey(from: string, to: string): string {
  return `${from}-${to}`.toUpperCase();
}
