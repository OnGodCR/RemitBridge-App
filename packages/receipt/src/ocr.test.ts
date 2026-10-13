import { describe, expect, it } from 'vitest'
import { boxesInside, fromMlKit, joinRows, lineText, pageFromLines, pageText, spanBox, unionBox, wordOffsets } from './ocr.ts'
import { parseReceipt } from './parser.ts'

describe('pageFromLines', () => {
  it('lays words out on a grid, one line per string', () => {
    const page = pageFromLines(['Fee  $4.99', '', 'Total $509.99'])
    expect(page.lines).toHaveLength(3)
    expect(lineText(page.lines[0])).toBe('Fee $4.99')
    expect(page.lines[0].words[1].box).toEqual({ x: 50, y: 0, width: 50, height: 24 })
    expect(page.lines[1].words).toEqual([])
    expect(pageText(page)).toBe('Fee $4.99\n\nTotal $509.99')
  })
})

describe('offsets and boxes', () => {
  const page = pageFromLines(['Transfer Amount $500.00'])
  it('finds where each word sits in the line text', () => {
    expect(wordOffsets(page.lines[0])).toEqual([
      { start: 0, end: 8 },
      { start: 9, end: 15 },
      { start: 16, end: 23 },
    ])
  })
  it('boxes a span, a whole line, or nothing', () => {
    expect(spanBox(page, { line: 0, words: [2, 3] })).toEqual(page.lines[0].words[2].box)
    expect(spanBox(page, { line: 0 })).toEqual(page.lines[0].box)
    expect(spanBox(page, { line: 5 })).toBeNull()
    expect(unionBox([])).toEqual({ x: 0, y: 0, width: 0, height: 0 })
  })
})

describe('fromMlKit', () => {
  it('turns blocks, lines and elements into lines of words, top to bottom', () => {
    const f = (left: number, top: number, width = 40, height = 20) => ({ left, top, width, height })
    const page = fromMlKit(
      {
        blocks: [
          { lines: [{ text: 'Total $509.99', frame: f(10, 200, 200), elements: [{ text: 'Total', frame: f(10, 200) }, { text: '$509.99', frame: f(60, 200) }] }] },
          { lines: [{ text: 'Fee $4.99', elements: [{ text: 'Fee', frame: f(10, 100) }, { text: '$4.99', frame: f(60, 100) }, { text: 'lost' }] }] },
        ],
      },
      800,
      1200,
    )
    expect(page.lines.map(lineText)).toEqual(['Fee $4.99', 'Total $509.99'])
    expect(page.lines[0].box).toEqual({ x: 10, y: 100, width: 90, height: 20 })
    expect(page.width).toBe(800)
  })
})

describe('joinRows (D174)', () => {
  // ML Kit's layout for a two-column receipt: every label in one block, every value in
  // another, and each value's box a little higher than its label's.
  const f = (left: number, top: number, width = 120, height = 24) => ({ left, top, width, height })
  const line = (text: string, left: number, top: number) => ({
    text,
    frame: f(left, top, text.length * 11),
    elements: text.split(' ').map((w, i) => ({ text: w, frame: f(left + i * 60, top, w.length * 11) })),
  })
  const rows: [string, string][] = [
    ['Western Union', ''],
    ['Amount sent', '500.00 USD'],
    ['Transfer fee', '4.99 USD'],
    ['Total', '504.99 USD'],
    ['Exchange rate', '1 USD = 17.2000 MXN'],
    ['Amount received', '8,600.00 MXN'],
  ]
  const split = {
    blocks: [
      { lines: rows.map(([label], i) => line(label, 20, 100 + i * 40)) },
      { lines: rows.filter(([, v]) => v).map(([, value]) => line(value, 400, 100 + rows.findIndex(([, v]) => v === value) * 40 - 3)) },
    ],
  }

  it('puts a row split into label and value back together, left to right', () => {
    const page = fromMlKit(split, 800, 600)
    expect(page.lines.map(lineText)).toEqual([
      'Western Union',
      'Amount sent 500.00 USD',
      'Transfer fee 4.99 USD',
      'Total 504.99 USD',
      'Exchange rate 1 USD = 17.2000 MXN',
      'Amount received 8,600.00 MXN',
    ])
  })

  it('so the reader finds the values it missed on the split page', () => {
    const v = parseReceipt(fromMlKit(split, 800, 600), { today: '2026-10-13' }).fields
    expect(v.amount_sent?.value).toBe(500)
    expect(v.fee?.value).toBe(4.99)
    expect(v.total_paid?.value).toBe(504.99)
    expect(v.exchange_rate?.value).toBe(17.2)
    expect(v.amount_received?.value).toBe(8600)
  })

  it('leaves lines on different rows, and overlapping boxes, apart', () => {
    const a = { words: [], box: { x: 0, y: 0, width: 100, height: 20 } }
    const below = { words: [], box: { x: 200, y: 18, width: 100, height: 20 } }
    const over = { words: [], box: { x: 50, y: 0, width: 100, height: 20 } }
    expect(joinRows([a, below])).toHaveLength(2)
    expect(joinRows([a, over])).toHaveLength(2)
  })
})

describe('boxesInside', () => {
  it('accepts a page whose words fit the photo, and refuses one that was read rotated', () => {
    const page = pageFromLines(['Transfer Amount $500.00', 'Fee $4.99'])
    expect(boxesInside(page)).toBe(true)
    expect(boxesInside({ ...page, width: page.height, height: page.width })).toBe(false)
  })
})
