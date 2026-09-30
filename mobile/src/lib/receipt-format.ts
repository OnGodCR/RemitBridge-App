import { FIELD_SPECS, type FieldName, type FieldValues } from '@remitbridge/receipt';

import type { Language, Strings } from '@/i18n';
import { money } from '@/lib/format';
import { formatDay } from '@/lib/fx';

/**
 * Showing and typing receipt values (Phase 3): amounts with their currency, dates as the
 * person would read them, methods in their language. Parsing here only turns what the
 * person typed into a value; checkValue (packages/receipt) decides whether it's valid.
 */

type Values = Partial<FieldValues>;

/** The currency a money field is in: receiving for what arrives, sending for the rest. */
export function currencyOf(name: FieldName, v: Values): string | undefined {
  return name === 'amount_received' || name === 'pickup_charge' ? v.receive_currency : v.send_currency;
}

export function formatValue(name: FieldName, value: unknown, v: Values, strings: Strings): string {
  if (name === 'funding_method') return strings.funding[value as keyof Strings['funding']] ?? String(value);
  if (name === 'delivery_method') return strings.delivery[value as keyof Strings['delivery']] ?? String(value);
  if (name === 'transfer_date' && typeof value === 'string') return formatDay(value);
  if (name === 'exchange_rate' && typeof value === 'number') return value.toLocaleString('en-US', { maximumFractionDigits: 6 });
  if (FIELD_SPECS[name].kind === 'money' && typeof value === 'number') {
    const currency = currencyOf(name, v);
    return currency && /^[A-Z]{3}$/.test(currency) ? money(value, currency) : value.toLocaleString('en-US');
  }
  return String(value);
}

/** A funding method inside a sentence: "paid by cash", "paid by money order". */
export function fundingWord(funding: string, strings: Strings, language: Language): string {
  const label = strings.funding[funding as keyof Strings['funding']] ?? funding;
  return language === 'en' ? label.toLowerCase() : label;
}

/** What the person typed, as the value checkValue expects; undefined if it can't be read. */
export function parseTyped(name: FieldName, text: string): unknown {
  const kind = FIELD_SPECS[name].kind;
  const t = text.trim();
  if (kind === 'money' || kind === 'rate') {
    const n = Number(t.replace(/[,\s]/g, ''));
    return t && Number.isFinite(n) ? n : undefined;
  }
  if (kind === 'currency') return t.toUpperCase();
  if (kind === 'date') return usDate(t);
  return t;
}

/** "9/28/2026" or "09/28/2026" to "2026-09-28"; undefined if it isn't a real date. */
export function usDate(text: string): string | undefined {
  const m = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return undefined;
  const d = new Date(Date.UTC(Number(m[3]), Number(m[1]) - 1, Number(m[2])));
  if (d.getUTCMonth() !== Number(m[1]) - 1 || d.getUTCDate() !== Number(m[2])) return undefined;
  return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
}

/** A value as the edit field shows it before the person changes it. */
export function editText(name: FieldName, value: unknown): string {
  if (value === undefined || value === null) return '';
  if (name === 'transfer_date' && typeof value === 'string') {
    const [y, m, d] = value.split('-');
    return `${Number(m)}/${Number(d)}/${y}`;
  }
  return String(value);
}
