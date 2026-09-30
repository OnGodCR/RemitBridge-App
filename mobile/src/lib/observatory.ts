import { supabase } from '@/lib/supabase';

/**
 * The receipt observatory's totals (DECISIONS.md D96), from receipt_observatory(): research-
 * consented receipts only, and no group under `min_group`. The database does the counting,
 * so the app never sees a single receipt.
 */
export interface ObservatoryGroup {
  provider_id: string;
  route_id: string;
  receipts: number;
  median_total_cost_pct: number | null;
  median_markup_pct: number | null;
  compared: number;
  paid_more_than_advertised: number;
}

export interface Observatory {
  receipts: number;
  min_group: number;
  /** The month of the first shared receipt, YYYY-MM. */
  since: string | null;
  groups: ObservatoryGroup[];
  tax: { taxed: number; matches: number; not_found: number } | null;
  disclosures_missing: Record<string, number>;
}

export async function fetchObservatory(): Promise<Observatory | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('receipt_observatory');
  if (error || !data) return null;
  return data as Observatory;
}
