/**
 * Scoring read values against ground truth, for the parser's fixtures now and the accuracy
 * benchmark in Phase 4. Pure: loading files is in node/fixtures.ts.
 */
import { FIELD_SPECS } from './fields.ts'
import { FIELD_NAMES, type FieldName, type FieldValues } from './types.ts'

export type Values = Partial<FieldValues>

/**
 * correct: matches the ground truth; wrong: a different value; missing: the receipt shows
 * it and nothing was read; extra: a value read that the receipt doesn't show.
 */
export type Outcome = 'correct' | 'wrong' | 'missing' | 'extra'

export interface FieldScore {
  field: FieldName
  outcome: Outcome
  expected?: FieldValues[FieldName]
  got?: FieldValues[FieldName]
}

/**
 * Whether two values of a field are the same: money to the cent, rates to one part in a
 * million, currency codes and provider names ignoring case, everything else exactly.
 */
export function sameValue(field: FieldName, a: unknown, b: unknown): boolean {
  const kind = FIELD_SPECS[field].kind
  if (kind === 'money') return typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < 0.005
  if (kind === 'rate') return typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a))
  if (kind === 'currency' || kind === 'text') {
    return typeof a === 'string' && typeof b === 'string' && a.trim().toLowerCase() === b.trim().toLowerCase()
  }
  return a === b
}

export function scoreFields(expected: Values, got: Values): FieldScore[] {
  const out: FieldScore[] = []
  for (const field of FIELD_NAMES) {
    const e = expected[field]
    const g = got[field]
    if (e === undefined && g === undefined) continue
    const outcome: Outcome =
      e === undefined ? 'extra' : g === undefined ? 'missing' : sameValue(field, e, g) ? 'correct' : 'wrong'
    out.push({ field, outcome, expected: e, got: g })
  }
  return out
}

export interface Tally {
  correct: number
  wrong: number
  missing: number
  extra: number
}

export interface Report {
  receipts: number
  byField: Record<FieldName, Tally>
  overall: Tally
  rows: { id: string; scores: FieldScore[] }[]
}

const emptyTally = (): Tally => ({ correct: 0, wrong: 0, missing: 0, extra: 0 })

export function buildReport(rows: { id: string; scores: FieldScore[] }[]): Report {
  const byField = Object.fromEntries(FIELD_NAMES.map((f) => [f, emptyTally()])) as Record<FieldName, Tally>
  const overall = emptyTally()
  for (const row of rows) {
    for (const s of row.scores) {
      byField[s.field][s.outcome]++
      overall[s.outcome]++
    }
  }
  return { receipts: rows.length, byField, overall, rows }
}

/** Of the values the receipts show, the share read correctly. */
export function accuracy(t: Tally): number | null {
  const shown = t.correct + t.wrong + t.missing
  return shown ? t.correct / shown : null
}

/** Of the values that were read, the share that were right. */
export function precision(t: Tally): number | null {
  const read = t.correct + t.wrong + t.extra
  return read ? t.correct / read : null
}

const pctOrDash = (x: number | null) => (x === null ? '–' : `${(x * 100).toFixed(1)}%`)

/** The report as a markdown table: one row per field, then the total. */
export function formatReport(report: Report, title = 'Parser'): string {
  const lines = [
    `### ${title}: ${report.receipts} receipt${report.receipts === 1 ? '' : 's'}`,
    '',
    '| Field | Correct | Wrong | Missing | Extra | Accuracy | Precision |',
    '|---|---:|---:|---:|---:|---:|---:|',
  ]
  const row = (name: string, t: Tally) =>
    `| ${name} | ${t.correct} | ${t.wrong} | ${t.missing} | ${t.extra} | ${pctOrDash(accuracy(t))} | ${pctOrDash(precision(t))} |`
  for (const f of FIELD_NAMES) lines.push(row(f, report.byField[f]))
  lines.push(row('**All fields**', report.overall))
  lines.push(
    '',
    'Accuracy: of the values each receipt shows, the share read correctly (missing counts against it).',
    'Precision: of the values read, the share that were right (a value read that the receipt doesn’t show counts against it).',
  )
  return lines.join('\n')
}

/** Just the values of read fields, for scoring. */
export function valuesOf(fields: { [K in FieldName]?: { value: FieldValues[K] } }): Values {
  const out: Values = {}
  for (const f of FIELD_NAMES) {
    const v = fields[f]?.value
    if (v !== undefined) (out as Record<string, unknown>)[f] = v
  }
  return out
}
