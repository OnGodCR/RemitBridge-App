import { describe, expect, it } from 'vitest'
import { loadFixtures } from './node/fixtures.ts'
import { lineText, pageFromLines, pageText } from './ocr.ts'
import { detectPii, HIDDEN, redactionBoxes, redactPage, toggleWord, type Redaction } from './redact.ts'

/** The text of one receipt line after redaction. */
const redacted = (...lines: string[]) => {
  const page = pageFromLines(lines)
  return redactPage(page, detectPii(page)).lines.map(lineText)
}

describe('hides personal details', () => {
  it.each([
    ['names after a sender or receiver label', 'Sender: Maria Lopez', `Sender: ${HIDDEN} ${HIDDEN}`],
    ['colon labels that need one', 'From: Arjun Mehta', `From: ${HIDDEN} ${HIDDEN}`],
    ['street addresses', '1234 Pine St Apt 5', Array(5).fill(HIDDEN).join(' ')],
    ['city, state and ZIP', 'Seattle, WA 98101', `${HIDDEN} ${HIDDEN} ${HIDDEN}`],
    ['Mexican postal codes', 'Col. Centro C.P. 44100', Array(4).fill(HIDDEN).join(' ')],
    ['US phone numbers', 'Phone: (206) 555-0142', `Phone: ${HIDDEN} ${HIDDEN}`],
    ['international phone numbers', 'Tel +52 33 1234 5678', `Tel ${HIDDEN} ${HIDDEN} ${HIDDEN} ${HIDDEN}`],
    ['email addresses', 'Contact: nguyen.an@example.com', `Contact: ${HIDDEN}`],
    ['UPI handles', 'UPI ID: priya.m@okaxis', `UPI ID: ${HIDDEN}`],
    ['masked cards', 'Funding: Visa Debit ****4821', `Funding: Visa Debit ${HIDDEN}`],
    ['full card numbers', 'Card 4111 1111 1111 1111', `Card ${HIDDEN} ${HIDDEN} ${HIDDEN} ${HIDDEN}`],
    ['account numbers', 'Account number 000123456789', `Account number ${HIDDEN}`],
    ['the last digits after an account label', 'Paid with: Bank Account (ACH) ending 6613', `Paid with: Bank Account (ACH) ending ${HIDDEN}`],
    ['Western Union MTCNs', 'MTCN 8472615093', `MTCN ${HIDDEN}`],
    ['reference codes', 'Reference number R4839201756', `Reference number ${HIDDEN}`],
    ['long numbers with no label', 'Order 20394857', `Order ${HIDDEN}`],
  ])('%s', (_, line, expected) => {
    expect(redacted(line)[0]).toBe(expected)
  })

  it('hides the lines under a name label up to the next amount or label', () => {
    expect(redacted('Receiver', 'Juan Perez Garcia', 'Guadalajara, Jalisco', 'Transfer Amount $500.00')).toEqual([
      'Receiver',
      `${HIDDEN} ${HIDDEN} ${HIDDEN}`,
      `${HIDDEN} ${HIDDEN}`,
      'Transfer Amount $500.00',
    ])
  })

  it('hides the ID on the line under an ID label', () => {
    expect(redacted('Confirmation number:', 'RB-5521903', 'Fee $4.99')).toEqual(['Confirmation number:', HIDDEN, 'Fee $4.99'])
  })
})

describe('leaves amounts, rates, dates and labels alone', () => {
  it.each([
    'Total to Recipient 8,560.00 MXN',
    'Total to recipient: 6327500 VND',
    'Recipient gets ₹88,150.00',
    'Exchange Rate US$1.00 = 17.2000 MXN',
    'Exchange rate: 1 USD = 25,310 VND',
    'Transfer Fees + $4.99',
    'Transfer Taxes + $5.00',
    'Date: 09/28/2026',
    'Transaction date 2026-09-25',
    'Sent on Sep 27, 2026',
    'Payment Method: Cash',
    'Delivery Method: Cash Pickup',
    'Receive amount 17,355.00 PHP',
    'Total 12,650,000 VND',
    'WESTERN UNION',
    'You can cancel for a full refund within 30 minutes of payment.',
  ])('%s', (line) => {
    expect(redacted(line)[0]).toBe(line)
  })

  it('reads a recipient label followed by an amount on the next line as an amount', () => {
    expect(redacted('Recipient receives', '8,600.00 MXN')).toEqual(['Recipient receives', '8,600.00 MXN'])
  })
})

describe('the fixtures', () => {
  for (const f of loadFixtures()) {
    it(`${f.id}: every personal detail is gone and every amount is still there`, () => {
      const text = pageText(redactPage(f.page, detectPii(f.page)))
      for (const p of f.pii) expect(text, `"${p}" still readable`).not.toContain(p)
      for (const k of f.keep) expect(text, `"${k}" was hidden`).toContain(k)
    })
  }
})

describe('the server’s second check', () => {
  it('finds nothing new on a page the phone already redacted', () => {
    for (const f of loadFixtures()) {
      const once = redactPage(f.page, detectPii(f.page))
      expect(detectPii(once), f.id).toEqual([])
    }
  })

  it('finds what a person chose to leave showing', () => {
    const page = pageFromLines(['Sender: Maria Lopez'])
    expect(detectPii(page).length).toBe(2)
  })
})

describe('boxes and taps', () => {
  const page = pageFromLines(['Sender: Maria Lopez', 'Fee $4.99'])
  const found = detectPii(page)

  it('paints one padded box per run of hidden words, inside the photo', () => {
    expect(redactionBoxes(page, found)).toEqual([{ x: 76, y: 0, width: 114, height: 28 }])
  })

  it('splits boxes where a shown word sits between hidden ones', () => {
    const r: Redaction[] = [
      { line: 1, word: 0, kind: 'manual' },
      { line: 0, word: 0, kind: 'manual' },
      { line: 0, word: 2, kind: 'manual' },
    ]
    expect(redactionBoxes(page, r, 0)).toHaveLength(3)
  })

  it('lets a person hide a word and show it again', () => {
    const hidden = toggleWord(found, 1, 1)
    expect(hidden).toContainEqual({ line: 1, word: 1, kind: 'manual' })
    expect(toggleWord(hidden, 1, 1)).toEqual(found)
  })

  it('keeps words the rules hid hidden', () => {
    expect(toggleWord(found, 0, 1)).toEqual(found)
  })
})
