/**
 * Rate alerts by WhatsApp from the app (lib/rate-alerts.ts, D139): no notification
 * permission or push token asked for, the channel stored, and "link first" said plainly.
 */
import { createAlert } from '@/lib/rate-alerts';

const mockInsert = jest.fn();
const mockPush = jest.fn();
let mockInsertError: { message: string } | null = null;

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getSession: async () => ({ data: { session: { user: { id: 'u1' } } } }) },
    from: () => ({
      insert: async (row: unknown) => {
        mockInsert(row);
        return { error: mockInsertError };
      },
    }),
  },
}));
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: async () => {
    mockPush();
    return { granted: true };
  },
  getExpoPushTokenAsync: async () => ({ data: 'ExponentPushToken[abcdefghijk]' }),
  AndroidImportance: { DEFAULT: 3 },
}));
jest.mock('expo-constants', () => ({ expoConfig: { extra: {} } }));

const ALERT = { routeId: 'us-in', amount: 500, method: 'bank_deposit' as const, funding: 'bank_account' as const, target: 47600, language: 'hi' };

beforeEach(() => {
  mockInsert.mockClear();
  mockPush.mockClear();
  mockInsertError = null;
});

it('turns on a WhatsApp alert without asking this phone for notifications', async () => {
  expect(await createAlert({ ...ALERT, channel: 'whatsapp' })).toBe('on');
  expect(mockPush).not.toHaveBeenCalled();
  expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ channel: 'whatsapp', push_token: null, language: 'hi' }));
});

it('keeps phone notifications as they were', async () => {
  expect(await createAlert(ALERT)).toBe('on');
  expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ channel: 'push', push_token: 'ExponentPushToken[abcdefghijk]' }));
});

it('says to link WhatsApp first when the database refuses', async () => {
  mockInsertError = { message: 'link WhatsApp first' };
  expect(await createAlert({ ...ALERT, channel: 'whatsapp' })).toBe('not_linked');
});
