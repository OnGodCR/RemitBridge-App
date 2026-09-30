import type { ForgetRequest, ScanRequest, ScanResponse } from '@remitbridge/receipt';

import { supabase } from '@/lib/supabase';

/**
 * Talking to the scan-receipt Edge Function (DECISIONS.md D76, D78). What goes up is the
 * redacted text and, if the person continues, the redacted photo: never the original.
 */
export type SendResult = { ok: true; result: ScanResponse } | { ok: false; reason: 'not_connected' | 'failed' };

export async function sendScan(request: Omit<ScanRequest, 'action'>): Promise<SendResult> {
  if (!supabase) return { ok: false, reason: 'not_connected' };
  const body: ScanRequest = { action: 'scan', ...request };
  const { data, error } = await supabase.functions.invoke<ScanResponse>('scan-receipt', { body });
  if (error || !data?.id) return { ok: false, reason: 'failed' };
  return { ok: true, result: data };
}

/** Deletes a scanned receipt now, before its 30 days are up. */
export async function forgetReceipt(id: string): Promise<boolean> {
  if (!supabase) return false;
  const body: ForgetRequest = { action: 'forget', id };
  const { error } = await supabase.functions.invoke('scan-receipt', { body });
  return !error;
}
