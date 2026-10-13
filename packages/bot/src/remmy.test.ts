/**
 * Remmy's Edge Function (supabase/functions/remmy, D175) run as it is, with Deno's globals
 * stubbed, supabase-js swapped for the fake (vitest.config.ts), and the model's turns
 * scripted through fetch. Left out of tsc like webhook.test.ts, which can't see Deno.
 */
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import { reset, rpcs, tables } from './test/fake-supabase.ts'

const env: Record<string, string | undefined> = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'service-key',
}
let handler: (req: Request) => Promise<Response>
/** The model's turns, in order; each fetch to the model takes the next one. */
let turns: string[] = []
const prompts: string[] = []

beforeAll(async () => {
  vi.stubGlobal('Deno', { env: { get: (k: string) => env[k] }, serve: (h: typeof handler) => (handler = h) })
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    if (String(url).includes('groq.com')) {
      const body = JSON.parse(String(init.body))
      prompts.push(body.messages.map((m: { content: string }) => m.content).join('\n'))
      const content = turns.shift()
      if (content === undefined) return new Response('{}', { status: 500 })
      return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 })
    }
    return new Response('{}', { status: 200 })
  })
  await import('../../../supabase/functions/remmy/index.ts')
})
afterAll(() => vi.unstubAllGlobals())

const INSTALL = '00000000-0000-4000-8000-00000000c0de'
const ask = (body: Record<string, unknown>) =>
  handler(new Request('https://x/functions/v1/remmy', { method: 'POST', body: JSON.stringify({ install_id: INSTALL, platform: 'ios', ...body }) }))

beforeEach(() => {
  reset()
  turns = []
  prompts.length = 0
  env.GROQ_API_KEY = 'groq-key'
  rpcs.take_hit_for_ip = () => true
  rpcs.count_hit = () => 1
})

it('acts in the app: opens Compare on the route asked about', async () => {
  turns = [
    '{"tool":"open_compare","args":{"country":"India","amount":500,"now":true}}',
    '{"reply":"Compare is open for $500 to India."}',
  ]
  const r = await (await ask({ message: 'Take me to prices for 500 to India' })).json()
  expect(r.reply).toBe('Compare is open for $500 to India.')
  expect(r.steps).toEqual(['open_compare'])
  expect(r.actions).toEqual([{ type: 'compare', routeId: 'us-in', amount: 500, method: 'bank_deposit', now: true }])
  // Remmy's own prompt, not the WhatsApp one, and the metric names tools, never the text.
  expect(prompts[0]).toContain('You are Remmy')
  // The card's tool hands back today's prices too, so the model has real figures to quote.
  expect(prompts[1]).toMatch(/Result of open_compare: \{"shown":"Compare is ready for 500 USD to India","opened":true,"prices":/)
  expect(tables.events).toMatchObject([
    { name: 'comparison_run', props: { route: 'us-in' } },
    { name: 'remmy_message', props: { tools: 'open_compare' }, platform: 'ios' },
  ])
  expect(JSON.stringify(tables.events)).not.toContain('India')
})

it('passes the conversation so far, so a follow-up makes sense', async () => {
  turns = ['{"reply":"Sure, the scanner reads it on your phone first."}']
  await ask({
    message: 'what about my receipt?',
    history: [
      { role: 'user', text: 'hi' },
      { role: 'assistant', text: 'Hey! Ask me about prices.' },
    ],
  })
  expect(prompts[0]).toContain('Hey! Ask me about prices.')
})

it('only takes actions that exist', async () => {
  turns = [
    '{"tool":"open_screen","args":{"screen":"teleporter"}}',
    '{"tool":"start_lesson","args":{"module":"safety","mode":"safety"}}',
    '{"reply":"Here is the safety lesson."}',
  ]
  const r = await (await ask({ message: 'teach me about scams' })).json()
  expect(r.actions).toEqual([{ type: 'lesson', module: 'safety', mode: 'safety', now: false }])
  expect(r.steps).toEqual(['open_screen', 'start_lesson'])
})

it('offers a save the person confirms, and never twice', async () => {
  turns = [
    '{"tool":"save_comparison","args":{"country":"Mexico","amount":200}}',
    '{"tool":"save_comparison","args":{"country":"MX","amount":200}}',
    '{"reply":"Tap Save to keep it."}',
  ]
  const r = await (await ask({ message: 'save 200 to mexico' })).json()
  expect(r.actions).toEqual([{ type: 'save', routeId: 'us-mx', amount: 200, method: 'bank_deposit' }])
})

it('without a model, still opens Compare on a plain price question', async () => {
  delete env.GROQ_API_KEY
  const r = await (await ask({ message: '300 to Philippines' })).json()
  expect(r.limited).toBe(true)
  expect(r.reply).toBe('')
  expect(r.actions).toEqual([{ type: 'compare', routeId: 'us-ph', amount: 300, method: 'bank_deposit', now: false }])
})

it('stops at the address limit and the install limit', async () => {
  rpcs.take_hit_for_ip = () => false
  expect((await (await ask({ message: 'hello' })).json()).limited).toBe(true)
  rpcs.take_hit_for_ip = () => true
  rpcs.count_hit = () => 41
  expect((await (await ask({ message: 'hello' })).json()).limited).toBe(true)
})

it('refuses a request without a message or a real install ID', async () => {
  expect((await ask({ message: '' })).status).toBe(400)
  expect((await handler(new Request('https://x', { method: 'POST', body: JSON.stringify({ message: 'hi', install_id: 'nope' }) }))).status).toBe(400)
})

// The harness, without the model: everyday ways of asking for a screen (D175). Each must open
// the right screen with no model call at all, so it works whatever the model does that day.
const PLAIN_REQUESTS: [string, string][] = [
  ['Open user settings', 'account'],
  ['open settings', 'account'],
  ['settings', 'account'],
  ['take me to my profile', 'account'],
  ['where do I change my language?', 'account'],
  ['log out', 'account'],
  ['delete my account', 'account'],
  ['create an account', 'sign_in'],
  ['go to the scanner', 'scan'],
  ['Scan a receipt', 'scan'],
  ['open the glossary', 'glossary'],
  ['where is the privacy policy', 'privacy'],
  ['show me the terms of service', 'terms'],
  ['open help', 'support'],
  ['take me to saved', 'saved'],
  ['open rate history', 'rate_history'],
  ['show me the blog', 'blog'],
  ['open the scam checker', 'scam_check'],
  ['open WhatsApp', 'whatsapp'],
  ['go to tools', 'tools'],
  ['llévame a mi cuenta', 'account'],
  ['abrir ajustes', 'account'],
  ['settings kholo', 'account'],
  ['mở cài đặt', 'account'],
]

it.each(PLAIN_REQUESTS)('"%s" opens %s without asking the model', async (message, screen) => {
  const r = await (await ask({ message })).json()
  expect(r.actions).toEqual([{ type: 'screen', screen, now: true }])
  expect(r.steps).toEqual(['open_screen'])
  expect(prompts).toHaveLength(0)
})

it.each(['500 to India', 'what is an exchange-rate markup?', 'is this a scam: someone wants my sign-in code', 'how do fees work'])(
  '"%s" goes to the model',
  async (message) => {
    turns = ['{"reply":"Sure."}']
    await ask({ message })
    expect(prompts).toHaveLength(1)
  },
)

it('maps whatever screen name the model uses, and tells it the real names when none fits', async () => {
  turns = [
    '{"tool":"open_screen","args":{"screen":"teleport"}}',
    '{"tool":"open_screen","args":{"screen":"User Settings","now":true}}',
    '{"reply":"Settings are open."}',
  ]
  const r = await (await ask({ message: 'I need to change some stuff about how the app works for me' })).json()
  expect(r.actions).toEqual([{ type: 'screen', screen: 'account', now: true }])
  expect(prompts[1]).toContain('Pick one of: compare, scan')
})

it('adds the screen when the model answers a clear "take me to" without acting', async () => {
  turns = ['{"reply":"Markup is the gap between the rate you get and the mid-market rate."}']
  const r = await (await ask({ message: 'take me to the glossary and tell me what markup means in simple words' })).json()
  expect(r.reply).toContain('Markup is the gap')
  expect(r.actions).toEqual([{ type: 'screen', screen: 'glossary', now: false }])
})

it('slows down a burst before anything else, and says why', async () => {
  rpcs.take_hit_for_ip = (args: { p_bucket: string }) => args.p_bucket !== 'remmy_minute'
  const r = await (await ask({ message: 'open settings' })).json()
  expect(r).toEqual({ reply: '', actions: [], steps: [], limited: true, reason: 'slow' })
  expect(tables.events).toMatchObject([{ name: 'remmy_limited', props: { reason: 'slow' } }])
})

it('gives a price question its Compare card even when the model only talks', async () => {
  turns = ['{"reply":"Prices change a lot, have a look."}']
  const r = await (await ask({ message: '300 to Mexico' })).json()
  expect(r.actions).toEqual([{ type: 'compare', routeId: 'us-mx', amount: 300, method: 'bank_deposit', now: false }])
})

it('says the answer failed, not that it is resting, when the model gives nothing usable', async () => {
  turns = ['not json at all {']
  const r = await (await ask({ message: '300 to Mexico' })).json()
  expect(r).toMatchObject({ limited: true, reason: 'failed', actions: [{ type: 'compare', routeId: 'us-mx' }] })
})

it('still opens a screen when past the day limit', async () => {
  delete env.GROQ_API_KEY
  const r = await (await ask({ message: 'I would like to read about how you handle my data, the privacy policy please' })).json()
  expect(r.limited).toBe(true)
  expect(r.reason).toBe('day')
  expect(r.actions).toEqual([{ type: 'screen', screen: 'privacy', now: false }])
})
