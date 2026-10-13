// What the WhatsApp bot and Remmy, the in-app assistant, share (D160, D163, D175): published
// prices read as the app reads them, the tools the agent calls for data, the chain of free
// models with its daily limits, and the guard that turns any model failure into "no answer".
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import {
  chainClient,
  cloudflareClient,
  findPlaces,
  groqChatClient,
  MAX_AMOUNT,
  normalize,
  rankFor,
  retrieve,
  type AiClient,
  type QuoteRow,
  type ToolSpec,
} from '../../../packages/bot/src/index.ts';
import { RECEIVING } from '../../../mobile/src/lib/countries.ts';
import { money } from '../../../mobile/src/lib/format.ts';
import { checkedAmountFor, DELIVERY_LABELS, ROUTES, routeFor, type Route } from '../../../mobile/src/lib/routes.ts';
import { computeTransferCost } from '../../../packages/formula/src/index.ts';
import { publishableKey } from './keys.ts';

/** Cloudflare takes the first 80 assistant conversations a day; then Groq's free models (D163). */
const CLOUDFLARE_PER_DAY = Number(Deno.env.get('WHATSAPP_AI_DAILY_CAP') ?? 80);
const GROQ_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

/** A receiving country from a name, an alias or a code, as the model wrote it. */
export function countryOf(v: unknown): { code: string; name: string } | null {
  if (typeof v !== 'string' || !v.trim()) return null;
  const raw = v.trim();
  const byCode = RECEIVING.find((c) => c.code === raw.toUpperCase());
  if (byCode) return { code: byCode.code, name: byCode.name };
  const { to } = findPlaces(normalize(`to ${raw}`));
  const found = to ? RECEIVING.find((c) => c.code === to) : undefined;
  return found ? { code: found.code, name: found.name } : null;
}

/** What a data tool needs from the channel calling it. */
export interface ToolHooks {
  track: (name: string, props: Record<string, string | number>) => Promise<void>;
  /** For route requests: the WhatsApp chat's derived ID, or the app's install ID. */
  installId: string;
  source: 'whatsapp' | 'app';
  /** The route asked about, kept as the conversation's last route. */
  touched: { route?: Route; method?: string };
}

/** Published prices only: read with the public key, so RLS decides exactly as it does for the app. */
export async function quotes(routeId: string, amount: number, method: string): Promise<QuoteRow[]> {
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


/**
 * A model client if one is set up and this key (a WhatsApp number's hash, an app install) has
 * room today; each call counts one hit for the key. Null means: answer without a model.
 */
export async function modelChain(
  db: SupabaseClient,
  opts: { bucket: string; key: string; perKey: number; label: string; model?: string; onProviderFail?: (cause: string) => void },
) {
  const providers = await providersFor(db, opts.model ?? (Deno.env.get('WHATSAPP_AI_MODEL') || undefined));
  if (!providers.length) return null;
  if ((await countToday(db, opts.bucket, opts.key)) > opts.perKey) return null;
  const client = chainClient(
    providers.map((p) => p.client),
    (i, e) => {
      console.warn(`${opts.label} model ${providers[i].name} failed:`, String(e));
      opts.onProviderFail?.(`${providers[i].name}: ${String(e).replace(/^Error: /, '').slice(0, 60)}`);
    },
  );
  return { client, names: providers.map((p) => p.name) };
}

/** The providers to try, in order (D163). Cloudflare only while its daily share has room. */
async function providersFor(db: SupabaseClient, cloudflareModel?: string): Promise<{ name: string; client: AiClient }[]> {
  const list: { name: string; client: AiClient }[] = [];
  const account = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
  const token = Deno.env.get('CLOUDFLARE_AI_TOKEN');
  // One daily share for every assistant (WhatsApp and Remmy), under the free 10,000 neurons.
  if (account && token && (await countToday(db, 'wa_ai_all', 'all')) <= CLOUDFLARE_PER_DAY) {
    list.push({ name: 'cloudflare', client: cloudflareClient(account, token, cloudflareModel) });
  }
  const groq = Deno.env.get('GROQ_API_KEY');
  if (groq) for (const m of GROQ_MODELS) list.push({ name: m, client: groqChatClient(groq, m) });
  return list;
}

/**
 * What the agent can call (D160). Prices come from the same published quotes and the same
 * ranking and formula as Compare; every figure is preformatted so the model copies it
 * rather than doing arithmetic. Writes are the bot's existing ones: a route request and a
 * suggestion. `touched` records the route asked about, kept as the chat's last route.
 */
export function dataTools(db: SupabaseClient, hooks: ToolHooks): ToolSpec[] {
  const { touched } = hooks;
  const usd = (n: number) => money(n, 'USD');
  const rate = (n: number, cur: string) => `1 USD = ${n.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${cur}`;
  const ago = (iso: string) => {
    const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    return mins < 60 ? `${mins} minutes ago` : mins < 48 * 60 ? `${Math.round(mins / 60)} hours ago` : `${Math.round(mins / 1440)} days ago`;
  };

  return [
    {
      name: 'get_prices',
      about: "Today's checked prices from the US, most received first: each provider's fee, rate, cost hidden in the rate, total cost; plus the mid-market rate. For any cost, rate, fee or provider question.",
      args: { country: 'name or 2-letter code', amount: 'USD, default 500', method: `optional, ${Object.keys(DELIVERY_LABELS).join('/')}` },
      run: async (args) => {
        const country = countryOf(args.country);
        if (!country) return { error: 'Which country? Ask the person.' };
        const route = routeFor('US', country.code);
        if (!route) return { country: country.name, covered: false, note: 'Not covered yet. Offer request_route.' };
        const amount = typeof args.amount === 'number' && args.amount > 0 ? Math.min(args.amount, MAX_AMOUNT) : 500;
        const method = route.deliveryMethods.find((d) => d === args.method) ?? route.deliveryMethods[0];
        touched.route = route;
        touched.method = method;
        const checked = checkedAmountFor(amount);
        const rows = await quotes(route.id, checked, method);
        const { standing, promotions } = rankFor(rows, amount);
        await hooks.track('comparison_run', { route: route.id, checked_amount: checked, method, quotes: standing.length });
        const cur = route.receiveCurrency;
        if (!standing.length) return { country: route.country, amount: usd(amount), method: DELIVERY_LABELS[method], providers: [], note: 'No checked prices yet.' };
        const newest = standing.map((q) => q.captured_at).sort().at(-1)!;
        // One line per provider: far fewer tokens than repeating JSON keys (D163).
        const others = route.deliveryMethods.filter((d) => d !== method).map((d) => DELIVERY_LABELS[d]);
        return {
          sent: `${usd(amount)} to ${route.country}, ${DELIVERY_LABELS[method]}`,
          ...(others.length ? { other_ways: others.join(', ') } : {}),
          mid_market: rate(standing[0].mid_market_rate, cur),
          checked: ago(newest),
          ...(standing[0].basedOn ? { estimated_from: usd(standing[0].basedOn) } : {}),
          providers: standing.map((q) => {
            const c = computeTransferCost({ sent: amount, fee: q.fee, quotedRate: q.offered_rate, midRate: q.mid_market_rate, pickupCharge: q.pickup_charge });
            return `${q.provider_name}: receives ${money(q.amount_received, cur)}; fee ${usd(q.fee)}; rate ${q.offered_rate.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${cur} per USD; hidden in rate ${usd(Math.max(0, c.markupCost))}; total ${usd(c.totalCost)} (${q.total_cost_pct.toFixed(1)}%)${q.delivery_time ? `; ${q.delivery_time}` : ''}`;
          }),
          ...(promotions ? { first_transfer_offers_not_shown: promotions } : {}),
          all: 'https://app.remitbridgelabs.org',
        };
      },
    },
    {
      name: 'get_routes',
      about: 'The countries we cover from the US, and how money can arrive in each.',
      args: {},
      run: async () => ({ countries: ROUTES.map((r) => `${r.country} (${r.deliveryMethods.map((d) => DELIVERY_LABELS[d]).join(', ')})`), count: ROUTES.length }),
    },
    {
      name: 'search_knowledge',
      about: 'Our notes: money-transfer terms, how the app and tools work, privacy, the blog. To explain something or find a link.',
      args: { query: 'what to look up' },
      run: async (args) => ({ results: retrieve(String(args.query ?? ''), 3).map((e) => `${e.title}: ${e.text}${e.link ? ` ${e.link}` : ''}`) }),
    },
    {
      name: 'request_route',
      about: "Counts a request for a country we don't cover; requests decide what we add next.",
      args: { country: 'name or 2-letter code' },
      run: async (args) => {
        const country = countryOf(args.country);
        if (!country) return { error: 'Unknown country.' };
        if (routeFor('US', country.code)) return { country: country.name, already_covered: true };
        // A repeat request from the same chat hits the unique index: already counted.
        await db.from('route_requests').insert({ send_country: 'US', receive_country: country.code, source: hooks.source, install_id: hooks.installId });
        await hooks.track('route_requested', { route: `us-${country.code.toLowerCase()}` });
        return { country: country.name, request_counted: true };
      },
    },
    {
      name: 'save_suggestion',
      about: 'Passes an idea, provider, feature request or complaint to the team.',
      args: { text: 'the suggestion, in their words' },
      run: async (args) => {
        const text = String(args.text ?? '').trim().slice(0, 1000);
        if (!text) return { error: 'Empty suggestion.' };
        const { error } = await db.from('suggestions').insert({ text, language: 'en', source: hooks.source });
        return error ? { saved: false } : { saved: true };
      },
    },
  ];
}


/** A model call that can't break a reply: any error or timeout is logged and treated as "no answer". */
export async function tryModel<T>(call: () => Promise<T | null>, label = 'assistant'): Promise<T | null> {
  try {
    return await call();
  } catch (e) {
    console.warn(`${label} model call failed:`, String(e));
    return null;
  }
}


/** Counts one hit for `key` in `bucket` today and returns today's total so far. */
export async function countToday(db: SupabaseClient, bucket: string, key: string): Promise<number> {
  const { data, error } = await db.rpc('count_hit', { p_bucket: bucket, p_key: key, p_window_seconds: 86_400 });
  return !error && typeof data === 'number' ? data : 0;
}

