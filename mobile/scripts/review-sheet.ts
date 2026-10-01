/**
 * Rebuilds the table in a translation review sheet (docs/translation-review/<code>.md,
 * DECISIONS.md D69) from the app's string files, so the sheet always matches the app.
 * Only the table is replaced: the reviewer instructions above it and the notes below it
 * are kept as written.
 *
 *   npx tsx scripts/review-sheet.ts hi
 *
 * Each row is one string: its key, the English, and the draft. Strings that take values
 * (a number, a name) are shown with the value's name in braces, as the sheet explains:
 * "{pct}", "{provider}".
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { en } from '../src/i18n/en';
import { es } from '../src/i18n/es';
import { hi } from '../src/i18n/hi';
import { tl } from '../src/i18n/tl';
import { vi } from '../src/i18n/vi';

const DRAFTS = { es, hi, tl, vi } as const;
type Code = keyof typeof DRAFTS;

const code = (process.argv[2] ?? 'hi') as Code;
if (!(code in DRAFTS)) throw new Error(`no draft called "${code}"; try one of ${Object.keys(DRAFTS).join(', ')}`);
const sheet = join(__dirname, '..', '..', 'docs', 'translation-review', `${code}.md`);

/** A function's parameter names, from its source: "(pct, world) => ..." gives pct, world. */
function params(fn: (...a: unknown[]) => unknown): string[] {
  const src = fn.toString();
  const list = /^\s*(?:function\s*\w*\s*)?\(([^)]*)\)/.exec(src)?.[1] ?? /^\s*(\w+)\s*=>/.exec(src)?.[1] ?? '';
  return list
    .split(',')
    .map((p) => p.replace(/[:=].*$/s, '').trim())
    .filter(Boolean);
}

/** Every leaf of a string tree as [key, text]. */
function leaves(tree: unknown, path: string): [string, string][] {
  if (typeof tree === 'string') return [[path, tree]];
  if (typeof tree === 'function') {
    const f = tree as (...a: unknown[]) => unknown;
    return [[path, String(f(...params(f).map((p) => `{${p}}`)))]];
  }
  // Counted from 1 for the reviewer, as the sheet always has.
  if (Array.isArray(tree)) return tree.flatMap((v, i) => leaves(v, `${path}[${i + 1}]`));
  if (tree && typeof tree === 'object') {
    return Object.entries(tree).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));
  }
  return [];
}

const cell = (s: string) => s.replace(/\s*\n\s*/g, ' ').replace(/\|/g, '\\|');

const draft = new Map(leaves(DRAFTS[code], ''));
const rows = leaves(en, '').map(([key, text]) => `| ${key} | ${cell(text)} | ${cell(draft.get(key) ?? '(missing)')} | |`);

const doc = readFileSync(sheet, 'utf8');
const lines = doc.split('\n');
const start = lines.findIndex((l) => l.startsWith('| Key |'));
if (start < 0) throw new Error(`${sheet} has no table to replace`);
let end = start + 2;
while (end < lines.length && lines[end].startsWith('|')) end++;
const next = [...lines.slice(0, start + 2), ...rows, ...lines.slice(end)].join('\n');
writeFileSync(sheet, next);
console.log(`${sheet}: ${rows.length} strings`);
