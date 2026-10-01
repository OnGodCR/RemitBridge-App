/**
 * Learn's progress (DECISIONS.md D107): opening a lesson counts it, a module is complete
 * when every lesson has been read, and Continue goes to the first unread lesson in order.
 */
import { MODULES } from '@/data/modules';
import { markLearned, moduleProgress, nextStep, resetLearned } from '@/lib/learn-progress';

jest.mock('expo-sqlite/localStorage/install', () => {
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  return {};
});

beforeEach(() => resetLearned());

it('starts at the first lesson of the first module', () => {
  expect(nextStep(new Set())).toEqual({ module: MODULES[0], termId: MODULES[0].terms[0] });
});

it('moves on lesson by lesson, then module by module', () => {
  const done = new Set(MODULES[0].terms);
  expect(moduleProgress(MODULES[0], done).complete).toBe(true);
  expect(nextStep(done)).toEqual({ module: MODULES[1], termId: MODULES[1].terms[0] });
});

it('skips back to an earlier module someone left unfinished', () => {
  const done = new Set([...MODULES[0].terms.slice(1), ...MODULES[1].terms]);
  expect(nextStep(done)).toEqual({ module: MODULES[0], termId: MODULES[0].terms[0] });
});

it('says there is nothing left once every term is read', () => {
  expect(nextStep(new Set(MODULES.flatMap((m) => m.terms)))).toBeNull();
});

it('keeps what was learned across a reload', () => {
  markLearned(MODULES[0].terms[0]);
  expect(JSON.parse(localStorage.getItem('rb.learned')!)).toEqual([MODULES[0].terms[0]]);
});
