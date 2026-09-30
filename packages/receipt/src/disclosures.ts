/**
 * The disclosure check (Phase 6, DECISIONS.md D95): which of the items a US remittance
 * receipt is expected to show (Regulation E, 12 CFR 1005.31(b)(2)) could not be found on
 * this one. It reads the redacted text and the values read from it, so it runs the same on
 * the phone's scan and a WhatsApp photo.
 *
 * "Not found" is all it can say. A photo can cut off the bottom of a receipt, OCR can miss
 * small print, and a provider may print an item on a separate page. The wording on every
 * surface says so; it never says a provider broke a rule.
 */
import { TAXED_FUNDING, type FundingMethod } from '../../formula/src/index.ts'
import { lineText } from './ocr.ts'
import type { FieldValues, OcrPage } from './types.ts'

export const DISCLOSURE_ITEMS = [
  'transfer_amount',
  'fees',
  'taxes',
  'total',
  'exchange_rate',
  'amount_received',
  'date_available',
  'recipient',
  'error_rights',
  'cancellation',
  'provider_contact',
  'cfpb_contact',
] as const
export type DisclosureItem = (typeof DISCLOSURE_ITEMS)[number]

/** Words that show an item is on the receipt, read from the (redacted) text. */
const TEXT_SIGNS: Partial<Record<DisclosureItem, RegExp>> = {
  date_available: /\b(date available|available (on|for pick ?up|by)|funds? (will be )?available|availability)\b/i,
  // The name itself is hidden by redaction; the label stays.
  recipient: /\b(recipient|receiver|beneficiary|payee|pay to)\b|^to\s*:/im,
  error_rights: /\b(right to dispute|dispute (an )?errors?|error resolution|if you think there (is|was|has been) an error)\b/i,
  cancellation: /\b(cancel(l?ation)?|full refund)\b/i,
  // Not "contact us" alone: the error-rights notice says that too.
  provider_contact: /\b(questions or complaints|customer (service|care|support)|call us|visit us|www\.|https?:\/\/)/i,
  cfpb_contact: /\b(consumer financial protection bureau|consumerfinance\.gov|cfpb)\b/i,
}

export interface DisclosureResult {
  item: DisclosureItem
  found: boolean
}

/**
 * Each item that applies, and whether it was found. Taxes apply only to a cash-type
 * transfer (D90); the rest always do. Amounts count as found when a value was read for
 * them, the rest when their words appear anywhere in the text.
 */
export function checkDisclosures(page: OcrPage, values: Partial<FieldValues>): DisclosureResult[] {
  const text = page.lines.map(lineText).join('\n')
  const taxed = values.funding_method ? TAXED_FUNDING.has(values.funding_method as FundingMethod) : false
  const byValue: Partial<Record<DisclosureItem, boolean>> = {
    transfer_amount: values.amount_sent !== undefined,
    fees: values.fee !== undefined,
    total: values.total_paid !== undefined,
    exchange_rate: values.exchange_rate !== undefined,
    amount_received: values.amount_received !== undefined,
  }
  if (taxed) byValue.taxes = values.tax !== undefined
  return DISCLOSURE_ITEMS.filter((item) => item !== 'taxes' || taxed).map((item) => ({
    item,
    found: item in byValue ? byValue[item]! : TEXT_SIGNS[item]!.test(text),
  }))
}

/** Just the items not found, in the standard order. */
export function missingDisclosures(page: OcrPage, values: Partial<FieldValues>): DisclosureItem[] {
  return checkDisclosures(page, values)
    .filter((d) => !d.found)
    .map((d) => d.item)
}
