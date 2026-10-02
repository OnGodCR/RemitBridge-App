/**
 * Reading helpers the extractors share (fields.ts): which line carries which label, the
 * value after a label, amounts with their currency, rates and dates. Plain rules over the
 * OCR words, so every value keeps the words it came from.
 */
import { HIDDEN } from '../redact.ts'
import { labelsFor, type ProviderTemplate } from '../templates.ts'
import { FIELD_NAMES, type FieldName, type OcrPage, type SourceSpan } from '../types.ts'

/** Currency codes a receipt might print. Three-letter words outside this set ("ACH", "UPI") aren't currencies. */
const CURRENCIES = new Set(
  (
    'USD MXN INR PHP VND GTQ HNL NIO CRC DOP COP PEN BRL CLP ARS BOB HTG JMD CAD EUR GBP CNY ' +
    'PKR BDT NPR LKR NGN GHS KES UGX TZS ETB SOS ERN XOF XAF EGP MAD JOD LBP THB IDR MYR KRW ' +
    'JPY AUD NZD AED SAR ZAR TRY UAH PLN RON'
  ).split(' '),
)

/** Currencies whose amounts are printed with a bare "$", so "$" alone can't say which it is. */
const DOLLAR_SIGN = new Set(['USD', 'MXN', 'CAD', 'AUD', 'NZD', 'COP', 'CLP', 'ARS', 'DOP'])

const SYMBOLS: [string, string | null][] = [
  ['US$', 'USD'],
  ['$', null],
  ['₹', 'INR'],
  ['₱', 'PHP'],
  ['₫', 'VND'],
  ['€', 'EUR'],
  ['£', 'GBP'],
]

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/** A word as labels are compared: lower case, without the punctuation around it. */
export function norm(word: string): string {
  return word.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').replace(/[’`]/g, "'")
}

/** Whether a word carries no letters or digits (a lone ":", "-", "+"). */
const isPunct = (word: string) => !/[\p{L}\p{N}]/u.test(word)

// ---------------------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------------------

export interface LabelHit {
  field: FieldName
  line: number
  /** The word just after the label. */
  end: number
  label: string
}

/**
 * The label each line starts with, if any, across every field's labels. The longest label
 * wins, so "Total to Recipient" is the amount received and not "Total", and "Transfer Fees"
 * is the fee and not "Transfer Amount". Labels count only at the start of a line, which keeps
 * "Other Fees" out of the fee and "Date Available" out of the date (its value isn't a date).
 */
export function labelHits(page: OcrPage, template: ProviderTemplate): LabelHit[] {
  const labels = FIELD_NAMES.flatMap((field) =>
    labelsFor(template, field).map((label) => ({ field, label, tokens: label.split(/\s+/).map(norm) })),
  ).sort((a, b) => b.tokens.length - a.tokens.length || b.label.length - a.label.length)

  const hits: LabelHit[] = []
  page.lines.forEach((line, i) => {
    let first = 0
    while (first < line.words.length && isPunct(line.words[first].text)) first++
    const words = line.words.slice(first).map((w) => norm(w.text))
    const match = labels.find((l) => l.tokens.every((t, j) => words[j] === t))
    if (match) hits.push({ field: match.field, line: i, end: first + match.tokens.length, label: match.label })
  })
  return hits
}

/** The lines labeled as `field`, top to bottom. */
export function hitsFor(page: OcrPage, template: ProviderTemplate, field: FieldName): LabelHit[] {
  return labelHits(page, template).filter((h) => h.field === field)
}

export interface ValueWords {
  line: number
  /** Index of the first word in `words` within its line. */
  offset: number
  words: string[]
  /** False when the label stood alone and the value is on the next line. */
  sameLine: boolean
}

/**
 * The words that carry a label's value: the rest of its line, or, when the label stands
 * alone ("Amount Sent" with "250.00 USD" under it), the next line, unless that line is a
 * label of its own.
 */
export function valueAfter(page: OcrPage, hit: LabelHit, labeled: Set<number>): ValueWords | null {
  const line = page.lines[hit.line]
  let start = hit.end
  while (start < line.words.length && isPunct(line.words[start].text)) start++
  if (start < line.words.length) {
    return { line: hit.line, offset: start, words: line.words.slice(start).map((w) => w.text), sameLine: true }
  }
  const next = page.lines[hit.line + 1]
  if (!next || labeled.has(hit.line + 1) || !next.words.length) return null
  return { line: hit.line + 1, offset: 0, words: next.words.map((w) => w.text), sameLine: false }
}

/** Every labeled line's value for `field`. */
export function valuesFor(page: OcrPage, template: ProviderTemplate, field: FieldName): (ValueWords & { label: string })[] {
  const all = labelHits(page, template)
  const labeled = new Set(all.map((h) => h.line))
  return all
    .filter((h) => h.field === field)
    .map((h) => {
      const v = valueAfter(page, h, labeled)
      return v && { ...v, label: h.label }
    })
    .filter((v) => v !== null)
}

// ---------------------------------------------------------------------------------------
// Amounts
// ---------------------------------------------------------------------------------------

export interface Money {
  value: number
  /** The currency printed with it (a code, "US$" or a symbol like ₹), or null. */
  code: string | null
  /** Printed with a bare "$", which several currencies use. */
  dollar: boolean
  /**
   * Printed after one stray character, which is how OCR often reads a currency sign it
   * doesn't know (₱ as "P", ₫ as "d", ₹ as "¥" or "%"). The number is likely right, but the
   * reading deserves a check.
   */
  smudged: boolean
  /** Words [start, end) in the line, currency included. */
  start: number
  end: number
}

/** A number as the template prints them: "1,000.50" → 1000.5. Null for anything else. */
export function parseNumber(text: string, format: ProviderTemplate['numberFormat']): number | null {
  const esc = (c: string) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const grouped = format.thousands ? `\\d{1,3}(?:${esc(format.thousands)}\\d{3})+|` : ''
  const re = new RegExp(`^(${grouped}\\d+)(?:${esc(format.decimal)}(\\d+))?$`)
  const m = text.match(re)
  if (!m) return null
  const whole = format.thousands ? m[1].split(format.thousands).join('') : m[1]
  const value = Number(m[2] ? `${whole}.${m[2]}` : whole)
  return Number.isFinite(value) ? value : null
}

const codeOf = (word: string | undefined): string | null => {
  if (!word) return null
  const c = word.replace(/[^A-Za-z]/g, '')
  return c.length === 3 && c === c.toUpperCase() && CURRENCIES.has(c) ? c : null
}

/**
 * Every amount in a run of words, with the currency printed next to it: "$500.00",
 * "500.00 USD", "USD 500.00", "₹88,150.00", "+ $4.99", "- 40.00 MXN". Signs are dropped;
 * receipts use them for layout, not for negative amounts. Hidden words are skipped.
 */
export function moneyIn(words: string[], format: ProviderTemplate['numberFormat']): Money[] {
  const out: Money[] = []
  for (let i = 0; i < words.length; i++) {
    const raw = words[i]
    if (raw === HIDDEN) continue
    // Signs are layout; "=" is the rate's ("1 USD =7.52 GTQ").
    let text = raw.replace(/^[+\-−–=]+|=+$/g, '')
    let start = i
    let code: string | null = null
    let dollar = false
    let symbolSeen = false
    let smudged = false
    for (const [symbol, symbolCode] of SYMBOLS) {
      if (text.toUpperCase().startsWith(symbol)) {
        text = text.slice(symbol.length)
        code = symbolCode
        dollar = symbolCode === null
        symbolSeen = true
        break
      }
    }
    // A symbol on its own, with the number as the next word ("$ 500.00").
    if (symbolSeen && !text && i + 1 < words.length) {
      i++
      text = words[i]
    }
    text = text.replace(/[,;:)]+$/, '').replace(/\.$/, '')
    let value = parseNumber(text, format)
    if (value === null && !symbolSeen && /^[^\d\s]\d/.test(text)) {
      value = parseNumber(text.slice(1), format)
      smudged = value !== null
    }
    if (value === null) continue
    let end = i + 1
    if (!code) {
      const after = codeOf(words[i + 1])
      const before = codeOf(words[start - 1])
      if (after) {
        code = after
        end = i + 2
      } else if (before) {
        code = before
        start -= 1
      }
      if (code) dollar = false
    }
    out.push({ value, code, dollar, smudged, start, end })
  }
  return out
}

/**
 * Whether an amount can be in `currency`: printed with that code, with no currency at all,
 * or with a bare "$" when the currency is written that way.
 */
export function canBe(m: Money, currency: string | undefined): boolean {
  if (m.code) return !currency || m.code === currency
  if (m.dollar) return !currency || DOLLAR_SIGN.has(currency)
  return true
}

/** Where an amount sits, for the confirmation screen's highlight. */
export function spanOf(v: ValueWords, m: Pick<Money, 'start' | 'end'>): SourceSpan {
  return { line: v.line, words: [v.offset + m.start, v.offset + m.end] }
}

// ---------------------------------------------------------------------------------------
// Exchange rates
// ---------------------------------------------------------------------------------------

export interface Rate {
  /** Receiving currency per 1 sending currency. */
  value: number
  /** The receiving currency, when the line names it. */
  receive: string | null
  /** The sending currency, when the line names it. */
  send: string | null
  inverted: boolean
  start: number
  end: number
}

/**
 * A rate from a run of words: "1 USD = 17.2000 MXN", "US$1.00 = 17.2000 MXN", "17.2000 MXN",
 * or "1 MXN = 0.0581 USD" (inverted). `send` is the sending currency if known.
 */
export function rateIn(words: string[], format: ProviderTemplate['numberFormat'], send: string | undefined): Rate | null {
  const amounts = moneyIn(words, format)
  if (!amounts.length) return null
  const eq = words.findIndex((w) => w.includes('='))
  const codeOrUsd = (m: Money) => m.code ?? (m.dollar ? (send ?? 'USD') : null)
  if (eq >= 0) {
    // "=" may be its own word or stuck to either number ("US$1.00=", "=17.20").
    const eqWord = words[eq]
    const left = amounts.filter((m) => m.start < eq || (m.start === eq && /=$/.test(eqWord))).pop()
    const right = amounts.find((m) => m !== left && (m.start > eq || (m.start === eq && /^=/.test(eqWord))))
    if (!left || !right || left.value <= 0 || right.value <= 0) return null
    const l = codeOrUsd(left)
    const r = codeOrUsd(right)
    if (send && r === send && l && l !== send) {
      return { value: left.value / right.value, receive: l, send: r, inverted: true, start: left.start, end: right.end }
    }
    return { value: right.value / left.value, receive: r, send: l, inverted: false, start: left.start, end: right.end }
  }
  const m = amounts.find((a) => !send || codeOrUsd(a) !== send)
  return m ? { value: m.value, receive: m.code, send: null, inverted: false, start: m.start, end: m.end } : null
}

// ---------------------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, '0')

function iso(y: number, m: number, d: number): string | null {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null
  const t = new Date(Date.UTC(y, m - 1, d))
  if (t.getUTCMonth() !== m - 1) return null
  return `${y}-${pad(m)}-${pad(d)}`
}

export interface DateAt {
  value: string
  start: number
  end: number
}

/**
 * The first date in a run of words: 09/28/2026, 9/28/2026, 28/09/2026 (only when the day
 * settles it), 2026-09-28, "Sep 27, 2026", "27 Sep 2026". US receipts write the month first.
 */
export function dateIn(words: string[]): DateAt | null {
  for (let i = 0; i < words.length; i++) {
    const w = words[i].replace(/[,.;:)]+$/, '')
    let m = w.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
    if (m) {
      const a = Number(m[1])
      const b = Number(m[2])
      const value = a > 12 ? iso(Number(m[3]), b, a) : iso(Number(m[3]), a, b)
      if (value) return { value, start: i, end: i + 1 }
    }
    m = w.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (m) {
      const value = iso(Number(m[1]), Number(m[2]), Number(m[3]))
      if (value) return { value, start: i, end: i + 1 }
    }
    const month = MONTHS.indexOf(norm(w).slice(0, 3))
    if (month >= 0 && /^[a-z]+\.?$/i.test(w)) {
      const day = words[i + 1]?.match(/^(\d{1,2}),?$/)
      const year = words[i + 2]?.match(/^(\d{4})[,.]?$/)
      if (day && year) {
        const value = iso(Number(year[1]), month + 1, Number(day[1]))
        if (value) return { value, start: i, end: i + 3 }
      }
    }
    const day = w.match(/^(\d{1,2})$/)
    const after = MONTHS.indexOf(norm(words[i + 1] ?? '').slice(0, 3))
    const year = words[i + 2]?.match(/^(\d{4})[,.]?$/)
    if (day && after >= 0 && year && /^[a-z]+\.?,?$/i.test(words[i + 1])) {
      const value = iso(Number(year[1]), after + 1, Number(day[1]))
      if (value) return { value, start: i, end: i + 3 }
    }
  }
  return null
}
