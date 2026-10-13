import { computeTransferCost } from '@remitbridge/formula';
import { MODULES, moduleTerms } from '@/data/modules';
import {
  boardDone,
  buildGame,
  comparison,
  costAnswer,
  gameAccuracy,
  gameDone,
  gameReducer,
  modesFor,
  recommendedMode,
  rightChoice,
  startGame,
  type GameStep,
} from '@/lib/learn-games';

const basics = MODULES[0];
const cost = MODULES[1];
function seeded(seed: number) {
  return () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
}
const answer = (state: ReturnType<typeof startGame>, choice: string, termId?: string) =>
  gameReducer(state, { type: 'answer', choice, termId });
const next = (state: ReturnType<typeof startGame>) => gameReducer(state, { type: 'next' });

it('makes reproducible plans without mutating saved progress or the glossary', () => {
  const learned = new Set([basics.terms[0]]);
  const before = JSON.stringify(MODULES);
  expect(buildGame(basics, learned, 'final', seeded(42))).toEqual(buildGame(basics, learned, 'final', seeded(42)));
  expect([...learned]).toEqual([basics.terms[0]]);
  expect(JSON.stringify(MODULES)).toBe(before);
});
it('falls back for an unsupported mode and keeps applied modes in relevant modules', () => {
  expect(buildGame(basics, new Set(), 'safety').mode).toBe('match');
  expect(modesFor(cost)).toEqual(['match', 'quick', 'cost', 'receipt', 'final']);
  expect(modesFor(MODULES[3])).toContain('safety');
  expect(recommendedMode(basics, new Set(basics.terms))).toBe('final');
  expect(recommendedMode(basics, new Set(basics.terms.slice(0, 5)))).toBe('quick');
});
it('teaches only unknown terms and makes completed modules replayable', () => {
  const plan = buildGame(basics, new Set(basics.terms), 'match', seeded(3));
  expect(plan.practice).toBe(true);
  expect(plan.steps.some((s) => s.kind === 'teach')).toBe(false);
  expect(buildGame(basics, new Set([basics.terms[0]]), 'quick').steps.filter((s) => s.kind === 'teach').length).toBe(5);
});
it.each(MODULES)('final round covers every term in $id and mixes recall modes', (m) => {
  const plan = buildGame(m, new Set(m.terms), 'final', seeded(12));
  const terms = plan.steps.flatMap((s) =>
    s.kind === 'match' ? s.terms.map((t) => t.id) : s.kind === 'quick' ? [s.term.id] : [],
  );
  expect(new Set(terms)).toEqual(new Set(m.terms));
  expect(plan.steps.some((s) => s.kind === 'quick')).toBe(true);
  expect(plan.steps.some((s) => s.kind === 'match')).toBe(true);
});
it('clears a board pair by pair, keeps a missed pair on it, and moves on only when it is clear', () => {
  const terms = moduleTerms(basics).slice(0, 3);
  const step: GameStep = { kind: 'match', terms, meanings: [...terms].reverse() };
  let state = startGame([step]);
  expect(next(state)).toBe(state);
  expect(answer(state, 'bogus', terms[0].id)).toBe(state);
  state = answer(state, terms[1].id, terms[0].id);
  expect(state.xp).toBe(0);
  expect(state.learned).toEqual([]);
  expect(state.missed).toEqual([terms[0].id]);
  expect(next(state)).toBe(state);
  // No Continue between pairs: the retry is answered straight away and earns the retry XP.
  state = answer(state, terms[0].id, terms[0].id);
  expect(state.answer?.xp).toBe(5);
  expect(state.matched).toEqual([terms[0].id]);
  expect(answer(state, terms[0].id, terms[1].id)).toBe(state);
  for (const term of terms.slice(1)) state = answer(state, term.id, term.id);
  expect(boardDone(state)).toBe(true);
  state = next(state);
  expect(gameDone(state)).toBe(true);
  expect(state.xp).toBe(25);
  expect(gameAccuracy(state)).toBe(67);
  expect(state.learned).toEqual(terms.map((t) => t.id));
});
it('retries a missed quick question once, awards retry XP and never duplicates learning', () => {
  const term = moduleTerms(basics)[0];
  let state = startGame([{ kind: 'quick', term, meaning: term, correct: 'true' }]);
  state = answer(state, 'false');
  expect(state.steps).toHaveLength(2);
  expect(state.learned).toEqual([]);
  state = next(state);
  state = answer(state, 'true');
  expect(state.xp).toBe(5);
  expect(gameAccuracy(state)).toBe(0);
  expect(state.learned).toEqual([term.id]);
  state = next(state);
  expect(gameDone(state)).toBe(true);
  expect(next(state)).toBe(state);
});
it('does not add another retry after a second miss', () => {
  const term = moduleTerms(basics)[0];
  let state = startGame([{ kind: 'quick', term, meaning: term, correct: 'true' }]);
  state = next(answer(state, 'false'));
  state = next(answer(state, 'false'));
  expect(state.steps).toHaveLength(2);
  expect(gameDone(state)).toBe(true);
  expect(state.learned).toEqual([]);
});
it('keeps all example arithmetic in the canonical formula and ranks by amount received', () => {
  const winners = new Set<number>();
  for (let seed = 0; seed < 60; seed++) {
    const examples = comparison(seeded(seed));
    expect(examples[0].input.sent).toBe(examples[1].input.sent);
    for (const example of examples) expect(example.cost).toEqual(computeTransferCost(example.input));
    const winner = examples[costAnswer(examples) === 'a' ? 0 : 1];
    const loser = examples.find((x) => x !== winner)!;
    // Never a tie: one always leaves the family more, to the cent.
    expect(Math.round(winner.cost.amountReceived * 100)).toBeGreaterThan(Math.round(loser.cost.amountReceived * 100));
    winners.add(winner.cost.feeCost);
  }
  // Sometimes the zero-fee one wins and sometimes the one with a fee: no rule of thumb works.
  expect(winners.has(0)).toBe(true);
  expect([...winners].some((fee) => fee > 0)).toBe(true);
});
it('does not mark unrelated words learned through applied questions', () => {
  const example = comparison(seeded(1))[0];
  for (const step of [
    { kind: 'receipt', example, field: 'rate' },
    { kind: 'safety', scenario: 'idCheck' },
  ] as const) {
    const state = answer(startGame([step]), rightChoice(step));
    expect(state.xp).toBe(10);
    expect(state.learned).toEqual([]);
  }
});
it.each(MODULES.flatMap((m) => modesFor(m).map((mode) => ({ m, mode }))))(
  'can finish $m.id / $mode with valid answers',
  ({ m, mode }) => {
    let state = startGame(buildGame(m, new Set(), mode, seeded(8)).steps);
    let guard = 0;
    while (!gameDone(state) && guard++ < 150) {
      const step = state.steps[state.index];
      if (step.kind === 'teach') state = next(state);
      else if (step.kind === 'match') {
        const term = step.terms.find((t) => !state.matched.includes(t.id))!;
        state = answer(state, term.id, term.id);
        if (boardDone(state)) state = next(state);
      } else state = next(answer(state, rightChoice(step)));
    }
    expect(gameDone(state)).toBe(true);
    expect(gameAccuracy(state)).toBe(100);
    expect(state.xp).toBe(state.questions * 10);
    expect(state.learned.length).toBeGreaterThan(0);
  },
);
