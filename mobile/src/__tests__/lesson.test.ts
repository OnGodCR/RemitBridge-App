/**
 * Lessons (lib/lesson.ts, D136): what a lesson holds, the questions' choices, and the scoring:
 * XP, a miss coming back once at the end, accuracy, and which words count as learned.
 */
import { MODULES, moduleTerms } from '@/data/modules';
import {
  accuracy,
  buildLesson,
  firstSentence,
  lessonDone,
  lessonReducer,
  lessonWords,
  startLesson,
  WORDS_PER_LESSON,
  type LessonState,
  type Question,
} from '@/lib/lesson';

/** A fixed random source, so the order is the same every run. */
function seeded(seed = 7) {
  let a = seed;
  return () => {
    a = (a * 16807) % 2147483647;
    return a / 2147483647;
  };
}

const basics = MODULES[0];

it('takes the first five unlearned words, in order, or practices a finished module', () => {
  const { words, practice } = lessonWords(basics, new Set([basics.terms[0]]));
  expect(practice).toBe(false);
  expect(words.map((w) => w.id)).toEqual(basics.terms.slice(1, 1 + WORDS_PER_LESSON));
  const done = lessonWords(basics, new Set(basics.terms), seeded());
  expect(done.practice).toBe(true);
  expect(done.words).toHaveLength(WORDS_PER_LESSON);
});

it('meets each word on a card, asks about it at once, then reviews them all the other way', () => {
  const words = moduleTerms(basics).slice(0, 3);
  const steps = buildLesson(basics, words, false, seeded());
  expect(steps.map((s) => s.kind)).toEqual(['teach', 'pickTerm', 'teach', 'pickTerm', 'teach', 'pickTerm', 'pickMeaning', 'pickMeaning', 'pickMeaning']);
  expect(steps.filter((s) => s.kind === 'pickMeaning').map((s) => s.term.id).sort()).toEqual(words.map((w) => w.id).sort());
  // Practice skips the cards.
  expect(buildLesson(basics, words, true, seeded()).some((s) => s.kind === 'teach')).toBe(false);
});

it('offers distinct choices that include the answer, drawn from every module', () => {
  for (const m of MODULES) {
    for (const s of buildLesson(m, moduleTerms(m), false, seeded()).filter((x): x is Question => x.kind !== 'teach')) {
      const ids = s.options.map((o) => o.id);
      expect(ids).toContain(s.term.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toHaveLength(s.kind === 'pickTerm' ? 4 : 3);
      // No two choices that read the same.
      const labels = s.options.map((o) => (s.kind === 'pickTerm' ? o.term : firstSentence(o.plain)));
      expect(new Set(labels).size).toBe(labels.length);
    }
  }
});

it('cuts a definition to its first sentence', () => {
  expect(firstSentence('One thing. Then another.')).toBe('One thing.');
  expect(firstSentence('No full stop')).toBe('No full stop');
  expect(firstSentence('Costs 1.5 times more. Rarely.')).toBe('Costs 1.5 times more.');
});

function play(state: LessonState, rightAnswers: boolean[]): LessonState {
  let s = state;
  let i = 0;
  while (!lessonDone(s)) {
    const step = s.steps[s.index];
    if (step.kind !== 'teach') {
      const right = rightAnswers[i++] ?? true;
      const choice = right ? step.term.id : step.options.find((o) => o.id !== step.term.id)!.id;
      s = lessonReducer(s, { type: 'answer', choice });
    }
    s = lessonReducer(s, { type: 'next' });
  }
  return s;
}

it('scores 10 XP a question right the first time, and a full lesson right is 100%', () => {
  const words = moduleTerms(basics).slice(0, 2);
  const s = play(startLesson(buildLesson(basics, words, false, seeded())), []);
  expect(s.xp).toBe(40);
  expect(accuracy(s)).toBe(100);
  expect(s.learned.sort()).toEqual(words.map((w) => w.id).sort());
  expect(s.bestCombo).toBe(4);
});

it('brings a miss back once at the end, worth 5 XP when right, and counts it against accuracy', () => {
  const words = moduleTerms(basics).slice(0, 2);
  const start = startLesson(buildLesson(basics, words, false, seeded()));
  // Miss the first question, then get everything else right, the retry included.
  const s = play(start, [false]);
  expect(s.steps).toHaveLength(start.steps.length + 1);
  expect(s.steps[s.steps.length - 1]).toMatchObject({ retry: true });
  expect(s.xp).toBe(30 + 5);
  expect(accuracy(s)).toBe(75);
});

it('won’t move past a question until it’s answered, nor take a second answer', () => {
  const words = moduleTerms(basics).slice(0, 1);
  let s = startLesson(buildLesson(basics, words, true, seeded()));
  expect(lessonReducer(s, { type: 'next' })).toBe(s);
  const step = s.steps[0] as Question;
  s = lessonReducer(s, { type: 'answer', choice: step.term.id });
  expect(lessonReducer(s, { type: 'answer', choice: 'other' })).toBe(s);
});
