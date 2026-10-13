import { computeTransferCost, type TransferInput } from '@remitbridge/formula';

import { moduleTerms, type Module } from '@/data/modules';
import type { Term } from '@/data/glossary';
import { lessonWords, type Random, XP_FIRST_TRY, XP_RETRY } from '@/lib/lesson';

export type GameMode = 'match' | 'quick' | 'cost' | 'receipt' | 'safety' | 'final';
export type ReceiptField = 'fee' | 'rate' | 'received';
export type SafetyId = 'stranger' | 'urgent' | 'code' | 'idCheck';
export type SafetyChoice = 'moveMoney' | 'pressure' | 'shareCode' | 'unknown';
export const SAFETY: Record<SafetyId, { answer: SafetyChoice; term: string }> = {
  stranger: { answer: 'moveMoney', term: 'money-mule' },
  urgent: { answer: 'pressure', term: 'money-mule' },
  code: { answer: 'shareCode', term: 'kyc' },
  idCheck: { answer: 'unknown', term: 'kyc' },
};

export interface ExampleTransfer {
  input: TransferInput;
  cost: ReturnType<typeof computeTransferCost>;
}
export function exampleTransfer(input: TransferInput): ExampleTransfer {
  return { input, cost: computeTransferCost(input) };
}
/** Fictional USD to MXN examples, never provider quotes. Both spend the same total budget. */
export function comparison(random: Random): [ExampleTransfer, ExampleTransfer] {
  const sent = [100, 200, 300][Math.floor(random() * 3)];
  const examples = [
    exampleTransfer({ sent, fee: 0, midRate: 20, quotedRate: 18 }),
    exampleTransfer({ sent, fee: 5, midRate: 20, quotedRate: 19.8 }),
  ];
  return shuffle(examples, random) as [ExampleTransfer, ExampleTransfer];
}
/** Compare displayed cents, so equal displayed amounts always accept the tie. */
export function costAnswer(examples: [ExampleTransfer, ExampleTransfer]): 'a' | 'b' | 'tie' {
  const [a, b] = examples.map((x) => Math.round(x.cost.amountReceived * 100));
  return a === b ? 'tie' : a > b ? 'a' : 'b';
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

export function shuffle<T>(items: readonly T[], random: Random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function modesFor(m: Module): GameMode[] {
  return [
    'match',
    'quick',
    ...(m.id === 'cost' ? (['cost', 'receipt'] as const) : []),
    ...(m.id === 'basics' ? (['receipt'] as const) : []),
    ...(m.id === 'safety' ? (['safety'] as const) : []),
    'final',
  ];
}
export function recommendedMode(m: Module, learned: Set<string>): GameMode {
  const read = m.terms.filter((id) => learned.has(id)).length;
  if (read === m.terms.length) return 'final';
  const modes = modesFor(m).filter((mode) => mode !== 'final');
  return modes[Math.floor(read / 5) % modes.length];
}

function matches(words: Term[], random: Random): GameStep[] {
  const steps: GameStep[] = [];
  // Three pairs fit ordinary phones and large text without a dense grid.
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
  const selection = lessonWords(m, learned, random);
  const words = mode === 'final' ? moduleTerms(m) : selection.words;
  const practice = words.every((t) => learned.has(t.id));
  const teaching: GameStep[] = words.filter((t) => !learned.has(t.id)).map((term) => ({ kind: 'teach', term }));
  let questions: GameStep[] = [];
  if (mode === 'match') questions = matches(words, random);
  else if (mode === 'quick') questions = quick(words, m, random);
  else if (mode === 'final') {
    // Every module term gets tested, with both recall formats and the module's applied games.
    questions = [
      ...matches(
        words.filter((_, i) => i % 2 === 0),
        random,
      ),
      ...quick(
        words.filter((_, i) => i % 2 !== 0),
        m,
        random,
      ),
    ];
  } else questions = matches(words, random);
  const include = (kind: GameMode) => mode === kind || (mode === 'final' && modesFor(m).includes(kind));
  if (include('cost')) for (let i = 0; i < 3; i++) questions.push({ kind: 'cost', examples: comparison(random) });
  if (include('receipt')) {
    const example = comparison(random)[0];
    for (const field of shuffle<ReceiptField>(['fee', 'rate', 'received'], random))
      questions.push({ kind: 'receipt', example, field });
  }
  if (include('safety')) {
    for (const scenario of shuffle(Object.keys(SAFETY) as SafetyId[], random))
      questions.push({ kind: 'safety', scenario });
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
export function rightChoice(step: Exclude<GameQuestion, { kind: 'match' }>): string {
  switch (step.kind) {
    case 'quick':
      return step.correct;
    case 'cost':
      return costAnswer(step.examples);
    case 'receipt':
      return step.field;
    case 'safety':
      return SAFETY[step.scenario].answer;
  }
}
export type GameAction = { type: 'answer'; choice: string; termId?: string } | { type: 'next' };
export function gameReducer(state: GameState, action: GameAction): GameState {
  const step = state.steps[state.index];
  if (!step) return state;
  if (action.type === 'next') {
    if (step.kind !== 'teach' && !state.answer) return state;
    if (step.kind === 'match') {
      const matched = state.answer?.correct ? [...state.matched, state.answer.termId!] : state.matched;
      if (matched.length < step.terms.length) return { ...state, matched, answer: null };
    }
    return { ...state, index: state.index + 1, answer: null, matched: [], missed: [] };
  }
  if (step.kind === 'teach' || state.answer) return state;
  let correct: boolean;
  let retry: boolean;
  let earnedTerms: string[] = [];
  if (step.kind === 'match') {
    if (
      !step.terms.some((t) => t.id === action.termId) ||
      !step.meanings.some((t) => t.id === action.choice) ||
      state.matched.includes(action.termId!) ||
      state.matched.includes(action.choice)
    )
      return state;
    correct = action.termId === action.choice;
    retry = state.missed.includes(action.termId!);
    if (correct) earnedTerms = [action.termId!];
  } else {
    const allowed =
      step.kind === 'quick'
        ? ['true', 'false']
        : step.kind === 'cost'
          ? ['a', 'b', 'tie']
          : step.kind === 'receipt'
            ? ['fee', 'rate', 'received']
            : ['moveMoney', 'pressure', 'shareCode', 'unknown'];
    if (!allowed.includes(action.choice)) return state;
    correct = action.choice === rightChoice(step);
    retry = !!step.retry;
    // Applied questions award XP only: they don't prove every glossary word was learned.
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
    missed: step.kind === 'match' && !correct ? [...new Set([...state.missed, action.termId!])] : state.missed,
    steps: !correct && !retry && step.kind !== 'match' ? [...state.steps, { ...step, retry: true }] : state.steps,
  };
}
export const gameDone = (state: GameState) => state.index >= state.steps.length;
export const gameAccuracy = (state: GameState) =>
  state.questions ? Math.round((state.firstTryRight / state.questions) * 100) : 100;
