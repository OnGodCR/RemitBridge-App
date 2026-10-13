/**
 * The newsletter from the app (lib/newsletter.ts, D169): the switch only ever calls the
 * signed-in database functions, and a refusal shows as a failure, never as "on".
 */
import { newsletterStatus, sendIssue, setNewsletter } from '@/lib/newsletter';

const mockRpc = jest.fn();
const mockInvoke = jest.fn();
let mockError: { code: string; message: string } | null = null;

jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: async (name: string, args?: unknown) => {
      mockRpc(name, args);
      return { data: name === 'newsletter_status' ? !mockError : null, error: mockError };
    },
    functions: { invoke: (...args: unknown[]) => mockInvoke(...args) },
  },
}));

beforeEach(() => {
  mockRpc.mockClear();
  mockInvoke.mockReset();
  mockError = null;
});

it('reads whether this account gets the newsletter', async () => {
  expect(await newsletterStatus()).toBe(true);
  mockError = { code: '42501', message: 'sign in first' };
  expect(await newsletterStatus()).toBeNull();
});

it('turns it on with the app language, and off', async () => {
  expect(await setNewsletter(true, 'hi')).toBe(true);
  expect(mockRpc).toHaveBeenLastCalledWith('newsletter_subscribe', { p_language: 'hi' });
  expect(await setNewsletter(false, 'hi')).toBe(true);
  expect(mockRpc).toHaveBeenLastCalledWith('newsletter_unsubscribe', undefined);
});

it('says so when the database refuses', async () => {
  mockError = { code: '42501', message: 'sign in first' };
  expect(await setNewsletter(true, 'en')).toBe(false);
});

it("shows the function's own reason when a send is refused", async () => {
  mockInvoke.mockResolvedValue({
    data: null,
    error: { message: 'Edge Function returned a non-2xx status code', context: { json: async () => ({ error: 'An issue went out in the last 10 minutes' }) } },
  });
  expect(await sendIssue('send', 'S', 'B')).toEqual({ ok: false, message: 'An issue went out in the last 10 minutes' });
  mockInvoke.mockResolvedValue({ data: { sent: 1, to: 'a@example.org' }, error: null });
  expect(await sendIssue('test', 'S', 'B')).toEqual({ ok: true, sent: 1, failed: 0, to: 'a@example.org' });
  expect(mockInvoke).toHaveBeenLastCalledWith('send-newsletter', { method: 'POST', body: { mode: 'test', subject: 'S', body: 'B' } });
});

it('applies the onboarding opt-in once, after sign-in, and only if it was turned on', async () => {
  const { applyPendingOptIn, setPendingOptIn } = jest.requireActual('@/lib/newsletter');
  await applyPendingOptIn('en');
  expect(mockRpc).not.toHaveBeenCalled();
  setPendingOptIn(true);
  await applyPendingOptIn('es');
  expect(mockRpc).toHaveBeenCalledWith('newsletter_subscribe', { p_language: 'es' });
  mockRpc.mockClear();
  await applyPendingOptIn('es');
  expect(mockRpc).not.toHaveBeenCalled();
});
