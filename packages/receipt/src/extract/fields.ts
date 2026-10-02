/**
 * The rule-based field extractors (DECISIONS.md D130: written by Claude at Angad's request,
 * replacing D86's plan that Angad would write them). The reading itself (labels, amounts,
 * rates, dates) is in read.ts; each function here picks its field's value and says how sure
 * it is.
 *
 * Everything around them is built: parser.ts calls them in FIELD_NAMES order, checks what
 * they return with checkValue (a wrong type is dropped and reported, never passed on), and
 * catches anything they throw. The model fills whatever they leave missing or unsure.
 *
 * Each extractor:
 *   - gets an ExtractionContext (below): the redacted OCR page, the provider's template,
 *     the fields found so far, and today's date;
 *   - returns a ParsedField ({ value, confidence, source }) or null when the receipt
 *     doesn't show the value;
 *   - never guesses silently: a value it isn't sure of gets a confidence below
 *     LOW_CONFIDENCE (0.8), so the model is asked too and the person confirms it.
 *
 * Confidence, as a guide:
 *   0.95  the template's label and a cleanly printed value on the same line
 *   0.85  a label from another template, or the value on the next line
 *   0.6   inferred without a label (e.g. the only amount next to "MXN")
 *   0.3   a guess the rest of the pipeline should double-check
 *
 * `source` is where the value was read ({ line, words: [start, end) }). The confirmation
 * screen highlights it, so return it whenever you can.
 *
 * Words the redactor hid read as HIDDEN ("[hidden]"); treat them as unreadable, never as a
 * value (moneyIn in read.ts skips them).
 *
 * Run `npm run parser:report -w @remitbridge/receipt` to see how the fixtures score, and
 * `npm test -w @remitbridge/receipt` (RECEIPT_STRICT=1 to fail on missing values too).
 */
import type { FundingMethod } from '../../../formula/src/index.ts'
import { lineText } from '../ocr.ts'
import { TEMPLATES, type ProviderTemplate } from '../templates.ts'
import type { DeliveryMethod, OcrPage, ParsedField, ParsedFields, SourceSpan } from '../types.ts'
import { canBe, dateIn, hitsFor, labelHits, moneyIn, norm, rateIn, spanOf, valuesFor, type Money, type Rate } from './read.ts'

export interface ExtractionContext {
  /** The redacted OCR page, lines top to bottom. */
  page: OcrPage
  /** The provider's template, or GENERIC when the provider isn't known. */
  template: ProviderTemplate
  /**
   * Fields already extracted, in FIELD_NAMES order: when extractFee runs, provider,
   * currencies and amount_sent are here if they were found. Use them to disambiguate (a fee
   * is smaller than the amount sent; the received amount is near amount_sent × rate).
   */
  found: ParsedFields
  /** Today as YYYY-MM-DD, so a date in the future can be rejected. */
  today: string
}

/**
 * provider: the company that issued the receipt, as its template's `name`
 * ("Western Union", not "WESTERN UNION FINANCIAL SERVICES INC").
 *
 * Input: ctx.page. ctx.template is GENERIC here (the provider picks the template), and
 * ctx.found is empty. The list of templates to match against is TEMPLATES in
 * ../templates.ts; each has `identifiers` (brand names, legal names, web addresses).
 * Output: { value: template.name, confidence, source: where the name was printed }, or
 * null when no template matches. A provider we don't have a template for can be returned
 * by its printed name at a low confidence.
 * Expected: headers and footers carry the name; logos don't OCR. Short identifiers like
 * "WU" or "Ria" need care, since they appear inside other words.
 */
export function extractProvider(ctx: ExtractionContext): ParsedField<'provider'> | null {
  // Every place a template's identifier is printed, as whole words: "Ria" in "Maria" isn't Ria.
  const found: { template: ProviderTemplate; line: number; start: number; end: number; short: boolean }[] = []
  for (const template of TEMPLATES) {
    if (!template.providerId) continue
    for (const id of template.identifiers) {
      const tokens = id.split(/\s+/).map(norm)
      ctx.page.lines.forEach((line, i) => {
        const words = line.words.map((w) => norm(w.text))
        for (let s = 0; s + tokens.length <= words.length; s++) {
          if (tokens.every((t, j) => words[s + j] === t)) {
            found.push({ template, line: i, start: s, end: s + tokens.length, short: id.replace(/\W/g, '').length <= 3 })
            return
          }
        }
        // OCR sometimes splits a long name in two ("Wor ldRemit"); short ones would match by chance.
        const joined = tokens.join('')
        if (joined.length < 6) return
        for (let s = 0; s + 1 < words.length; s++) {
          if (words[s] + words[s + 1] === joined) {
            found.push({ template, line: i, start: s, end: s + 2, short: false })
            return
          }
        }
      })
    }
  }
  if (!found.length) return null
  // The name nearest the top is the issuer; a full name beats a short one like "WU" on the same line.
  found.sort((a, b) => a.line - b.line || Number(a.short) - Number(b.short))
  const best = found[0]
  const rivals = new Set(found.filter((f) => f.line < 3).map((f) => f.template.id))
  rivals.delete(best.template.id)
  const confidence = rivals.size ? 0.6 : best.short ? 0.7 : best.line < 3 ? 0.95 : 0.85
  return { value: best.template.name, confidence, source: { line: best.line, words: [best.start, best.end] } }
}

/**
 * send_currency: the ISO code of the currency the sender paid in, e.g. "USD".
 *
 * Input: ctx.page, ctx.template (its `hints.send_currency` is a fallback, not an answer).
 * Output: { value: 'USD', confidence, source } or null.
 * Expected: codes printed next to amounts ("500.00 USD"), or symbols ("$", "US$"). A bare
 * "$" is ambiguous (MXN also uses $), so use its position: amounts in the sent/fee/total
 * section are in the sending currency.
 */
export function extractSendCurrency(ctx: ExtractionContext): ParsedField<'send_currency'> | null {
  const { page, template } = ctx
  const hint = template.hints?.send_currency
  // The amounts the sender paid say which currency they paid in. "Transfer Amount" also
  // labels the receiving amount on Reg E receipts, so every line votes, not just the first.
  const votes = new Map<string, { n: number; source: SourceSpan; named: boolean }>()
  for (const field of ['amount_sent', 'fee', 'tax', 'total_paid'] as const) {
    for (const v of valuesFor(page, template, field)) {
      const m = moneyIn(v.words, template.numberFormat)[0]
      const code = m?.code ?? (m?.dollar ? hint : undefined)
      if (!m || !code) continue
      const vote = votes.get(code) ?? { n: 0, source: spanOf(v, m), named: false }
      vote.n++
      vote.named ||= !!m.code
      votes.set(code, vote)
    }
  }
  const ranked = [...votes.entries()].sort((a, b) => b[1].n - a[1].n || Number(b[0] === hint) - Number(a[0] === hint))
  if (ranked.length) {
    const [code, vote] = ranked[0]
    const contested = ranked.length > 1 && ranked[1][1].n === vote.n
    return { value: code, confidence: contested ? 0.6 : vote.named ? 0.95 : 0.85, source: vote.source }
  }
  // "1 USD = 17.20 MXN" names it too.
  for (const v of valuesFor(page, template, 'exchange_rate')) {
    const r = rateIn(v.words, template.numberFormat, undefined)
    if (r?.send) return { value: r.send, confidence: 0.85, source: spanOf(v, r) }
  }
  return hint ? { value: hint, confidence: 0.5 } : null
}

/**
 * receive_currency: the ISO code of the currency the recipient gets, e.g. "MXN".
 *
 * Input: ctx.page, ctx.found.send_currency.
 * Output: { value: 'MXN', confidence, source } or null.
 * Expected: usually printed in the exchange rate line ("1 USD = 17.20 MXN") or next to the
 * amount received. It's different from the send currency on every receipt we handle.
 */
export function extractReceiveCurrency(ctx: ExtractionContext): ParsedField<'receive_currency'> | null {
  const { page, template } = ctx
  const send = ctx.found.send_currency?.value
  for (const v of valuesFor(page, template, 'exchange_rate')) {
    const r = rateIn(v.words, template.numberFormat, send)
    if (r?.receive && r.receive !== send) return { value: r.receive, confidence: 0.95, source: spanOf(v, r) }
  }
  for (const v of valuesFor(page, template, 'amount_received')) {
    const m = moneyIn(v.words, template.numberFormat).find((x) => x.code && x.code !== send)
    if (m?.code) return { value: m.code, confidence: 0.9, source: spanOf(v, m) }
  }
  // Otherwise the currency printed most often that isn't the sender's.
  const counts = new Map<string, { n: number; line: number; m: Money }>()
  page.lines.forEach((line, i) => {
    for (const m of moneyIn(line.words.map((w) => w.text), template.numberFormat)) {
      if (!m.code || m.code === send) continue
      const c = counts.get(m.code) ?? { n: 0, line: i, m }
      c.n++
      counts.set(m.code, c)
    }
  })
  const best = [...counts.entries()].sort((a, b) => b[1].n - a[1].n)
  if (!best.length) return null
  const [code, at] = best[0]
  return { value: code, confidence: best.length > 1 ? 0.4 : 0.6, source: { line: at.line, words: [at.m.start, at.m.end] } }
}

/**
 * amount_sent: the transfer amount in the sending currency, BEFORE the fee and the tax
 * (DECISIONS.md D77). Reg E's label is "Transfer Amount"; it appears twice on a Reg E
 * receipt, once in each currency, and this is the sending-currency one.
 *
 * Input: ctx.page, ctx.template (labelsFor(template, 'amount_sent'), numberFormat),
 * ctx.found.send_currency.
 * Output: { value: 500, confidence, source } (a number, no currency) or null.
 * Expected: don't confuse it with the total (amount + fee + tax). If only a total and a
 * fee are printed, leave this null (or low confidence) rather than subtracting: the
 * validator does that arithmetic and knows when it's safe.
 */
export function extractAmountSent(ctx: ExtractionContext): ParsedField<'amount_sent'> | null {
  return sendingAmount(ctx, 'amount_sent')
}

/**
 * fee: the provider's upfront fee in the sending currency.
 *
 * Input: ctx.page, ctx.template, ctx.found.amount_sent.
 * Output: { value: 4.99, confidence, source }. A receipt that prints "Fee: $0.00" or
 * "No fee" or "FREE" gives { value: 0 } with high confidence. Null only when the receipt
 * doesn't mention a fee at all.
 * Expected: several fee lines ("Transfer Fees", "Service Fee") add up; say so in the
 * confidence if you sum them. Fees charged to the recipient are pickup_charge, not this.
 */
export function extractFee(ctx: ExtractionContext): ParsedField<'fee'> | null {
  const { page, template } = ctx
  const send = ctx.found.send_currency?.value
  const lines: { value: number; source: SourceSpan; sameLine: boolean }[] = []
  for (const v of valuesFor(page, template, 'fee')) {
    if (/^(free|none|waived)\b/i.test(norm(v.words[0] ?? ''))) {
      lines.push({ value: 0, source: { line: v.line, words: [v.offset, v.offset + 1] }, sameLine: v.sameLine })
      continue
    }
    const m = moneyIn(v.words, template.numberFormat).find((x) => canBe(x, send))
    if (m) lines.push({ value: m.value, source: spanOf(v, m), sameLine: v.sameLine && !m.smudged })
  }
  if (!lines.length) {
    // "No fee" with no amount.
    const i = page.lines.findIndex((l) => /^no (transfer )?fees?\b/i.test(lineText(l)))
    return i >= 0 ? { value: 0, confidence: 0.85, source: { line: i } } : null
  }
  if (lines.length === 1) return { value: lines[0].value, confidence: lines[0].sameLine ? 0.95 : 0.85, source: lines[0].source }
  // Several fee lines add up; the sum is less certain than one printed number.
  const total = Math.round(lines.reduce((s, l) => s + l.value, 0) * 100) / 100
  return { value: total, confidence: 0.7, source: lines[0].source }
}

/**
 * tax: tax collected with the transfer, in the sending currency. In the US since
 * 2026-01-01, the 1% federal remittance tax on cash, money-order and cashier's-check
 * transfers (the result screen checks the amount; this only reads it).
 *
 * Input: ctx.page, ctx.template, ctx.found.amount_sent.
 * Output: { value: 5, confidence, source }; { value: 0 } when a tax line shows zero; null
 * when there's no tax line.
 * Expected: Reg E's label is "Transfer Taxes". Taxes charged at the other end ("Other
 * Taxes") are not this.
 */
export function extractTax(ctx: ExtractionContext): ParsedField<'tax'> | null {
  const got = sendingAmount(ctx, 'tax')
  // The 1% tax is never more than a few percent of the transfer; anything bigger is a misread.
  const sent = ctx.found.amount_sent?.value
  if (got && sent && got.value > sent * 0.05) return { ...got, confidence: Math.min(got.confidence, 0.4) }
  return got
}

/**
 * total_paid: everything the sender paid, in the sending currency, as printed.
 *
 * Input: ctx.page, ctx.template, ctx.found (amount_sent, fee, tax).
 * Output: { value: 509.99, confidence, source } or null.
 * Expected: "Total" also appears in "Total to Recipient", which is the amount received.
 */
export function extractTotalPaid(ctx: ExtractionContext): ParsedField<'total_paid'> | null {
  const got = sendingAmount(ctx, 'total_paid')
  const sent = ctx.found.amount_sent?.value
  if (got && sent && got.value + 0.005 < sent) return { ...got, confidence: Math.min(got.confidence, 0.5) }
  return got
}

/**
 * exchange_rate: receiving currency per 1 sending currency (17.20 for USD to MXN).
 *
 * Input: ctx.page, ctx.template, ctx.found (both currencies, amount_sent).
 * Output: { value: 17.2, confidence, source } or null.
 * Expected: printed as "1 USD = 17.20 MXN", "US$1.00 = 17.2000 MXN", or "Rate 17.20".
 * Some receipts print the inverse ("1 MXN = 0.0581 USD"): return 1 / that. Keep every
 * printed decimal; rates are often given to four places.
 */
export function extractExchangeRate(ctx: ExtractionContext): ParsedField<'exchange_rate'> | null {
  const { page, template } = ctx
  const send = ctx.found.send_currency?.value
  const receive = ctx.found.receive_currency?.value
  const fits = (r: Rate) => (!r.receive || !receive || r.receive === receive) && (!r.send || !send || r.send === send)
  for (const v of valuesFor(page, template, 'exchange_rate')) {
    const r = rateIn(v.words, template.numberFormat, send)
    if (!r || !fits(r)) continue
    const confidence = r.inverted ? 0.6 : !r.receive ? 0.85 : v.sameLine ? 0.95 : 0.85
    return { value: r.inverted ? round(r.value, 6) : r.value, confidence, source: spanOf(v, r) }
  }
  // An unlabeled "1 USD = 17.20 MXN".
  for (let i = 0; i < page.lines.length; i++) {
    const words = page.lines[i].words.map((w) => w.text)
    if (!words.some((w) => w.includes('='))) continue
    const r = rateIn(words, template.numberFormat, send)
    if (r && r.receive && r.send && fits(r)) {
      return { value: r.inverted ? round(r.value, 6) : r.value, confidence: 0.8, source: { line: i, words: [r.start, r.end] } }
    }
  }
  return null
}

/**
 * amount_received: what the recipient gets, in the receiving currency.
 *
 * Input: ctx.page, ctx.template, ctx.found (receive_currency, amount_sent, exchange_rate).
 * Output: { value: 8600, confidence, source } or null.
 * Expected: Reg E's label is "Total to Recipient". The receiving-currency "Transfer Amount"
 * line (before "Other Fees") is not this when a pickup charge comes off it.
 */
export function extractAmountReceived(ctx: ExtractionContext): ParsedField<'amount_received'> | null {
  const { page, template } = ctx
  const send = ctx.found.send_currency?.value
  const receive = ctx.found.receive_currency?.value
  const inReceiving = (m: Money) => (m.code ? m.code !== send && (!receive || m.code === receive) : canBe(m, receive) && receive !== send)

  let got: ParsedField<'amount_received'> | null = null
  for (const v of valuesFor(page, template, 'amount_received')) {
    const m = moneyIn(v.words, template.numberFormat).find(inReceiving)
    if (!m) continue
    const confidence = m.smudged || m.dollar ? 0.6 : m.code ? (v.sameLine ? 0.95 : 0.85) : 0.8
    got = { value: m.value, confidence, source: spanOf(v, m) }
    break
  }
  if (!got && receive) {
    // No label we know: the last amount printed in the receiving currency, away from the rate
    // and the pickup charge (the bottom line is the one the recipient gets).
    const skip = new Set(
      labelHits(page, template)
        .filter((h) => h.field === 'exchange_rate' || h.field === 'pickup_charge')
        .map((h) => h.line),
    )
    for (let i = page.lines.length - 1; i >= 0 && !got; i--) {
      const words = page.lines[i].words.map((w) => w.text)
      if (skip.has(i) || words.some((w) => w.includes('='))) continue
      const m = moneyIn(words, template.numberFormat).find((x) => x.code === receive)
      if (m) got = { value: m.value, confidence: 0.6, source: { line: i, words: [m.start, m.end] } }
    }
  }
  if (!got) return null
  // Far from amount sent × rate is a misread (or the wrong line): say so.
  const sent = ctx.found.amount_sent?.value
  const rate = ctx.found.exchange_rate?.value
  if (sent && rate) {
    const expected = sent * rate
    const near = (x: number, share: number) => Math.abs(x - expected) <= expected * share
    if (!near(got.value, 0.15)) {
      // OCR can read a currency sign as a digit (₹ as "3": "318,856.18" for ₹18,856.18). If
      // dropping the first character lands on amount sent × rate, that's the reading, checked.
      const word = got.source?.words ? page.lines[got.source.line].words[got.source.words[0]]?.text : undefined
      const repaired = word && /^\d/.test(word) ? moneyIn([word.slice(1)], template.numberFormat)[0] : undefined
      got =
        repaired && near(repaired.value, 0.03)
          ? { ...got, value: repaired.value, confidence: 0.6 }
          : { ...got, confidence: Math.min(got.confidence, 0.4) }
    }
  }
  return got
}

/**
 * pickup_charge: fees charged to the recipient, in the receiving currency.
 *
 * Input: ctx.page, ctx.template, ctx.found.receive_currency.
 * Output: { value: 40, confidence, source }; { value: 0 } when an "Other Fees" line shows
 * zero; null when there's no such line.
 * Expected: Reg E's label is "Other Fees". Some receipts print these in the sending
 * currency; convert only if the receipt gives the rate, otherwise return null.
 */
export function extractPickupCharge(ctx: ExtractionContext): ParsedField<'pickup_charge'> | null {
  const { page, template } = ctx
  const send = ctx.found.send_currency?.value
  const receive = ctx.found.receive_currency?.value
  for (const v of valuesFor(page, template, 'pickup_charge')) {
    const amounts = moneyIn(v.words, template.numberFormat)
    // Printed in the sending currency: converting it is the validator's job, not a guess here.
    if (amounts.some((m) => m.code && m.code === send && m.code !== receive)) return null
    const m = amounts.find((x) => canBe(x, receive))
    if (m) return { value: m.value, confidence: m.smudged ? 0.6 : m.code ? 0.95 : 0.8, source: spanOf(v, m) }
  }
  return null
}

/**
 * transfer_date: the day the transfer was made, as YYYY-MM-DD.
 *
 * Input: ctx.page, ctx.template (dateFormats), ctx.today.
 * Output: { value: '2026-09-28', confidence, source } or null.
 * Expected: receipts also print "Date Available" (when money can be picked up), which is
 * later and not this. Reject dates after ctx.today. MM/DD versus DD/MM: US receipts are
 * MM/DD; a day above 12 settles it.
 */
export function extractTransferDate(ctx: ExtractionContext): ParsedField<'transfer_date'> | null {
  const { page, template, today } = ctx
  for (const v of valuesFor(page, template, 'transfer_date')) {
    const d = dateIn(v.words.slice(0, 4))
    if (d && d.start === 0 && d.value <= today) {
      return { value: d.value, confidence: v.sameLine ? 0.95 : 0.85, source: spanOf(v, d) }
    }
  }
  // No label: the dates on the page, leaving out the day money is available and the like.
  const dates: { value: string; line: number; start: number; end: number; sent: boolean }[] = []
  page.lines.forEach((line, i) => {
    const text = lineText(line)
    if (/availab|expir|valid|birth|\bdob\b|pick ?up by/i.test(text)) return
    const d = dateIn(line.words.map((w) => w.text))
    if (d && d.value <= today) dates.push({ ...d, line: i, sent: /\b(sent|date|on)\b/i.test(text) })
  })
  if (!dates.length) return null
  const distinct = new Set(dates.map((d) => d.value))
  const d = dates.find((x) => x.sent) ?? dates[0]
  const confidence = distinct.size > 1 ? 0.5 : d.sent ? 0.85 : 0.7
  return { value: d.value, confidence, source: { line: d.line, words: [d.start, d.end] } }
}

/**
 * funding_method: how the sender paid. One of bank_account, debit_card, credit_card, cash,
 * money_order, cashiers_check.
 *
 * Input: ctx.page, ctx.template, ctx.found.tax.
 * Output: { value: 'cash', confidence, source } or null.
 * Expected: words like "Cash", "Money Order", "Cashier's Check", "Visa Debit", "Credit
 * Card", "Bank Account", "ACH". A tax line is a hint towards a physical instrument, but
 * not proof: say so with a lower confidence if that's all there is.
 */
export function extractFundingMethod(ctx: ExtractionContext): ParsedField<'funding_method'> | null {
  const { page, template } = ctx
  for (const v of valuesFor(page, template, 'funding_method')) {
    const method = fundingIn(v.words.join(' '))
    if (method) return { value: method, confidence: v.sameLine ? 0.95 : 0.85, source: { line: v.line, words: [v.offset, v.offset + v.words.length] } }
  }
  // Labels we don't know ("Payment:", "Funding:"), on short lines only: a disclosure sentence
  // that mentions payment isn't a payment method.
  const delivery = new Set(hitsFor(page, template, 'delivery_method').map((h) => h.line))
  for (let i = 0; i < page.lines.length; i++) {
    const words = page.lines[i].words.map((w) => w.text)
    if (delivery.has(i) || words.length > 8 || !/\b(paid|payment|pay with|paying|funding|funded)\b/i.test(words.join(' '))) continue
    const method = fundingIn(words.join(' '))
    if (method) return { value: method, confidence: 0.85, source: { line: i } }
  }
  return null
}

/**
 * delivery_method: how the money reaches the recipient. One of bank_deposit, cash_pickup,
 * mobile_wallet, upi, debit_card, home_delivery.
 *
 * Input: ctx.page, ctx.template, ctx.found.pickup_charge.
 * Output: { value: 'cash_pickup', confidence, source } or null.
 * Expected: "Cash Pickup", "Bank Deposit", "Mobile Wallet", "UPI", "Home Delivery". A
 * pickup charge suggests cash pickup, at a lower confidence.
 */
export function extractDeliveryMethod(ctx: ExtractionContext): ParsedField<'delivery_method'> | null {
  const { page, template } = ctx
  for (const v of valuesFor(page, template, 'delivery_method')) {
    const method = deliveryIn(v.words.join(' '))
    if (method) return { value: method, confidence: v.sameLine ? 0.95 : 0.85, source: { line: v.line, words: [v.offset, v.offset + v.words.length] } }
  }
  const funding = new Set(hitsFor(page, template, 'funding_method').map((h) => h.line))
  for (let i = 0; i < page.lines.length; i++) {
    const words = page.lines[i].words.map((w) => w.text)
    const text = words.join(' ')
    if (funding.has(i) || words.length > 8 || !/\b(deliver(y|ed)?|receive (option|method|type)|payout|pick ?-?up)\b/i.test(text)) continue
    const method = deliveryIn(text)
    if (method) return { value: method, confidence: 0.85, source: { line: i } }
  }
  // A charge at pickup points to cash pickup, but only points.
  if ((ctx.found.pickup_charge?.value ?? 0) > 0) return { value: 'cash_pickup', confidence: 0.5 }
  return null
}

// ---------------------------------------------------------------------------------------
// Shared by the extractors above
// ---------------------------------------------------------------------------------------

const round = (x: number, decimals: number) => Number(x.toFixed(decimals))

/**
 * An amount the sender paid (amount sent, tax, total): the first labeled line with an amount
 * that can be in the sending currency. "Transfer Amount 8,600.00 MXN" is skipped for the
 * amount sent because it names another currency. Two labeled lines that disagree lower the
 * confidence, so the model and the person check it.
 */
function sendingAmount<K extends 'amount_sent' | 'tax' | 'total_paid'>(ctx: ExtractionContext, field: K): ParsedField<K> | null {
  const { page, template } = ctx
  const send = ctx.found.send_currency?.value ?? template.hints?.send_currency
  const read: { value: number; source: SourceSpan; sameLine: boolean; smudged: boolean }[] = []
  for (const v of valuesFor(page, template, field)) {
    const m = moneyIn(v.words, template.numberFormat).find((x) => canBe(x, send))
    if (m) read.push({ value: m.value, source: spanOf(v, m), sameLine: v.sameLine, smudged: m.smudged })
  }
  if (!read.length) return null
  const first = read[0]
  const agree = read.every((r) => Math.abs(r.value - first.value) < 0.005)
  const confidence = !agree || first.smudged ? 0.6 : first.sameLine ? 0.95 : 0.85
  return { value: first.value as ParsedField<K>['value'], confidence, source: first.source }
}

/** How the sender paid, from words like "Visa Debit", "Money Order" or "Bank Account (ACH)". */
function fundingIn(text: string): FundingMethod | null {
  if (/cashier'?s?['’]?\s*che(ck|que)/i.test(text)) return 'cashiers_check'
  if (/money\s*order/i.test(text)) return 'money_order'
  if (/\bdebit\b/i.test(text)) return 'debit_card'
  if (/\bcredit\b/i.test(text)) return 'credit_card'
  if (/\b(bank|ach|checking|savings)\b/i.test(text)) return 'bank_account'
  if (/\bcash\b/i.test(text)) return 'cash'
  return null
}

/** How the money arrives, from words like "Cash Pickup", "UPI" or "Bank Deposit". */
function deliveryIn(text: string): DeliveryMethod | null {
  if (/pick\s*-?\s*up/i.test(text)) return 'cash_pickup'
  if (/\bupi\b/i.test(text)) return 'upi'
  if (/wallet|gcash|m-?pesa/i.test(text)) return 'mobile_wallet'
  if (/home\s*delivery|door\s*to\s*door/i.test(text)) return 'home_delivery'
  if (/card\s*deposit|to\s*(a\s*)?card/i.test(text)) return 'debit_card'
  if (/\b(bank|account|deposit)\b/i.test(text)) return 'bank_deposit'
  if (/\bcash\b/i.test(text)) return 'cash_pickup'
  return null
}
