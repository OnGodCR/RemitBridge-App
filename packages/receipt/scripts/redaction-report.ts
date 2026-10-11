/**
 * How much redaction hides that it shouldn't (2026-10-10: Angad found the black boxes
 * covering too much of a real receipt). Runs the rules over the fixtures and over
 * synthetic receipts, whose personal details are known, and reports:
 *   - missed: personal words left readable (must stay 0);
 *   - over-hidden: words hidden that are not personal, as a share of all words;
 *   - the lines most often over-hidden, by the rule that hid them.
 * The synthetic receipts list only part of a person's address and phone as personal, so
 * those lines show up as over-hidden here although hiding them is right.
 *
 *   node scripts/redaction-report.ts [count]
 */
import { loadFixtures } from '../src/node/fixtures.ts'
import { lineText, pageFromLines } from '../src/ocr.ts'
import { detectPii } from '../src/redact.ts'
import { synthesize } from '../src/synth.ts'
import type { OcrPage } from '../src/types.ts'

const count = Number(process.argv[2] ?? 400)
const clean = (s: string) => s.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')

let words = 0
let piiWords = 0
let missed = 0
let over = 0
const offenders = new Map<string, number>()
const misses: string[] = []

function score(id: string, page: OcrPage, pii: string[]) {
  const tokens = new Set(pii.flatMap((p) => p.split(/\s+/)).map(clean).filter(Boolean))
  const isPii = (t: string) => {
    const c = clean(t)
    if (!c) return false
    if (tokens.has(c)) return true
    // A number OCR glued to its neighbour, or a phone split into pieces. Only for digits:
    // with letters, "Tran" (a surname) would count "Transfer" as personal.
    return /\d{3}/.test(c) && [...tokens].some((p) => /\d{3}/.test(p) && (c.includes(p) || p.includes(c)))
  }
  const hidden = new Map(detectPii(page).map((r) => [`${r.line}:${r.word}`, r.kind]))
  page.lines.forEach((l, i) =>
    l.words.forEach((w, j) => {
      words++
      const kind = hidden.get(`${i}:${j}`)
      if (isPii(w.text)) {
        piiWords++
        if (!kind) {
          missed++
          misses.push(`${id}: "${w.text}" in "${lineText(l)}"`)
        }
      } else if (kind) {
        over++
        const key = `${kind.padEnd(11)} ${lineText(l).replace(/\d/g, '9')}`
        offenders.set(key, (offenders.get(key) ?? 0) + 1)
      }
    }),
  )
}

for (const f of loadFixtures()) score(f.id, f.page, f.pii)
for (let seed = 1; seed <= count; seed++) {
  const r = synthesize(seed)
  score(`synth-${seed}`, pageFromLines(r.lines), r.pii)
}

const pct = (a: number, b: number) => `${((a / b) * 100).toFixed(1)}%`
console.log(`Receipts: ${loadFixtures().length} fixtures + ${count} synthetic`)
console.log(`Words: ${words}, personal: ${piiWords}`)
console.log(`Missed personal words: ${missed} (${pct(missed, piiWords)})`)
console.log(`Over-hidden words: ${over} (${pct(over, words - piiWords)} of the words that should show)`)
console.log('\nMost over-hidden lines (digits shown as 9):')
for (const [k, n] of [...offenders].sort((a, b) => b[1] - a[1]).slice(0, 40)) console.log(`${String(n).padStart(5)}  ${k}`)
if (misses.length) {
  console.log('\nMissed (first 20):')
  for (const m of misses.slice(0, 20)) console.log(`  ${m}`)
}
