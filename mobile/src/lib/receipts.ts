import type { ConfirmRequest, ConfirmResponse, ForgetRequest, ScanRequest, ScanResponse } from '@remitbridge/receipt';

import { supabase } from '@/lib/supabase';

/**
 * Talking to the scan-receipt Edge Function (DECISIONS.md D79, D81). What goes up is the
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

export type ConfirmResult = { ok: true; confirmed: ConfirmResponse } | { ok: false; reason: 'not_connected' | 'expired' | 'failed' };

/** The person's answers from the confirmation screen; the server checks and compares. */
export async function confirmScan(id: string, corrections: ConfirmRequest['corrections'], today: string): Promise<ConfirmResult> {
  if (!supabase) return { ok: false, reason: 'not_connected' };
  const body: ConfirmRequest = { action: 'confirm', id, corrections, today };
  const { data, error } = await supabase.functions.invoke<ConfirmResponse>('scan-receipt', { body });
  if (error) {
    const status = (error as { context?: { status?: number } }).context?.status;
    return { ok: false, reason: status === 404 ? 'expired' : 'failed' };
  }
  return data?.id ? { ok: true, confirmed: data } : { ok: false, reason: 'failed' };
}
