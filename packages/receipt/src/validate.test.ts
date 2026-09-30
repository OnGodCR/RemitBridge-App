import { describe, expect, it } from 'vitest'
import type { ExtractedFields, FieldValues } from './types.ts'
import { looksLikeMisread, validateReceipt } from './validate.ts'

/** The Western Union fixture's values: 500 sent, 4.99 fee, 5 tax, 17.2 rate, 40 pickup. */
const GOOD: Partial<FieldValues> = {
  provider: 'Western Union',
  send_currency: 'USD',
  receive_currency: 'MXN',
  amount_sent: 500,
  fee: 4.99,
  tax: 5,
  total_paid: 509.99,
  exchange_rate: 17.2,
  amount_received: 8560,
  pickup_charge: 40,
  transfer_date: '2026-09-28',
  funding_method: 'cash',
}

const fields = (over: Partial<FieldValues> = {}, confidence = 0.9, drop: string[] = []): ExtractedFields =>
  Object.fromEntries(
    Object.entries({ ...GOOD, ...over })
      .filter(([k]) => !drop.includes(k))
      .map(([k, value]) => [k, { value, confidence, path: 'parser', validated: false }]),
  ) as ExtractedFields

describe('a receipt that adds up', () => {
  const v = validateReceipt(fields(), { midRate: 17.7 })

  it('passes every check, using the one formula for the amount received', () => {
    expect(v.checks.map((c) => [c.id, c.ok])).toEqual([
      ['received', true],
      ['total', true],
      ['fee', true],
      ['currencies', true],
      ['rate', true],
    ])
    expect(v.checks[0].expected).toBeCloseTo(8560, 9)
    expect(v.checks[0].tolerance).toBeCloseTo(17.12, 9)
  })

  it('marks the values the checks used as validated and trusted', () => {
    expect(v.fields.amount_received).toMatchObject({ validated: true, confidence: 0.95 })
    expect(v.fields.tax).toMatchObject({ validated: true })
    expect(v.fields.funding_method).toMatchObject({ validated: false, confidence: 0.9 })
    expect(v.suspect).toBeNull()
    expect(v.missing).toEqual([])
    expect(v.toConfirm).toEqual([])
  })

  it('allows the rounding a provider does', () => {
    expect(validateReceipt(fields({ amount_received: 8570 })).checks[0].ok).toBe(true)
  })

  it('doesn’t call an expensive rate a misread', () => {
    expect(validateReceipt(fields({ exchange_rate: 16, amount_received: 7960 }), { midRate: 17.7 }).suspect).toBeNull()
  })
})

describe('finding the misread value', () => {
  it('two digits swapped in the amount received', () => {
    const v = validateReceipt(fields({ amount_received: 8650 }))
    expect(v.suspect).toEqual({ field: 'amount_received', suggestion: 8560 })
    expect(v.fields.amount_received).toMatchObject({ confidence: 0.3, validated: false })
    expect(v.toConfirm[0]).toBe('amount_received')
  })

  it('a decimal point lost in the rate', () => {
    expect(validateReceipt(fields({ exchange_rate: 1.72 })).suspect).toEqual({ field: 'exchange_rate', suggestion: 17.2 })
    expect(validateReceipt(fields({ exchange_rate: 1.72 }), { midRate: 17.7 }).suspect?.field).toBe('exchange_rate')
  })

  it('an amount sent that breaks both the received and the total checks', () => {
    expect(validateReceipt(fields({ amount_sent: 5000 })).suspect).toEqual({ field: 'amount_sent', suggestion: 500 })
  })

  it('a fee that wasn’t read, when the total doesn’t add up without it', () => {
    const v = validateReceipt(fields({}, 0.9, ['fee']))
    expect(v.suspect).toEqual({ field: 'fee', suggestion: 4.99 })
    expect(v.missing).toEqual(['fee'])
    expect(v.toConfirm[0]).toBe('fee')
  })

  it('the lower-confidence value when nothing else tells them apart', () => {
    const f = fields({ amount_received: 9000 })
    f.exchange_rate!.confidence = 0.5
    expect(validateReceipt(f).suspect?.field).toBe('exchange_rate')
  })

  it('never a value the person typed', () => {
    const f = fields({ amount_received: 8650 })
    f.amount_received = { value: 8650, confidence: 1, path: 'user_corrected', validated: true }
    const v = validateReceipt(f)
    expect(v.suspect?.field).not.toBe('amount_received')
    expect(v.fields.amount_received).toMatchObject({ confidence: 1, validated: true })
  })

  it('the receiving currency when both currencies read the same', () => {
    expect(validateReceipt(fields({ receive_currency: 'USD' })).suspect).toEqual({ field: 'receive_currency' })
  })

  it('the receiving currency when the amounts agree but the rate is far from that currency’s mid-market', () => {
    expect(validateReceipt(fields(), { midRate: 88.2 }).suspect).toEqual({ field: 'receive_currency' })
  })

  it('a fee bigger than the amount sent', () => {
    const v = validateReceipt(fields({ fee: 4990 }, 0.9, ['total_paid']))
    expect(v.checks.find((c) => c.id === 'fee')?.ok).toBe(false)
    expect(v.suspect?.field).toBe('fee')
  })
})

describe('what’s missing', () => {
  it('lists required values that weren’t read, and asks about unsure ones', () => {
    // Without the pickup line, 500 × 17.2 = 8,600 arrives.
    const v = validateReceipt(fields({ amount_received: 8600 }, 0.6, ['transfer_date', 'funding_method', 'total_paid', 'tax', 'pickup_charge']))
    expect(v.missing).toEqual(['transfer_date', 'funding_method'])
    expect(v.toConfirm).toContain('provider')
    expect(v.toConfirm).not.toContain('amount_received')
  })
})

describe('looksLikeMisread', () => {
  it.each([
    [8650, 8560, true],
    [1.72, 17.2, true],
    [5000, 500, true],
    [4.99, 4.98, true],
    [4.99, 9.94, false],
    [500, 612, false],
    [0, 5, false],
  ])('%d for %d: %s', (read, actual, expected) => {
    expect(looksLikeMisread(read, actual)).toBe(expected)
  })
  it('compares rates to four places', () => {
    expect(looksLikeMisread(17.2, 17.02, 4)).toBe(true)
    expect(looksLikeMisread(17.25, 17.2, 4)).toBe(true)
    expect(looksLikeMisread(17.2, 18.5, 4)).toBe(false)
  })
})
