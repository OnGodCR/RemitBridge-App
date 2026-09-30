/**
 * tesseract.js output as an OcrPage, the same shape the phone's ML Kit reading becomes
 * (ocr.ts fromMlKit), so the benchmark feeds the pipeline exactly what the app would.
 * Pure: the OCR itself runs in scripts/synthesize.ts.
 */
import type { OcrLine, OcrPage } from '../types.ts'

interface Bbox {
  x0: number
  y0: number
  x1: number
  y1: number
}

/** The part of tesseract.js's result (with `blocks: true`) this reads. */
export interface TesseractPage {
  blocks: { paragraphs: { lines: { bbox: Bbox; words: { text: string; bbox: Bbox }[] }[] }[] }[] | null
}

const box = (b: Bbox) => ({ x: b.x0, y: b.y0, width: b.x1 - b.x0, height: b.y1 - b.y0 })

/** Lines in reading order (top to bottom), empty words and lines dropped. */
export function fromTesseract(result: TesseractPage, width: number, height: number): OcrPage {
  const lines: OcrLine[] = []
  for (const block of result.blocks ?? []) {
    for (const para of block.paragraphs) {
      for (const line of para.lines) {
        const words = line.words.filter((w) => w.text.trim()).map((w) => ({ text: w.text.trim(), box: box(w.bbox) }))
        if (words.length) lines.push({ words, box: box(line.bbox) })
      }
    }
  }
  lines.sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x)
  return { width, height, lines }
}
