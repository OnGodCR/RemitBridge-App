import { describe, expect, it } from 'vitest'
import vectors from '../vectors.json'
import { computeTransferCost, yearlyCost, type TransferCost } from './index'

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
