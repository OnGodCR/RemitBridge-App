import { describe, expect, it } from 'vitest'
import { checkValue, deserializeValue, FIELD_SPECS, serializeValue } from './fields.ts'
import { FIELD_NAMES } from './types.ts'

const TODAY = '2026-09-30'

describe('checkValue', () => {
  it('has a spec for every field', () => {
    expect(Object.keys(FIELD_SPECS).sort()).toEqual([...FIELD_NAMES].sort())
  })

  it('normalizes currency codes and text', () => {
    expect(checkValue('send_currency', ' usd ', TODAY)).toEqual({ ok: true, value: 'USD' })
    expect(checkValue('provider', '  Western   Union ', TODAY)).toEqual({ ok: true, value: 'Western Union' })
  })

  it('refuses malformed currencies', () => {
    expect(checkValue('receive_currency', 'MXNN', TODAY).ok).toBe(false)
    expect(checkValue('receive_currency', 17.2, TODAY).ok).toBe(false)
  })

  it('allows a zero fee, tax or pickup charge but not a zero amount', () => {
    expect(checkValue('fee', 0, TODAY).ok).toBe(true)
    expect(checkValue('tax', 0, TODAY).ok).toBe(true)
    expect(checkValue('pickup_charge', 0, TODAY).ok).toBe(true)
    expect(checkValue('amount_sent', 0, TODAY).ok).toBe(false)
    expect(checkValue('amount_received', 0, TODAY).ok).toBe(false)
  })

  it('refuses negative, non-finite and string amounts', () => {
    expect(checkValue('fee', -1, TODAY).ok).toBe(false)
    expect(checkValue('amount_sent', Number.NaN, TODAY).ok).toBe(false)
    expect(checkValue('amount_sent', '500', TODAY).ok).toBe(false)
    expect(checkValue('exchange_rate', 0, TODAY).ok).toBe(false)
  })

  it('takes real dates up to today', () => {
    expect(checkValue('transfer_date', '2026-09-30', TODAY).ok).toBe(true)
    expect(checkValue('transfer_date', '2026-10-01', TODAY).ok).toBe(false)
    expect(checkValue('transfer_date', '2026-02-30', TODAY).ok).toBe(false)
    expect(checkValue('transfer_date', '09/28/2026', TODAY).ok).toBe(false)
    expect(checkValue('transfer_date', '1999-12-31', TODAY).ok).toBe(false)
  })

  it('takes only the listed funding and delivery methods', () => {
    expect(checkValue('funding_method', 'cashiers_check', TODAY).ok).toBe(true)
    expect(checkValue('funding_method', 'check', TODAY).ok).toBe(false)
    expect(checkValue('delivery_method', 'upi', TODAY).ok).toBe(true)
    expect(checkValue('delivery_method', 'wire', TODAY).ok).toBe(false)
  })
})

describe('stored values', () => {
  it('round-trip through text', () => {
    expect(deserializeValue('exchange_rate', serializeValue(17.2), TODAY)).toEqual({ ok: true, value: 17.2 })
    expect(deserializeValue('transfer_date', serializeValue('2026-09-28'), TODAY)).toEqual({ ok: true, value: '2026-09-28' })
    expect(deserializeValue('amount_sent', 'abc', TODAY).ok).toBe(false)
  })
})
