/**
 * Checking a receipt's numbers against each other with the one formula (DECISIONS.md D74),
 * scoring how far to trust each value, and, when a check fails, working out which value
 * was most likely misread so the person is asked about that one first.
 *
 * The checks:
 *   received  amount_received ≈ (S − F − T) × Q − R, from computeTransferCost, where
 *             S = amount_sent + fee + tax. Tolerance: the engine's (the larger of 0.2%
 *             or one unit of the receiving currency).
 *   total     total_paid ≈ amount_sent + fee + tax, within 2 cents.
 *   fee       the fee is less than the amount sent.
 *   currencies  the two currencies differ.
 *   rate      the rate is within 20% below to 5% above the mid-market rate for the day,
 *             when that's known. Outside that, it's a misread or the wrong currency,
 *             not a price anyone charges.
 */
import { computeTransferCost, roundingTolerance } from '../../formula/src/index.ts'
import { FIELD_SPECS } from './fields.ts'
import { LOW_CONFIDENCE, type ExtractedField, type ExtractedFields, type FieldName } from './types.ts'

export type CheckId = 'received' | 'total' | 'fee' | 'currencies' | 'rate'

export interface Check {
  id: CheckId
  ok: boolean
  /** The fields the check used. */
  fields: FieldName[]
  expected?: number
  actual?: number
  tolerance?: number
}

export interface Suspect {
  field: FieldName
  /** The value that would make the failing check pass, when there's one. */
  suggestion?: number
}

export interface Validation {
  checks: Check[]
  /** The fields with confidence and `validated` updated by the checks. */
  fields: ExtractedFields
  /** The value most likely misread, if a check failed. */
  suspect: Suspect | null
  /** Needed for a result and not read. */
  missing: FieldName[]
  /** For the person to confirm: the suspect first, then anything missing or unsure. */
  toConfirm: FieldName[]
}

/** Without these there's no total cost to show. */
export const REQUIRED: FieldName[] = [
  'provider',
  'send_currency',
  'receive_currency',
  'amount_sent',
  'fee',
  'exchange_rate',
  'amount_received',
  'transfer_date',
  'funding_method',
]

const TOTAL_TOLERANCE = 0.02
/** The rate band against mid-market: Q / M between these. */
const RATE_BAND = { low: 0.8, high: 1.05 }
/** A value a check backed up is trusted at least this much. */
const VALIDATED_CONFIDENCE = 0.95
/** The suspect's confidence drops to at most this, so it's asked about. */
const SUSPECT_CONFIDENCE = 0.3

export interface ValidateOptions {
  /** The mid-market rate for the currencies and date, receiving per 1 sending, if known. */
  midRate?: number | null
}

export function validateReceipt(input: ExtractedFields, options: ValidateOptions = {}): Validation {
  const num = (f: FieldName): number | undefined => {
    const v = input[f]?.value
    return typeof v === 'number' ? v : undefined
  }
  const A = num('amount_sent')
  const F = num('fee')
  const X = num('tax')
  const P = num('total_paid')
  const Q = num('exchange_rate')
  const V = num('amount_received')
  const R = num('pickup_charge')
  const M = options.midRate ?? undefined
  const checks: Check[] = []

  if (A !== undefined && Q !== undefined && V !== undefined) {
    // The one formula, with S = everything paid. Mid-market doesn't affect the amount
    // received, so the rate stands in for it here (as in the admin screen's check).
    const expected = computeTransferCost({
      sent: A + (F ?? 0) + (X ?? 0),
      fee: F ?? 0,
      transferTax: X ?? 0,
      quotedRate: Q,
      midRate: Q,
      pickupCharge: R ?? 0,
    }).amountReceived
    const tolerance = roundingTolerance(expected)
    checks.push({
      id: 'received',
      ok: Math.abs(expected - V) <= tolerance,
      fields: ['amount_sent', 'exchange_rate', 'amount_received', ...(R !== undefined ? (['pickup_charge'] as const) : [])],
      expected,
      actual: V,
      tolerance,
    })
  }
  if (P !== undefined && A !== undefined) {
    const expected = A + (F ?? 0) + (X ?? 0)
    checks.push({
      id: 'total',
      ok: Math.abs(expected - P) <= TOTAL_TOLERANCE,
      fields: ['total_paid', 'amount_sent', ...(F !== undefined ? (['fee'] as const) : []), ...(X !== undefined ? (['tax'] as const) : [])],
      expected,
      actual: P,
      tolerance: TOTAL_TOLERANCE,
    })
  }
  if (F !== undefined && A !== undefined) checks.push({ id: 'fee', ok: F < A, fields: ['fee'] })
  const sc = input.send_currency?.value
  const rc = input.receive_currency?.value
  if (sc && rc) checks.push({ id: 'currencies', ok: sc !== rc, fields: ['receive_currency'] })
  if (Q !== undefined && M) {
    const ratio = Q / M
    checks.push({ id: 'rate', ok: ratio >= RATE_BAND.low && ratio <= RATE_BAND.high, fields: ['exchange_rate'], expected: M, actual: Q })
  }

  const suspect = findSuspect(input, checks, { A, F, X, P, Q, V, R })

  // Confidence: backed by a passing check goes up; the suspect goes down.
  const failedFields = new Set(checks.filter((c) => !c.ok).flatMap((c) => c.fields))
  const passedFields = new Set(checks.filter((c) => c.ok).flatMap((c) => c.fields))
  const fields: ExtractedFields = {}
  for (const [name, field] of Object.entries(input) as [FieldName, ExtractedField][]) {
    let { confidence } = field
    let validated = field.path === 'user_corrected' || field.validated
    if (passedFields.has(name) && !failedFields.has(name)) {
      validated = true
      confidence = Math.max(confidence, VALIDATED_CONFIDENCE)
    }
    if (suspect?.field === name && field.path !== 'user_corrected') {
      validated = false
      confidence = Math.min(confidence, SUSPECT_CONFIDENCE)
    }
    ;(fields as Record<FieldName, ExtractedField>)[name] = { ...field, confidence, validated }
  }

  const missing = REQUIRED.filter((f) => !input[f])
  const unsure = (Object.keys(fields) as FieldName[]).filter((f) => fields[f]!.confidence < LOW_CONFIDENCE)
  const toConfirm = [...new Set([...(suspect ? [suspect.field] : []), ...missing, ...unsure])]
  return { checks, fields, suspect, missing, toConfirm }
}

// ---------------------------------------------------------------------------------------
// Which value is wrong
// ---------------------------------------------------------------------------------------

interface Numbers {
  A?: number
  F?: number
  X?: number
  P?: number
  Q?: number
  V?: number
  R?: number
}

/**
 * For each value a failing check used, the value that would make the check pass; then a
 * score for how likely the printed value was misread as the read one:
 *   - the reader's own doubt (1 − confidence);
 *   - whether the two look like an OCR slip: one digit different, two neighbors swapped,
 *     or the decimal point in the wrong place;
 *   - whether another passing check vouches for the value, or a failing one points at it
 *     too.
 * The highest score is the suspect. Values the person typed are never suspects.
 */
function findSuspect(fields: ExtractedFields, checks: Check[], n: Numbers): Suspect | null {
  const failed = new Map(checks.filter((c) => !c.ok).map((c) => [c.id, c]))
  const passed = new Set(checks.filter((c) => c.ok).map((c) => c.id))
  if (!failed.size) return null

  const candidates: { field: FieldName; suggestion?: number; score: number }[] = []
  const add = (field: FieldName, suggestion: number | undefined, bonus: number) => {
    const f = fields[field]
    if (f?.path === 'user_corrected') return
    if (suggestion !== undefined && !(suggestion > 0 || (FIELD_SPECS[field].zeroAllowed && suggestion >= 0))) return
    const read = typeof f?.value === 'number' ? f.value : undefined
    let score = 1 - (f?.confidence ?? 0) + bonus
    if (read !== undefined && suggestion !== undefined && looksLikeMisread(read, suggestion, FIELD_SPECS[field].kind === 'rate' ? 4 : 2)) {
      score += 0.5
    }
    const existing = candidates.find((c) => c.field === field)
    if (existing) {
      existing.score += score
      existing.suggestion ??= suggestion
    } else candidates.push({ field, suggestion, score })
  }
  const { A, F = 0, X = 0, P, Q, V, R = 0 } = n

  if (failed.has('received') && A !== undefined && Q !== undefined && V !== undefined) {
    const vouchedA = passed.has('total') ? -0.5 : 0
    const rateOff = failed.has('rate') ? 0.5 : passed.has('rate') ? -0.3 : 0
    add('amount_received', A * Q - R, 0)
    add('exchange_rate', (V + R) / A, rateOff)
    add('amount_sent', (V + R) / Q, vouchedA)
    if (fields.pickup_charge) add('pickup_charge', A * Q - V, 0)
  }
  if (failed.has('total') && P !== undefined && A !== undefined) {
    const vouchedA = passed.has('received') ? -0.5 : 0
    add('total_paid', A + F + X, 0)
    add('amount_sent', P - F - X, vouchedA)
    // A fee or tax that wasn't read is the likeliest reason a total doesn't add up.
    add('fee', P - A - X, fields.fee ? 0 : 0.6)
    if (fields.tax || X) add('tax', P - A - F, 0)
  }
  if (failed.has('fee')) add('fee', undefined, 0.5)
  if (failed.has('currencies')) add('receive_currency', undefined, 1)
  if (failed.has('rate') && !failed.has('received')) {
    // The amounts agree with the rate, so the rate was read right; the mid-market rate it
    // was compared with is for the wrong currency.
    add(passed.has('received') ? 'receive_currency' : 'exchange_rate', undefined, 0.5)
  }

  if (!candidates.length) return null
  candidates.sort((a, b) => b.score - a.score)
  const best = candidates[0]
  return best.suggestion === undefined ? { field: best.field } : { field: best.field, suggestion: round(best.suggestion, 6) }
}

const round = (x: number, places: number) => Number(x.toFixed(places))

/**
 * Whether `read` could be an OCR slip for `actual`: printed to `places` decimals, they
 * differ in one digit, in two neighboring digits swapped, or by a factor of 10 or 100
 * (a decimal point misplaced).
 */
export function looksLikeMisread(read: number, actual: number, places = 2): boolean {
  if (read <= 0 || actual <= 0) return false
  for (const k of [10, 100]) {
    const ratio = read / actual
    if (Math.abs(ratio - k) / k < 0.005 || Math.abs(1 / ratio - k) / k < 0.005) return true
  }
  const a = read.toFixed(places).replace('.', '')
  const b = actual.toFixed(places).replace('.', '')
  if (a.length !== b.length) return false
  const diffs = [...a].map((c, i) => (c !== b[i] ? i : -1)).filter((i) => i >= 0)
  if (diffs.length === 1) return true
  return diffs.length === 2 && diffs[1] === diffs[0] + 1 && a[diffs[0]] === b[diffs[1]] && a[diffs[1]] === b[diffs[0]]
}
