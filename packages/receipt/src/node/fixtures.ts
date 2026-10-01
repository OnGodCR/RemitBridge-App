/**
 * Loading receipt fixtures from disk (Node only; never imported by the app or the Edge
 * Function). A fixture is one receipt's OCR output and its ground truth.
 *
 * Format (packages/receipt/fixtures/*.json):
 *   id           unique, the file's name without .json
 *   description  what the receipt exercises
 *   source       'synthetic' (made up) or 'real' (from a real receipt, redacted)
 *   lines        the receipt's text, one string per printed line; boxes are laid out
 *                by pageFromLines. Or, instead:
 *   page         a full OcrPage, as the phone's OCR produced it
 *   expected     ground truth: every field the receipt shows, with values as FieldValues
 *                types them (numbers for amounts, YYYY-MM-DD for the date). Leave out a
 *                field the receipt doesn't show.
 *   pii          optional: personal details on the receipt (fictional in synthetic ones)
 *                that redaction must remove
 *   keep         optional: text that redaction must leave readable
 *   mid_rate     optional: the mid-market rate for the day, for the rate check
 *   disclosures  optional: the standard disclosures the receipt prints (Phase 6)
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { checkValue } from '../fields.ts'
import { pageFromLines } from '../ocr.ts'
import { FIELD_NAMES, type FieldName, type FieldValues, type OcrPage } from '../types.ts'

export interface Fixture {
  id: string
  description: string
  source: 'synthetic' | 'real'
  page: OcrPage
  expected: Partial<FieldValues>
  pii: string[]
  keep: string[]
  midRate?: number
  disclosures?: string[]
}

export const FIXTURES_DIR = fileURLToPath(new URL('../../fixtures/', import.meta.url))

/** Every fixture in `dir`, checked. Throws, naming the file, on anything malformed. */
export function loadFixtures(dir = FIXTURES_DIR): Fixture[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((file) => parseFixture(file.replace(/\.json$/, ''), JSON.parse(readFileSync(join(dir, file), 'utf8'))))
}

export function parseFixture(fileId: string, raw: unknown): Fixture {
  const fail = (why: string): never => {
    throw new Error(`fixture ${fileId}: ${why}`)
  }
  if (!raw || typeof raw !== 'object') fail('not an object')
  const r = raw as Record<string, unknown>
  if (r.id !== fileId) fail(`id "${String(r.id)}" doesn't match the file name`)
  if (typeof r.description !== 'string') fail('description missing')
  if (r.source !== 'synthetic' && r.source !== 'real') fail('source must be "synthetic" or "real"')

  let page: OcrPage
  if (Array.isArray(r.lines) && r.lines.every((l) => typeof l === 'string')) page = pageFromLines(r.lines as string[])
  else if (r.page && typeof r.page === 'object' && Array.isArray((r.page as OcrPage).lines)) page = r.page as OcrPage
  else return fail('needs "lines" (strings) or "page" (an OcrPage)')

  if (!r.expected || typeof r.expected !== 'object') fail('expected missing')
  const expected: Partial<FieldValues> = {}
  for (const [k, v] of Object.entries(r.expected as Record<string, unknown>)) {
    if (!(FIELD_NAMES as readonly string[]).includes(k)) fail(`unknown field "${k}"`)
    const checked = checkValue(k as FieldName, v, '9999-12-31')
    if (!checked.ok) fail(checked.error)
    else (expected as Record<string, unknown>)[k] = checked.value
  }
  const strings = (x: unknown, name: string) => {
    if (x === undefined) return []
    if (!Array.isArray(x) || !x.every((s) => typeof s === 'string')) return fail(`${name} must be a list of strings`)
    return x as string[]
  }
  return {
    id: fileId,
    description: r.description as string,
    source: r.source as Fixture['source'],
    page,
    expected,
    pii: strings(r.pii, 'pii'),
    keep: strings(r.keep, 'keep'),
    ...(typeof r.mid_rate === 'number' && r.mid_rate > 0 ? { midRate: r.mid_rate } : {}),
    ...(r.disclosures !== undefined ? { disclosures: strings(r.disclosures, 'disclosures') } : {}),
  }
}
