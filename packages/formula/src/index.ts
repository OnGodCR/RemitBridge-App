/**
 * The one total-cost formula (the TrueCost method, PRD 14.4).
 *
 * Every surface that states what a transfer costs goes through this function or
 * its Python twin in `python/remitbridge_formula`. Both are pinned to
 * `vectors.json`, which was generated from the website's TrueCost code, so no two
 * tools can disagree about the same transfer.
 *
 * Symbols:
 *   S  amount sent, in the sending currency
 *   F  upfront fee, in the sending currency
 *   Q  the provider's exchange rate, receiving per 1 sending
 *   M  the mid-market rate, receiving per 1 sending
 *   R  charge at pickup, in the receiving currency
 *
 * The fee comes off first and never reaches the exchange, so the markup applies
 * to S - F, not to S. Charging the markup on the gross amount counts the fee's
 * money twice.
 */

export interface TransferInput {
  /** S: amount sent, sending currency */
  sent: number
  /** F: upfront fee, sending currency */
  fee?: number
  /** Q: provider's rate, receiving per 1 sending */
  quotedRate: number
  /** M: mid-market rate, receiving per 1 sending */
  midRate: number
  /** R: pickup charge, receiving currency */
  pickupCharge?: number
}

export interface TransferCost {
  /** S - F: what actually gets converted */
  converted: number
  /** (S - F) * Q - R: what the recipient gets, receiving currency */
  amountReceived: number
  /** S * M: what would arrive with no fee and no markup */
  benchmarkReceived: number
  /** benchmarkReceived - amountReceived, receiving currency */
  shortfall: number
  /** exchange-rate markup as a percentage of the mid-market rate (negative = better than mid-market) */
  markupPct: number
  /** cost of the markup, sending currency */
  markupCost: number
  /** pickup charge converted at mid-market, sending currency */
  pickupCost: number
  /** the fee, sending currency */
  feeCost: number
  /** fee + markup + pickup, sending currency */
  totalCost: number
  /** totalCost as a percentage of the amount sent */
  totalCostPct: number
}

export function computeTransferCost({
  sent,
  fee = 0,
  quotedRate,
  midRate,
  pickupCharge = 0,
}: TransferInput): TransferCost {
  const S = sent
  const F = fee
  const Q = quotedRate
  const M = midRate
  const R = pickupCharge

  const converted = S - F
  const amountReceived = converted * Q - R
  const benchmarkReceived = S * M
  const markupPct = ((M - Q) / M) * 100
  const markupCost = converted * ((M - Q) / M)
  const pickupCost = R / M
  const totalCost = F + markupCost + pickupCost

  return {
    converted,
    amountReceived,
    benchmarkReceived,
    shortfall: benchmarkReceived - amountReceived,
    markupPct,
    markupCost,
    pickupCost,
    feeCost: F,
    totalCost,
    totalCostPct: (totalCost / S) * 100,
  }
}

/** Twelve identical transfers. No compounding, no assumption about future rates. */
export function yearlyCost(cost: TransferCost): { totalCost: number; shortfall: number } {
  return { totalCost: cost.totalCost * 12, shortfall: cost.shortfall * 12 }
}
