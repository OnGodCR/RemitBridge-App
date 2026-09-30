import { describe, expect, it } from 'vitest'
import { computeTransferCost } from '../../formula/src/index.ts'
import { AMOUNTS, ROUTES } from '../../../mobile/src/lib/routes.ts'
import {
  formatCompare,
  formatSay,
  formatWhy,
  MAX_AMOUNT,
  NEW_STATE,
  parse,
  plan,
  rankFor,
  type QuoteRow,
  type State,
} from './index.ts'

describe('parse: the messy input PRD 5.8 lists', () => {
  const cases: [string, object][] = [
    ['500 USD INR', { kind: 'compare', amount: 500, from: 'US', to: 'IN' }],
    ['send 500 to India', { kind: 'compare', amount: 500, to: 'IN' }],
    ['500 dollars to india', { kind: 'compare', amount: 500, from: 'US', to: 'IN' }],
    ['$500 india', { kind: 'compare', amount: 500, from: 'US', to: 'IN' }],
    ['how many ₹ for $500', { kind: 'compare', amount: 500, from: 'US', to: 'IN' }],
    ['500 rs', { kind: 'compare', amount: 500, to: 'IN' }],
    ['1,000 to Mexico cash', { kind: 'compare', amount: 1000, to: 'MX', method: 'cash_pickup' }],
    ['1.5k to the phillipines', { kind: 'compare', amount: 1500, to: 'PH' }],
    ['2 hazar vietnam', { kind: 'compare', amount: 2000, to: 'VN' }],
    ['upi 500', { kind: 'compare', amount: 500, method: 'upi' }],
    ['cash 200', { kind: 'compare', amount: 200, method: 'cash_pickup' }],
    ['500 USD NPR', { kind: 'compare', amount: 500, from: 'US', to: 'NP' }],
    ['from canada to india 300', { kind: 'compare', amount: 300, from: 'CA', to: 'IN' }],
    ['india', { kind: 'compare', to: 'IN' }],
    ['500', { kind: 'compare', amount: 500 }],
    ['५०० भारत', { kind: 'compare', amount: 500, to: 'IN' }],
    ['500 usd to méxico', { kind: 'compare', amount: 500, from: 'US', to: 'MX' }],
    ['500usd india', { kind: 'compare', amount: 500, from: 'US', to: 'IN' }],
    ['request nepal', { kind: 'request', to: 'NP' }],
    ['add Ethiopia', { kind: 'request', to: 'ET' }],
    ['HELP', { kind: 'help' }],
    ['hi', { kind: 'help' }],
    ['why?', { kind: 'why' }],
    ['हिंदी', { kind: 'language', language: 'hi' }],
    ['english please', { kind: 'language', language: 'en' }],
    ['yes', { kind: 'yes' }],
    ['हाँ', { kind: 'yes' }],
    ['scam', { kind: 'scam' }],
    ['check', { kind: 'check' }],
    ['what is the weather', { kind: 'unknown' }],
    ['STOP', { kind: 'forget' }],
    ['delete my data', { kind: 'forget' }],
  ]
  for (const [text, expected] of cases) {
    it(`reads "${text}"`, () => expect(parse(text)).toMatchObject(expected))
  }

  it('does not read "send money home" as home delivery', () => {
    expect(parse('send money home to india 500')).toEqual({ kind: 'compare', amount: 500, to: 'IN', from: undefined, method: undefined })
  })
})

describe('plan', () => {
  const s = (over: Partial<State> = {}): State => ({ ...NEW_STATE, ...over })

  it('compares with the route’s first method by default, and remembers the route but not the amount', () => {
    const { action, state } = plan(parse('500 to india'), s())
    expect(action).toMatchObject({ type: 'compare', amount: 500, checked: 500, method: 'bank_deposit' })
    expect(state).toEqual({ lastRoute: 'us-in', lastMethod: 'bank_deposit', pendingRequest: null })
    expect(JSON.stringify(state)).not.toContain('500')
  })

  it('uses the checked amount at or below the one asked', () => {
    expect(plan(parse('750 to mexico'), s()).action).toMatchObject({ type: 'compare', amount: 750, checked: 500 })
    expect(plan(parse('50 to mexico'), s()).action).toMatchObject({ type: 'compare', amount: 50, checked: AMOUNTS[0] })
  })

  it('takes UPI to mean India, and "cash 200" to mean the last route', () => {
    expect(plan(parse('upi 500'), s()).action).toMatchObject({ type: 'compare', method: 'upi' })
    expect((plan(parse('upi 500'), s()).action as { route: { id: string } }).route.id).toBe('us-in')
    const cash = plan(parse('cash 200'), s({ lastRoute: 'us-mx' })).action
    expect(cash).toMatchObject({ type: 'compare', amount: 200, method: 'cash_pickup' })
  })

  it('asks rather than fails when something is missing', () => {
    expect(plan(parse('india'), s()).action).toEqual({ type: 'say', say: { key: 'askAmount', to: 'IN' } })
    expect(plan(parse('500'), s()).action).toEqual({ type: 'say', say: { key: 'askCountry', amount: 500 } })
    expect(plan(parse('cash'), s()).action).toEqual({ type: 'say', say: { key: 'askBoth' } })
  })

  it('offers to count a request for a route we don’t cover, and files it on YES', () => {
    const first = plan(parse('500 USD NPR'), s())
    expect(first.action).toEqual({ type: 'say', say: { key: 'notCovered', from: 'US', to: 'NP' } })
    expect(first.state).toEqual({ pendingRequest: 'US-NP' })
    const yes = plan(parse('yes'), s({ pendingRequest: 'US-NP' }))
    expect(yes.action).toEqual({ type: 'request', from: 'US', to: 'NP' })
    expect(yes.state).toEqual({ pendingRequest: null })
    expect(plan(parse('yes'), s()).action).toEqual({ type: 'say', say: { key: 'nothingPending' } })
  })

  it('treats a sending country we don’t cover as not covered', () => {
    expect(plan(parse('from canada to india 300'), s()).action).toEqual({
      type: 'say',
      say: { key: 'notCovered', from: 'CA', to: 'IN' },
    })
  })

  it('says which methods a route has when asked for one it doesn’t', () => {
    expect(plan(parse('upi 500 to mexico'), s()).action).toMatchObject({ type: 'say', say: { key: 'methodUnavailable' } })
  })

  it('refuses amounts over the app’s limit', () => {
    expect(plan(parse(`${MAX_AMOUNT + 1} to india`), s()).action).toEqual({ type: 'say', say: { key: 'tooMuch' } })
  })

  it('switches language and keeps it', () => {
    expect(plan(parse('hindi'), s()).state).toEqual({ language: 'hi' })
  })
})

const row = (over: Partial<QuoteRow>): QuoteRow => ({
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
  captured_at: '2026-09-29T10:00:00Z',
  ...over,
})

describe('replies', () => {
  const india = ROUTES.find((r) => r.id === 'us-in')!
  const now = new Date('2026-09-29T12:00:00Z')
  const rows = [
    row({}),
    row({ provider_name: 'Provider B', fee: 3.99, amount_received: 47170, total_cost_pct: 1.6, delivery_time: 'same day' }),
    row({ provider_name: 'Provider C', offered_rate: 94.0, amount_received: 47000, total_cost_pct: 2.0, delivery_time: null }),
    row({ provider_name: 'Provider D', offered_rate: 93.0, amount_received: 46500, total_cost_pct: 3.0 }),
    row({ provider_name: 'Promo', offered_rate: 97.0, amount_received: 48500, total_cost_pct: -1.1, is_promotional: true }),
  ]

  it('shows the top three standing prices, most received first, with the promotion set apart', () => {
    const text = formatCompare('en', { route: india, amount: 500, checked: 500, method: 'bank_deposit', rows, now })
    expect(text).toMatchInlineSnapshot(`
      "Sending $500 to India (bank deposit)

      1. Provider A: *₹47,550* arrives · 0.9% total cost · minutes
      2. Provider B: *₹47,170* arrives · 1.6% · same day
      3. Provider C: *₹47,000* arrives · 2.0%

      Plus 1 first-transfer offer in the app.
      Prices checked 2 hours ago.
      Full list: https://app.remitbridgelabs.org
      Reply WHY to see where the rest goes."
    `)
    expect(text).not.toContain('Promo:')
    expect(text).not.toContain('Provider D')
  })

  it('estimates an unchecked amount with the one formula, and says so', () => {
    const { standing } = rankFor([row({})], 750)
    const expected = computeTransferCost({ sent: 750, fee: 0, quotedRate: 95.1, midRate: 95.92, pickupCharge: 0 })
    expect(standing[0].amount_received).toBeCloseTo(expected.amountReceived, 6)
    expect(standing[0].basedOn).toBe(500)
    const text = formatCompare('en', { route: india, amount: 750, checked: 500, method: 'bank_deposit', rows: [row({})], now })
    expect(text).toContain('Estimated from our $500 check, same fee and rate.')
  })

  it('drops a price whose fee would eat the whole amount', () => {
    expect(rankFor([row({ fee: 20 })], 10).standing).toHaveLength(0)
  })

  it('says plainly when there are no prices, and warns when they are old', () => {
    expect(formatCompare('en', { route: india, amount: 500, checked: 500, method: 'upi', rows: [], now })).toContain(
      'No checked prices for India yet.',
    )
    const old = formatCompare('en', {
      route: india,
      amount: 500,
      checked: 500,
      method: 'bank_deposit',
      rows: [row({ captured_at: '2026-09-27T12:00:00Z' })],
      now,
    })
    expect(old).toContain('Prices checked 2 days ago, so they may have moved.')
  })

  it('fits on one phone screen', () => {
    const text = formatCompare('hi', { route: india, amount: 500, checked: 500, method: 'bank_deposit', rows, now })
    expect(text.split('\n').length).toBeLessThanOrEqual(12)
    expect(text).toContain('*₹47,550* पहुँचेंगे')
  })

  it('explains WHY with the last route’s best price, or a plainly hypothetical example', () => {
    const why = formatWhy('en', { route: india, top: row({}) })
    expect(why).toContain('$1 is worth ₹95.92')
    expect(why).toContain('Provider A gives ₹95.10')
    const generic = formatWhy('en', { route: null, top: null })
    expect(generic).toContain('if $1 is worth 100')
  })

  it('writes no em dashes anywhere', () => {
    const keys = [
      'help', 'askBoth', 'askRequestCountry', 'tooMuch', 'scam', 'check', 'nothingPending', 'unknown',
    ] as const
    for (const lang of ['en', 'hi'] as const) {
      for (const key of keys) expect(formatSay(lang, { key })).not.toContain('—')
      expect(formatCompare(lang, { route: india, amount: 500, checked: 500, method: 'bank_deposit', rows, now })).not.toContain('—')
      expect(formatWhy(lang, { route: india, top: row({}) })).not.toContain('—')
    }
  })
})
