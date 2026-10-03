import type { ConfirmRequest, ConfirmResponse, ForgetRequest, ScanRequest, ScanResponse } from '@remitbridge/receipt';

import { prefs } from '@/lib/prefs';
import { supabase } from '@/lib/supabase';

/**
 * Talking to the scan-receipt Edge Function (DECISIONS.md D79, D81). What goes up is the
 * redacted text and, if the person continues, the redacted photo: never the original.
 */
export type SendResult =
  | { ok: true; result: ScanResponse }
  | { ok: false; reason: 'not_connected' | 'failed' | 'limit_hour' | 'limit_day' };

export async function sendScan(request: Omit<ScanRequest, 'action' | 'install_id'>): Promise<SendResult> {
  if (!supabase) return { ok: false, reason: 'not_connected' };
  // The phone's random ID counts this phone's scans for the day (D140); nothing else uses it here.
  const body: ScanRequest = { action: 'scan', ...request, install_id: prefs.installId() };
  const { data, error } = await supabase.functions.invoke<ScanResponse>('scan-receipt', { body });
  if (error) {
    const response = (error as { context?: Response }).context;
    if (response?.status === 429) {
      const retry = await response
        .json()
        .then((b: { retry?: string }) => b.retry)
        .catch(() => undefined);
      return { ok: false, reason: retry === 'tomorrow' ? 'limit_day' : 'limit_hour' };
    }
    return { ok: false, reason: 'failed' };
  }
  if (!data?.id) return { ok: false, reason: 'failed' };
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
