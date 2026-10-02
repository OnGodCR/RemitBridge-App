/**
 * Learn's progress (DECISIONS.md D107): opening a lesson counts it, a module is complete
 * when every lesson has been read, and Continue goes to the first unread lesson in order.
 */
import { MODULES } from '@/data/modules';
import { markLearned, moduleProgress, nextStep, recordLesson, resetLearned, shownStats } from '@/lib/learn-progress';

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

describe('XP and the day streak (D136)', () => {
  it('adds XP, starts a streak, keeps it the same day and grows it the next', () => {
    expect(recordLesson(40, '2026-10-01')).toMatchObject({ xp: 40, streak: 1, lessons: 1 });
    expect(recordLesson(10, '2026-10-01')).toMatchObject({ xp: 50, streak: 1, lessons: 2 });
    expect(recordLesson(20, '2026-10-02')).toMatchObject({ xp: 70, streak: 2 });
    expect(recordLesson(5, '2026-10-03')).toMatchObject({ streak: 3 });
  });

  it('starts over after a missed day, and shows a lapsed streak as 0', () => {
    const s = recordLesson(10, '2026-10-01');
    expect(shownStats(s, '2026-10-02').streak).toBe(1);
    expect(shownStats(s, '2026-10-03').streak).toBe(0);
    expect(recordLesson(10, '2026-10-05').streak).toBe(1);
  });

  it('crosses a month and a year by the calendar', () => {
    recordLesson(10, '2026-12-31');
    expect(recordLesson(10, '2027-01-01').streak).toBe(2);
  });
});
