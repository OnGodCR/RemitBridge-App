import { describe, expect, it } from 'vitest'
import { checkDisclosures, missingDisclosures } from './disclosures.ts'
import { loadFixtures } from './node/fixtures.ts'
import { pageFromLines } from './ocr.ts'
import { detectPii, redactPage } from './redact.ts'
import { synthesize } from './synth.ts'

const wu = loadFixtures().find((f) => f.id === 'western-union-cash-usd-mxn')!

describe('the disclosure check', () => {
  it('finds what the Western Union fixture prints, after redaction, and names what it doesn’t', () => {
    const page = redactPage(wu.page, detectPii(wu.page))
    expect(missingDisclosures(page, wu.expected)).toEqual(['error_rights', 'provider_contact', 'cfpb_contact'])
  })

  it('asks about taxes only for cash-type transfers', () => {
    const page = pageFromLines(['Remitly'])
    expect(checkDisclosures(page, { funding_method: 'bank_account' }).map((d) => d.item)).not.toContain('taxes')
    expect(missingDisclosures(page, { funding_method: 'cash' })).toContain('taxes')
    expect(missingDisclosures(page, { funding_method: 'cash', tax: 5 })).not.toContain('taxes')
  })

  it('agrees with the synthetic receipts’ ground truth on every text item', () => {
    const wrong: string[] = []
    for (let seed = 1; seed <= 120; seed++) {
      const r = synthesize(seed)
      const page = pageFromLines(r.lines)
      const redacted = redactPage(page, detectPii(page))
      const results = checkDisclosures(redacted, r.expected)
      for (const item of ['date_available', 'error_rights', 'cancellation', 'provider_contact', 'cfpb_contact'] as const) {
        const found = results.find((d) => d.item === item)!.found
        if (found !== r.disclosures.includes(item)) wrong.push(`${r.id}: ${item}`)
      }
      if (!results.find((d) => d.item === 'recipient')!.found) wrong.push(`${r.id}: recipient`)
    }
    expect(wrong).toEqual([])
  })
})
