import { describe, expect, it } from 'vitest'
import { formatResults, showsWord, summarize, type ReceiptRun } from './benchmark.ts'
import { scoreFields } from './harness.ts'

const run = (over: Partial<ReceiptRun>): ReceiptRun => ({
  id: 'r',
  scores: [],
  paths: {},
  toConfirm: [],
  askedModel: [],
  modelError: null,
  ms: 10,
  ...over,
})

const combined = summarize('combined', [
  run({
    id: 'a',
    // fee read wrong, and flagged; amount_sent right; tax missing.
    scores: scoreFields({ amount_sent: 500, fee: 4.99, tax: 5 }, { amount_sent: 500, fee: 9.99 }),
    paths: { amount_sent: 'parser', fee: 'model' },
    toConfirm: ['fee', 'tax'],
    askedModel: ['fee', 'tax'],
    ms: 30,
  }),
  run({
    id: 'b',
    // exchange_rate read wrong and not flagged; provider an extra value.
    scores: scoreFields({ exchange_rate: 17.2 }, { exchange_rate: 71.2, provider: 'Ria' }),
    paths: { exchange_rate: 'parser', provider: 'parser' },
    modelError: 'over_cap',
    askedModel: ['fee'],
    ms: 10,
  }),
  run({ id: 'c', ms: 20 }),
])

describe('summarize', () => {
  it('counts values, who read them, and wrong values caught by the checks', () => {
    expect(combined.values).toBe(4)
    expect(combined.byParser).toBe(3)
    expect(combined.wrong).toBe(3)
    expect(combined.wrongFlagged).toBe(1)
    expect(combined.receiptsAsked).toBe(2)
    expect(combined.fieldsAsked).toBe(3)
    expect(combined.modelErrors).toEqual({ over_cap: 1 })
    expect(combined.medianMs).toBe(20)
    expect(combined.report.overall).toEqual({ correct: 1, wrong: 2, missing: 1, extra: 1 })
  })
})

describe('results.md', () => {
  const md = formatResults({
    date: '2026-09-30',
    sets: { real: 2, synthetic: 3 },
    model: 'qwen/qwen3.8-27b',
    images: true,
    summaries: [summarize('parser', []), combined],
    redaction: { receipts: 5, leaks: ['a: “Tran”'], lost: [] },
    skipped: [{ mode: 'model', why: 'no key.' }],
  })

  it('says how many receipts, which model, and that the results are early', () => {
    expect(md).toContain('on 5 receipts: 2 real, 3 synthetic')
    expect(md).toContain('`qwen/qwen3.8-27b` on Groq, with the redacted photo')
    expect(md).toContain('**Early results.**')
    expect(md).toContain('- model mode didn’t run: no key.')
  })

  it('has a summary row per mode, a field table and the redaction count', () => {
    expect(md).toContain('| combined | 25.0% | 25.0% | 3 of 4 (75.0%) | 1 of 3 (33.3%) | 0.02 s |')
    expect(md).toContain('| parser | – | – | – | – | 0.00 s |')
    expect(md).toContain('| fee | – | 0.0% |')
    expect(md).not.toContain('| delivery_method |')
    expect(md).toContain('1 personal detail left readable, 0 values hidden by mistake')
    expect(md).toContain('Gave nothing on 1 (over_cap).')
    expect(md).toContain('## What this does not tell you')
  })

  it('says so when the model did not run', () => {
    const none = formatResults({ date: 'd', sets: { real: 0, synthetic: 1 }, model: null, images: false, summaries: [], redaction: { receipts: 1, leaks: [], lost: [] }, skipped: [] })
    expect(none).toContain('Model: not run')
  })
})

describe('showsWord', () => {
  it('matches whole words only', () => {
    expect(showsWord('Transfer Amount', 'Tran')).toBe(false)
    expect(showsWord('To: Tran Van Minh', 'Tran')).toBe(true)
    expect(showsWord('Phone (206) 555-0142', '555-0142')).toBe(true)
    expect(showsWord('1234 Pine St', '1234 Pine')).toBe(true)
  })
})
