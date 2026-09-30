/**
 * What the app sends the scan-receipt Edge Function and what comes back, in one place so
 * the two can't drift. parseRequest checks everything that arrives, since the function is
 * reachable with the app's public key.
 */
import type { Gap } from './result.ts'
import type { Check, Suspect } from './validate.ts'
import { FIELD_NAMES, type ExtractedFields, type FieldName, type OcrPage } from './types.ts'

export interface ScanRequest {
  action: 'scan'
  /** The OCR page, already redacted on the phone. */
  page: OcrPage
  /** The redacted photo, JPEG or PNG, base64. */
  image?: { mediaType: 'image/jpeg' | 'image/png'; base64: string }
  /** Keep this receipt (and its redacted image) for research (D78). */
  research_consent: boolean
  /** The phone's date, YYYY-MM-DD, so "today" means the person's today. */
  today: string
}

/** Delete a receipt now, before its 30 days are up. Anyone holding the ID may. */
export interface ForgetRequest {
  action: 'forget'
  id: string
}

/**
 * The person's answers from the confirmation screen: a value for each field they corrected
 * or confirmed. Each becomes `user_corrected`. Values are checked on the server with
 * checkValue like any other.
 */
export interface ConfirmRequest {
  action: 'confirm'
  id: string
  corrections: Partial<Record<FieldName, unknown>>
  today: string
}

export type ScanFunctionRequest = ScanRequest | ForgetRequest | ConfirmRequest

/** The advertised price the receipt was compared with (D79), or why there's none. */
export interface Comparison {
  quote: {
    id: number
    provider_id: string
    captured_at: string
    offered_rate: number
    send_amount: number
    delivery_method: string
    payment_method: string
  } | null
  gap: Gap | null
  /** Why nothing was compared, when nothing was. */
  reason: 'not_tracked' | 'no_route' | 'missing_values' | 'no_quote' | null
}

export interface ConfirmResponse {
  id: string
  fields: ExtractedFields
  checks: Check[]
  suspect: Suspect | null
  missing: FieldName[]
  to_confirm: FieldName[]
  provider_id: string | null
  route_id: string | null
  /** The mid-market rate for the receipt's currencies and date, and where it's from. */
  mid: { rate: number; date: string; source: string } | null
  comparison: Comparison
}

export interface ScanResponse {
  id: string
  /** When the receipt is deleted; null when it's kept for research. */
  expires_at: string | null
  template_id: string
  provider_id: string | null
  route_id: string | null
  fields: ExtractedFields
  checks: Check[]
  suspect: Suspect | null
  missing: FieldName[]
  to_confirm: FieldName[]
  /** What the model was asked, and why it gave nothing if it didn't answer. */
  model: { asked: FieldName[]; error: string | null }
  /** 'device_rechecked' when the server found personal details the phone missed. */
  redaction: 'device' | 'device_rechecked'
}

export const LIMITS = {
  lines: 300,
  wordsPerLine: 80,
  wordLength: 64,
  /** About 3 MB of JPEG. The app sends photos at 1600 px on the long side, well under. */
  imageBase64: 4_000_000,
}

type Parsed = { ok: true; request: ScanFunctionRequest } | { ok: false; error: string }

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)
const isBox = (b: unknown) => {
  const x = b as Record<string, unknown> | null
  return !!x && isNum(x.x) && isNum(x.y) && isNum(x.width) && isNum(x.height) && x.width >= 0 && x.height >= 0
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function parseRequest(body: unknown): Parsed {
  const b = body as Record<string, unknown> | null
  if (!b || typeof b !== 'object') return { ok: false, error: 'not an object' }
  if (b.action === 'forget') {
    return typeof b.id === 'string' && UUID.test(b.id) ? { ok: true, request: { action: 'forget', id: b.id } } : { ok: false, error: 'bad id' }
  }
  if (b.action === 'confirm') {
    if (typeof b.id !== 'string' || !UUID.test(b.id)) return { ok: false, error: 'bad id' }
    if (typeof b.today !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(b.today)) return { ok: false, error: 'today must be YYYY-MM-DD' }
    const c = b.corrections
    if (!c || typeof c !== 'object' || Array.isArray(c)) return { ok: false, error: 'corrections must be an object' }
    for (const [k, v] of Object.entries(c)) {
      if (!(FIELD_NAMES as readonly string[]).includes(k)) return { ok: false, error: `unknown field ${k}` }
      if (typeof v !== 'string' && typeof v !== 'number') return { ok: false, error: `bad value for ${k}` }
      if (typeof v === 'string' && v.length > 80) return { ok: false, error: `bad value for ${k}` }
    }
    return { ok: true, request: { action: 'confirm', id: b.id, corrections: c as ConfirmRequest['corrections'], today: b.today } }
  }
  if (b.action !== 'scan') return { ok: false, error: 'unknown action' }
  if (typeof b.research_consent !== 'boolean') return { ok: false, error: 'research_consent must be true or false' }
  if (typeof b.today !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(b.today)) return { ok: false, error: 'today must be YYYY-MM-DD' }

  const page = b.page as Record<string, unknown> | null
  if (!page || !isNum(page.width) || !isNum(page.height) || !Array.isArray(page.lines)) return { ok: false, error: 'bad page' }
  if (page.lines.length > LIMITS.lines) return { ok: false, error: 'too many lines' }
  for (const line of page.lines as Record<string, unknown>[]) {
    if (!line || !isBox(line.box) || !Array.isArray(line.words) || line.words.length > LIMITS.wordsPerLine) {
      return { ok: false, error: 'bad line' }
    }
    for (const w of line.words as Record<string, unknown>[]) {
      if (!w || typeof w.text !== 'string' || !w.text || w.text.length > LIMITS.wordLength || !isBox(w.box)) {
        return { ok: false, error: 'bad word' }
      }
    }
  }

  let image: ScanRequest['image']
  if (b.image !== undefined && b.image !== null) {
    const i = b.image as Record<string, unknown>
    if ((i.mediaType !== 'image/jpeg' && i.mediaType !== 'image/png') || typeof i.base64 !== 'string') {
      return { ok: false, error: 'bad image' }
    }
    if (i.base64.length > LIMITS.imageBase64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(i.base64)) return { ok: false, error: 'bad image' }
    image = { mediaType: i.mediaType, base64: i.base64 }
  }

  return {
    ok: true,
    request: {
      action: 'scan',
      page: page as unknown as OcrPage,
      ...(image ? { image } : {}),
      research_consent: b.research_consent,
      today: b.today,
    },
  }
}

/**
 * The date to judge "in the future" by: the phone's, when it's within a day of the
 * server's (time zones), otherwise the server's.
 */
export function trustedToday(phoneToday: string, now: Date): string {
  const server = now.toISOString().slice(0, 10)
  const days = Math.abs(Date.parse(phoneToday) - Date.parse(server)) / 86_400_000
  return days <= 1 ? phoneToday : server
}
