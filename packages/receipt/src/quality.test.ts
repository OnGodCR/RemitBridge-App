import { describe, expect, it } from 'vitest'
import { pageFromLines } from './ocr.ts'
import { grayFromRgba, sharpness, textBlur, wordBlur, type GrayImage } from './quality.ts'

/** Dark strokes 4 px wide every 16 px on white, like letters, blurred by a Gaussian of `sigma`. */
function strokes(width: number, height: number, sigma: number): GrayImage {
  const row = new Float64Array(width)
  for (let x = 0; x < width; x++) row[x] = x % 16 < 4 ? 20 : 235
  let out = row
  if (sigma > 0) {
    const r = Math.ceil(sigma * 3)
    const k = Array.from({ length: 2 * r + 1 }, (_, i) => Math.exp(-((i - r) ** 2) / (2 * sigma * sigma)))
    const sum = k.reduce((a, b) => a + b, 0)
    out = row.map((_, x) => k.reduce((acc, w, i) => acc + w * row[Math.min(width - 1, Math.max(0, x + i - r))], 0) / sum)
  }
  const data = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) data[y * width + x] = Math.round(out[x])
  return { width, height, data }
}

const box = { x: 4, y: 0, width: 150, height: 30 }

describe('blur', () => {
  it('grows with the blur, from crisp print to unreadable', () => {
    const blurs = [0, 1, 2, 3].map((s) => wordBlur(strokes(160, 31, s), box)!)
    for (let i = 1; i < blurs.length; i++) expect(blurs[i]).toBeGreaterThan(blurs[i - 1])
    expect(sharpness(blurs[0])).toBe('sharp')
    // The same 3 px blur on letters half as tall.
    expect(sharpness(wordBlur(strokes(160, 16, 3), { ...box, height: 15 }))).toBe('too_blurry')
  })

  it('is relative to the letters’ height: the same blur matters more on small print', () => {
    const tall = wordBlur(strokes(160, 61, 2), { ...box, height: 60 })!
    const short = wordBlur(strokes(160, 31, 2), box)!
    expect(short).toBeGreaterThan(tall)
  })

  it('says nothing about words too small or too faint to measure', () => {
    expect(wordBlur(strokes(160, 31, 0), { ...box, height: 5 })).toBeNull()
    const faint = { width: 160, height: 31, data: new Uint8Array(160 * 31).fill(200) }
    expect(wordBlur(faint, box)).toBeNull()
    expect(sharpness(null)).toBe('unknown')
  })

  it('takes the typical word on the page, and converts RGBA', () => {
    const img = strokes(400, 48, 0)
    const page = pageFromLines(['WORD WORD'], 10, 24)
    expect(textBlur(img, page)).toBeLessThan(0.07)
    const rgba = new Uint8Array([255, 255, 255, 255, 0, 0, 0, 255])
    expect([...grayFromRgba(rgba, 2, 1).data]).toEqual([255, 0])
  })
})
