import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import vectors from '../vectors.json'
import taxVectors from '../vectors.tax.json'
import {
  computeTransferCost,
  FUNDING_METHODS,
  MATH_TOLERANCE_ABS,
  MATH_TOLERANCE_REL,
  remittanceTax,
  roundingTolerance,
  TAXED_FUNDING,
  yearlyCost,
  type FundingMethod,
  type TransferCost,
} from './index'

const close = (actual: number, expected: number) =>
  Math.abs(actual - expected) <= 1e-9 * Math.max(1, Math.abs(expected))

describe('matches the TrueCost vectors', () => {
  for (const c of vectors.cases) {
    it(c.name, () => {
      const got = computeTransferCost(c.input)
      for (const [key, expected] of Object.entries(c.expected)) {
        const actual = got[key as keyof TransferCost]
        expect(close(actual, expected), `${key}: ${actual} vs ${expected}`).toBe(true)
      }
    })
  }
})

describe('the invariant: cost in sending currency equals the shortfall in receiving currency', () => {
  for (const c of vectors.cases) {
    it(c.name, () => {
      const r = computeTransferCost(c.input)
      expect(close(r.totalCost * c.input.midRate, r.shortfall)).toBe(true)
    })
  }
})

describe('yearly cost', () => {
  it('multiplies by twelve and does nothing else', () => {
    const r = computeTransferCost({ sent: 200, fee: 8, quotedRate: 16.2, midRate: 17.05 })
    expect(yearlyCost(r).totalCost).toBeCloseTo(r.totalCost * 12, 12)
  })
})

describe('the remittance tax in the formula (vectors.tax.json)', () => {
  for (const c of taxVectors.cases) {
    it(c.name, () => {
      const got = computeTransferCost(c.input)
      for (const [key, expected] of Object.entries(c.expected)) {
        const actual = got[key as keyof TransferCost]
        expect(close(actual, expected), `${key}: ${actual} vs ${expected}`).toBe(true)
      }
    })
    it(`${c.name}: cost in sending currency still equals the shortfall`, () => {
      const r = computeTransferCost(c.input)
      expect(close(r.totalCost * c.input.midRate, r.shortfall)).toBe(true)
    })
  }

  it('a tax of zero changes nothing in any website vector', () => {
    for (const c of vectors.cases) {
      expect(computeTransferCost({ ...c.input, transferTax: 0 })).toEqual(computeTransferCost(c.input))
    }
  })

  it('taxes the transfer like a fee: the amount received drops by T times the rate', () => {
    const base = { sent: 510, fee: 5, quotedRate: 17.2, midRate: 17.7 }
    const untaxed = computeTransferCost(base)
    const taxed = computeTransferCost({ ...base, transferTax: 5 })
    expect(untaxed.amountReceived - taxed.amountReceived).toBeCloseTo(5 * 17.2, 9)
    expect(taxed.taxCost).toBe(5)
  })
})

describe('remittanceTax', () => {
  for (const c of taxVectors.tax) {
    it(c.name, () => {
      const { transferAmount, funding, date } = c.input as { transferAmount: number; funding: FundingMethod; date?: string }
      expect(remittanceTax(transferAmount, funding, date)).toBe(c.expected)
    })
  }

  it('applies to exactly the physical instruments', () => {
    expect([...TAXED_FUNDING].sort()).toEqual(['cash', 'cashiers_check', 'money_order'])
    expect(FUNDING_METHODS.filter((f) => !TAXED_FUNDING.has(f))).toEqual(['bank_account', 'debit_card', 'credit_card'])
  })
})

describe('rounding tolerance', () => {
  it('is the larger of 0.2% or one unit', () => {
    expect(roundingTolerance(100)).toBe(1)
    expect(roundingTolerance(41_550)).toBeCloseTo(83.1, 9)
  })

  it('matches the engine gate, so the app and the engine agree on what rounds', () => {
    const config = readFileSync(new URL('../../../engine/src/remitbridge_engine/config.py', import.meta.url), 'utf8')
    expect(config).toMatch(new RegExp(`^MATH_TOLERANCE_REL = ${MATH_TOLERANCE_REL}$`, 'm'))
    expect(config).toMatch(new RegExp(`^MATH_TOLERANCE_ABS = ${MATH_TOLERANCE_ABS.toFixed(1)}$`, 'm'))
  })
})
