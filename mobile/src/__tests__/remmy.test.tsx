/**
 * Remmy in the app (D175): only real actions are taken, the conversation goes to the remmy
 * function with its history, and the chat screen shows steps, cards and the result of each.
 */
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Alert } from 'react-native';

import RemmyChat from '@/app/remmy';
import { LanguageProvider } from '@/i18n';
import { en } from '@/i18n/en';
import { boldParts, newChat, runAction, sendToRemmy } from '@/lib/remmy';
import { validAction } from '@/lib/remmy-actions';

const mockInvoke = jest.fn();
const mockOpenCompare = jest.fn();
const mockSave = jest.fn();
const mockRouter = { back: jest.fn(), push: jest.fn(), dismissTo: jest.fn() };

jest.mock('@/lib/supabase', () => ({ supabase: { functions: { invoke: (...args: unknown[]) => mockInvoke(...args) } } }));
jest.mock('@/lib/open-compare', () => ({ openCompare: (...args: unknown[]) => mockOpenCompare(...args) }));
jest.mock('@/lib/comparisons', () => ({ saveComparison: (...args: unknown[]) => mockSave(...args) }));
let mockConsent = true;
jest.mock('@/lib/prefs', () => ({
  prefs: {
    installId: () => '00000000-0000-4000-8000-00000000c0de',
    language: () => null,
    setLanguage: () => undefined,
    remmyConsent: () => mockConsent,
    setRemmyConsent: () => (mockConsent = true),
  },
}));
jest.mock('@/lib/track', () => ({ track: jest.fn() }));
const mockOpenPage = jest.fn();
jest.mock('@/lib/links', () => ({ ...jest.requireActual('@/lib/links'), openPage: (...args: unknown[]) => mockOpenPage(...args) }));
jest.mock('expo-router', () => ({
  get router() {
    return mockRouter;
  },
}));
jest.mock('expo-symbols', () => ({ SymbolView: () => null }));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));

const r = en.remmy;
const ROUTES = ['us-in', 'us-mx'];

beforeEach(() => {
  newChat();
  mockConsent = true;
  // Each send happens two seconds after the last, past the double-tap guard.
  let clock = 1_000_000;
  jest.spyOn(Date, 'now').mockImplementation(() => (clock += 2000));
  jest.clearAllMocks();
  jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
});

describe('validAction', () => {
  it('keeps only actions on real routes, screens and modules', () => {
    expect(validAction({ type: 'compare', routeId: 'us-in', amount: 500, method: 'upi' }, ROUTES)).toEqual({
      type: 'compare',
      routeId: 'us-in',
      amount: 500,
      method: 'upi',
      now: false,
    });
    expect(validAction({ type: 'compare', routeId: 'us-zz', amount: 500, method: 'upi' }, ROUTES)).toBeNull();
    expect(validAction({ type: 'screen', screen: 'admin' }, ROUTES)).toBeNull();
    expect(validAction({ type: 'screen', screen: 'glossary', term: 'kyc', now: true }, ROUTES)).toEqual({ type: 'screen', screen: 'glossary', term: 'kyc', now: true });
    expect(validAction({ type: 'lesson', module: 'safety', mode: 'nope' }, ROUTES)).toEqual({ type: 'lesson', module: 'safety', now: false });
    expect(validAction({ type: 'transfer', amount: 500 }, ROUTES)).toBeNull();
    // Any name the model uses for a screen is mapped to the real one.
    expect(validAction({ type: 'screen', screen: 'User Settings' }, ROUTES)).toEqual({ type: 'screen', screen: 'account', now: false });
    expect(validAction({ type: 'screen', screen: 'constructor' }, ROUTES)).toBeNull();
  });
});

it('reads **bold** spans', () => {
  expect(boldParts('About **₹47,000** arrives')).toEqual([
    { text: 'About ', bold: false },
    { text: '₹47,000', bold: true },
    { text: ' arrives', bold: false },
  ]);
});

it('sends the conversation so far, and drops actions the app wouldn’t take', async () => {
  mockInvoke.mockResolvedValueOnce({ data: { reply: 'Hi!', actions: [], steps: [] }, error: null });
  await sendToRemmy('hello', 'en');
  mockInvoke.mockResolvedValueOnce({
    data: { reply: 'Here.', actions: [{ type: 'screen', screen: 'admin' }, { type: 'screen', screen: 'scan' }], steps: ['open_screen'] },
    error: null,
  });
  await sendToRemmy('scan please', 'en');
  expect(mockInvoke).toHaveBeenLastCalledWith('remmy', {
    method: 'POST',
    body: expect.objectContaining({
      message: 'scan please',
      history: [
        { role: 'user', text: 'hello' },
        { role: 'assistant', text: 'Hi!' },
      ],
      install_id: '00000000-0000-4000-8000-00000000c0de',
    }),
  });
});

it('drops a second send within a moment of the first', async () => {
  (Date.now as jest.Mock).mockReturnValue(5_000_000);
  mockInvoke.mockResolvedValue({ data: { reply: 'Hi!', actions: [], steps: [] }, error: null });
  await sendToRemmy('hello', 'en');
  await sendToRemmy('hello again', 'en');
  expect(mockInvoke).toHaveBeenCalledTimes(1);
});

it('opens the terms and privacy policy in the app, and support in the browser (D188)', async () => {
  await runAction({ type: 'screen', screen: 'privacy' });
  expect(mockRouter.back).toHaveBeenCalled();
  expect(mockRouter.push).toHaveBeenCalledWith('/legal/privacy');
  await runAction({ type: 'screen', screen: 'terms' });
  expect(mockRouter.push).toHaveBeenCalledWith('/legal/terms');
  expect(mockOpenPage).not.toHaveBeenCalled();
  await runAction({ type: 'screen', screen: 'support' });
  expect(mockOpenPage).toHaveBeenCalledWith(expect.stringMatching(/\/support$/));
});

it('opens tabs by going back to them, and other screens on top', async () => {
  await runAction({ type: 'screen', screen: 'scan' });
  expect(mockRouter.dismissTo).toHaveBeenCalledWith('/scan');
  await runAction({ type: 'screen', screen: 'glossary', term: 'kyc' });
  expect(mockRouter.back).toHaveBeenCalled();
  expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/glossary', params: { term: 'kyc' } });
  await runAction({ type: 'lesson', module: 'cost', mode: 'cost' });
  expect(mockRouter.push).toHaveBeenLastCalledWith({ pathname: '/lesson/[id]', params: { id: 'cost', mode: 'cost' } });
});

describe('the chat screen', () => {
  const renderChat = () =>
    render(
      <LanguageProvider>
        <RemmyChat />
      </LanguageProvider>,
    );

  it('starts with Remmy and suggestions; a suggestion asks it', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: {
        reply: 'About **₹47,000** arrives with the top provider.',
        actions: [{ type: 'compare', routeId: 'us-in', amount: 500, method: 'bank_deposit' }],
        steps: ['get_prices', 'open_compare'],
      },
      error: null,
    });
    renderChat();
    expect(screen.getByText(r.hello)).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByRole('button', { name: r.suggestions[0] })));
    expect(screen.getByText(r.suggestions[0])).toBeTruthy();
    expect(screen.getByText(r.steps.get_prices)).toBeTruthy();
    expect(screen.getByText(r.steps.action)).toBeTruthy();
    expect(screen.getByText('₹47,000')).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByRole('button', { name: /^Open: \$500 → India/ })));
    expect(mockOpenCompare).toHaveBeenCalledWith({ routeId: 'us-in', amount: 500, method: 'bank_deposit' });
  });

  it('reports only the selected reply after confirmation, and keeps failure retryable', async () => {
    mockInvoke.mockResolvedValueOnce({ data: { reply: 'A questionable reply.', actions: [], steps: [] }, error: null });
    renderChat();
    await act(async () => sendToRemmy('A private question', 'en'));
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    fireEvent.press(screen.getByRole('button', { name: r.report }));
    expect(mockInvoke).toHaveBeenCalledTimes(1);
    expect(alert).toHaveBeenCalledWith(r.report, r.reportBody, expect.any(Array));
    mockInvoke.mockResolvedValueOnce({ data: null, error: new Error('offline') });
    await act(async () => alert.mock.calls[0][2]![1].onPress?.());
    expect(screen.getByRole('button', { name: r.report })).toBeTruthy();
    expect(alert).toHaveBeenLastCalledWith(r.reportFailed);
    fireEvent.press(screen.getByRole('button', { name: r.report }));
    mockInvoke.mockResolvedValueOnce({ data: { reported: true }, error: null });
    await act(async () => alert.mock.calls[2][2]![1].onPress?.());
    expect(mockInvoke).toHaveBeenLastCalledWith('remmy', { method: 'POST', body: {
      report: 'A questionable reply.', language: 'en', install_id: '00000000-0000-4000-8000-00000000c0de',
    } });
    expect(screen.getByText(r.reported)).toBeTruthy();
  });

  it('asks once before the first message goes to the AI model, and sends nothing on Not now', async () => {
    mockConsent = false;
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    renderChat();
    fireEvent.changeText(screen.getByLabelText(r.placeholder), 'hello');
    await act(async () => fireEvent.press(screen.getByRole('button', { name: r.send })));
    expect(alert).toHaveBeenCalledWith(r.aiTitle, r.aiBody, expect.any(Array));
    expect(mockInvoke).not.toHaveBeenCalled();
    const buttons = alert.mock.calls[0][2]!;
    act(() => buttons[0].onPress?.());
    expect(mockInvoke).not.toHaveBeenCalled();
    mockInvoke.mockResolvedValueOnce({ data: { reply: 'Hi!', actions: [], steps: [] }, error: null });
    await act(async () => buttons[1].onPress?.());
    expect(mockInvoke).toHaveBeenCalledTimes(1);
    expect(mockConsent).toBe(true);
  });

  it('opens by itself after a beat when asked to take you there', async () => {
    jest.useFakeTimers();
    mockInvoke.mockResolvedValueOnce({ data: { reply: 'Opening the scanner.', actions: [{ type: 'screen', screen: 'scan', now: true }], steps: ['open_screen'] }, error: null });
    renderChat();
    fireEvent.changeText(screen.getByLabelText(r.placeholder), 'take me to the scanner');
    await act(async () => fireEvent.press(screen.getByRole('button', { name: r.send })));
    expect(screen.getByText(r.opening)).toBeTruthy();
    expect(mockRouter.dismissTo).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1000));
    expect(mockRouter.dismissTo).toHaveBeenCalledWith('/scan');
    jest.useRealTimers();
  });

  it('saves with one tap, and says when you need to sign in', async () => {
    mockInvoke.mockResolvedValueOnce({ data: { reply: 'Tap Save to keep it.', actions: [{ type: 'save', routeId: 'us-mx', amount: 200, method: 'bank_deposit' }], steps: [] }, error: null });
    mockSave.mockResolvedValueOnce('signed_out');
    renderChat();
    fireEvent.changeText(screen.getByLabelText(r.placeholder), 'save 200 to mexico');
    await act(async () => fireEvent.press(screen.getByRole('button', { name: r.send })));
    await act(async () => fireEvent.press(screen.getByRole('button', { name: /^Save: / })));
    expect(mockSave).toHaveBeenCalledWith({ routeId: 'us-mx', amount: 200, method: 'bank_deposit' });
    expect(screen.getByText(r.signIn)).toBeTruthy();
  });

  it('does not replay navigation when the chat reopens, but acts on a fresh prompt', async () => {
    jest.useFakeTimers();
    const reply = { data: { reply: 'Opening account settings.', actions: [{ type: 'screen', screen: 'account', now: true }], steps: [] }, error: null };
    mockInvoke.mockResolvedValue(reply);
    const first = renderChat();
    await act(async () => sendToRemmy('open the account settings', 'en'));
    act(() => jest.advanceTimersByTime(1000));
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    first.unmount();
    renderChat();
    act(() => jest.advanceTimersByTime(1000));
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    await act(async () => sendToRemmy('open the account settings again', 'en'));
    act(() => jest.advanceTimersByTime(1000));
    expect(mockRouter.push).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it('says when it can’t connect, and tries again', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('offline'));
    renderChat();
    fireEvent.changeText(screen.getByLabelText(r.placeholder), 'hello');
    await act(async () => fireEvent.press(screen.getByRole('button', { name: r.send })));
    expect(screen.getByText(r.offline)).toBeTruthy();
    mockInvoke.mockResolvedValueOnce({ data: { reply: 'Back now.', actions: [], steps: [] }, error: null });
    await act(async () => fireEvent.press(screen.getByRole('button', { name: r.retry })));
    expect(screen.getByText('Back now.')).toBeTruthy();
    expect(screen.queryByText(r.offline)).toBeNull();
  });

  it('asks to slow down when messages come too fast', async () => {
    mockInvoke.mockResolvedValueOnce({ data: { reply: '', actions: [], steps: [], limited: true, reason: 'slow' }, error: null });
    renderChat();
    fireEvent.changeText(screen.getByLabelText(r.placeholder), 'hello');
    await act(async () => fireEvent.press(screen.getByRole('button', { name: r.send })));
    expect(screen.getByText(r.slow)).toBeTruthy();
  });

  it('shows the checked prices on the card, and says so when the model gave no text', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: {
        reply: '',
        actions: [{ type: 'compare', routeId: 'us-in', amount: 500, method: 'bank_deposit', top: [{ provider: 'Instarem', receives: '₹47,307', pct: 1.2 }], checkedAt: new Date().toISOString() }],
        steps: [],
        limited: true,
        reason: 'failed',
      },
      error: null,
    });
    renderChat();
    fireEvent.changeText(screen.getByLabelText(r.placeholder), '500 to India');
    await act(async () => fireEvent.press(screen.getByRole('button', { name: r.send })));
    expect(screen.getByText(r.pricesHere)).toBeTruthy();
    expect(screen.getByText('₹47,307')).toBeTruthy();
    expect(screen.getByText(r.totalCost(1.2))).toBeTruthy();
  });

  it('says it’s resting when over the limit, and still offers Compare', async () => {
    mockInvoke.mockResolvedValueOnce({ data: { reply: '', actions: [{ type: 'compare', routeId: 'us-mx', amount: 300, method: 'bank_deposit' }], steps: [], limited: true }, error: null });
    renderChat();
    fireEvent.changeText(screen.getByLabelText(r.placeholder), '300 to mexico');
    await act(async () => fireEvent.press(screen.getByRole('button', { name: r.send })));
    expect(screen.getByText(r.limited)).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Open: \$300 → Mexico/ })).toBeTruthy();
  });
});
