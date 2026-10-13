import { describe, expect, it } from 'vitest'
import { humanize, readTurn, runAgent, strayLinks, strayNumbers, type ToolSpec } from './agent.ts'
import type { AiClient } from './ai.ts'

/** A model that says the scripted things in order, and remembers what it was sent. */
function scripted(...turns: string[]): AiClient & { seen: string[][] } {
  const seen: string[][] = []
  let i = 0
  return {
    seen,
    async chat(messages) {
      seen.push(messages.map((m) => m.content))
      return turns[Math.min(i++, turns.length - 1)]
    },
  }
}

const prices: ToolSpec = {
  name: 'get_prices',
  about: 'Checked prices.',
  args: { country: 'country', amount: 'US dollars' },
  run: async () => ({ country: 'India', providers: [{ provider: 'Instarem', receives: '₹48,041', total_cost: '0.6%' }], checked: '3 hours ago' }),
}

describe('the agent', () => {
  it('calls a tool, then answers in its own words with the tool’s numbers', async () => {
    const model = scripted(
      '{"tool":"get_prices","args":{"country":"India","amount":500}}',
      '{"reply":"For $500 to India, Instarem gets *₹48,041* to your family, a 0.6% total cost. Checked 3 hours ago."}',
    )
    const r = await runAgent(model, [prices], 'how much will my mom get if i send 500 to india', { language: 'en', lastCountry: null })
    expect(r).toEqual({ text: expect.stringContaining('₹48,041'), tools: ['get_prices'] })
    expect(model.seen[1].at(-1)).toContain('Result of get_prices')
  })

  it('sends back a reply with an invented number once, then gives up', async () => {
    const invented = '{"reply":"Instarem gets ₹49,000 to your family."}'
    const fixed = await runAgent(scripted('{"tool":"get_prices","args":{}}', invented, '{"reply":"Instarem gets *₹48,041*."}'), [prices], 'india', {
      language: 'en',
      lastCountry: null,
    })
    expect(fixed?.text).toBe('Instarem gets *₹48,041*.')
    expect(await runAgent(scripted('{"tool":"get_prices","args":{}}', invented, invented), [prices], 'india', { language: 'en', lastCountry: null })).toBeNull()
  })

  it('answers without tools when it needs none, and refuses links that aren’t ours', async () => {
    expect(await runAgent(scripted('{"reply":"Hi! Ask me what it costs to send money from the US."}'), [prices], 'hello', { language: 'en', lastCountry: null })).toEqual({
      text: 'Hi! Ask me what it costs to send money from the US.',
      tools: [],
    })
    const outside = '{"reply":"See https://example.com"}'
    expect(await runAgent(scripted(outside, outside), [prices], 'hello', { language: 'en', lastCountry: null })).toBeNull()
  })

  it('bolds the WhatsApp way, and leaves the app’s markdown alone', async () => {
    const turn = '{"reply":"**₹48,041** via Instarem"}'
    expect((await runAgent(scripted(turn), [], 'is it 48,041 in india', { language: 'en', lastCountry: null }))?.text).toBe('*₹48,041* via Instarem')
    expect((await runAgent(scripted(turn), [], 'is it 48,041 in india', { language: 'en', lastCountry: null, channel: 'app' }))?.text).toBe('**₹48,041** via Instarem')
  })

  it('reports a missing tool to the model instead of failing', async () => {
    const model = scripted('{"tool":"teleport","args":{}}', '{"reply":"I can’t do that."}')
    expect((await runAgent(model, [prices], 'x', { language: 'en', lastCountry: null }))?.text).toBe('I can’t do that.')
    expect(model.seen[1].at(-1)).toContain('no tool called teleport')
  })
})

describe('its checks', () => {
  it('reads one JSON turn, or plain text as a reply', () => {
    expect(readTurn('{"tool":"get_prices","args":{"country":"IN"}}')).toEqual({ tool: 'get_prices', args: { country: 'IN' } })
    expect(readTurn('Sure.\n{"reply":"Hi"}')).toEqual({ reply: 'Hi' })
    expect(readTurn('Just text')).toEqual({ reply: 'Just text' })
    expect(readTurn('{oops')).toBeNull()
  })

  it('accepts numbers as the sources wrote them, list markers, and the person’s own numbers', () => {
    expect(strayNumbers('1. Instarem: ₹48,041\n2. Wise: ₹47,481.00', ['₹48,041', '47481'])).toEqual([])
    expect(strayNumbers('You asked about 750.', ['send 750 to vietnam'])).toEqual([])
    expect(strayNumbers('About ₹50,000 arrives.', ['₹48,041'])).toEqual(['50,000'])
  })

  it('accepts only our links', () => {
    expect(strayLinks('More: https://app.remitbridgelabs.org/privacy.')).toEqual([])
    expect(strayLinks('Try https://wise.com')).toEqual(['https://wise.com'])
  })
})

describe('sounding like a person', () => {
  it('drops stock openers and sign-offs, and turns dashes into commas', () => {
    expect(humanize('Great question! Instarem gets the most to India today. Hope this helps!')).toBe('Instarem gets the most to India today.')
    expect(humanize('Sure! The fee is $0.00 — the cost is in the rate. Let me know if you have any other questions.')).toBe('The fee is $0.00, the cost is in the rate.')
    expect(humanize('Wise is cheaper here. Is there anything else I can help with?')).toBe('Wise is cheaper here.')
  })

  it('never empties a reply that was only a stock phrase', () => {
    expect(humanize('Sure!')).toBe('Sure!')
  })

  it('leaves an ordinary reply alone', () => {
    const r = 'Instarem gets *₹48,041* to your family, a 0.6% total cost.'
    expect(humanize(r)).toBe(r)
  })
})
