import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import LessonScreen from '@/app/lesson/[id]';
import { MODULES } from '@/data/modules';
import { LanguageProvider } from '@/i18n';
import { en } from '@/i18n/en';
import { firstSentence } from '@/lib/lesson';
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
  jest.spyOn(Math, 'random').mockReturnValue(0.8);
  jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
});
afterEach(() => jest.restoreAllMocks());

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
      press(en.learn.lesson.gotIt);
      continue;
    }
    if (step.kind === 'match') {
      for (const term of step.terms) {
        press(term.id === 'corridor' ? g.routeWord : term.term);
        press(firstSentence(term.plain));
        expect(learnedNow()).toContain(term.id);
        press(g.next);
        questions++;
      }
      continue;
    }
    const choice = rightChoice(step);
    if (step.kind === 'quick') press(choice === 'true' ? g.true : g.false);
    if (step.kind === 'cost') {
      expect(screen.getByText(g.example)).toBeTruthy();
      press(choice === 'a' ? g.providerA : choice === 'b' ? g.providerB : g.tie);
    }
    if (step.kind === 'receipt') {
      // The receipt uses a provider's own wording, never the word the question asks for.
      const n = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const value =
        step.field === 'fee'
          ? `${n(step.example.cost.feeCost)} USD`
          : step.field === 'rate'
            ? `1 USD = ${n(step.example.input.quotedRate)} MXN`
            : `${n(step.example.cost.amountReceived)} MXN`;
      expect(screen.queryByRole('button', { name: new RegExp(`^${g[step.field]}`) })).toBeNull();
      press(`${g.receiptLines[step.field]}: ${value}`);
    }
    if (step.kind === 'safety') press(g.safetyChoices[choice as keyof typeof g.safetyChoices]);
    press(g.details);
    expect(screen.getByRole('button', { name: g.hideDetails })).toBeTruthy();
    press(g.next);
    questions++;
  }
  expect(screen.getByText(en.learn.lesson.done)).toBeTruthy();
  expect(screen.getByLabelText(`XP earned: ${questions * 10}`)).toBeTruthy();
  expect(screen.getByLabelText('Accuracy: 100%')).toBeTruthy();
  expect(screen.getByLabelText('Day streak: 1 day')).toBeTruthy();
  expect(JSON.parse(localStorage.getItem('rb.learnStats')!).lessons).toBe(1);
  expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalled();
  press(g.playAgain);
  expect(screen.queryByText(en.learn.lesson.done)).toBeNull();
  expect(JSON.parse(localStorage.getItem('rb.learnStats')!).lessons).toBe(1);
  press(en.learn.lesson.close);
  expect(mockBack).toHaveBeenCalledTimes(1);
});
it('keeps a missed pair on the board, explains it and awards reduced XP on retry', () => {
  mockParams = { id: 'basics', mode: 'match' };
  const plan = buildGame(MODULES[0], new Set(), 'match', () => 0.8);
  render(
    <LanguageProvider>
      <LessonScreen />
    </LanguageProvider>,
  );
  for (const step of plan.steps.filter((s) => s.kind === 'teach')) {
    void step;
    press(en.learn.lesson.gotIt);
  }
  const board = plan.steps.find((s) => s.kind === 'match')!;
  if (board.kind !== 'match') throw new Error('missing board');
  const [a, b] = board.terms;
  press(a.term);
  press(firstSentence(b.plain));
  expect(screen.getByText(en.learn.lesson.answerWas(firstSentence(a.plain)))).toBeTruthy();
  expect(learnedNow()).not.toContain(a.id);
  press(g.next);
  press(a.term);
  press(firstSentence(a.plain));
  expect(screen.getByText('+5 XP')).toBeTruthy();
  expect(learnedNow()).toContain(a.id);
});
it('offers quick fire untimed by default and cleans up its opt-in timer', () => {
  for (const id of MODULES[0].terms) markLearned(id);
  jest.useFakeTimers();
  const rendered = render(
    <LanguageProvider>
      <LessonScreen />
    </LanguageProvider>,
  );
  expect(screen.queryByText(/Time elapsed/)).toBeNull();
  fireEvent.press(screen.getByRole('radio', { name: g.timerOn }));
  expect(screen.getByText('Time elapsed: 0:00')).toBeTruthy();
  act(() => jest.advanceTimersByTime(1000));
  fireEvent.press(screen.getByRole('radio', { name: g.timerOff }));
  expect(screen.queryByText(/Time elapsed/)).toBeNull();
  rendered.unmount();
  jest.useRealTimers();
});
