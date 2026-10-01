import { describe, expect, it } from 'vitest'
import { answerSchema, askModel, buildRequest, DEFAULT_MODEL, ModelError, numberedText, GROQ_URL, groqClient, readAnswer, replyJson, SYSTEM_PROMPT } from './model.ts'
import { pageFromLines } from './ocr.ts'
import { answer, fakeModel } from './test/fake-model.ts'

const TODAY = '2026-09-30'
const page = pageFromLines(['WESTERN UNION', 'Sender: [hidden] [hidden]', 'Transfer Amount $500.00', 'Exchange Rate 17.2000'])

describe('the schema', () => {
  const schema = answerSchema(['amount_sent', 'transfer_date', 'funding_method']) as {
    required: string[]
    additionalProperties: boolean
    properties: Record<string, { required: string[]; additionalProperties: boolean; properties: { value: { anyOf: unknown[] } } }>
  }
  it('asks for exactly the requested fields, with nothing extra allowed', () => {
    expect(schema.required).toEqual(['amount_sent', 'transfer_date', 'funding_method'])
    expect(schema.additionalProperties).toBe(false)
    for (const p of Object.values(schema.properties)) {
      expect(p.additionalProperties).toBe(false)
      expect(p.required).toEqual(['value', 'confidence', 'line'])
    }
  })
  it('types each value, and lets any of them be null', () => {
    expect(schema.properties.amount_sent.properties.value.anyOf).toEqual([{ type: 'number' }, { type: 'null' }])
    expect(schema.properties.transfer_date.properties.value.anyOf[0]).toEqual({ type: 'string', description: 'YYYY-MM-DD' })
    expect(schema.properties.funding_method.properties.value.anyOf[0]).toEqual({
      type: 'string',
      enum: ['bank_account', 'debit_card', 'credit_card', 'cash', 'money_order', 'cashiers_check'],
    })
  })
})

describe('the request', () => {
  it('sends the redacted photo first, then the numbered text, with a strict schema', () => {
    const req = buildRequest({ fields: ['fee'], page, image: { mediaType: 'image/jpeg', base64: 'AAAA' }, today: TODAY })
    expect(req.model).toBe(DEFAULT_MODEL)
    expect(req.messages[0]).toEqual({ role: 'system', content: SYSTEM_PROMPT })
    expect(req.response_format.type).toBe('json_schema')
    expect(req.response_format.json_schema.strict).toBe(true)
    expect(req.response_format.json_schema.schema).toEqual(answerSchema(['fee']))
    expect(req.temperature).toBe(0)
    const content = req.messages[1].content
    expect(content[0]).toEqual({ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,AAAA' } })
    expect(content[1]).toMatchObject({ type: 'text' })
    const text = (content[1] as { text: string }).text
    expect(text).toContain('Read these fields: fee.')
    expect(text).toContain('[1] Sender: [hidden] [hidden]')
  })

  it('turns Qwen’s thinking off and asks for the answer alone', () => {
    const req = buildRequest({ fields: ['fee'], page, today: TODAY })
    expect(req.model).toBe('qwen/qwen3.8-27b')
    expect(req.reasoning_effort).toBe('none')
    expect(req.reasoning_format).toBe('hidden')
    expect(req.max_tokens).toBeLessThanOrEqual(1500)
  })

  it('sends text alone when the photo may not go, to the model asked for', () => {
    const req = buildRequest({ fields: ['fee'], page, today: TODAY, model: 'qwen/a' })
    expect(req.messages[1].content).toHaveLength(1)
    expect(req.model).toBe('qwen/a')
  })

  it('keeps the system prompt free of anything per request, so it caches', () => {
    expect(SYSTEM_PROMPT).not.toMatch(/\d{4}-\d{2}-\d{2}/)
    expect(numberedText(page).split('\n')[0]).toBe('[0] WESTERN UNION')
  })
})

describe('the Groq client', () => {
  it('posts the request with the key, and returns the reply', async () => {
    const calls: { url: string; init: RequestInit }[] = []
    const fetchImpl = (async (url: string, init: RequestInit) => {
      calls.push({ url, init })
      return new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: '{}' } }] }), { status: 200 })
    }) as unknown as typeof fetch
    const req = buildRequest({ fields: ['fee'], page, today: TODAY })
    const reply = await groqClient('gsk-test', fetchImpl).complete(req)
    expect(reply.choices?.[0].message?.content).toBe('{}')
    expect(calls[0].url).toBe(GROQ_URL)
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer gsk-test')
    expect(JSON.parse(String(calls[0].init.body))).toEqual(req)
  })

  it('throws on a non-2xx reply, naming only the status', async () => {
    const fetchImpl = (async () => new Response('{"error":{"message":"Rate limit reached"}}', { status: 429 })) as unknown as typeof fetch
    await expect(groqClient('k', fetchImpl).complete(buildRequest({ fields: ['fee'], page, today: TODAY }))).rejects.toThrow(
      'groq: HTTP 429',
    )
  })
})

describe('reading the answer', () => {
  it('checks every value and keeps the line it came from', () => {
    const got = readAnswer(
      JSON.parse(answer({ amount_sent: [500, 0.95, 2], exchange_rate: [17.2, 0.9, 3], fee: [null, 0] })),
      ['amount_sent', 'exchange_rate', 'fee'],
      page,
      TODAY,
    )
    expect(got.fields).toEqual({
      amount_sent: { value: 500, confidence: 0.95, source: { line: 2 } },
      exchange_rate: { value: 17.2, confidence: 0.9, source: { line: 3 } },
    })
    expect(got.problems).toEqual([])
  })

  it('drops values that fail the checks, and says why', () => {
    const got = readAnswer(
      JSON.parse(answer({ amount_sent: [-5], transfer_date: ['2027-01-01'], send_currency: ['usd', 2], exchange_rate: [17.2, 0.9, 99] })),
      ['amount_sent', 'transfer_date', 'send_currency', 'exchange_rate', 'fee'],
      page,
      TODAY,
    )
    expect(got.fields).toEqual({ exchange_rate: { value: 17.2, confidence: 0.9 } })
    expect(got.problems.map((p) => p.field)).toEqual(['amount_sent', 'transfer_date', 'send_currency', 'fee'])
  })

  it('treats a non-object as no answer at all', () => {
    expect(readAnswer('nope', ['fee'], page, TODAY).problems).toEqual([{ field: 'fee', message: 'no answer' }])
  })
})

describe('askModel', () => {
  it('returns checked fields from a good answer', async () => {
    const { client, requests } = fakeModel([{ text: answer({ fee: [4.99, 0.9, null] }) }])
    const got = await askModel(client, { fields: ['fee'], page, today: TODAY })
    expect(got.fields.fee?.value).toBe(4.99)
    expect(requests).toHaveLength(1)
  })

  it('makes no call when nothing is asked', async () => {
    const { client, requests } = fakeModel([])
    expect(await askModel(client, { fields: [], page, today: TODAY })).toEqual({ fields: {}, problems: [] })
    expect(requests).toHaveLength(0)
  })

  it('reads an answer wrapped in a code fence', async () => {
    const { client } = fakeModel([{ text: '```json\n' + answer({ fee: [4.99] }) + '\n```' }])
    expect((await askModel(client, { fields: ['fee'], page, today: TODAY })).fields.fee?.value).toBe(4.99)
    expect(() => replyJson('fee: 4.99')).toThrow()
  })

  it.each([
    [{ text: '', refusal: 'I cannot help with that' }, 'refusal'],
    [{ finish_reason: 'content_filter', text: '' }, 'refusal'],
    [{ finish_reason: 'length', text: '{"fee":' }, 'truncated'],
    [{ finish_reason: 'error', text: '' }, 'failed'],
    [{ error: 'upstream error' }, 'failed'],
    [{ text: 'Here you go: fee is 4.99' }, 'unreadable'],
  ])('fails plainly on %o', async (reply, reason) => {
    const { client } = fakeModel([reply])
    await expect(askModel(client, { fields: ['fee'], page, today: TODAY })).rejects.toMatchObject({ reason })
    await expect(Promise.reject(new ModelError('x', 'refusal'))).rejects.toBeInstanceOf(ModelError)
  })
})
