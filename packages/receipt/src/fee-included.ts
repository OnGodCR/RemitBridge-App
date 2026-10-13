/**
 * Whether a receipt's "amount sent" already includes the fee (DECISIONS.md D77, D173).
 *
 * Most receipts put the fee on top: "You sent $200.00, fee $1.99, total $201.99", and $200 is
 * what gets converted. Some take it out: "Amount $200.00, fee $5.00, total $200.00", and only
 * $195 is converted. Reading every receipt the first way made the second kind fail its checks
 * and counted the fee twice in the cost (Angad, 2026-10-12: the scanner "simply needs to be
 * better"). The receipt itself says which: the total, or failing that, the amount received.
 */
import { roundingTolerance } from '../../formula/src/index.ts'

export interface Amounts {
  /** amount_sent */
  A?: number
  /** fee */
  F?: number
  /** tax */
  X?: number
  /** total_paid */
  P?: number
  /** exchange_rate */
  Q?: number
  /** amount_received */
  V?: number
  /** pickup_charge, in the receiving currency */
  R?: number
}

const TOTAL_TOLERANCE = 0.02

export function feeIncluded({ A, F = 0, X = 0, P, Q, V, R = 0 }: Amounts): boolean {
  if (A === undefined || !(F + X > 0)) return false
  if (P !== undefined) {
    // The total says it outright: equal to the amount means the fee was inside it.
    return Math.abs(P - A) <= TOTAL_TOLERANCE && Math.abs(P - (A + F + X)) > TOTAL_TOLERANCE
  }
  if (Q === undefined || V === undefined) return false
  // No total: only if the amount received fits the fee coming out, and doesn't fit it on top.
  const onTop = A * Q - R
  const inside = (A - F - X) * Q - R
  return Math.abs(inside - V) <= roundingTolerance(inside) && Math.abs(onTop - V) > roundingTolerance(onTop)
}

/** S in the formula: everything the sender paid. */
export function totalPaidBy(amounts: Amounts): number | undefined {
  const { A, F = 0, X = 0 } = amounts
  if (A === undefined) return undefined
  return feeIncluded(amounts) ? A : A + F + X
}
