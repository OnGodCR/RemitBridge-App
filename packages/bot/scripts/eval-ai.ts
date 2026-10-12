/**
 * Scores candidate models for the WhatsApp bot (docs/whatsapp-ai-scope.md, D159) on the
 * labelled messages in eval/messages.json:
 *   - intent: did it sort the message right (prices, question, suggestion, ...)?
 *   - country and amount, where the message has them;
 *   - questions: did it answer from our notes, and did every answer pass the checks;
 *   - time per call.
 *
 *   CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_AI_TOKEN=... node packages/bot/scripts/eval-ai.ts [model ...]
 *
 * The token comes from the environment only (a GitHub Actions secret in CI), never a file.
 * Runs on Cloudflare's free daily allowance: about 6,000 of its 10,000 neurons for two models.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { answer, cloudflareClient, understand, type AiClient, type Understood } from '../src/ai.ts'

interface Labelled {
  id: number
  text: string
  intent: string
  country?: string
  amount?: number
}

const messages: Labelled[] = JSON.parse(readFileSync(new URL('../eval/messages.json', import.meta.url), 'utf8'))
const account = process.env.CLOUDFLARE_ACCOUNT_ID
const token = process.env.CLOUDFLARE_AI_TOKEN
if (!account || !token) {
  console.error('Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_TOKEN in the environment.')
  process.exit(1)
}
const models = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['@cf/qwen/qwen3-30b-a3b-fp8', '@cf/google/gemma-4-26b-a4b-it']

function intentOf(u: Understood | null): string {
  if (!u) return 'none'
  if (u.kind === 'command') {
    return { compare: 'prices', request: 'request_route', scam: 'scam', help: 'greeting' }[u.command.kind as string] ?? u.command.kind
  }
  return { ask: 'question', suggest: 'suggestion', offtopic: 'offtopic' }[u.kind]
}

/** Times one call, and turns a thrown error into a result. */
async function timed<T>(fn: () => Promise<T>): Promise<{ value: T | null; ms: number; error: string | null }> {
  const start = Date.now()
  try {
    return { value: await fn(), ms: Date.now() - start, error: null }
  } catch (e) {
    return { value: null, ms: Date.now() - start, error: String(e) }
  }
}

const pct = (a: number, b: number) => (b ? `${((a / b) * 100).toFixed(1)}%` : '–')
const median = (xs: number[]) => (xs.length ? [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] : 0)

const report: string[] = ['# WhatsApp bot model test', '', `Run ${new Date().toISOString().slice(0, 16)}Z on ${messages.length} labelled messages.`, '']
report.push('| Model | Intent right | Country right | Amount right | Questions answered | Errors | Median time |', '|---|---:|---:|---:|---:|---:|---:|')
const misses: string[] = []

for (const model of models) {
  const client: AiClient = cloudflareClient(account, token, model, fetch, 20_000)
  let right = 0, countryRight = 0, countryAsked = 0, amountRight = 0, amountAsked = 0
  let questions = 0, answered = 0, errors = 0
  const times: number[] = []
  for (const m of messages) {
    const u = await timed(() => understand(client, m.text))
    if (u.error) errors++
    else times.push(u.ms)
    const got = intentOf(u.value)
    if (got === m.intent) right++
    else misses.push(`${model} #${m.id} "${m.text}": expected ${m.intent}, got ${got}${u.error ? ` (${u.error})` : ''}`)
    const command = u.value?.kind === 'command' ? (u.value.command as { to?: string; amount?: number }) : null
    if (m.country) {
      countryAsked++
      if (command?.to === m.country) countryRight++
    }
    if (m.amount) {
      amountAsked++
      if (command?.amount === m.amount) amountRight++
    }
    if (m.intent === 'question') {
      questions++
      const q = u.value?.kind === 'ask' ? u.value.question : m.text
      // Null when the notes don't cover it, or the model's text failed a check: either way
      // the person gets the plain reply, never an unchecked one.
      const a = await timed(() => answer(client, q, 'en'))
      if (a.value) answered++
      else misses.push(`${model} #${m.id} "${m.text}": question not answered${a.error ? ` (${a.error})` : ''}`)
      if (a.error) errors++
    }
  }
  report.push(
    `| \`${model}\` | ${pct(right, messages.length)} | ${pct(countryRight, countryAsked)} | ${pct(amountRight, amountAsked)} | ${answered} of ${questions} | ${errors} | ${(median(times) / 1000).toFixed(1)} s |`,
  )
}

report.push('', 'Pass bar (scope): at least 95% intent right, no invented numbers (enforced by the checks), under 4 s.', '', '## Misses', '', ...misses.map((m) => `- ${m}`))
const out = report.join('\n')
writeFileSync(process.env.EVAL_OUT ?? 'eval-results.md', out)
console.log(out)
