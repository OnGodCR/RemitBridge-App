/**
 * Makes the synthetic half of the accuracy benchmark (DECISIONS.md D85):
 *
 *   npm run synthesize -w @remitbridge/receipt -- [--count 60] [--first 1] [--clean]
 *
 * For each seed: synth.ts writes a receipt as HTML, Playwright photographs it in Chromium,
 * and tesseract.js reads the photo back. The OCR'd page, the ground truth and the fictional
 * personal details go to benchmark/synthetic/<id>.json (committed). The photo and a redacted
 * copy, with black boxes where redaction found personal details, go to
 * benchmark/synthetic/images/ (not committed; the benchmark's --images option sends the
 * redacted one to the model).
 *
 * --clean skips OCR and writes the printed lines instead: fast, and a check on the parser
 * without OCR noise. Chromium: PLAYWRIGHT_CHROMIUM, else /opt/pw-browsers (the cloud
 * sandbox), else Playwright's own download.
 */
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { chromium } from 'playwright-core'
import { createWorker } from 'tesseract.js'

import { fromTesseract, type TesseractPage } from '../src/node/tesseract.ts'
import { detectPii, redactionBoxes } from '../src/redact.ts'
import { receiptHtml, synthesize } from '../src/synth.ts'

const { values: args } = parseArgs({
  options: {
    count: { type: 'string', default: '60' },
    first: { type: 'string', default: '1' },
    clean: { type: 'boolean', default: false },
  },
})
const count = Number(args.count)
const first = Number(args.first)

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const OUT = join(ROOT, 'benchmark/synthetic')
const IMAGES = join(OUT, 'images')
mkdirSync(IMAGES, { recursive: true })
for (const f of readdirSync(OUT)) if (f.startsWith('synth-') && f.endsWith('.json')) rmSync(join(OUT, f))

const require = createRequire(import.meta.url)
const LANG = join(dirname(require.resolve('@tesseract.js-data/eng/package.json')), '4.0.0_best_int')
const SCALE = 2

function chromiumPath(): string | undefined {
  if (process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM
  const sandbox = '/opt/pw-browsers'
  if (!existsSync(sandbox)) return undefined
  const dir = readdirSync(sandbox).find((d) => /^chromium-\d+$/.test(d))
  return dir ? join(sandbox, dir, 'chrome-linux/chrome') : undefined
}

const browser = args.clean ? null : await chromium.launch({ executablePath: chromiumPath() })
const worker = args.clean ? null : await createWorker('eng', 1, { langPath: LANG, cachePath: join(IMAGES, '.tesseract') })

let written = 0
for (let seed = first; seed < first + count; seed++) {
  const receipt = synthesize(seed)
  const { style, lines, ...rest } = receipt
  let out: Record<string, unknown>
  if (!browser || !worker) {
    out = { ...rest, lines, style }
  } else {
    const page = await browser.newPage({ viewport: { width: style.width + 120, height: 400 }, deviceScaleFactor: SCALE })
    await page.setContent(receiptHtml(receipt))
    const png = await page.screenshot({ fullPage: true })
    const size = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }))
    await page.close()
    const width = size.w * SCALE
    const height = size.h * SCALE
    const { data } = await worker.recognize(png, {}, { blocks: true })
    const ocr = fromTesseract(data as unknown as TesseractPage, width, height)
    writeFileSync(join(IMAGES, `${receipt.id}.png`), png)

    // The redacted copy: the same black boxes the phone would draw.
    const boxes = redactionBoxes(ocr, detectPii(ocr))
    const overlay = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
    await overlay.setContent(
      `<body style="margin:0"><img src="data:image/png;base64,${png.toString('base64')}" style="position:absolute;left:0;top:0">` +
        boxes.map((b) => `<div style="position:absolute;background:#000;left:${b.x}px;top:${b.y}px;width:${b.width}px;height:${b.height}px"></div>`).join('') +
        '</body>',
    )
    writeFileSync(join(IMAGES, `${receipt.id}.redacted.png`), await overlay.screenshot())
    await overlay.close()
    out = { ...rest, printed: lines, style, ocr: 'tesseract.js 7, eng 4.0.0_best_int', page: ocr }
  }
  writeFileSync(join(OUT, `${receipt.id}.json`), JSON.stringify(out, null, 1) + '\n')
  written++
  if (written % 10 === 0) console.log(`${written} of ${count}`)
}
await worker?.terminate()
await browser?.close()
console.log(`Wrote ${written} synthetic receipts to benchmark/synthetic/${args.clean ? ' (printed text, no OCR)' : ''}.`)
