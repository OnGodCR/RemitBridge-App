import { describe, expect, it } from 'vitest'
import { answer, checkAnswer, cloudflareClient, readUnderstood, stripThinking, understand, type AiClient } from './ai.ts'
import { retrieve } from './knowledge.ts'

/** A model that always says the same thing, and remembers what it was asked. */
function fake(reply: string): AiClient & { asked: string[] } {
  const asked: string[] = []
  return {
    asked,
    async chat(messages) {
      asked.push(messages.map((m) => m.content).join('\n'))
      return reply
    },
  }
}

describe('understanding a message', () => {
  it('turns a price question into the same command the parser makes', () => {
    expect(readUnderstood('{"intent":"prices","amount":300,"country":"IN","method":"upi","language":"en"}')).toEqual({
      kind: 'command',
      command: { kind: 'compare', amount: 300, from: 'US', to: 'IN', method: 'upi' },
    })
  })

  it('drops anything it can’t vouch for instead of trusting it', () => {
    const u = readUnderstood('{"intent":"prices","amount":-5,"country":"ZZ","method":"teleport"}')
    expect(u).toEqual({ kind: 'command', command: { kind: 'compare', amount: undefined, from: 'US', to: undefined, method: undefined } })
    expect(readUnderstood('not json')).toBeNull()
    expect(readUnderstood('{"intent":"make_coffee"}')).toBeNull()
    expect(readUnderstood('{"intent":"question","question":""}')).toBeNull()
  })

  it('reads questions, suggestions, scams, greetings and off-topic messages', () => {
    expect(readUnderstood('Sure! {"intent":"question","question":"What is a markup?","language":"hi"}')).toEqual({
      kind: 'ask',
      question: 'What is a markup?',
      language: 'hi',
    })
    expect(readUnderstood('{"intent":"suggestion","suggestion":"add Ria please"}')).toEqual({ kind: 'suggest', text: 'add Ria please', language: 'en' })
    expect(readUnderstood('{"intent":"scam"}')).toEqual({ kind: 'command', command: { kind: 'scam' } })
    expect(readUnderstood('{"intent":"greeting"}')).toEqual({ kind: 'command', command: { kind: 'help' } })
    expect(readUnderstood('{"intent":"offtopic","language":"en"}')).toEqual({ kind: 'offtopic', language: 'en' })
  })

  it('sends the message text and nothing else about the person', async () => {
    const model = fake('{"intent":"greeting"}')
    await understand(model, 'hi there')
    expect(model.asked[0]).toContain('hi there')
    expect(model.asked[0]).not.toMatch(/\+?\d{10,}/)
  })

  it('reads past Qwen’s thinking', () => {
    expect(stripThinking('<think>hmm</think>\n{"intent":"greeting"}')).toBe('{"intent":"greeting"}')
  })
})

describe('answering from our notes only', () => {
  it('finds the right notes for a question', () => {
    expect(retrieve('what is the mid-market rate').map((e) => e.id)).toContain('term:mid-market-rate')
    expect(retrieve('is this a scam')[0].id).toBe('scam-check')
    expect(retrieve('qwertyuiop')).toEqual([])
  })

  it('answers with the best note’s link', async () => {
    const a = await answer(fake('It is the midpoint between buying and selling rates, published daily.'), 'what is the mid-market rate', 'en')
    expect(a?.text).toContain('midpoint')
    expect(a?.link).toMatch(/^https:\/\/(www|app)\.remitbridgelabs\.org/)
  })

  it('gives up rather than guess when the notes don’t cover it', async () => {
    expect(await answer(fake('NO_ANSWER'), 'what is the mid-market rate', 'en')).toBeNull()
    expect(await answer(fake('anything'), 'qwertyuiop', 'en')).toBeNull()
  })

  it('refuses an answer with a number the notes don’t have, a link, or too many words', () => {
    const notes = retrieve('which countries do you cover')
    expect(checkAnswer('We cover 26 countries, including India and Kenya.', notes)).toBe(true)
    expect(checkAnswer('We cover 140 countries.', notes)).toBe(false)
    expect(checkAnswer('See https://example.com for more.', notes)).toBe(false)
    expect(checkAnswer('x'.repeat(601), notes)).toBe(false)
  })
})

describe('the Cloudflare client', () => {
  it('calls the OpenAI-compatible endpoint and returns the text without thinking', async () => {
    const calls: { url: string; body: Record<string, unknown> }[] = []
    const fetchFake = (async (url: string, init: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init.body)) })
      return new Response(JSON.stringify({ choices: [{ message: { content: '<think>x</think>{"intent":"greeting"}' } }] }))
    }) as unknown as typeof fetch
    const client = cloudflareClient('acct', 'tok', '@cf/qwen/qwen3-30b-a3b-fp8', fetchFake)
    expect(await client.chat([{ role: 'user', content: 'hi' }], { maxTokens: 50 })).toBe('{"intent":"greeting"}')
    expect(calls[0].url).toBe('https://api.cloudflare.com/client/v4/accounts/acct/ai/v1/chat/completions')
    expect(calls[0].body).toMatchObject({ model: '@cf/qwen/qwen3-30b-a3b-fp8', max_tokens: 50, temperature: 0 })
  })

  it('throws on an error status, so the bot falls back', async () => {
    const fetchFake = (async () => new Response('busy', { status: 429 })) as unknown as typeof fetch
    await expect(cloudflareClient('a', 't', undefined, fetchFake).chat([], { maxTokens: 1 })).rejects.toThrow('429')
  })
})
