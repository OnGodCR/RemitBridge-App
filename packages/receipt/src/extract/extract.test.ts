/**
 * The extractors on the cases the fixtures don't cover: wording, OCR slips, and the traps
 * each field's comment warns about. The fixtures (fixtures.test.ts) and the synthetic
 * benchmark cover whole receipts.
 */
import { describe, expect, it } from 'vitest'
import { pageFromLines } from '../ocr.ts'
import { parseReceipt } from '../parser.ts'
import { GENERIC } from '../templates.ts'
import { dateIn, moneyIn, parseNumber, rateIn } from './read.ts'

const TODAY = '2026-09-30'
const US = GENERIC.numberFormat
const read = (...lines: string[]) => parseReceipt(pageFromLines(lines), { today: TODAY }).fields

describe('reading helpers', () => {
  it('parses numbers as printed, and nothing else', () => {
    expect(parseNumber('1,000.50', US)).toBe(1000.5)
    expect(parseNumber('6327500', US)).toBe(6327500)
    expect(parseNumber('25,310', US)).toBe(25310)
    expect(parseNumber('1,00.5', US)).toBeNull()
    expect(parseNumber('1.000,50', { decimal: ',', thousands: '.' })).toBe(1000.5)
  })

  it('finds amounts with the currency printed next to them', () => {
    expect(moneyIn(['$500.00'], US)[0]).toMatchObject({ value: 500, code: null, dollar: true })
    expect(moneyIn(['500.00', 'USD'], US)[0]).toMatchObject({ value: 500, code: 'USD', start: 0, end: 2 })
    expect(moneyIn(['USD', '500.00'], US)[0]).toMatchObject({ value: 500, code: 'USD', start: 0, end: 2 })
    expect(moneyIn(['Us$750.00'], US)[0]).toMatchObject({ value: 750, code: 'USD' })
    expect(moneyIn(['₹88,150.00'], US)[0]).toMatchObject({ value: 88150, code: 'INR' })
    expect(moneyIn(['-', '40.00', 'MXN'], US)[0]).toMatchObject({ value: 40, code: 'MXN' })
    expect(moneyIn(['[hidden]', '6613'], US)).toHaveLength(1)
  })

  it('reads a sign OCR garbled as a smudge, not as a currency', () => {
    expect(moneyIn(['P10,878.32'], US)[0]).toMatchObject({ value: 10878.32, code: null, smudged: true })
    expect(moneyIn(['ACH'], US)).toEqual([])
  })

  it('reads rates either way round', () => {
    expect(rateIn(['1', 'USD', '=', '17.2000', 'MXN'], US, 'USD')).toMatchObject({ value: 17.2, receive: 'MXN', inverted: false })
    expect(rateIn(['US$1.00', '=', '24,809', 'VND'], US, 'USD')).toMatchObject({ value: 24809, receive: 'VND' })
    expect(rateIn(['1', 'USD', '=7.5241', 'GTQ'], US, 'USD')).toMatchObject({ value: 7.5241, receive: 'GTQ' })
    expect(rateIn(['1', 'MXN', '=', '0.0500', 'USD'], US, 'USD')).toMatchObject({ value: 20, receive: 'MXN', inverted: true })
    expect(rateIn(['54.7566', 'PHP'], US, 'USD')).toMatchObject({ value: 54.7566, receive: 'PHP' })
  })

  it('reads dates, month first unless the day settles it', () => {
    expect(dateIn(['09/08/2026'])?.value).toBe('2026-09-08')
    expect(dateIn(['28/09/2026'])?.value).toBe('2026-09-28')
    expect(dateIn(['Sep', '27,', '2026'])?.value).toBe('2026-09-27')
    expect(dateIn(['27', 'Sep', '2026'])?.value).toBe('2026-09-27')
    expect(dateIn(['2026-02-30'])).toBeNull()
  })
})

describe('extractors', () => {
  it('takes the sending-currency transfer amount, not the one in pesos', () => {
    const f = read('WESTERN UNION', 'Transfer Amount 8,600.00 MXN', 'Transfer Amount $500.00', 'Exchange Rate 1 USD = 17.2 MXN')
    expect(f.amount_sent?.value).toBe(500)
  })

  it('reads a value printed under its label, with less confidence', () => {
    const f = read('Remitly', 'Amount Sent', '250.00 USD', 'Fee:', '$2.99')
    expect(f.amount_sent).toMatchObject({ value: 250, confidence: 0.85, source: { line: 2 } })
    expect(f.fee?.value).toBe(2.99)
  })

  it('reads "No fee" and "FREE" as a zero fee', () => {
    expect(read('Remitly', 'Amount sent $100.00', 'Fee FREE').fee?.value).toBe(0)
    expect(read('Remitly', 'Amount sent $100.00', 'No fee').fee?.value).toBe(0)
  })

  it('adds up several fee lines, unsure of the sum', () => {
    const f = read('MoneyGram', 'Send amount $200.00', 'Transfer Fee $3.00', 'Service Fee $1.99')
    expect(f.fee).toMatchObject({ value: 4.99, confidence: 0.7 })
  })

  it('keeps the recipient’s total out of the sender’s total', () => {
    const f = read('Xoom', 'Transfer amount: $250.00', 'Total to recipient: 6327500 VND', 'Total: $252.99')
    expect(f.total_paid?.value).toBe(252.99)
    expect(f.amount_received?.value).toBe(6327500)
  })

  it('skips "Date Available" for the transfer date, and refuses the future', () => {
    expect(read('Ria Money Transfer', 'Date Available: 09/29/2026', 'Date: 09/28/2026').transfer_date?.value).toBe('2026-09-28')
    expect(read('Ria Money Transfer', 'Date: 10/28/2026').transfer_date).toBeUndefined()
  })

  it('matches provider names as whole words', () => {
    expect(read('Sender: Maria Lopez', 'Amount $100.00').provider).toBeUndefined()
    expect(read('Wor ldRemit', 'Payment receipt').provider?.value).toBe('WorldRemit')
    expect(read('Xoom, a PayPal service').provider).toMatchObject({ value: 'Xoom', confidence: 0.95 })
  })

  it('tells cashier’s checks from cash, and cash pickup from paying cash', () => {
    const f = read('Ria Money Transfer', "Paid With: Cashier's Check", 'Delivery Method: Cash Pickup')
    expect(f.funding_method?.value).toBe('cashiers_check')
    expect(f.delivery_method?.value).toBe('cash_pickup')
    const g = read('MoneyGram', 'Receive option: Cash Pickup', 'Payment: Money Order')
    expect(g.funding_method?.value).toBe('money_order')
    expect(g.delivery_method?.value).toBe('cash_pickup')
  })

  it('doubts a tax bigger than the 1% tax could be', () => {
    expect(read('Remitly', 'Amount sent $100.00', 'Taxes $50.00').tax?.confidence).toBeLessThan(0.8)
  })

  it('flags an amount received far from amount sent × rate', () => {
    const f = read('Remitly', 'Amount sent 100.00 USD', 'Exchange rate 1 USD = 88.00 INR', 'Recipient gets 18,800.00 INR')
    expect(f.amount_received?.confidence).toBeLessThan(0.8)
  })

  it('repairs ₹ read as a 3 only when the arithmetic agrees, and asks for a check', () => {
    const f = read('Xe Money Transfer', 'Amount Sent 200.00 USD', 'Rate 1 USD = 88.00 INR', 'Payout Amount: 317,600.00')
    expect(f.amount_received).toMatchObject({ value: 17600, confidence: 0.6 })
  })

  it('leaves a pickup charge printed in dollars to the validator', () => {
    const f = read('WESTERN UNION', 'Transfer Amount $100.00', 'Exchange Rate 1 USD = 17.2 MXN', 'Other Fees $2.00 USD')
    expect(f.pickup_charge).toBeUndefined()
  })

  it('reads every field with a confidence and a source line that exists', () => {
    const lines = ['Remitly', 'Sent on Sep 27, 2026', 'Paid with: Debit Card', 'Delivery: UPI', 'Amount sent 1,000.00 USD', 'Fee 0.00 USD']
    const result = parseReceipt(pageFromLines(lines), { today: TODAY })
    expect(result.problems).toEqual([])
    for (const field of Object.values(result.fields)) {
      expect(field.confidence).toBeGreaterThan(0)
      if (field.source) expect(lines[field.source.line]).toBeDefined()
    }
  })
})
