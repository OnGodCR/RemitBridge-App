/**
 * The receipt scanner's strings (added to the app's catalogue under D69): every language
 * has every key, each text function gives text in every language, nothing is left empty,
 * and the house style holds (no em dashes, no "Best deal").
 */
import { en } from '@/i18n/en';
import { es } from '@/i18n/es';
import { hi } from '@/i18n/hi';
import { tl } from '@/i18n/tl';
import { vi } from '@/i18n/vi';

const LANGS = { en, es, hi, tl, vi } as const;
const GROUPS = ['scan', 'confirm', 'result', 'receiptFields', 'receiptPaths', 'funding'] as const;

type Tree = { [key: string]: unknown };

/** Every leaf as text: strings as they are, functions called with sample values, lists item by item. */
function leaves(tree: Tree, path: string): [string, string][] {
  return Object.entries(tree).flatMap(([k, v]): [string, string][] => {
    const p = `${path}.${k}`;
    if (typeof v === 'string') return [[p, v]];
    if (typeof v === 'function') return [[p, String((v as (...a: unknown[]) => unknown)(2, '$1.00', '$2.00', '$3.00', '1 USD = 17 MXN'))]];
    if (Array.isArray(v)) return v.map((s, i): [string, string] => [`${p}[${i}]`, String(s)]);
    return leaves(v as Tree, p);
  });
}

describe.each(GROUPS)('%s', (group) => {
  const english = new Map(leaves(en[group] as Tree, group));

  it.each(Object.keys(LANGS))('in %s: has every key, all filled in', (code) => {
    const got = new Map(leaves(LANGS[code as keyof typeof LANGS][group] as Tree, group));
    expect([...got.keys()].sort()).toEqual([...english.keys()].sort());
    for (const [k, v] of got) expect(`${k}: ${v.trim()}`).not.toBe(`${k}: `);
  });

  it('keeps the house style in every language', () => {
    for (const lang of Object.values(LANGS)) {
      for (const [k, v] of leaves(lang[group] as Tree, group)) {
        expect(`${k}: ${v}`).not.toContain('—');
        expect(`${k}: ${v}`).not.toMatch(/best deal/i);
      }
    }
  });
});

it('has labels for the two new payment methods in every language', () => {
  for (const lang of Object.values(LANGS)) {
    expect(lang.payment.money_order).toBeTruthy();
    expect(lang.payment.cashiers_check).toBeTruthy();
  }
});

it('uses the product’s words in English', () => {
  expect(en.receiptFields.exchange_rate).toBe('Exchange rate');
  expect(en.receiptFields.amount_received).toBe('Amount received');
  expect(en.scan.covered(1)).toBe('One item covered');
  expect(en.scan.covered(3)).toBe('3 items covered');
});
