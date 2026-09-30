/**
 * The accuracy benchmark's bookkeeping (DECISIONS.md D85): what each run counted, and the
 * markdown written to benchmark/results.md. Pure; scripts/benchmark.ts reads the receipts,
 * runs the pipeline and calls these.
 *
 * Three modes, over the same receipts:
 *   parser    the rules alone (Angad's extractors), no model call
 *   model     the model reads every field
 *   combined  what the app does: the rules first, the model for what they missed
 */
import { accuracy, buildReport, precision, type FieldScore, type Report, type Tally } from './harness.ts'
import { FIELD_NAMES, type FieldName } from './types.ts'

export const MODES = ['parser', 'model', 'combined'] as const
export type Mode = (typeof MODES)[number]

/** One receipt read in one mode. */
export interface ReceiptRun {
  id: string
  scores: FieldScore[]
  /** Where each value read came from (combined mode shows the split). */
  paths: Partial<Record<FieldName, 'parser' | 'model' | 'user_corrected'>>
  /** The fields the checks put on the "please confirm" list. */
  toConfirm: FieldName[]
  /** The fields the model was asked for, and why it gave nothing, if it failed. */
  askedModel: FieldName[]
  modelError: string | null
  ms: number
}

export interface ModeSummary {
  mode: Mode
  report: Report
  /** Values read, and how many of them the rules read (no model call needed). */
  values: number
  byParser: number
  /** Receipts the model was asked about at all, and fields asked in total. */
  receiptsAsked: number
  fieldsAsked: number
  modelErrors: Record<string, number>
  /** Wrong values, and how many of them the checks put on the confirm list. */
  wrong: number
  wrongFlagged: number
  /** Median time to read one receipt, in milliseconds. */
  medianMs: number
}

export function summarize(mode: Mode, runs: ReceiptRun[]): ModeSummary {
  const report = buildReport(runs.map((r) => ({ id: r.id, scores: r.scores })))
  let values = 0
  let byParser = 0
  let wrong = 0
  let wrongFlagged = 0
  const modelErrors: Record<string, number> = {}
  for (const r of runs) {
    for (const p of Object.values(r.paths)) {
      values++
      if (p === 'parser') byParser++
    }
    for (const s of r.scores) {
      if (s.outcome !== 'wrong' && s.outcome !== 'extra') continue
      wrong++
      if (r.toConfirm.includes(s.field)) wrongFlagged++
    }
    if (r.modelError) modelErrors[r.modelError] = (modelErrors[r.modelError] ?? 0) + 1
  }
  const times = runs.map((r) => r.ms).sort((a, b) => a - b)
  return {
    mode,
    report,
    values,
    byParser,
    receiptsAsked: runs.filter((r) => r.askedModel.length).length,
    fieldsAsked: runs.reduce((n, r) => n + r.askedModel.length, 0),
    modelErrors,
    wrong,
    wrongFlagged,
    medianMs: times.length ? times[Math.floor((times.length - 1) / 2)] : 0,
  }
}

/** Whether `text` shows `phrase` as whole words: "Tran" the surname, not "Transfer". */
export function showsWord(text: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?<![\\w])${escaped}(?![\\w])`).test(text)
}

export interface RedactionSummary {
  receipts: number
  /** Personal details still readable after redaction: "receipt id: detail". */
  leaks: string[]
  /** Values hidden that should have stayed readable. */
  lost: string[]
}

export interface ResultsInput {
  date: string
  sets: { real: number; synthetic: number }
  /** The model and fallbacks used, or null when the model modes didn't run. */
  model: string | null
  images: boolean
  summaries: ModeSummary[]
  redaction: RedactionSummary
  /** Modes that didn't run, and why. */
  skipped: { mode: Mode; why: string }[]
}

const pct = (x: number | null) => (x === null ? '–' : `${(x * 100).toFixed(1)}%`)
const share = (n: number, d: number) => (d ? `${n} of ${d} (${pct(n / d)})` : '–')
const tallyOf = (s: ModeSummary, f?: FieldName): Tally => (f ? s.report.byField[f] : s.report.overall)

/** benchmark/results.md. */
export function formatResults(input: ResultsInput): string {
  const { summaries: runs } = input
  const total = input.sets.real + input.sets.synthetic
  const out: string[] = [
    '# Receipt reading benchmark',
    '',
    `Run ${input.date}, on ${total} receipt${total === 1 ? '' : 's'}: ${input.sets.real} real, ${input.sets.synthetic} synthetic.`,
    input.model
      ? `Model: \`${input.model}\` through OpenRouter, ${input.images ? 'with the redacted photo and the text' : 'with the redacted text only (no photo)'}.`
      : 'Model: not run (no `OPENROUTER_API_KEY`).',
    '',
    '**Early results.** Synthetic receipts are made up, and they were read with tesseract.js, not',
    'the phone’s ML Kit, so these numbers are a stand-in for real accuracy until there are',
    'enough real receipts to score.',
    '',
  ]
  for (const s of input.skipped) out.push(`- ${s.mode} mode didn’t run: ${s.why}`)
  if (input.skipped.length) out.push('')

  out.push('## Summary', '', '| Mode | Accuracy | Precision | Read by the rules | Wrong values flagged for checking | Median time |', '|---|---:|---:|---:|---:|---:|')
  for (const s of runs) {
    out.push(
      `| ${s.mode} | ${pct(accuracy(s.report.overall))} | ${pct(precision(s.report.overall))} | ${share(s.byParser, s.values)} | ${share(s.wrongFlagged, s.wrong)} | ${(s.medianMs / 1000).toFixed(2)} s |`,
    )
  }
  out.push(
    '',
    '- **Accuracy:** of the values the receipts show, the share read correctly. A value not read counts against it.',
    '- **Precision:** of the values read, the share that were right.',
    '- **Read by the rules:** of the values read, the share the parser read without the model.',
    '- **Wrong values flagged:** of the values read wrong, the share the receipt checks put on the',
    '  “please check” list, so the person would see them before the result.',
    '',
  )

  const combined = runs.find((s) => s.mode === 'combined')
  if (combined) {
    const errors = Object.entries(combined.modelErrors)
    out.push(
      '## The model in combined mode',
      '',
      `- Asked about ${share(combined.receiptsAsked, combined.report.receipts)} receipts, ${combined.fieldsAsked} fields in all.`,
      `- ${errors.length ? `Gave nothing on ${errors.map(([k, n]) => `${n} (${k})`).join(', ')}.` : 'Answered every time it was asked.'}`,
      '',
    )
  }

  out.push('## By field (accuracy)', '', `| Field | ${runs.map((s) => s.mode).join(' | ')} |`, `|---|${runs.map(() => '---:').join('|')}|`)
  for (const f of FIELD_NAMES) {
    const shown = runs.some((s) => {
      const t = tallyOf(s, f)
      return t.correct + t.wrong + t.missing + t.extra > 0
    })
    if (shown) out.push(`| ${f} | ${runs.map((s) => pct(accuracy(tallyOf(s, f)))).join(' | ')} |`)
  }
  out.push(`| **All fields** | ${runs.map((s) => pct(accuracy(tallyOf(s)))).join(' | ')} |`, '')

  const r = input.redaction
  out.push(
    '## Redaction',
    '',
    `On ${r.receipts} receipts: ${r.leaks.length} personal detail${r.leaks.length === 1 ? '' : 's'} left readable, ${r.lost.length} value${r.lost.length === 1 ? '' : 's'} hidden by mistake.`,
    ...r.leaks.slice(0, 20).map((l) => `- Left readable: ${l}`),
    ...r.lost.slice(0, 20).map((l) => `- Hidden by mistake: ${l}`),
    '',
    '## What this does not tell you',
    '',
    '- How the scanner does on real receipts, until `benchmark/receipts/` has enough of them.',
    '- How the phone’s OCR does: the benchmark reads photos with tesseract.js.',
    '- Whether the person would catch a flagged value; only that it was put in front of them.',
    '',
  )
  return out.join('\n')
}
