import { MODULES } from '@/data/modules';
import { readingFor, termsIn } from '@/lib/reading';

describe('the reading assignment after a module', () => {
  it.each(MODULES.map((m) => [m.id, m] as const))('%s: suggests a full post that uses its words', (_id, m) => {
    // Someone who has just finished this module and every one before it.
    const learned = new Set(MODULES.slice(0, MODULES.indexOf(m) + 1).flatMap((x) => x.terms));
    const picks = readingFor(m.terms, learned);
    expect(picks.length).toBeGreaterThan(0);
    for (const { post } of picks) {
      expect(post.body).not.toBeNull();
      expect(m.terms.some((id) => termsIn(post).has(id))).toBe(true);
    }
  });

  it('prefers posts whose words the person already knows', () => {
    const m = MODULES[0];
    const knowsAll = readingFor(m.terms, new Set(MODULES.flatMap((x) => x.terms)));
    const knowsOne = readingFor(m.terms, new Set([m.terms[0]]));
    expect(knowsAll[0].known).toBeGreaterThanOrEqual(knowsOne[0].known);
  });
});
