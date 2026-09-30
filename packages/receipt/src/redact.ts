/**
 * Finding and hiding personal details on a receipt (DECISIONS.md D71). Runs on the phone
 * before anything leaves it, and again on the server over the text that arrived, as a
 * second line of defense.
 *
 * The rules hide too much rather than too little. They hide:
 *   - whatever follows a sender, recipient, name or address label, on that line or on the
 *     lines under it, unless it's an amount ("Total to Recipient 8,600.00" stays);
 *   - street addresses, unit numbers, PO boxes, city-state-ZIP and C.P. lines;
 *   - phone numbers, email addresses and UPI handles;
 *   - card numbers (Luhn-checked) and masked cards ("****4821");
 *   - anything after an account, routing, CLABE, IFSC, reference, confirmation or MTCN
 *     label that looks like an ID;
 *   - any word with seven or more digits that isn't printed as money, and IDs like
 *     "RB12345678".
 * Amounts, rates, dates, currency codes, field labels and the provider's name stay.
 *
 * Words the rules hide can't be shown again; the person can hide any other word by hand
 * ('manual'). Hidden words become HIDDEN in the text, and solid boxes on the image.
 */
import { lineText, unionBox, wordOffsets } from './ocr.ts'
import { GENERIC } from './templates.ts'
import type { Box, OcrPage } from './types.ts'

/** What a hidden word reads as in text sent anywhere. */
export const HIDDEN = '[hidden]'

export type PiiKind = 'labeled' | 'address' | 'phone' | 'email' | 'card' | 'account' | 'long_number' | 'manual'

export interface Redaction {
  line: number
  word: number
  kind: PiiKind
}

// --- what money, dates and labels look like, so they're left alone -----------------------

const CURRENCY_WORD = /^(?:[A-Z]{3}|US\$|\$|MX\$|₹|₱|₫|€|£)$/
/** "1,234.56", "500.00", "8,600", "12,650,000", "$4.99", "17.2000"; not "206.555.0142" */
const MONEY = /(?:^|[\s$₹₱₫€£])\d{1,3}(?:,\d{3})+(?:\.\d+)?\b|\b\d+\.\d{2,6}\b(?!\.\d)/
const DATE_WORD = /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}$/
/** An amount anywhere in the text: money formatting, or a number beside a currency. */
function isAmountText(s: string): boolean {
  return MONEY.test(s) || /(?:^|\s)\d[\d,.]*\s+[A-Z]{3}\b/.test(s) || /(?:\b[A-Z]{3}\b|[$₹₱₫€£])\s?\d/.test(s)
}

const FIELD_LABELS = Object.values(GENERIC.labels)
  .flat()
  .map((l) => l.toLowerCase())
  .sort((a, b) => b.length - a.length)

function startsWithFieldLabel(text: string): boolean {
  const t = text.toLowerCase()
  return FIELD_LABELS.some((l) => t.startsWith(l))
}

/** Words that make a line a receipt field rather than a name or a place. */
const FIELD_WORD =
  /\b(?:amount|fees?|tax(?:es)?|total|rate|date|payment|paid|delivery|receives?|gets|send|method|option|funding|pickup|available)\b/i
/** "Label: value", the shape of a new field. */
const LABELED = /^[^:]{1,30}:/

// --- labels -------------------------------------------------------------------------------

/** Labels that introduce a person or a place. The ambiguous ones need a colon. */
const PERSON_LABEL =
  /\b(?:sender|sent by|recipient|receiver|beneficiary|remitter|payee|pay to|customer|address|dear|remitente|beneficiario|destinatario|direcci[oó]n)\b\s*:?|\b(?:from|to|name|nombre)\s*:/i
const ADDRESS_LABEL = /\b(?:address|direcci[oó]n)\b/i
/** Labels that introduce an account or a transaction ID. */
const ID_LABEL =
  /\b(?:account|acct|a\/c|iban|clabe|routing|ifsc|swift|bic|upi|mtcn|confirmation|reference|ref|tracking|transaction id|txn|pin|card)\b\s*(?:no\.?|number|#|id)?\s*:?/i

// --- patterns anywhere on a line ----------------------------------------------------------

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
const UPI_HANDLE = /\b[\w.-]{2,}@[a-z]{2,}\b/gi
const PHONE_US = /(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}\b/g
const PHONE_INTL = /\+\d[\d\s-]{7,16}\d/g
const CARD_RUN = /\b(?:\d[ -]?){12,18}\d\b/g
const MASKED_CARD = /(?:[*xX•#]{2,}[\s-]?){1,4}\d{2,4}\b/g
const STREET =
  /\b\d{1,6}\s+(?:[NSEW]\.?\s+)?(?:[A-Za-z0-9]+\.?\s+){0,4}(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|way|ct|court|pl|place|hwy|highway|pkwy|parkway|ter|terrace|cir|circle|calle|av)\b/i
const UNIT = /\b(?:apt|apartment|suite|ste|unit|p\.?\s?o\.?\s?box)\b\.?\s*#?\s*\w+/i
const CITY_STATE_ZIP = /\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/
const MX_POSTAL = /\bC\.?\s?P\.?\s*\d{5}\b/

function luhn(digits: string): boolean {
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i])
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return sum % 10 === 0
}

const digitCount = (s: string) => (s.match(/\d/g) ?? []).length

/** A word that is an ID rather than an amount, date or label. */
function looksLikeId(word: string): boolean {
  const w = word.replace(/^[#:([]+|[):,;\].]+$/g, '')
  if (!w || w === HIDDEN || DATE_WORD.test(w) || MONEY.test(w)) return false
  return (digitCount(w) >= 4 && /^[A-Za-z0-9#-]+$/.test(w)) || /@/.test(w)
}

export function detectPii(page: OcrPage): Redaction[] {
  const found = new Map<string, Redaction>()
  const hide = (line: number, word: number, kind: PiiKind) => {
    if (page.lines[line]?.words[word]?.text === HIDDEN) return
    const key = `${line}:${word}`
    if (!found.has(key)) found.set(key, { line, word, kind })
  }
  const hideLine = (line: number, kind: PiiKind) => page.lines[line].words.forEach((_, w) => hide(line, w, kind))
  const hideSpan = (line: number, start: number, end: number, kind: PiiKind) =>
    wordOffsets(page.lines[line]).forEach((o, w) => {
      if (o.start < end && o.end > start) hide(line, w, kind)
    })
  const matchAll = (line: number, text: string, re: RegExp, kind: PiiKind, accept: (m: string) => boolean = () => true) => {
    re.lastIndex = 0
    for (let m = re.exec(text); m; m = re.exec(text)) if (accept(m[0])) hideSpan(line, m.index, m.index + m[0].length, kind)
  }
  /** A line under a label that's still part of the labeled value (not an amount or a new field). */
  const continues = (line: number) => {
    const l = page.lines[line]
    if (!l) return false
    const t = lineText(l)
    return (
      !isAmountText(t) &&
      !startsWithFieldLabel(t) &&
      !FIELD_WORD.test(t) &&
      !LABELED.test(t) &&
      !PERSON_LABEL.test(t) &&
      !ID_LABEL.test(t)
    )
  }

  page.lines.forEach((l, i) => {
    const text = lineText(l)
    const words = l.words

    // Whole-line addresses.
    if (STREET.test(text) || UNIT.test(text) || CITY_STATE_ZIP.test(text) || MX_POSTAL.test(text)) hideLine(i, 'address')

    // Patterns anywhere.
    matchAll(i, text, EMAIL, 'email')
    matchAll(i, text, UPI_HANDLE, 'account')
    matchAll(i, text, PHONE_US, 'phone')
    matchAll(i, text, PHONE_INTL, 'phone')
    matchAll(i, text, CARD_RUN, 'card', (m) => {
      const d = m.replace(/\D/g, '')
      return d.length >= 13 && d.length <= 19 && luhn(d)
    })
    matchAll(i, text, MASKED_CARD, 'card')

    // Words that are long numbers or IDs, unless they're printed as money.
    words.forEach((w, j) => {
      const t = w.text.replace(/^[#:([]+|[):,;\]]+$/g, '')
      if (t === HIDDEN || DATE_WORD.test(t) || MONEY.test(t)) return
      const nextToCurrency = CURRENCY_WORD.test(words[j - 1]?.text ?? '') || CURRENCY_WORD.test(words[j + 1]?.text ?? '')
      if (/^[\d-]+$/.test(t) && digitCount(t) >= 7 && !nextToCurrency) hide(i, j, 'long_number')
      else if (/^[A-Za-z]{0,4}\d{6,}[A-Za-z0-9]*$/.test(t) && /[A-Za-z]/.test(t)) hide(i, j, 'long_number')
    })
    // Chunked numbers: two or more words of exactly four digits in a row ("1234 5678").
    for (let j = 0; j + 1 < words.length; j++) {
      if (/^\d{4}$/.test(words[j].text) && /^\d{4}$/.test(words[j + 1].text)) {
        hide(i, j, 'account')
        hide(i, j + 1, 'account')
      }
    }

    // Person and place labels: hide what follows, unless it's an amount, and the lines
    // under it that carry on (a city under a name, an address's second line), up to the
    // next amount or label.
    const person = PERSON_LABEL.exec(text)
    if (person) {
      const rest = text.slice(person.index + person[0].length)
      // "Recipient gets 8,600.00", "Total to Recipient", "Recipient receives": a field.
      if (!isAmountText(rest) && !FIELD_WORD.test(rest) && !FIELD_WORD.test(text.slice(0, person.index))) {
        if (rest.trim()) hideSpan(i, person.index + person[0].length, text.length, 'labeled')
        const under = rest.trim() && !ADDRESS_LABEL.test(person[0]) ? 2 : 3
        for (let k = 1; k <= under && continues(i + k); k++) hideLine(i + k, 'labeled')
      }
    }

    // Account and ID labels: hide the ID-like words after them, or on the next line.
    const id = ID_LABEL.exec(text)
    if (id) {
      const from = id.index + id[0].length
      const after = wordOffsets(l)
        .map((o, j) => ({ o, j }))
        .filter(({ o, j }) => o.start >= from && looksLikeId(words[j].text))
      after.forEach(({ j }) => hide(i, j, 'account'))
      if (!after.length && !text.slice(from).trim() && page.lines[i + 1]) {
        page.lines[i + 1].words.forEach((w, j) => {
          if (looksLikeId(w.text)) hide(i + 1, j, 'account')
        })
      }
    }
  })

  return [...found.values()].sort((a, b) => a.line - b.line || a.word - b.word)
}

/** The page with every redacted word's text replaced by HIDDEN. Boxes are kept. */
export function redactPage(page: OcrPage, redactions: Redaction[]): OcrPage {
  const hidden = new Set(redactions.map((r) => `${r.line}:${r.word}`))
  return {
    ...page,
    lines: page.lines.map((l, i) => ({
      ...l,
      words: l.words.map((w, j) => (hidden.has(`${i}:${j}`) ? { ...w, text: HIDDEN } : w)),
    })),
  }
}

/**
 * The boxes to paint solid on the image: one per run of neighboring hidden words on a
 * line, grown by `pad` pixels on each side (OCR boxes hug the ink, and a sliver of a
 * letter can be enough to read a name), and kept inside the photo.
 */
export function redactionBoxes(page: OcrPage, redactions: Redaction[], pad = 4): Box[] {
  const byLine = new Map<number, number[]>()
  for (const r of redactions) byLine.set(r.line, [...(byLine.get(r.line) ?? []), r.word])
  const boxes: Box[] = []
  for (const [line, wordsHidden] of byLine) {
    const sorted = [...new Set(wordsHidden)].sort((a, b) => a - b)
    let run: number[] = []
    const flush = () => {
      if (!run.length) return
      const b = unionBox(run.map((w) => page.lines[line].words[w].box))
      const x = Math.max(0, b.x - pad)
      const y = Math.max(0, b.y - pad)
      boxes.push({
        x,
        y,
        width: Math.min(page.width, b.x + b.width + pad) - x,
        height: Math.min(page.height, b.y + b.height + pad) - y,
      })
      run = []
    }
    for (const w of sorted) {
      if (run.length && w !== run[run.length - 1] + 1) flush()
      run.push(w)
    }
    flush()
  }
  return boxes
}

/**
 * The preview's tap: hides a word by hand, or shows again a word hidden by hand. Words the
 * rules hid stay hidden (the server would hide them again anyway).
 */
export function toggleWord(redactions: Redaction[], line: number, word: number): Redaction[] {
  const existing = redactions.find((r) => r.line === line && r.word === word)
  if (!existing) return [...redactions, { line, word, kind: 'manual' }]
  if (existing.kind !== 'manual') return redactions
  return redactions.filter((r) => r !== existing)
}
