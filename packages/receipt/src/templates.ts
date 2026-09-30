/**
 * Provider templates: what one provider's receipts look like, as data, so a new provider
 * is a new entry here rather than new code. The extractors (extract/fields.ts) read a
 * template to know which labels to look for and how numbers and dates are printed; the
 * synthetic receipt generator (benchmark, Phase 4) renders receipts from the same entries.
 *
 * Only the generic template is filled in, from the model disclosure forms in Regulation E
 * (12 CFR 1005.31 and the model forms in its Appendix A), which US remittance receipts
 * follow. The eight Tier 1 providers have their names only: their receipts' exact wording
 * should come from real receipts, not guesses (`basis: 'unverified'`). Until a template has
 * labels of its own, labelsFor() falls back to the generic ones.
 */
import type { FieldName, FieldValues } from './types.ts'

export interface ProviderTemplate {
  /** Stable ID, e.g. 'generic', 'western-union'. */
  id: string
  /** The row in `providers` this template belongs to; null for the generic template. */
  providerId: string | null
  /** The provider's name as the app shows it. */
  name: string
  /**
   * Text that marks a receipt as this provider's (brand names, legal names, web
   * addresses). Case-insensitive. How they're weighed is up to extractProvider.
   */
  identifiers: string[]
  /** The labels this provider prints for each field, most common first. */
  labels: Partial<Record<FieldName, string[]>>
  /**
   * Where a value sits relative to its label: on the same line ("Fee   $4.99"), on the
   * next line (label above value), or either.
   */
  layout: 'same_line' | 'next_line' | 'either'
  /** How numbers are printed. US receipts: decimal '.', thousands ','. */
  numberFormat: { decimal: '.' | ','; thousands: ',' | '.' | ' ' | '' }
  /** How dates are printed, in order of likelihood: tokens YYYY, MM, M, DD, D, MMM. */
  dateFormats: string[]
  /** Values that are nearly always true for this provider, as hints, never as answers. */
  hints?: Partial<Pick<FieldValues, 'send_currency'>>
  /** Where the labels came from. */
  basis: 'regulation' | 'real_receipts' | 'unverified'
  notes?: string
}

/**
 * The labels Regulation E's model forms use. Receipts from US providers must disclose these
 * items "using the terms" of the rule or substantially similar ones, so they're the best
 * default for a provider we haven't seen yet.
 */
export const GENERIC: ProviderTemplate = {
  id: 'generic',
  providerId: null,
  name: 'Unknown provider',
  identifiers: [],
  labels: {
    amount_sent: ['Transfer Amount', 'Amount Sent', 'Send Amount', 'You Sent', 'Amount'],
    fee: ['Transfer Fees', 'Transfer Fee', 'Fee', 'Fees', 'Service Fee'],
    tax: ['Transfer Taxes', 'Transfer Tax', 'Taxes', 'Tax', 'Federal Remittance Tax', 'Remittance Tax'],
    total_paid: ['Total', 'Total Paid', 'Total Amount', 'Amount Paid', 'You Paid'],
    exchange_rate: ['Exchange Rate', 'Rate', 'FX Rate'],
    amount_received: ['Total to Recipient', 'Amount Received', 'Recipient Gets', 'Recipient Receives', 'Payout Amount'],
    pickup_charge: ['Other Fees', 'Pickup Fee', 'Recipient Fees'],
    transfer_date: ['Date', 'Transaction Date', 'Date Sent', 'Transfer Date'],
    funding_method: ['Payment Method', 'Paid With', 'Payment Type', 'Funding Method', 'Paid By'],
    delivery_method: ['Delivery Method', 'Receive Method', 'Payout Method', 'Delivery Option'],
    provider: [],
    send_currency: [],
    receive_currency: [],
  },
  layout: 'either',
  numberFormat: { decimal: '.', thousands: ',' },
  dateFormats: ['MM/DD/YYYY', 'M/D/YYYY', 'MMM D, YYYY', 'YYYY-MM-DD'],
  hints: { send_currency: 'USD' },
  basis: 'regulation',
  notes: 'Terms from the Regulation E model forms (12 CFR part 1005, Appendix A, A-30 to A-41).',
}

/** A Tier 1 provider we know by name only. */
function unverified(providerId: string, name: string, identifiers: string[]): ProviderTemplate {
  return {
    id: providerId,
    providerId,
    name,
    identifiers,
    labels: {},
    layout: 'either',
    numberFormat: { decimal: '.', thousands: ',' },
    dateFormats: GENERIC.dateFormats,
    hints: { send_currency: 'USD' },
    basis: 'unverified',
    notes: 'Name only. Add labels from real receipts, then set basis to real_receipts.',
  }
}

/** Every template, generic last. IDs match `providers.id` (supabase/migrations). */
export const TEMPLATES: ProviderTemplate[] = [
  unverified('remitly', 'Remitly', ['Remitly']),
  unverified('wise', 'Wise', ['Wise', 'TransferWise']),
  unverified('xoom', 'Xoom', ['Xoom', 'a PayPal service']),
  unverified('western-union', 'Western Union', ['Western Union', 'WU', 'MTCN']),
  unverified('moneygram', 'MoneyGram', ['MoneyGram']),
  unverified('xe', 'Xe', ['Xe Money Transfer', 'xe.com']),
  unverified('worldremit', 'WorldRemit', ['WorldRemit']),
  unverified('ria', 'Ria', ['Ria Money Transfer', 'Ria']),
  GENERIC,
]

/** A template's labels for a field, or the generic ones when it has none of its own. */
export function labelsFor(template: ProviderTemplate, field: FieldName): string[] {
  const own = template.labels[field]
  return own && own.length ? own : (GENERIC.labels[field] ?? [])
}

/**
 * The template for a provider name, matched against template names and identifiers
 * (case- and space-insensitive); GENERIC when none matches.
 */
export function templateFor(providerName: string | undefined, templates: ProviderTemplate[] = TEMPLATES): ProviderTemplate {
  if (!providerName) return GENERIC
  const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const want = key(providerName)
  return (
    templates.find((t) => t.providerId && (key(t.name) === want || t.identifiers.some((i) => key(i) === want))) ??
    GENERIC
  )
}
