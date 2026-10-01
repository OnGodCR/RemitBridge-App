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
  REMITTANCE_TAX_SMALL,
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
  /** $15.00 or less: a small transfer, not taxed (D97). */
  | 'small_transfer'
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
  if (v.amount_sent <= REMITTANCE_TAX_SMALL) return none('small_transfer')

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

// ---------------------------------------------------------------------------------------
// What you could have kept (D119)
// ---------------------------------------------------------------------------------------

/** A published standing quote from any provider, with its name, for the comparison. */
export interface PriceCandidate extends QuoteCandidate {
  provider_name: string
}

export interface BestOption {
  /** 'that_day': prices from within a day of the transfer; 'today': the newest we have. */
  when: 'that_day' | 'today'
  provider_id: string
  provider_name: string
  captured_at: string
  /** The checked amount whose fee and rate were used. */
  checked_amount: number
  /** True when the receipt's amount isn't a checked amount, so the fee and rate are the
   * nearest checked amount's, run through the one formula (as Compare does). */
  estimated: boolean
  fee: number
  offered_rate: number
  /** What the family would have received sending the same amount this way. */
  received: number
  /** The true cost this way, and on the receipt, in the sending currency at the same
   * mid-market rate, so the two are measured with one ruler. */
  total_cost: number
  your_total_cost: number
  /** your_total_cost - total_cost, rounded to the cent. Zero or less: the receipt's
   * provider was as good or better than anything we had. */
  could_keep: number
  currency: string
  /** True when the best price we had is the receipt's own provider. */
  same_provider: boolean
  /** Set when the receipt was paid by card and we only had prices for paying from a bank
   * account: a card payer has a bank account, so it's a choice they had, and it's said. */
  paid_from: 'bank_account' | null
  /** Every provider whose price was compared, by name, so the result never reads as
   * covering providers we don't have. */
  providers_compared: string[]
}

export type BestResult =
  | { best: BestOption; reason: null }
  | { best: null; reason: 'no_route' | 'missing_values' | 'no_prices' | 'no_mid' }

/**
 * The cheapest way we had prices for to send the receipt's amount: same route, same way of
 * arriving and of paying when the receipt shows them (a cash pickup is never compared with
 * a bank deposit), standing prices only. Someone who paid by card is also compared with
 * paying from a bank account when that's all we have, and the result says so; someone who
 * paid cash or by money order isn't, since they may not have a bank account. Each option sends the same amount_sent, with its
 * own fee and rate and the same tax, and is costed with the one formula at the receipt's
 * mid-market rate, so "could keep" is the difference in true cost.
 *
 * `thatDay` are quotes captured near the transfer; `latest` the newest per provider. That
 * day's prices are used when there are any; otherwise today's, and the result says so.
 */
export function bestOption(
  v: Values,
  candidates: { thatDay: PriceCandidate[]; latest: PriceCandidate[] },
  midRate: number | null,
  receiptProviderId: string | null,
): BestResult {
  const inputs = formulaInputs(v)
  if (!inputs || !v.send_currency || v.amount_sent === undefined) return { best: null, reason: 'missing_values' }
  if (!(midRate && midRate > 0)) return { best: null, reason: 'no_mid' }
  const yours = computeTransferCost({ ...inputs, midRate })

  const fair = (funding: string | undefined) => (q: PriceCandidate) =>
    !q.is_promotional &&
    (!v.delivery_method || q.delivery_method === v.delivery_method) &&
    (!funding || q.payment_method === funding)
  const pick = (funding: string | undefined) => {
    const near = v.transfer_date ? matchingDay(candidates.thatDay.filter(fair(funding)), v.transfer_date) : []
    return { nearDay: near, pool: near.length ? near : candidates.latest.filter(fair(funding)) }
  }
  let { nearDay, pool } = pick(v.funding_method)
  let paidFrom: 'bank_account' | null = null
  if (!pool.length && (v.funding_method === 'debit_card' || v.funding_method === 'credit_card')) {
    ;({ nearDay, pool } = pick('bank_account'))
    paidFrom = pool.length ? 'bank_account' : null
  }
  if (!pool.length) return { best: null, reason: 'no_prices' }

  // One price per provider: the one nearest the transfer (or the newest).
  const byProvider = new Map<string, PriceCandidate>()
  const target = v.transfer_date ? Date.parse(`${v.transfer_date}T12:00:00Z`) : Date.now()
  for (const q of pool) {
    const held = byProvider.get(q.provider_id)
    const closer = (x: PriceCandidate) => Math.abs(Date.parse(x.captured_at) - (nearDay.length ? target : Date.now()))
    if (!held || closer(q) < closer(held)) byProvider.set(q.provider_id, q)
  }

  const options = [...byProvider.values()].map((q) => {
    const cost = computeTransferCost({
      sent: v.amount_sent! + q.fee + inputs.transferTax,
      fee: q.fee,
      transferTax: inputs.transferTax,
      quotedRate: q.offered_rate,
      midRate,
      pickupCharge: q.pickup_charge,
    })
    return { q, cost }
  })
  options.sort((a, b) => a.cost.totalCost - b.cost.totalCost)
  const { q, cost } = options[0]!
  return {
    best: {
      when: nearDay.length ? 'that_day' : 'today',
      provider_id: q.provider_id,
      provider_name: q.provider_name,
      captured_at: q.captured_at,
      checked_amount: q.send_amount,
      estimated: q.send_amount !== v.amount_sent,
      fee: q.fee,
      offered_rate: q.offered_rate,
      received: cost.amountReceived,
      total_cost: Math.round(cost.totalCost * 100) / 100,
      your_total_cost: Math.round(yours.totalCost * 100) / 100,
      could_keep: Math.round((yours.totalCost - cost.totalCost) * 100) / 100,
      currency: v.send_currency,
      same_provider: receiptProviderId !== null && q.provider_id === receiptProviderId,
      paid_from: paidFrom,
      providers_compared: [...new Set(options.map((o) => o.q.provider_name))].sort(),
    },
    reason: null,
  }
}

/** Quotes captured within a day and a half of the transfer day's middle, as matchQuote. */
function matchingDay(quotes: PriceCandidate[], transferDate: string): PriceCandidate[] {
  const midday = Date.parse(`${transferDate}T12:00:00Z`)
  if (Number.isNaN(midday)) return []
  return quotes.filter((q) => Math.abs(Date.parse(q.captured_at) - midday) <= 12 * 3_600_000 + DAY_MS)
}
