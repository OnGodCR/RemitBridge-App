/**
 * The WhatsApp bot as an agent (D160). Angad, 2026-10-12: "we dont need a parser ... it
 * should just reply with our data while answering questions in a natural way ... if the ai
 * model thinks 'i need to find the $ fee in a transaction' ... it should just be able to call
 * our backend and get that. but everything else should just be the ai making its own
 * decisions and responding with its own natural text".
 *
 * The model reads the message, calls our backend through tools when it needs data or an
 * action (prices, today's mid-market rate, our routes, our own notes, a route request, a
 * suggestion), and writes the reply in its own words. Tools are called through a small JSON
 * protocol of our own, so this works with any chat model and is easy to test.
 *
 * One rule stays from the product (CLAUDE.md, "never publish a number we can't verify"):
 * every number in the reply must appear in a tool result, our basic notes, or the person's
 * own message. A reply that breaks it is sent back to the model once with the stray numbers
 * named; if it breaks it again, the caller falls back to the plain bot. Links must be ours.
 */
import { CORE, isOurLink } from './knowledge.ts'
import type { AiClient, ChatMessage } from './ai.ts'
import type { Language } from './parse.ts'

export interface ToolSpec {
  name: string
  /** What it does and when to use it, for the model. */
  about: string
  /** Its arguments, described for the model, e.g. { country: 'country name or 2-letter code' }. */
  args: Record<string, string>
  run: (args: Record<string, unknown>) => Promise<unknown>
}

export interface AgentContext {
  /** The language the chat last used. The model replies in whatever the person writes. */
  language: Language
  /** The route asked about last, so "what about 1000?" works. */
  lastCountry: string | null
}

export interface AgentResult {
  text: string
  /** The tools called, in order, for metrics. */
  tools: string[]
}

const MAX_STEPS = 5

function systemPrompt(tools: ToolSpec[], ctx: AgentContext): string {
  return `You are RemitBridge's WhatsApp assistant. RemitBridge compares the real cost of sending money from the US, ranked only by how much the family receives. It never sends or holds money; no provider pays to be listed.

Write like a helpful person texting a friend, not a chatbot: short sentences, contractions, plain words. Two to six short lines. Answer in the first line; don't repeat the question back. No openers like "Great question" or "Sure!", no sign-offs like "Let me know if you have other questions" or "Hope this helps", never mention being an AI. Lists only for three or more providers. No emoji, no dashes between clauses. Reply in the person's language (Hindi or Hinglish gets simple Hindi). *bold* for the amount that arrives.

Tools:
${tools.map((t) => `- ${t.name}(${Object.entries(t.args).map(([k, v]) => `${k}: ${v}`).join('; ')}): ${t.about}`).join('\n')}

Each turn, output one JSON object only: {"tool":"name","args":{...}} or {"reply":"text"}.

Rules:
- Every number must be copied exactly from a tool result or the notes. No figure? Call a tool or say you don't know.
- Keep providers in the order given. Never say "best"; the top one gives the family the most.
- Explain, never advise. You can't send money, see accounts or contact providers.
- Only money transfers abroad and RemitBridge; politely decline the rest.
- Links only from tool results or the notes, in full.
- A country we don't cover: offer to count a request; request_route when they want it.
- An idea or request for the app: save_suggestion, then thank them.${ctx.lastCountry ? `\n- They last asked about ${ctx.lastCountry}.` : ''}

Notes:
${CORE.map((n) => `- ${n.text}`).join('\n')}`
}

const OPENER = /^(great|good|excellent) question[.!,]?\s*|^(sure|certainly|absolutely|of course|happy to help)[.!,]\s*/i
const CLOSER = /\s*(let me know if[^.!?]*[.!?]|hope (this|that) helps[^.!?]*[.!?]|feel free to (ask|reach out)[^.!?]*[.!?]|is there anything else[^.!?]*\?)\s*$/i

/**
 * Takes the chatbot tells out of a reply the model wrote (Angad, 2026-10-12: "make it sound
 * less AI"): a stock opener or sign-off, and em or en dashes between clauses, which become
 * commas. The prompt asks for the same; this catches what slips through.
 */
export function humanize(reply: string): string {
  let t = reply.trim().replace(OPENER, '')
  for (let i = 0; i < 2; i++) t = t.replace(CLOSER, '')
  t = t.replace(/\s+[—–]\s+/g, ', ').replace(/—/g, ', ')
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** The JSON object in a model turn, or null. */
export function readTurn(raw: string): { tool: string; args: Record<string, unknown> } | { reply: string } | null {
  const json = raw.match(/\{[\s\S]*\}/)?.[0]
  if (!json) return raw.trim() && !raw.includes('{') ? { reply: raw.trim() } : null
  try {
    const o = JSON.parse(json) as Record<string, unknown>
    if (typeof o.reply === 'string' && o.reply.trim()) return { reply: o.reply.trim() }
    if (typeof o.tool === 'string') return { tool: o.tool, args: (o.args && typeof o.args === 'object' ? o.args : {}) as Record<string, unknown> }
  } catch {
    return null
  }
  return null
}

const NUMBER = /\d[\d,]*(?:\.\d+)?/g
/** "47,481.00" and "47481" are the same number. */
const norm = (n: string) => n.replace(/,/g, '').replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')

/** The numbers in a reply that no source backs, after list markers ("1. ", "2) ") are set aside. */
export function strayNumbers(reply: string, sources: string[]): string[] {
  const allowed = new Set(sources.flatMap((s) => s.match(NUMBER) ?? []).map(norm))
  const body = reply
    .replace(/https?:\/\/\S+/g, '')
    .replace(/^\s*\d{1,2}[.)]\s/gm, '')
  return (body.match(NUMBER) ?? []).filter((n) => !allowed.has(norm(n)))
}

/** Links in a reply that aren't ours. */
export function strayLinks(reply: string): string[] {
  return (reply.match(/https?:\/\/[^\s)*]+/g) ?? []).map((l) => l.replace(/[.,;:]+$/, '')).filter((l) => !isOurLink(l))
}

/**
 * Runs the conversation turn: tools as the model asks for them, then its reply, checked.
 * Null when it can't produce a reply that passes the checks (the caller falls back).
 */
export async function runAgent(client: AiClient, tools: ToolSpec[], message: string, ctx: AgentContext): Promise<AgentResult | null> {
  const byName = new Map(tools.map((t) => [t.name, t]))
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt(tools, ctx) },
    { role: 'user', content: message.slice(0, 1000) },
  ]
  const sources = [message, ...CORE.map((n) => `${n.title} ${n.text}`)]
  const called: string[] = []
  let corrected = false

  for (let step = 0; step < MAX_STEPS; step++) {
    const raw = await client.chat(messages, { maxTokens: 700 })
    const turn = readTurn(raw)
    if (!turn) return null
    messages.push({ role: 'assistant', content: raw })

    if ('tool' in turn) {
      const tool = byName.get(turn.tool)
      const result = tool ? await tool.run(turn.args).catch((e) => ({ error: String(e) })) : { error: `no tool called ${turn.tool}` }
      const text = JSON.stringify(result)
      sources.push(text)
      called.push(turn.tool)
      messages.push({ role: 'user', content: `Result of ${turn.tool}: ${text}` })
      continue
    }

    const reply = humanize(turn.reply.slice(0, 1500))
    const numbers = strayNumbers(reply, sources)
    const links = strayLinks(reply)
    if (!numbers.length && !links.length) return { text: reply, tools: called }
    if (corrected) return null
    corrected = true
    messages.push({
      role: 'user',
      content: `Your reply can't be sent: ${numbers.length ? `the numbers ${numbers.join(', ')} aren't in any tool result or note` : ''}${numbers.length && links.length ? ', and ' : ''}${links.length ? `the links ${links.join(', ')} aren't ours` : ''}. Call a tool if you need a figure, or rewrite without it. Reply with one JSON object.`,
    })
  }
  return null
}
