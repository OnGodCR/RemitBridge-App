import { describe, expect, it } from 'vitest'
import type { Extractors } from './extract/index.ts'
import { pageFromLines } from './ocr.ts'
import { doubtedFields, readReceipt } from './pipeline.ts'
import { answer, fakeModel } from './test/fake-model.ts'
import { FIELD_NAMES } from './types.ts'

const TODAY = '2026-09-30'
const page = pageFromLines(['WESTERN UNION', 'Transfer Amount $500.00', 'Exchange Rate 17.2000 MXN', 'Total to Recipient 8,600.00 MXN'])
const none = Object.fromEntries(FIELD_NAMES.map((f) => [f, () => null])) as unknown as Extractors
const rules: Extractors = {
  ...none,
  provider: () => ({ value: 'Western Union', confidence: 0.95, source: { line: 0 } }),
  amount_sent: () => ({ value: 500, confidence: 0.95, source: { line: 1, words: [2, 3] } }),
  exchange_rate: () => ({ value: 17.2, confidence: 0.6 }),
}

describe('readReceipt', () => {
  it('with the rules alone, reads what they read and asks the person for the rest', async () => {
    const r = await readReceipt({ page, today: TODAY, model: null, extractors: rules })
    expect(r.askedModel).toEqual([])
    expect(r.fields.amount_sent).toMatchObject({ value: 500, path: 'parser' })
    expect(r.providerId).toBe('western-union')
    expect(r.validation.missing).toContain('amount_received')
  })

  it('asks the model only for what the rules missed or were unsure of, and merges', async () => {
    const { client, requests } = fakeModel([
      {
        text: answer({
          send_currency: ['USD'],
          receive_currency: ['MXN'],
          fee: [0, 0.9],
          tax: [null, 0],
          total_paid: [null, 0],
          exchange_rate: [17.2, 0.95, 2],
          amount_received: [8600, 0.95, 3],
          pickup_charge: [null, 0],
          transfer_date: ['2026-09-28'],
          funding_method: ['bank_account'],
          delivery_method: [null, 0],
        }),
      },
    ])
    const seenMid: unknown[] = []
    const r = await readReceipt({
      page,
      today: TODAY,
      model: { client },
      extractors: rules,
      midRate: async (...args) => {
        seenMid.push(args)
        return 17.7
      },
    })
    expect(r.askedModel).not.toContain('amount_sent')
    expect(r.askedModel).toContain('exchange_rate')
    expect(requests).toHaveLength(1)
    expect(r.fields.exchange_rate).toMatchObject({ path: 'parser', validated: true })
    expect(r.fields.amount_received).toMatchObject({ value: 8600, path: 'model', validated: true })
    expect(seenMid).toEqual([['USD', 'MXN', '2026-09-28']])
    expect(r.validation.checks.find((c) => c.id === 'received')?.ok).toBe(true)
    expect(r.validation.toConfirm).toEqual([])
  })

  it('carries on without the model when it fails', async () => {
    const { client } = fakeModel([{ refusal: 'no', text: '' }])
    const r = await readReceipt({ page, today: TODAY, model: { client }, extractors: rules })
    expect(r.modelError).toBe('refusal')
    expect(r.fields.amount_sent?.value).toBe(500)
  })

  it('reports an outage without the details', async () => {
    const { client } = fakeModel([new Error('529 overloaded')])
    expect((await readReceipt({ page, today: TODAY, model: { client }, extractors: rules })).modelError).toBe('unavailable')
  })

  it('in model-only mode, asks the model for every field and ignores the rules', async () => {
    const { client, requests } = fakeModel([{ text: answer({}) }])
    const r = await readReceipt({ page, today: TODAY, model: { client }, extractors: rules, mode: 'model' })
    expect(r.askedModel).toEqual([...FIELD_NAMES])
    expect(requests).toHaveLength(1)
    expect(r.fields.amount_sent).toBeUndefined()
    expect(r.problems.every((p) => p.from === 'model')).toBe(true)
  })

  it('drops a pickup charge that is only the fee read twice, and keeps a real one', async () => {
    // Angad's WhatsApp test (2026-10-12): "SERVICE FEE $9.99" and "Cash Pickup", read by the
    // model as a 9.99 MXN pickup charge on top of the fee.
    const cash = pageFromLines(['GLOBAL MONEY TRANSFER', 'TRANSFER AMOUNT $500.00', 'SERVICE FEE $9.99', 'PAYOUT METHOD: Cash Pickup'])
    const { client } = fakeModel([{ text: answer({ fee: [9.99, 0.9], pickup_charge: [9.99, 0.9] }) }])
    const r = await readReceipt({ page: cash, today: TODAY, model: { client }, extractors: rules })
    expect(r.fields.pickup_charge).toBeUndefined()

    const fee = pageFromLines(['GLOBAL MONEY TRANSFER', 'TRANSFER AMOUNT $500.00', 'Pickup Fee 40.00 MXN'])
    const second = fakeModel([{ text: answer({ pickup_charge: [40, 0.9] }) }])
    const kept = await readReceipt({ page: fee, today: TODAY, model: { client: second.client }, extractors: rules })
    expect(kept.fields.pickup_charge?.value).toBe(40)
  })

  it('sends values that are read confidently but don\'t add up back to the model (D174)', async () => {
    // The rules are sure of every number, but 500 x 17.2 isn't 9,000: something is misread.
    const sure: Extractors = {
      ...none,
      provider: () => ({ value: 'Western Union', confidence: 0.95 }),
      send_currency: () => ({ value: 'USD', confidence: 0.95 }),
      receive_currency: () => ({ value: 'MXN', confidence: 0.95 }),
      amount_sent: () => ({ value: 500, confidence: 0.95 }),
      exchange_rate: () => ({ value: 17.2, confidence: 0.95 }),
      amount_received: () => ({ value: 9000, confidence: 0.95 }),
    }
    const { client } = fakeModel([{ text: answer({ amount_received: [8600, 0.95, 3] }) }])
    const r = await readReceipt({ page, today: TODAY, model: { client }, extractors: sure })
    expect(r.askedModel).toEqual(expect.arrayContaining(['amount_sent', 'exchange_rate', 'amount_received']))
    expect(r.fields.amount_received?.value).toBe(8600)
    expect(r.validation.checks.find((c) => c.id === 'received')?.ok).toBe(true)
  })

  it('doubts nothing when the numbers add up', () => {
    expect(
      doubtedFields({
        amount_sent: { value: 500, confidence: 0.95 },
        exchange_rate: { value: 17.2, confidence: 0.95 },
        amount_received: { value: 8600, confidence: 0.95 },
      }),
    ).toEqual([])
  })
})
