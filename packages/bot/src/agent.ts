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
  /** Where the conversation happens: WhatsApp (the default) or Remmy in the app (D175). */
  channel?: 'whatsapp' | 'app'
  /** The conversation so far in the app, oldest first, so follow-ups make sense. */
  history?: { role: 'user' | 'assistant'; text: string }[]
}

/** How much of an app conversation goes back to the model: the last few turns, trimmed. */
const HISTORY_TURNS = 8
const HISTORY_CHARS = 600

export interface AgentResult {
  text: string
  /** The tools called, in order, for metrics. */
  tools: string[]
}

const MAX_STEPS = 5

function systemPrompt(tools: ToolSpec[], ctx: AgentContext): string {
  return ctx.channel === 'app' ? appPrompt(tools, ctx) : whatsappPrompt(tools, ctx)
}

/**
 * Remmy, the assistant inside the app (D175): the WhatsApp bot's rules, plus tools that act in
 * the app (open a screen, compare a route, start a lesson, save a comparison). The app shows
 * each action as a card the person can see and undo by going back.
 */
function appPrompt(tools: ToolSpec[], ctx: AgentContext): string {
  return `You are Remmy, the assistant inside the RemitBridge app. RemitBridge compares the real cost of sending money from the US, ranked only by how much the family receives. It never sends or holds money; no provider pays to be listed.

Write like a friendly person, not a chatbot: short sentences, contractions, plain words. One to five short lines. Answer in the first line. No openers like "Great question", no sign-offs, never mention being an AI. No emoji, no dashes between clauses. Reply in the person's language. **bold** the amount that arrives.

Tools:
${toolList(tools)}

Each turn, output one JSON object only: {"tool":"name","args":{...}} or {"reply":"text"}.

Rules:
- Every number must be copied exactly from a tool result or the notes. No figure? Call a tool or say you don't know.
- Keep providers in the order given. Never say "best"; the top one gives the family the most.
- Explain, never advise. You can't send money, see accounts or contact providers.
- Only money transfers abroad and RemitBridge; politely decline the rest.
- You can act in the app. When the person asks to go somewhere, see something, start something, or save something, call the matching action tool (open_compare, open_screen, start_lesson, save_comparison), then reply in one short line saying what's ready.
- Anything about the app itself ("change my language", "turn on emails", "where do I delete my account", "help"): pick the closest screen from open_screen's list and call it. Only if no screen fits, say plainly the app can't do that yet.
- now is true when they ask to be taken somewhere ("take me to", "open", "go to", "start"); otherwise false.
- Any price, cost, fee or rate question for a country: call open_compare (it returns the prices), then answer from them.
- "Teach me", "how do I spot", "learn about": call start_lesson on the matching module, then reply in one line. For a quick explanation, search_knowledge first and answer from our notes.
- Links only from tool results or the notes, in full.
- A country we don't cover: offer to count a request; request_route when they want it.
- An idea or request for the app: save_suggestion, then thank them.${ctx.lastCountry ? `\n- They last asked about ${ctx.lastCountry}.` : ''}

Notes:
${CORE.map((n) => `- ${n.text}`).join('\n')}`
}

function toolList(tools: ToolSpec[]): string {
  return tools.map((t) => `- ${t.name}(${Object.entries(t.args).map(([k, v]) => `${k}: ${v}`).join('; ')}): ${t.about}`).join('\n')
}

function whatsappPrompt(tools: ToolSpec[], ctx: AgentContext): string {
  return `You are RemitBridge's WhatsApp assistant. RemitBridge compares the real cost of sending money from the US, ranked only by how much the family receives. It never sends or holds money; no provider pays to be listed.

Write like a helpful person texting a friend, not a chatbot: short sentences, contractions, plain words. Two to six short lines. Answer in the first line; don't repeat the question back. No openers like "Great question" or "Sure!", no sign-offs like "Let me know if you have other questions" or "Hope this helps", never mention being an AI. Lists only for three or more providers. No emoji, no dashes between clauses. Reply in the person's language (Hindi or Hinglish gets simple Hindi). *bold* for the amount that arrives.

Tools:
${toolList(tools)}

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
  // A reply that was nothing but a stock phrase keeps its words rather than going out empty.
  if (!t.trim()) return reply.trim()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** Plain text that's the model planning ("We need to call open_compare") rather than answering. */
export function thinksAloud(text: string, tools: ToolSpec[]): boolean {
  return tools.some((t) => text.includes(t.name)) || /^(we|i) (need|should|must|will|have) to\b|^let'?s (call|use|check)\b|\bthe (user|person) (is asking|wants|asked)\b/i.test(text.trim())
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
  // A checked figure rounded ("MXN 5,457.84" as "5,458" or "5,457.8") is still that figure;
  // the model rounds pesos and dollars, and Mexico's replies were all thrown out for it.
  const allowed = new Set(
    sources.flatMap((s) => s.match(NUMBER) ?? []).flatMap((n) => {
      const exact = norm(n)
      const x = Number(exact)
      return exact.includes('.') && Number.isFinite(x) ? [exact, norm(x.toFixed(1)), String(Math.round(x))] : [exact]
    }),
  )
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
  const history = (ctx.history ?? []).slice(-HISTORY_TURNS).map((h) => ({ role: h.role, content: h.text.slice(0, HISTORY_CHARS) }))
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt(tools, ctx) },
    ...history,
    { role: 'user', content: message.slice(0, 1000) },
  ]
  // Numbers from earlier in the conversation came from tools or the person, so they may recur.
  const sources = [message, ...history.map((h) => h.content), ...CORE.map((n) => `${n.title} ${n.text}`)]
  const called: string[] = []
  let corrected = false
  let nudged = false

  for (let step = 0; step < MAX_STEPS; step++) {
    const raw = await client.chat(messages, { maxTokens: 700 })
    const turn = readTurn(raw)
    if (!turn) return null
    messages.push({ role: 'assistant', content: raw })

    // gpt-oss sometimes answers with its own plan in plain text ("We need to call
    // open_compare."). That's not a reply: ask once more for the JSON turn.
    if ('reply' in turn && !raw.includes('{') && thinksAloud(turn.reply, tools)) {
      if (nudged) return null
      nudged = true
      messages.push({ role: 'user', content: 'That was your plan, not a reply. Output one JSON object only: a tool call or {"reply":"..."}.' })
      continue
    }

    if ('tool' in turn) {
      const tool = byName.get(turn.tool)
      const result = tool ? await tool.run(turn.args).catch((e) => ({ error: String(e) })) : { error: `no tool called ${turn.tool}` }
      const text = JSON.stringify(result)
      sources.push(text)
      called.push(turn.tool)
      messages.push({ role: 'user', content: `Result of ${turn.tool}: ${text}` })
      continue
    }

    // WhatsApp bolds *one pair*; a model's **markdown** would show its outer asterisks there.
    const text = humanize(turn.reply.slice(0, 1500))
    const reply = ctx.channel === 'app' ? text : text.replace(/\*\*([^*\n]+)\*\*/g, '*$1*')
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
