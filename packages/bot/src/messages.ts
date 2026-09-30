/**
 * Every reply the bot sends, in English and Hindi (PRD 5.8, 14.8). The rules from 14.8:
 * each fits on one phone screen, uses the same words and number formatting as the app,
 * bolds only the amount received, and every result ends with the check time and a link.
 *
 * The Hindi is Claude's and hasn't been read by a native speaker yet (DECISIONS.md D68).
 * Provider names and delivery times come from the data and stay as they are.
 */
import { computeTransferCost } from '../../formula/src/index.ts'
import { money } from '../../../mobile/src/lib/format.ts'
import type { DeliveryMethod, Route } from '../../../mobile/src/lib/routes.ts'
import { DELIVERY_LABELS } from '../../../mobile/src/lib/routes.ts'
import { RECEIVING, SENDING } from '../../../mobile/src/lib/countries.ts'
import type { Language } from './parse.ts'
import type { Say } from './plan.ts'

export const LINK = 'https://app.remitbridgelabs.org'

/** A published quote as the bot reads it from `latest_quotes`. */
export interface QuoteRow {
  provider_name: string
  send_amount: number
  send_currency: string
  receive_currency: string
  fee: number
  offered_rate: number
  mid_market_rate: number
  pickup_charge: number
  amount_received: number
  total_cost_pct: number
  delivery_time: string | null
  is_promotional: boolean
  captured_at: string
}

export interface Shown extends QuoteRow {
  /** The checked amount this was estimated from, or null when the amount was checked. */
  basedOn: number | null
}

/**
 * Standing prices for the amount asked, most received first (PRD 5.1). For an amount that
 * wasn't checked, the checked amount's fee and rate go through the one formula, exactly as
 * Compare's atAmount does, so the bot and the app can't disagree about a transfer.
 */
export function rankFor(rows: QuoteRow[], amount: number): { standing: Shown[]; promotions: number } {
  const standing = rows
    .filter((q) => !q.is_promotional)
    .map((q): Shown | null => {
      const checked = Number(q.send_amount)
      if (amount === checked) return { ...q, basedOn: null }
      const c = computeTransferCost({
        sent: amount,
        fee: Number(q.fee),
        quotedRate: Number(q.offered_rate),
        midRate: Number(q.mid_market_rate),
        pickupCharge: Number(q.pickup_charge),
      })
      if (c.amountReceived <= 0) return null
      return { ...q, send_amount: amount, amount_received: c.amountReceived, total_cost_pct: c.totalCostPct, basedOn: checked }
    })
    .filter((q): q is Shown => q !== null)
    .sort((a, b) => b.amount_received - a.amount_received)
  return { standing, promotions: rows.filter((q) => q.is_promotional).length }
}

const usd = (n: number) => money(n, 'USD').replace(/\.00$/, '')

const HI_NAMES: Record<string, string> = {
  US: 'अमेरिका', CA: 'कनाडा', GB: 'ब्रिटेन', AE: 'यूएई', SA: 'सऊदी अरब', AU: 'ऑस्ट्रेलिया',
  IN: 'भारत', MX: 'मेक्सिको', PH: 'फ़िलीपींस', VN: 'वियतनाम', CN: 'चीन', NP: 'नेपाल',
  PK: 'पाकिस्तान', BD: 'बांग्लादेश', LK: 'श्रीलंका', KE: 'केन्या', NG: 'नाइजीरिया',
}

/** English wants "the" before a few names: "from the US", "to the Philippines". */
const EN_THE: Record<string, string> = {
  US: 'the US',
  GB: 'the UK',
  AE: 'the UAE',
  PH: 'the Philippines',
  DO: 'the Dominican Republic',
}

export function countryIn(lang: Language, code: string): string {
  const name = [...SENDING, ...RECEIVING].find((c) => c.code === code)?.name ?? code
  if (lang === 'hi') return HI_NAMES[code] ?? name
  return EN_THE[code] ?? name
}

const HI_METHODS: Record<DeliveryMethod, string> = {
  bank_deposit: 'बैंक खाते में',
  cash_pickup: 'नकद पिकअप',
  mobile_wallet: 'मोबाइल वॉलेट',
  upi: 'UPI',
  debit_card: 'डेबिट कार्ड',
  home_delivery: 'घर पर डिलीवरी',
}

export function methodIn(lang: Language, m: DeliveryMethod): string {
  return lang === 'hi' ? HI_METHODS[m] : DELIVERY_LABELS[m].toLowerCase().replace('upi', 'UPI')
}

/** "2 hours ago", from the oldest check shown, so the line never flatters the data. */
export function ago(lang: Language, iso: string, now: Date): string {
  const mins = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60000))
  const hours = Math.round(mins / 60)
  const days = Math.round(hours / 24)
  if (lang === 'hi') {
    if (mins < 1) return 'अभी'
    if (mins < 60) return `${mins} मिनट पहले`
    if (hours < 48) return `${hours} घंटे पहले`
    return `${days} दिन पहले`
  }
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  if (hours < 48) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  return `${days} days ago`
}

export function formatCompare(
  lang: Language,
  p: { route: Route; amount: number; checked: number; method: DeliveryMethod; rows: QuoteRow[]; now: Date },
): string {
  const to = countryIn(lang, p.route.id.split('-')[1].toUpperCase())
  const { standing, promotions } = rankFor(p.rows, p.amount)
  const head =
    lang === 'hi'
      ? `${usd(p.amount)} ${to} भेजने पर (${methodIn(lang, p.method)})`
      : `Sending ${usd(p.amount)} to ${to} (${methodIn(lang, p.method)})`

  if (standing.length === 0) {
    return lang === 'hi'
      ? `${head}\n\n${to} के लिए अभी जाँची हुई कीमतें नहीं हैं। हम सिर्फ़ वही कीमतें दिखाते हैं जो हमने खुद जाँची हैं, और यह रूट अभी तैयार हो रहा है।\n\nस्थिति देखें: ${LINK}`
      : `${head}\n\nNo checked prices for ${to} yet. We only show prices we've checked ourselves, and this route is still being set up.\n\nSee where it stands: ${LINK}`
  }

  const top = standing.slice(0, 3)
  const lines = top.map((q, i) => {
    const got = `*${money(q.amount_received, q.receive_currency)}*`
    const cost = `${q.total_cost_pct.toFixed(1)}%`
    const costText = i === 0 ? (lang === 'hi' ? `कुल लागत ${cost}` : `${cost} total cost`) : cost
    const arrives = lang === 'hi' ? 'पहुँचेंगे' : 'arrives'
    return `${i + 1}. ${q.provider_name}: ${got} ${arrives} · ${costText}${q.delivery_time ? ` · ${q.delivery_time}` : ''}`
  })

  const oldest = top.reduce((a, q) => (q.captured_at < a ? q.captured_at : a), top[0].captured_at)
  const stale = p.now.getTime() - new Date(oldest).getTime() > 24 * 3600 * 1000
  const out = [head]
  if (top.some((q) => q.basedOn !== null)) {
    out.push(
      lang === 'hi'
        ? `हमारी ${usd(p.checked)} की जाँच से अनुमान, वही फ़ीस और रेट।`
        : `Estimated from our ${usd(p.checked)} check, same fee and rate.`,
    )
  }
  out.push('', ...lines, '')
  if (promotions > 0) {
    out.push(
      lang === 'hi'
        ? `ऐप में ${promotions} पहली बार वाले ऑफ़र भी हैं।`
        : `Plus ${promotions} first-transfer offer${promotions === 1 ? '' : 's'} in the app.`,
    )
  }
  out.push(
    lang === 'hi'
      ? `कीमतें ${ago(lang, oldest, p.now)} जाँची गईं${stale ? ', इसलिए अब बदल चुकी हो सकती हैं' : ''}।`
      : `Prices checked ${ago(lang, oldest, p.now)}${stale ? ', so they may have moved' : ''}.`,
    lang === 'hi' ? `पूरी सूची: ${LINK}` : `Full list: ${LINK}`,
    lang === 'hi' ? 'बाकी पैसा कहाँ जाता है, जानने के लिए WHY लिखें।' : 'Reply WHY to see where the rest goes.',
  )
  return out.join('\n')
}

/**
 * WHY (PRD 5.8): the hidden markup, explained on the last route with its best price at $500
 * when there is one. The amount is the $500 example, never one the person typed, since the
 * bot doesn't keep amounts. With no prices, a plainly hypothetical example.
 */
export function formatWhy(lang: Language, p: { route: Route | null; top: QuoteRow | null }): string {
  const closing =
    lang === 'hi'
      ? 'कुल लागत = फ़ीस + यह मार्कअप। हम इस बात से रैंक करते हैं कि कितना पैसा पहुँचता है, इसलिए दोनों गिने जाते हैं।'
      : 'Total cost = fee + that markup. We rank by what arrives, so both count.'
  if (!p.route || !p.top) {
    return lang === 'hi'
      ? `बाकी पैसा कहाँ जाता है:\n\nहर ट्रांसफ़र में दो लागतें होती हैं। फ़ीस वह है जो दिखती है। दूसरी एक्सचेंज रेट में छिपी होती है: अगर मिड-मार्केट रेट (जिस पर बैंक आपस में लेन-देन करते हैं) पर $1 = 100 है और कोई कंपनी आपको 98 देती है, तो वह आपकी भेजी रकम का 2% रख लेती है, फ़ीस के अलावा।\n\n${closing}`
      : `Where the rest goes:\n\nEvery transfer has two costs. The fee is the one you see. The other is hidden in the exchange rate: if $1 is worth 100 at the mid-market rate (the one banks use with each other) and a provider gives you 98, they keep 2% of what you send, on top of the fee.\n\n${closing}`
  }
  const q = p.top
  const to = countryIn(lang, p.route.id.split('-')[1].toUpperCase())
  const cost = computeTransferCost({
    sent: 500,
    fee: Number(q.fee),
    quotedRate: Number(q.offered_rate),
    midRate: Number(q.mid_market_rate),
    pickupCharge: Number(q.pickup_charge),
  })
  const per = (rate: number) => money(rate, q.receive_currency).replace(/\.00$/, '')
  const mid = per(Number(q.mid_market_rate))
  const theirs = per(Number(q.offered_rate))
  const kept = money(Math.max(0, cost.markupCost), 'USD')
  if (lang === 'hi') {
    return `$500 ${to} भेजने पर बाकी पैसा कहाँ जाता है:\n\nफ़ीस वह लागत है जो आपको दिखती है। दूसरी लागत एक्सचेंज रेट में छिपी होती है। मिड-मार्केट रेट पर $1 = ${mid} है, वही रेट जिस पर बैंक आपस में लेन-देन करते हैं। ${q.provider_name} ${theirs} देता है, यानी $500 में से लगभग ${kept} उसके पास रह जाते हैं, फ़ीस के अलावा।\n\n${closing}`
  }
  return `Where the rest goes, on $500 to ${to}:\n\nThe fee is the cost you can see. The other is hidden in the exchange rate. At the mid-market rate, the one banks use with each other, $1 is worth ${mid}. ${q.provider_name} gives ${theirs}, so about ${kept} of your $500 stays with them, on top of any fee.\n\n${closing}`
}

export function formatRequested(lang: Language, to: string): string {
  const name = countryIn(lang, to)
  return lang === 'hi'
    ? `धन्यवाद। ${name} के लिए आपकी माँग गिन ली गई है। ऐप में हर रूट की स्थिति देखें: ${LINK}`
    : `Thanks. Your request for ${name} is counted. See where every route stands in the app: ${LINK}`
}

export function formatSay(lang: Language, s: Say): string {
  const hi = lang === 'hi'
  switch (s.key) {
    case 'help':
      return hi
        ? `RemitBridge दिखाता है कि हर कंपनी से आपके परिवार को कितना पैसा मिलेगा।\n\nरकम और देश भेजें:\n500 to India\n300 USD MXN\nUPI 500 · cash 200\n\nदूसरे जवाब:\nWHY: छिपी हुई लागत कहाँ है\nREQUEST NEPAL: नया देश जोड़ने को कहें\nSCAM: पैसे की माँग की जाँच करें\nHINDI या ENGLISH: भाषा बदलें\n\nमुफ़्त। कोई विज्ञापन नहीं, कोई कमीशन वाला सौदा नहीं।`
        : `RemitBridge shows what your family receives with each provider.\n\nSend an amount and a country:\n500 to India\n300 USD MXN\nUPI 500 · cash 200\n\nOther replies:\nWHY: where the hidden cost is\nREQUEST NEPAL: ask us to add a country\nSCAM: check a request for money\nHINDI or ENGLISH: change language\n\nFree. No ads, no affiliate deals.`
    case 'askAmount':
      return hi
        ? `${countryIn(lang, s.to)} कितने पैसे भेज रहे हैं? जैसे: 500 to ${countryIn('en', s.to).replace(/^the /, '')}`
        : `How much are you sending to ${countryIn(lang, s.to)}? For example: 500 to ${countryIn('en', s.to).replace(/^the /, '')}`
    case 'askCountry':
      return hi
        ? `${usd(s.amount)} कहाँ भेज रहे हैं? जैसे: ${s.amount} to Mexico`
        : `Where are you sending ${usd(s.amount)}? For example: ${s.amount} to Mexico`
    case 'askBoth':
      return hi ? 'कितने पैसे, और किस देश में? जैसे: 500 to Mexico' : 'How much, and to which country? For example: 500 to Mexico'
    case 'askRequestCountry':
      return hi ? 'कौन सा देश जोड़ें? जैसे: REQUEST NEPAL' : 'Which country should we add? For example: REQUEST NEPAL'
    case 'tooMuch':
      return hi ? 'हम $50,000 तक की रकम जाँचते हैं। कम रकम लिखें।' : 'We check amounts up to $50,000. Try a smaller amount.'
    case 'notCovered': {
      const from = countryIn(lang, s.from)
      const to = countryIn(lang, s.to)
      return hi
        ? `हम अभी ${from} से ${to} की कीमतें नहीं जाँचते। YES लिखें और हम आपकी माँग गिन लेंगे। माँगों से तय होता है कि आगे कौन से रूट जोड़े जाएँ।`
        : `We don't check prices from ${from} to ${to} yet. Reply YES and we'll count your request. Requests decide which routes we add next.`
    }
    case 'methodUnavailable': {
      const to = countryIn(lang, s.route.id.split('-')[1].toUpperCase())
      const options = s.route.deliveryMethods.map((m) => methodIn(lang, m)).join(', ')
      const asked = methodIn(lang, s.method)
      return hi
        ? `${to} के लिए ${asked} का विकल्प नहीं है। इनमें से चुनें: ${options}।`
        : `${asked[0].toUpperCase()}${asked.slice(1)} isn't an option for ${to}. Try: ${options}.`
    }
    case 'language':
      return s.language === 'hi' ? 'अब जवाब हिंदी में आएँगे।' : 'Replies are in English now.'
    case 'scam':
      return hi
        ? `किसी को पैसे भेजने से पहले पूछें:\n- क्या आपसे गिफ़्ट कार्ड, क्रिप्टो, या किसी अनजान व्यक्ति को वायर से पैसे माँगे गए हैं?\n- क्या आपको जल्दी करने को कहा जा रहा है, या इसे छिपाकर रखने को?\n- क्या कोई इनाम या विरासत पाने के लिए पहले पैसे देने को कहा गया है?\n\nअगर किसी का भी जवाब हाँ है, तो रुकें और किसी भरोसेमंद व्यक्ति से बात करें। पूरी जाँच ऐप में: ${LINK}`
        : `Before you send money to someone, ask:\n- Were you asked to pay with gift cards, crypto, or a wire to someone you've never met?\n- Are you being rushed, or told to keep it secret?\n- Do you have to pay first to collect a prize or an inheritance?\n\nIf any answer is yes, stop and talk to someone you trust. The full Scam check is in the app: ${LINK}`
    case 'check':
      return hi
        ? `पहले से किए गए ट्रांसफ़र की जाँच के लिए ऐप में TrueCost खोलें और अपनी रसीद भरें। यह एक्सचेंज रेट में छिपी लागत दिखाता है: ${LINK}`
        : `To check a transfer you already made, open TrueCost in the app and enter your receipt. It shows the cost hidden in the exchange rate: ${LINK}`
    case 'nothingPending':
      return hi
        ? 'पुष्टि करने के लिए कुछ नहीं है। रकम और देश भेजें, जैसे: 500 to India'
        : "There's nothing to confirm. Send an amount and a country, like: 500 to India"
    case 'unknown':
      return hi
        ? 'माफ़ कीजिए, मैं समझ नहीं पाया। रकम और देश भेजें, जैसे: 500 to India। और जानकारी के लिए HELP लिखें।'
        : "Sorry, I didn't catch that. Send an amount and a country, like: 500 to India. Reply HELP for more."
  }
}

export function formatRateLimited(lang: Language): string {
  return lang === 'hi' ? 'बहुत सारे संदेश आ गए हैं। एक घंटे बाद फिर कोशिश करें।' : "That's a lot of messages. Try again in an hour."
}

export function formatNotText(lang: Language): string {
  return lang === 'hi'
    ? 'मैं सिर्फ़ लिखे हुए संदेश पढ़ सकता हूँ। रकम और देश भेजें, जैसे: 500 to India'
    : 'I can only read text messages. Send an amount and a country, like: 500 to India'
}

export function formatForgotten(lang: Language): string {
  return lang === 'hi'
    ? 'हो गया। इस नंबर के बारे में हमने जो रखा था (एक बदला हुआ ID और आपकी भाषा), वह मिटा दिया गया है। फिर से शुरू करने के लिए कभी भी लिखें।'
    : "Done. We've deleted what we kept about this number: a scrambled ID and your language setting. Write any time to start again."
}
