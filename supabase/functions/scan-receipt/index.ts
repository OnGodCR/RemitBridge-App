// Reads a scanned receipt (DECISIONS.md D72-D81).
//
// The phone has already run OCR and hidden personal details, on the text and on the
// image. This function:
//   1. checks the request, and runs the same PII detection over the text again; if it
//      finds anything, it hides it in the text and drops the image, which then never
//      goes to the model or into storage;
//   2. reads the receipt with packages/receipt: the rules first, then the model for what they
//      missed or weren't sure of (within this month's cap), then the checks with the one
//      formula and the day's mid-market rate;
//   3. stores the values, where each came from, and the two consent flags; never the text,
//      and the image only with research consent;
//   4. answers with the values, the checks, and what the person should confirm.
// It also deletes a receipt on request ('forget'), and every receipt past its end: 30 days,
// or 24 months with research consent (D141), image first.
//
// Secrets, set by Angad with `supabase secrets set` (never in this repo or the chat):
//   GROQ_API_KEY                the model fallback, on Groq's free tier; without it, the
//                               rules alone (D98)
// Optional:
//   RECEIPT_MODEL               default qwen/qwen3.8-27b (D98)
//   RECEIPT_REASONING           none (default) or default, the model's thinking
//   RECEIPT_MODEL_MONTHLY_CAP   default 2000 model calls a month
//   RECEIPT_MODEL_DAILY_CAP     default 200 model calls a day (D140)
//   RECEIPT_INTAKE_SECRET       lets the WhatsApp worker send channel 'whatsapp' (D94)
//
// Called by the app, signed in or not. The publishable key isn't a JWT, so JWT verification
// is off (supabase/config.toml); parseRequest checks everything that arrives. What a flood
// of scans could spend is bounded per phone, per account and per network address each day,
// and by the daily and monthly model caps (D140). Logs never carry the text, the image or
// any value.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { secretKey } from '../_shared/keys.ts';
import { clientIp } from '../_shared/client-ip.ts';

import {
  advertisedGap,
  applyCorrection,
  bestOption,
  deserializeValue,
  detectPii,
  matchQuote,
  missingDisclosures,
  ModelError,
  groqClient,
  reasoningFrom,
  parseRequest,
  readReceipt,
  receiptCost,
  redactPage,
  serializeValue,
  taxCheck,
  templateFor,
  trustedToday,
  validateReceipt,
  valuesFrom,
  type BestResult,
  type Comparison,
  type ConfirmRequest,
  type ConfirmResponse,
  type ExtractedField,
  type ExtractedFields,
  type FieldName,
  type ModelClient,
  type PriceCandidate,
  type QuoteCandidate,
  type ScanRequest,
  type ScanResponse,
} from '../../../packages/receipt/src/index.ts';
import { checkedAmountFor, ROUTES } from '../../../mobile/src/lib/routes.ts';

const DEFAULT_CAP = 2000;
const DEFAULT_DAILY_CAP = 200;
/** Per network address, per hour; generous enough for a school or office behind one address. */
const SCANS_PER_HOUR = 30;
const FOLLOWUPS_PER_HOUR = 200;
/**
 * Scans a day (D140). A person checks a transfer or two a month, so ten a day is plenty.
 * The install ID is the phone's own random ID and can be left out, so the address's
 * daily limit and the model's daily cap are what bound someone set on spending.
 */
const SCANS_PER_DAY_PER_PHONE = 10;
const SCANS_PER_DAY_PER_ACCOUNT = 10;
const SCANS_PER_DAY_PER_ADDRESS = 100;
const DAY_SECONDS = 86_400;
const KEEP_DAYS = 30;
/** Research receipts and their redacted images (D81, D141). */
const RESEARCH_MONTHS = 24;
const BUCKET = 'receipt-images';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'not JSON' }, 400);
  }
  const parsed = parseRequest(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400);

  const db = service();
  // Per network address (D135), so one caller can't fill the tables or spend the month's
  // model calls. The WhatsApp function and its worker prove themselves with the intake
  // secret and aren't limited: they share addresses across every WhatsApp user.
  if (!fromWorker(req)) {
    const [bucket, max] = parsed.request.action === 'scan' ? ['scan', SCANS_PER_HOUR] : ['scan_followup', FOLLOWUPS_PER_HOUR];
    const { data: allowed, error: limitError } = await db.rpc('take_hit_for_ip', {
      p_bucket: bucket,
      p_ip: clientIp(req),
      p_max: max,
      p_window_seconds: 3600,
    });
    // The limiter has been live since 2026-10-02, so a limit that can't be checked now
    // refuses rather than lets the scan through (security audit, 2026-10-17).
    if (limitError || allowed !== true) return json({ error: 'too many requests', retry: 'hour' }, 429);
    if (parsed.request.action === 'scan' && !(await underDailyLimits(db, req, parsed.request.install_id))) {
      return json({ error: 'too many requests', retry: 'tomorrow' }, 429);
    }
  }
  try {
    if (parsed.request.action === 'forget') {
      await forget(db, parsed.request.id);
      return json({ ok: true });
    }
    if (parsed.request.action === 'confirm') {
      const confirmed = await confirm(db, parsed.request);
      return 'error' in confirmed ? json(confirmed, confirmed.status) : json(confirmed);
    }
    // A WhatsApp scan comes only from the worker, which holds RECEIPT_INTAKE_SECRET (D94).
    if (parsed.request.channel === 'whatsapp' && !fromWorker(req)) return json({ error: 'forbidden' }, 403);
    return json(await scan(db, parsed.request));
  } catch (e) {
    console.error('scan-receipt: failed', e instanceof Error ? e.name : 'unknown');
    return json({ error: 'failed' }, 500);
  }
});

async function scan(db: SupabaseClient, request: ScanRequest): Promise<ScanResponse> {
  await forgetExpired(db);

  // The second line of defense (D74): anything the phone let through is hidden here, and
  // then the image, which can't be redacted here, is not used at all.
  const leftovers = detectPii(request.page);
  const page = leftovers.length ? redactPage(request.page, leftovers) : request.page;
  const image = leftovers.length ? undefined : request.image;
  const today = trustedToday(request.today, new Date());
  const whatsapp = request.channel === 'whatsapp';
  const redaction: ScanResponse['redaction'] = whatsapp ? 'server' : leftovers.length ? 'device_rechecked' : 'device';

  const key = Deno.env.get('GROQ_API_KEY');
  const cap = Number(Deno.env.get('RECEIPT_MODEL_MONTHLY_CAP') ?? DEFAULT_CAP);
  const dailyCap = Number(Deno.env.get('RECEIPT_MODEL_DAILY_CAP') ?? DEFAULT_DAILY_CAP);
  const model = key ? { client: capped(groqClient(key), db, cap, dailyCap), model: Deno.env.get('RECEIPT_MODEL') || undefined, reasoning: reasoningFrom(Deno.env.get('RECEIPT_REASONING')) } : null;

  const result = await readReceipt({ page, image, today, model, midRate });

  const fields = result.fields;
  const send = fields.send_currency?.value;
  const receive = fields.receive_currency?.value;
  const routeId = ROUTES.find((r) => r.sendCurrency === send && r.receiveCurrency === receive)?.id ?? null;
  const id = crypto.randomUUID();
  const expiresAt = expiry(request.research_consent, new Date()).toISOString();

  // The redacted image is stored only with research consent (D81).
  let imagePath: string | null = null;
  if (request.research_consent && image) {
    const path = `${id}.${image.mediaType === 'image/png' ? 'png' : 'jpg'}`;
    const bytes = Uint8Array.from(atob(image.base64), (c) => c.charCodeAt(0));
    const { error } = await db.storage.from(BUCKET).upload(path, bytes, { contentType: image.mediaType });
    if (!error) imagePath = path;
  }

  // Read from the redacted text and the values the parser and model read, before the
  // person corrects anything: a value typed in wasn't on the receipt (D95).
  const disclosures = missingDisclosures(page, valuesFrom(fields));

  const { error: receiptError } = await db.from('receipts').insert({
    disclosures_missing: disclosures,
    id,
    channel: whatsapp ? 'whatsapp' : 'app',
    provider_id: result.providerId,
    provider_name: result.providerId ? null : (fields.provider?.value ?? null),
    route_id: routeId,
    redaction_status: redaction,
    research_consent: request.research_consent,
    image_retained: imagePath !== null,
    image_path: imagePath,
    expires_at: expiresAt,
  });
  if (receiptError) throw new Error('receipt insert failed');

  const rows = fieldRows(id, fields);
  if (rows.length) {
    const { error } = await db.from('receipt_fields').insert(rows);
    if (error) throw new Error('fields insert failed');
  }

  return {
    id,
    expires_at: expiresAt,
    template_id: result.templateId,
    provider_id: result.providerId,
    route_id: routeId,
    fields,
    checks: result.validation.checks,
    suspect: result.validation.suspect,
    missing: result.validation.missing,
    to_confirm: result.validation.toConfirm,
    model: { asked: result.askedModel, error: result.modelError },
    redaction,
    disclosures_missing: disclosures,
  };
}

/**
 * The person's answers from the confirmation screen (Phase 3). Their values replace what
 * was read and become user_corrected; the receipt is checked again with the day's
 * mid-market rate, compared with the provider's advertised price that day (D82), and the
 * comparison and tax check are stored in receipt_comparisons.
 */
async function confirm(
  db: SupabaseClient,
  request: ConfirmRequest,
): Promise<ConfirmResponse | { error: string; status: number }> {
  const { data: receipt } = await db.from('receipts').select('id, expires_at, disclosures_missing').eq('id', request.id).maybeSingle();
  if (!receipt || (receipt.expires_at && Date.parse(receipt.expires_at) <= Date.now())) return { error: 'not found', status: 404 };
  const today = trustedToday(request.today, new Date());

  // What's stored, then the person's answers on top.
  const { data: rows } = await db.from('receipt_fields').select('*').eq('receipt_id', request.id);
  let fields: ExtractedFields = {};
  for (const r of (rows ?? []) as { field_name: FieldName; value: string; extraction_path: ExtractedField['path']; confidence: number; validated: boolean }[]) {
    const v = deserializeValue(r.field_name, r.value, today);
    if (v.ok) {
      (fields as Record<FieldName, ExtractedField>)[r.field_name] = {
        value: v.value,
        path: r.extraction_path,
        confidence: Number(r.confidence),
        validated: r.validated,
      };
    }
  }
  for (const [name, value] of Object.entries(request.corrections) as [FieldName, unknown][]) {
    const applied = applyCorrection(fields, name, value, today);
    if (!applied.ok) return { error: applied.error, status: 400 };
    fields = applied.fields;
  }

  const v = valuesFrom(fields);
  const mid = v.send_currency && v.receive_currency ? await fetchMid(v.send_currency, v.receive_currency, v.transfer_date) : null;
  const validation = validateReceipt(fields, { midRate: mid?.rate });
  fields = validation.fields;

  const providerId = templateFor(v.provider).providerId;
  const routeId = ROUTES.find((r) => r.sendCurrency === v.send_currency && r.receiveCurrency === v.receive_currency)?.id ?? null;
  const comparison = await compare(db, v, providerId, routeId, mid?.rate ?? null);
  const best = await cheapest(db, v, providerId, routeId, mid?.rate ?? null);
  const tax = taxCheck(v, mid?.rate ?? null);
  const cost = mid ? receiptCost(v, mid.rate) : null;

  await db.from('receipt_fields').delete().eq('receipt_id', request.id);
  const { error } = await db.from('receipt_fields').insert(fieldRows(request.id, fields));
  if (error) throw new Error('fields insert failed');
  await db.from('receipts').update({ provider_id: providerId, provider_name: providerId ? null : (v.provider ?? null), route_id: routeId }).eq('id', request.id);
  await db.from('receipt_comparisons').upsert({
    receipt_id: request.id,
    matched_quote_id: comparison.quote?.id ?? null,
    advertised_rate: comparison.gap?.advertisedRate ?? null,
    receipt_rate: v.exchange_rate ?? null,
    gap_amount: comparison.gap?.gapAmount ?? null,
    gap_currency: comparison.gap?.gapCurrency ?? null,
    tax_expected: tax.expected,
    tax_found: tax.found,
    // For the observatory (D96): the receipt's cost at the day's mid-market rate.
    total_cost_pct: cost ? Math.round(cost.totalCostPct * 100) / 100 : null,
    markup_pct: cost ? Math.round(cost.markupPct * 100) / 100 : null,
  });

  return {
    id: request.id,
    fields,
    checks: validation.checks,
    suspect: validation.suspect,
    missing: validation.missing,
    to_confirm: validation.toConfirm,
    provider_id: providerId,
    route_id: routeId,
    mid,
    comparison,
    best,
    disclosures_missing: (receipt.disclosures_missing ?? []) as ConfirmResponse['disclosures_missing'],
  };
}

/**
 * The cheapest way we had prices for to send the same amount (D119): every provider's
 * published standing quotes for the route and checked amount near the transfer day, and
 * the newest ones in case there are none from then. The choosing is bestOption's.
 */
async function cheapest(
  db: SupabaseClient,
  v: ReturnType<typeof valuesFrom>,
  providerId: string | null,
  routeId: string | null,
  midRate: number | null,
): Promise<BestResult> {
  if (!routeId) return { best: null, reason: 'no_route' };
  if (v.amount_sent === undefined) return { best: null, reason: 'missing_values' };
  const amount = checkedAmountFor(v.amount_sent);
  const columns = 'id, provider_id, route_id, send_amount, delivery_method, payment_method, fee, offered_rate, mid_market_rate, pickup_charge, is_promotional, captured_at';
  let thatDay: PriceCandidate[] = [];
  if (v.transfer_date) {
    const day = Date.parse(`${v.transfer_date}T00:00:00Z`);
    const { data } = await db
      .from('quotes')
      .select(`${columns}, providers(name)`)
      .eq('route_id', routeId)
      .eq('send_amount', amount)
      .eq('validation_status', 'published')
      .gte('captured_at', new Date(day - 86_400_000).toISOString())
      .lte('captured_at', new Date(day + 2 * 86_400_000).toISOString())
      .limit(1000);
    // A many-to-one join arrives as one object; the generated types call it a list.
    type Joined = QuoteCandidate & { providers: { name: string } | { name: string }[] | null };
    thatDay = ((data ?? []) as unknown as Joined[]).map(({ providers, ...q }) => {
      const name = Array.isArray(providers) ? providers[0]?.name : providers?.name;
      return numericQuote({ ...q, provider_name: name ?? q.provider_id });
    });
  }
  const { data: latestRows } = await db
    .from('latest_quotes')
    .select(`${columns}, provider_name, is_stale`)
    .eq('route_id', routeId)
    .eq('send_amount', amount);
  const latest = ((latestRows ?? []) as (PriceCandidate & { is_stale: boolean })[])
    .filter((q) => !q.is_stale)
    .map(({ is_stale: _, ...q }) => numericQuote(q));
  return bestOption(v, { thatDay, latest }, midRate, providerId);
}

function numericQuote(q: PriceCandidate): PriceCandidate {
  return {
    ...q,
    send_amount: Number(q.send_amount),
    fee: Number(q.fee),
    offered_rate: Number(q.offered_rate),
    mid_market_rate: Number(q.mid_market_rate),
    pickup_charge: Number(q.pickup_charge),
  };
}

/** The provider's published price that day for the same route and checked amount (D82). */
async function compare(
  db: SupabaseClient,
  v: ReturnType<typeof valuesFrom>,
  providerId: string | null,
  routeId: string | null,
  midRate: number | null,
): Promise<Comparison> {
  if (!providerId) return { quote: null, gap: null, reason: 'not_tracked' };
  if (!routeId) return { quote: null, gap: null, reason: 'no_route' };
  if (!v.transfer_date || v.amount_sent === undefined || v.exchange_rate === undefined) {
    return { quote: null, gap: null, reason: 'missing_values' };
  }
  const day = Date.parse(`${v.transfer_date}T00:00:00Z`);
  const { data } = await db
    .from('quotes')
    .select('id, provider_id, route_id, send_amount, delivery_method, payment_method, fee, offered_rate, mid_market_rate, pickup_charge, is_promotional, captured_at')
    .eq('provider_id', providerId)
    .eq('route_id', routeId)
    .eq('send_amount', checkedAmountFor(v.amount_sent))
    .eq('validation_status', 'published')
    .gte('captured_at', new Date(day - 86_400_000).toISOString())
    .lte('captured_at', new Date(day + 2 * 86_400_000).toISOString());
  const candidates = ((data ?? []) as QuoteCandidate[]).map((q) => ({
    ...q,
    send_amount: Number(q.send_amount),
    fee: Number(q.fee),
    offered_rate: Number(q.offered_rate),
    mid_market_rate: Number(q.mid_market_rate),
    pickup_charge: Number(q.pickup_charge),
  }));
  const quote = matchQuote(candidates, {
    transferDate: v.transfer_date,
    deliveryMethod: v.delivery_method,
    fundingMethod: v.funding_method,
  });
  if (!quote) return { quote: null, gap: null, reason: 'no_quote' };
  const { id, provider_id, captured_at, offered_rate, send_amount, delivery_method, payment_method } = quote;
  return {
    quote: { id, provider_id, captured_at, offered_rate, send_amount, delivery_method, payment_method },
    gap: advertisedGap(v, quote, midRate),
    reason: null,
  };
}

function fieldRows(id: string, fields: ExtractedFields) {
  return (Object.entries(fields) as [FieldName, ExtractedField][]).map(([name, f]) => ({
    receipt_id: id,
    field_name: name,
    value: serializeValue(f.value),
    extraction_path: f.path,
    confidence: Math.round(f.confidence * 1000) / 1000,
    validated: f.validated,
  }));
}

/** When a receipt sent now is deleted: 30 days, or 24 months with research consent (D141). */
export function expiry(researchConsent: boolean, now: Date): Date {
  const end = new Date(now);
  if (researchConsent) end.setUTCMonth(end.getUTCMonth() + RESEARCH_MONTHS);
  else end.setTime(end.getTime() + KEEP_DAYS * 86_400_000);
  return end;
}

/**
 * Deletes receipts past their end. The database job deletes those without an image on its
 * own; an image can only be deleted through the Storage API, so for those this deletes the
 * image first and the row only once the image is gone, leaving nothing behind (D141).
 */
async function forgetExpired(db: SupabaseClient) {
  const { data } = await db.rpc('expired_receipt_images', { p_limit: 100 });
  for (const r of (data ?? []) as { id: string; image_path: string }[]) {
    const { error } = await db.storage.from(BUCKET).remove([r.image_path]);
    if (!error) await db.from('receipts').delete().eq('id', r.id);
  }
  await db.rpc('forget_expired_receipts');
}

async function forget(db: SupabaseClient, id: string) {
  const { data } = await db.from('receipts').select('image_path').eq('id', id).maybeSingle();
  if (data?.image_path) await db.storage.from(BUCKET).remove([data.image_path]);
  await db.from('receipts').delete().eq('id', id);
}

/**
 * The model client, gated by today's and this month's allowance: each real call takes one
 * from both first, so the caps count calls made, not receipts scanned. Over either cap the
 * receipt is still read, by the rules alone, and the person types what they missed.
 */
function capped(client: ModelClient, db: SupabaseClient, cap: number, dailyCap: number): ModelClient {
  return {
    complete: async (request) => {
      const { data, error } = await db.rpc('take_receipt_model_call', { p_cap: cap, p_daily_cap: dailyCap });
      if (error || data !== true) throw new ModelError('today’s or this month’s model calls are used up', 'over_cap');
      return client.complete(request);
    },
  };
}

/**
 * Today's scans for this phone, this account (when signed in) and this network address
 * (D140). Each counts one hit; a counter that can't be reached blocks, like the hourly limit
 * (security audit, 2026-10-17).
 */
async function underDailyLimits(db: SupabaseClient, req: Request, installId: string | undefined): Promise<boolean> {
  const userId = await signedInUser(db, req);
  const checks: [string, string | null | undefined, number][] = [
    ['scan_day_phone', installId, SCANS_PER_DAY_PER_PHONE],
    ['scan_day_account', userId, SCANS_PER_DAY_PER_ACCOUNT],
    ['scan_day_address', clientIp(req), SCANS_PER_DAY_PER_ADDRESS],
  ];
  for (const [bucket, key, max] of checks) {
    if (!key) continue;
    const { data, error } = await db.rpc('count_hit', { p_bucket: bucket, p_key: key, p_window_seconds: DAY_SECONDS });
    if (error || typeof data !== 'number' || data > max) return false;
  }
  return true;
}

/** The signed-in person's ID from the request's session token, or null when signed out. */
async function signedInUser(db: SupabaseClient, req: Request): Promise<string | null> {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  // Signed out, the app sends the publishable key, which isn't a session token.
  if (!token.startsWith('eyJ')) return null;
  const { data, error } = await db.auth.getUser(token);
  return error ? null : (data.user?.id ?? null);
}

/** The caller's address, as Supabase's gateway passes it on; null if there's none. */
function fromWorker(req: Request): boolean {
  const secret = Deno.env.get('RECEIPT_INTAKE_SECRET');
  const given = req.headers.get('x-intake-secret') ?? '';
  if (!secret || given.length !== secret.length) return false;
  let diff = 0;
  for (let i = 0; i < secret.length; i++) diff |= secret.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

/** The mid-market rate for the day from Frankfurter (D35), with the date it's for, or null. */
async function fetchMid(base: string, quote: string, date: string | undefined): Promise<{ rate: number; date: string; source: string } | null> {
  try {
    const params = new URLSearchParams({ base, quotes: quote, ...(date ? { date } : {}) });
    const res = await fetch(`https://api.frankfurter.dev/v2/rates?${params}`);
    if (!res.ok) return null;
    const rows = (await res.json()) as { quote: string; rate: number; date: string }[];
    const row = Array.isArray(rows) ? rows.find((r) => r.quote === quote) : undefined;
    return row && row.rate > 0 ? { rate: row.rate, date: row.date, source: 'Frankfurter' } : null;
  } catch {
    return null;
  }
}

async function midRate(base: string, quote: string, date: string | undefined): Promise<number | null> {
  return (await fetchMid(base, quote, date))?.rate ?? null;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

function service(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, secretKey(), {
    auth: { persistSession: false },
  });
}
