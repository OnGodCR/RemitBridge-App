import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import LessonScreen from '@/app/lesson/[id]';
import { MODULES } from '@/data/modules';
import { LanguageProvider } from '@/i18n';
import { en } from '@/i18n/en';
import { firstSentence } from '@/lib/lesson';
import { money } from '@/lib/format';
import { buildGame, rightChoice, type GameMode } from '@/lib/learn-games';
import { markLearned, resetLearned } from '@/lib/learn-progress';

jest.mock('expo-sqlite/localStorage/install', () => {
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  return {};
});
const mockBack = jest.fn();
let mockParams: { id: string; mode?: string } = { id: 'basics', mode: 'quick' };
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  router: { back: () => mockBack() },
  Redirect: () => null,
}));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(async () => undefined),
  selectionAsync: jest.fn(async () => undefined),
  NotificationFeedbackType: { Success: 'success', Error: 'error' },
}));
jest.mock('expo-symbols', () => ({ SymbolView: () => null }));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@/lib/prefs', () => ({ prefs: { language: () => null, setLanguage: () => undefined } }));
jest.mock('@/lib/track', () => ({ track: jest.fn() }));
jest.mock('@/components/reading-assignment', () => ({ ReadingAssignment: () => null }));
const g = en.learn.games;
const press = (name: string) => fireEvent.press(screen.getByRole('button', { name }));
const learnedNow = () => JSON.parse(localStorage.getItem('rb.learned') ?? '[]') as string[];
beforeEach(() => {
  resetLearned();
  mockBack.mockClear();
  mockParams = { id: 'basics', mode: 'quick' };
  jest.useFakeTimers();
  jest.spyOn(Math, 'random').mockReturnValue(0.8);
  jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const l = en.learn.lesson;

it.each([
  ['basics', 'match'],
  ['basics', 'quick'],
  ['cost', 'cost'],
  ['basics', 'receipt'],
  ['safety', 'safety'],
  ['cost', 'final'],
] as [string, GameMode][])('plays %s / %s through to saved XP, accuracy and replay', (id, mode) => {
  mockParams = { id, mode };
  const m = MODULES.find((x) => x.id === id)!;
  const plan = buildGame(m, new Set(), mode, () => 0.8);
  render(
    <LanguageProvider>
      <LessonScreen />
    </LanguageProvider>,
  );
  let questions = 0;
  for (const step of plan.steps) {
    if (step.kind === 'teach') {
      press(l.continue);
      continue;
    }
    if (step.kind === 'match') {
      // Pairs clear as they're found, either side first; the board moves on by itself.
      step.terms.forEach((term, i) => {
        expect(screen.queryByRole('button', { name: l.continue })).toBeNull();
        const name = term.id === 'corridor' ? g.routeWord : term.term;
        if (i % 2) {
          press(firstSentence(term.plain));
          press(name);
        } else {
          press(name);
          press(firstSentence(term.plain));
        }
        expect(learnedNow()).toContain(term.id);
        questions++;
      });
      act(() => jest.advanceTimersByTime(800));
      continue;
    }
    const choice = rightChoice(step);
    // Nothing to check until an answer is picked.
    expect(screen.getByRole('button', { name: g.check }).props.accessibilityState.disabled).toBe(true);
    if (step.kind === 'quick') press(choice === 'true' ? g.true : g.false);
    if (step.kind === 'cost') {
      expect(screen.getByText(g.example)).toBeTruthy();
      fireEvent.press(screen.getByRole('button', { name: new RegExp(`^${choice.toUpperCase()}\\.`) }));
    }
    if (step.kind === 'receipt') {
      // The receipt uses a provider's own wording, never the word the question asks for.
      const value =
        step.field === 'fee'
          ? money(step.example.cost.feeCost, 'USD')
          : step.field === 'rate'
            ? `1 USD = ${step.example.input.quotedRate.toFixed(2)} MXN`
            : money(step.example.cost.amountReceived, 'MXN');
      expect(
        screen.queryByRole('button', {
          name: new RegExp(`^${g.receiptPrompt[step.field].replace('Tap the ', '')}`, 'i'),
        }),
      ).toBeNull();
      press(`${g.receiptLines[step.field]}: ${value}`);
    }
    if (step.kind === 'safety') press(g.safetyChoices[choice as keyof typeof g.safetyChoices]);
    press(g.check);
    expect(l.right.some((cheer) => screen.queryByText(cheer))).toBe(true);
    if (step.kind === 'safety') expect(screen.getByText(g.scenarios[step.scenario].why)).toBeTruthy();
    press(l.continue);
    questions++;
  }
  expect(screen.getByText(l.done)).toBeTruthy();
  expect(screen.getByLabelText(`XP earned: ${questions * 10}`)).toBeTruthy();
  expect(screen.getByLabelText('Accuracy: 100%')).toBeTruthy();
  expect(screen.getByLabelText('Day streak: 1 day')).toBeTruthy();
  expect(JSON.parse(localStorage.getItem('rb.learnStats')!).lessons).toBe(1);
  expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalled();
  press(g.playAgain);
  expect(screen.queryByText(l.done)).toBeNull();
  expect(JSON.parse(localStorage.getItem('rb.learnStats')!).lessons).toBe(1);
  press(l.close);
  expect(mockBack).toHaveBeenCalledTimes(1);
});

it('keeps a missed pair on the board and learns it once matched', () => {
  mockParams = { id: 'basics', mode: 'match' };
  const plan = buildGame(MODULES[0], new Set(), 'match', () => 0.8);
  render(
    <LanguageProvider>
      <LessonScreen />
    </LanguageProvider>,
  );
  for (const step of plan.steps) if (step.kind === 'teach') press(l.continue);
  const board = plan.steps.find((s) => s.kind === 'match')!;
  if (board.kind !== 'match') throw new Error('missing board');
  const [a, b] = board.terms;
  press(a.term);
  press(firstSentence(b.plain));
  expect(learnedNow()).not.toContain(a.id);
  expect(screen.getByRole('button', { name: a.term })).toBeTruthy();
  press(a.term);
  press(firstSentence(a.plain));
  expect(learnedNow()).toContain(a.id);
});

it('shows the answer when a question is missed, then asks it again at the end', () => {
  for (const id of MODULES[0].terms) markLearned(id);
  const plan = buildGame(MODULES[0], new Set(MODULES[0].terms), 'quick', () => 0.8);
  render(
    <LanguageProvider>
      <LessonScreen />
    </LanguageProvider>,
  );
  const first = plan.steps[0];
  if (first.kind !== 'quick') throw new Error('expected a quick question');
  press(first.correct === 'true' ? g.false : g.true);
  press(g.check);
  expect(screen.getByText(l.wrong)).toBeTruthy();
  expect(screen.getByText(g.answerIs(g[first.correct]))).toBeTruthy();
  press(l.continue);
  expect(screen.getByRole('progressbar').props.accessibilityLabel).toBe(l.progressLabel(2, plan.steps.length + 1));
});
