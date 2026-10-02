/**
 * The parser's frame, with stand-in extractors (the real ones are tested in extract/): order,
 * template choice, and that one bad extractor can't spoil the rest.
 */
import { describe, expect, it } from 'vitest'
import { EXTRACTORS, type Extractors } from './extract/index.ts'
import { pageFromLines } from './ocr.ts'
import { parseReceipt } from './parser.ts'
import { FIELD_NAMES, type FieldName } from './types.ts'

const TODAY = '2026-09-30'
const page = pageFromLines(['WESTERN UNION', 'Transfer Amount $500.00', 'Transfer Fees $4.99'])
const none = Object.fromEntries(FIELD_NAMES.map((f) => [f, () => null])) as unknown as Extractors
const using = (over: Partial<Extractors>): Extractors => ({ ...none, ...over })

describe('parseReceipt', () => {
  it('runs every extractor once, provider first, passing on what was found', () => {
    const order: FieldName[] = []
    const seen: Record<string, string[]> = {}
    const spy = Object.fromEntries(
      FIELD_NAMES.map((f) => [
        f,
        (ctx: Parameters<Extractors['fee']>[0]) => {
          order.push(f)
          seen[f] = Object.keys(ctx.found)
          if (f === 'provider') return { value: 'Western Union', confidence: 0.95 }
          if (f === 'amount_sent') return { value: 500, confidence: 0.9, source: { line: 1, words: [2, 3] } }
          return null
        },
      ]),
    ) as unknown as Extractors
    const result = parseReceipt(page, { today: TODAY, extractors: spy })
    expect(order).toEqual([...FIELD_NAMES])
    expect(seen.fee).toEqual(['provider', 'amount_sent'])
    expect(result.fields.amount_sent).toEqual({ value: 500, confidence: 0.9, source: { line: 1, words: [2, 3] } })
  })

  it('reads the rest with the provider’s template', () => {
    let templateSeen = ''
    const result = parseReceipt(page, {
      today: TODAY,
      extractors: using({
        provider: () => ({ value: 'western union', confidence: 0.9 }),
        fee: (ctx) => {
          templateSeen = ctx.template.id
          return null
        },
      }),
    })
    expect(templateSeen).toBe('western-union')
    expect(result.templateId).toBe('western-union')
  })

  it('uses the generic template when the provider isn’t known', () => {
    const result = parseReceipt(page, { today: TODAY, extractors: using({ provider: () => ({ value: 'Corner Store Remit', confidence: 0.4 }) }) })
    expect(result.templateId).toBe('generic')
    expect(result.fields.provider?.value).toBe('Corner Store Remit')
  })

  it('drops a value of the wrong type and says why', () => {
    const result = parseReceipt(page, {
      today: TODAY,
      extractors: using({ fee: () => ({ value: '4.99' as unknown as number, confidence: 0.9 }) }),
    })
    expect(result.fields.fee).toBeUndefined()
    expect(result.problems).toEqual([{ field: 'fee', message: 'fee: not a number' }])
  })

  it('keeps going when an extractor throws', () => {
    const result = parseReceipt(page, {
      today: TODAY,
      extractors: using({
        fee: () => {
          throw new Error('boom')
        },
        tax: () => ({ value: 5, confidence: 0.9 }),
      }),
    })
    expect(result.problems).toEqual([{ field: 'fee', message: 'threw: boom' }])
    expect(result.fields.tax?.value).toBe(5)
  })

  it('refuses a confidence outside 0 to 1, and a source line that doesn’t exist', () => {
    const result = parseReceipt(page, {
      today: TODAY,
      extractors: using({
        fee: () => ({ value: 4.99, confidence: 1.5 }),
        tax: () => ({ value: 5, confidence: 0.9, source: { line: 99 } }),
      }),
    })
    expect(result.fields.fee).toBeUndefined()
    expect(result.fields.tax).toEqual({ value: 5, confidence: 0.9, source: undefined })
    expect(result.problems.map((p) => p.field)).toEqual(['fee', 'tax'])
  })

  it('has a real extractor for every field', () => {
    expect(Object.keys(EXTRACTORS).sort()).toEqual([...FIELD_NAMES].sort())
  })
})
