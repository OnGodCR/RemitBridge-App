/**
 * What a valid value looks like for each field, in one place. Every value that enters the
 * pipeline passes through checkValue, whoever produced it (an extractor, the model, or the
 * person on the confirmation screen), so a malformed value never reaches the formula or
 * the database.
 */
import { FUNDING_METHODS } from '../../formula/src/index.ts'
import type { FieldName, FieldValues } from './types.ts'

export type FieldKind = 'text' | 'currency' | 'money' | 'rate' | 'date' | 'enum'

export const DELIVERY_METHODS = [
  'bank_deposit',
  'cash_pickup',
  'mobile_wallet',
  'upi',
  'debit_card',
  'home_delivery',
] as const satisfies readonly FieldValues['delivery_method'][]

export interface FieldSpec {
  kind: FieldKind
  /** Shown to the model in the JSON schema, and a reminder for anyone writing extractors. */
  description: string
  /** For money: whether zero is a real value (a fee of 0) or a misread (amount sent of 0). */
  zeroAllowed?: boolean
  values?: readonly string[]
}

export const FIELD_SPECS: { [K in FieldName]: FieldSpec } = {
  provider: {
    kind: 'text',
    description: 'The money transfer company or bank that issued the receipt, e.g. "Western Union".',
  },
  send_currency: {
    kind: 'currency',
    description: 'ISO 4217 code of the currency the sender paid in, e.g. "USD".',
  },
  receive_currency: {
    kind: 'currency',
    description: 'ISO 4217 code of the currency the recipient gets, e.g. "MXN".',
  },
  amount_sent: {
    kind: 'money',
    description:
      'The transfer amount in the sending currency, before any fee or tax is added (often labeled "Transfer Amount"). Not the total paid.',
  },
  fee: {
    kind: 'money',
    zeroAllowed: true,
    description: 'The provider\'s upfront fee in the sending currency (often "Transfer Fees"). 0 if the receipt says there was no fee.',
  },
  tax: {
    kind: 'money',
    zeroAllowed: true,
    description: 'Tax collected with the transfer in the sending currency (often "Transfer Taxes"). 0 if the receipt shows none.',
  },
  total_paid: {
    kind: 'money',
    description: 'Everything the sender paid in the sending currency, as printed (often "Total").',
  },
  exchange_rate: {
    kind: 'rate',
    description:
      'The exchange rate as units of the receiving currency per 1 unit of the sending currency. If the receipt prints it the other way round, invert it.',
  },
  amount_received: {
    kind: 'money',
    description: 'What the recipient gets in the receiving currency (often "Total to Recipient").',
  },
  pickup_charge: {
    kind: 'money',
    zeroAllowed: true,
    description: 'Fees charged to the recipient in the receiving currency (often "Other Fees"). 0 if none.',
  },
  transfer_date: {
    kind: 'date',
    description: 'The date the transfer was made, as YYYY-MM-DD.',
  },
  funding_method: {
    kind: 'enum',
    values: FUNDING_METHODS,
    description:
      'How the sender paid: bank_account, debit_card, credit_card, cash, money_order or cashiers_check.',
  },
  delivery_method: {
    kind: 'enum',
    values: DELIVERY_METHODS,
    description:
      'How the money reaches the recipient: bank_deposit, cash_pickup, mobile_wallet, upi, debit_card or home_delivery.',
  },
}

const EARLIEST_DATE = '2000-01-01'

export type Checked<K extends FieldName> = { ok: true; value: FieldValues[K] } | { ok: false; error: string }

/**
 * Whether `value` is a valid value for the field, and the value normalized (currency codes
 * upper-cased, text trimmed). `today` (YYYY-MM-DD) rejects dates in the future.
 */
export function checkValue<K extends FieldName>(name: K, value: unknown, today: string): Checked<K> {
  const spec = FIELD_SPECS[name]
  const ok = (v: unknown) => ({ ok: true, value: v as FieldValues[K] }) as const
  const bad = (error: string) => ({ ok: false, error: `${name}: ${error}` }) as const
  switch (spec.kind) {
    case 'text': {
      if (typeof value !== 'string') return bad('not text')
      const t = value.trim().replace(/\s+/g, ' ')
      if (!t || t.length > 80) return bad('empty or too long')
      return ok(t)
    }
    case 'currency': {
      if (typeof value !== 'string') return bad('not text')
      const c = value.trim().toUpperCase()
      return /^[A-Z]{3}$/.test(c) ? ok(c) : bad('not a three-letter currency code')
    }
    case 'money': {
      if (typeof value !== 'number' || !Number.isFinite(value)) return bad('not a number')
      if (value < 0) return bad('negative')
      if (value === 0 && !spec.zeroAllowed) return bad('zero')
      return ok(value)
    }
    case 'rate': {
      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return bad('not a positive number')
      return ok(value)
    }
    case 'date': {
      if (typeof value !== 'string' || !isRealDate(value)) return bad('not a date as YYYY-MM-DD')
      if (value < EARLIEST_DATE || value > today) return bad('outside 2000 to today')
      return ok(value)
    }
    case 'enum': {
      return typeof value === 'string' && spec.values!.includes(value) ? ok(value) : bad('not one of the allowed values')
    }
  }
}

function isRealDate(s: string): boolean {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return false
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
  return d.getUTCFullYear() === Number(m[1]) && d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3])
}

/** How a value is stored in `receipt_fields.value` (text): numbers in plain decimal. */
export function serializeValue(value: FieldValues[FieldName]): string {
  return typeof value === 'number' ? String(value) : value
}

/** The reverse of serializeValue, checked. */
export function deserializeValue<K extends FieldName>(name: K, text: string, today: string): Checked<K> {
  const kind = FIELD_SPECS[name].kind
  const raw = kind === 'money' || kind === 'rate' ? Number(text) : text
  return checkValue(name, raw, today)
}
