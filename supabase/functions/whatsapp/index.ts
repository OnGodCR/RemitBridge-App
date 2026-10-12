// The WhatsApp bot's webhook (PRD 5.8, DECISIONS.md D68), on Meta's Cloud API directly.
//
// All the thinking (reading messages, choosing a reply, the wording in English and Hindi)
// is packages/bot, which is tested there. This file does the I/O: check that a delivery
// really came from Meta, look up prices, remember the little the bot may remember, and
// send the reply.
//
// What's kept about a number (PRD 5.8): a keyed hash of it, the reply language, the last
// route and delivery method, a route waiting for YES, and rate-limit counters. Never the
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
// Receipt photos (D80, D94), off until WHATSAPP_RECEIPTS=on and both of these are set:
//   RECEIPT_INTAKE_SECRET     a long random string, also a GitHub Actions secret: the worker
//                             sends it back with each result
//   GITHUB_DISPATCH_TOKEN     starts the worker (it has no schedule)
// A photo is queued in receipt_intake with the number sealed (AES-GCM, key derived from
// WHATSAPP_HASH_SECRET), read by the worker (.github/workflows/receipt-intake.yml), and
// answered here when the worker posts ?intake=done. The number is deleted with the row.
//
// The model (D159, docs/whatsapp-ai-scope.md), off until both of these are set. It's asked
// only about messages the parser can't read, with the text alone (never the number):
//   CLOUDFLARE_ACCOUNT_ID     the Cloudflare account that runs Workers AI
//   CLOUDFLARE_AI_TOKEN       an API token limited to Workers AI
// Optional: WHATSAPP_AI_MODEL (sorts messages) and WHATSAPP_AI_ANSWER_MODEL (writes answers),
// defaults in packages/bot/src/ai.ts; WHATSAPP_AI_DAILY_CAP.
//
// Deployed with JWT verification off (supabase/config.toml), because Meta can't send a
// Supabase token; the signature check below is what keeps strangers out.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { publishableKey, secretKey } from '../_shared/keys.ts';
import { USER_AGENT } from '../_shared/site-config.ts';

import {
  cloudflareClient,
  DEFAULT_ANSWER_MODEL,
  findPlaces,
  MAX_AMOUNT,
  normalize,
  rankFor,
  retrieve,
  runAgent,
  type ToolSpec,
  type AiClient,
  formatCompare,
  formatForgotten,
  formatLinked,
  formatNotText,
  formatDailyLimit,
  formatPhotoLimit,
  formatRateLimited,
  formatRequested,
  formatSaveNote,
  formatSay,
  formatUnlinked,
  formatReceiptAck,
  formatReceiptFailed,
  formatReceiptQuestion,
  formatReceiptResult,
  formatReceiptsOff,
  formatReceiptUnreadable,
  formatWhy,
  MAX_QUESTIONS,
  NEW_STATE,
  parse,
  plan,
  readReceiptReply,
  type Action,
  type Language,
  type QuoteRow,
  type State,
} from '../../../packages/bot/src/index.ts';
import { deserializeValue, FIELD_NAMES, type ConfirmResponse, type FieldName, type ScanResponse } from '../../../packages/receipt/src/index.ts';
import { checkedAmountFor, DELIVERY_LABELS, ROUTES, routeFor, type Route } from '../../../mobile/src/lib/routes.ts';
import { RECEIVING } from '../../../mobile/src/lib/countries.ts';
import { money } from '../../../mobile/src/lib/format.ts';
import { computeTransferCost } from '../../../packages/formula/src/index.ts';

const GRAPH = `https://graph.facebook.com/${Deno.env.get('WHATSAPP_GRAPH_VERSION') ?? 'v23.0'}`;
/** Messages per number per hour. One reply says so; after that, silence until the hour is up. */
const RATE_LIMIT = 30;
const HOUR_MS = 3600 * 1000;
/**
 * Per number per day (D140). Each photo can cost a model call and a worker run, so photos
 * get their own, tighter limit; a refused photo is told so every time (the hourly limit
 * still bounds the replies). Messages over the day's limit get one reply, then silence.
 */
const MESSAGES_PER_DAY = 100;
const PHOTOS_PER_DAY = 10;
/** Agent conversations a day (D160), for one number and for everyone. One conversation is a
 * few model calls, about 100-120 of Cloudflare's 10,000 free daily neurons, so 80 keeps
 * inside the allowance. Past either cap the plain bot answers, as it did before. */
const MODEL_CALLS_PER_NUMBER = 25;
const MODEL_CALLS_PER_DAY = Number(Deno.env.get('WHATSAPP_AI_DAILY_CAP') ?? 80);

const REPO = 'OnGodCR/RemitBridge-App';
const INTAKE_WORKFLOW = 'receipt-intake.yml';

interface Incoming {
  from: string;
  id: string;
  type: string;
  text?: string;
  /** Meta's ID for a photo, when the message is one. */
  mediaId?: string;
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

  // The receipt worker reporting back (D94). Its own secret, not Meta's signature.
  if (url.searchParams.get('intake') === 'done') return intakeDone(req);
  // The "Rate alerts" workflow handing over WhatsApp alerts to send (D139). Same secret.
  if (url.searchParams.get('alerts') === 'send') return sendAlerts(req);

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

  // While a scanned receipt is being checked with the person (D94), its ID and the value
  // being asked about ride along on the row; every save keeps them unless told otherwise.
  let pending: Pending = {
    pending_receipt: row?.pending_receipt ?? null,
    pending_field: row?.pending_field ?? null,
    pending_questions: row?.pending_questions ?? 0,
  };
  const save = (s: State) =>
    db.from('whatsapp_users').upsert({
      ...pending,
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
  const today = await countToday(db, 'wa_message', hash);
  if (today > MESSAGES_PER_DAY) {
    await save(state);
    if (today === MESSAGES_PER_DAY + 1) await send(m.from, formatDailyLimit(state.language));
    return;
  }

  if (m.type === 'image' && m.mediaId) {
    // Off until Angad turns it on, and only with a way to start the worker (no schedule).
    if (Deno.env.get('WHATSAPP_RECEIPTS') !== 'on' || !Deno.env.get('GITHUB_DISPATCH_TOKEN') || !Deno.env.get('RECEIPT_INTAKE_SECRET')) {
      await save(state);
      await send(m.from, formatReceiptsOff(state.language));
      return;
    }
    if ((await countToday(db, 'wa_photo', hash)) > PHOTOS_PER_DAY) {
      await save(state);
      await send(m.from, formatPhotoLimit(state.language));
      return;
    }
    // A new photo ends any checking still open on an older one.
    pending = NO_PENDING;
    await save(state);
    await queuePhoto(db, hash, m.from, m.mediaId, state.language);
    await send(m.from, formatReceiptAck(state.language));
    return;
  }

  if (m.type !== 'text' || !m.text) {
    await save(state);
    await send(m.from, formatNotText(state.language));
    return;
  }

  if (pending.pending_receipt && pending.pending_field) {
    const answered = await answerCheck(pending, m.text, state.language);
    if (answered) {
      pending = answered.pending;
      await save(state);
      await send(m.from, answered.reply);
      return;
    }
    // Not an answer but something the bot understands: drop the check and carry on.
    pending = NO_PENDING;
  }

  const text = m.text;
  const command = parse(text);
  // The agent answers everything (D160), except the few exact commands where a misread
  // would do harm: linking and unlinking an account, deleting what we keep, saving to an
  // account, switching the reply language, and YES to a route the plain bot offered.
  const exact =
    command.kind === 'link' ||
    command.kind === 'unlink' ||
    command.kind === 'forget' ||
    command.kind === 'language' ||
    (command.kind === 'compare' && command.save) ||
    (command.kind === 'yes' && !!state.pendingRequest);
  if (!exact) {
    const model = await modelFor(db, hash, Deno.env.get('WHATSAPP_AI_ANSWER_MODEL') || DEFAULT_ANSWER_MODEL);
    if (model) {
      const touched: { route?: Route; method?: string } = {};
      const lastCountry = state.lastRoute ? (ROUTES.find((r) => r.id === state.lastRoute)?.country ?? null) : null;
      const result = await tryModel(() => runAgent(model, agentTools(db, hash, touched), text, { language: state.language, lastCountry }));
      if (result) {
        const next: State = touched.route ? { ...state, lastRoute: touched.route.id, lastMethod: (touched.method ?? null) as State['lastMethod'] } : state;
        await save(next);
        await send(m.from, result.text);
        await track(db, hash, 'whatsapp_ai', { tools: result.tools.join(',') || 'none' });
        return;
      }
    }
    // No model, over the day's limit, or a reply that failed its checks: the plain bot answers.
  }

  const { action, state: update } = plan(command, state);
  if (action.type === 'forget') {
    await db.from('whatsapp_users').delete().eq('phone_hash', hash);
    await db.from('receipt_intake').delete().eq('phone_hash', hash);
    await send(m.from, formatForgotten(state.language));
    return;
  }
  const next: State = { ...state, ...update };
  const reply = await act(db, action, next.language, hash, row?.user_id ?? null, m.from);
  await save(next);
  await send(m.from, reply);
  await track(db, hash, 'whatsapp_message', {});
}

async function act(
  db: SupabaseClient,
  action: Exclude<Action, { type: 'forget' }>,
  lang: Language,
  hash: string,
  /** The app account this chat is linked to (D138), if any. */
  userId: string | null,
  /** The number, used only to seal it when linking (D139); never stored as it is. */
  phone: string,
) {
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
      const reply = formatCompare(lang, { ...action, rows, now: new Date() });
      if (!action.save) return reply;
      // "SAVE 500 to India": kept in the linked account's saved comparisons, as if saved in
      // the app. The amount goes to the account the person chose, never to the chat's row.
      let saved = false;
      if (userId) {
        const { error } = await db
          .from('saved_comparisons')
          .insert({ user_id: userId, route_id: action.route.id, send_amount: action.amount, delivery_method: action.method });
        saved = !error;
        if (saved) await track(db, hash, 'comparison_saved', { route: action.route.id });
      }
      return `${reply}\n\n${formatSaveNote(lang, saved)}`;
    }
    case 'link': {
      // Only the keyed hash is linked. The number used to be kept sealed with the link so
      // WhatsApp rate alerts could reach the person (D139); alerts are push-only now (D148),
      // so there is nothing to keep it for.
      const { data, error } = await db.rpc('link_whatsapp', { p_code: action.code, p_phone_hash: hash });
      const linked = !error && data === true;
      if (linked) await track(db, hash, 'whatsapp_linked', {});
      return formatLinked(lang, linked);
    }
    case 'unlink': {
      if (userId) await db.from('whatsapp_users').update({ user_id: null, linked_at: null }).eq('phone_hash', hash);
      return formatUnlinked(lang, !!userId);
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
  const pub = createClient(Deno.env.get('SUPABASE_URL')!, publishableKey(), {
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
        image?: { id?: unknown };
      }[]) {
        if (typeof m?.from !== 'string' || typeof m?.id !== 'string') continue;
        const type = String(m.type);
        out.push({
          from: m.from,
          id: m.id,
          type,
          text: type === 'text' && typeof m.text?.body === 'string' ? m.text.body.slice(0, 500) : undefined,
          mediaId: type === 'image' && typeof m.image?.id === 'string' && /^[0-9A-Za-z_-]{1,128}$/.test(m.image.id) ? m.image.id : undefined,
        });
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------
// Receipt photos (D80, D94)
// ---------------------------------------------------------------------------------------

interface Pending {
  pending_receipt: string | null;
  pending_field: FieldName | null;
  pending_questions: number;
}
const NO_PENDING: Pending = { pending_receipt: null, pending_field: null, pending_questions: 0 };

/**
 * The model client, if it's set up and both daily limits have room; each call counts one hit
 * for this number and one for everyone. Null means: answer without it.
 */
async function modelFor(db: SupabaseClient, hash: string, model?: string): Promise<AiClient | null> {
  const account = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
  const token = Deno.env.get('CLOUDFLARE_AI_TOKEN');
  if (!account || !token) return null;
  if ((await countToday(db, 'wa_ai', hash)) > MODEL_CALLS_PER_NUMBER) return null;
  if ((await countToday(db, 'wa_ai_all', 'all')) > MODEL_CALLS_PER_DAY) return null;
  return cloudflareClient(account, token, model ?? (Deno.env.get('WHATSAPP_AI_MODEL') || undefined));
}

/**
 * What the agent can call (D160). Prices come from the same published quotes and the same
 * ranking and formula as Compare; every figure is preformatted so the model copies it
 * rather than doing arithmetic. Writes are the bot's existing ones: a route request and a
 * suggestion. `touched` records the route asked about, kept as the chat's last route.
 */
function agentTools(db: SupabaseClient, hash: string, touched: { route?: Route; method?: string }): ToolSpec[] {
  const countryOf = (v: unknown): { code: string; name: string } | null => {
    if (typeof v !== 'string' || !v.trim()) return null;
    const raw = v.trim();
    const byCode = RECEIVING.find((c) => c.code === raw.toUpperCase());
    if (byCode) return { code: byCode.code, name: byCode.name };
    const { to } = findPlaces(normalize(`to ${raw}`));
    const found = to ? RECEIVING.find((c) => c.code === to) : undefined;
    return found ? { code: found.code, name: found.name } : null;
  };
  const usd = (n: number) => money(n, 'USD');
  const rate = (n: number, cur: string) => `1 USD = ${n.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${cur}`;
  const ago = (iso: string) => {
    const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    return mins < 60 ? `${mins} minutes ago` : mins < 48 * 60 ? `${Math.round(mins / 60)} hours ago` : `${Math.round(mins / 1440)} days ago`;
  };

  return [
    {
      name: 'get_prices',
      about:
        "Today's checked prices to send money from the US to a country, ranked by how much arrives, with each provider's fee, exchange rate, hidden markup and total cost, and the mid-market rate. Use for any question about cost, rates, fees, providers or how much arrives.",
      args: { country: 'country name or 2-letter code', amount: 'US dollars to send (default 500)', method: `optional: ${Object.keys(DELIVERY_LABELS).join(', ')}` },
      run: async (args) => {
        const country = countryOf(args.country);
        if (!country) return { error: 'Which country? Ask the person.' };
        const route = routeFor('US', country.code);
        if (!route) return { country: country.name, covered: false, note: 'We do not check prices to this country yet. Offer to count a request (request_route).' };
        const amount = typeof args.amount === 'number' && args.amount > 0 ? Math.min(args.amount, MAX_AMOUNT) : 500;
        const method = route.deliveryMethods.find((d) => d === args.method) ?? route.deliveryMethods[0];
        touched.route = route;
        touched.method = method;
        const checked = checkedAmountFor(amount);
        const rows = await quotes(route.id, checked, method);
        const { standing, promotions } = rankFor(rows, amount);
        await track(db, hash, 'comparison_run', { route: route.id, checked_amount: checked, method, quotes: standing.length });
        const cur = route.receiveCurrency;
        if (!standing.length) return { country: route.country, covered: true, amount: usd(amount), method: DELIVERY_LABELS[method], providers: [], note: 'No checked prices yet for this amount and way of receiving.' };
        const newest = standing.map((q) => q.captured_at).sort().at(-1)!;
        return {
          country: route.country,
          amount_sent: usd(amount),
          way_of_receiving: DELIVERY_LABELS[method],
          other_ways: route.deliveryMethods.filter((d) => d !== method).map((d) => DELIVERY_LABELS[d]),
          mid_market_rate: rate(standing[0].mid_market_rate, cur),
          checked: ago(newest),
          estimated_from: standing[0].basedOn ? usd(standing[0].basedOn) : null,
          providers: standing.map((q, i) => {
            const c = computeTransferCost({ sent: amount, fee: q.fee, quotedRate: q.offered_rate, midRate: q.mid_market_rate, pickupCharge: q.pickup_charge });
            return {
              rank: i + 1,
              provider: q.provider_name,
              family_receives: money(q.amount_received, cur),
              fee: usd(q.fee),
              their_rate: rate(q.offered_rate, cur),
              hidden_in_rate: usd(Math.max(0, c.markupCost)),
              total_cost: `${usd(c.totalCost)} (${q.total_cost_pct.toFixed(1)}%)`,
              delivery: q.delivery_time ?? 'not stated',
            };
          }),
          first_transfer_offers_not_shown: promotions,
          full_list: 'https://app.remitbridgelabs.org',
        };
      },
    },
    {
      name: 'get_routes',
      about: 'The countries we check prices to from the US, and the ways money can arrive in each.',
      args: {},
      run: async () => ({ countries: ROUTES.map((r) => `${r.country} (${r.deliveryMethods.map((d) => DELIVERY_LABELS[d]).join(', ')})`), count: ROUTES.length }),
    },
    {
      name: 'search_knowledge',
      about: "RemitBridge's own explanations: money-transfer words (glossary), how the app and its tools work, privacy, the blog. Use to explain a term or a feature, or to find a link.",
      args: { query: 'what to look up' },
      run: async (args) => ({ results: retrieve(String(args.query ?? ''), 4).map((e) => ({ title: e.title, text: e.text, link: e.link })) }),
    },
    {
      name: 'request_route',
      about: "Counts the person's request for a country we don't cover yet. Requests decide which countries we add next.",
      args: { country: 'country name or 2-letter code' },
      run: async (args) => {
        const country = countryOf(args.country);
        if (!country) return { error: 'Unknown country.' };
        if (routeFor('US', country.code)) return { country: country.name, already_covered: true };
        // A repeat request from the same chat hits the unique index: already counted.
        await db.from('route_requests').insert({ send_country: 'US', receive_country: country.code, source: 'whatsapp', install_id: installId(hash) });
        await track(db, hash, 'route_requested', { route: `us-${country.code.toLowerCase()}` });
        return { country: country.name, request_counted: true };
      },
    },
    {
      name: 'save_suggestion',
      about: 'Passes an idea, a provider to add, a feature request or a complaint to the RemitBridge team.',
      args: { text: 'the suggestion, in their words' },
      run: async (args) => {
        const text = String(args.text ?? '').trim().slice(0, 1000);
        if (!text) return { error: 'Empty suggestion.' };
        const { error } = await db.from('suggestions').insert({ text, language: 'en', source: 'whatsapp' });
        return error ? { saved: false } : { saved: true };
      },
    },
  ];
}

/** A model call that can't break a reply: any error or timeout is logged and treated as "no answer". */
async function tryModel<T>(call: () => Promise<T | null>): Promise<T | null> {
  try {
    return await call();
  } catch (e) {
    console.warn('whatsapp model call failed:', String(e));
    return null;
  }
}

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Counts one hit for this chat today and returns today's count. 0 if the counter can't be
 * reached (fail open: the model's daily and monthly caps still hold).
 */
async function countToday(db: SupabaseClient, bucket: string, hash: string): Promise<number> {
  const { data, error } = await db.rpc('count_hit', { p_bucket: bucket, p_key: hash, p_window_seconds: 86_400 });
  return !error && typeof data === 'number' ? data : 0;
}

async function queuePhoto(db: SupabaseClient, hash: string, phone: string, mediaId: string, language: Language) {
  await db.rpc('forget_stale_receipt_intake');
  const { error } = await db.from('receipt_intake').insert({
    phone_hash: hash,
    phone_sealed: await seal(phone),
    media_id: mediaId,
    language,
  });
  if (error) throw new Error(`queueing a photo failed: ${error.code ?? 'unknown'}`);
  await dispatchWorker();
}

/** Starts the worker now, when a dispatch token is set; otherwise its schedule picks it up. */
async function dispatchWorker() {
  const token = Deno.env.get('GITHUB_DISPATCH_TOKEN');
  if (!token) return;
  const res = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${INTAKE_WORKFLOW}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': USER_AGENT,
    },
    body: JSON.stringify({ ref: 'main' }),
  });
  if (!res.ok) console.error('whatsapp: worker dispatch failed', res.status);
}

interface IntakeDone {
  job: string;
  outcome: 'read' | 'unreadable' | 'failed';
  scan?: ScanResponse;
  result?: ConfirmResponse;
}

/** The worker's report on one photo: send the answer (or the first question), then forget the number. */
async function intakeDone(req: Request): Promise<Response> {
  const secret = Deno.env.get('RECEIPT_INTAKE_SECRET');
  if (!secret || !sameText(req.headers.get('x-intake-secret') ?? '', secret)) return new Response('forbidden', { status: 403 });
  let body: IntakeDone;
  try {
    body = await req.json();
  } catch {
    return new Response('not JSON', { status: 400 });
  }
  if (typeof body?.job !== 'string' || !['read', 'unreadable', 'failed'].includes(body.outcome)) {
    return new Response('bad report', { status: 400 });
  }
  const db = service();
  const { data: job } = await db.from('receipt_intake').select('*').eq('id', body.job).maybeSingle();
  if (!job) return new Response('no such photo', { status: 404 });
  await db.from('receipt_intake').delete().eq('id', body.job);

  let phone: string;
  try {
    phone = await unseal(job.phone_sealed);
  } catch {
    console.error('whatsapp: a sealed number would not open');
    return new Response('ok');
  }
  const lang = job.language as Language;
  if (body.outcome === 'unreadable') await send(phone, formatReceiptUnreadable(lang));
  else if (body.outcome === 'failed' || !body.scan) await send(phone, formatReceiptFailed(lang));
  else if (body.scan.to_confirm.length) {
    const first = body.scan.to_confirm[0];
    await db
      .from('whatsapp_users')
      .update({ pending_receipt: body.scan.id, pending_field: first, pending_questions: 1 })
      .eq('phone_hash', job.phone_hash);
    await send(phone, formatReceiptQuestion(lang, first, body.scan.fields, true));
  } else if (body.result) await send(phone, formatReceiptResult(lang, body.result, []));
  else await send(phone, formatReceiptFailed(lang));
  return new Response('ok');
}

/**
 * The person's answer to a check (D94): confirm the value through scan-receipt, then ask
 * the next one or send the result. Null when the text isn't an answer, so it's handled as
 * an ordinary message.
 */
async function answerCheck(p: Pending, text: string, lang: Language): Promise<{ reply: string; pending: Pending } | null> {
  const field = p.pending_field!;
  const reply = readReceiptReply(text, field, today());
  const db = service();
  if (reply.kind === 'unclear') {
    if (parse(text).kind !== 'unknown') return null;
    const { data } = await db.rpc('receipt_result', { p_id: p.pending_receipt });
    if (!data) return { reply: formatReceiptFailed(lang), pending: NO_PENDING };
    return { reply: formatReceiptQuestion(lang, field, storedFields(data), false), pending: p };
  }

  let value: unknown = reply.kind === 'value' ? reply.value : undefined;
  if (reply.kind === 'yes') {
    const { data } = await db.rpc('receipt_result', { p_id: p.pending_receipt });
    value = data ? storedFields(data)[field]?.value : undefined;
    // YES to a value that was never read: ask again.
    if (value === undefined) return { reply: formatReceiptQuestion(lang, field, data ? storedFields(data) : {}, false), pending: p };
  }

  const res = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/scan-receipt`, {
    method: 'POST',
    // The intake secret exempts it from scan-receipt's per-address limit (D135): every
    // WhatsApp user's confirmation comes from this function's own address.
    headers: {
      'Content-Type': 'application/json',
      // A publishable key goes in the apikey header; it isn't a token (D137).
      apikey: publishableKey(),
      'x-intake-secret': Deno.env.get('RECEIPT_INTAKE_SECRET') ?? '',
    },
    body: JSON.stringify({ action: 'confirm', id: p.pending_receipt, corrections: { [field]: value }, today: today() }),
  });
  if (!res.ok) return { reply: formatReceiptFailed(lang), pending: NO_PENDING };
  const confirmed = (await res.json()) as ConfirmResponse;
  const next = confirmed.to_confirm.find((f) => f !== field);
  if (next && p.pending_questions < MAX_QUESTIONS) {
    return {
      reply: formatReceiptQuestion(lang, next, confirmed.fields, false),
      pending: { pending_receipt: p.pending_receipt, pending_field: next, pending_questions: p.pending_questions + 1 },
    };
  }
  return { reply: formatReceiptResult(lang, confirmed, confirmed.to_confirm), pending: NO_PENDING };
}

/** receipt_result()'s stored fields (values as text) back as typed fields. */
function storedFields(result: { fields?: Record<string, { value: string; path: string; confidence: number; validated: boolean }> }) {
  const out: Record<string, { value: unknown; path: string; confidence: number; validated: boolean }> = {};
  for (const [k, f] of Object.entries(result.fields ?? {})) {
    if (!(FIELD_NAMES as readonly string[]).includes(k)) continue;
    const v = deserializeValue(k as FieldName, f.value, '9999-12-31');
    if (v.ok) out[k] = { ...f, value: v.value, confidence: Number(f.confidence) };
  }
  return out as unknown as ScanResponse['fields'];
}

// ---------------------------------------------------------------------------------------
// Rate alerts by WhatsApp (D139)
// ---------------------------------------------------------------------------------------

interface AlertToSend {
  id: number;
  user_id: string;
  /** 'en' or 'hi': the template languages; the workflow maps the app's others to English. */
  language: Language;
  /** The template's body values, in order, already worded by the workflow. */
  params: string[];
}

/**
 * Sends the WhatsApp alerts the workflow found due, each to its linked chat's sealed number,
 * through the approved template (WHATSAPP_ALERT_TEMPLATE, default "rate_alert"): a message
 * the person didn't just ask for needs one. Answers which ids went, so only those are
 * stamped. The numbers are opened here and nowhere else, and never logged.
 */
async function sendAlerts(req: Request): Promise<Response> {
  const secret = Deno.env.get('RECEIPT_INTAKE_SECRET');
  if (!secret || !sameText(req.headers.get('x-intake-secret') ?? '', secret)) return new Response('forbidden', { status: 403 });
  let body: { alerts?: AlertToSend[] };
  try {
    body = await req.json();
  } catch {
    return new Response('not JSON', { status: 400 });
  }
  const alerts = Array.isArray(body.alerts) ? body.alerts.slice(0, 500) : [];
  const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
  const phoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  if (!token || !phoneId) return Response.json({ sent: [], failed: alerts.map((a) => a.id) });
  const template = Deno.env.get('WHATSAPP_ALERT_TEMPLATE') || 'rate_alert';

  const db = service();
  const sent: number[] = [];
  const failed: number[] = [];
  for (const a of alerts) {
    if (typeof a?.id !== 'number' || typeof a.user_id !== 'string' || !Array.isArray(a.params)) continue;
    const { data: row } = await db.from('whatsapp_users').select('number_sealed').eq('user_id', a.user_id).maybeSingle();
    if (!row?.number_sealed) {
      failed.push(a.id);
      continue;
    }
    let to: string;
    try {
      to = await unseal(row.number_sealed, LINKED_NUMBER);
    } catch {
      console.error('whatsapp: a linked number would not open');
      failed.push(a.id);
      continue;
    }
    const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: template,
          language: { code: a.language === 'hi' ? 'hi' : 'en_US' },
          components: [{ type: 'body', parameters: a.params.slice(0, 10).map((p) => ({ type: 'text', text: String(p).slice(0, 200) })) }],
        },
      }),
    });
    if (res.ok) sent.push(a.id);
    else {
      console.error('whatsapp: alert send failed', res.status);
      failed.push(a.id);
    }
  }
  return Response.json({ sent, failed });
}

/**
 * AES-GCM with a key derived from WHATSAPP_HASH_SECRET: base64(iv || ciphertext). Each use has
 * its own label, so its own key: the photo queue's numbers (an hour at most) and a linked
 * chat's number for alerts (D139) can't be opened with each other's key.
 */
const PHOTO_QUEUE = 'receipt-intake-seal';
const LINKED_NUMBER = 'linked-number-seal';

async function sealKey(label: string): Promise<CryptoKey> {
  const secret = Deno.env.get('WHATSAPP_HASH_SECRET');
  if (!secret) throw new Error('WHATSAPP_HASH_SECRET is not set');
  const raw = await hmacBytes(secret, new TextEncoder().encode(label));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function seal(phone: string, label = PHOTO_QUEUE): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await sealKey(label), new TextEncoder().encode(phone)));
  const all = new Uint8Array(iv.length + ct.length);
  all.set(iv);
  all.set(ct, iv.length);
  return btoa(String.fromCharCode(...all));
}

async function unseal(sealed: string, label = PHOTO_QUEUE): Promise<string> {
  const all = Uint8Array.from(atob(sealed), (c) => c.charCodeAt(0));
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: all.slice(0, 12) }, await sealKey(label), all.slice(12));
  return new TextDecoder().decode(pt);
}

function sameText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
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

async function hmacBytes(secret: string, data: BufferSource): Promise<Uint8Array<ArrayBuffer>> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, data));
}

async function hmacHex(secret: string, data: BufferSource): Promise<string> {
  return Array.from(await hmacBytes(secret, data), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** A UUID-shaped ID from the hash, for events and route requests (both key on install_id). */
function installId(hash: string): string {
  const variant = ((parseInt(hash[16], 16) & 0x3) | 0x8).toString(16);
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-${variant}${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function service(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, secretKey(), {
    auth: { persistSession: false },
  });
}
