/**
 * App Review's sign-in (lib/sign-in.ts, D184): only the review address gets a password
 * field, and a wrong password says so instead of talking about a code.
 */
import { REVIEW_EMAIL, isReviewEmail, signInForReview } from '@/lib/sign-in';

const mockSignIn = jest.fn();
let mockError: { message: string } | null = null;

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: async (args: unknown) => {
        mockSignIn(args);
        return { data: {}, error: mockError };
      },
    },
  },
}));

beforeEach(() => {
  mockSignIn.mockClear();
  mockError = null;
});

it('knows the review address, whatever the case or spaces', () => {
  expect(isReviewEmail(` ${REVIEW_EMAIL.toUpperCase()} `)).toBe(true);
  expect(isReviewEmail('someone@example.com')).toBe(false);
  expect(isReviewEmail('')).toBe(false);
});

it('signs in with the trimmed, lower-case address and the password as typed', async () => {
  expect(await signInForReview(' Review@RemitBridgeLabs.org ', 'Pa ss')).toBeNull();
  expect(mockSignIn).toHaveBeenCalledWith({ email: REVIEW_EMAIL, password: 'Pa ss' });
});

it('says the password is wrong, and passes other problems through', async () => {
  mockError = { message: 'Invalid login credentials' };
  expect(await signInForReview(REVIEW_EMAIL, 'nope')).toBe('badPassword');
  mockError = { message: 'Network request failed' };
  expect(await signInForReview(REVIEW_EMAIL, 'x')).toBe('offline');
  mockError = { message: 'RemitBridge signs in with an email code, Apple or Google, not a password.' };
  expect(await signInForReview(REVIEW_EMAIL, 'x')).toBe('generic');
});
