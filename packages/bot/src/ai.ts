/**
 * The bot's model (docs/whatsapp-ai-scope.md, D159). It's asked only when the rule parser
 * can't read a message ("500 to India" never reaches it), and it does two narrow jobs:
 *
 *   1. understand(): what the person wants, as a small JSON object we validate and turn
 *      into the same Command the parser makes, or into a question, a suggestion or
 *      something off topic;
 *   2. answer(): a few plain sentences that answer a question from our own notes
 *      (knowledge.ts), never from the model's general knowledge.
 *
 * The model never writes a price. Prices still come from the database through the
 * templates. Its answers are checked (checkAnswer): any number not in the notes, any link,
 * or anything too long, and the bot sends its plain reply instead. When the model is
 * missing, slow or over its daily limit, the bot works exactly as it did before.
 *
 * The model runs on Cloudflare Workers AI's free allowance, through its OpenAI-compatible
 * endpoint. Cloudflare doesn't use what it's sent to train models. It's sent the message
 * text only: never the phone number, never a photo.
 */
import { RECEIVING } from '../../../mobile/src/lib/countries.ts'
import type { DeliveryMethod } from '../../../mobile/src/lib/routes.ts'
import { DELIVERY_LABELS } from '../../../mobile/src/lib/routes.ts'
import { retrieve, type Entry } from './knowledge.ts'
import type { Command, Language } from './parse.ts'

export const DEFAULT_AI_MODEL = '@cf/qwen/qwen3-30b-a3b-fp8'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** Something that runs a chat model and returns its text. Tests pass a fake. */
export interface AiClient {
  chat(messages: ChatMessage[], options: { maxTokens: number }): Promise<string>
}

/** Workers AI's OpenAI-compatible chat endpoint, with a timeout so a slow model can't hold a reply. */
export function cloudflareClient(
  accountId: string,
  token: string,
  model = DEFAULT_AI_MODEL,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 9000,
): AiClient {
  return {
    async chat(messages, { maxTokens }) {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), timeoutMs)
      try {
        const res = await fetchImpl(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0 }),
          signal: ctrl.signal,
        })
        if (!res.ok) throw new Error(`model service: HTTP ${res.status}`)
        const body = (await res.json()) as { choices?: { message?: { content?: string | null } }[] }
        const text = body.choices?.[0]?.message?.content
        if (typeof text !== 'string') throw new Error('model service: no text in the answer')
        return stripThinking(text)
      } finally {
        clearTimeout(timer)
      }
    },
  }
}

/** Qwen3 can open with its reasoning in <think> tags; only what follows is the answer. */
export function stripThinking(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/^[\s\S]*<\/think>/, '').trim()
}

// --- 1. Understanding --------------------------------------------------------------

export type Understood =
  | { kind: 'command'; command: Command }
  | { kind: 'ask'; question: string; language?: Language }
  | { kind: 'suggest'; text: string; language?: Language }
  | { kind: 'offtopic'; language?: Language }

const INTENTS = ['prices', 'request_route', 'scam', 'question', 'suggestion', 'greeting', 'offtopic'] as const
const METHODS = Object.keys(DELIVERY_LABELS) as DeliveryMethod[]
const COUNTRIES = RECEIVING.map((c) => `${c.code} ${c.name}`).join(', ')

const UNDERSTAND_PROMPT = `You sort WhatsApp messages sent to RemitBridge, a free service that compares the cost of sending money from the US to other countries. You don't answer the message. You only return one JSON object, with no other text:

{"intent": "...", "amount": null, "country": null, "method": null, "question": null, "suggestion": null, "language": "en"}

intent is one of:
- "prices": they want to know what sending money costs or who gives the most (fill amount in US dollars and country if given)
- "request_route": they ask us to add or cover a country (fill country)
- "scam": they're worried a request for money is a scam
- "question": a question about sending money, costs, exchange rates, words, or how RemitBridge or its app works (fill question with a short, clear restatement in English)
- "suggestion": an idea, feature request or complaint about RemitBridge (fill suggestion with their words)
- "greeting": hello, thanks, or what can you do
- "offtopic": anything else (weather, homework, other companies' accounts, general chat)

country is a two-letter code from this list, or null: ${COUNTRIES}.
method is one of ${METHODS.join(', ')}, or null.
language is "hi" if they wrote in Hindi (Devanagari or Hinglish), otherwise "en".
/no_think`

/** Asks the model what a message wants. Null when it can't say clearly (the caller falls back). */
export async function understand(client: AiClient, text: string): Promise<Understood | null> {
  const raw = await client.chat(
    [
      { role: 'system', content: UNDERSTAND_PROMPT },
      { role: 'user', content: text.slice(0, 600) },
    ],
    { maxTokens: 200 },
  )
  return readUnderstood(raw)
}

/** The model's JSON as an Understood, validated field by field. Anything off is dropped, not trusted. */
export function readUnderstood(raw: string): Understood | null {
  const json = raw.match(/\{[\s\S]*\}/)?.[0]
  if (!json) return null
  let o: Record<string, unknown>
  try {
    o = JSON.parse(json)
  } catch {
    return null
  }
  const intent = INTENTS.find((i) => i === o.intent)
  if (!intent) return null
  const language: Language = o.language === 'hi' ? 'hi' : 'en'
  const country = typeof o.country === 'string' && RECEIVING.some((c) => c.code === o.country) ? o.country : undefined
  const amount = typeof o.amount === 'number' && o.amount > 0 && o.amount <= 1_000_000 ? o.amount : undefined
  const method = METHODS.find((m) => m === o.method)
  const words = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 500) : null)

  switch (intent) {
    case 'prices':
      return { kind: 'command', command: { kind: 'compare', amount, from: 'US', to: country, method } }
    case 'request_route':
      return { kind: 'command', command: { kind: 'request', from: 'US', to: country } }
    case 'scam':
      return { kind: 'command', command: { kind: 'scam' } }
    case 'greeting':
      return { kind: 'command', command: { kind: 'help' } }
    case 'question': {
      const question = words(o.question)
      return question ? { kind: 'ask', question, language } : null
    }
    case 'suggestion': {
      const text = words(o.suggestion)
      return text ? { kind: 'suggest', text, language } : null
    }
    case 'offtopic':
      return { kind: 'offtopic', language }
  }
}

// --- 2. Answering -------------------------------------------------------------------

export interface Answer {
  text: string
  /** The link to send under it: the best note's. */
  link: string
}

const ANSWER_PROMPT = (lang: Language) => `You answer questions for RemitBridge, a free service that compares the cost of sending money from the US. Answer ONLY from the notes below. If the notes don't answer the question, reply exactly: NO_ANSWER

Rules:
- At most three short sentences, plain everyday words, ${lang === 'hi' ? 'in simple Hindi (Devanagari)' : 'in English'}.
- No numbers, prices or rates unless they appear in the notes word for word.
- No links, no lists, no emoji, no greetings.
- Never tell someone what to do with their money; explain, don't advise.
/no_think`

/** Answers a question from our notes, or null when the notes don't cover it or the answer fails a check. */
export async function answer(client: AiClient, question: string, lang: Language): Promise<Answer | null> {
  const notes = retrieve(question)
  if (!notes.length) return null
  const raw = await client.chat(
    [
      { role: 'system', content: ANSWER_PROMPT(lang) },
      { role: 'user', content: `Notes:\n${notes.map((n) => `- ${n.title}: ${n.text}`).join('\n')}\n\nQuestion: ${question}` },
    ],
    { maxTokens: 300 },
  )
  const text = raw.trim()
  if (!text || text.includes('NO_ANSWER')) return null
  return checkAnswer(text, notes) ? { text, link: notes[0].link } : null
}

const NUMBER = /\d[\d,.]*/g

/**
 * The model's answer may only use numbers that are in the notes it was given, may not
 * carry links (we add the one link ourselves), and must fit on a phone screen.
 */
export function checkAnswer(text: string, notes: Entry[]): boolean {
  if (text.length > 600) return false
  if (/https?:\/\/|www\.|\.(com|org|net)\b/i.test(text)) return false
  const allowed = new Set(notes.flatMap((n) => `${n.title} ${n.text}`.match(NUMBER) ?? []).map((n) => n.replace(/[,.]$/, '')))
  return (text.match(NUMBER) ?? []).every((n) => allowed.has(n.replace(/[,.]$/, '')))
}
