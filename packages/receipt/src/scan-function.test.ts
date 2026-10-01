/**
 * The scan-receipt Edge Function itself (supabase/functions/scan-receipt), run under
 * vitest: Deno's globals stubbed, supabase-js swapped for an in-memory fake
 * (vitest.config.ts), and fetch stubbed to answer for Frankfurter and Groq. Checks what the package tests
 * can't: the server's second redaction, what's stored and what isn't, consent, the monthly
 * cap, and forgetting.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ConfirmResponse, ScanResponse } from './api.ts'
import { loadFixtures } from './node/fixtures.ts'
import { detectPii, redactPage } from './redact.ts'
import { GROQ_URL, type ChatRequest } from './model.ts'
import { answer, chatReply } from './test/fake-model.ts'
import { reset, rpcs, storage, tables } from './test/fake-supabase.ts'

const env: Record<string, string | undefined> = {}
let handler: (req: Request) => Promise<Response>
const fx: string[] = []
/** What Groq was sent, the replies it gives, and the keys it was called with. */
const requests: ChatRequest[] = []
const replies: string[] = []
const keys: string[] = []

const wu = loadFixtures().find((f) => f.id === 'western-union-cash-usd-mxn')!
const redacted = redactPage(wu.page, detectPii(wu.page))
const IMAGE = { mediaType: 'image/jpeg', base64: btoa('not really a jpeg') }
const TODAY = new Date().toISOString().slice(0, 10)

/** The model reads every field of the Western Union receipt correctly. */
const goodAnswer = () =>
  answer(Object.fromEntries(Object.entries(wu.expected).map(([k, v]) => [k, [v, 0.9, null]])) as Record<string, [unknown]>)

beforeAll(async () => {
  vi.stubGlobal('Deno', {
    env: { get: (k: string) => env[k] },
    serve: (h: typeof handler) => {
      handler = h
    },
  })
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    if (String(url) === GROQ_URL) {
      requests.push(JSON.parse(String(init?.body)) as ChatRequest)
      keys.push(String((init?.headers as Record<string, string>).Authorization).replace('Bearer ', ''))
      const text = replies.shift()
      if (text === undefined) return new Response('{"error":{"message":"no reply scripted"}}', { status: 500 })
      return new Response(JSON.stringify(chatReply({ text })), { status: 200 })
    }
    fx.push(String(url))
    return new Response(JSON.stringify([{ date: '2026-09-28', base: 'USD', quote: 'MXN', rate: 17.7 }]), { status: 200 })
  })
  await import('../../../supabase/functions/scan-receipt/index.ts')
})

afterAll(() => vi.unstubAllGlobals())

beforeEach(() => {
  reset()
  requests.length = 0
  replies.length = 0
  keys.length = 0
  fx.length = 0
  Object.assign(env, {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-key',
    GROQ_API_KEY: 'test-key',
    RECEIPT_INTAKE_SECRET: 'intake-secret',
    RECEIPT_MODEL: undefined,
    RECEIPT_MODEL_MONTHLY_CAP: undefined,
  })
})

const call = (body: unknown, method = 'POST') =>
  handler(new Request('https://example.supabase.co/functions/v1/scan-receipt', { method, body: method === 'POST' ? JSON.stringify(body) : undefined }))

const scan = async (over: Record<string, unknown> = {}) => {
  const res = await call({ action: 'scan', page: redacted, research_consent: false, today: TODAY, ...over })
  return { status: res.status, body: (await res.json()) as ScanResponse }
}

describe('requests', () => {
  it('refuses anything but a well-formed POST', async () => {
    expect((await call(null, 'GET')).status).toBe(405)
    expect((await handler(new Request('https://x/f', { method: 'POST', body: '{' }))).status).toBe(400)
    expect((await call({ action: 'scan', page: redacted, today: TODAY })).status).toBe(400)
    expect((await call({ action: 'scan', page: { width: 1, height: 1, lines: [{ words: [{ text: 'x' }] }] }, research_consent: false, today: TODAY })).status).toBe(400)
    expect((await call({ action: 'forget', id: 'not-a-uuid' })).status).toBe(400)
    expect((await call({ action: 'scan', page: redacted, research_consent: false, today: TODAY, image: { mediaType: 'image/gif', base64: 'AA==' } })).status).toBe(400)
  })
})

describe('a scan', () => {
  it('reads with the model, checks with the formula and the day’s mid-market rate, and stores the values', async () => {
    replies.push(goodAnswer())
    const { status, body } = await scan()
    expect(status).toBe(200)
    expect(body.provider_id).toBe('western-union')
    expect(body.route_id).toBe('us-mx')
    expect(body.fields.amount_received).toMatchObject({ value: 8560, path: 'model', validated: true })
    expect(body.checks.every((c) => c.ok)).toBe(true)
    expect(body.suspect).toBeNull()
    expect(body.redaction).toBe('device')
    expect(fx[0]).toContain('base=USD')
    expect(fx[0]).toContain('quotes=MXN')
    expect(fx[0]).toContain('date=2026-09-28')

    const [receipt] = tables.receipts
    expect(receipt).toMatchObject({ id: body.id, channel: 'app', provider_id: 'western-union', provider_name: null, route_id: 'us-mx', redaction_status: 'device', research_consent: false, image_retained: false, image_path: null })
    const days = (Date.parse(String(receipt.expires_at)) - Date.now()) / 86_400_000
    expect(days).toBeGreaterThan(29.9)
    expect(tables.receipt_fields).toHaveLength(Object.keys(wu.expected).length)
    expect(tables.receipt_fields.find((f) => f.field_name === 'exchange_rate')).toMatchObject({ value: '17.2', extraction_path: 'model', validated: true })
    expect(keys).toEqual(['test-key'])
  })

  it('sends the model the redacted photo and text, and nothing personal', async () => {
    replies.push(goodAnswer())
    await scan({ image: IMAGE })
    const sent = JSON.stringify(requests[0])
    expect(sent).toContain(IMAGE.base64)
    for (const p of wu.pii) expect(sent).not.toContain(p)
  })

  it('stores nothing personal', async () => {
    replies.push(goodAnswer())
    await scan({ image: IMAGE })
    const stored = JSON.stringify(tables)
    for (const p of wu.pii) expect(stored).not.toContain(p)
    expect(stored).not.toContain('Transfer Amount')
    expect(storage).toEqual([])
  })

  it('reads with the rules alone when no key is set', async () => {
    env.GROQ_API_KEY = undefined
    const { body } = await scan()
    expect(requests).toHaveLength(0)
    expect(body.model).toEqual({ asked: [], error: null })
    expect(body.to_confirm).toContain('amount_sent')
    expect(tables.receipts).toHaveLength(1)
  })

  it('uses RECEIPT_MODEL when set', async () => {
    env.RECEIPT_MODEL = 'openai/gpt-oss-120b'
    replies.push(goodAnswer())
    await scan()
    expect(requests[0].model).toBe('openai/gpt-oss-120b')
  })

  it('asks Groq’s Qwen for a strict schema, with its thinking off', async () => {
    replies.push(goodAnswer())
    await scan()
    expect(requests[0].model).toBe('qwen/qwen3.8-27b')
    expect(requests[0].reasoning_effort).toBe('none')
    expect(requests[0].response_format.json_schema.strict).toBe(true)
  })

  it('reads with the rules alone when Groq fails', async () => {
    const { status, body } = await scan()
    expect(status).toBe(200)
    expect(body.model.error).toBe('unavailable')
    expect(tables.receipts).toHaveLength(1)
  })
})

describe('the server’s second redaction', () => {
  it('hides what the phone missed, and then doesn’t use or keep the image', async () => {
    replies.push(goodAnswer())
    const { body } = await scan({ page: wu.page, image: IMAGE, research_consent: true })
    expect(body.redaction).toBe('device_rechecked')
    const sent = JSON.stringify(requests[0])
    expect(sent).not.toContain(IMAGE.base64)
    for (const p of wu.pii) expect(sent).not.toContain(p)
    expect(tables.receipts[0]).toMatchObject({ redaction_status: 'device_rechecked', image_retained: false })
    expect(storage).toEqual([])
  })
})

describe('scans from the WhatsApp worker', () => {
  const fromWorker = (secret?: string) =>
    handler(
      new Request('https://example.supabase.co/functions/v1/scan-receipt', {
        method: 'POST',
        headers: secret ? { 'x-intake-secret': secret } : {},
        body: JSON.stringify({ action: 'scan', page: redacted, research_consent: false, today: TODAY, channel: 'whatsapp' }),
      }),
    )

  it('are refused without the worker’s secret', async () => {
    expect((await fromWorker()).status).toBe(403)
    expect((await fromWorker('wrong-secret!')).status).toBe(403)
    env.RECEIPT_INTAKE_SECRET = undefined
    expect((await fromWorker('intake-secret')).status).toBe(403)
    expect(tables.receipts ?? []).toHaveLength(0)
  })

  it('are stored as WhatsApp receipts, redacted on the server', async () => {
    replies.push(goodAnswer())
    const res = await fromWorker('intake-secret')
    const body = (await res.json()) as ScanResponse
    expect(res.status).toBe(200)
    expect(body.redaction).toBe('server')
    expect(tables.receipts[0]).toMatchObject({ channel: 'whatsapp', redaction_status: 'server', image_retained: false })
  })
})

describe('research consent', () => {
  it('keeps the receipt and its redacted image, with no expiry', async () => {
    replies.push(goodAnswer())
    const { body } = await scan({ image: IMAGE, research_consent: true })
    expect(body.expires_at).toBeNull()
    expect(storage).toEqual([{ bucket: 'receipt-images', path: `${body.id}.jpg`, bytes: 17, contentType: 'image/jpeg' }])
    expect(tables.receipts[0]).toMatchObject({ research_consent: true, image_retained: true, image_path: `${body.id}.jpg`, expires_at: null })
  })

  it('without it, the image is used for the model and never stored', async () => {
    replies.push(goodAnswer())
    await scan({ image: IMAGE })
    expect(JSON.stringify(requests[0])).toContain(IMAGE.base64)
    expect(storage).toEqual([])
  })
})

describe('the monthly cap', () => {
  it('counts calls made, and past the cap reads with the rules alone', async () => {
    env.RECEIPT_MODEL_MONTHLY_CAP = '1'
    replies.push(goodAnswer())
    await scan()
    const second = await scan()
    expect(requests).toHaveLength(1)
    expect(second.body.model.error).toBe('over_cap')
    expect(rpcs.filter((r) => r.name === 'take_receipt_model_call')).toHaveLength(2)
  })
})

describe('forgetting', () => {
  it('deletes a receipt, its fields and its image on request', async () => {
    replies.push(goodAnswer())
    const { body } = await scan({ image: IMAGE, research_consent: true })
    const res = await call({ action: 'forget', id: body.id })
    expect(res.status).toBe(200)
    expect(tables.receipts).toEqual([])
    expect(tables.receipt_fields).toEqual([])
    expect(storage).toEqual([])
  })

  it('deletes receipts past their 30 days on every scan', async () => {
    tables.receipts = [{ id: 'old', expires_at: new Date(Date.now() - 1000).toISOString() }]
    replies.push(goodAnswer())
    await scan()
    expect(tables.receipts.map((r) => r.id)).not.toContain('old')
    expect(rpcs[0].name).toBe('forget_expired_receipts')
  })
})

describe('confirming', () => {
  const publishedQuote = (over: Record<string, unknown> = {}) => ({
    id: 77,
    provider_id: 'western-union',
    route_id: 'us-mx',
    send_amount: 500,
    delivery_method: 'cash_pickup',
    payment_method: 'cash',
    fee: '4.99',
    offered_rate: '17.3',
    mid_market_rate: '17.7',
    pickup_charge: '0',
    is_promotional: false,
    validation_status: 'published',
    captured_at: '2026-09-28T15:00:00.000Z',
    ...over,
  })

  const confirmCall = async (id: string, corrections: Record<string, unknown>) => {
    const res = await call({ action: 'confirm', id, corrections, today: TODAY })
    return { status: res.status, body: (await res.json()) as ConfirmResponse & { error?: string } }
  }

  it('applies the person’s answers, checks again, and compares with the advertised price that day', async () => {
    // The model misread the amount received; the person fixes it.
    replies.push(answer(Object.fromEntries(Object.entries({ ...wu.expected, amount_received: 8650 }).map(([k, v]) => [k, [v, 0.9, null]])) as Record<string, [unknown]>))
    const { body: scanned } = await scan()
    expect(scanned.suspect?.field).toBe('amount_received')
    tables.quotes = [publishedQuote(), publishedQuote({ id: 78, validation_status: 'quarantined', offered_rate: '16' })]

    const { status, body } = await confirmCall(scanned.id, { amount_received: 8560 })
    expect(status).toBe(200)
    expect(body.fields.amount_received).toMatchObject({ value: 8560, path: 'user_corrected', validated: true })
    expect(body.suspect).toBeNull()
    expect(body.mid).toEqual({ rate: 17.7, date: '2026-09-28', source: 'Frankfurter' })
    expect(body.comparison.quote?.id).toBe(77)
    expect(body.comparison.gap).toEqual({ advertisedRate: 17.3, receiptRate: 17.2, gapAmount: 2.82, gapCurrency: 'USD' })
    expect(tables.receipt_fields.find((f) => f.field_name === 'amount_received')).toMatchObject({ value: '8560', extraction_path: 'user_corrected' })
    expect(tables.receipt_comparisons[0]).toMatchObject({ receipt_id: scanned.id, matched_quote_id: 77, advertised_rate: 17.3, receipt_rate: 17.2, gap_amount: 2.82, gap_currency: 'USD', tax_expected: 5, tax_found: 5 })
  })

  it('stores the missing disclosures at scan time and the cost for the observatory at confirm', async () => {
    replies.push(goodAnswer())
    const { body: scanned } = await scan()
    // The Western Union fixture has no error-rights notice, provider contact or CFPB line.
    expect(scanned.disclosures_missing).toEqual(['error_rights', 'provider_contact', 'cfpb_contact'])
    expect(tables.receipts[0].disclosures_missing).toEqual(scanned.disclosures_missing)
    const { body } = await confirmCall(scanned.id, {})
    expect(body.disclosures_missing).toEqual(scanned.disclosures_missing)
    const c = tables.receipt_comparisons[0]
    expect(Number(c.total_cost_pct)).toBeGreaterThan(3)
    expect(Number(c.markup_pct)).toBeCloseTo(((17.7 - 17.2) / 17.7) * 100, 1)
  })

  it('says plainly when no advertised price matches', async () => {
    replies.push(goodAnswer())
    const { body: scanned } = await scan()
    tables.quotes = [publishedQuote({ captured_at: '2026-09-20T12:00:00.000Z' })]
    const { body } = await confirmCall(scanned.id, {})
    expect(body.comparison).toEqual({ quote: null, gap: null, reason: 'no_quote' })
    expect(tables.receipt_comparisons[0]).toMatchObject({ matched_quote_id: null, gap_amount: null, tax_expected: 5 })
  })

  it('says when the provider isn’t one we track', async () => {
    replies.push(goodAnswer())
    const { body: scanned } = await scan()
    const { body } = await confirmCall(scanned.id, { provider: 'Corner Store Remit' })
    expect(body.comparison.reason).toBe('not_tracked')
    expect(tables.receipts[0]).toMatchObject({ provider_id: null, provider_name: 'Corner Store Remit' })
  })

  it('refuses an invalid answer, and an unknown or expired receipt', async () => {
    replies.push(goodAnswer())
    const { body: scanned } = await scan()
    expect((await confirmCall(scanned.id, { transfer_date: '2099-01-01' })).status).toBe(400)
    expect((await confirmCall('00000000-0000-4000-8000-000000000000', {})).status).toBe(404)
    tables.receipts[0].expires_at = new Date(Date.now() - 1000).toISOString()
    expect((await confirmCall(scanned.id, {})).status).toBe(404)
    expect((await call({ action: 'confirm', id: scanned.id, corrections: { sender_name: 'x' }, today: TODAY })).status).toBe(400)
  })
})
