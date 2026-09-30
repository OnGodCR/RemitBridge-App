/**
 * Plain helpers over OCR output: line text, boxes for a span, and turning ML Kit's result
 * into an OcrPage. No heuristics about receipts live here; those are in extract/.
 */
import type { Box, OcrLine, OcrPage, OcrWord, SourceSpan } from './types.ts'

/** A line's text: its words joined by single spaces. */
export function lineText(line: OcrLine): string {
  return line.words.map((w) => w.text).join(' ')
}

/** The whole page, one line of text per OCR line. */
export function pageText(page: OcrPage): string {
  return page.lines.map(lineText).join('\n')
}

/** Where each word starts and ends in lineText(line). */
export function wordOffsets(line: OcrLine): { start: number; end: number }[] {
  const out: { start: number; end: number }[] = []
  let at = 0
  for (const w of line.words) {
    out.push({ start: at, end: at + w.text.length })
    at += w.text.length + 1
  }
  return out
}

/** The smallest box around all of `boxes`. */
export function unionBox(boxes: Box[]): Box {
  if (!boxes.length) return { x: 0, y: 0, width: 0, height: 0 }
  const x = Math.min(...boxes.map((b) => b.x))
  const y = Math.min(...boxes.map((b) => b.y))
  const right = Math.max(...boxes.map((b) => b.x + b.width))
  const bottom = Math.max(...boxes.map((b) => b.y + b.height))
  return { x, y, width: right - x, height: bottom - y }
}

/** The box to highlight for a value's source span, or null if the span doesn't exist. */
export function spanBox(page: OcrPage, span: SourceSpan): Box | null {
  const line = page.lines[span.line]
  if (!line) return null
  if (!span.words) return line.box
  const words = line.words.slice(span.words[0], span.words[1])
  return words.length ? unionBox(words.map((w) => w.box)) : null
}

/**
 * A page from plain text lines, with boxes laid out as if printed in a monospaced font:
 * each character 10 px wide, each line 24 px tall. For fixtures and tests, and for the
 * WhatsApp worker when OCR gives text without word boxes.
 */
export function pageFromLines(lines: string[], charWidth = 10, lineHeight = 24): OcrPage {
  const out: OcrLine[] = lines.map((text, i) => {
    const y = i * lineHeight
    const words: OcrWord[] = []
    const re = /\S+/g
    for (let m = re.exec(text); m; m = re.exec(text)) {
      words.push({ text: m[0], box: { x: m.index * charWidth, y, width: m[0].length * charWidth, height: lineHeight } })
    }
    return { words, box: words.length ? unionBox(words.map((w) => w.box)) : { x: 0, y, width: 0, height: lineHeight } }
  })
  const width = Math.max(1, ...lines.map((l) => l.length * charWidth))
  return { width, height: Math.max(1, lines.length * lineHeight), lines: out }
}

/** The part of ML Kit's text recognition result this package reads. */
export interface MlKitResult {
  blocks: {
    lines: {
      text: string
      frame?: { left: number; top: number; width: number; height: number }
      elements: { text: string; frame?: { left: number; top: number; width: number; height: number } }[]
    }[]
  }[]
}

/**
 * ML Kit's blocks, lines and elements as an OcrPage, lines top to bottom. `width` and
 * `height` are the photo's, which ML Kit doesn't return. Elements without a frame are
 * dropped: a word that can't be located can't be redacted, so it isn't kept as text either.
 */
export function fromMlKit(result: MlKitResult, width: number, height: number): OcrPage {
  const box = (f: { left: number; top: number; width: number; height: number }): Box => ({
    x: f.left,
    y: f.top,
    width: f.width,
    height: f.height,
  })
  const lines: OcrLine[] = []
  for (const block of result.blocks) {
    for (const line of block.lines) {
      const words = line.elements
        .filter((e) => e.frame && e.text.trim())
        .map((e) => ({ text: e.text.trim(), box: box(e.frame!) }))
      if (!words.length) continue
      lines.push({ words, box: line.frame ? box(line.frame) : unionBox(words.map((w) => w.box)) })
    }
  }
  lines.sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x)
  return { width, height, lines }
}

/**
 * Whether every word box lies inside the photo (with `slack`, a share of each side, for
 * boxes that overhang the edge a little). OCR and redaction read the same file, but if a
 * phone reports boxes for a rotated version of it, they won't fit, and redacting with
 * them would cover the wrong places. The scan stops instead.
 */
export function boxesInside(page: OcrPage, slack = 0.02): boolean {
  const dx = page.width * slack
  const dy = page.height * slack
  return page.lines.every((l) =>
    l.words.every(
      (w) => w.box.x >= -dx && w.box.y >= -dy && w.box.x + w.box.width <= page.width + dx && w.box.y + w.box.height <= page.height + dy,
    ),
  )
}
