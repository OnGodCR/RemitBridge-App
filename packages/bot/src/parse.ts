/**
 * Reads a WhatsApp message into a command (PRD 5.8). Forgiving on purpose: "500 dollars to
 * india", "$500 india", "rs", "₹", "1.5k to philippines cash" and "५०० भारत" all parse.
 * Anything half-understood still comes back as a comparison with the missing parts left
 * out, so the reply can ask for them instead of failing (PRD: "fall back to a clarifying
 * question rather than an error").
 *
 * The country and route lists are the app's own files, imported as they are, so the bot
 * can never know a different set of countries than the app does.
 */
import { RECEIVING, SENDING } from '../../../mobile/src/lib/countries.ts'
import type { DeliveryMethod } from '../../../mobile/src/lib/routes.ts'

export type Language = 'en' | 'hi'

export type Command =
  | { kind: 'help' }
  | { kind: 'why' }
  | { kind: 'language'; language: Language }
  | { kind: 'scam' }
  | { kind: 'check' }
  | { kind: 'yes' }
  /** STOP: delete what the bot keeps about this number. */
  | { kind: 'forget' }
  | { kind: 'request'; from?: string; to?: string }
  /** `save`: "SAVE 500 to India", to keep it in the linked app account (D138). */
  | { kind: 'compare'; amount?: number; from?: string; to?: string; method?: DeliveryMethod; save?: boolean }
  /** The one-time code from the app's Link WhatsApp (D138). */
  | { kind: 'link'; code: string }
  | { kind: 'unlink' }
  /** SAVE with nothing to save: explain how. */
  | { kind: 'save' }
  | { kind: 'unknown' }

/** Lower-case, no accents, Devanagari digits as ASCII, symbols as currency codes. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[०-९]/g, (d) => String('०१२३४५६७८९'.indexOf(d)))
    .replace(/₹/g, ' inr ')
    .replace(/₱/g, ' php ')
    .replace(/₫/g, ' vnd ')
    .replace(/\$/g, ' usd ')
    // Commas and points only mean something inside numbers.
    .replace(/,(?!\d{3}(?!\d))/g, ' ')
    .replace(/\.(?!\d)/g, ' ')
    .replace(/(^|[^\d])\./g, '$1 ')
    // "500usd" and "usd500" are two words.
    .replace(/(\d)(\p{L})/gu, '$1 $2')
    .replace(/(\p{L})(\d)/gu, '$1 $2')
    .replace(/[^\p{L}\p{M}\p{N}.,\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const words = (list: string[]) => new Set(list.map(normalize))

const HELP = words(['help', 'hi', 'hello', 'hey', 'start', 'menu', 'hola', 'namaste', 'नमस्ते', 'मदद', 'commands'])
const WHY = words(['why', 'kyon', 'kyun', 'kyu', 'क्यों', 'क्यूँ'])
const HINDI = words(['hindi', 'हिंदी', 'हिन्दी'])
const ENGLISH = words(['english', 'angrezi', 'अंग्रेज़ी', 'अंग्रेजी', 'इंग्लिश'])
const SCAM = words(['scam', 'fraud', 'scammed', 'धोखा', 'ठगी'])
const CHECK = words(['check', 'truecost', 'receipt'])
const UNLINK = words(['unlink'])
const SAVE = words(['save', 'सेव', 'सहेजें'])
// Letters and digits as the app prints them: no 0/O or 1/I (supabase migration D138).
const LINK_CODE = /^\s*link\s+([a-hj-np-z2-9]{6})\s*$/i
const YES = words(['yes', 'y', 'yeah', 'yep', 'yup', 'ok', 'okay', 'sure', 'haan', 'han', 'ha', 'ji', 'हाँ', 'हां', 'si'])
const REQUEST = words(['request', 'add'])
const FORGET = new Set(['stop', 'unsubscribe', 'delete my data', 'forget me', 'delete me'].map(normalize))

/** Extra names people use, on top of each country's name in the app's lists. */
const ALIASES: Record<string, string[]> = {
  US: ['usa', 'united states', 'america', 'the us', 'the usa'],
  GB: ['uk', 'england', 'britain', 'great britain'],
  AE: ['uae', 'dubai', 'emirates', 'abu dhabi'],
  SA: ['saudi', 'ksa'],
  IN: ['bharat', 'hindustan', 'भारत', 'इंडिया', 'हिंदुस्तान'],
  MX: ['mejico', 'mexiko', 'मेक्सिको'],
  PH: ['phillipines', 'philipines', 'phillippines', 'pilipinas', 'pinas', 'filipinas', 'फ़िलीपींस'],
  VN: ['viet nam', 'वियतनाम'],
  SV: ['salvador'],
  DO: ['dominicana', 'republica dominicana', 'dominican rep'],
  KR: ['korea'],
  BR: ['brasil'],
  LK: ['srilanka'],
  NP: ['नेपाल'],
  PK: ['पाकिस्तान'],
  BD: ['बांग्लादेश'],
}

/** Words for money that point at a currency, and so at a country. */
const MONEY_WORDS: Record<string, string> = {
  rs: 'IN', rupee: 'IN', rupees: 'IN', rupya: 'IN', rupaye: 'IN', 'रुपये': 'IN', 'रुपए': 'IN', 'रुपया': 'IN',
  peso: 'MX', pesos: 'MX', dong: 'VN',
  dollar: 'US', dollars: 'US', bucks: 'US', usd: 'US', 'डॉलर': 'US',
}

type Place = { code: string; names: string[]; sending: boolean }

const PLACES: Place[] = [
  ...SENDING.map((c) => ({ code: c.code, names: [c.name, c.short ?? '', ...(ALIASES[c.code] ?? [])], sending: true })),
  ...RECEIVING.map((c) => ({ code: c.code, names: [c.name, c.short ?? '', ...(ALIASES[c.code] ?? [])], sending: false })),
].map((p) => ({ ...p, names: p.names.filter(Boolean).map(normalize) }))

/** Currency code to country. USD is the sending currency; El Salvador and Ecuador use it too. */
const CURRENCY_TO_COUNTRY = new Map<string, { code: string; sending: boolean }>([
  ...SENDING.map((c) => [c.currency.toLowerCase(), { code: c.code, sending: true }] as const),
  ...RECEIVING.filter((c) => c.currency !== 'USD').map(
    (c) => [c.currency.toLowerCase(), { code: c.code, sending: false }] as const,
  ),
])

const METHODS: [string[], DeliveryMethod][] = [
  [['upi'], 'upi'],
  [['cash', 'pickup', 'pick up', 'efectivo', 'नकद', 'कैश'], 'cash_pickup'],
  [['bank', 'deposit', 'account', 'banco', 'बैंक'], 'bank_deposit'],
  [['wallet', 'gcash', 'momo', 'mobile', 'ewallet', 'e wallet', 'mpesa', 'm pesa', 'bkash'], 'mobile_wallet'],
  [['card', 'debit', 'tarjeta'], 'debit_card'],
  // Not "home" alone: "send money home" is how people describe every transfer.
  [['home delivery', 'doorstep', 'deliver to home', 'deliver home'], 'home_delivery'],
]

export function parse(text: string): Command {
  // Read before normalizing, which would split "K7P2QX" into words and numbers.
  const link = text.match(LINK_CODE)
  if (link) return { kind: 'link', code: link[1].toUpperCase() }

  const s = normalize(text)
  if (!s) return { kind: 'unknown' }
  const tokens = s.split(' ')

  if (FORGET.has(s)) return { kind: 'forget' }
  if (UNLINK.has(s)) return { kind: 'unlink' }
  if (SAVE.has(tokens[0])) {
    const rest = tokens.length > 1 ? parse(text.trim().replace(/^\S+\s+/, '')) : null
    return rest?.kind === 'compare' ? { ...rest, save: true } : { kind: 'save' }
  }

  if (REQUEST.has(tokens[0]) && tokens.length > 1) {
    const { from, to } = findPlaces(s)
    return { kind: 'request', from, to }
  }

  const amount = findAmount(s)
  const { from, to } = findPlaces(s)
  const method = findMethod(s)
  if (amount !== undefined || from || to || method) return { kind: 'compare', amount, from, to, method }

  if (tokens.length <= 3) {
    if (tokens.some((w) => HINDI.has(w))) return { kind: 'language', language: 'hi' }
    if (tokens.some((w) => ENGLISH.has(w))) return { kind: 'language', language: 'en' }
    if (tokens.some((w) => YES.has(w))) return { kind: 'yes' }
  }
  if (tokens.some((w) => WHY.has(w))) return { kind: 'why' }
  if (tokens.some((w) => SCAM.has(w))) return { kind: 'scam' }
  if (tokens.some((w) => CHECK.has(w))) return { kind: 'check' }
  if (HELP.has(s) || tokens.some((w) => HELP.has(w))) return { kind: 'help' }
  return { kind: 'unknown' }
}

const THOUSAND = words(['k', 'hazar', 'hazaar', 'हज़ार', 'हजार', 'thousand', 'grand'])

/** The first number, with "1,000", "1.5k" and "2 hazar" understood. */
export function findAmount(s: string): number | undefined {
  const m = s.match(/(?:^|\s)(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?(?:\s(\S+))?/u)
  if (!m) return undefined
  let n = Number(`${m[1].replace(/,/g, '')}${m[2] ? `.${m[2]}` : ''}`)
  if (m[3] && THOUSAND.has(m[3])) n *= 1000
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : undefined
}

/** Where from and where to, by name, alias or currency; "from X" and "to X" win. */
export function findPlaces(s: string): { from?: string; to?: string } {
  const padded = ` ${s} `
  const hits: { code: string; sending: boolean; at: number; marker?: 'from' | 'to' }[] = []
  for (const p of PLACES) {
    for (const name of p.names) {
      const at = padded.indexOf(` ${name} `)
      if (at < 0) continue
      const before = padded.slice(0, at).trim().split(' ').pop()
      const marker = before === 'from' ? 'from' : ['to', 'in', 'into', 'for'].includes(before ?? '') ? 'to' : undefined
      hits.push({ code: p.code, sending: p.sending, at, marker })
      break
    }
  }
  for (const token of s.split(' ')) {
    const byCode = CURRENCY_TO_COUNTRY.get(token)
    const byWord = MONEY_WORDS[token]
    const hit = byCode ?? (byWord ? { code: byWord, sending: byWord === 'US' } : undefined)
    if (hit) hits.push({ ...hit, at: padded.indexOf(` ${token} `) })
  }
  hits.sort((a, b) => a.at - b.at)
  const from = hits.find((h) => h.marker === 'from') ?? hits.find((h) => h.sending && h.marker !== 'to')
  // Money goes to a receiving country: "rate for usa to india" is to India, not the US.
  const to =
    hits.find((h) => h.marker === 'to' && h !== from && !h.sending) ??
    hits.find((h) => !h.sending && h !== from) ??
    hits.find((h) => h.marker === 'to' && h !== from)
  return { from: from?.code, to: to?.code }
}

export function findMethod(s: string): DeliveryMethod | undefined {
  const padded = ` ${s} `
  for (const [names, method] of METHODS) {
    if (names.some((n) => padded.includes(` ${normalize(n)} `))) return method
  }
  return undefined
}

/**
 * A message shaped like a question, with no amount: "what is the mid-market rate for india",
 * "why is the rate lower on weekends". These go to the model first (D159), which can still
 * send a plain price question back to the price templates; "500 to India" never does.
 */
export function isQuestion(text: string): boolean {
  const s = normalize(text)
  if (findAmount(s) !== undefined) return false
  return /\?\s*$/.test(text.trim()) || /^(what|whats|why|how|is|are|does|do|can|could|should|which|who|when|where|tell|explain|kya|kaise|kyun|kyon|kitna|kaun)\b/.test(s)
}
