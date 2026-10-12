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
import { DELIVERY_LABELS, routeFor } from '../../../mobile/src/lib/routes.ts'
import { CORE, isOurLink, retrieve, type Entry } from './knowledge.ts'
import { findPlaces, normalize, type Command, type Language } from './parse.ts'

/** Sorts messages: small and fast, and 97% right on the test set (D159). */
export const DEFAULT_AI_MODEL = '@cf/qwen/qwen3-30b-a3b-fp8'
/** Writes answers: a much stronger open model, used only when there's something to say. */
export const DEFAULT_ANSWER_MODEL = '@cf/openai/gpt-oss-120b'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** Something that runs a chat model and returns its text. Tests pass a fake. */
export interface AiClient {
  chat(messages: ChatMessage[], options: { maxTokens: number }): Promise<string>
}

/**
 * Any OpenAI-compatible chat endpoint (Cloudflare Workers AI, Groq), with a timeout so a slow
 * model can't hold a reply. `extra` carries provider-specific settings, such as Groq's
 * reasoning effort for gpt-oss.
 */
export function openAiClient(
  url: string,
  token: string,
  model: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 9000,
  extra: Record<string, unknown> = {},
): AiClient {
  return {
    async chat(messages, { maxTokens }) {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), timeoutMs)
      try {
        const res = await fetchImpl(url, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0, ...extra }),
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

/** Workers AI's OpenAI-compatible chat endpoint. */
export function cloudflareClient(
  accountId: string,
  token: string,
  model = DEFAULT_AI_MODEL,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 9000,
): AiClient {
  return openAiClient(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`, token, model, fetchImpl, timeoutMs)
}

/** Groq's endpoint, for its free gpt-oss models (low reasoning effort, to spare the daily tokens). */
export function groqChatClient(token: string, model: string, fetchImpl: typeof fetch = fetch, timeoutMs = 9000): AiClient {
  return openAiClient('https://api.groq.com/openai/v1/chat/completions', token, model, fetchImpl, timeoutMs, { reasoning_effort: 'low' })
}

/**
 * Several providers as one (D163): each call goes to the first, and on any error (a daily
 * limit's 429, a timeout, an outage) to the next. Only when all fail does the call throw,
 * and the bot falls back to its plain replies.
 */
export function chainClient(clients: AiClient[], onFail: (index: number, error: unknown) => void = () => {}): AiClient & { used: () => number } {
  // A provider that failed once is skipped for the rest of the conversation, so a long
  // conversation doesn't wait on the same 429 at every step.
  let start = 0
  return {
    used: () => start,
    async chat(messages, options) {
      let last: unknown = new Error('no model providers configured')
      for (let i = start; i < clients.length; i++) {
        try {
          const text = await clients[i].chat(messages, options)
          start = i
          return text
        } catch (e) {
          onFail(i, e)
          last = e
        }
      }
      start = clients.length
      throw last
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
- "request_route": they ask us to add a country to SEND MONEY TO that we don't cover yet (fill country). Adding a provider, a country to send FROM, a currency or a feature is a "suggestion", not this
- "scam": they're worried a request for money is a scam
- "question": a question about sending money, costs, exchange rates, words, or how RemitBridge or its app works, including which countries or languages it covers (fill question with a short, clear restatement in English)
- "suggestion": an idea, feature request, provider or country-to-send-from they want added, or a complaint about RemitBridge (fill suggestion with their words)
- "greeting": hello, thanks, how are you, or what can you do (fill question with their words)
- "offtopic": anything else (weather, homework, general chat, and help with an account at another company, like a password or a transfer they made)

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
  return refine(readUnderstood(raw), text)
}

/**
 * A suggestion that names a country we don't send to yet is a route request, which is what
 * decides the next routes. Settled by our own parser and route list rather than the
 * prompt: the model flips between the two ("please add Cuba"), and this can't.
 */
export function refine(u: Understood | null, text: string): Understood | null {
  if (u?.kind !== 'suggest') return u
  const { to } = findPlaces(normalize(text))
  return to && !routeFor('US', to) ? { kind: 'command', command: { kind: 'request', from: 'US', to } } : u
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
      // Small talk gets a reply in the model's own words (answer() with the basics), not the menu.
      return { kind: 'ask', question: words(o.question) ?? 'Hello! What can you do?', language }
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
  /** A link to send under it (the best note's), or null when the reply has one already or none fits. */
  link: string | null
}

const ANSWER_PROMPT = (lang: Language) => `You are RemitBridge's WhatsApp assistant. RemitBridge is a free nonprofit service that compares the cost of sending money from the US. Reply to the message warmly and briefly, like a helpful person, ${lang === 'hi' ? 'in simple Hindi (Devanagari)' : 'in English'}.

Use the notes below for anything about RemitBridge, its app, its links, prices, rates or words. A note marked "today" holds live figures from RemitBridge's database: quote them exactly when asked. For a general question about sending money abroad that the notes don't cover, give a short, general explanation in plain words. If the message isn't about sending money or RemitBridge, reply exactly: NO_ANSWER

Rules:
- At most three or four short sentences. No lists, no emoji.
- No numbers, prices, fees or rates unless they appear in the notes word for word.
- A link only if it appears in the notes, written out in full.
- Never tell someone what to do with their money; explain, don't advise.
- Never claim to send money, see their account, or contact a provider for them.
/no_think`

/**
 * Replies to a question or small talk in the model's words, from the basics plus the notes
 * that match. Null when it's off topic or the reply fails a check (the caller falls back).
 */
export async function answer(client: AiClient, question: string, lang: Language, live: Entry[] = []): Promise<Answer | null> {
  const matched = retrieve(question)
  // Live figures from our database (today's mid-market rate on a route) come first.
  const notes = [...live, ...CORE, ...matched]
  const raw = await client.chat(
    [
      { role: 'system', content: ANSWER_PROMPT(lang) },
      { role: 'user', content: `Notes:\n${notes.map((n) => `- ${n.title}: ${n.text} (${n.link})`).join('\n')}\n\nMessage: ${question}` },
    ],
    { maxTokens: 350 },
  )
  const text = raw.trim()
  if (!text || text.includes('NO_ANSWER')) return null
  if (!checkAnswer(text, notes)) return null
  // Point to the best-matching note unless the reply already carries a link.
  const link = /https?:\/\//.test(text) ? null : (matched[0]?.link ?? null)
  return { text, link }
}

const NUMBER = /\d[\d,.]*/g

/**
 * The model's reply may only use numbers that are in the notes it was given, may only link
 * to our own sites, and must fit on a phone screen.
 */
export function checkAnswer(text: string, notes: Entry[]): boolean {
  if (text.length > 700) return false
  const links = text.match(/https?:\/\/[^\s)]+/g) ?? []
  if (links.some((l) => !isOurLink(l.replace(/[.,;:]+$/, '')))) return false
  if (/\bwww\.(?!remitbridgelabs\.org)/i.test(text)) return false
  const noLinks = text.replace(/https?:\/\/[^\s)]+/g, '')
  const allowed = new Set(notes.flatMap((n) => `${n.title} ${n.text}`.replace(/https?:\/\/[^\s)]+/g, '').match(NUMBER) ?? []).map((n) => n.replace(/[,.]$/, '')))
  return (noLinks.match(NUMBER) ?? []).every((n) => allowed.has(n.replace(/[,.]$/, '')))
}
