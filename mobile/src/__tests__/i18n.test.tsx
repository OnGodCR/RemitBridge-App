/**
 * The string catalogue (D72): Hindi has every English key, nothing is left empty, and each
 * string has the same {placeholders} in both languages, so fill() never shows a raw one.
 */
import { act, renderHook } from '@testing-library/react-native';

import { fill, setLanguage, useStrings } from '@/i18n';
import { en } from '@/i18n/en';
import { hi } from '@/i18n/hi';
import { prefs } from '@/lib/prefs';

jest.mock('@/lib/prefs', () => {
  const store: Record<string, string> = {};
  return {
    prefs: {
      language: () => store.language ?? null,
      setLanguage: (l: string) => {
        store.language = l;
      },
      stored: store,
    },
  };
});

type Tree = { [key: string]: string | readonly string[] | Tree };

function leaves(tree: Tree, path = ''): [string, string][] {
  return Object.entries(tree).flatMap(([k, v]) => {
    const p = path ? `${path}.${k}` : k;
    if (typeof v === 'string') return [[p, v] as [string, string]];
    if (Array.isArray(v)) return v.map((s, i) => [`${p}[${i}]`, s] as [string, string]);
    return leaves(v as Tree, p);
  });
}

const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();

describe('the catalogue', () => {
  const english = new Map(leaves(en as unknown as Tree));
  const hindi = new Map(leaves(hi as unknown as Tree));

  it('has the same keys in both languages', () => {
    expect([...hindi.keys()].sort()).toEqual([...english.keys()].sort());
  });

  it('leaves nothing empty', () => {
    for (const [k, v] of [...english, ...hindi]) expect(`${k}: ${v.trim()}`).not.toBe(`${k}: `);
  });

  it('uses the same placeholders in both languages', () => {
    for (const [k, v] of english) expect(placeholders(hindi.get(k)!)).toEqual(placeholders(v));
  });

  it('is written in Hindi, apart from names and codes', () => {
    const devanagari = [...hindi.entries()].filter(([, v]) => /[ऀ-ॿ]/.test(v));
    expect(devanagari.length).toBeGreaterThan(hindi.size * 0.8);
  });

  it('uses the product’s words in English', () => {
    expect(en.fields.exchange_rate).toBe('Exchange rate');
    expect(en.fields.amount_received).toBe('Amount received');
    expect(JSON.stringify(en)).not.toMatch(/best deal/i);
  });
});

describe('language', () => {
  afterEach(() => act(() => setLanguage('en')));

  it('starts in English, switches to Hindi, and remembers it', () => {
    const { result } = renderHook(() => useStrings());
    expect(result.current.scan.send).toBe('Read my receipt');
    act(() => setLanguage('hi'));
    expect(result.current.scan.send).toBe('मेरी रसीद पढ़ें');
    expect((prefs as unknown as { stored: Record<string, string> }).stored.language).toBe('hi');
  });

  it('fills placeholders and leaves unknown ones alone', () => {
    expect(fill('{read} of {total} values read.', { read: 9, total: 13 })).toBe('9 of 13 values read.');
    expect(fill('{count} items', {})).toBe('{count} items');
  });
});
