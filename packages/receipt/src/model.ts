/**
 * The model fallback (DECISIONS.md D79): Claude reads only the fields the parser left
 * missing or unsure, from the redacted photo and the redacted OCR text, and answers in a
 * strict JSON schema. Its answer is then checked again here field by field with
 * checkValue, so nothing it returns reaches the formula unchecked.
 *
 * This file builds the request and reads the reply. The call itself takes a client passed
 * in (the official SDK in the Edge Function and the benchmark, a fake in tests), so the
 * package stays free of network code and keys.
 */
import type Anthropic from '@anthropic-ai/sdk'

import { checkValue, FIELD_SPECS } from './fields.ts'
import { lineText } from './ocr.ts'
import type { FieldName, OcrPage, ParsedField, ParsedFields } from './types.ts'

/** Overridden by RECEIPT_MODEL in the Edge Function. */
export const DEFAULT_MODEL = 'claude-opus-5-5'

type CreateParams = Anthropic.Beta.Messages.MessageCreateParamsNonStreaming
type Message = Anthropic.Beta.Messages.BetaMessage

/** Just the part of the SDK client this file calls. */
export interface ModelClient {
  beta: { messages: { create(params: CreateParams): Promise<Message> } }
}

export interface ModelInput {
  /** The fields to read. */
  fields: FieldName[]
  /** The redacted OCR page. Its lines are numbered in the prompt so answers can say where. */
  page: OcrPage
  /** The redacted photo, if it may be sent (the server drops it when its own check finds PII). */
  image?: { mediaType: 'image/jpeg' | 'image/png'; base64: string }
  /** Today as YYYY-MM-DD. */
  today: string
  model?: string
}

/**
 * Frozen, so the prompt cache can reuse it: nothing per request goes in here.
 */
export const SYSTEM_PROMPT = `You read money transfer receipts for RemitBridge, a free, non-commercial tool that shows people what their transfers really cost.

You get a photo of one receipt, with personal details covered by solid boxes, and the same receipt's text from OCR: one numbered line per printed line, where covered words read [hidden]. You are asked for some of the receipt's fields. Return exactly those, in the JSON schema given.

For each field:
- value: the value as printed on this receipt. If the receipt does not show it, use null. Never compute, estimate or guess a value that isn't printed, and never try to read covered text.
- confidence: from 0 to 1, how sure you are that value is what the receipt says. Use 0.9 or more only when it is printed clearly next to a label that names it. Use less when the photo is unclear, the label is ambiguous, or two lines could be the answer.
- line: the number of the OCR line you read it from, or null if it isn't in the OCR text.

How to write values:
- Amounts are plain numbers: no currency symbols, no thousands separators. "$1,000.00" is 1000.
- Currencies are ISO 4217 codes: "USD", "MXN", "INR".
- The exchange rate is units of the receiving currency per 1 unit of the sending currency. If the receipt prints it the other way round, give 1 divided by the printed rate.
- Dates are YYYY-MM-DD. US receipts print month first.
- The transfer amount is the amount before fees and taxes are added, not the total paid.`

type Schema = Record<string, unknown>

function valueSchema(name: FieldName): Schema {
  const spec = FIELD_SPECS[name]
  switch (spec.kind) {
    case 'money':
    case 'rate':
      return { type: 'number' }
    case 'date':
      return { type: 'string', format: 'date' }
    case 'enum':
      return { type: 'string', enum: [...spec.values!] }
    default:
      return { type: 'string' }
  }
}

/** The strict JSON schema for an answer: one object per requested field. */
export function answerSchema(fields: FieldName[]): Schema {
  return {
    type: 'object',
    additionalProperties: false,
    required: [...fields],
    properties: Object.fromEntries(
      fields.map((f) => [
        f,
        {
          type: 'object',
          description: FIELD_SPECS[f].description,
          additionalProperties: false,
          required: ['value', 'confidence', 'line'],
          properties: {
            value: { anyOf: [valueSchema(f), { type: 'null' }] },
            confidence: { type: 'number' },
            line: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
          },
        },
      ]),
    ),
  }
}

/** The OCR text as the model sees it: "[0] WESTERN UNION", one numbered line each. */
export function numberedText(page: OcrPage): string {
  return page.lines.map((l, i) => `[${i}] ${lineText(l)}`).join('\n')
}

export function buildRequest(input: ModelInput): CreateParams {
  const content: Anthropic.Beta.Messages.BetaContentBlockParam[] = []
  if (input.image) {
    content.push({ type: 'image', source: { type: 'base64', media_type: input.image.mediaType, data: input.image.base64 } })
  }
  content.push({
    type: 'text',
    text: `Today is ${input.today}. Read these fields: ${input.fields.join(', ')}.\n\nOCR text:\n${numberedText(input.page)}`,
  })
  return {
    model: input.model ?? DEFAULT_MODEL,
    max_tokens: 16000,
    // Refusals on a receipt are unlikely, but if one happens the API retries it on
    // Anthropic's recommended fallback model instead of returning nothing.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: answerSchema(input.fields) } },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content }],
  }
}

export interface ModelResult {
  fields: ParsedFields
  /** Fields it answered with something invalid, and why. */
  problems: { field: FieldName; message: string }[]
}

/**
 * The model's JSON answer, checked: each requested field's value through checkValue, the
 * confidence within 0 to 1, the line within the page. Anything that fails is reported and
 * left out, as if the model hadn't found it.
 */
export function readAnswer(json: unknown, fields: FieldName[], page: OcrPage, today: string): ModelResult {
  const out: ModelResult = { fields: {}, problems: [] }
  if (!json || typeof json !== 'object') {
    out.problems.push(...fields.map((field) => ({ field, message: 'no answer' })))
    return out
  }
  for (const field of fields) {
    const entry = (json as Record<string, unknown>)[field] as { value?: unknown; confidence?: unknown; line?: unknown } | undefined
    if (!entry || typeof entry !== 'object') {
      out.problems.push({ field, message: 'missing from the answer' })
      continue
    }
    if (entry.value === null || entry.value === undefined) continue
    const checked = checkValue(field, entry.value, today)
    if (!checked.ok) {
      out.problems.push({ field, message: checked.error })
      continue
    }
    const c = entry.confidence
    if (typeof c !== 'number' || !(c >= 0 && c <= 1)) {
      out.problems.push({ field, message: `confidence ${String(c)} is outside 0 to 1` })
      continue
    }
    const line = entry.line
    const parsed: ParsedField = { value: checked.value, confidence: c }
    if (typeof line === 'number' && Number.isInteger(line) && page.lines[line]) parsed.source = { line }
    ;(out.fields as Record<FieldName, ParsedField>)[field] = parsed
  }
  return out
}

export class ModelError extends Error {
  constructor(
    message: string,
    /** over_cap: this month's model calls are used up (thrown by the caller's gate). */
    readonly reason: 'refusal' | 'truncated' | 'unreadable' | 'over_cap',
  ) {
    super(message)
  }
}

/**
 * Asks the model for `input.fields`. Throws ModelError when there's no usable answer (a
 * refusal that the fallback didn't rescue, a reply cut off at max_tokens, or text that
 * isn't JSON); SDK errors (rate limits, outages) pass through for the caller to handle.
 */
export async function askModel(client: ModelClient, input: ModelInput): Promise<ModelResult> {
  if (!input.fields.length) return { fields: {}, problems: [] }
  const message = await client.beta.messages.create(buildRequest(input))
  if (message.stop_reason === 'refusal') throw new ModelError('the model declined to read this receipt', 'refusal')
  if (message.stop_reason === 'max_tokens') throw new ModelError('the answer was cut off', 'truncated')
  const text = message.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new ModelError('the answer was not JSON', 'unreadable')
  }
  return readAnswer(json, input.fields, input.page, input.today)
}
