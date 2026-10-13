/**
 * Account's WhatsApp rows (components/whatsapp-section.tsx, D138): chat with the bot by its
 * number, and link this account by sending a one-time code from WhatsApp. No phone number
 * is asked for anywhere.
 */
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { WhatsAppSection } from '@/components/whatsapp-section';
import { LanguageProvider } from '@/i18n';
import { formatNumber, linkStatus, newLinkCode, openChat, unlinkWhatsApp } from '@/lib/whatsapp';

let mockSession: object | null = { user: { id: 'u1' } };
jest.mock('@/lib/auth', () => ({ useAuth: () => ({ session: mockSession }) }));
jest.mock('@/lib/supabase', () => ({ supabase: null }));
jest.mock('@/lib/track', () => ({ track: jest.fn() }));
jest.mock('@/lib/announce', () => ({ announce: jest.fn() }));
jest.mock('@/lib/prefs', () => ({ prefs: { language: () => null, setLanguage: () => undefined } }));
jest.mock('expo-symbols', () => ({ SymbolView: () => null }));
// Focus effects run like ordinary effects here.
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('expo-router', () => ({ useFocusEffect: (cb: () => void) => require('react').useEffect(cb, [cb]) }));
jest.mock('@/lib/whatsapp', () => ({
  ...jest.requireActual('@/lib/whatsapp'),
  whatsAppSettings: jest.fn(async () => ({ number: '15551845383', live: true })),
  linkStatus: jest.fn(),
  newLinkCode: jest.fn(async () => 'K7P2QX'),
  openChat: jest.fn(async () => true),
  unlinkWhatsApp: jest.fn(async () => true),
}));

const renderIt = async () => {
  render(
    <LanguageProvider>
      <WhatsAppSection />
    </LanguageProvider>,
  );
  await act(async () => {});
};

beforeEach(() => {
  mockSession = { user: { id: 'u1' } };
  jest.mocked(openChat).mockClear();
});

it('formats the bot’s number for people to read', () => {
  expect(formatNumber('15551845383')).toBe('+1 555-184-5383');
  expect(formatNumber('919876543210')).toBe('+919876543210');
});

it('opens a chat with the bot, its number under the row', async () => {
  jest.mocked(linkStatus).mockResolvedValue({ linked: false, linkedAt: null });
  await renderIt();
  expect(screen.getByText('+1 555-184-5383')).toBeTruthy();
  fireEvent.press(screen.getByText('Chat on WhatsApp'));
  expect(openChat).toHaveBeenCalledWith('15551845383', 'Hi');
});

it('links by opening WhatsApp with a one-time code typed in', async () => {
  jest.mocked(linkStatus).mockResolvedValue({ linked: false, linkedAt: null });
  await renderIt();
  await act(async () => {
    fireEvent.press(screen.getByText('Link to your account'));
  });
  expect(newLinkCode).toHaveBeenCalled();
  expect(openChat).toHaveBeenCalledWith('15551845383', 'LINK K7P2QX');
  expect(screen.getByText(/Press send there, then come back here/)).toBeTruthy();
});

it('shows the number instead of nothing when WhatsApp can\'t be opened', async () => {
  jest.mocked(linkStatus).mockResolvedValue({ linked: false, linkedAt: null });
  jest.mocked(openChat).mockResolvedValueOnce(false);
  await renderIt();
  await act(async () => {
    fireEvent.press(screen.getByText('Link to your account'));
  });
  expect(screen.getByText(/Couldn't open WhatsApp\. Message/)).toBeTruthy();
});

it('shows a linked chat, and unlinks after asking', async () => {
  jest.mocked(linkStatus).mockResolvedValue({ linked: true, linkedAt: '2026-10-02T03:00:00Z' });
  const alert = jest.spyOn(Alert, 'alert');
  await renderIt();
  fireEvent.press(screen.getByText('WhatsApp linked'));
  const buttons = alert.mock.calls[0][2]!;
  await act(async () => {
    await buttons.find((b) => b.text === 'Unlink')!.onPress!();
  });
  expect(unlinkWhatsApp).toHaveBeenCalled();
  expect(screen.getByText('Link to your account')).toBeTruthy();
});

it('offers linking only when signed in', async () => {
  mockSession = null;
  await renderIt();
  expect(screen.getByText('Chat on WhatsApp')).toBeTruthy();
  expect(screen.queryByText('Link to your account')).toBeNull();
});
