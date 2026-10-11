/**
 * The whole reading of one receipt, from a redacted OCR page to checked values:
 * parse (rules) → ask the model for what's missing or unsure → merge → validate.
 * The same function runs for the app (in the scan-receipt Edge Function) and for WhatsApp
 * (in the worker, Phase 5), and the benchmark calls it in each of its modes.
 */
import { mergeFields, fieldsForModel } from './merge.ts'
import { askModel, ModelError, type ModelClient, type Reasoning } from './model.ts'
import { parseReceipt, type ParseOptions } from './parser.ts'
import { templateFor } from './templates.ts'
import type { ExtractedFields, FieldName, OcrPage, ParsedFields } from './types.ts'
import { validateReceipt, type Validation } from './validate.ts'

export interface ReadInput {
  /** The redacted page. */
  page: OcrPage
  /** The redacted photo, when it may go to the model. */
  image?: { mediaType: 'image/jpeg' | 'image/png'; base64: string }
  today: string
  /**
   * The model, or null to read with the rules alone (over the monthly cap, no key set, or
   * the benchmark's parser-only mode).
   */
  model: { client: ModelClient; model?: string; reasoning?: Reasoning } | null
  /** 'combined' (the default) asks the model only for what the rules missed; 'model' asks it for everything. */
  mode?: 'combined' | 'model'
  /** The mid-market rate for the receipt's currencies and date, looked up by the caller. */
  midRate?: (send: string, receive: string, date: string | undefined) => Promise<number | null>
  extractors?: ParseOptions['extractors']
  templates?: ParseOptions['templates']
}

export interface ReadResult {
  /** The template the rules used. */
  templateId: string
  /** The matching row in `providers`, or null for a provider we don't track. */
  providerId: string | null
  fields: ExtractedFields
  validation: Validation
  /** What the model was asked for (empty if it wasn't called). */
  askedModel: FieldName[]
  /** Why the model gave nothing, if it was asked and failed. */
  modelError: string | null
  problems: { field: FieldName; message: string; from: 'parser' | 'model' }[]
}

export async function readReceipt(input: ReadInput): Promise<ReadResult> {
  const mode = input.mode ?? 'combined'
  const parsed =
    mode === 'model'
      ? { templateId: 'generic', fields: {} as ParsedFields, problems: [] }
      : parseReceipt(input.page, { today: input.today, extractors: input.extractors, templates: input.templates })
  const problems: ReadResult['problems'] = parsed.problems.map((p) => ({ ...p, from: 'parser' as const }))

  const ask = input.model ? fieldsForModel(parsed.fields) : []
  let modelFields: ParsedFields | null = null
  let modelError: string | null = null
  if (ask.length && input.model) {
    try {
      const answer = await askModel(input.model.client, {
        fields: ask,
        page: input.page,
        image: input.image,
        today: input.today,
        model: input.model.model,
        reasoning: input.model.reasoning,
      })
      modelFields = answer.fields
      problems.push(...answer.problems.map((p) => ({ ...p, from: 'model' as const })))
    } catch (e) {
      // Without the model the person types what's missing; the reading still goes on.
      modelError = e instanceof ModelError ? e.reason : 'unavailable'
    }
  }

  const fields = mergeFields(parsed.fields, modelFields)
  const send = fields.send_currency?.value
  const receive = fields.receive_currency?.value
  const midRate = send && receive && input.midRate ? await input.midRate(send, receive, fields.transfer_date?.value) : null
  const validation = validateReceipt(fields, { midRate })
  const template = templateFor(fields.provider?.value, input.templates)

  return {
    templateId: fields.provider ? template.id : parsed.templateId,
    providerId: template.providerId,
    fields: validation.fields,
    validation,
    askedModel: ask,
    modelError,
    problems,
  }
}
