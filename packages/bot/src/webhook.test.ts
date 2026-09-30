/**
 * The Edge Function itself (supabase/functions/whatsapp), run under vitest: Deno's globals
 * stubbed, supabase-js swapped for src/test/fake-supabase.ts (vitest.config.ts), and fetch
 * captured instead of calling Meta. Checks the parts packages/bot can't: the signature
 * check, what gets stored about a number, duplicates, the rate limit, requests and STOP.
 */
import { createHmac } from 'node:crypto'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { reset, tables } from './test/fake-supabase.ts'

const PHONE = '15551234567'
const env: Record<string, string> = {
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

beforeAll(async () => {
  vi.stubGlobal('Deno', {
    env: { get: (k: string) => env[k] },
    serve: (h: typeof handler) => {
      handler = h
    },
  })
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    const b = JSON.parse(String(init.body))
    if (String(url).includes('graph.facebook.com')) sent.push({ to: b.to, body: b.text.body })
    return new Response('{}', { status: 200 })
  })
  await import('../../../supabase/functions/whatsapp/index.ts')
})

afterAll(() => vi.unstubAllGlobals())

const quote = (over: Record<string, unknown> = {}) => ({
  route_id: 'us-in',
  delivery_method: 'bank_deposit',
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
  reset({ latest_quotes: [quote(), quote({ provider_name: 'Provider B', amount_received: 47000, total_cost_pct: 2 })] })
})

let n = 0
function delivery(text: string, id = `wamid.${++n}`, secret = env.WHATSAPP_APP_SECRET) {
  const body = JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [{ changes: [{ field: 'messages', value: { messages: [{ from: PHONE, id, type: 'text', text: { body: text } }] } }] }],
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
    await handler(delivery('500 USD NPR'))
    expect(sent[0].body).toContain('Reply YES')
    await handler(delivery('yes'))
    expect(sent[1].body).toContain('Your request for Nepal is counted')
    expect(tables.route_requests).toHaveLength(1)
    expect(tables.route_requests[0]).toMatchObject({ send_country: 'US', receive_country: 'NP', source: 'whatsapp' })
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
