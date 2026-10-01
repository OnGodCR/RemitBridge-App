/**
 * Learn's modules (DECISIONS.md D104) hold the same words as the glossary: every term in
 * exactly one module, none missing, none made up. And every module is named in every
 * language.
 */
import { TERMS } from '@/data/glossary';
import { MODULES, moduleTerms } from '@/data/modules';
import { en } from '@/i18n/en';
import { es } from '@/i18n/es';
import { hi } from '@/i18n/hi';
import { tl } from '@/i18n/tl';
import { vi } from '@/i18n/vi';

it('puts every glossary term in exactly one module', () => {
  const placed = MODULES.flatMap((m) => m.terms);
  expect(placed.length).toBe(new Set(placed).size);
  expect([...placed].sort()).toEqual(TERMS.map((t) => t.id).sort());
});

it('finds every term a module names', () => {
  for (const m of MODULES) expect(moduleTerms(m)).toHaveLength(m.terms.length);
});

it('names every module in every language', () => {
  for (const lang of [en, es, hi, tl, vi]) {
    for (const m of MODULES) {
      expect(lang.learn.modules[m.id].title.trim()).not.toBe('');
      expect(lang.learn.modules[m.id].line.trim()).not.toBe('');
      expect(lang.learn.modules[m.id].line).not.toContain('—');
    }
    expect(lang.learn.terms(1)).not.toBe(lang.learn.terms(2));
  }
});
