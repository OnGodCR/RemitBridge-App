/**
 * The terms and privacy policy in the app, and agreeing to them (lib/legal.ts, D188).
 */
import type { Session } from '@supabase/supabase-js';

import { LEGAL_DOCS, LEGAL_VERSION, acceptLegal, needsLegalConsent } from '@/lib/legal';

const mockUpdateUser = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: { auth: { updateUser: (args: unknown) => mockUpdateUser(args) } },
}));

const session = (metadata: Record<string, unknown>) => ({ user: { user_metadata: metadata } }) as unknown as Session;

it('carries both documents, with their titles, dates and text', () => {
  expect(LEGAL_DOCS.terms.title).toBe('Terms of use');
  expect(LEGAL_DOCS.privacy.title).toBe('Privacy policy');
  for (const doc of Object.values(LEGAL_DOCS)) {
    expect(doc.updated).toMatch(/^Last updated /);
    expect(doc.blocks.filter((b) => b.kind === 'heading').length).toBeGreaterThan(5);
    // The site's placeholders were filled in, so none reach the app.
    expect(JSON.stringify(doc)).not.toMatch(/\{\{|<[a-z]/);
  }
  expect(LEGAL_VERSION).toMatch(/^terms .+; privacy .+$/);
});

it('asks only an account that has not agreed to the current version', () => {
  expect(needsLegalConsent(null)).toBe(false);
  expect(needsLegalConsent(session({}))).toBe(true);
  expect(needsLegalConsent(session({ legal_accepted: { version: 'terms January 1, 2026; privacy January 1, 2026' } }))).toBe(true);
  expect(needsLegalConsent(session({ legal_accepted: { version: LEGAL_VERSION } }))).toBe(false);
});

it('saves the version and the time on the account, and says when it could not', async () => {
  mockUpdateUser.mockResolvedValueOnce({ error: null });
  expect(await acceptLegal(new Date('2026-10-17T20:00:00Z'))).toBe(true);
  expect(mockUpdateUser).toHaveBeenCalledWith({
    data: { legal_accepted: { version: LEGAL_VERSION, at: '2026-10-17T20:00:00.000Z' } },
  });
  mockUpdateUser.mockResolvedValueOnce({ error: { message: 'Network request failed' } });
  expect(await acceptLegal()).toBe(false);
});
