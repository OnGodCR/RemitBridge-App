/**
 * The WhatsApp receipt worker (DECISIONS.md D80, D94), run by
 * .github/workflows/receipt-intake.yml through scripts/intake-worker.ts.
 *
 * For each photo waiting in receipt_intake:
 *   1. download it from Meta (it's held in memory only, never written to disk);
 *   2. read it with OCR, then hide personal details with the same redaction the phone uses;
 *   3. send only the redacted text to scan-receipt, as channel 'whatsapp' (no image);
 *   4. if nothing needs checking with the person, ask scan-receipt for the full result;
 *   5. report back to the whatsapp function, which sends the reply and deletes the row.
 *
 * The worker never sees the phone number: the queue gives it only the row ID, Meta's media
 * ID and the reply language. Logs carry counts and HTTP statuses, never text or values.
 * Network and OCR are passed in, so the whole flow runs under vitest with fakes.
 */
import type { ConfirmResponse, ScanResponse } from '../api.ts'
import { LIMITS } from '../api.ts'
import { detectPii, redactPage } from '../redact.ts'
import type { OcrPage } from '../types.ts'

export interface IntakeJob {
  id: string
  media_id: string
  language: string
}

export interface IntakeDeps {
  supabaseUrl: string
  serviceKey: string
  intakeSecret: string
  whatsappToken: string
  graphVersion?: string
  fetch: typeof fetch
  ocr: (image: Uint8Array) => Promise<OcrPage>
  today: () => string
  log?: (message: string) => void
}

export type Outcome = 'read' | 'unreadable' | 'failed'

/** Photos larger than this aren't read (WhatsApp sends images well under it). */
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024
const PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

/** Fewer lines than this and it isn't a receipt, or not one OCR could read. */
const MIN_LINES = 4

export async function runIntake(deps: IntakeDeps, limit = 5): Promise<Record<Outcome, number>> {
  const log = deps.log ?? (() => {})
  const counts: Record<Outcome, number> = { read: 0, unreadable: 0, failed: 0 }
  const jobs = await claim(deps, limit)
  log(`photos to read: ${jobs.length}`)
  for (const job of jobs) {
    let report: { outcome: Outcome; scan?: ScanResponse; result?: ConfirmResponse }
    try {
      report = await readPhoto(deps, job)
    } catch (e) {
      log(`a photo failed: ${e instanceof Error ? e.message : 'unknown error'}`)
      report = { outcome: 'failed' }
    }
    counts[report.outcome]++
    const res = await deps.fetch(`${deps.supabaseUrl}/functions/v1/whatsapp?intake=done`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-intake-secret': deps.intakeSecret },
      body: JSON.stringify({ job: job.id, ...report }),
    })
    if (!res.ok) log(`reporting back failed: HTTP ${res.status}`)
  }
  log(`read ${counts.read}, unreadable ${counts.unreadable}, failed ${counts.failed}`)
  return counts
}

async function claim(deps: IntakeDeps, limit: number): Promise<IntakeJob[]> {
  const res = await deps.fetch(`${deps.supabaseUrl}/rest/v1/rpc/claim_receipt_intake`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...keyHeaders(deps.serviceKey),
    },
    body: JSON.stringify({ p_limit: limit }),
  })
  if (!res.ok) throw new Error(`claiming photos failed: HTTP ${res.status}`)
  return (await res.json()) as IntakeJob[]
}

async function readPhoto(deps: IntakeDeps, job: IntakeJob): Promise<{ outcome: Outcome; scan?: ScanResponse; result?: ConfirmResponse }> {
  const photo = await download(deps, job.media_id)
  const page = fitLimits(await deps.ocr(photo))
  if (page.lines.length < MIN_LINES || !page.lines.some((l) => l.words.some((w) => /\d/.test(w.text)))) {
    return { outcome: 'unreadable' }
  }
  const redacted = redactPage(page, detectPii(page))

  const post = (body: unknown) =>
    deps.fetch(`${deps.supabaseUrl}/functions/v1/scan-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...keyHeaders(deps.serviceKey),
        'x-intake-secret': deps.intakeSecret,
      },
      body: JSON.stringify(body),
    })
  const scanRes = await post({ action: 'scan', page: redacted, research_consent: false, today: deps.today(), channel: 'whatsapp' })
  if (!scanRes.ok) throw new Error(`scan-receipt answered ${scanRes.status}`)
  const scan = (await scanRes.json()) as ScanResponse
  if (scan.to_confirm.length) return { outcome: 'read', scan }

  // Nothing to check with the person: the full result, with the comparison, right away.
  const confirmRes = await post({ action: 'confirm', id: scan.id, corrections: {}, today: deps.today() })
  if (!confirmRes.ok) throw new Error(`confirming answered ${confirmRes.status}`)
  return { outcome: 'read', scan, result: (await confirmRes.json()) as ConfirmResponse }
}

/** Meta's two steps: the media ID gives a short-lived URL, and the URL gives the bytes. */
async function download(deps: IntakeDeps, mediaId: string): Promise<Uint8Array> {
  const graph = `https://graph.facebook.com/${deps.graphVersion ?? 'v23.0'}`
  const auth = { Authorization: `Bearer ${deps.whatsappToken}` }
  const metaRes = await deps.fetch(`${graph}/${encodeURIComponent(mediaId)}`, { headers: auth })
  if (!metaRes.ok) throw new Error(`Meta media lookup answered ${metaRes.status}`)
  const meta = (await metaRes.json()) as { url?: string; mime_type?: string; file_size?: number }
  if (!meta.url || !meta.mime_type || !PHOTO_TYPES.has(meta.mime_type)) throw new Error('not a photo')
  if (meta.file_size && meta.file_size > MAX_PHOTO_BYTES) throw new Error('photo too large')
  const fileRes = await deps.fetch(meta.url, { headers: auth })
  if (!fileRes.ok) throw new Error(`Meta media download answered ${fileRes.status}`)
  const bytes = new Uint8Array(await fileRes.arrayBuffer())
  if (bytes.length > MAX_PHOTO_BYTES) throw new Error('photo too large')
  return bytes
}

/** Trims an OCR page to what scan-receipt accepts (api.ts LIMITS). */
export function fitLimits(page: OcrPage): OcrPage {
  return {
    ...page,
    lines: page.lines
      .map((l) => ({ ...l, words: l.words.filter((w) => w.text && w.text.length <= LIMITS.wordLength).slice(0, LIMITS.wordsPerLine) }))
      .filter((l) => l.words.length)
      .slice(0, LIMITS.lines),
  }
}

/**
 * The service key's headers (D137): a legacy service_role key is a token, sent as apikey and
 * bearer; a newer sb_secret_ key goes only in the apikey header.
 */
function keyHeaders(key: string): Record<string, string> {
  return key.startsWith('sb_') ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` }
}
