// Reads a scanned receipt (DECISIONS.md D72-D81).
//
// The phone has already run OCR and hidden personal details, on the text and on the
// image. This function:
//   1. checks the request, and runs the same PII detection over the text again; if it
//      finds anything, it hides it in the text and drops the image, which then never
//      goes to the model or into storage;
//   2. reads the receipt with packages/receipt: the rules first, then Claude for what they
//      missed or weren't sure of (within this month's cap), then the checks with the one
//      formula and the day's mid-market rate;
//   3. stores the values, where each came from, and the two consent flags; never the text,
//      and the image only with research consent;
//   4. answers with the values, the checks, and what the person should confirm.
// It also deletes a receipt on request ('forget'), and every receipt past its 30 days.
//
// Secrets, set by Angad with `supabase secrets set` (never in this repo or the chat):
//   ANTHROPIC_API_KEY           the model fallback; without it, the rules alone
// Optional:
//   RECEIPT_MODEL               default claude-opus-5-5 (D79)
//   RECEIPT_MODEL_MONTHLY_CAP   default 300 model calls a month
//
// Called by the app, signed in or not. The publishable key isn't a JWT, so JWT verification
// is off (supabase/config.toml); parseRequest checks everything that arrives, and the
// monthly cap bounds what a flood of requests could spend. Logs never carry the text, the
// image or any value.
import Anthropic from 'npm:@anthropic-ai/sdk@0.129.0';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

import {
  advertisedGap,
  applyCorrection,
  deserializeValue,
  detectPii,
  matchQuote,
  ModelError,
  parseRequest,
  readReceipt,
  redactPage,
  serializeValue,
  taxCheck,
  templateFor,
  trustedToday,
  validateReceipt,
  valuesFrom,
  type Comparison,
  type ConfirmRequest,
  type ConfirmResponse,
  type ExtractedField,
  type ExtractedFields,
  type FieldName,
  type ModelClient,
  type QuoteCandidate,
  type ScanRequest,
  type ScanResponse,
} from '../../../packages/receipt/src/index.ts';
import { checkedAmountFor, ROUTES } from '../../../mobile/src/lib/routes.ts';

const DEFAULT_CAP = 300;
const KEEP_DAYS = 30;
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
  try {
    if (parsed.request.action === 'forget') {
      await forget(db, parsed.request.id);
      return json({ ok: true });
    }
    if (parsed.request.action === 'confirm') {
      const confirmed = await confirm(db, parsed.request);
      return 'error' in confirmed ? json(confirmed, confirmed.status) : json(confirmed);
    }
    return json(await scan(db, parsed.request));
  } catch (e) {
    console.error('scan-receipt: failed', e instanceof Error ? e.name : 'unknown');
    return json({ error: 'failed' }, 500);
  }
});

async function scan(db: SupabaseClient, request: ScanRequest): Promise<ScanResponse> {
  await db.rpc('forget_expired_receipts');

  // The second line of defense (D74): anything the phone let through is hidden here, and
  // then the image, which can't be redacted here, is not used at all.
  const leftovers = detectPii(request.page);
  const page = leftovers.length ? redactPage(request.page, leftovers) : request.page;
  const image = leftovers.length ? undefined : request.image;
  const today = trustedToday(request.today, new Date());

  const key = Deno.env.get('ANTHROPIC_API_KEY');
  const cap = Number(Deno.env.get('RECEIPT_MODEL_MONTHLY_CAP') ?? DEFAULT_CAP);
  const model = key
    ? { client: capped(new Anthropic({ apiKey: key }), db, cap), model: Deno.env.get('RECEIPT_MODEL') || undefined }
    : null;

  const result = await readReceipt({ page, image, today, model, midRate });

  const fields = result.fields;
  const send = fields.send_currency?.value;
  const receive = fields.receive_currency?.value;
  const routeId = ROUTES.find((r) => r.sendCurrency === send && r.receiveCurrency === receive)?.id ?? null;
  const id = crypto.randomUUID();
  const expiresAt = request.research_consent ? null : new Date(Date.now() + KEEP_DAYS * 86_400_000).toISOString();

  // The redacted image is stored only with research consent (D81).
  let imagePath: string | null = null;
  if (request.research_consent && image) {
    const path = `${id}.${image.mediaType === 'image/png' ? 'png' : 'jpg'}`;
    const bytes = Uint8Array.from(atob(image.base64), (c) => c.charCodeAt(0));
    const { error } = await db.storage.from(BUCKET).upload(path, bytes, { contentType: image.mediaType });
    if (!error) imagePath = path;
  }

  const { error: receiptError } = await db.from('receipts').insert({
    id,
    channel: 'app',
    provider_id: result.providerId,
    provider_name: result.providerId ? null : (fields.provider?.value ?? null),
    route_id: routeId,
    redaction_status: leftovers.length ? 'device_rechecked' : 'device',
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
    redaction: leftovers.length ? 'device_rechecked' : 'device',
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
  const { data: receipt } = await db.from('receipts').select('id, expires_at').eq('id', request.id).maybeSingle();
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
  const tax = taxCheck(v, mid?.rate ?? null);

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

async function forget(db: SupabaseClient, id: string) {
  const { data } = await db.from('receipts').select('image_path').eq('id', id).maybeSingle();
  if (data?.image_path) await db.storage.from(BUCKET).remove([data.image_path]);
  await db.from('receipts').delete().eq('id', id);
}

/**
 * The model client, gated by this month's allowance: each real call takes one from
 * receipt_model_calls first, so the cap counts calls made, not receipts scanned.
 */
function capped(client: ModelClient, db: SupabaseClient, cap: number): ModelClient {
  return {
    beta: {
      messages: {
        create: async (params) => {
          const { data, error } = await db.rpc('take_receipt_model_call', { p_cap: cap });
          if (error || data !== true) throw new ModelError('this month’s model calls are used up', 'over_cap');
          return client.beta.messages.create(params);
        },
      },
    },
  };
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
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });
}
