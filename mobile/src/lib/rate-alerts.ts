import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { FundingMethod } from '@remitbridge/formula';

import type { DeliveryMethod } from '@/lib/routes';
import { supabase } from '@/lib/supabase';

/**
 * Rate alerts (DECISIONS.md D34, D113): "tell me when $500 to India gets at least
 * ₹47,600". Kept in `rate_alerts` with the account (RLS: owner only, at most ten, deleted
 * with the account), with this phone's Expo push token. The "Rate alerts" workflow checks
 * them after every price update and sends at most one notification a day per alert.
 */
export interface RateAlert {
  id: number;
  route_id: string;
  send_amount: number;
  delivery_method: DeliveryMethod;
  target_received: number;
  /** A phone notification, or a WhatsApp message to the linked chat (D139). */
  channel: AlertChannel;
  created_at: string;
}

export type AlertChannel = 'push' | 'whatsapp';

export type TokenResult = { ok: true; token: string } | { ok: false; reason: 'denied' | 'unavailable' };

/** Asks for permission (only when someone turns an alert on) and gets this phone's token. */
export async function pushToken(): Promise<TokenResult> {
  try {
    let { granted } = await Notifications.getPermissionsAsync();
    if (!granted) granted = (await Notifications.requestPermissionsAsync()).granted;
    if (!granted) return { ok: false, reason: 'denied' };
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('rate-alerts', {
        name: 'Rate alerts',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    const { data } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return { ok: true, token: data };
  } catch {
    // A simulator, or a build without push set up, has no token to give.
    return { ok: false, reason: 'unavailable' };
  }
}

export type CreateResult = 'on' | 'signed_out' | 'denied' | 'unavailable' | 'limit' | 'not_linked' | 'error';

export async function createAlert(a: {
  routeId: string;
  amount: number;
  method: DeliveryMethod;
  funding: FundingMethod;
  target: number;
  language: string;
  channel?: AlertChannel;
}): Promise<CreateResult> {
  if (!supabase) return 'error';
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return 'signed_out';
  // WhatsApp needs no permission on this phone: the message goes to the linked chat.
  const whatsapp = a.channel === 'whatsapp';
  const token = whatsapp ? null : await pushToken();
  if (token && !token.ok) return token.reason;
  const { error } = await supabase.from('rate_alerts').insert({
    user_id: userId,
    route_id: a.routeId,
    send_amount: a.amount,
    delivery_method: a.method,
    payment_method: a.funding,
    target_received: a.target,
    channel: whatsapp ? 'whatsapp' : 'push',
    push_token: token?.ok ? token.token : null,
    language: ['en', 'es', 'hi', 'tl', 'vi'].includes(a.language) ? a.language : 'en',
  });
  if (!error) return 'on';
  if (error.message.includes('link WhatsApp first')) return 'not_linked';
  return error.message.includes('at most 10') ? 'limit' : 'error';
}

export async function fetchAlerts(): Promise<RateAlert[] | null> {
  if (!supabase) return null;
  const { data: s } = await supabase.auth.getSession();
  if (!s.session) return null;
  const { data, error } = await supabase
    .from('rate_alerts')
    .select('id, route_id, send_amount, delivery_method, target_received, channel, created_at')
    .order('created_at', { ascending: false });
  return error ? null : (data as RateAlert[]);
}

export async function deleteAlert(id: number): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('rate_alerts').delete().eq('id', id);
  return !error;
}

/** A sensible step for the target: ₹100 near ₹47,000, MX$10 near MX$8,500. */
export function targetStep(best: number): number {
  return Math.max(1, 10 ** (Math.floor(Math.log10(Math.max(best, 1))) - 2));
}

/** Where a new alert starts: a little above today's best, on a round step. */
export function startingTarget(best: number): number {
  const step = targetStep(best);
  return Math.ceil((best * 1.005) / step) * step;
}
