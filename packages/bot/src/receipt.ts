/**
 * Receipt photos on WhatsApp (DECISIONS.md D80, D94): the replies, in English and Hindi,
 * and reading a person's answer when the bot checks an unsure value with them.
 *
 * The numbers come from packages/receipt (the same checks and the one formula the app
 * uses), so a receipt read on WhatsApp and in the app can't come out differently. The Hindi
 * is Claude's and needs a fluent speaker's read, like the rest of the bot's (D68).
 */
import { money } from '../../../mobile/src/lib/format.ts'
import type { ConfirmResponse } from '../../receipt/src/api.ts'
import { checkValue, FIELD_SPECS } from '../../receipt/src/fields.ts'
import { receiptCost, taxCheck, valuesFrom } from '../../receipt/src/result.ts'
import type { ExtractedFields, FieldName, FieldValues } from '../../receipt/src/types.ts'
import { FUNDING_METHODS } from '../../formula/src/index.ts'
import { DELIVERY_METHODS } from '../../receipt/src/fields.ts'
import { LINK } from './messages.ts'
import type { Language } from './parse.ts'

/** At most this many values are checked with the person; the rest are marked unconfirmed. */
export const MAX_QUESTIONS = 4

const LABELS: Record<FieldName, { en: string; hi: string }> = {
  provider: { en: 'company', hi: 'कंपनी' },
  send_currency: { en: 'sending currency', hi: 'भेजने की मुद्रा' },
  receive_currency: { en: 'receiving currency', hi: 'पाने की मुद्रा' },
  amount_sent: { en: 'transfer amount', hi: 'भेजी गई रकम' },
  fee: { en: 'fee', hi: 'फ़ीस' },
  tax: { en: 'tax', hi: 'टैक्स' },
  total_paid: { en: 'total paid', hi: 'कुल भुगतान' },
  exchange_rate: { en: 'exchange rate', hi: 'एक्सचेंज रेट' },
  amount_received: { en: 'amount received', hi: 'मिली रकम' },
  pickup_charge: { en: 'pickup charge', hi: 'पिकअप शुल्क' },
  transfer_date: { en: 'date', hi: 'तारीख' },
  funding_method: { en: 'way you paid', hi: 'भुगतान का तरीका' },
  delivery_method: { en: 'way it was delivered', hi: 'पहुँचाने का तरीका' },
}

const DISCLOSURE_WORDS: Record<string, { en: string; hi: string }> = {
  transfer_amount: { en: 'transfer amount', hi: 'भेजी गई रकम' },
  fees: { en: 'fees', hi: 'फ़ीस' },
  taxes: { en: 'taxes', hi: 'टैक्स' },
  total: { en: 'total', hi: 'कुल' },
  exchange_rate: { en: 'exchange rate', hi: 'एक्सचेंज रेट' },
  amount_received: { en: 'amount received', hi: 'मिली रकम' },
  date_available: { en: 'date the money is available', hi: 'पैसा मिलने की तारीख' },
  recipient: { en: 'recipient', hi: 'पाने वाला' },
  error_rights: { en: 'your rights if there is an error', hi: 'गलती होने पर आपके अधिकार' },
  cancellation: { en: 'how to cancel', hi: 'रद्द करने का तरीका' },
  provider_contact: { en: "the company's contact details", hi: 'कंपनी से संपर्क की जानकारी' },
  cfpb_contact: { en: 'the CFPB’s contact details', hi: 'CFPB से संपर्क की जानकारी' },
}

const FUNDING_WORDS: Record<(typeof FUNDING_METHODS)[number], { en: string; hi: string; match: RegExp }> = {
  bank_account: { en: 'bank account', hi: 'बैंक खाता', match: /\b(bank|ach|account)\b|बैंक/ },
  debit_card: { en: 'debit card', hi: 'डेबिट कार्ड', match: /\bdebit\b|डेबिट/ },
  credit_card: { en: 'credit card', hi: 'क्रेडिट कार्ड', match: /\bcredit\b|क्रेडिट/ },
  cash: { en: 'cash', hi: 'नकद', match: /\bcash\b|नकद|कैश/ },
  money_order: { en: 'money order', hi: 'मनी ऑर्डर', match: /\bmoney ?order\b|मनी ऑर्डर/ },
  cashiers_check: { en: "cashier's check", hi: 'कैशियर चेक', match: /\bcashier'?s? ?che(?:ck|que)\b|चेक/ },
}

const DELIVERY_WORDS: Record<(typeof DELIVERY_METHODS)[number], { en: string; hi: string; match: RegExp }> = {
  bank_deposit: { en: 'bank deposit', hi: 'बैंक में जमा', match: /\bbank\b|बैंक/ },
  cash_pickup: { en: 'cash pickup', hi: 'नकद पिकअप', match: /\b(cash|pick ?up)\b|नकद|पिकअप/ },
  mobile_wallet: { en: 'mobile wallet', hi: 'मोबाइल वॉलेट', match: /\b(wallet|mobile)\b|वॉलेट/ },
  upi: { en: 'UPI', hi: 'UPI', match: /\bupi\b/ },
  debit_card: { en: 'debit card', hi: 'डेबिट कार्ड', match: /\b(debit|card)\b|कार्ड/ },
  home_delivery: { en: 'home delivery', hi: 'घर पर डिलीवरी', match: /\bhome\b|घर/ },
}

const optionsFor = (field: FieldName) =>
  field === 'funding_method' ? FUNDING_METHODS.map((k) => [k, FUNDING_WORDS[k]] as const)
  : field === 'delivery_method' ? DELIVERY_METHODS.map((k) => [k, DELIVERY_WORDS[k]] as const)
  : null

/** A value as the person would read it: "$4.99", "17.2000", "Sep 28, 2026", "cash". */
export function shown(lang: Language, field: FieldName, fields: ExtractedFields): string {
  const f = fields[field]
  if (!f) return ''
  const v = f.value
  const kind = FIELD_SPECS[field].kind
  if (kind === 'money' && typeof v === 'number') {
    const receiving = field === 'amount_received' || field === 'pickup_charge'
    const currency = (receiving ? fields.receive_currency?.value : fields.send_currency?.value) ?? ''
    return /^[A-Z]{3}$/.test(currency) ? money(v, currency) : String(v)
  }
  if (kind === 'rate' && typeof v === 'number') return String(v)
  if (kind === 'date' && typeof v === 'string') return usDate(v)
  const opts = optionsFor(field)
  const word = opts?.find(([k]) => k === v)?.[1]
  return word ? word[lang] : String(v)
}

/** "2026-09-28" → "9/28/2026", the way US receipts print it. */
function usDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${m}/${d}/${y}`
}

export function formatReceiptAck(lang: Language): string {
  return lang === 'hi'
    ? 'रसीद मिल गई। पढ़ने से पहले नाम, पते, फ़ोन और खाता नंबर छिपा दिए जाते हैं। जवाब कुछ मिनटों में आएगा। फ़ोटो पढ़ने के बाद मिटा दी जाती है।'
    : "Got your receipt. Names, addresses, phone and account numbers are hidden before it's read. Your answer comes in a few minutes, and the photo is deleted once it's read."
}

export function formatReceiptUnreadable(lang: Language): string {
  return lang === 'hi'
    ? 'मैं इस फ़ोटो से रसीद नहीं पढ़ पाया। अच्छी रोशनी में, रसीद को सीधा रखकर और पूरी रसीद फ़्रेम में लेकर फिर भेजें।'
    : "I couldn't read a receipt in that photo. Try again in good light, with the receipt flat and all of it in the frame."
}

export function formatReceiptFailed(lang: Language): string {
  return lang === 'hi'
    ? 'माफ़ कीजिए, इस बार रसीद नहीं पढ़ी जा सकी। थोड़ी देर बाद फिर भेजें, या ऐप में स्कैन करें: ' + LINK
    : `Sorry, the receipt couldn't be read this time. Send it again later, or scan it in the app: ${LINK}`
}

export function formatReceiptsOff(lang: Language): string {
  return lang === 'hi'
    ? `रसीद की फ़ोटो अभी यहाँ नहीं पढ़ी जातीं। ऐप में स्कैन करें: ${LINK}। कीमतें देखने के लिए रकम और देश भेजें, जैसे: 500 to India`
    : `Receipt photos can't be read here yet. Scan it in the app: ${LINK}. To compare prices, send an amount and a country, like: 500 to India`
}

/**
 * One value to check with the person. With a value read: "reads $4.99, reply YES or send
 * the right one". With none: ask for it, with a hint of the form it should take.
 */
export function formatReceiptQuestion(lang: Language, field: FieldName, fields: ExtractedFields, first: boolean): string {
  const label = LABELS[field][lang]
  const opts = optionsFor(field)
  const list = opts ? opts.map(([, w], i) => `${i + 1}. ${w[lang]}`).join('\n') : null
  const value = fields[field] ? shown(lang, field, fields) : null
  const intro = first
    ? lang === 'hi'
      ? 'रसीद पढ़ ली। एक चीज़ जाँचनी है।'
      : 'I read your receipt. One thing to check first.'
    : ''
  const spec = FIELD_SPECS[field]
  const hint =
    lang === 'hi'
      ? spec.kind === 'money' ? (spec.zeroAllowed ? 'सिर्फ़ संख्या भेजें, जैसे 4.99 (न हो तो 0)।' : 'सिर्फ़ संख्या भेजें, जैसे 500।')
        : spec.kind === 'rate' ? 'सिर्फ़ संख्या भेजें, जैसे 17.20।'
        : spec.kind === 'date' ? 'तारीख भेजें, जैसे 9/28/2026।'
        : spec.kind === 'currency' ? 'तीन अक्षर का कोड भेजें, जैसे MXN।'
        : ''
      : spec.kind === 'money' ? (spec.zeroAllowed ? 'Send just the number, like 4.99 (0 if there was none).' : 'Send just the number, like 500.')
        : spec.kind === 'rate' ? 'Send just the number, like 17.20.'
        : spec.kind === 'date' ? 'Send the date, like 9/28/2026.'
        : spec.kind === 'currency' ? 'Send the three-letter code, like MXN.'
        : ''
  const ask =
    value !== null
      ? lang === 'hi'
        ? `${label} "${value}" पढ़ा गया। सही है तो YES लिखें, नहीं तो सही ${list ? 'नंबर चुनें' : 'भेजें'}।`
        : `The ${label} reads "${value}". Reply YES if that's right, or ${list ? 'pick the right one' : 'send the right one'}.`
      : lang === 'hi'
        ? `${label} नहीं पढ़ा जा सका। ${list ? 'नंबर चुनें:' : hint}`
        : `I couldn't read the ${label}. ${list ? 'Pick one:' : hint}`
  return [intro, ask, list, value !== null && !list ? hint : null].filter(Boolean).join('\n')
}

export type ReceiptReply = { kind: 'yes' } | { kind: 'value'; value: FieldValues[FieldName] } | { kind: 'unclear' }

const DEVANAGARI_DIGITS = '०१२३४५६७८९'
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/** What the person answered: yes, a value for the field (checked), or something else. */
export function readReceiptReply(text: string, field: FieldName, today: string): ReceiptReply {
  const t = text
    .trim()
    .toLowerCase()
    .replace(/[०-९]/g, (d) => String(DEVANAGARI_DIGITS.indexOf(d)))
  if (/^(yes|y|yep|yeah|ok|okay|correct|right|haan|han|ha|हाँ|हां|हा|सही)[.!]?$/u.test(t)) return { kind: 'yes' }

  const spec = FIELD_SPECS[field]
  const checked = (v: unknown): ReceiptReply => {
    const c = checkValue(field, v, today)
    return c.ok ? { kind: 'value', value: c.value } : { kind: 'unclear' }
  }
  switch (spec.kind) {
    case 'money':
    case 'rate': {
      if (spec.zeroAllowed && /^(none|no fee|no|nothing|zero|free|कुछ नहीं|नहीं)$/.test(t)) return checked(0)
      const m = t.replace(/(usd|us\$|\$|inr|₹|mxn|php|₱|vnd|₫|gtq|[a-z]{3}\b)/g, ' ').replace(/,/g, '').trim()
      return /^\d+(\.\d+)?$/.test(m) ? checked(Number(m)) : { kind: 'unclear' }
    }
    case 'currency':
      return /^[a-z]{3}$/.test(t) ? checked(t.toUpperCase()) : { kind: 'unclear' }
    case 'date': {
      let m = t.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
      if (m) return checked(`${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`)
      m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      if (m) return checked(t)
      m = t.match(/^([a-z]{3})[a-z]*\.? (\d{1,2}),? (\d{4})$/)
      if (m && MONTHS.includes(m[1])) {
        return checked(`${m[3]}-${String(MONTHS.indexOf(m[1]) + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`)
      }
      return { kind: 'unclear' }
    }
    case 'enum': {
      const opts = optionsFor(field)!
      const n = t.match(/^(\d)\.?$/)
      if (n) return Number(n[1]) >= 1 && Number(n[1]) <= opts.length ? checked(opts[Number(n[1]) - 1][0]) : { kind: 'unclear' }
      const hits = opts.filter(([, w]) => w.match.test(t))
      // "cashier's check" also says "cash"; the longer name wins when both match.
      const pick = hits.find(([k]) => k === 'cashiers_check') ?? hits.find(([k]) => k === 'money_order') ?? (hits.length === 1 ? hits[0] : null)
      return pick ? checked(pick[0]) : { kind: 'unclear' }
    }
    case 'text':
      return t && t.length <= 80 ? checked(text.trim()) : { kind: 'unclear' }
  }
}

/**
 * The result, in short blocks a phone shows at a glance (Angad, 2026-10-12: "too
 * crowded/hard to read"): the header, what arrived (bold), the total cost with its parts as
 * a list, the tax on its own, the comparison and the rate's source, then anything missing or
 * unconfirmed. Blocks are separated by a blank line.
 */
export function formatReceiptResult(lang: Language, r: ConfirmResponse, unconfirmed: FieldName[]): string {
  const hi = lang === 'hi'
  const v = valuesFrom(r.fields)
  const send = v.send_currency ?? 'USD'
  const receive = v.receive_currency
  const blocks: string[][] = []
  const when = v.transfer_date ? usDate(v.transfer_date) : null
  const title = v.provider ?? (hi ? 'आपकी रसीद' : 'Your receipt')
  blocks.push([`*${title}*${when ? ` · ${when}` : ''}`])

  if (v.amount_received !== undefined && receive) {
    blocks.push([hi ? `*${money(v.amount_received, receive)}* पहुँचे।` : `*${money(v.amount_received, receive)}* arrived.`])
  }

  const cost = r.mid ? receiptCost(v, r.mid.rate) : null
  if (cost) {
    blocks.push([
      hi
        ? `*कुल लागत: ${money(cost.totalCost, send)}* (${cost.totalCostPct.toFixed(1)}%)`
        : `*Total cost: ${money(cost.totalCost, send)}* (${cost.totalCostPct.toFixed(1)}%)`,
      `• ${hi ? 'फ़ीस' : 'Fee'}: ${money(cost.feeCost, send)}`,
      `• ${hi ? 'एक्सचेंज-रेट मार्कअप' : 'Exchange-rate markup'}: ${money(cost.markupCost, send)}`,
      ...(cost.taxCost > 0 ? [`• ${hi ? 'टैक्स' : 'Tax'}: ${money(cost.taxCost, send)}`] : []),
      ...(cost.pickupCost > 0 ? [`• ${hi ? 'पिकअप चार्ज' : 'Pickup charge'}: ${money(cost.pickupCost, send)}`] : []),
    ])
  } else {
    blocks.push([hi ? 'उस दिन का मिड-मार्केट रेट नहीं मिला, इसलिए कुल लागत नहीं दिखा सकते।' : "Couldn't get that day's mid-market rate, so there's no total cost to show."])
  }

  const tax = taxCheck(v, r.mid?.rate ?? null)
  if (tax.status === 'matches' || tax.status === 'not_found' || tax.status === 'differs') {
    const method = shown(lang, 'funding_method', r.fields)
    const expected = money(tax.expected ?? 0, send)
    // The bank-account comparison only means something when the total above includes the
    // tax; with no tax line, the total already leaves it out (the old reply said both).
    const bank = tax.bankEquivalent && cost && cost.taxCost > 0 ? money(tax.bankEquivalent.totalCost, send) : null
    const lines = hi
      ? [
          `${method} से भुगतान पर 1% संघीय टैक्स (${expected}) लगता है।`,
          tax.status === 'not_found' ? `इस रसीद पर टैक्स की लाइन नहीं है। अगर लिया गया था, तो कुल लागत ${expected} ज़्यादा है।` : null,
          tax.status === 'differs' ? `रसीद पर ${money(tax.found ?? 0, send)} लिखा है।` : null,
          bank ? `बैंक खाते से भेजते तो कुल लागत ${bank} होती।` : null,
        ]
      : [
          `Paid by ${method}, so the 1% federal tax (${expected}) applies.`,
          tax.status === 'not_found' ? `This receipt shows no tax line. If it was charged, the total cost is ${expected} higher.` : null,
          tax.status === 'differs' ? `The receipt shows ${money(tax.found ?? 0, send)}.` : null,
          bank ? `From a bank account, the total cost would have been ${bank}.` : null,
        ]
    blocks.push([lines.filter(Boolean).join(' ')])
  }

  const c = r.comparison
  const compare: string[] = []
  if (c.gap) {
    const g = c.gap
    const amount = money(Math.abs(g.gapAmount), g.gapCurrency)
    const more = g.gapAmount > 0
    compare.push(
      hi
        ? `उस दिन विज्ञापित रेट ${g.advertisedRate} था, आपको ${g.receiptRate} मिला${g.gapAmount === 0 ? '।' : `: इससे आपको ${amount} ${more ? 'ज़्यादा' : 'कम'} लगे।`}`
        : `Advertised that day: ${g.advertisedRate}. Your rate: ${g.receiptRate}${g.gapAmount === 0 ? '.' : `. That cost you ${amount} ${more ? 'more' : 'less'}.`}`,
    )
  } else {
    compare.push(
      c.reason === 'not_tracked'
        ? hi ? 'हम इस कंपनी की कीमतें अभी नहीं जाँचते।' : "We don't track this company's prices yet."
        : hi ? 'उस दिन की कोई विज्ञापित कीमत हमारे पास नहीं है।' : 'We have no advertised price from that day to compare.',
    )
  }
  if (r.mid) {
    compare.push(hi ? `मिड-मार्केट रेट: ${r.mid.rate} (${r.mid.source}, ${usDate(r.mid.date)})` : `Mid-market rate: ${r.mid.rate} (${r.mid.source}, ${usDate(r.mid.date)})`)
  }
  blocks.push(compare)

  const notes: string[] = []
  const missing = r.disclosures_missing ?? []
  if (missing.length) {
    const items = missing.map((d) => DISCLOSURE_WORDS[d]?.[lang] ?? d).join(', ')
    notes.push(hi ? `रसीद पर नहीं मिला (शायद फ़ोटो में छूट गया): ${items}।` : `Not on the receipt (the photo may have cut it off): ${items}.`)
  }
  if (unconfirmed.length) {
    const names = unconfirmed.map((f) => LABELS[f][lang]).join(', ')
    notes.push(hi ? `इनकी पुष्टि नहीं हुई: ${names}। नतीजा इन पर निर्भर है।` : `Not confirmed: ${names}. The result depends on them.`)
  }
  if (notes.length) blocks.push(notes)

  blocks.push([hi ? `अगली बार पहले तुलना करें: ${LINK}` : `Compare before your next transfer: ${LINK}`])
  return blocks.map((b) => b.join('\n')).join('\n\n')
}
