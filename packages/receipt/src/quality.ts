/**
 * Whether a photo is too blurry to read (DECISIONS.md D131), from its pixels, where OCR found
 * words. A sharp letter goes from paper to ink in a pixel or two; a blurred one fades over
 * many. So for each word, the steepest step in brightness is compared with the word's
 * contrast, which estimates how wide the blur is in pixels, and that is divided by the word's
 * height: a blur a fifth as tall as the letters reads very differently from one a fiftieth
 * as tall, whatever the photo's size.
 *
 * Pure, so it runs the same on the phone (pixels from Skia) and in the calibration script.
 */
import type { OcrPage } from './types.ts'

export interface GrayImage {
  width: number
  height: number
  /** One byte per pixel, 0 black to 255 white, row by row. */
  data: Uint8Array
}

/** RGBA pixels (Skia, a canvas) as grayscale. */
export function grayFromRgba(rgba: Uint8Array | Uint8ClampedArray, width: number, height: number): GrayImage {
  const data = new Uint8Array(width * height)
  for (let i = 0, j = 0; i < data.length; i++, j += 4) {
    data[i] = (rgba[j] * 77 + rgba[j + 1] * 150 + rgba[j + 2] * 29) >> 8
  }
  return { width, height, data }
}

/** Words looked at, at most, spread over the page. */
const MAX_WORDS = 80
/** Words shorter than this (in pixels) are too small to measure. */
const MIN_HEIGHT = 8
/** Ink this close to the paper is too faint to say anything about sharpness. */
const MIN_CONTRAST = 40

function percentile(sorted: number[], p: number): number {
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]
}

/**
 * The blur of one word: the estimated blur width (a Gaussian's sigma, in pixels) over the
 * word's height. About 0.02 for crisp print; null when the word can't be measured.
 */
export function wordBlur(img: GrayImage, box: { x: number; y: number; width: number; height: number }): number | null {
  const x0 = Math.max(0, Math.floor(box.x))
  const y0 = Math.max(0, Math.floor(box.y))
  const x1 = Math.min(img.width - 1, Math.ceil(box.x + box.width))
  const y1 = Math.min(img.height - 1, Math.ceil(box.y + box.height))
  if (y1 - y0 < MIN_HEIGHT || x1 - x0 < MIN_HEIGHT) return null

  const levels: number[] = []
  const steps: number[] = []
  const at = (x: number, y: number) => img.data[y * img.width + x]
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const v = at(x, y)
      levels.push(v)
      steps.push(Math.abs(at(x + 1, y) - v), Math.abs(at(x, y + 1) - v))
    }
  }
  levels.sort((a, b) => a - b)
  steps.sort((a, b) => a - b)
  const contrast = percentile(levels, 0.95) - percentile(levels, 0.05)
  if (contrast < MIN_CONTRAST) return null
  const steepest = percentile(steps, 0.99)
  if (steepest <= 0) return null
  // A Gaussian-blurred edge of height C rises at most C / (sigma × √(2π)) per pixel.
  const sigma = contrast / (steepest * Math.sqrt(2 * Math.PI))
  return sigma / (y1 - y0)
}

/** The typical blur of the page's words (their median), or null when none could be measured. */
export function textBlur(img: GrayImage, page: OcrPage): number | null {
  const boxes = page.lines.flatMap((l) => l.words.map((w) => w.box))
  const stride = Math.max(1, Math.floor(boxes.length / MAX_WORDS))
  const blurs: number[] = []
  for (let i = 0; i < boxes.length; i += stride) {
    const b = wordBlur(img, boxes[i])
    if (b !== null) blurs.push(b)
  }
  if (!blurs.length) return null
  blurs.sort((a, b) => a - b)
  return blurs[Math.floor(blurs.length / 2)]
}

/**
 * Where reading breaks down, calibrated 2026-10-01 (D131): 8 synthetic receipts drawn at blurs
 * from 0 to 5 px and read back with tesseract. At 0.075 or less the rules read every value;
 * between 0.075 and 0.095, 64% to 100%; from about 0.095, half or fewer.
 */
export const TOO_BLURRY = 0.09
export const SOMEWHAT_BLURRY = 0.07

export type Sharpness = 'sharp' | 'somewhat_blurry' | 'too_blurry' | 'unknown'

/** textBlur's number as a verdict: too blurry to use, worth a warning, or fine. */
export function sharpness(blur: number | null): Sharpness {
  if (blur === null) return 'unknown'
  return blur >= TOO_BLURRY ? 'too_blurry' : blur >= SOMEWHAT_BLURRY ? 'somewhat_blurry' : 'sharp'
}
