/**
 * Reads the WhatsApp receipt photos waiting in the queue (DECISIONS.md D80, D94). Run by
 * .github/workflows/receipt-intake.yml; the flow itself is src/node/intake.ts.
 *
 * Environment (GitHub Actions secrets, never in this repo):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   the queue and the two functions
 *   WHATSAPP_ACCESS_TOKEN                     to download photos from Meta
 *   RECEIPT_INTAKE_SECRET                     proves to the functions this is the worker
 *   WHATSAPP_GRAPH_VERSION                    optional, as in the whatsapp function
 */
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'

import { createWorker } from 'tesseract.js'

import { runIntake } from '../src/node/intake.ts'
import { fromTesseract, type TesseractPage } from '../src/node/tesseract.ts'

const need = (k: string) => {
  const v = process.env[k]
  if (!v) {
    console.error(`${k} is not set`)
    process.exit(1)
  }
  return v
}

const require = createRequire(import.meta.url)
const LANG = join(dirname(require.resolve('@tesseract.js-data/eng/package.json')), '4.0.0_best_int')
const tesseract = await createWorker('eng', 1, { langPath: LANG, cachePath: process.env.RUNNER_TEMP ?? '/tmp' })

try {
  await runIntake({
    supabaseUrl: need('SUPABASE_URL'),
    serviceKey: need('SUPABASE_SERVICE_ROLE_KEY'),
    whatsappToken: need('WHATSAPP_ACCESS_TOKEN'),
    intakeSecret: need('RECEIPT_INTAKE_SECRET'),
    graphVersion: process.env.WHATSAPP_GRAPH_VERSION || undefined,
    fetch,
    today: () => new Date().toISOString().slice(0, 10),
    log: (m) => console.log(m),
    ocr: async (image) => {
      // Phone photos are often sideways; tesseract turns them upright first.
      const { data } = await tesseract.recognize(Buffer.from(image), { rotateAuto: true }, { blocks: true })
      const page = data as unknown as TesseractPage
      const boxes = (page.blocks ?? []).flatMap((b) => b.paragraphs.flatMap((p) => p.lines.map((l) => l.bbox)))
      const width = Math.max(1, ...boxes.map((b) => b.x1))
      const height = Math.max(1, ...boxes.map((b) => b.y1))
      return fromTesseract(page, width, height)
    },
  })
} finally {
  await tesseract.terminate()
}
