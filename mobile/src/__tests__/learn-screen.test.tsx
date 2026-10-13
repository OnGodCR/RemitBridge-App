import { fireEvent, render, screen } from '@testing-library/react-native';
import LearnScreen from '@/app/(tabs)/learn';
import { POSTS } from '@/data/blog';
import { LanguageProvider } from '@/i18n';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args) },
  useFocusEffect: () => undefined,
}));
jest.mock('expo-symbols', () => ({ SymbolView: () => null }));
jest.mock('@/lib/current-tab', () => ({ useTabFocus: () => undefined }));
jest.mock('@/lib/learn-progress', () => ({
  useLearned: () => new Set(),
  useLearnStats: () => ({ xp: 0, streak: 0 }),
  nextStep: () => null,
}));
jest.mock('@/components/learn-path', () => ({ LearnPath: () => null, Ring: () => null }));
jest.mock('@/components/hero-header', () => ({
  HeroHeader: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/components/motion-views', () => ({
  FocusRise: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/lib/prefs', () => ({ prefs: { language: () => null, setLanguage: () => undefined } }));
jest.mock('@/lib/links', () => ({ openPage: jest.fn() }));
jest.mock('@/data/blog-images', () => ({ BLOG_IMAGES: {} }));

it('features post 1 under Start here and keeps All posts immediately below it', () => {
  render(
    <LanguageProvider>
      <LearnScreen />
    </LanguageProvider>,
  );
  fireEvent.press(screen.getByRole('radio', { name: 'Library' }));
  expect(screen.getByLabelText('Start here')).toBeTruthy();
  expect(screen.queryByText('Latest post')).toBeNull();
  const first = POSTS.find((post) => post.id === 1)!;
  expect(screen.getByText(first.title)).toBeTruthy();
  fireEvent.press(
    screen.getByRole('button', { name: new RegExp('^' + first.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }),
  );
  expect(mockPush).toHaveBeenLastCalledWith({ pathname: '/blog/[id]', params: { id: '1' } });
  const buttons = screen.getAllByRole('button');
  const featured = buttons.findIndex((b) => b.props.accessibilityLabel?.startsWith(first.title));
  expect(buttons[featured + 1].props.accessibilityLabel).toBe('All posts. Stories and explainers');
  fireEvent.press(screen.getByRole('button', { name: 'All posts. Stories and explainers' }));
  expect(mockPush).toHaveBeenLastCalledWith('/blog');
});
