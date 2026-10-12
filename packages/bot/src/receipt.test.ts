import { describe, expect, it } from 'vitest'
import type { ConfirmResponse } from '../../receipt/src/api.ts'
import type { ExtractedFields } from '../../receipt/src/types.ts'
import {
  formatReceiptAck,
  formatReceiptFailed,
  formatReceiptQuestion,
  formatReceiptResult,
  formatReceiptUnreadable,
  readReceiptReply,
} from './receipt.ts'

const TODAY = '2026-09-30'
const f = (value: unknown, confidence = 0.95) => ({ value, confidence, path: 'model', validated: true })
const FIELDS = {
  provider: f('Western Union'),
  send_currency: f('USD'),
  receive_currency: f('MXN'),
  amount_sent: f(500),
  fee: f(4.99, 0.5),
  tax: f(5),
  total_paid: f(509.99),
  exchange_rate: f(17.2),
  amount_received: f(8560),
  pickup_charge: f(40),
  transfer_date: f('2026-09-28'),
  funding_method: f('cash'),
  delivery_method: f('cash_pickup'),
} as unknown as ExtractedFields

const result = (over: Partial<ConfirmResponse> = {}): ConfirmResponse => ({
  id: '11111111-1111-4111-8111-111111111111',
  fields: FIELDS,
  checks: [],
  suspect: null,
  missing: [],
  to_confirm: [],
  provider_id: 'western-union',
  route_id: 'us-mx',
  mid: { rate: 17.7, date: '2026-09-28', source: 'Frankfurter' },
  comparison: {
    quote: null,
    gap: { advertisedRate: 17.3, receiptRate: 17.2, gapAmount: 2.83, gapCurrency: 'USD' },
    reason: null,
  },
  best: { best: null, reason: 'no_prices' },
  disclosures_missing: [],
  ...over,
})

describe('reading an answer', () => {
  it.each([
    ['YES', 'fee', { kind: 'yes' }],
    ['haan', 'fee', { kind: 'yes' }],
    ['हाँ', 'fee', { kind: 'yes' }],
    ['$4.99', 'fee', { kind: 'value', value: 4.99 }],
    ['1,000.00 USD', 'amount_sent', { kind: 'value', value: 1000 }],
    ['४.९९', 'fee', { kind: 'value', value: 4.99 }],
    ['none', 'fee', { kind: 'value', value: 0 }],
    ['none', 'amount_sent', { kind: 'unclear' }],
    ['0', 'amount_sent', { kind: 'unclear' }],
    ['17.20', 'exchange_rate', { kind: 'value', value: 17.2 }],
    ['9/28/2026', 'transfer_date', { kind: 'value', value: '2026-09-28' }],
    ['Sep 28, 2026', 'transfer_date', { kind: 'value', value: '2026-09-28' }],
    ['2027-01-01', 'transfer_date', { kind: 'unclear' }],
    ['mxn', 'receive_currency', { kind: 'value', value: 'MXN' }],
    ['4', 'funding_method', { kind: 'value', value: 'cash' }],
    ['9', 'funding_method', { kind: 'unclear' }],
    ["cashier's check", 'funding_method', { kind: 'value', value: 'cashiers_check' }],
    ['debit card', 'funding_method', { kind: 'value', value: 'debit_card' }],
    ['नकद', 'funding_method', { kind: 'value', value: 'cash' }],
    ['upi', 'delivery_method', { kind: 'value', value: 'upi' }],
    ['Ria', 'provider', { kind: 'value', value: 'Ria' }],
    ['500 to india', 'fee', { kind: 'unclear' }],
  ] as const)('"%s" for %s', (text, field, expected) => {
    expect(readReceiptReply(text, field, TODAY)).toEqual(expected)
  })
})

describe('questions', () => {
  it('shows what was read and asks for YES or the right one', () => {
    const q = formatReceiptQuestion('en', 'fee', FIELDS, true)
    expect(q).toContain('I read your receipt.')
    expect(q).toContain('The fee reads "$4.99". Reply YES')
    expect(q).toContain('0 if there was none')
  })

  it('asks for a missing value, with options for a method', () => {
    const q = formatReceiptQuestion('en', 'funding_method', { ...FIELDS, funding_method: undefined }, false)
    expect(q).toContain("I couldn't read the way you paid. Pick one:")
    expect(q).toContain('4. cash')
    expect(q).toContain("6. cashier's check")
    expect(q).not.toContain('I read your receipt')
  })

  it('asks in Hindi', () => {
    const q = formatReceiptQuestion('hi', 'exchange_rate', FIELDS, true)
    expect(q).toContain('एक्सचेंज रेट "17.2"')
    expect(q).toContain('YES')
  })
})

describe('the result', () => {
  it('shows what arrived, the total cost as a list, the advertised rate, the tax and the source', () => {
    const r = formatReceiptResult('en', result(), [])
    expect(r).toContain('*Western Union* · 9/28/2026')
    expect(r).toContain('*MXN\u00a08,560.00* arrived.')
    expect(r).toMatch(/\*Total cost: \$\d+\.\d\d\* \(\d+\.\d%\)\n• Fee: \$4\.99\n• Exchange-rate markup: \$\d+\.\d\d\n• Tax: \$5\.00\n• Pickup charge: \$2\.26/)
    expect(r).toContain('Advertised that day: 17.3. Your rate: 17.2. That cost you $2.83 more.')
    // The tax is in the total here, so the bank-account comparison is shown.
    expect(r).toContain('Paid by cash, so the 1% federal tax ($5.00) applies. From a bank account, the total cost would have been')
    expect(r).toContain('Mid-market rate: 17.7 (Frankfurter, 9/28/2026)')
    expect(r).not.toContain('Not confirmed')
    // Blocks, each separated by a blank line, so it reads on a phone.
    expect(r.split('\n\n').length).toBeGreaterThanOrEqual(5)
  })

  it('with no tax line on a cash receipt, says what the tax would add, not a bank total equal to this one', () => {
    // Angad's test receipt, 2026-10-12: "applies", then "from a bank account, the total cost
    // would be" the same total, which read as a contradiction.
    const fields = { ...FIELDS, tax: undefined } as unknown as ExtractedFields
    const r = formatReceiptResult('en', result({ fields }), [])
    expect(r).toContain('This receipt shows no tax line. If it was charged, the total cost is $5.00 higher.')
    expect(r).not.toContain('From a bank account')
  })

  it('names disclosures not found, without blaming anyone', () => {
    const r = formatReceiptResult('en', result({ disclosures_missing: ['error_rights', 'cfpb_contact'] }), [])
    expect(r).toContain('Not on the receipt (the photo may have cut it off): your rights if there is an error, the CFPB’s contact details.')
    expect(formatReceiptResult('hi', result({ disclosures_missing: ['cfpb_contact'] }), [])).toContain('रसीद पर नहीं मिला')
  })

  it('says plainly when nothing could be compared, and names unconfirmed values', () => {
    const r = formatReceiptResult('en', result({ mid: null, comparison: { quote: null, gap: null, reason: 'no_quote' } }), ['fee'])
    expect(r).toContain("Couldn't get that day's mid-market rate")
    expect(r).toContain('We have no advertised price from that day to compare.')
    expect(r).toContain('Not confirmed: fee.')
  })

  it('leaves the tax out for a bank-funded transfer', () => {
    const fields = { ...FIELDS, funding_method: f('bank_account'), tax: undefined } as unknown as ExtractedFields
    expect(formatReceiptResult('en', result({ fields }), [])).not.toContain('federal tax')
  })

  it('has every reply in Hindi', () => {
    const r = formatReceiptResult('hi', result(), ['fee'])
    expect(r).toContain('पहुँचे')
    expect(r).toContain('कुल लागत')
    expect(r).toContain('फ़ीस')
    for (const s of [formatReceiptAck('hi'), formatReceiptUnreadable('hi'), formatReceiptFailed('hi')]) expect(s).toMatch(/[ऀ-ॿ]/)
  })
})
