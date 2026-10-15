/**
 * The Edge Function itself (supabase/functions/whatsapp), run under vitest: Deno's globals
 * stubbed, supabase-js swapped for src/test/fake-supabase.ts (vitest.config.ts), and fetch
 * captured instead of calling Meta. Checks the parts packages/bot can't: the signature
 * check, what gets stored about a number, duplicates, the rate limit, requests and STOP.
 */
import { createHmac } from 'node:crypto'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { reset, rpcCalls, rpcs, tables } from './test/fake-supabase.ts'

const PHONE = '15551234567'
const env: Record<string, string | undefined> = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'service-key',
  WHATSAPP_VERIFY_TOKEN: 'verify-me',
  WHATSAPP_APP_SECRET: 'app-secret',
  WHATSAPP_ACCESS_TOKEN: 'access-token',
  WHATSAPP_PHONE_NUMBER_ID: '123',
  WHATSAPP_HASH_SECRET: 'hash-secret',
}

let handler: (req: Request) => Promise<Response>
const sent: { to: string; body: string }[] = []
const dispatched: string[] = []
const confirms: Record<string, unknown>[] = []
const templates: { to: string; template: { name: string; language: { code: string }; components: { parameters: { text: string }[] }[] } }[] = []
let confirmReply: unknown = null

beforeAll(async () => {
  vi.stubGlobal('Deno', {
    env: { get: (k: string) => env[k] },
    serve: (h: typeof handler) => {
      handler = h
    },
  })
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    const u = String(url)
    if (u.includes('api.github.com')) {
      dispatched.push(u)
      return new Response(null, { status: 204 })
    }
    const b = JSON.parse(String(init.body))
    if (u.endsWith('/functions/v1/scan-receipt')) {
      confirms.push(b)
      return new Response(JSON.stringify(confirmReply), { status: 200 })
    }
    if (u.includes('graph.facebook.com')) {
      if (b.type === 'template') templates.push(b)
      else sent.push({ to: b.to, body: b.text.body })
    }
    return new Response('{}', { status: 200 })
  })
  await import('../../../supabase/functions/whatsapp/index.ts')
})

afterAll(() => vi.unstubAllGlobals())

const quote = (over: Record<string, unknown> = {}) => ({
  route_id: 'us-in',
  delivery_method: 'bank_deposit',
  payment_method: 'bank_account',
  provider_name: 'Provider A',
  send_amount: 500,
  send_currency: 'USD',
  receive_currency: 'INR',
  fee: 0,
  offered_rate: 95.1,
  mid_market_rate: 95.92,
  pickup_charge: 0,
  amount_received: 47550,
  total_cost_pct: 0.86,
  delivery_time: 'minutes',
  is_promotional: false,
  captured_at: new Date(Date.now() - 3600e3).toISOString(),
  ...over,
})

beforeEach(() => {
  sent.length = 0
  dispatched.length = 0
  confirms.length = 0
  templates.length = 0
  confirmReply = null
  Object.assign(env, { WHATSAPP_RECEIPTS: undefined, RECEIPT_INTAKE_SECRET: undefined, GITHUB_DISPATCH_TOKEN: undefined })
  reset({ compare_quotes: [quote(), quote({ provider_name: 'Provider B', amount_received: 47000, total_cost_pct: 2 })] })
})

let n = 0
function delivery(text: string, id = `wamid.${++n}`, secret = env.WHATSAPP_APP_SECRET!) {
  return signed({ from: PHONE, id, type: 'text', text: { body: text } }, secret)
}

function photo(mediaId = 'media_1', id = `wamid.${++n}`) {
  return signed({ from: PHONE, id, type: 'image', image: { id: mediaId, mime_type: 'image/jpeg' } }, env.WHATSAPP_APP_SECRET!)
}

function signed(message: Record<string, unknown>, secret: string) {
  const body = JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [{ changes: [{ field: 'messages', value: { messages: [message] } }] }],
  })
  const signature = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`
  return new Request('https://example.supabase.co/functions/v1/whatsapp', {
    method: 'POST',
    headers: { 'x-hub-signature-256': signature, 'content-type': 'application/json' },
    body,
  })
}

describe('whatsapp webhook', () => {
  it('answers Meta’s verification with the challenge, and only with the right token', async () => {
    const ok = await handler(
      new Request('https://x/whatsapp?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=abc'),
    )
    expect(ok.status).toBe(200)
    expect(await ok.text()).toBe('abc')
    const bad = await handler(new Request('https://x/whatsapp?hub.mode=subscribe&hub.verify_token=nope&hub.challenge=abc'))
    expect(bad.status).toBe(403)
  })

  it('refuses a delivery Meta didn’t sign, and does nothing with it', async () => {
    const res = await handler(delivery('500 to india', 'wamid.forged', 'wrong-secret'))
    expect(res.status).toBe(401)
    expect(sent).toHaveLength(0)
    expect(tables.whatsapp_users ?? []).toHaveLength(0)
  })

  it('replies with prices, and keeps a keyed hash rather than the number', async () => {
    const res = await handler(delivery('500 to india'))
    expect(res.status).toBe(200)
    expect(sent).toHaveLength(1)
    expect(sent[0].to).toBe(PHONE)
    expect(sent[0].body).toContain('Sending $500 to India (bank deposit)')
    expect(sent[0].body).toContain('1. Provider A: *₹47,550* arrives')

    const [user] = tables.whatsapp_users
    expect(user.phone_hash).toMatch(/^[0-9a-f]{64}$/)
    expect(user.last_route).toBe('us-in')
    // Nothing stored anywhere holds the number or the amount typed.
    const stored = JSON.stringify({ users: tables.whatsapp_users, events: tables.events })
    expect(stored).not.toContain(PHONE)
    expect(JSON.stringify(tables.whatsapp_users)).not.toContain('500')

    const comparison = tables.events.find((e) => e.name === 'comparison_run')!
    expect(comparison).toMatchObject({ platform: 'whatsapp', props: { route: 'us-in', checked_amount: 500, quotes: 2 } })
    expect(String(comparison.install_id)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  it('answers a redelivered message once', async () => {
    await handler(delivery('500 to india', 'wamid.same'))
    await handler(delivery('500 to india', 'wamid.same'))
    expect(sent).toHaveLength(1)
  })

  it('says once when someone sends too many, then stays quiet until the hour is up', async () => {
    for (let i = 0; i < 32; i++) await handler(delivery('help'))
    expect(sent).toHaveLength(31)
    expect(sent[30].body).toBe('That’s a lot of messages. Try again in an hour.'.replace('’', "'"))
  })

  it('counts a request for a route we don’t cover after YES', async () => {
    await handler(delivery('500 USD SOS'))
    expect(sent[0].body).toContain('Reply YES')
    await handler(delivery('yes'))
    expect(sent[1].body).toContain('Your request for Somalia is counted')
    expect(tables.route_requests).toHaveLength(1)
    expect(tables.route_requests[0]).toMatchObject({ send_country: 'US', receive_country: 'SO', source: 'whatsapp' })
    expect(JSON.stringify(tables.route_requests)).not.toContain(PHONE)
  })

  it('switches to Hindi and stays there', async () => {
    await handler(delivery('hindi'))
    await handler(delivery('500 to india'))
    expect(sent[1].body).toContain('भारत भेजने पर')
  })

  it('forgets the number on STOP', async () => {
    await handler(delivery('500 to india'))
    expect(tables.whatsapp_users).toHaveLength(1)
    await handler(delivery('STOP'))
    expect(tables.whatsapp_users).toHaveLength(0)
    expect(sent[1].body).toContain('deleted what we kept about this number')
  })

  it('reads prices with the public key, so RLS decides what the bot can show', async () => {
    const { clients } = await import('./test/fake-supabase.ts')
    await handler(delivery('500 to india'))
    expect(clients).toContain('anon-key')
  })
})

// ---------------------------------------------------------------------------------------
// Receipt photos (D80, D94)
// ---------------------------------------------------------------------------------------

const RECEIPT_ID = '11111111-1111-4111-8111-111111111111'
const field = (value: unknown, confidence = 0.95) => ({ value, confidence, path: 'model', validated: true })
const FIELDS = {
  provider: field('Western Union'),
  send_currency: field('USD'),
  receive_currency: field('MXN'),
  amount_sent: field(500),
  fee: field(4.99, 0.4),
  tax: field(5),
  exchange_rate: field(17.2),
  amount_received: field(8560),
  pickup_charge: field(40),
  transfer_date: field('2026-09-28'),
  funding_method: field('cash'),
}
const confirmed = (toConfirm: string[] = []) => ({
  id: RECEIPT_ID,
  fields: FIELDS,
  checks: [],
  suspect: null,
  missing: [],
  to_confirm: toConfirm,
  provider_id: 'western-union',
  route_id: 'us-mx',
  mid: { rate: 17.7, date: '2026-09-28', source: 'Frankfurter' },
  comparison: { quote: null, gap: null, reason: 'no_quote' },
})

function receiptsOn() {
  Object.assign(env, { WHATSAPP_RECEIPTS: 'on', RECEIPT_INTAKE_SECRET: 'intake-secret', GITHUB_DISPATCH_TOKEN: 'gh-token' })
}

const done = (body: unknown, secret = 'intake-secret') =>
  handler(
    new Request('https://example.supabase.co/functions/v1/whatsapp?intake=done', {
      method: 'POST',
      headers: { 'x-intake-secret': secret, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  )

describe('linking to an app account (D138)', () => {
  const hashOf = () => (tables.whatsapp_users ?? [])[0]?.phone_hash as string

  it('links with the app’s code, and says so', async () => {
    rpcs.link_whatsapp = (args) => args.p_code === 'K7P2QX'
    await handler(delivery('link k7p2qx'))
    const args = rpcCalls.find((c) => c.name === 'link_whatsapp')?.args
    expect(args).toMatchObject({ p_code: 'K7P2QX', p_phone_hash: hashOf() })
    // Only the keyed hash is linked: alerts are push-only (D148), so no number is kept.
    expect(args?.p_number_sealed).toBeUndefined()
    expect(sent.at(-1)?.body).toMatch(/^Linked\./)
    expect(JSON.stringify(rpcCalls)).not.toContain(PHONE)
  })

  it('says when a code is wrong or old', async () => {
    rpcs.link_whatsapp = () => false
    await handler(delivery('LINK ABCDEF'))
    expect(sent.at(-1)?.body).toMatch(/didn't work/)
  })

  it('saves a comparison to the linked account with SAVE, and only the account gets the amount', async () => {
    await handler(delivery('hi'))
    tables.whatsapp_users[0].user_id = 'user-1'
    await handler(delivery('SAVE 500 to India'))
    expect(tables.saved_comparisons).toEqual([
      expect.objectContaining({ user_id: 'user-1', route_id: 'us-in', send_amount: 500, delivery_method: 'bank_deposit' }),
    ])
    expect(sent.at(-1)?.body).toMatch(/Provider A/)
    expect(sent.at(-1)?.body).toMatch(/Saved to your app/)
    expect(JSON.stringify(tables.whatsapp_users)).not.toContain('500')
  })

  it('asks to link first when SAVE comes from a chat that isn’t linked', async () => {
    await handler(delivery('save 500 to india'))
    expect(tables.saved_comparisons ?? []).toEqual([])
    expect(sent.at(-1)?.body).toMatch(/link WhatsApp in the app first/)
  })

  it('unlinks on UNLINK', async () => {
    await handler(delivery('hi'))
    tables.whatsapp_users[0].user_id = 'user-1'
    tables.whatsapp_users[0].linked_at = new Date().toISOString()
    await handler(delivery('unlink'))
    expect(tables.whatsapp_users[0].user_id).toBeNull()
    expect(sent.at(-1)?.body).toMatch(/^Unlinked\./)
  })
})

describe('rate alerts by WhatsApp (D139)', () => {
  const sendAlerts = (body: unknown, secret?: string) =>
    handler(
      new Request('https://example.supabase.co/functions/v1/whatsapp?alerts=send', {
        method: 'POST',
        headers: secret ? { 'x-intake-secret': secret } : {},
        body: JSON.stringify(body),
      }),
    )
  const alert = { id: 7, user_id: 'user-1', language: 'en', params: ['Wise', '₹47,800', '$500', 'India', '₹47,600'] }

  it('refuses anyone without the workflow’s secret', async () => {
    env.RECEIPT_INTAKE_SECRET = 'intake-secret'
    expect((await sendAlerts({ alerts: [alert] })).status).toBe(403)
    expect((await sendAlerts({ alerts: [alert] }, 'wrong-secret!')).status).toBe(403)
    expect(templates).toEqual([])
  })

  it('has no number to send to since alerts went push-only (D148), so nothing goes out', async () => {
    env.RECEIPT_INTAKE_SECRET = 'intake-secret'
    // Link through the bot, exactly as in real use: only the hash is stored now.
    rpcs.link_whatsapp = (args) => {
      tables.whatsapp_users = [{ phone_hash: args.p_phone_hash, user_id: 'user-1', number_sealed: args.p_number_sealed ?? null }]
      return true
    }
    await handler(delivery('LINK K7P2QX'))
    expect(tables.whatsapp_users[0].number_sealed).toBeNull()
    expect(JSON.stringify(tables.whatsapp_users)).not.toContain(PHONE)

    const res = await sendAlerts({ alerts: [alert] }, 'intake-secret')
    expect(await res.json()).toEqual({ sent: [], failed: [7] })
    expect(templates).toEqual([])
  })
})

describe('receipt photos', () => {
  it('are politely declined while photo intake is off', async () => {
    await handler(photo())
    expect(sent[0].body).toContain("Receipt photos can't be read here yet")
    expect(tables.receipt_intake ?? []).toHaveLength(0)
    expect(dispatched).toHaveLength(0)
  })

  it('are queued with the number sealed, acknowledged, and the worker started', async () => {
    receiptsOn()
    await handler(photo('media_42'))
    expect(sent[0].body).toContain('Got your receipt')
    const [job] = tables.receipt_intake
    expect(job).toMatchObject({ media_id: 'media_42', language: 'en' })
    expect(job.phone_hash).toMatch(/^[0-9a-f]{64}$/)
    // The number is kept only sealed: nothing stored reads as it.
    expect(JSON.stringify(tables)).not.toContain(PHONE)
    expect(String(job.phone_sealed)).not.toContain(PHONE.slice(-4))
    expect(dispatched[0]).toContain('/actions/workflows/receipt-intake.yml/dispatches')
    expect(rpcCalls.map((c) => c.name)).toContain('forget_stale_receipt_intake')
  })

  it('refuses a report without the worker’s secret', async () => {
    receiptsOn()
    await handler(photo())
    const job = tables.receipt_intake[0]
    expect((await done({ job: job.id, outcome: 'unreadable' }, 'wrong-secret!')).status).toBe(403)
    expect(tables.receipt_intake).toHaveLength(1)
    expect(sent).toHaveLength(1)
  })

  it('sends the result to the sealed number, then forgets the number', async () => {
    receiptsOn()
    await handler(photo())
    const job = tables.receipt_intake[0]
    const res = await done({ job: job.id, outcome: 'read', scan: { ...confirmed(), to_confirm: [] }, result: confirmed() })
    expect(res.status).toBe(200)
    expect(sent[1].to).toBe(PHONE)
    expect(sent[1].body).toContain('*Western Union* · 9/28/2026')
    expect(sent[1].body).toContain('*MXN\u00a08,560.00* arrived.')
    expect(tables.receipt_intake).toHaveLength(0)
    expect((await done({ job: job.id, outcome: 'read' })).status).toBe(404)
  })

  it('says so when a photo couldn’t be read', async () => {
    receiptsOn()
    await handler(photo())
    await done({ job: tables.receipt_intake[0].id, outcome: 'unreadable' })
    expect(sent[1].body).toContain("I couldn't read a receipt in that photo")
  })

  it('checks unsure values one at a time, then sends the result', async () => {
    receiptsOn()
    await handler(photo())
    await done({ job: tables.receipt_intake[0].id, outcome: 'read', scan: confirmed(['fee', 'exchange_rate']) })
    expect(sent[1].body).toContain('The fee reads "$4.99". Reply YES')
    expect(tables.whatsapp_users[0]).toMatchObject({ pending_receipt: RECEIPT_ID, pending_field: 'fee', pending_questions: 1 })

    // A corrected fee: confirmed through scan-receipt, then the next question.
    confirmReply = confirmed(['exchange_rate'])
    await handler(delivery('$3.99'))
    expect(confirms[0]).toMatchObject({ action: 'confirm', id: RECEIPT_ID, corrections: { fee: 3.99 } })
    expect(sent[2].body).toContain('The exchange rate reads "17.2"')
    expect(tables.whatsapp_users[0]).toMatchObject({ pending_field: 'exchange_rate', pending_questions: 2 })

    // YES confirms the stored value.
    rpcs.receipt_result = () => ({ fields: { exchange_rate: { value: '17.2', path: 'model', confidence: 0.5, validated: false } } })
    confirmReply = confirmed([])
    await handler(delivery('yes'))
    expect(confirms[1]).toMatchObject({ corrections: { exchange_rate: 17.2 } })
    expect(sent[3].body).toContain('*Western Union* ·')
    expect(tables.whatsapp_users[0]).toMatchObject({ pending_receipt: null, pending_field: null, pending_questions: 0 })
  })

  it('asks again when the answer isn’t one, and lets an ordinary message through', async () => {
    receiptsOn()
    await handler(photo())
    await done({ job: tables.receipt_intake[0].id, outcome: 'read', scan: confirmed(['fee']) })
    rpcs.receipt_result = () => ({
      fields: {
        fee: { value: '4.99', path: 'model', confidence: 0.4, validated: false },
        send_currency: { value: 'USD', path: 'model', confidence: 0.95, validated: true },
      },
    })
    await handler(delivery('hmm'))
    expect(sent[2].body).toContain('The fee reads "$4.99"')
    expect(confirms).toHaveLength(0)

    await handler(delivery('500 to india'))
    expect(sent[3].body).toContain('Sending $500 to India')
    expect(tables.whatsapp_users[0]).toMatchObject({ pending_receipt: null })
  })

  it('STOP also deletes photos still waiting', async () => {
    receiptsOn()
    await handler(photo())
    await handler(delivery('STOP'))
    expect(tables.receipt_intake).toHaveLength(0)
    expect(tables.whatsapp_users).toHaveLength(0)
  })
})


// ---------------------------------------------------------------------------------------
// Daily limits (D140): messages and, tighter, receipt photos per number
// ---------------------------------------------------------------------------------------

describe('daily limits (D140)', () => {
  const counts = new Map<string, number>()
  beforeEach(() => {
    counts.clear()
    rpcs.count_hit = (args) => {
      const k = `${args.p_bucket}:${args.p_key}`
      counts.set(k, (counts.get(k) ?? 0) + 1)
      return counts.get(k)
    }
  })

  it('counts by the keyed hash, never the number', async () => {
    await handler(delivery('500 to india'))
    const call = rpcCalls.find((c) => c.name === 'count_hit')
    expect(call?.args).toMatchObject({ p_bucket: 'wa_message', p_window_seconds: 86_400 })
    expect(call?.args.p_key).toMatch(/^[0-9a-f]{64}$/)
    expect(JSON.stringify(rpcCalls)).not.toContain(PHONE)
  })

  it('answers the first message past the day’s limit once, then stays quiet', async () => {
    const hash = () => (tables.whatsapp_users ?? [])[0]?.phone_hash as string
    await handler(delivery('500 to india'))
    counts.set(`wa_message:${hash()}`, 100)
    await handler(delivery('500 to india'))
    expect(sent.at(-1)?.body).toContain('limit on messages for today')
    const before = sent.length
    await handler(delivery('500 to india'))
    expect(sent).toHaveLength(before)
  })

  it('turns away the 11th photo of the day without queuing it, and says why', async () => {
    receiptsOn()
    for (let i = 0; i < 10; i++) await handler(photo(`media_${i}`))
    expect(tables.receipt_intake).toHaveLength(10)
    await handler(photo('media_10'))
    expect(tables.receipt_intake).toHaveLength(10)
    expect(sent.at(-1)?.body).toContain('10 receipt photos today')
  })

  it('lets photos through when the counter can’t be reached (the model caps still hold)', async () => {
    receiptsOn()
    delete rpcs.count_hit
    await handler(photo())
    expect(tables.receipt_intake).toHaveLength(1)
  })
})
