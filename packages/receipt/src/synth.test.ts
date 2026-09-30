import { describe, expect, it } from 'vitest'
import { showsWord } from './benchmark.ts'
import { parseFixture } from './node/fixtures.ts'
import { fromTesseract } from './node/tesseract.ts'
import { pageText } from './ocr.ts'
import { detectPii, redactPage } from './redact.ts'
import { receiptHtml, rng, synthesize, usNumber } from './synth.ts'
import type { ExtractedFields, FieldName } from './types.ts'
import { validateReceipt } from './validate.ts'

const SEEDS = Array.from({ length: 200 }, (_, i) => i + 1)
const receipts = SEEDS.map((s) => synthesize(s))

describe('the random source', () => {
  it('is the same for the same seed, and spreads neighboring seeds', () => {
    expect(synthesize(7)).toEqual(synthesize(7))
    const first = SEEDS.slice(0, 20).map((s) => Math.floor(rng(s).next() * 8))
    expect(new Set(first).size).toBeGreaterThan(4)
  })
})

describe('synthetic receipts', () => {
  it('have unique ids, and a fixture loader accepts every one', () => {
    expect(new Set(receipts.map((r) => r.id)).size).toBe(receipts.length)
    for (const r of receipts) expect(() => parseFixture(r.id, r)).not.toThrow()
  })

  it('pass every receipt check when read correctly, the rate check included', () => {
    for (const r of receipts) {
      const fields = Object.fromEntries(
        Object.entries(r.expected).map(([k, value]) => [k, { value, confidence: 1, path: 'parser', validated: false }]),
      ) as ExtractedFields
      const v = validateReceipt(fields, { midRate: r.mid_rate })
      expect(v.checks.filter((c) => !c.ok), r.id).toEqual([])
      expect(v.missing, r.id).toEqual([])
    }
  })

  it('charge the 1% tax only on cash-type funding', () => {
    for (const r of receipts) {
      const taxed = ['cash', 'money_order', 'cashiers_check'].includes(r.expected.funding_method!)
      if (taxed) expect(r.expected.tax, r.id).toBeCloseTo(r.expected.amount_sent! / 100, 2)
      else expect(r.expected.tax ?? 0, r.id).toBe(0)
    }
  })

  it('cover every provider, funding method and receiving currency', () => {
    const seen = (f: FieldName) => new Set(receipts.map((r) => r.expected[f]))
    expect(seen('provider').size).toBe(8)
    expect(seen('funding_method').size).toBe(6)
    expect(seen('receive_currency').size).toBe(5)
  })

  it('print every value they claim, and keep personal details apart from values', () => {
    for (const r of receipts) {
      const text = r.lines.join('\n')
      for (const k of r.keep) expect(text, r.id).toContain(k)
      for (const p of r.pii) expect(text, r.id).toContain(p)
      for (const p of r.pii) for (const k of r.keep) expect(k.includes(p), `${r.id}: ${p} in ${k}`).toBe(false)
    }
  })

  it('lose no personal detail to redaction, and no value either (printed text)', () => {
    const leaks: string[] = []
    const lost: string[] = []
    for (const r of receipts) {
      const f = parseFixture(r.id, r)
      const text = pageText(redactPage(f.page, detectPii(f.page)))
      for (const p of r.pii) if (showsWord(text, p)) leaks.push(`${r.id}: ${p}`)
      for (const k of r.keep) if (!text.includes(k)) lost.push(`${r.id}: ${k}`)
    }
    expect(leaks).toEqual([])
    expect(lost).toEqual([])
  })

  it('render as HTML with every line escaped', () => {
    const html = receiptHtml({ ...receipts[0], lines: ['<b>&'] })
    expect(html).toContain('&lt;b&gt;&amp;')
    expect(html).toContain(receipts[0].style.font)
  })

  it('print numbers the US way', () => {
    expect(usNumber(1234567.5, 2)).toBe('1,234,567.50')
    expect(usNumber(25310, 0)).toBe('25,310')
  })
})

describe('tesseract output', () => {
  it('becomes an OcrPage with lines top to bottom and empty words dropped', () => {
    const bbox = (x0: number, y0: number, x1: number, y1: number) => ({ x0, y0, x1, y1 })
    const page = fromTesseract(
      {
        blocks: [
          { paragraphs: [{ lines: [{ bbox: bbox(0, 40, 100, 60), words: [{ text: 'Fee', bbox: bbox(0, 40, 30, 60) }, { text: ' ', bbox: bbox(30, 40, 31, 60) }] }] }] },
          { paragraphs: [{ lines: [{ bbox: bbox(0, 0, 100, 20), words: [{ text: 'Remitly', bbox: bbox(0, 0, 70, 20) }] }, { bbox: bbox(0, 20, 1, 21), words: [] }] }] },
        ],
      },
      200,
      100,
    )
    expect(pageText(page)).toBe('Remitly\nFee')
    expect(page.lines[1].words[0].box).toEqual({ x: 0, y: 40, width: 30, height: 20 })
    expect(fromTesseract({ blocks: null }, 1, 1).lines).toEqual([])
  })
})
