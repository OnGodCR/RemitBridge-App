/**
 * The newsletter (D169): supabase/functions/send-newsletter and newsletter-unsubscribe run as
 * they are, under the same stubs as webhook.test.ts (and, like it, left out of tsc, which
 * can't see Deno). The email itself is checked in newsletter-email.test.ts.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { caller, reset, rpcs, tables } from './test/fake-supabase.ts'

// The postal address lives in site.config.json; empty unless a test sets it.
const site = vi.hoisted(() => ({ address: '' }))
vi.mock('../../../supabase/functions/_shared/site-config.ts', () => ({
  CONTACT_EMAIL: 'hello@remitbridgelabs.org',
  LEGAL_NAME: 'RemitBridge Labs',
  get MAILING_ADDRESS() {
    return site.address
  },
}))

const env: Record<string, string | undefined> = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'service-key',
  RESEND_API_KEY: 're_test',
}
const handlers: ((req: Request) => Promise<Response>)[] = []
const mail: { path: string; payload: any }[] = []
let resendStatus = 200

beforeAll(async () => {
  vi.stubGlobal('Deno', { env: { get: (k: string) => env[k] }, serve: (h: (req: Request) => Promise<Response>) => handlers.push(h) })
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    const u = new URL(String(url))
    mail.push({ path: u.pathname, payload: JSON.parse(String(init.body)) })
    return new Response('{}', { status: resendStatus })
  })
  await import('../../../supabase/functions/send-newsletter/index.ts')
  await import('../../../supabase/functions/newsletter-unsubscribe/index.ts')
})
afterAll(() => vi.unstubAllGlobals())

const send = (body: unknown, auth = 'Bearer user-token') =>
  handlers[0](new Request('https://x/functions/v1/send-newsletter', { method: 'POST', headers: { Authorization: auth }, body: JSON.stringify(body) }))
const issue = { subject: 'Kenya is here', body: 'Hi,\n\nWe now check prices to Kenya: https://app.remitbridgelabs.org.\n\nThanks for reading.' }
const TOKEN = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const people = (n: number) => Array.from({ length: n }, (_, i) => ({ email: `p${i}@example.org`, unsubscribe_token: TOKEN(i), language: 'en' }))

beforeEach(() => {
  reset()
  mail.length = 0
  resendStatus = 200
  site.address = ''
  rpcs.is_admin = () => true
  caller.user = { id: 'admin-id', email: 'admin@example.org' }
})

describe('send-newsletter', () => {
  it('refuses anyone but an admin', async () => {
    rpcs.is_admin = () => false
    expect((await send({ mode: 'test', ...issue })).status).toBe(403)
    expect((await send({ mode: 'test', ...issue }, '')).status).toBe(401)
    expect(mail).toEqual([])
  })

  it('checks the issue before sending anything', async () => {
    expect((await send({ mode: 'send', subject: '', body: 'x' })).status).toBe(400)
    expect((await send({ mode: 'later', ...issue })).status).toBe(400)
    expect(mail).toEqual([])
  })

  it('sends a test only to the admin, with no postal address needed', async () => {
    rpcs.newsletter_recipients = () => people(3)
    const res = await send({ mode: 'test', ...issue })
    expect(await res.json()).toEqual({ sent: 1, to: 'admin@example.org' })
    expect(mail).toHaveLength(1)
    expect(mail[0].path).toBe('/emails')
    expect(mail[0].payload.to).toEqual(['admin@example.org'])
    expect(mail[0].payload.subject).toBe('[Test] Kenya is here')
    expect(tables.newsletter_issues ?? []).toEqual([])
  })

  it('sends to everyone without a postal address, and prints one once set', async () => {
    rpcs.newsletter_recipients = () => people(1)
    expect(await (await send({ mode: 'send', ...issue })).json()).toEqual({ recipients: 1, sent: 1, failed: 0 })
    expect(mail[0].payload[0].text).not.toContain('PO Box')
  })

  it('sends everyone their own unsubscribe link, and logs the issue', async () => {
    site.address = 'PO Box 1, Sammamish, WA 98074'
    rpcs.newsletter_recipients = () => people(3)
    const res = await send({ mode: 'send', ...issue })
    expect(await res.json()).toEqual({ recipients: 3, sent: 3, failed: 0 })
    expect(mail).toHaveLength(1)
    expect(mail[0].path).toBe('/emails/batch')
    const batch = mail[0].payload
    expect(batch.map((m: any) => m.to[0])).toEqual(['p0@example.org', 'p1@example.org', 'p2@example.org'])
    expect(batch[1].text).toContain(`https://app.remitbridgelabs.org/unsubscribe?t=${TOKEN(1)}`)
    expect(batch[1].text).not.toContain(TOKEN(0))
    expect(batch[1].text).toContain('PO Box 1, Sammamish, WA 98074')
    expect(batch[1].headers['List-Unsubscribe']).toBe(
      `<https://example.supabase.co/functions/v1/newsletter-unsubscribe?t=${TOKEN(1)}>, <mailto:hello@remitbridgelabs.org?subject=unsubscribe>`,
    )
    expect(batch[1].headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click')
    expect(tables.newsletter_issues).toMatchObject([{ subject: 'Kenya is here', recipients: 3, sent: 3, failed: 0, sent_by: 'admin-id' }])
  })

  it('sends in batches of 100 and counts a refused batch as failed', async () => {
    site.address = 'PO Box 1'
    rpcs.newsletter_recipients = () => people(150)
    resendStatus = 429
    const res = await send({ mode: 'send', ...issue })
    expect(await res.json()).toEqual({ recipients: 150, sent: 0, failed: 150 })
    expect(mail.map((m) => m.payload.length)).toEqual([100, 50])
  })

  it('refuses a second full send within 10 minutes', async () => {
    site.address = 'PO Box 1'
    rpcs.newsletter_recipients = () => people(2)
    reset({ newsletter_issues: [{ id: 1, subject: 'x', created_at: new Date(Date.now() - 60_000).toISOString() }] })
    rpcs.is_admin = () => true
    rpcs.newsletter_recipients = () => people(2)
    caller.user = { id: 'admin-id', email: 'admin@example.org' }
    expect((await send({ mode: 'send', ...issue })).status).toBe(409)
    expect(mail).toEqual([])
  })
})

describe('newsletter-unsubscribe', () => {
  const unsub = (init: RequestInit & { query?: string }) =>
    handlers[1](new Request(`https://x/functions/v1/newsletter-unsubscribe${init.query ?? ''}`, init))

  it('deletes the opt-in for the token, from the site page or a mail app', async () => {
    reset({ newsletter_subscribers: [{ user_id: 'a', unsubscribe_token: TOKEN(1) }, { user_id: 'b', unsubscribe_token: TOKEN(2) }] })
    const page = await unsub({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: TOKEN(1) }) })
    expect(await page.json()).toEqual({ unsubscribed: true })
    const oneClick = await unsub({ method: 'POST', query: `?t=${TOKEN(2)}`, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'List-Unsubscribe=One-Click' })
    expect(oneClick.status).toBe(200)
    expect(tables.newsletter_subscribers).toEqual([])
  })

  it('answers the same for an unknown token, and refuses a malformed one', async () => {
    reset({ newsletter_subscribers: [{ user_id: 'a', unsubscribe_token: TOKEN(1) }] })
    expect(await (await unsub({ method: 'POST', query: `?t=${TOKEN(9)}` })).json()).toEqual({ unsubscribed: true })
    expect((await unsub({ method: 'POST', query: '?t=nope' })).status).toBe(400)
    expect(tables.newsletter_subscribers).toHaveLength(1)
  })

  it('only redirects a GET, so a link scanner removes nothing', async () => {
    reset({ newsletter_subscribers: [{ user_id: 'a', unsubscribe_token: TOKEN(1) }] })
    const res = await unsub({ method: 'GET', query: `?t=${TOKEN(1)}` })
    expect(res.status).toBe(303)
    expect(res.headers.get('Location')).toBe(`https://app.remitbridgelabs.org/unsubscribe?t=${TOKEN(1)}`)
    expect(tables.newsletter_subscribers).toHaveLength(1)
  })
})
