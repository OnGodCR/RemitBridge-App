/**
 * What a checked receipt means (DECISIONS.md D76-D78, D82): its true cost through the one
 * formula, the federal remittance tax check, and the gap between the rate the provider
 * advertised that day and the rate on the receipt. Pure, so the app, the Edge Function
 * and the WhatsApp reply compute the same numbers.
 */
import {
  computeTransferCost,
  remittanceTax,
  REMITTANCE_TAX_FROM,
  TAXED_FUNDING,
  type FundingMethod,
  type TransferCost,
} from '../../formula/src/index.ts'
import type { ExtractedFields, FieldValues } from './types.ts'

type Values = Partial<FieldValues>

/** The receipt's values, however they were read. */
export function valuesFrom(fields: ExtractedFields): Values {
  const out: Values = {}
  for (const [k, f] of Object.entries(fields)) if (f) (out as Record<string, unknown>)[k] = f.value
  return out
}

/**
 * The formula's inputs from a receipt (D77): S is everything paid, amount_sent + fee + tax;
 * the fee and the tax come off before conversion. Null without the amount sent and rate.
 */
export function formulaInputs(v: Values): { sent: number; fee: number; transferTax: number; quotedRate: number; pickupCharge: number } | null {
  if (v.amount_sent === undefined || v.exchange_rate === undefined) return null
  const fee = v.fee ?? 0
  const transferTax = v.tax ?? 0
  return { sent: v.amount_sent + fee + transferTax, fee, transferTax, quotedRate: v.exchange_rate, pickupCharge: v.pickup_charge ?? 0 }
}

/** The receipt's true cost at the day's mid-market rate, through the one formula. */
export function receiptCost(v: Values, midRate: number): TransferCost | null {
  const inputs = formulaInputs(v)
  return inputs && midRate > 0 ? computeTransferCost({ ...inputs, midRate }) : null
}

// ---------------------------------------------------------------------------------------
// The tax check
// ---------------------------------------------------------------------------------------

export type TaxStatus =
  /** Paid from a bank account or card: the tax doesn't apply. */
  | 'not_taxed'
  /** Before 2026-01-01, when there was no tax. */
  | 'before_tax'
  /** The receipt doesn't say how it was paid. */
  | 'unknown_funding'
  /** Taxed, and the receipt's tax line matches 1%. */
  | 'matches'
  /** Taxed, and no tax line was found. */
  | 'not_found'
  /** Taxed, and the tax line differs from 1%. */
  | 'differs'

export interface TaxCheck {
  status: TaxStatus
  /** 1% of the transfer amount, when the tax applies. */
  expected: number | null
  /** The tax line on the receipt, if any. */
  found: number | null
  /**
   * The same transfer paid from a bank account: no tax, everything else the same. Shown
   * for taxed transfers so the difference is plain.
   */
  bankEquivalent: TransferCost | null
}

export function taxCheck(v: Values, midRate: number | null): TaxCheck {
  const found = v.tax ?? null
  const none = (status: TaxStatus): TaxCheck => ({ status, expected: null, found, bankEquivalent: null })
  if (!v.funding_method) return none('unknown_funding')
  if (!TAXED_FUNDING.has(v.funding_method as FundingMethod)) return none('not_taxed')
  if (v.transfer_date && v.transfer_date < REMITTANCE_TAX_FROM) return none('before_tax')
  if (v.amount_sent === undefined) return none('not_found')

  const expected = remittanceTax(v.amount_sent, v.funding_method, v.transfer_date)
  const status: TaxStatus = found === null ? 'not_found' : Math.abs(found - expected) <= 0.01 ? 'matches' : 'differs'
  const bankEquivalent = midRate ? receiptCost({ ...v, tax: 0 }, midRate) : null
  return { status, expected, found, bankEquivalent }
}

// ---------------------------------------------------------------------------------------
// Advertised vs. paid (D82)
// ---------------------------------------------------------------------------------------

/** A published quote, as much of it as matching needs. */
export interface QuoteCandidate {
  id: number
  provider_id: string
  route_id: string
  send_amount: number
  delivery_method: string
  payment_method: string
  fee: number
  offered_rate: number
  mid_market_rate: number
  pickup_charge: number
  is_promotional: boolean
  captured_at: string
}

const DAY_MS = 86_400_000

/**
 * The published standing quote to compare with: same delivery and payment method when the
 * receipt shows them, captured within 24 hours either side of the transfer day, nearest to
 * its middle. The caller has already narrowed to the provider, route and checked amount.
 * Promotions are left out: they're one-time offers, not the advertised price.
 */
export function matchQuote(
  quotes: QuoteCandidate[],
  receipt: { transferDate: string; deliveryMethod?: string; fundingMethod?: string },
): QuoteCandidate | null {
  const midday = Date.parse(`${receipt.transferDate}T12:00:00Z`)
  if (Number.isNaN(midday)) return null
  const within = 12 * 3_600_000 + DAY_MS
  const candidates = quotes
    .filter((q) => !q.is_promotional)
    .filter((q) => !receipt.deliveryMethod || q.delivery_method === receipt.deliveryMethod)
    .filter((q) => !receipt.fundingMethod || q.payment_method === receipt.fundingMethod)
    .map((q) => ({ q, distance: Math.abs(Date.parse(q.captured_at) - midday) }))
    .filter(({ distance }) => distance <= within)
    .sort((a, b) => a.distance - b.distance)
  return candidates[0]?.q ?? null
}

export interface Gap {
  advertisedRate: number
  receiptRate: number
  /**
   * What the receipt's rate cost compared with the advertised one, in the sending currency:
   * markup cost at the receipt's rate minus markup cost at the advertised rate, on the same
   * converted amount. Positive: the person got less than advertised.
   */
  gapAmount: number
  gapCurrency: string
}

export function advertisedGap(v: Values, quote: QuoteCandidate, midRate: number | null): Gap | null {
  const inputs = formulaInputs(v)
  if (!inputs || !v.send_currency) return null
  const M = midRate ?? quote.mid_market_rate
  if (!(M > 0)) return null
  const atReceipt = computeTransferCost({ ...inputs, midRate: M })
  const atAdvertised = computeTransferCost({ ...inputs, quotedRate: quote.offered_rate, midRate: M })
  return {
    advertisedRate: quote.offered_rate,
    receiptRate: inputs.quotedRate,
    gapAmount: Math.round((atReceipt.markupCost - atAdvertised.markupCost) * 100) / 100,
    gapCurrency: v.send_currency,
  }
}
