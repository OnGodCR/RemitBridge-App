/**
 * Shapes that move through the receipt pipeline (DECISIONS.md D72-D86): OCR output from
 * the phone, the fields read from it, and where each value came from.
 *
 * No imports beyond types, and relative paths with .ts extensions, so this package runs
 * unchanged in the app, in the scan-receipt Edge Function (Deno) and under Node.
 */
import type { FundingMethod } from '../../formula/src/index.ts'
import type { DeliveryMethod } from '../../../mobile/src/lib/routes.ts'

export type { DeliveryMethod, FundingMethod }

/**
 * Every value the pipeline reads from a receipt. The order is the order extractors run in
 * (see parser.ts): the provider first, because it picks the template the rest use.
 */
export const FIELD_NAMES = [
  'provider',
  'send_currency',
  'receive_currency',
  'amount_sent',
  'fee',
  'tax',
  'total_paid',
  'exchange_rate',
  'amount_received',
  'pickup_charge',
  'transfer_date',
  'funding_method',
  'delivery_method',
] as const

export type FieldName = (typeof FIELD_NAMES)[number]

/**
 * The type of each field's value, once read. Meanings are fixed by DECISIONS.md D77:
 * `amount_sent` is the transfer amount as printed, before the fee and the tax; `total_paid`
 * is the printed total; the formula's S is amount_sent + fee + tax.
 */
export interface FieldValues {
  /** The provider's name as it's known, e.g. "Western Union". */
  provider: string
  /** ISO 4217 code, e.g. "USD". */
  send_currency: string
  /** ISO 4217 code, e.g. "MXN". */
  receive_currency: string
  /** Transfer amount, sending currency, before the fee and the tax. */
  amount_sent: number
  /** Upfront fee, sending currency. 0 when the receipt says there was none. */
  fee: number
  /** Transfer tax collected by the provider, sending currency (the US 1% remittance tax). */
  tax: number
  /** Everything the sender paid, sending currency, as printed. */
  total_paid: number
  /** The provider's rate: receiving currency per 1 sending currency. */
  exchange_rate: number
  /** What the recipient gets, receiving currency. */
  amount_received: number
  /** Charged to the recipient at pickup, receiving currency. */
  pickup_charge: number
  /** The day the transfer was made, YYYY-MM-DD. */
  transfer_date: string
  funding_method: FundingMethod
  delivery_method: DeliveryMethod
}

/** Where a value came from (the `extraction_path` column): parser, model or the person. */
export type ExtractionPath = 'parser' | 'model' | 'user_corrected'

/** Pixels in the photo, origin top left. */
export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export interface OcrWord {
  text: string
  box: Box
}

export interface OcrLine {
  /** The words, in reading order. A line's text is always its words joined by spaces. */
  words: OcrWord[]
  box: Box
}

/** What OCR found on one photo: lines of words, each with its box. */
export interface OcrPage {
  width: number
  height: number
  lines: OcrLine[]
}

/** Where on the page a value was read: a line, and optionally a run of its words. */
export interface SourceSpan {
  line: number
  /** First word, and one past the last. The whole line when absent. */
  words?: [start: number, end: number]
}

/** One value as an extractor or the model returns it. */
export interface ParsedField<K extends FieldName = FieldName> {
  value: FieldValues[K]
  /** 0 to 1: how sure the reader is. Below LOW_CONFIDENCE, the model is asked too. */
  confidence: number
  /** Where it was read, for highlighting on the confirmation screen. */
  source?: SourceSpan
}

export type ParsedFields = { [K in FieldName]?: ParsedField<K> }

/** A value after the pipeline: where it came from, and whether a check backed it up. */
export interface ExtractedField<K extends FieldName = FieldName> extends ParsedField<K> {
  path: ExtractionPath
  /** True once an arithmetic check that uses it passed, or the person confirmed it. */
  validated: boolean
}

export type ExtractedFields = { [K in FieldName]?: ExtractedField<K> }

/** Below this, a parsed value goes to the model as well (DECISIONS.md D79). */
export const LOW_CONFIDENCE = 0.8
