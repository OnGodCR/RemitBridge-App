import { describe, expect, it } from 'vitest'
import { answerSchema, askModel, buildRequest, DEFAULT_MODEL, ModelError, numberedText, readAnswer, SYSTEM_PROMPT } from './model.ts'
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
    expect(schema.properties.transfer_date.properties.value.anyOf[0]).toEqual({ type: 'string', format: 'date' })
    expect(schema.properties.funding_method.properties.value.anyOf[0]).toEqual({
      type: 'string',
      enum: ['bank_account', 'debit_card', 'credit_card', 'cash', 'money_order', 'cashiers_check'],
    })
  })
})

describe('the request', () => {
  it('sends the redacted photo first, then the numbered text, with a strict schema and low effort', () => {
    const req = buildRequest({ fields: ['fee'], page, image: { mediaType: 'image/jpeg', base64: 'AAAA' }, today: TODAY })
    expect(req.model).toBe(DEFAULT_MODEL)
    expect(req.system).toBe(SYSTEM_PROMPT)
    expect(req.output_config?.effort).toBe('low')
    expect(req.output_config?.format?.type).toBe('json_schema')
    expect(req.betas).toEqual(['server-side-fallback-2026-07-01'])
    expect(req.fallbacks).toBe('default')
    const content = req.messages[0].content as { type: string; text?: string; source?: unknown }[]
    expect(content[0]).toEqual({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: 'AAAA' } })
    expect(content[1].text).toContain('Read these fields: fee.')
    expect(content[1].text).toContain('[1] Sender: [hidden] [hidden]')
  })

  it('sends text alone when the photo may not go', () => {
    const req = buildRequest({ fields: ['fee'], page, today: TODAY, model: 'claude-sonnet-5-5' })
    expect((req.messages[0].content as unknown[]).length).toBe(1)
    expect(req.model).toBe('claude-sonnet-5-5')
  })

  it('keeps the system prompt free of anything per request, so it caches', () => {
    expect(SYSTEM_PROMPT).not.toMatch(/\d{4}-\d{2}-\d{2}/)
    expect(numberedText(page).split('\n')[0]).toBe('[0] WESTERN UNION')
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

  it.each([
    [{ stop_reason: 'refusal', text: '' }, 'refusal'],
    [{ stop_reason: 'max_tokens', text: '{"fee":' }, 'truncated'],
    [{ text: 'Here you go: fee is 4.99' }, 'unreadable'],
  ])('fails plainly on %o', async (reply, reason) => {
    const { client } = fakeModel([reply])
    await expect(askModel(client, { fields: ['fee'], page, today: TODAY })).rejects.toMatchObject({ reason })
    await expect(Promise.reject(new ModelError('x', 'refusal'))).rejects.toBeInstanceOf(ModelError)
  })
})
