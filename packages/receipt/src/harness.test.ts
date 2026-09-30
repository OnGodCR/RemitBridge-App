import { describe, expect, it } from 'vitest'
import { accuracy, buildReport, formatReport, precision, sameValue, scoreFields, valuesOf } from './harness.ts'

describe('sameValue', () => {
  it('compares money to the cent and rates to a millionth', () => {
    expect(sameValue('fee', 4.99, 4.994)).toBe(true)
    expect(sameValue('fee', 4.99, 5)).toBe(false)
    expect(sameValue('exchange_rate', 17.2, 17.2000001)).toBe(true)
    expect(sameValue('exchange_rate', 17.2, 17.21)).toBe(false)
  })
  it('ignores case in codes and names, not in enums', () => {
    expect(sameValue('send_currency', 'usd', 'USD')).toBe(true)
    expect(sameValue('provider', 'Western Union', 'western union ')).toBe(true)
    expect(sameValue('funding_method', 'cash', 'cash')).toBe(true)
    expect(sameValue('transfer_date', '2026-09-28', '2026-09-27')).toBe(false)
  })
})

describe('scoring', () => {
  const scores = scoreFields(
    { amount_sent: 500, fee: 4.99, tax: 5, exchange_rate: 17.2 },
    { amount_sent: 500, fee: 5.99, exchange_rate: 17.2, pickup_charge: 0 },
  )

  it('sorts each field into correct, wrong, missing or extra', () => {
    expect(Object.fromEntries(scores.map((s) => [s.field, s.outcome]))).toEqual({
      amount_sent: 'correct',
      fee: 'wrong',
      tax: 'missing',
      exchange_rate: 'correct',
      pickup_charge: 'extra',
    })
  })

  it('reports accuracy over what the receipt shows and precision over what was read', () => {
    const report = buildReport([{ id: 'a', scores }])
    expect(report.overall).toEqual({ correct: 2, wrong: 1, missing: 1, extra: 1 })
    expect(accuracy(report.overall)).toBeCloseTo(2 / 4)
    expect(precision(report.overall)).toBeCloseTo(2 / 4)
    expect(accuracy(report.byField.provider)).toBeNull()
    const md = formatReport(report)
    expect(md).toContain('| fee | 0 | 1 | 0 | 0 | 0.0% | 0.0% |')
    expect(md).toContain('| provider | 0 | 0 | 0 | 0 | – | – |')
    expect(md).toContain('| **All fields** | 2 | 1 | 1 | 1 | 50.0% | 50.0% |')
  })

  it('pulls values out of read fields', () => {
    expect(valuesOf({ fee: { value: 4.99 }, tax: undefined })).toEqual({ fee: 4.99 })
  })
})
