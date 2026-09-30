/**
 * How the rule-based parser scores on the fixtures, as a markdown table:
 *
 *   npm run parser:report -w @remitbridge/receipt
 *
 * Each fixture is redacted first, as it would be on the phone, so the parser sees exactly
 * what it will see in the app. Problems (an extractor that threw, or returned a value of
 * the wrong type) are listed under the table.
 */
import { buildReport, formatReport, scoreFields, valuesOf } from '../src/harness.ts'
import { loadFixtures } from '../src/node/fixtures.ts'
import { parseReceipt } from '../src/parser.ts'
import { detectPii, redactPage } from '../src/redact.ts'

const today = new Date().toISOString().slice(0, 10)
const rows = []
const problems: string[] = []
for (const f of loadFixtures()) {
  const page = redactPage(f.page, detectPii(f.page))
  const result = parseReceipt(page, { today })
  rows.push({ id: f.id, scores: scoreFields(f.expected, valuesOf(result.fields)) })
  for (const p of result.problems) problems.push(`- ${f.id}, ${p.field}: ${p.message}`)
}
console.log(formatReport(buildReport(rows)))
if (problems.length) console.log(['', 'Problems:', ...problems].join('\n'))
