import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { ANDROID_SYMBOLS } from '@/components/icon';

jest.mock('expo-symbols', () => ({ SymbolView: () => null }));

/** Every SF Symbol name the app's source hands to an icon, as a literal. */
function iconNamesInSource(dir: string): Set<string> {
  const names = new Set<string>();
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry !== '__tests__') iconNamesInSource(path).forEach((n) => names.add(n));
      continue;
    }
    if (!/\.tsx?$/.test(entry)) continue;
    const src = readFileSync(path, 'utf8');
    for (const m of src.matchAll(/<Icon[^>]*?\bname="([a-z0-9.]+)"/g)) names.add(m[1]);
    for (const m of src.matchAll(/\b(?:icon|trailingIcon)="([a-z0-9.]+)"/g)) names.add(m[1]);
    // Chosen in a ternary, on a line that hands it to an icon: name={a ? 'x' : 'y'}.
    for (const line of src.split('\n')) {
      if (!/name=\{|SFSymbol/.test(line)) continue;
      for (const m of line.matchAll(/\?\s*'([a-z0-9.]+)'\s*:\s*(?:[^'?]*\?\s*'([a-z0-9.]+)'\s*:\s*)?'([a-z0-9.]+)'/g)) {
        m.slice(1).filter(Boolean).forEach((n) => names.add(n));
      }
    }
  }
  return names;
}

test('every icon the app draws has an Android equivalent', () => {
  const names = iconNamesInSource(join(__dirname, '..'));
  expect(names.size).toBeGreaterThan(20);
  const missing = [...names].filter((n) => !(n in ANDROID_SYMBOLS));
  expect(missing).toEqual([]);
});
