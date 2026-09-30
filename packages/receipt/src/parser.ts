/**
 * The rule-based parser's frame (DECISIONS.md D83). It runs the extractors in
 * extract/fields.ts (Angad's) in FIELD_NAMES order, checks every value they return, and
 * never lets one broken extractor stop the others. The provider runs first because it
 * picks the template the others read.
 */
import { EXTRACTORS, type Extractors } from './extract/index.ts'
import { checkValue } from './fields.ts'
import { GENERIC, TEMPLATES, templateFor, type ProviderTemplate } from './templates.ts'
import { FIELD_NAMES, type FieldName, type OcrPage, type ParsedField, type ParsedFields } from './types.ts'

export interface ParseOptions {
  /** Today as YYYY-MM-DD. */
  today: string
  templates?: ProviderTemplate[]
  /** Swapped in by tests; the real ones by default. */
  extractors?: Extractors
}

export interface ParseResult {
  /** The template the fields were read with ('generic' if the provider wasn't recognized). */
  templateId: string
  fields: ParsedFields
  /** Values an extractor returned that failed checkValue, and extractors that threw. */
  problems: { field: FieldName; message: string }[]
}

export function parseReceipt(page: OcrPage, options: ParseOptions): ParseResult {
  const templates = options.templates ?? TEMPLATES
  const extractors = options.extractors ?? EXTRACTORS
  const fields: ParsedFields = {}
  const problems: ParseResult['problems'] = []
  let template: ProviderTemplate = GENERIC

  for (const name of FIELD_NAMES) {
    let got: ParsedField | null = null
    try {
      got = (extractors[name] as (ctx: Parameters<Extractors[FieldName]>[0]) => ParsedField | null)({
        page,
        template,
        found: fields,
        today: options.today,
      })
    } catch (e) {
      problems.push({ field: name, message: `threw: ${e instanceof Error ? e.message : String(e)}` })
      continue
    }
    if (!got) continue
    const checked = checkValue(name, got.value, options.today)
    if (!checked.ok) {
      problems.push({ field: name, message: checked.error })
      continue
    }
    if (!(got.confidence >= 0 && got.confidence <= 1)) {
      problems.push({ field: name, message: `confidence ${got.confidence} is outside 0 to 1` })
      continue
    }
    if (got.source && !page.lines[got.source.line]) {
      problems.push({ field: name, message: `source line ${got.source.line} doesn't exist` })
      got = { ...got, source: undefined }
    }
    ;(fields as Record<FieldName, ParsedField>)[name] = { ...got, value: checked.value }
    if (name === 'provider') template = templateFor(checked.value as string, templates)
  }

  return { templateId: template.id, fields, problems }
}
