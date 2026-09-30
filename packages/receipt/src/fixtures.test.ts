/**
 * The real extractors (Angad's, extract/fields.ts) against every fixture, one test per
 * value the receipt shows. A wrong value fails. A value not read yet is skipped, so the
 * suite stays green while the TODOs are open; RECEIPT_STRICT=1 makes those fail too.
 * The parser always sees the redacted page, as it will in the app.
 */
import { describe, expect, it } from 'vitest'
import { sameValue } from './harness.ts'
import { loadFixtures, parseFixture } from './node/fixtures.ts'
import { parseReceipt } from './parser.ts'
import { detectPii, redactPage } from './redact.ts'
import type { FieldName } from './types.ts'

const STRICT = process.env.RECEIPT_STRICT === '1'
const TODAY = new Date().toISOString().slice(0, 10)

for (const f of loadFixtures()) {
  describe(f.id, () => {
    const result = parseReceipt(redactPage(f.page, detectPii(f.page)), { today: TODAY })

    it('no extractor threw or returned a malformed value', () => {
      expect(result.problems).toEqual([])
    })

    for (const [field, expected] of Object.entries(f.expected)) {
      it(field, (ctx) => {
        const got = result.fields[field as FieldName]
        if (!got) {
          if (STRICT) expect.fail(`${field} wasn't read`)
          ctx.skip()
          return
        }
        expect(sameValue(field as FieldName, expected, got.value), `${field}: read ${got.value}, expected ${expected}`).toBe(true)
      })
    }
  })
}

describe('fixture files', () => {
  it('are refused when malformed, naming the file', () => {
    expect(() => parseFixture('x', { id: 'y' })).toThrow(/fixture x: id "y"/)
    expect(() => parseFixture('x', { id: 'x', description: '', source: 'synthetic', lines: ['a'], expected: { fees: 1 } })).toThrow(
      /unknown field "fees"/,
    )
    expect(() => parseFixture('x', { id: 'x', description: '', source: 'synthetic', lines: ['a'], expected: { fee: '1' } })).toThrow(
      /fee: not a number/,
    )
  })
})
