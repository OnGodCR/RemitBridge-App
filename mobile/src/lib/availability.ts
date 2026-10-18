import { useEffect, useState } from 'react';

import { ALL_DELIVERY_METHODS, ROUTES, type DeliveryMethod, type Route } from '@/lib/routes';
import { supabase } from '@/lib/supabase';

/**
 * What has prices right now: for each route, the ways money can arrive that Compare has
 * checked prices for (D190, Angad 2026-10-18: the stores want the full app, so nothing
 * that says "coming soon"). Compare and onboarding offer only these, so a country or a
 * receiving method appears when its first price is published and goes away if its prices
 * expire, with no app update. Read from the same view Compare reads, bank-funded only
 * (D178). The last answer is kept on the phone for the next launch.
 */
export type Availability = Record<string, DeliveryMethod[]>;

const KEY = 'rb.availability';
const REFRESH_AFTER_MS = 10 * 60 * 1000;

/** Before anything has loaded on a first launch: every route, by bank deposit. */
const FALLBACK: Availability = Object.fromEntries(ROUTES.map((r) => [r.id, ['bank_deposit' as DeliveryMethod]]));

function stored(): Availability | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Availability) : null;
  } catch {
    return null;
  }
}

let current: Availability = stored() ?? FALLBACK;
let loadedAt = 0;
let loading: Promise<void> | null = null;
const listeners = new Set<(a: Availability) => void>();

/** Groups rows of (route, method) into the availability map, in a fixed method order. */
export function fromRows(rows: { route_id: string; delivery_method: string }[]): Availability {
  const seen: Record<string, Set<string>> = {};
  for (const r of rows) (seen[r.route_id] ??= new Set()).add(r.delivery_method);
  const out: Availability = {};
  for (const route of ROUTES) {
    const methods = ALL_DELIVERY_METHODS.filter((m) => seen[route.id]?.has(m));
    if (methods.length) out[route.id] = methods;
  }
  return out;
}

async function load(): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('compare_quotes')
    .select('route_id, delivery_method')
    .eq('payment_method', 'bank_account')
    .limit(10000);
  // A failed or empty read keeps what we had: an empty map would hide every country.
  if (error || !data?.length) return;
  current = fromRows(data);
  loadedAt = Date.now();
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // Kept in memory only; the next launch reads it again.
  }
  listeners.forEach((l) => l(current));
}

function refresh() {
  if (loading || Date.now() - loadedAt < REFRESH_AFTER_MS) return;
  loading = load().finally(() => (loading = null));
}

export function useAvailability(): Availability {
  const [value, setValue] = useState(current);
  useEffect(() => {
    listeners.add(setValue);
    refresh();
    return () => {
      listeners.delete(setValue);
    };
  }, []);
  return value;
}

/** Routes with at least one price, in the app's own order. */
export function availableRoutes(a: Availability): Route[] {
  return ROUTES.filter((r) => a[r.id]?.length);
}

/** How money can arrive on a route with prices; bank deposit when unknown. */
export function methodsFor(a: Availability, route: Route): DeliveryMethod[] {
  return a[route.id]?.length ? a[route.id] : ['bank_deposit'];
}
