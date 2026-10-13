import { describe, expect, it } from 'vitest'
import { feeIncluded, totalPaidBy } from './fee-included.ts'
import { formulaInputs, receiptCost } from './result.ts'
import type { ExtractedFields, FieldValues } from './types.ts'
import { validateReceipt } from './validate.ts'

/** A receipt that took its $5 fee out of the $200: $195 converted at 17.5, so MXN 3,412.50. */
const INSIDE: Partial<FieldValues> = {
  send_currency: 'USD',
  receive_currency: 'MXN',
  amount_sent: 200,
  fee: 5,
  total_paid: 200,
  exchange_rate: 17.5,
  amount_received: 3412.5,
  funding_method: 'bank_account',
}

const fields = (v: Partial<FieldValues>): ExtractedFields =>
  Object.fromEntries(
    Object.entries(v).map(([k, value]) => [k, { value, confidence: 0.9, path: 'parser', validated: false }]),
  ) as ExtractedFields

describe('feeIncluded (D173)', () => {
  it('reads the fee as on top when the total is the amount plus the fee', () => {
    expect(feeIncluded({ A: 200, F: 1.99, P: 201.99 })).toBe(false)
    expect(totalPaidBy({ A: 200, F: 1.99, P: 201.99 })).toBe(201.99)
  })

  it('reads the fee as inside the amount when the total equals the amount', () => {
    expect(feeIncluded({ A: 200, F: 5, P: 200 })).toBe(true)
    expect(totalPaidBy({ A: 200, F: 5, P: 200 })).toBe(200)
  })

  it('without a total, goes by which reading the amount received fits', () => {
    expect(feeIncluded({ A: 200, F: 5, Q: 17.5, V: 3412.5 })).toBe(true)
    expect(feeIncluded({ A: 200, F: 5, Q: 17.5, V: 3500 })).toBe(false)
    // Neither fits (a misread somewhere): keep the usual reading and let the checks flag it.
    expect(feeIncluded({ A: 200, F: 5, Q: 17.5, V: 3000 })).toBe(false)
  })

  it('needs a fee or tax to have anything to include', () => {
    expect(feeIncluded({ A: 200, F: 0, P: 200 })).toBe(false)
    expect(feeIncluded({ A: 200 })).toBe(false)
  })
})

describe('a fee-included receipt end to end', () => {
  it('passes its checks instead of flagging a value that was read right', () => {
    const v = validateReceipt(fields(INSIDE), { midRate: 18 })
    expect(v.checks.filter((c) => !c.ok)).toEqual([])
    expect(v.suspect).toBeNull()
  })

  it('counts the fee once: S is the $200 paid, not $205', () => {
    expect(formulaInputs(INSIDE)?.sent).toBe(200)
    const cost = receiptCost(INSIDE, 18)!
    expect(cost.amountReceived).toBeCloseTo(3412.5, 2)
    expect(cost.feeCost).toBe(5)
    // The markup: 195 x (18 - 17.5) / 18 = 5.42 dollars.
    expect(cost.markupCost).toBeCloseTo(5.42, 2)
  })

  it('leaves fee-on-top receipts exactly as before', () => {
    const onTop = { ...INSIDE, total_paid: 205, amount_received: 3500 }
    expect(formulaInputs(onTop)?.sent).toBe(205)
    expect(validateReceipt(fields(onTop), { midRate: 18 }).checks.every((c) => c.ok)).toBe(true)
  })
})
