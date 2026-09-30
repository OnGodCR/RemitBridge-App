// The WhatsApp bot's webhook (PRD 5.8, DECISIONS.md D68), on Meta's Cloud API directly.
//
// All the thinking (reading messages, choosing a reply, the wording in English and Hindi)
// is packages/bot, which is tested there. This file does the I/O: check that a delivery
// really came from Meta, look up prices, remember the little the bot may remember, and
// send the reply.
//
// What's kept about a number (PRD 5.8): a keyed hash of it, the reply language, the last
// route and delivery method, a route waiting for YES, and a rate-limit counter. Never the
// number, a name, or an amount. The number is used only to send the reply, then dropped.
// STOP deletes the row.
//
// Secrets, set by Angad with `supabase secrets set` (never in this repo or the chat):
//   WHATSAPP_VERIFY_TOKEN     the string typed into Meta's webhook setup
//   WHATSAPP_APP_SECRET       Meta app secret, to check X-Hub-Signature-256
//   WHATSAPP_ACCESS_TOKEN     system-user token with whatsapp_business_messaging
//   WHATSAPP_PHONE_NUMBER_ID  the business number's ID in Meta
//   WHATSAPP_HASH_SECRET      a long random string; changing it forgets every number
// Optional: WHATSAPP_GRAPH_VERSION (default below).
//
// Deployed with JWT verification off (supabase/config.toml), because Meta can't send a
// Supabase token; the signature check below is what keeps strangers out.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

import {
  formatCompare,
  formatForgotten,
  formatNotText,
  formatRateLimited,
  formatRequested,
  formatSay,
  formatWhy,
  NEW_STATE,
  parse,
  plan,
  type Action,
  type Language,
  type QuoteRow,
  type State,
} from '../../../packages/bot/src/index.ts';

const GRAPH = `https://graph.facebook.com/${Deno.env.get('WHATSAPP_GRAPH_VERSION') ?? 'v23.0'}`;
/** Messages per number per hour. One reply says so; after that, silence until the hour is up. */
const RATE_LIMIT = 30;
const HOUR_MS = 3600 * 1000;

interface Incoming {
  from: string;
  id: string;
  type: string;
  text?: string;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // Meta's one-time check when the webhook is registered.
  if (req.method === 'GET') {
    const token = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
    const ok =
      !!token &&
      url.searchParams.get('hub.mode') === 'subscribe' &&
      url.searchParams.get('hub.verify_token') === token;
    return ok ? new Response(url.searchParams.get('hub.challenge') ?? '') : new Response('forbidden', { status: 403 });
  }
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  const raw = await req.arrayBuffer();
  if (!(await signedByMeta(raw, req.headers.get('x-hub-signature-256')))) {
    return new Response('bad signature', { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder().decode(raw));
  } catch {
    return new Response('ok');
  }
  for (const message of incoming(body)) {
    try {
      await handle(message);
    } catch (e) {
      // Logged without the number or the text.
      console.error('whatsapp: handling failed', e instanceof Error ? e.message : String(e));
    }
  }
  // 200 once the signature checks out, whatever happened, or Meta redelivers the batch.
  return new Response('ok');
});

async function handle(m: Incoming) {
  const db = service();
  const hash = await keyedHash(m.from);
  const { data: row } = await db.from('whatsapp_users').select('*').eq('phone_hash', hash).maybeSingle();
  // Meta can deliver the same message twice; answer it once.
  if (row?.last_message_id === m.id) return;

  const now = new Date();
  const freshWindow = !row || now.getTime() - new Date(row.window_started_at).getTime() > HOUR_MS;
  const inWindow = freshWindow ? 1 : row.messages_in_window + 1;
  const state: State = row
    ? {
        language: row.language,
        lastRoute: row.last_route,
        lastMethod: row.last_method,
        pendingRequest: row.pending_request,
      }
    : { ...NEW_STATE };

  const save = (s: State) =>
    db.from('whatsapp_users').upsert({
      phone_hash: hash,
      language: s.language,
      last_route: s.lastRoute,
      last_method: s.lastMethod,
      pending_request: s.pendingRequest,
      last_message_id: m.id,
      window_started_at: freshWindow ? now.toISOString() : row.window_started_at,
      messages_in_window: inWindow,
      updated_at: now.toISOString(),
    });

  if (inWindow > RATE_LIMIT) {
    await save(state);
    if (inWindow === RATE_LIMIT + 1) await send(m.from, formatRateLimited(state.language));
    return;
  }

  if (m.type !== 'text' || !m.text) {
    await save(state);
    await send(m.from, formatNotText(state.language));
    return;
  }

  const { action, state: update } = plan(parse(m.text), state);
  if (action.type === 'forget') {
    await db.from('whatsapp_users').delete().eq('phone_hash', hash);
    await send(m.from, formatForgotten(state.language));
    return;
  }
  const next: State = { ...state, ...update };
  const reply = await act(db, action, next.language, hash);
  await save(next);
  await send(m.from, reply);
  await track(db, hash, 'whatsapp_message', {});
}

async function act(db: SupabaseClient, action: Exclude<Action, { type: 'forget' }>, lang: Language, hash: string) {
  switch (action.type) {
    case 'say':
      return formatSay(lang, action.say);
    case 'compare': {
      const rows = await quotes(action.route.id, action.checked, action.method);
      await track(db, hash, 'comparison_run', {
        route: action.route.id,
        checked_amount: action.checked,
        method: action.method,
        quotes: rows.filter((q) => !q.is_promotional).length,
      });
      return formatCompare(lang, { ...action, rows, now: new Date() });
    }
    case 'why': {
      // The $500 example on the last route (the bot keeps no amounts).
      const method = action.method ?? action.route?.deliveryMethods[0] ?? null;
      const rows = action.route && method ? await quotes(action.route.id, 500, method) : [];
      const top = rows.filter((q) => !q.is_promotional).sort((a, b) => b.amount_received - a.amount_received)[0] ?? null;
      return formatWhy(lang, { route: action.route, top });
    }
    case 'request': {
      // A second YES for the same route hits the unique index (23505): already counted.
      await db.from('route_requests').insert({
        send_country: action.from,
        receive_country: action.to,
        source: 'whatsapp',
        install_id: installId(hash),
      });
      await track(db, hash, 'route_requested', { route: `${action.from}-${action.to}`.toLowerCase() });
      return formatRequested(lang, action.to);
    }
  }
}

/** Published prices only: read with the public key, so RLS decides exactly as it does for the app. */
async function quotes(routeId: string, amount: number, method: string): Promise<QuoteRow[]> {
  const pub = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    auth: { persistSession: false },
  });
  const { data } = await pub
    .from('latest_quotes')
    .select(
      'provider_name, send_amount, send_currency, receive_currency, fee, offered_rate, mid_market_rate, pickup_charge, amount_received, total_cost_pct, delivery_time, is_promotional, captured_at',
    )
    .eq('route_id', routeId)
    .eq('send_amount', amount)
    .eq('delivery_method', method);
  return (data ?? []).map((q) => ({
    ...q,
    send_amount: Number(q.send_amount),
    fee: Number(q.fee),
    offered_rate: Number(q.offered_rate),
    mid_market_rate: Number(q.mid_market_rate),
    pickup_charge: Number(q.pickup_charge),
    amount_received: Number(q.amount_received),
    total_cost_pct: Number(q.total_cost_pct),
  })) as QuoteRow[];
}

/** Metrics (D31): WhatsApp is its own channel, keyed by an ID derived from the hash. */
async function track(db: SupabaseClient, hash: string, name: string, props: Record<string, string | number>) {
  await db.from('events').insert({ install_id: installId(hash), name, props, platform: 'whatsapp' });
}

async function send(to: string, text: string) {
  const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
  const phoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  if (!token || !phoneId) {
    console.error('whatsapp: not configured, reply not sent');
    return;
  }
  const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text, preview_url: true } }),
  });
  if (!res.ok) console.error('whatsapp: send failed', res.status);
}

/** The text messages in a webhook delivery; statuses and other events are ignored. */
function incoming(body: unknown): Incoming[] {
  const out: Incoming[] = [];
  const entries = (body as { entry?: unknown[] })?.entry ?? [];
  for (const entry of entries as { changes?: { field?: string; value?: { messages?: unknown[] } }[] }[]) {
    for (const change of entry?.changes ?? []) {
      if (change?.field !== 'messages') continue;
      for (const m of (change.value?.messages ?? []) as {
        from?: unknown;
        id?: unknown;
        type?: unknown;
        text?: { body?: unknown };
      }[]) {
        if (typeof m?.from !== 'string' || typeof m?.id !== 'string') continue;
        const type = String(m.type);
        out.push({
          from: m.from,
          id: m.id,
          type,
          text: type === 'text' && typeof m.text?.body === 'string' ? m.text.body.slice(0, 500) : undefined,
        });
      }
    }
  }
  return out;
}

async function signedByMeta(raw: ArrayBuffer, header: string | null): Promise<boolean> {
  const secret = Deno.env.get('WHATSAPP_APP_SECRET');
  if (!secret || !header?.startsWith('sha256=')) return false;
  const expected = await hmacHex(secret, raw);
  const given = header.slice('sha256='.length);
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

/** Keyed, so a list of every phone number can't be hashed to find someone. */
async function keyedHash(phone: string): Promise<string> {
  const secret = Deno.env.get('WHATSAPP_HASH_SECRET');
  if (!secret) throw new Error('WHATSAPP_HASH_SECRET is not set');
  return hmacHex(secret, new TextEncoder().encode(phone.replace(/\D/g, '')));
}

async function hmacHex(secret: string, data: BufferSource): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, data));
  return Array.from(mac, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** A UUID-shaped ID from the hash, for events and route requests (both key on install_id). */
function installId(hash: string): string {
  const variant = ((parseInt(hash[16], 16) & 0x3) | 0x8).toString(16);
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-${variant}${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function service(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });
}
