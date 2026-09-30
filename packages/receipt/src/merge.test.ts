import { describe, expect, it } from 'vitest'
import { applyCorrection, fieldsForModel, mergeFields } from './merge.ts'
import { FIELD_NAMES } from './types.ts'

describe('fieldsForModel', () => {
  it('asks for what the rules missed or read below 0.8', () => {
    const ask = fieldsForModel({ fee: { value: 4.99, confidence: 0.95 }, tax: { value: 5, confidence: 0.6 } })
    expect(ask).toContain('tax')
    expect(ask).not.toContain('fee')
    expect(ask).toHaveLength(FIELD_NAMES.length - 1)
  })
})

describe('mergeFields', () => {
  it('keeps a confident parser value, even if the model differs', () => {
    const m = mergeFields({ fee: { value: 4.99, confidence: 0.95 } }, { fee: { value: 5.99, confidence: 0.99 } })
    expect(m.fee).toEqual({ value: 4.99, confidence: 0.95, path: 'parser', validated: false })
  })

  it('takes the model’s value where the rules found nothing', () => {
    const m = mergeFields({}, { tax: { value: 5, confidence: 0.9, source: { line: 3 } } })
    expect(m.tax).toEqual({ value: 5, confidence: 0.9, source: { line: 3 }, path: 'model', validated: false })
  })

  it('raises confidence when an unsure parser value and the model agree', () => {
    const m = mergeFields({ fee: { value: 4.99, confidence: 0.6 } }, { fee: { value: 4.99, confidence: 0.9 } })
    expect(m.fee).toMatchObject({ value: 4.99, confidence: 0.9, path: 'parser' })
  })

  it('on disagreement, keeps the more confident one at lower confidence', () => {
    const m = mergeFields({ fee: { value: 4.99, confidence: 0.6 } }, { fee: { value: 5.99, confidence: 0.9 } })
    expect(m.fee?.value).toBe(5.99)
    expect(m.fee?.path).toBe('model')
    expect(m.fee?.confidence).toBeCloseTo(0.675)
  })

  it('keeps an unsure parser value when the model found nothing', () => {
    expect(mergeFields({ fee: { value: 4.99, confidence: 0.6 } }, {}).fee?.path).toBe('parser')
    expect(mergeFields({ fee: { value: 4.99, confidence: 0.6 } }, null).fee?.confidence).toBe(0.6)
  })
})

describe('applyCorrection', () => {
  it('records the person’s value as user_corrected and fully trusted', () => {
    const got = applyCorrection({ fee: { value: 5.99, confidence: 0.3, path: 'model', validated: false, source: { line: 4 } } }, 'fee', 4.99, '2026-09-30')
    expect(got).toEqual({ ok: true, fields: { fee: { value: 4.99, confidence: 1, path: 'user_corrected', validated: true, source: { line: 4 } } } })
  })

  it('refuses an invalid correction', () => {
    expect(applyCorrection({}, 'transfer_date', '2030-01-01', '2026-09-30')).toMatchObject({ ok: false })
  })
})
