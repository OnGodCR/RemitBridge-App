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
 *   T  transfer tax the provider collects, in the sending currency (DECISIONS.md D76)
 *
 * The fee comes off first and never reaches the exchange, so the markup applies
 * to S - F, not to S. Charging the markup on the gross amount counts the fee's
 * money twice. The tax is the same kind of money: S is everything the sender paid,
 * so a tax collected at the counter comes off before conversion too, and the markup
 * applies to S - F - T. With T = 0 (the default) every result is exactly the
 * website's TrueCost, which vectors.json pins; vectors.tax.json pins the tax.
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
  /** T: transfer tax collected with the transfer, sending currency (see remittanceTax) */
  transferTax?: number
}

export interface TransferCost {
  /** S - F - T: what actually gets converted */
  converted: number
  /** (S - F - T) * Q - R: what the recipient gets, receiving currency */
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
  /** the transfer tax, sending currency */
  taxCost: number
  /** fee + tax + markup + pickup, sending currency */
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
  transferTax = 0,
}: TransferInput): TransferCost {
  const S = sent
  const F = fee
  const Q = quotedRate
  const M = midRate
  const R = pickupCharge
  const T = transferTax

  const converted = S - F - T
  const amountReceived = converted * Q - R
  const benchmarkReceived = S * M
  const markupPct = ((M - Q) / M) * 100
  const markupCost = converted * ((M - Q) / M)
  const pickupCost = R / M
  const totalCost = F + T + markupCost + pickupCost

  return {
    converted,
    amountReceived,
    benchmarkReceived,
    shortfall: benchmarkReceived - amountReceived,
    markupPct,
    markupCost,
    pickupCost,
    feeCost: F,
    taxCost: T,
    totalCost,
    totalCostPct: (totalCost / S) * 100,
  }
}

/** Twelve identical transfers. No compounding, no assumption about future rates. */
export function yearlyCost(cost: TransferCost): { totalCost: number; shortfall: number } {
  return { totalCost: cost.totalCost * 12, shortfall: cost.shortfall * 12 }
}

/**
 * How a transfer was paid for, using the engine's payment-method names plus the two
 * physical instruments the remittance tax names (DECISIONS.md D83).
 */
export type FundingMethod =
  | 'bank_account'
  | 'debit_card'
  | 'credit_card'
  | 'cash'
  | 'money_order'
  | 'cashiers_check'

export const FUNDING_METHODS: readonly FundingMethod[] = [
  'bank_account',
  'debit_card',
  'credit_card',
  'cash',
  'money_order',
  'cashiers_check',
]

/**
 * Funding methods the US federal remittance tax applies to (IRC 4475): cash, a money
 * order, a cashier's check, or a similar physical instrument. Transfers paid from a bank
 * account or with a card are exempt.
 */
export const TAXED_FUNDING: ReadonlySet<FundingMethod> = new Set<FundingMethod>([
  'cash',
  'money_order',
  'cashiers_check',
])

export const REMITTANCE_TAX_RATE = 0.01
/** The tax covers transfers made after 2025-12-31. */
export const REMITTANCE_TAX_FROM = '2026-01-01'

/**
 * The 1% federal remittance tax on a transfer, in the sending currency, rounded half up
 * to the cent. The base is the transfer amount: what gets converted, without the fee or
 * the tax itself. That base is Claude's default and not yet checked against the IRS
 * regulations (DECISIONS.md D78), so anything showing it says so.
 *
 * @param transferAmount the transfer amount, sending currency
 * @param funding how the sender paid
 * @param date the transfer date as YYYY-MM-DD; before 2026-01-01 there was no tax. Unknown
 *   dates are treated as taxed, since every receipt scanned now is from 2026 or later.
 */
export function remittanceTax(transferAmount: number, funding: FundingMethod, date?: string): number {
  if (!TAXED_FUNDING.has(funding)) return 0
  if (date && date < REMITTANCE_TAX_FROM) return 0
  // toFixed strips binary noise first (100.5 * 0.01 * 100 is 100.50000000000001), so the
  // half-up rounding lands where decimal arithmetic would, as the Python twin's Decimal does.
  const cents = Number((transferAmount * REMITTANCE_TAX_RATE * 100).toFixed(6))
  return Math.round(cents) / 100
}

/**
 * Providers round, so two sides of the same sum can differ by a little. The engine's
 * publish gate allows the larger of 0.2% or one unit of the currency
 * (engine/src/remitbridge_engine/config.py MATH_TOLERANCE_*, DECISIONS.md D36); a test here
 * fails if the two ever drift apart.
 */
export const MATH_TOLERANCE_REL = 0.002
export const MATH_TOLERANCE_ABS = 1

export function roundingTolerance(expected: number): number {
  return Math.max(MATH_TOLERANCE_ABS, Math.abs(expected) * MATH_TOLERANCE_REL)
}
