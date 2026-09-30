/**
 * The rule-based field extractors. ANGAD WRITES THESE (DECISIONS.md D86).
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
 * value. Useful plumbing: lineText, wordOffsets and spanBox in ../ocr.ts; labelsFor and the
 * template's numberFormat and dateFormats in ../templates.ts. Put helpers you write (number
 * parsing, label search, date parsing) in this folder too.
 *
 * Run `npm run parser:report -w @remitbridge/receipt` to see how the fixtures score, and
 * `npm test -w @remitbridge/receipt` (RECEIPT_STRICT=1 to fail on missing values too).
 */
import type { ProviderTemplate } from '../templates.ts'
import type { OcrPage, ParsedField, ParsedFields } from '../types.ts'

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
  void ctx
  // TODO(angad): match template identifiers against the page.
  return null
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
  void ctx
  // TODO(angad)
  return null
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
  void ctx
  // TODO(angad)
  return null
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
  void ctx
  // TODO(angad)
  return null
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
  void ctx
  // TODO(angad)
  return null
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
  void ctx
  // TODO(angad)
  return null
}

/**
 * total_paid: everything the sender paid, in the sending currency, as printed.
 *
 * Input: ctx.page, ctx.template, ctx.found (amount_sent, fee, tax).
 * Output: { value: 509.99, confidence, source } or null.
 * Expected: "Total" also appears in "Total to Recipient", which is the amount received.
 */
export function extractTotalPaid(ctx: ExtractionContext): ParsedField<'total_paid'> | null {
  void ctx
  // TODO(angad)
  return null
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
  void ctx
  // TODO(angad)
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
  void ctx
  // TODO(angad)
  return null
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
  void ctx
  // TODO(angad)
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
  void ctx
  // TODO(angad)
  return null
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
  void ctx
  // TODO(angad)
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
  void ctx
  // TODO(angad)
  return null
}
