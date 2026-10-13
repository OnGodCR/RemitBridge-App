import { computeTransferCost, type TransferInput } from '@remitbridge/formula';

import type { Term } from '@/data/glossary';
import { moduleTerms, type Module } from '@/data/modules';
import { lessonWords, type Random, XP_FIRST_TRY, XP_RETRY } from '@/lib/lesson';

/**
 * Learn's game modes (DECISIONS.md D172), Duolingo's shape: pick an answer, press Check, see
 * right or wrong in a sheet, Continue. Pure, like lib/lesson.ts: the screen
 * (app/lesson/[id].tsx) keeps a GameState with useReducer and draws it.
 */
export type GameMode = 'match' | 'quick' | 'cost' | 'receipt' | 'safety' | 'final';
export type ReceiptField = 'fee' | 'rate' | 'received';
export type SafetyChoice = 'flag' | 'fine' | 'unsure';
export type SafetyId = 'stranger' | 'urgent' | 'code' | 'fakeRate' | 'idCheck' | 'usual';

/** Each scenario's answer: most are red flags, one is fine, and an ID check alone proves nothing. */
export const SAFETY: Record<SafetyId, SafetyChoice> = {
  stranger: 'flag',
  urgent: 'flag',
  code: 'flag',
  fakeRate: 'flag',
  idCheck: 'unsure',
  usual: 'fine',
};
const SAFETY_ROUND = 4;

export interface ExampleTransfer {
  input: TransferInput;
  cost: ReturnType<typeof computeTransferCost>;
}

export function exampleTransfer(input: TransferInput): ExampleTransfer {
  return { input, cost: computeTransferCost(input) };
}

/**
 * Fictional USD to MXN pairs, never provider quotes. In some the zero-fee one wins, in some
 * the one with a fee does, so the lesson is to look at the rate, not a rule of thumb. None
 * tie at any of the amounts used.
 */
const PAIRS: [Pick<TransferInput, 'fee' | 'quotedRate'>, Pick<TransferInput, 'fee' | 'quotedRate'>][] = [
  [
    { fee: 0, quotedRate: 18 },
    { fee: 5, quotedRate: 19.8 },
  ],
  [
    { fee: 0, quotedRate: 19.7 },
    { fee: 8, quotedRate: 19.9 },
  ],
  [
    { fee: 3, quotedRate: 19.5 },
    { fee: 0, quotedRate: 18.6 },
  ],
];
const MID_RATE = 20;

export function comparison(random: Random): [ExampleTransfer, ExampleTransfer] {
  const sent = [100, 200, 300][Math.floor(random() * 3)];
  const pair = PAIRS[Math.floor(random() * PAIRS.length)];
  const examples = pair.map((p) => exampleTransfer({ sent, midRate: MID_RATE, ...p }));
  return shuffle(examples, random) as [ExampleTransfer, ExampleTransfer];
}

/** Which example leaves the family more, by displayed cents. */
export function costAnswer(examples: [ExampleTransfer, ExampleTransfer]): 'a' | 'b' {
  const [a, b] = examples.map((x) => Math.round(x.cost.amountReceived * 100));
  return a >= b ? 'a' : 'b';
}

interface QuestionBase {
  retry?: boolean;
}

export type GameStep =
  | { kind: 'teach'; term: Term }
  | { kind: 'match'; terms: Term[]; meanings: Term[] }
  | (QuestionBase & { kind: 'quick'; term: Term; meaning: Term; correct: 'true' | 'false' })
  | (QuestionBase & { kind: 'cost'; examples: [ExampleTransfer, ExampleTransfer] })
  | (QuestionBase & { kind: 'receipt'; example: ExampleTransfer; field: ReceiptField })
  | (QuestionBase & { kind: 'safety'; scenario: SafetyId });

export type GameQuestion = Exclude<GameStep, { kind: 'teach' }>;
export type ChoiceQuestion = Exclude<GameQuestion, { kind: 'match' }>;

export function shuffle<T>(items: readonly T[], random: Random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** The modes a module offers: the two word games, its applied game if it has one, the final round. */
export function modesFor(m: Module): GameMode[] {
  const applied: GameMode[] =
    m.id === 'cost' ? ['cost', 'receipt'] : m.id === 'basics' ? ['receipt'] : m.id === 'safety' ? ['safety'] : [];
  return ['match', 'quick', ...applied, 'final'];
}

/** What Start plays: the modes in turn as words are learned, then the final round. */
export function recommendedMode(m: Module, learned: Set<string>): GameMode {
  const read = m.terms.filter((id) => learned.has(id)).length;
  if (read === m.terms.length) return 'final';
  const modes = modesFor(m).filter((mode) => mode !== 'final');
  return modes[Math.floor(read / 5) % modes.length];
}

/** Boards of three pairs: they fit a small phone and large text. */
function matches(words: Term[], random: Random): GameStep[] {
  const steps: GameStep[] = [];
  for (let i = 0; i < words.length; i += 3) {
    const terms = words.slice(i, i + 3);
    steps.push({ kind: 'match', terms: shuffle(terms, random), meanings: shuffle(terms, random) });
  }
  return steps;
}

function quick(words: Term[], m: Module, random: Random): GameStep[] {
  return words.map((term) => {
    const others = moduleTerms(m).filter((t) => t.id !== term.id);
    const correct = random() < 0.5 || !others.length;
    return {
      kind: 'quick',
      term,
      meaning: correct ? term : others[Math.floor(random() * others.length)],
      correct: correct ? 'true' : 'false',
    };
  });
}

export function buildGame(m: Module, learned: Set<string>, requested?: string, random: Random = Math.random) {
  const mode = modesFor(m).find((x) => x === requested) ?? recommendedMode(m, learned);
  const words = mode === 'final' ? moduleTerms(m) : lessonWords(m, learned, random).words;
  const practice = words.every((t) => learned.has(t.id));
  const teaching: GameStep[] = words.filter((t) => !learned.has(t.id)).map((term) => ({ kind: 'teach', term }));
  let questions: GameStep[];
  if (mode === 'quick') questions = quick(words, m, random);
  else if (mode === 'final') {
    // Every word in the module, half matched and half true-or-false, plus the applied games.
    const even = words.filter((_, i) => i % 2 === 0);
    const odd = words.filter((_, i) => i % 2 !== 0);
    questions = [...matches(even, random), ...quick(odd, m, random)];
  } else questions = matches(words, random);
  const include = (kind: GameMode) => mode === kind || (mode === 'final' && modesFor(m).includes(kind));
  if (include('cost')) for (let i = 0; i < 3; i++) questions.push({ kind: 'cost', examples: comparison(random) });
  if (include('receipt')) {
    const example = comparison(random)[0];
    for (const field of shuffle<ReceiptField>(['fee', 'rate', 'received'], random)) {
      questions.push({ kind: 'receipt', example, field });
    }
  }
  if (include('safety')) {
    for (const scenario of shuffle(Object.keys(SAFETY) as SafetyId[], random).slice(0, SAFETY_ROUND)) {
      questions.push({ kind: 'safety', scenario });
    }
  }
  if (mode === 'final') questions = shuffle(questions, random);
  return { mode, practice, steps: [...teaching, ...questions] };
}

export interface GameAnswer {
  choice: string;
  termId?: string;
  correct: boolean;
  xp: number;
}

export interface GameState {
  steps: GameStep[];
  index: number;
  /** The last answer. On a match board it's the last pair tried; the board moves on by itself. */
  answer: GameAnswer | null;
  matched: string[];
  missed: string[];
  learned: string[];
  xp: number;
  combo: number;
  firstTryRight: number;
  questions: number;
}

export function startGame(steps: GameStep[]): GameState {
  return {
    steps,
    index: 0,
    answer: null,
    matched: [],
    missed: [],
    learned: [],
    xp: 0,
    combo: 0,
    firstTryRight: 0,
    questions: steps.reduce((n, s) => n + (s.kind === 'teach' ? 0 : s.kind === 'match' ? s.terms.length : 1), 0),
  };
}

export function rightChoice(step: ChoiceQuestion): string {
  switch (step.kind) {
    case 'quick':
      return step.correct;
    case 'cost':
      return costAnswer(step.examples);
    case 'receipt':
      return step.field;
    case 'safety':
      return SAFETY[step.scenario];
  }
}

const CHOICES: Record<ChoiceQuestion['kind'], string[]> = {
  quick: ['true', 'false'],
  cost: ['a', 'b'],
  receipt: ['fee', 'rate', 'received'],
  safety: ['flag', 'fine', 'unsure'],
};

/** A match board is finished once every pair on it is matched. */
export function boardDone(state: GameState): boolean {
  const step = state.steps[state.index];
  return step?.kind === 'match' && state.matched.length === step.terms.length;
}

export type GameAction = { type: 'answer'; choice: string; termId?: string } | { type: 'next' };

export function gameReducer(state: GameState, action: GameAction): GameState {
  const step = state.steps[state.index];
  if (!step) return state;
  if (action.type === 'next') {
    if (step.kind === 'match' ? !boardDone(state) : step.kind !== 'teach' && !state.answer) return state;
    return { ...state, index: state.index + 1, answer: null, matched: [], missed: [] };
  }
  if (step.kind === 'teach') return state;
  let correct: boolean;
  let retry: boolean;
  let earnedTerms: string[] = [];
  if (step.kind === 'match') {
    // Pairs are answered one after another on the same board; nothing waits for Continue.
    const termId = action.termId;
    if (
      !termId ||
      !step.terms.some((t) => t.id === termId) ||
      !step.meanings.some((t) => t.id === action.choice) ||
      state.matched.includes(termId) ||
      state.matched.includes(action.choice)
    ) {
      return state;
    }
    correct = termId === action.choice;
    retry = state.missed.includes(termId);
    if (correct) earnedTerms = [termId];
  } else {
    if (state.answer || !CHOICES[step.kind].includes(action.choice)) return state;
    correct = action.choice === rightChoice(step);
    retry = !!step.retry;
    // Applied questions earn XP only: they don't prove a particular glossary word was learned.
    if (correct && step.kind === 'quick') earnedTerms = [step.term.id];
  }
  const xp = correct ? (retry ? XP_RETRY : XP_FIRST_TRY) : 0;
  return {
    ...state,
    answer: { choice: action.choice, termId: action.termId, correct, xp },
    xp: state.xp + xp,
    combo: correct ? state.combo + 1 : 0,
    firstTryRight: state.firstTryRight + (correct && !retry ? 1 : 0),
    learned: [...new Set([...state.learned, ...earnedTerms])],
    matched: step.kind === 'match' && correct ? [...state.matched, action.termId!] : state.matched,
    missed: step.kind === 'match' && !correct ? [...new Set([...state.missed, action.termId!])] : state.missed,
    // A missed question comes back once at the end; a missed pair stays on its board.
    steps: !correct && !retry && step.kind !== 'match' ? [...state.steps, { ...step, retry: true }] : state.steps,
  };
}

export const gameDone = (state: GameState) => state.index >= state.steps.length;

export const gameAccuracy = (state: GameState) =>
  state.questions ? Math.round((state.firstTryRight / state.questions) * 100) : 100;
