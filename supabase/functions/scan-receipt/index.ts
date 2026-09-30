// Reads a scanned receipt (DECISIONS.md D69-D78).
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
//   RECEIPT_MODEL               default claude-opus-5-5 (D76)
//   RECEIPT_MODEL_MONTHLY_CAP   default 300 model calls a month
//
// Called by the app, signed in or not. The publishable key isn't a JWT, so JWT verification
// is off (supabase/config.toml); parseRequest checks everything that arrives, and the
// monthly cap bounds what a flood of requests could spend. Logs never carry the text, the
// image or any value.
import Anthropic from 'npm:@anthropic-ai/sdk@0.129.0';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

import {
  detectPii,
  ModelError,
  parseRequest,
  readReceipt,
  redactPage,
  serializeValue,
  trustedToday,
  type ExtractedField,
  type FieldName,
  type ModelClient,
  type ScanRequest,
  type ScanResponse,
} from '../../../packages/receipt/src/index.ts';
import { ROUTES } from '../../../mobile/src/lib/routes.ts';

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
    return json(await scan(db, parsed.request));
  } catch (e) {
    console.error('scan-receipt: failed', e instanceof Error ? e.name : 'unknown');
    return json({ error: 'failed' }, 500);
  }
});

async function scan(db: SupabaseClient, request: ScanRequest): Promise<ScanResponse> {
  await db.rpc('forget_expired_receipts');

  // The second line of defense (D71): anything the phone let through is hidden here, and
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

  // The redacted image is stored only with research consent (D78).
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

  const rows = (Object.entries(fields) as [FieldName, ExtractedField][]).map(([name, f]) => ({
    receipt_id: id,
    field_name: name,
    value: serializeValue(f.value),
    extraction_path: f.path,
    confidence: Math.round(f.confidence * 1000) / 1000,
    validated: f.validated,
  }));
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

/** The mid-market rate for the day from Frankfurter (D35), or null if it can't be had. */
async function midRate(base: string, quote: string, date: string | undefined): Promise<number | null> {
  try {
    const params = new URLSearchParams({ base, quotes: quote, ...(date ? { date } : {}) });
    const res = await fetch(`https://api.frankfurter.dev/v2/rates?${params}`);
    if (!res.ok) return null;
    const rows = (await res.json()) as { quote: string; rate: number }[];
    const row = Array.isArray(rows) ? rows.find((r) => r.quote === quote) : undefined;
    return row && row.rate > 0 ? row.rate : null;
  } catch {
    return null;
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

function service(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });
}
