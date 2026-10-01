import { describe, expect, it } from 'vitest'
import { computeTransferCost } from '../../formula/src/index.ts'
import {
  advertisedGap,
  bestOption,
  formulaInputs,
  matchQuote,
  receiptCost,
  taxCheck,
  valuesFrom,
  type PriceCandidate,
  type QuoteCandidate,
} from './result.ts'
import type { FieldValues } from './types.ts'

/** The Western Union fixture: $500 cash, $4.99 fee, $5 tax, 17.2, 40 MXN pickup. */
const WU: Partial<FieldValues> = {
  send_currency: 'USD',
  receive_currency: 'MXN',
  amount_sent: 500,
  fee: 4.99,
  tax: 5,
  exchange_rate: 17.2,
  amount_received: 8560,
  pickup_charge: 40,
  transfer_date: '2026-09-28',
  funding_method: 'cash',
  delivery_method: 'cash_pickup',
}

describe('true cost', () => {
  it('feeds the one formula with S = amount sent + fee + tax', () => {
    expect(formulaInputs(WU)).toEqual({ sent: 509.99, fee: 4.99, transferTax: 5, quotedRate: 17.2, pickupCharge: 40 })
    const cost = receiptCost(WU, 17.7)!
    expect(cost).toEqual(computeTransferCost({ sent: 509.99, fee: 4.99, transferTax: 5, quotedRate: 17.2, midRate: 17.7, pickupCharge: 40 }))
    expect(cost.amountReceived).toBeCloseTo(8560, 9)
    expect(cost.taxCost).toBe(5)
  })

  it('needs the amount and the rate, and a mid-market rate', () => {
    expect(formulaInputs({ amount_sent: 500 })).toBeNull()
    expect(receiptCost(WU, 0)).toBeNull()
  })

  it('reads values from extracted fields', () => {
    expect(valuesFrom({ fee: { value: 4.99, confidence: 1, path: 'parser', validated: true } })).toEqual({ fee: 4.99 })
  })
})

describe('the tax check', () => {
  it('leaves out small transfers of $15 or less, as the proposed rules do (D97)', () => {
    expect(taxCheck({ ...WU, amount_sent: 15, tax: undefined }, 17.7).status).toBe('small_transfer')
    expect(taxCheck({ ...WU, amount_sent: 15.01, tax: 0.15 }, 17.7).status).toBe('matches')
  })

  it('finds a correct 1% on a cash transfer, and shows the bank-funded equivalent', () => {
    const t = taxCheck(WU, 17.7)
    expect(t).toMatchObject({ status: 'matches', expected: 5, found: 5 })
    expect(t.bankEquivalent!.totalCost).toBeCloseTo(receiptCost(WU, 17.7)!.totalCost - 5, 9)
    expect(t.bankEquivalent!.amountReceived).toBeCloseTo(8560, 9)
  })

  it('says when the tax line is missing or differs', () => {
    expect(taxCheck({ ...WU, tax: undefined }, null).status).toBe('not_found')
    expect(taxCheck({ ...WU, tax: 6 }, null)).toMatchObject({ status: 'differs', expected: 5, found: 6 })
    expect(taxCheck({ ...WU, funding_method: 'money_order', tax: 5 }, null).status).toBe('matches')
  })

  it('doesn’t apply to bank or card funding, or before 2026', () => {
    expect(taxCheck({ ...WU, funding_method: 'debit_card' }, 17.7)).toMatchObject({ status: 'not_taxed', expected: null, bankEquivalent: null })
    expect(taxCheck({ ...WU, transfer_date: '2025-12-31' }, 17.7).status).toBe('before_tax')
    expect(taxCheck({ ...WU, funding_method: undefined }, 17.7).status).toBe('unknown_funding')
  })
})

const quote = (over: Partial<QuoteCandidate>): QuoteCandidate => ({
  id: 1,
  provider_id: 'western-union',
  route_id: 'us-mx',
  send_amount: 500,
  delivery_method: 'cash_pickup',
  payment_method: 'cash',
  fee: 4.99,
  offered_rate: 17.3,
  mid_market_rate: 17.7,
  pickup_charge: 0,
  is_promotional: false,
  captured_at: '2026-09-28T15:00:00Z',
  ...over,
})

describe('matching the advertised price', () => {
  const r = { transferDate: '2026-09-28', deliveryMethod: 'cash_pickup', fundingMethod: 'cash' }

  it('takes the capture nearest the transfer day', () => {
    const got = matchQuote([quote({ id: 1, captured_at: '2026-09-27T03:00:00Z' }), quote({ id: 2, captured_at: '2026-09-28T10:00:00Z' })], r)
    expect(got?.id).toBe(2)
  })

  it('allows 24 hours either side of the day, and no more', () => {
    expect(matchQuote([quote({ captured_at: '2026-09-27T00:30:00Z' })], r)).not.toBeNull()
    expect(matchQuote([quote({ captured_at: '2026-09-26T23:30:00Z' })], r)).toBeNull()
    expect(matchQuote([quote({ captured_at: '2026-09-30T00:30:00Z' })], r)).toBeNull()
  })

  it('keeps to the receipt’s delivery and payment method, and leaves promotions out', () => {
    expect(matchQuote([quote({ delivery_method: 'bank_deposit' })], r)).toBeNull()
    expect(matchQuote([quote({ payment_method: 'bank_account' })], r)).toBeNull()
    expect(matchQuote([quote({ is_promotional: true })], r)).toBeNull()
    expect(matchQuote([quote({ delivery_method: 'bank_deposit' })], { transferDate: '2026-09-28' })).not.toBeNull()
  })

  it('works out the gap in the sending currency with the formula', () => {
    const g = advertisedGap(WU, quote({}), 17.7)!
    // 500 converted; (17.3 − 17.2) / 17.7 × 500 = 2.82
    expect(g).toEqual({ advertisedRate: 17.3, receiptRate: 17.2, gapAmount: 2.82, gapCurrency: 'USD' })
    expect(advertisedGap(WU, quote({ offered_rate: 17.2 }), 17.7)!.gapAmount).toBe(0)
    expect(advertisedGap(WU, quote({ offered_rate: 17.1 }), null)!.gapAmount).toBeLessThan(0)
  })
})

describe('what you could have kept (D119)', () => {
  /** $500 to India from a bank account into a bank account, on Sep 30. */
  const BANK: Partial<FieldValues> = {
    send_currency: 'USD',
    receive_currency: 'INR',
    amount_sent: 500,
    fee: 3.99,
    exchange_rate: 94.5,
    transfer_date: '2026-09-30',
    funding_method: 'bank_account',
    delivery_method: 'bank_deposit',
  }
  const MID = 96
  const price = (over: Partial<PriceCandidate>): PriceCandidate => ({
    id: 1,
    provider_id: 'instarem',
    provider_name: 'Instarem',
    route_id: 'us-in',
    send_amount: 500,
    delivery_method: 'bank_deposit',
    payment_method: 'bank_account',
    fee: 0,
    offered_rate: 95.5,
    mid_market_rate: MID,
    pickup_charge: 0,
    is_promotional: false,
    captured_at: '2026-09-30T13:00:00Z',
    ...over,
  })
  const wise = price({ id: 2, provider_id: 'wise', provider_name: 'Wise', fee: 9.17, offered_rate: 96 })

  it('picks the lowest true cost and says what the difference is, with one formula', () => {
    const r = bestOption(BANK, { thatDay: [price({}), wise], latest: [] }, MID, null)
    expect(r.reason).toBeNull()
    const b = r.best!
    expect(b.provider_name).toBe('Instarem')
    expect(b.when).toBe('that_day')
    const yours = computeTransferCost({ sent: 503.99, fee: 3.99, transferTax: 0, quotedRate: 94.5, midRate: MID, pickupCharge: 0 })
    const theirs = computeTransferCost({ sent: 500, fee: 0, transferTax: 0, quotedRate: 95.5, midRate: MID, pickupCharge: 0 })
    expect(b.your_total_cost).toBeCloseTo(yours.totalCost, 2)
    expect(b.total_cost).toBeCloseTo(theirs.totalCost, 2)
    expect(b.could_keep).toBeCloseTo(yours.totalCost - theirs.totalCost, 2)
    expect(b.received).toBeCloseTo(47750, 6)
    expect(b.providers_compared).toEqual(['Instarem', 'Wise'])
    expect(b.estimated).toBe(false)
    expect(b.paid_from).toBeNull()
  })

  it("uses today's prices when there are none from that day, and says so", () => {
    const old = price({ captured_at: '2026-09-20T12:00:00Z' })
    const r = bestOption(BANK, { thatDay: [old], latest: [price({ captured_at: '2026-10-01T07:00:00Z' })] }, MID, null)
    expect(r.best?.when).toBe('today')
  })

  it('never compares a different way of arriving, or a promotion', () => {
    const cash: Partial<FieldValues> = { ...BANK, delivery_method: 'cash_pickup' }
    expect(bestOption(cash, { thatDay: [price({})], latest: [price({})] }, MID, null)).toEqual({ best: null, reason: 'no_prices' })
    expect(bestOption(BANK, { thatDay: [price({ is_promotional: true })], latest: [] }, MID, null).reason).toBe('no_prices')
  })

  it('compares a card payer with paying from a bank account, and says so; never a cash payer', () => {
    const card = bestOption({ ...BANK, funding_method: 'debit_card' }, { thatDay: [price({})], latest: [] }, MID, null)
    expect(card.best?.paid_from).toBe('bank_account')
    const cash = bestOption({ ...BANK, funding_method: 'cash' }, { thatDay: [price({})], latest: [] }, MID, null)
    expect(cash.reason).toBe('no_prices')
  })

  it('says when the receipt already had the best price, and when the amount was estimated', () => {
    const r = bestOption({ ...BANK, fee: 0, exchange_rate: 95.5 }, { thatDay: [price({})], latest: [] }, MID, 'instarem')
    expect(r.best?.same_provider).toBe(true)
    expect(r.best?.could_keep).toBe(0)
    const odd = bestOption({ ...BANK, amount_sent: 650 }, { thatDay: [price({})], latest: [] }, MID, null)
    expect(odd.best?.estimated).toBe(true)
  })

  it('needs the amount, the rate and a mid-market rate', () => {
    expect(bestOption({ ...BANK, exchange_rate: undefined }, { thatDay: [price({})], latest: [] }, MID, null).reason).toBe('missing_values')
    expect(bestOption(BANK, { thatDay: [price({})], latest: [] }, null, null).reason).toBe('no_mid')
  })
})
