/**
 * The scan-receipt Edge Function itself (supabase/functions/scan-receipt), run under
 * vitest: Deno's globals stubbed, supabase-js and the Anthropic SDK swapped for in-memory
 * fakes (vitest.config.ts), Frankfurter's answer stubbed. Checks what the package tests
 * can't: the server's second redaction, what's stored and what isn't, consent, the monthly
 * cap, and forgetting.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ScanResponse } from './api.ts'
import { loadFixtures } from './node/fixtures.ts'
import { detectPii, redactPage } from './redact.ts'
import { keys, replies, requests } from './test/fake-anthropic.ts'
import { answer } from './test/fake-model.ts'
import { reset, rpcs, storage, tables } from './test/fake-supabase.ts'

const env: Record<string, string | undefined> = {}
let handler: (req: Request) => Promise<Response>
const fx: string[] = []

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
  vi.stubGlobal('fetch', async (url: string) => {
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
    ANTHROPIC_API_KEY: 'test-key',
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
    env.ANTHROPIC_API_KEY = undefined
    const { body } = await scan()
    expect(requests).toHaveLength(0)
    expect(body.model).toEqual({ asked: [], error: null })
    expect(body.to_confirm).toContain('amount_sent')
    expect(tables.receipts).toHaveLength(1)
  })

  it('uses RECEIPT_MODEL when set', async () => {
    env.RECEIPT_MODEL = 'claude-sonnet-5-5'
    replies.push(goodAnswer())
    await scan()
    expect(requests[0].model).toBe('claude-sonnet-5-5')
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
