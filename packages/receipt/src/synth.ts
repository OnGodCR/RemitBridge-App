/**
 * Synthetic receipts for the accuracy benchmark (DECISIONS.md D85). Each one is a made-up
 * US remittance receipt: consistent numbers from the one formula, a provider's name, the
 * labels Regulation E's model forms use (and common variants), a layout, and fictional
 * personal details that redaction has to hide. The same seed always gives the same
 * receipt, so the committed benchmark set can be regenerated exactly.
 *
 * This file is pure: it makes the receipt's lines, its ground truth and an HTML rendering.
 * scripts/synthesize.ts turns the HTML into a picture with Playwright and reads it back with
 * tesseract.js, so the benchmark sees real OCR output, misreads included.
 *
 * Nothing here is a real receipt's wording. Real receipts belong in benchmark/receipts/.
 */
import { computeTransferCost, remittanceTax, type FundingMethod } from '../../formula/src/index.ts'
import type { DeliveryMethod, FieldValues } from './types.ts'

/** The disclosure items a synthetic receipt may carry (Phase 6 scores the disclosure check). */
export const SYNTH_DISCLOSURES = ['date_available', 'error_rights', 'cancellation', 'provider_contact', 'cfpb_contact'] as const
export type SynthDisclosure = (typeof SYNTH_DISCLOSURES)[number]

export interface SynthStyle {
  font: string
  /** Font size in CSS pixels. */
  size: number
  /** Receipt width in CSS pixels. */
  width: number
  /** Degrees; a slightly crooked photo. */
  rotate: number
  /** CSS blur in pixels; an out-of-focus photo. */
  blur: number
  /** Paper color, a CSS color. */
  paper: string
  /** Whether the label and value sit on one line, or the value on the next. */
  layout: 'same_line' | 'next_line'
}

export interface SynthReceipt {
  id: string
  description: string
  source: 'synthetic'
  seed: number
  /** The printed lines, top to bottom (next_line layout puts a value on its own line). */
  lines: string[]
  expected: Partial<FieldValues>
  /** Fictional personal details that redaction must remove. */
  pii: string[]
  /** Values that redaction must leave readable. */
  keep: string[]
  /** Which of the standard disclosures are printed. */
  disclosures: SynthDisclosure[]
  /** The mid-market rate the provider's rate was marked up from (for the rate check). */
  mid_rate: number
  style: SynthStyle
}

// ---------------------------------------------------------------------------------------
// A seeded random source (mulberry32): small, fast, and the same on every machine.
// ---------------------------------------------------------------------------------------

export function rng(seed: number) {
  // Spread neighboring seeds apart first; mulberry32 alone gives seeds 1, 2, 3 similar
  // first draws.
  let a = Math.imul((seed ^ 0x5bd1e995) >>> 0, 0x9e3779b1) >>> 0
  a = Math.imul(a ^ (a >>> 16), 0x85ebca6b) >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: <T>(xs: readonly T[]): T => xs[Math.floor(next() * xs.length)],
    chance: (p: number) => next() < p,
  }
}
type Rng = ReturnType<typeof rng>

// ---------------------------------------------------------------------------------------
// What gets printed
// ---------------------------------------------------------------------------------------

interface Corridor {
  receive: string
  /** A plausible mid-market range, receiving per 1 USD. */
  mid: [number, number]
  /** Decimals the rate is printed with. */
  rateDecimals: number
  /** Decimals the amount received is printed with (0 for currencies without cents). */
  amountDecimals: number
  symbol?: string
  /** Fictional names and places for this corridor. */
  names: string[]
  places: string[]
}

const CORRIDORS: Corridor[] = [
  { receive: 'MXN', mid: [17.0, 19.5], rateDecimals: 4, amountDecimals: 2, names: ['Lucia Hernandez', 'Jose Ramirez', 'Carmen Flores', 'Miguel Torres'], places: ['Guadalajara, Jalisco', 'Puebla, Puebla', 'Oaxaca, Oaxaca'] },
  { receive: 'INR', mid: [83.0, 89.0], rateDecimals: 4, amountDecimals: 2, symbol: '₹', names: ['Priya Sharma', 'Rohan Gupta', 'Anita Verma', 'Vikram Singh'], places: ['Pune, Maharashtra', 'Jaipur, Rajasthan', 'Kochi, Kerala'] },
  { receive: 'PHP', mid: [55.0, 59.0], rateDecimals: 4, amountDecimals: 2, symbol: '₱', names: ['Maria Reyes', 'Jose Dela Cruz', 'Ana Bautista', 'Paolo Garcia'], places: ['Cebu City, Cebu', 'Davao City', 'Quezon City'] },
  { receive: 'VND', mid: [24000, 26500], rateDecimals: 0, amountDecimals: 0, symbol: '₫', names: ['Nguyen Thi Lan', 'Tran Van Minh', 'Le Thi Hoa', 'Pham Van Duc'], places: ['Da Nang', 'Hue', 'Can Tho'] },
  { receive: 'GTQ', mid: [7.6, 7.9], rateDecimals: 4, amountDecimals: 2, names: ['Rosa Morales', 'Carlos Lopez', 'Elena Perez', 'Mario Castillo'], places: ['Quetzaltenango', 'Antigua Guatemala', 'Coban'] },
]

const PROVIDERS = [
  { name: 'Western Union', header: 'WESTERN UNION', subtitle: 'Money Transfer Receipt' },
  { name: 'MoneyGram', header: 'MoneyGram', subtitle: 'RECEIPT' },
  { name: 'Remitly', header: 'Remitly', subtitle: 'Transfer receipt' },
  { name: 'Xoom', header: 'Xoom, a PayPal service', subtitle: 'Transfer details' },
  { name: 'Ria', header: 'Ria Money Transfer', subtitle: 'Customer Receipt' },
  { name: 'WorldRemit', header: 'WorldRemit', subtitle: 'Payment receipt' },
  { name: 'Xe', header: 'Xe Money Transfer', subtitle: 'Transfer confirmation' },
  { name: 'Wise', header: 'Wise', subtitle: 'Transfer receipt' },
] as const

const SENDERS = ['Sofia Martinez', 'Daniel Kim', 'Aisha Mohamed', 'Kevin Nguyen', 'Grace Okafor', 'Luis Alvarez', 'Meera Patel', 'Samuel Tesfaye']
const STREETS = ['418 Maple St', '2207 Cedar Ave Apt 3', '95 Lakeview Dr', '1310 Rainier Ave S', '77 Orchard Ln Unit 12']
const CITIES = ['Seattle, WA 98118', 'Kent, WA 98032', 'Tukwila, WA 98168', 'Renton, WA 98055', 'Federal Way, WA 98003']

/** Label choices per field: Regulation E's words first, then common variants. */
const LABELS = {
  date: ['Date', 'Transaction Date', 'Date Sent', 'Transfer Date'],
  amount_sent: ['Transfer Amount', 'Amount Sent', 'Send Amount', 'You Sent'],
  fee: ['Transfer Fees', 'Transfer Fee', 'Fee', 'Service Fee'],
  tax: ['Transfer Taxes', 'Taxes', 'Federal Remittance Tax', 'Remittance Tax'],
  total_paid: ['Total', 'Total Paid', 'Total Amount', 'Amount Paid'],
  exchange_rate: ['Exchange Rate', 'Rate', 'FX Rate'],
  amount_received: ['Total to Recipient', 'Amount Received', 'Recipient Gets', 'Payout Amount'],
  pickup_charge: ['Other Fees', 'Pickup Fee', 'Recipient Fees'],
  funding_method: ['Payment Method', 'Paid With', 'Payment Type', 'Paid By'],
  delivery_method: ['Delivery Method', 'Receive Method', 'Payout Method', 'Delivery Option'],
} as const

const FUNDING_WORDS: Record<FundingMethod, string[]> = {
  bank_account: ['Bank Account', 'Bank Account (ACH)', 'Bank transfer'],
  debit_card: ['Debit Card', 'Visa Debit', 'Debit'],
  credit_card: ['Credit Card', 'Mastercard Credit', 'Credit'],
  cash: ['Cash'],
  money_order: ['Money Order'],
  cashiers_check: ["Cashier's Check", 'Cashiers Check'],
}

const DELIVERY_WORDS: Record<DeliveryMethod, string[]> = {
  bank_deposit: ['Bank Deposit', 'Bank account'],
  cash_pickup: ['Cash Pickup', 'Cash pick-up'],
  mobile_wallet: ['Mobile Wallet'],
  upi: ['UPI'],
  debit_card: ['Debit Card Deposit'],
  home_delivery: ['Home Delivery'],
}

const FUNDING_WEIGHTS: [FundingMethod, number][] = [
  ['bank_account', 3],
  ['debit_card', 3],
  ['credit_card', 1],
  ['cash', 3],
  ['money_order', 1],
  ['cashiers_check', 1],
]

const FONTS = ['DejaVu Sans Mono', 'Liberation Mono', 'Courier 10 Pitch', 'Liberation Sans', 'DejaVu Sans', 'FreeMono']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function weighted<T>(r: Rng, items: [T, number][]): T {
  let x = r.next() * items.reduce((s, [, w]) => s + w, 0)
  for (const [item, w] of items) {
    x -= w
    if (x < 0) return item
  }
  return items[items.length - 1][0]
}

const round = (x: number, d: number) => Number(x.toFixed(d))

/** 1234.5 → "1,234.50" (US grouping). */
export function usNumber(x: number, decimals: number): string {
  const [whole, frac] = x.toFixed(decimals).split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return frac ? `${grouped}.${frac}` : grouped
}

function usd(r: Rng, x: number): string {
  const n = usNumber(x, 2)
  return r.pick([`$${n}`, `${n} USD`, `USD ${n}`, `US$${n}`])
}

function foreign(r: Rng, c: Corridor, x: number): string {
  const n = usNumber(x, c.amountDecimals)
  const forms = [`${n} ${c.receive}`, `${c.receive} ${n}`]
  if (c.symbol) forms.push(`${c.symbol}${n}`)
  return r.pick(forms)
}

function printedDate(r: Rng, iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const pad = (n: number) => String(n).padStart(2, '0')
  return r.pick([`${pad(m)}/${pad(d)}/${y}`, `${m}/${d}/${y}`, `${MONTHS[m - 1]} ${d}, ${y}`, iso])
}

function addDays(iso: string, days: number): string {
  const t = new Date(`${iso}T12:00:00Z`)
  t.setUTCDate(t.getUTCDate() + days)
  return t.toISOString().slice(0, 10)
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export interface SynthOptions {
  /** Transfers are dated within the 120 days before this day. Default 2026-09-30. */
  asOf?: string
}

/**
 * One synthetic receipt from a seed. The numbers go through the one formula, so a correct
 * reading always passes the receipt checks: amount received = (sent − fee − tax) × rate −
 * pickup charge, rounded as the receiving currency prints it.
 */
export function synthesize(seed: number, options: SynthOptions = {}): SynthReceipt {
  const r = rng(seed)
  const asOf = options.asOf ?? '2026-09-30'
  const provider = r.pick(PROVIDERS)
  const c = r.pick(CORRIDORS)
  const funding = weighted(r, FUNDING_WEIGHTS)
  const delivery: DeliveryMethod =
    c.receive === 'INR' ? r.pick(['bank_deposit', 'upi', 'cash_pickup'] as const) : r.pick(['bank_deposit', 'cash_pickup', 'mobile_wallet', 'home_delivery'] as const)

  const date = addDays(asOf, -r.int(1, 120))
  const amountSent = r.pick([50, 100, 150, 200, 250, 300, 400, 500, 750, 1000, 1500, 2000]) + (r.chance(0.2) ? r.int(1, 99) : 0)
  const fee = r.pick([0, 0, 1.99, 2.99, 3.99, 4.99, 5.99, 7.99, 9.99, 11.99])
  const tax = remittanceTax(amountSent, funding, date)
  const mid = round(c.mid[0] + r.next() * (c.mid[1] - c.mid[0]), c.rateDecimals)
  const markup = 0.002 + r.next() * 0.04
  const rate = round(mid * (1 - markup), c.rateDecimals)
  const pickup = delivery === 'cash_pickup' && r.chance(0.3) ? round(rate * r.pick([1, 2, 3]), c.amountDecimals) : 0
  const received = round(
    computeTransferCost({ sent: amountSent + fee + tax, fee, transferTax: tax, quotedRate: rate, midRate: mid, pickupCharge: pickup }).amountReceived,
    c.amountDecimals,
  )
  const total = round(amountSent + fee + tax, 2)

  const layout: SynthStyle['layout'] = r.chance(0.25) ? 'next_line' : 'same_line'
  const style: SynthStyle = {
    font: r.pick(FONTS),
    size: r.int(14, 18),
    width: r.int(380, 470),
    rotate: r.chance(0.5) ? round((r.next() - 0.5) * 2.4, 2) : 0,
    blur: r.chance(0.3) ? round(r.next() * 0.7, 2) : 0,
    paper: r.pick(['#ffffff', '#fbfaf5', '#f4f2ea', '#f7f7f7']),
    layout,
  }

  const lines: string[] = []
  const keep: string[] = []
  const pii: string[] = []
  const field = (label: string, value: string, colon = r.chance(0.6)) => {
    const l = colon ? `${label}:` : label
    if (layout === 'next_line') lines.push(l, value)
    else lines.push(`${l} ${value}`)
  }

  lines.push(provider.header, provider.subtitle)
  const printed = printedDate(r, date)
  field(r.pick(LABELS.date), printed, true)
  keep.push(printed)

  // The people and their details: fictional, and all of it must be hidden.
  const sender = r.pick(SENDERS)
  const recipient = r.pick(c.names)
  lines.push(`${r.pick(['Sender', 'Sender name', 'From'])}: ${sender}`)
  pii.push(...sender.split(' '))
  if (r.chance(0.5)) {
    const street = r.pick(STREETS)
    const city = r.pick(CITIES)
    lines.push(street, city)
    pii.push(street.split(' ').slice(0, 2).join(' '), city.split(' ').pop()!)
  }
  if (r.chance(0.5)) {
    const phone = `(206) 555-0${r.int(100, 199)}`
    lines.push(`Phone: ${phone}`)
    pii.push(phone.slice(6))
  }
  lines.push(`${r.pick(['Receiver', 'Recipient', 'Receiver name', 'To'])}: ${recipient}`)
  pii.push(...recipient.split(' '))
  if (delivery === 'cash_pickup' && r.chance(0.5)) {
    const place = r.pick(c.places)
    lines.push(place)
    pii.push(place.split(',')[0])
  }
  const ref = String(r.int(1000000000, 9999999999))
  lines.push(`${provider.name === 'Western Union' ? 'MTCN' : r.pick(['Reference #', 'Reference number', 'Confirmation'])} ${ref}`)
  pii.push(ref)

  // How it was paid and delivered.
  let fundingText = r.pick(FUNDING_WORDS[funding])
  if ((funding === 'debit_card' || funding === 'credit_card') && r.chance(0.6)) {
    const last4 = String(r.int(1000, 9999))
    fundingText += ` ****${last4}`
    pii.push(last4)
  }
  field(r.pick(LABELS.funding_method), fundingText, true)
  const showDelivery = r.chance(0.85)
  if (showDelivery) field(r.pick(LABELS.delivery_method), r.pick(DELIVERY_WORDS[delivery]), true)

  // The money, in Regulation E's order.
  const sentText = usd(r, amountSent)
  field(r.pick(LABELS.amount_sent), sentText)
  const feeText = usd(r, fee)
  field(r.pick(LABELS.fee), feeText)
  keep.push(sentText, feeText)
  const showTax = tax > 0 || r.chance(0.4)
  if (showTax) {
    const t = usd(r, tax)
    field(r.pick(LABELS.tax), t)
    keep.push(t)
  }
  const showTotal = r.chance(0.9)
  if (showTotal) {
    const t = usd(r, total)
    field(r.pick(LABELS.total_paid), t)
    keep.push(t)
  }
  const rateNumber = usNumber(rate, c.rateDecimals)
  const rateText = r.pick([`1 USD = ${rateNumber} ${c.receive}`, `US$1.00 = ${rateNumber} ${c.receive}`, `${rateNumber} ${c.receive}`])
  field(r.pick(LABELS.exchange_rate), rateText)
  keep.push(rateNumber)
  if (pickup > 0) {
    const p = foreign(r, c, pickup)
    field(r.pick(LABELS.pickup_charge), p)
    keep.push(p)
  }
  const receivedText = foreign(r, c, received)
  field(r.pick(LABELS.amount_received), receivedText)
  keep.push(receivedText)

  // Disclosures (Regulation E, 12 CFR 1005.31(b)(2)): some printed, some left off.
  const disclosures: SynthDisclosure[] = []
  if (r.chance(0.7)) {
    lines.push(`Date Available: ${printedDate(r, delivery === 'bank_deposit' ? addDays(date, 1) : date)}`)
    disclosures.push('date_available')
  }
  if (r.chance(0.6)) {
    lines.push('You have a right to dispute errors in your transaction. If you think there is an error, contact us within 180 days.')
    disclosures.push('error_rights')
  }
  if (r.chance(0.6)) {
    lines.push('You can cancel for a full refund within 30 minutes of payment, unless the funds have been picked up or deposited.')
    disclosures.push('cancellation')
  }
  if (r.chance(0.6)) {
    lines.push(`For questions or complaints about ${provider.name}, contact us at 1-800-555-0${r.int(100, 199)}.`)
    disclosures.push('provider_contact')
  }
  if (r.chance(0.5)) {
    lines.push('Consumer Financial Protection Bureau 855-411-2372 consumerfinance.gov/sending-money')
    disclosures.push('cfpb_contact')
  }

  const expected: Partial<FieldValues> = {
    provider: provider.name,
    send_currency: 'USD',
    receive_currency: c.receive,
    amount_sent: amountSent,
    fee,
    exchange_rate: rate,
    amount_received: received,
    transfer_date: date,
    funding_method: funding,
  }
  if (showTax) expected.tax = tax
  if (showTotal) expected.total_paid = total
  if (pickup > 0) expected.pickup_charge = pickup
  if (showDelivery) expected.delivery_method = delivery

  const id = `synth-${String(seed).padStart(4, '0')}-${slug(provider.name)}-${funding.replace('_', '-')}-usd-${c.receive.toLowerCase()}`
  const description = [
    `${provider.name}, USD to ${c.receive}, paid by ${funding.replace('_', ' ')}`,
    tax > 0 ? 'taxed' : 'no tax',
    pickup > 0 ? 'pickup charge' : null,
    layout === 'next_line' ? 'values under their labels' : null,
    style.rotate ? 'tilted' : null,
    style.blur ? 'blurred' : null,
  ]
    .filter(Boolean)
    .join('; ')

  return { id, description, source: 'synthetic', seed, lines, expected, pii: [...new Set(pii)], keep, disclosures, mid_rate: mid, style }
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** The receipt as a small HTML page, for Playwright to photograph. */
export function receiptHtml(receipt: SynthReceipt): string {
  const s = receipt.style
  const body = receipt.lines
    .map((l, i) => `<p class="${i === 0 ? 'head' : ''}">${escapeHtml(l)}</p>`)
    .join('\n')
  return `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;background:#9a9a94}
.r{width:${s.width}px;margin:24px;padding:18px 20px;background:${s.paper};color:#1b1b1b;
font:${s.size}px/1.35 '${s.font}',monospace;transform:rotate(${s.rotate}deg);filter:blur(${s.blur}px)}
p{margin:0 0 3px;overflow-wrap:anywhere}
.head{font-weight:bold;font-size:1.25em;margin-bottom:6px}
</style></head><body><div class="r" id="receipt">
${body}
</div></body></html>`
}
