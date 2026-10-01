/**
 * The model fallback (DECISIONS.md D79, D92): a vision model reads only the fields the
 * parser left missing or unsure, from the redacted photo and the redacted OCR text, and
 * answers in a strict JSON schema. Its answer is then checked again here field by field
 * with checkValue, so nothing it returns reaches the formula unchecked.
 *
 * The model is reached through Groq's chat completions API (OpenAI's request shape), so
 * which model reads receipts is one setting. This file builds the request and reads the
 * reply; the call itself takes a client passed in (groqClient in the Edge Function and the
 * benchmark, a fake in tests), so tests never touch the network.
 */
import { checkValue, FIELD_SPECS } from './fields.ts'
import { lineText } from './ocr.ts'
import type { FieldName, OcrPage, ParsedField, ParsedFields } from './types.ts'

/**
 * Qwen3.8 27B, on Groq's free tier (D98): Groq's one model that reads photos, and one of
 * the three it holds to a strict JSON schema. Groq keeps nothing it's sent by default.
 * Overridden by RECEIPT_MODEL.
 */
export const DEFAULT_MODEL = 'qwen/qwen3.8-27b'

export const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

type TextPart = { type: 'text'; text: string }
type ImagePart = { type: 'image_url'; image_url: { url: string } }

/** The chat completions request, as much of it as this file sends. */
export interface ChatRequest {
  model: string
  messages: [{ role: 'system'; content: string }, { role: 'user'; content: (TextPart | ImagePart)[] }]
  response_format: { type: 'json_schema'; json_schema: { name: string; strict: true; schema: Record<string, unknown> } }
  /** Groq's switch for Qwen's thinking. Off: the answer is a reading, not a puzzle, and
   *  thinking would spend the free tier's tokens. */
  reasoning_effort: 'none'
  /** Groq requires parsed or hidden with a JSON schema; hidden returns the answer alone. */
  reasoning_format: 'hidden'
  temperature: number
  max_tokens: number
}

/** The reply, as much of it as this file reads. */
export interface ChatResponse {
  choices?: { finish_reason?: string | null; message?: { content?: string | null; refusal?: string | null } }[]
  error?: { message?: string; code?: number | string }
}

/** Just what this file needs from a client: send one request, get one reply. */
export interface ModelClient {
  complete(request: ChatRequest): Promise<ChatResponse>
}

/**
 * A client for Groq over plain fetch, so no SDK is needed in the app, the Edge Function or
 * Node. A non-2xx reply throws (the pipeline then reads with the rules alone), including a
 * 429 when the free tier's limits are reached; the error names the status only, never the
 * request.
 */
export function groqClient(apiKey: string, fetchImpl: typeof fetch = fetch): ModelClient {
  return {
    async complete(request) {
      const res = await fetchImpl(GROQ_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
      if (!res.ok) throw new Error(`groq: HTTP ${res.status}`)
      return (await res.json()) as ChatResponse
    },
  }
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
      return { type: 'string', description: 'YYYY-MM-DD' }
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

export function buildRequest(input: ModelInput): ChatRequest {
  const content: (TextPart | ImagePart)[] = []
  if (input.image) {
    content.push({ type: 'image_url', image_url: { url: `data:${input.image.mediaType};base64,${input.image.base64}` } })
  }
  content.push({
    type: 'text',
    text: `Today is ${input.today}. Read these fields: ${input.fields.join(', ')}.\n\nOCR text:\n${numberedText(input.page)}`,
  })
  return {
    model: input.model ?? DEFAULT_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content },
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'receipt_fields', strict: true, schema: answerSchema(input.fields) } },
    reasoning_effort: 'none',
    reasoning_format: 'hidden',
    temperature: 0,
    // An answer is about 40 tokens a field. Groq counts what's asked for against the free
    // tier's tokens a minute, so this stays near what an answer can use.
    max_tokens: 1500,
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

export type ModelErrorReason = 'refusal' | 'truncated' | 'unreadable' | 'failed' | 'over_cap'

export class ModelError extends Error {
  /**
   * refusal: the model declined; truncated: cut off at max_tokens; unreadable: not JSON;
   * failed: the model service answered with an error; over_cap: this month's model calls are used
   * up (thrown by the caller's gate).
   */
  readonly reason: ModelErrorReason

  // A plain field, not a constructor parameter property, so Node can run this file by
  // stripping its types (the benchmark script).
  constructor(message: string, reason: ModelErrorReason) {
    super(message)
    this.reason = reason
  }
}

/**
 * The JSON in a reply. A strict schema should give bare JSON, but some models wrap it in a
 * Markdown code fence anyway, so one fence around the whole reply is allowed.
 */
export function replyJson(text: string): unknown {
  const fenced = /^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/.exec(text)
  return JSON.parse(fenced ? fenced[1] : text)
}

/**
 * Asks the model for `input.fields`. Throws ModelError when there's no usable answer (a
 * refusal, a reply cut off at max_tokens, an error in the reply, or text that isn't JSON);
 * network errors and non-2xx replies pass through for the caller to handle.
 */
export async function askModel(client: ModelClient, input: ModelInput): Promise<ModelResult> {
  if (!input.fields.length) return { fields: {}, problems: [] }
  const reply = await client.complete(buildRequest(input))
  if (reply.error) throw new ModelError('the model answered with an error', 'failed')
  const choice = reply.choices?.[0]
  if (!choice) throw new ModelError('the reply had no answer', 'failed')
  if (choice.message?.refusal || choice.finish_reason === 'content_filter') {
    throw new ModelError('the model declined to read this receipt', 'refusal')
  }
  if (choice.finish_reason === 'length') throw new ModelError('the answer was cut off', 'truncated')
  if (choice.finish_reason === 'error') throw new ModelError('the model answered with an error', 'failed')
  let json: unknown
  try {
    json = replyJson(choice.message?.content ?? '')
  } catch {
    throw new ModelError('the answer was not JSON', 'unreadable')
  }
  return readAnswer(json, input.fields, input.page, input.today)
}
