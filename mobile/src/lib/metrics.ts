import { supabase } from '@/lib/supabase';

/**
 * The admin metrics screen's data (DECISIONS.md D31, D65). Every figure comes from one
 * database function, `admin_metrics(p_days)`, which refuses anyone but admins and leaves
 * out internal installs. Each figure here carries its written definition (a D31 honesty
 * rule), shown next to the number and included in the export.
 */
export interface Metrics {
  days: number;
  generated_at: string;
  usage: {
    active_installs: number;
    new_installs: number;
    sessions: number;
    dau: number;
    wau: number;
    mau: number;
    retention: Partial<Record<'d1' | 'd7' | 'd30', { cohort: number; pct: number }>>;
  };
  funnel: {
    onboarding_started: number;
    route_picked: number;
    signed_in: number;
    skipped: number;
    compared: number;
    saw_prices: number;
    opened_quote: number;
  };
  activity: {
    comparisons: number;
    by_route: Record<string, number>;
    by_amount: Record<string, number>;
    by_platform: Record<string, number>;
    tools: Record<string, number>;
    quotes_opened: number;
    sign_ups: number;
    saved_checks: number;
    saved_comparisons: number;
    route_requests: number;
    price_reports: number;
    accounts_deleted: number;
  };
  impact: {
    savings_usd: number;
    savings_comparisons: number;
    quotes_published: number;
    quotes_held: number;
    providers_live: number;
    routes_live: number;
    prices_entered: number;
    runs: Record<string, number>;
    last_good_run: string | null;
  };
}

export async function fetchMetrics(days: number): Promise<Metrics | 'forbidden' | 'error'> {
  if (!supabase) return 'error';
  const { data, error } = await supabase.rpc('admin_metrics', { p_days: days });
  if (error) return error.code === '42501' ? 'forbidden' : 'error';
  return data as Metrics;
}

/** One figure: where it sits in the result, what it's called, and what exactly it counts. */
export interface MetricDef {
  group: 'usage' | 'funnel' | 'activity' | 'impact';
  key: string;
  label: string;
  definition: string;
}

export const DEFINITIONS: MetricDef[] = [
  { group: 'usage', key: 'active_installs', label: 'Active installs', definition: 'Installs that logged anything in the period.' },
  { group: 'usage', key: 'new_installs', label: 'New installs', definition: 'Installs whose first event ever falls in the period.' },
  { group: 'usage', key: 'sessions', label: 'Sessions', definition: 'App opens: a launch, or a return after 30 minutes away.' },
  { group: 'usage', key: 'dau', label: 'Daily active', definition: 'Installs active in the last 24 hours, whatever the period.' },
  { group: 'usage', key: 'wau', label: 'Weekly active', definition: 'Installs active in the last 7 days.' },
  { group: 'usage', key: 'mau', label: 'Monthly active', definition: 'Installs active in the last 30 days.' },
  { group: 'funnel', key: 'onboarding_started', label: 'Started onboarding', definition: 'Installs that saw the first step.' },
  { group: 'funnel', key: 'route_picked', label: 'Picked a route', definition: 'Installs that chose a route in onboarding.' },
  { group: 'funnel', key: 'signed_in', label: 'Signed in', definition: 'Installs that finished any sign-in.' },
  { group: 'funnel', key: 'skipped', label: 'Skipped sign-in', definition: 'Installs that chose “Skip for now”.' },
  { group: 'funnel', key: 'compared', label: 'Ran a comparison', definition: 'Installs that loaded prices for any route.' },
  { group: 'funnel', key: 'saw_prices', label: 'Saw prices', definition: 'Installs whose comparison returned at least one price.' },
  { group: 'funnel', key: 'opened_quote', label: 'Opened a quote', definition: 'Installs that opened a quote’s detail.' },
  { group: 'activity', key: 'comparisons', label: 'Comparisons', definition: 'Every comparison loaded, all channels.' },
  { group: 'activity', key: 'quotes_opened', label: 'Quotes opened', definition: 'Quote detail screens opened.' },
  { group: 'activity', key: 'sign_ups', label: 'Sign-ups', definition: 'Accounts created in the period, admins left out.' },
  { group: 'activity', key: 'saved_checks', label: 'Receipts saved', definition: 'TrueCost checks saved to an account.' },
  { group: 'activity', key: 'saved_comparisons', label: 'Comparisons saved', definition: 'Comparisons saved to an account.' },
  { group: 'activity', key: 'route_requests', label: 'Route requests', definition: 'Requests filed, internal installs left out.' },
  { group: 'activity', key: 'price_reports', label: 'Wrong-price reports', definition: 'Taps on “This price looks wrong”.' },
  { group: 'activity', key: 'accounts_deleted', label: 'Accounts deleted', definition: 'Deletions made in the app.' },
  {
    group: 'impact',
    key: 'savings_usd',
    label: 'Savings shown',
    definition:
      'Per install, route, amount and day compared: most minus median amount received among 3+ standing prices, in USD at the mid-market rate. Summed.',
  },
  { group: 'impact', key: 'savings_comparisons', label: 'Comparisons in savings', definition: 'How many comparisons the savings figure covers.' },
  { group: 'impact', key: 'quotes_published', label: 'Prices published', definition: 'Quotes captured in the period that passed the publish gate.' },
  { group: 'impact', key: 'quotes_held', label: 'Prices held back', definition: 'Quotes quarantined or rejected by the gate.' },
  { group: 'impact', key: 'providers_live', label: 'Providers with prices', definition: 'Providers with a published price in the period.' },
  { group: 'impact', key: 'routes_live', label: 'Routes with prices', definition: 'Routes with a published price in the period.' },
  { group: 'impact', key: 'prices_entered', label: 'Prices entered by hand', definition: 'Rows added through “Add a price”.' },
];

/** The export: one line per figure, with its definition, so the numbers travel with their meaning. */
export function toCsv(m: Metrics): string {
  const rows: string[][] = [['metric', 'value', 'definition']];
  for (const d of DEFINITIONS) {
    const value = (m[d.group] as unknown as Record<string, unknown>)[d.key];
    rows.push([d.label, String(value ?? ''), d.definition]);
  }
  for (const n of ['d1', 'd7', 'd30'] as const) {
    const r = m.usage.retention[n];
    rows.push([
      `Retention ${n}`,
      r ? `${r.pct}% of ${r.cohort}` : '',
      `Share of installs first seen in the last 120 days that were active on day ${n.slice(1)}.`,
    ]);
  }
  const maps: [string, Record<string, number>][] = [
    ['Comparisons by route', m.activity.by_route],
    ['Comparisons by checked amount', m.activity.by_amount],
    ['Comparisons by platform', m.activity.by_platform],
    ['Tools opened', m.activity.tools],
    ['Engine runs by status', m.impact.runs],
  ];
  for (const [label, map] of maps) {
    for (const [k, v] of Object.entries(map)) rows.push([`${label}: ${k}`, String(v), '']);
  }
  rows.push(['Last good engine run', m.impact.last_good_run ?? 'never', '']);
  rows.push(['Period (days)', String(m.days), `Generated ${m.generated_at}`]);
  return rows.map((r) => r.map(csvCell).join(',')).join('\n');
}

function csvCell(s: string): string {
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
