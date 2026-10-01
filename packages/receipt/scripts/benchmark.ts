/**
 * The accuracy benchmark (DECISIONS.md D85):
 *
 *   npm run benchmark -w @remitbridge/receipt -- [--modes parser,model,combined] [--images]
 *                                                 [--limit N] [--only real|synthetic]
 *
 * Reads every receipt in benchmark/receipts/ (real) and benchmark/synthetic/ (made by
 * `npm run synthesize`), redacts it as the phone would, reads it in each mode, scores each
 * field against the ground truth, and writes benchmark/results.md.
 *
 * The model modes need OPENROUTER_API_KEY in the environment (never in a file here) and
 * use RECEIPT_MODEL / RECEIPT_MODEL_FALLBACKS like the Edge Function. Without the key they
 * are skipped and results.md says so. --images also sends each receipt's redacted photo
 * (<id>.redacted.png next to a real receipt, or in benchmark/synthetic/images/).
 * They cost money: about a tenth of a cent a receipt at the D92 price. Not run in CI.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { formatResults, MODES, showsWord, summarize, type Mode, type ReceiptRun } from '../src/benchmark.ts'
import { checkDisclosures } from '../src/disclosures.ts'
import { scoreFields, valuesOf } from '../src/harness.ts'
import { DEFAULT_MODEL, openRouterClient } from '../src/model.ts'
import { loadFixtures, type Fixture } from '../src/node/fixtures.ts'
import { pageText } from '../src/ocr.ts'
import { parseReceipt } from '../src/parser.ts'
import { readReceipt } from '../src/pipeline.ts'
import { detectPii, redactPage } from '../src/redact.ts'
import type { FieldName } from '../src/types.ts'
import { validateReceipt } from '../src/validate.ts'

const { values: args } = parseArgs({
  options: {
    modes: { type: 'string', default: MODES.join(',') },
    images: { type: 'boolean', default: false },
    limit: { type: 'string' },
    only: { type: 'string' },
    out: { type: 'string' },
  },
})

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const REAL = join(ROOT, 'benchmark/receipts')
const SYNTH = join(ROOT, 'benchmark/synthetic')
const OUT = args.out ?? join(ROOT, 'benchmark/results.md')
const today = new Date().toISOString().slice(0, 10)

const hasJson = (dir: string) => existsSync(dir) && readdirSync(dir).some((f) => f.endsWith('.json'))
let real = args.only === 'synthetic' || !hasJson(REAL) ? [] : loadFixtures(REAL)
let synthetic = args.only === 'real' || !hasJson(SYNTH) ? [] : loadFixtures(SYNTH)
if (args.limit) {
  const n = Number(args.limit)
  real = real.slice(0, n)
  synthetic = synthetic.slice(0, Math.max(0, n - real.length))
}
const receipts = [...real, ...synthetic]
if (!receipts.length) {
  console.error('No receipts. Run `npm run synthesize -w @remitbridge/receipt` first, or add real ones to benchmark/receipts/.')
  process.exit(1)
}

const key = process.env.OPENROUTER_API_KEY
const modelName = process.env.RECEIPT_MODEL || DEFAULT_MODEL
const fallbacks = (process.env.RECEIPT_MODEL_FALLBACKS ?? '').split(',').map((m) => m.trim()).filter(Boolean)
const wanted = args.modes.split(',').map((m) => m.trim()) as Mode[]
const skipped: { mode: Mode; why: string }[] = []
const modes = wanted.filter((m) => {
  if (!MODES.includes(m)) throw new Error(`unknown mode "${m}"`)
  if (m !== 'parser' && !key) {
    skipped.push({ mode: m, why: 'no `OPENROUTER_API_KEY` in the environment.' })
    return false
  }
  return true
})
const client = key ? openRouterClient(key) : null

function imageFor(f: Fixture): { mediaType: 'image/png'; base64: string } | undefined {
  if (!args.images) return undefined
  for (const p of [join(REAL, `${f.id}.redacted.png`), join(SYNTH, 'images', `${f.id}.redacted.png`)]) {
    if (existsSync(p)) return { mediaType: 'image/png', base64: readFileSync(p).toString('base64') }
  }
  return undefined
}

// Redact each receipt once, as the phone would, and count what redaction got wrong.
const leaks: string[] = []
const lost: string[] = []
const pages = new Map(
  receipts.map((f) => {
    const page = redactPage(f.page, detectPii(f.page))
    const text = pageText(page)
    const original = pageText(f.page)
    for (const p of f.pii) if (showsWord(text, p)) leaks.push(`${f.id}: “${p}”`)
    // Only values OCR actually read can be lost to redaction.
    for (const k of f.keep) if (original.includes(k) && !text.includes(k)) lost.push(`${f.id}: “${k}”`)
    return [f.id, page]
  }),
)

async function readOne(f: Fixture, mode: Mode): Promise<ReceiptRun> {
  const page = pages.get(f.id)!
  const started = performance.now()
  if (mode === 'parser') {
    const parsed = parseReceipt(page, { today })
    const fields = Object.fromEntries(
      Object.entries(parsed.fields).map(([k, v]) => [k, { ...v, path: 'parser' as const, validated: false }]),
    )
    const validation = validateReceipt(fields, { midRate: f.midRate })
    return {
      id: f.id,
      scores: scoreFields(f.expected, valuesOf(parsed.fields)),
      paths: Object.fromEntries(Object.keys(parsed.fields).map((k) => [k, 'parser'])),
      toConfirm: validation.toConfirm,
      askedModel: [],
      modelError: null,
      ms: performance.now() - started,
    }
  }
  const result = await readReceipt({
    page,
    image: imageFor(f),
    today,
    model: { client: client!, model: modelName, fallbacks },
    mode: mode === 'model' ? 'model' : 'combined',
    midRate: async () => f.midRate ?? null,
  })
  return {
    id: f.id,
    scores: scoreFields(f.expected, valuesOf(result.fields)),
    paths: Object.fromEntries(Object.entries(result.fields).map(([k, v]) => [k, v!.path])) as ReceiptRun['paths'],
    toConfirm: result.validation.toConfirm as FieldName[],
    askedModel: result.askedModel,
    modelError: result.modelError,
    ms: performance.now() - started,
  }
}

/** A few at a time, so a model run doesn't take all day or trip rate limits. */
async function readAll(mode: Mode): Promise<ReceiptRun[]> {
  const out: ReceiptRun[] = new Array(receipts.length)
  let next = 0
  const lanes = mode === 'parser' ? 1 : 4
  await Promise.all(
    Array.from({ length: lanes }, async () => {
      while (next < receipts.length) {
        const i = next++
        out[i] = await readOne(receipts[i], mode)
      }
    }),
  )
  return out
}

const summaries = []
for (const mode of modes) {
  console.log(`Reading ${receipts.length} receipts in ${mode} mode…`)
  summaries.push(summarize(mode, await readAll(mode)))
}

// The disclosure check against each receipt's listed disclosures (synthetic ones list them).
const TEXT_ITEMS = ['date_available', 'error_rights', 'cancellation', 'provider_contact', 'cfpb_contact'] as const
const byItem: Record<string, { right: number; total: number }> = Object.fromEntries(TEXT_ITEMS.map((i) => [i, { right: 0, total: 0 }]))
let disclosureReceipts = 0
for (const f of receipts) {
  if (!f.disclosures) continue
  disclosureReceipts++
  const results = checkDisclosures(pages.get(f.id)!, f.expected)
  for (const item of TEXT_ITEMS) {
    const found = results.find((d) => d.item === item)?.found ?? false
    byItem[item].total++
    if (found === f.disclosures.includes(item)) byItem[item].right++
  }
}

const md = formatResults({
  date: today,
  sets: { real: real.length, synthetic: synthetic.length },
  model: modes.some((m) => m !== 'parser') ? [modelName, ...fallbacks].join(', then ') : null,
  images: args.images,
  summaries,
  redaction: { receipts: receipts.length, leaks, lost },
  skipped,
  disclosures: { receipts: disclosureReceipts, byItem },
})
writeFileSync(OUT, md)
console.log(md)
