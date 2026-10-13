// Remmy, the assistant inside the app (DECISIONS.md D175). The app sends the person's message
// and the conversation so far; this runs the same agent as the WhatsApp bot (D160) on the
// same free models (D163), with the same data tools, plus tools that act in the app. Those
// don't act here: each one adds an action to the reply (open Compare on a route, open a
// screen, start a lesson, save a comparison), and the app carries it out, showing it as a
// card. Every action is checked against mobile/src/lib/remmy-actions.ts on both sides.
//
// Privacy: messages are passed to the model and answered; nothing of them is stored. Metrics
// record which tools ran, never the text.
//
// The harness doesn't depend on the model picking the right tool. A plain request to go
// somewhere ("open user settings", "where's the glossary") is matched against one table of
// screen names (remmy-actions.ts) and opened without a model call at all. Whatever screen
// name the model uses goes through the same table, and if the model answers without acting
// on a clear "take me to ...", the table adds the action anyway.
//
// Limits (D140, D175): 8 messages a minute per install (a burst), 40 a day per install and
// 200 per address, and the shared daily share of Cloudflare's free allowance. Past a limit,
// or when no model answers, the reply is marked `limited` with its reason and, if the message
// was a plain price question ("500 to India") or a screen, it still offers that.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { DEFAULT_ANSWER_MODEL, parse, rankFor, runAgent, type ToolSpec } from '../../../packages/bot/src/index.ts';
import { REMMY_MODES, REMMY_MODULES, REMMY_SCREENS, matchIntent, validAction, type RemmyAction, type RemmyReply } from '../../../mobile/src/lib/remmy-actions.ts';
import { checkedAmountFor, ROUTES, routeFor, type Route } from '../../../mobile/src/lib/routes.ts';
import { countryOf, dataTools, modelChain, quotes, tryModel } from '../_shared/agent.ts';
import { money } from '../../../mobile/src/lib/format.ts';
import { secretKey } from '../_shared/keys.ts';

const PER_MINUTE = 8;
const PER_INSTALL = 40;
const PER_ADDRESS = 200;
const DAY = 86_400;
const MAX_AMOUNT = 10_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ROUTE_IDS = ROUTES.map((r) => r.id);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Turn {
  role: 'user' | 'assistant';
  text: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const body = await req.json().catch(() => ({}));
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 1000) : '';
  const install = typeof body.install_id === 'string' && UUID.test(body.install_id) ? body.install_id : null;
  const platform = body.platform === 'ios' || body.platform === 'android' ? body.platform : null;
  const history: Turn[] = Array.isArray(body.history)
    ? body.history
        .filter((h: unknown): h is Turn => !!h && typeof h === 'object' && ((h as Turn).role === 'user' || (h as Turn).role === 'assistant') && typeof (h as Turn).text === 'string')
        .slice(-16)
    : [];
  if (!message || !install) return json({ error: 'message and install_id required' }, 400);

  const db = service();
  const track = async (name: string, props: Record<string, string | number>) => {
    await db.from('events').insert({ install_id: install, name, props, platform });
  };

  // A burst first: a script or a stuck button can't run through the day's budget in seconds.
  const { data: steady } = await db.rpc('take_hit_for_ip', { p_bucket: 'remmy_minute', p_ip: install, p_max: PER_MINUTE, p_window_seconds: 60 });
  if (steady === false) {
    await track('remmy_limited', { reason: 'slow' });
    return json({ reply: '', actions: [], steps: [], limited: true, reason: 'slow' } satisfies RemmyReply, 200);
  }

  // "Open user settings": no model needed. A price question goes to the model instead, which
  // opens Compare on the route rather than the bare tab.
  const asked = parse(message);
  const intent = asked.kind === 'compare' && asked.to ? null : matchIntent(message);
  const intentAction = intent ? validAction({ type: 'screen', screen: intent.screen, now: intent.now }, ROUTE_IDS) : null;
  if (intentAction) {
    await track('remmy_message', { tools: 'intent', provider: 'none' });
    return json({ reply: '', actions: [intentAction], steps: ['open_screen'] } satisfies RemmyReply, 200);
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const { data: allowed } = await db.rpc('take_hit_for_ip', { p_bucket: 'remmy', p_ip: ip, p_max: PER_ADDRESS, p_window_seconds: DAY });

  // Figures the number check refused, and why turns or providers failed: kept in the failure
  // metric (numbers and error codes only, never text) so a miss can be traced.
  const refused: string[] = [];
  const causes: string[] = [];
  const actions: RemmyAction[] = [];
  const touched: { route?: Route; method?: string } = {};
  const model =
    allowed === false
      ? null
      : await modelChain(db, { bucket: 'remmy', key: install, perKey: PER_INSTALL, label: 'remmy', model: Deno.env.get('WHATSAPP_AI_ANSWER_MODEL') || DEFAULT_ANSWER_MODEL, onProviderFail: (c) => causes.push(c) });
  if (model) {
    const data = dataTools(db, { track, installId: install, source: 'app', touched });
    const tools = [...data, ...actionTools(actions, data.find((t) => t.name === 'get_prices'))];
    const result = await tryModel(
      () =>
        runAgent(model.client, tools, message, {
          language: body.language === 'hi' ? 'hi' : 'en',
          lastCountry: touched.route?.country ?? null,
          channel: 'app',
          history,
          onRefused: (n) => refused.push(...n),
          onFail: (c) => causes.push(c),
        }).catch((e) => {
          // Provider errors ("429", "timeout") name no user text; the first words are enough.
          causes.push(`error ${String(e).slice(0, 60)}`);
          throw e;
        }),
      'remmy',
    );
    if (result) {
      // A longer "take me to the glossary and explain markup" the model answered without acting.
      const backstop = actions.length ? null : matchIntent(message, 40);
      const extra = backstop?.now ? validAction({ type: 'screen', screen: backstop.screen, now: false }, ROUTE_IDS) : null;
      if (extra) actions.push(extra);
      // A price question always gets its Compare card, even if the model only talked.
      if (asked.kind === 'compare' && asked.to && !actions.some((a) => a.type === 'compare' || a.type === 'save')) actions.push(...fallbackActions(message));
      await track('remmy_message', { tools: result.tools.join(',') || 'none', provider: model.names[model.client.used()] ?? 'none' });
      return json({ reply: result.text, actions: await withPrices(dedupe(actions)), steps: result.tools } satisfies RemmyReply, 200);
    }
  }

  // No model answer: still do the obvious thing for a plain price question.
  await track('remmy_limited', { reason: model ? 'failed' : 'limit', ...(refused.length ? { refused: [...new Set(refused)].slice(0, 6).join(' ') } : {}), ...(causes.length ? { causes: causes.join(', ').slice(0, 200) } : {}) });
  return json({ reply: '', actions: await withPrices(fallbackActions(message)), steps: [], limited: true, reason: model ? 'failed' : 'day' } satisfies RemmyReply, 200);
});

/**
 * Tools that act in the app. Each adds an action for the app to carry out and tells the model
 * what the person will see, so the reply can say it in a line.
 */
function actionTools(actions: RemmyAction[], prices?: ToolSpec): ToolSpec[] {
  const add = (a: unknown) => {
    const valid = validAction(a, ROUTE_IDS);
    if (valid) actions.push(valid);
    return valid;
  };
  const routeOf = (country: unknown) => {
    const c = countryOf(country);
    const route = c ? routeFor('US', c.code) : null;
    return { c, route };
  };
  return [
    {
      name: 'open_compare',
      about: "Opens Compare in the app on a route, an amount and a way of receiving, and returns today's prices for it (the same as get_prices). Use it for every price or cost question, instead of get_prices.",
      args: { country: 'name or 2-letter code', amount: 'USD, default 500', method: 'optional: bank_deposit, cash_pickup, mobile_wallet, upi, debit_card, home_delivery', now: 'true only if they asked to go there' },
      run: async (args) => {
        const { c, route } = routeOf(args.country);
        if (!c) return { error: 'Which country? Ask the person.' };
        if (!route) return { country: c.name, covered: false, note: 'Not covered yet. Offer request_route.' };
        const amount = typeof args.amount === 'number' && args.amount > 0 ? Math.min(args.amount, MAX_AMOUNT) : 500;
        const method = route.deliveryMethods.find((d) => d === args.method) ?? route.deliveryMethods[0];
        const done = add({ type: 'compare', routeId: route.id, amount, method, now: args.now === true });
        if (!done) return { error: 'could not open' };
        // The prices come back with the card, so one call gives the model real figures to quote.
        const today = prices ? await prices.run({ country: args.country, amount, method }).catch(() => null) : null;
        return { shown: `Compare is ready for ${amount} USD to ${route.country}`, opened: done.now === true, ...(today ? { prices: today } : {}) };
      },
    },
    {
      name: 'open_screen',
      about: `Opens a screen in the app. ${SCREEN_ABOUT}`,
      args: { screen: Object.keys(REMMY_SCREENS).join('/'), term: 'optional glossary term id, e.g. exchange-rate-markup', now: 'true if they asked to go there' },
      run: async (args) => {
        const done = add({ type: 'screen', screen: args.screen, term: typeof args.term === 'string' ? args.term : undefined, now: args.now === true });
        return done
          ? { shown: `${done.type === 'screen' ? done.screen : ''} is ready`, opened: done.now === true }
          : { error: `No screen called ${String(args.screen)}. Pick one of: ${Object.keys(REMMY_SCREENS).join(', ')}. If none fits, say what the app can't do.` };
      },
    },
    {
      name: 'start_lesson',
      about: 'Starts a Learn lesson on a topic, optionally as a game.',
      args: { module: REMMY_MODULES.join('/'), mode: `optional: ${REMMY_MODES.join('/')}`, now: 'true only if they asked to start it' },
      run: async (args) => {
        const done = add({ type: 'lesson', module: args.module, mode: args.mode, now: args.now === true });
        return done ? { shown: 'The lesson is ready', opened: done.now === true } : { error: 'no such module' };
      },
    },
    {
      name: 'save_comparison',
      about: "Offers to save a route and amount to the person's Saved list; they confirm with one tap.",
      args: { country: 'name or 2-letter code', amount: 'USD', method: 'optional' },
      run: async (args) => {
        const { c, route } = routeOf(args.country);
        if (!route) return { error: c ? 'Not covered yet.' : 'Which country? Ask the person.' };
        const amount = typeof args.amount === 'number' && args.amount > 0 ? Math.min(args.amount, MAX_AMOUNT) : 500;
        const method = route.deliveryMethods.find((d) => d === args.method) ?? route.deliveryMethods[0];
        const done = add({ type: 'save', routeId: route.id, amount, method });
        return done ? { shown: 'A Save button is ready; they tap it to keep it (needs an account).' } : { error: 'could not save' };
      },
    },
  ];
}

/** What each screen is, so the model can map "change my password" or "turn on emails" itself. */
const SCREEN_ABOUT = [
  'compare: prices for a route (prefer open_compare)',
  'scan: the receipt scanner',
  'whatsapp: link WhatsApp, chat with the bot',
  'tools: the list of calculators',
  'learn: lessons and games',
  'saved: saved comparisons',
  'account: settings, name, language, newsletter, sign out, delete account',
  'sign_in: sign in or create an account',
  'glossary: definitions, optionally on one term',
  'routes: the countries covered and requested',
  'request_route: ask for a new country',
  'fair_rate: check if a rate is fair',
  'scam_check: check a message or offer for scam signs',
  'true_cost: work out the real cost of a transfer you made',
  'yearly_cost: what fees add up to in a year',
  'rate_history: how the exchange rate moved',
  'observatory: the market overview',
  'remitbench: the cost benchmark',
  'blog: articles',
  'privacy: the privacy policy',
  'terms: the terms of service',
  'support: help and contact',
].join('; ');

/**
 * Each Compare card carries its top three checked prices, ranked by amount received like
 * Compare, so a price question shows real figures even when the model's text doesn't come
 * through. The app words them in the person's language.
 */
async function withPrices(actions: RemmyAction[]): Promise<RemmyAction[]> {
  return Promise.all(
    actions.map(async (a) => {
      if (a.type !== 'compare') return a;
      const rows = await quotes(a.routeId, checkedAmountFor(a.amount), a.method).catch(() => []);
      const top = rankFor(rows, a.amount).standing.slice(0, 3);
      if (!top.length) return a;
      return {
        ...a,
        top: top.map((q) => ({ provider: q.provider_name, receives: money(q.amount_received, q.receive_currency), pct: Math.round(q.total_cost_pct * 10) / 10 })),
        checkedAt: top.map((q) => q.captured_at).sort()[0],
      };
    }),
  );
}

/** One card per action: the model sometimes calls the same tool twice. */
function dedupe(actions: RemmyAction[]): RemmyAction[] {
  const seen = new Set<string>();
  return actions.filter((a) => {
    const key = JSON.stringify({ ...a, now: undefined });
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Without a model: "500 to India" still opens Compare on it. */
export function fallbackActions(message: string): RemmyAction[] {
  const c = parse(message);
  if (c.kind !== 'compare' || !c.to) {
    const intent = matchIntent(message, 40, true);
    const action = intent ? validAction({ type: 'screen', screen: intent.screen, now: false }, ROUTE_IDS) : null;
    return action ? [action] : [];
  }
  const route = routeFor(c.from ?? 'US', c.to);
  if (!route) return [];
  const action = validAction(
    { type: 'compare', routeId: route.id, amount: Math.min(c.amount ?? 500, MAX_AMOUNT), method: c.method && route.deliveryMethods.includes(c.method) ? c.method : route.deliveryMethods[0] },
    ROUTE_IDS,
  );
  return action ? [action] : [];
}

function service(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, secretKey(), { auth: { persistSession: false } });
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}
