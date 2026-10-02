import { TERMS, type Term } from '@/data/glossary';
import { moduleTerms, type Module } from '@/data/modules';

/**
 * A Learn lesson (DECISIONS.md D136), Duolingo's shape: up to five words a lesson, each one
 * met on a card and then tested straight away (which word matches this definition?), then a
 * review round the other way round (what does this word mean?). A missed question comes back
 * at the end, once. Correct first time is worth 10 XP, after a miss 5.
 *
 * Pure: the screen (app/lesson/[id].tsx) keeps a LessonState with useReducer and draws it.
 */
export const WORDS_PER_LESSON = 5;
export const XP_FIRST_TRY = 10;
export const XP_RETRY = 5;

export type Step =
  | { kind: 'teach'; term: Term }
  /** The definition is shown; pick the word. */
  | { kind: 'pickTerm'; term: Term; options: Term[]; retry?: boolean }
  /** The word is shown; pick its definition. */
  | { kind: 'pickMeaning'; term: Term; options: Term[]; retry?: boolean };

export type Question = Extract<Step, { kind: 'pickTerm' | 'pickMeaning' }>;

/** A seedable random source, so tests can pin the order. */
export type Random = () => number;

function shuffle<T>(xs: T[], random: Random): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** A definition's first sentence: enough to recognize, short enough to tap. */
export function firstSentence(plain: string): string {
  const m = plain.match(/^.*?[.!?](?=\s|$)/);
  return (m ? m[0] : plain).trim();
}

/**
 * The words a lesson teaches: the module's unlearned ones in order, up to five; or, once the
 * module is done, five of its words at random, for practice.
 */
export function lessonWords(m: Module, learned: Set<string>, random: Random = Math.random): { words: Term[]; practice: boolean } {
  const all = moduleTerms(m);
  const fresh = all.filter((t) => !learned.has(t.id));
  if (fresh.length) return { words: fresh.slice(0, WORDS_PER_LESSON), practice: false };
  return { words: shuffle(all, random).slice(0, WORDS_PER_LESSON), practice: true };
}

/**
 * Wrong answers for a question: other words from the same module first (they're the ones
 * that are easy to mix up), then from anywhere, never one that shares the right answer's
 * name or first sentence.
 */
function distractors(target: Term, m: Module, count: number, random: Random): Term[] {
  const same = (a: Term, b: Term) => a.term === b.term || firstSentence(a.plain) === firstSentence(b.plain);
  const near = shuffle(moduleTerms(m).filter((t) => t.id !== target.id && !same(t, target)), random);
  const far = shuffle(TERMS.filter((t) => !m.terms.includes(t.id) && !same(t, target)), random);
  return [...near, ...far].slice(0, count);
}

/**
 * The lesson's steps: for each word, its card then a pick-the-word question (four choices);
 * then, for every word again in a new order, a pick-the-meaning question (three choices, as
 * definitions are longer). Practice skips the cards.
 */
export function buildLesson(m: Module, words: Term[], practice: boolean, random: Random = Math.random): Step[] {
  const steps: Step[] = [];
  for (const term of words) {
    if (!practice) steps.push({ kind: 'teach', term });
    steps.push({ kind: 'pickTerm', term, options: shuffle([term, ...distractors(term, m, 3, random)], random) });
  }
  for (const term of shuffle(words, random)) {
    steps.push({ kind: 'pickMeaning', term, options: shuffle([term, ...distractors(term, m, 2, random)], random) });
  }
  return steps;
}

export interface LessonState {
  steps: Step[];
  index: number;
  /** The answer to the current question, once given. */
  answer: { choice: string; correct: boolean } | null;
  xp: number;
  /** Questions answered right the first time, and questions asked the first time. */
  firstTryRight: number;
  questions: number;
  combo: number;
  bestCombo: number;
  /** Words answered right at least once: these count as learned. */
  learned: string[];
}

export function startLesson(steps: Step[]): LessonState {
  return {
    steps,
    index: 0,
    answer: null,
    xp: 0,
    firstTryRight: 0,
    questions: steps.filter((s) => s.kind !== 'teach').length,
    combo: 0,
    bestCombo: 0,
    learned: [],
  };
}

export type LessonAction = { type: 'answer'; choice: string } | { type: 'next' };

export function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  const step = state.steps[state.index];
  if (!step) return state;
  if (action.type === 'answer') {
    if (step.kind === 'teach' || state.answer) return state;
    const correct = action.choice === step.term.id;
    const retry = !!step.retry;
    const combo = correct ? state.combo + 1 : 0;
    return {
      ...state,
      answer: { choice: action.choice, correct },
      xp: state.xp + (correct ? (retry ? XP_RETRY : XP_FIRST_TRY) : 0),
      firstTryRight: state.firstTryRight + (correct && !retry ? 1 : 0),
      combo,
      bestCombo: Math.max(state.bestCombo, combo),
      learned: correct && !state.learned.includes(step.term.id) ? [...state.learned, step.term.id] : state.learned,
      // A miss comes back once, at the end, with its choices in a new order.
      steps:
        !correct && !retry
          ? [...state.steps, { ...step, retry: true, options: [...step.options].reverse() }]
          : state.steps,
    };
  }
  // 'next': a card moves on at once; a question only once it's answered.
  if (step.kind !== 'teach' && !state.answer) return state;
  return { ...state, index: state.index + 1, answer: null };
}

export function lessonDone(state: LessonState): boolean {
  return state.index >= state.steps.length;
}

/** Share of first-time questions answered right, 0 to 100. */
export function accuracy(state: LessonState): number {
  return state.questions ? Math.round((100 * state.firstTryRight) / state.questions) : 100;
}

/** How far through the lesson, 0 to 1, counting the retries added along the way. */
export function lessonProgress(state: LessonState): number {
  return state.steps.length ? Math.min(1, state.index / state.steps.length) : 1;
}
