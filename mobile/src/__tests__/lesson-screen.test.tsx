/**
 * The lesson screen (app/lesson/[id].tsx, D136), tapped through: a new word's card, a right
 * answer and its XP, a wrong one that shows the answer and comes back at the end, then the
 * finish with XP, accuracy and the streak, and the words saved as learned.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';

import LessonScreen from '@/app/lesson/[id]';
import { TERMS } from '@/data/glossary';
import { LanguageProvider } from '@/i18n';
import { resetLearned } from '@/lib/learn-progress';
import { WORDS_PER_LESSON } from '@/lib/lesson';
import { MODULES } from '@/data/modules';

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
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'basics' }),
  router: { back: () => mockBack() },
  Redirect: () => null,
}));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(async () => undefined),
  NotificationFeedbackType: { Success: 'success', Error: 'error' },
}));
jest.mock('expo-symbols', () => ({ SymbolView: () => null }));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
jest.mock('@/lib/prefs', () => ({ prefs: { language: () => null, setLanguage: () => undefined } }));
jest.mock('@/lib/track', () => ({ track: jest.fn() }));

const BY_ID = new Map(TERMS.map((t) => [t.id, t]));
const word = (id: string) => BY_ID.get(id)!.term;
const lessonIds = MODULES[0].terms.slice(0, WORDS_PER_LESSON);

/** The words saved as learned on the phone. */
const learnedNow = () => new Set<string>(JSON.parse(localStorage.getItem('rb.learned') ?? '[]') as string[]);

beforeEach(() => {
  resetLearned();
  mockBack.mockClear();
});

/** The term the current question is about, from its prompt: the card's word, or the quoted word. */
function currentAnswer(): string {
  const which = screen.queryByText('Which word means this?');
  if (which) {
    // The definition's first sentence is on screen; find the lesson word it belongs to.
    for (const id of lessonIds) {
      const first = BY_ID.get(id)!.plain.match(/^.*?[.!?](?=\s|$)/)![0];
      if (screen.queryByText(first)) return word(id);
    }
  }
  for (const id of lessonIds) {
    if (screen.queryByText(`What does “${word(id)}” mean?`)) return BY_ID.get(id)!.plain.match(/^.*?[.!?](?=\s|$)/)![0];
  }
  throw new Error('no question on screen');
}

/** A choice on screen that isn't the answer. */
function wrongChoice(answer: string): string {
  const buttons = screen.getAllByRole('button').map((b) => b.props.accessibilityLabel as string);
  return buttons.find((l) => l && l !== answer && l !== 'Close the lesson' && l !== 'Got it')!;
}

it('teaches, quizzes, brings a miss back, and finishes with XP, accuracy and a streak', () => {
  render(
    <LanguageProvider>
      <LessonScreen />
    </LanguageProvider>,
  );

  // The first new word's card.
  expect(screen.getByText('New word')).toBeTruthy();
  expect(screen.getByText(word(lessonIds[0]))).toBeTruthy();
  fireEvent.press(screen.getByText('Got it'));

  // Its question, answered right: a cheer and 10 XP, and the word counts as learned.
  fireEvent.press(screen.getByLabelText(currentAnswer()));
  expect(screen.getByText('+10 XP')).toBeTruthy();
  expect(learnedNow().has(lessonIds[0])).toBe(true);
  fireEvent.press(screen.getByText('Continue'));

  // The second word, answered wrong: the answer is shown and the question will return.
  fireEvent.press(screen.getByText('Got it'));
  const answer = currentAnswer();
  fireEvent.press(screen.getByLabelText(wrongChoice(answer)));
  expect(screen.getByText('Not quite.')).toBeTruthy();
  expect(screen.getByText(`The answer: ${answer}`)).toBeTruthy();
  fireEvent.press(screen.getByText('Continue'));

  // Everything else right, the retry included.
  for (let guard = 0; guard < 40 && !screen.queryByText('Lesson complete!'); guard++) {
    if (screen.queryByText('Got it')) fireEvent.press(screen.getByText('Got it'));
    else {
      fireEvent.press(screen.getByLabelText(currentAnswer()));
      fireEvent.press(screen.getByText('Continue'));
    }
  }
  expect(screen.getByText('Lesson complete!')).toBeTruthy();
  expect(screen.getByText(`You learned ${WORDS_PER_LESSON} words.`)).toBeTruthy();
  // 10 questions, 9 right first time (90 XP), and the retry (5 XP).
  expect(screen.getByLabelText('XP earned: 95')).toBeTruthy();
  expect(screen.getByLabelText('Accuracy: 90%')).toBeTruthy();
  expect(screen.getByLabelText('Day streak: 1 day')).toBeTruthy();
  expect(lessonIds.every((id) => learnedNow().has(id))).toBe(true);

  fireEvent.press(screen.getByText('Continue'));
  expect(mockBack).toHaveBeenCalled();
});
