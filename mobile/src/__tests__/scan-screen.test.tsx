/**
 * The scan screen's flow (app/(tabs)/index.tsx, the first tab since D101), with the photo, OCR, drawing and network faked:
 * nothing is sent before the person presses "Read my receipt", what's sent is the redacted
 * text and image, their extra cover and consent choice go with it, and a result can be
 * deleted. Also: Expo Go, errors, and Hindi.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { detectPii, pageFromLines, redactionBoxes, type ConfirmResponse, type ScanResponse } from '@remitbridge/receipt';

import ScanScreen from '@/app/(tabs)/index';
import { LanguageProvider } from '@/i18n';
import { canScan, discardPhotoFiles, recognize, renderRedacted } from '@/lib/receipt-scan';
import { confirmScan, forgetReceipt, sendScan } from '@/lib/receipts';

let mockSavedLanguage: string | null = null;
let mockAiConsent = true;
jest.mock('@/lib/current-tab', () => ({ useTabFocus: () => undefined, currentTab: () => '/' }));
// The tab's entrance needs navigation focus, which this test renders without.
jest.mock('@/components/motion-views', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return { FocusRise: View, Rise: View, RiseIn: View, GrowIn: View, GrowBar: View };
});
jest.mock('@/lib/prefs', () => ({
  prefs: {
    language: () => mockSavedLanguage,
    setLanguage: () => undefined,
    aiConsent: () => mockAiConsent,
    setAiConsent: () => {
      mockAiConsent = true;
    },
  },
}));
jest.mock('@/lib/track', () => ({ track: jest.fn() }));
jest.mock('@/lib/auth', () => ({ useAuth: () => ({ session: null }) }));
jest.mock('@/lib/name', () => ({ firstName: () => null }));
jest.mock('expo-image', () => ({ Image: () => null }));
jest.mock('expo-symbols', () => ({ SymbolView: () => null }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: async () => ({ granted: false }),
  requestMediaLibraryPermissionsAsync: async () => ({ granted: true }),
  launchImageLibraryAsync: async () => ({ canceled: false, assets: [{ uri: 'file:///r.jpg', width: 1200, height: 1600 }] }),
  launchCameraAsync: jest.fn(),
}));
jest.mock('@/lib/receipt-scan', () => ({
  canScan: jest.fn(() => true),
  preparePhoto: jest.fn(async () => ({ uri: 'file:///p.jpg', width: 400, height: 200, base64: 'ORIGINAL' })),
  recognize: jest.fn(),
  renderRedacted: jest.fn(() => 'REDACTED'),
  discardPhotoFiles: jest.fn(),
}));
jest.mock('@/lib/receipts', () => ({ sendScan: jest.fn(), confirmScan: jest.fn(), forgetReceipt: jest.fn(async () => true) }));
jest.mock('@/lib/open-compare', () => ({ openCompare: jest.fn() }));

const PAGE = pageFromLines(['WESTERN UNION', 'Sender: Maria Lopez', 'Transfer Amount $500.00', 'Total to Recipient 8,560.00 MXN']);

const RESULT: ScanResponse = {
  id: '11111111-2222-4333-8444-555555555555',
  expires_at: '2026-10-30T00:00:00Z',
  template_id: 'western-union',
  provider_id: 'western-union',
  route_id: 'us-mx',
  fields: {
    send_currency: { value: 'USD', confidence: 0.95, path: 'model', validated: true },
    receive_currency: { value: 'MXN', confidence: 0.95, path: 'model', validated: true },
    amount_sent: { value: 500, confidence: 0.95, path: 'parser', validated: true },
    amount_received: { value: 8560, confidence: 0.3, path: 'model', validated: false },
    funding_method: { value: 'cash', confidence: 0.9, path: 'model', validated: false },
  },
  checks: [],
  suspect: { field: 'amount_received', suggestion: 8600 },
  missing: [],
  to_confirm: ['amount_received'],
  model: { asked: ['amount_received'], error: null },
  redaction: 'device',
  disclosures_missing: [],
};

const CONFIRMED: ConfirmResponse = {
  id: RESULT.id,
  fields: {
    ...RESULT.fields,
    amount_received: { value: 8600, confidence: 1, path: 'user_corrected', validated: true },
    exchange_rate: { value: 17.2, confidence: 0.95, path: 'model', validated: true },
  },
  checks: [],
  suspect: null,
  missing: [],
  to_confirm: [],
  provider_id: 'western-union',
  route_id: 'us-mx',
  mid: { rate: 17.7, date: '2026-09-28', source: 'Frankfurter' },
  comparison: { quote: null, gap: null, reason: 'no_quote' },
  best: { best: null, reason: 'no_prices' },
  disclosures_missing: [],
};

beforeEach(() => {
  jest.mocked(canScan).mockReturnValue(true);
  jest.mocked(recognize).mockResolvedValue({ ok: true, page: PAGE, sharpness: 'sharp' });
  jest.mocked(renderRedacted).mockClear();
  jest.mocked(sendScan).mockReset();
  jest.mocked(confirmScan).mockReset();
  jest.mocked(forgetReceipt).mockClear();
});

afterEach(() => {
  mockSavedLanguage = null;
  mockAiConsent = true;
});

async function toPreview() {
  render(<ScanScreen />);
  fireEvent.press(screen.getByText('Choose a photo'));
  await screen.findByText('Check what’s covered');
  fireEvent(screen.getByTestId('receipt-photo'), 'layout', { nativeEvent: { layout: { width: 400, height: 200 } } });
}

it('in Expo Go, shows the screen, and a press says scanning needs the full build', () => {
  jest.mocked(canScan).mockReturnValue(false);
  render(<ScanScreen />);
  expect(screen.queryByText(/needs the full build/)).toBeNull();
  fireEvent.press(screen.getByText('Take a photo'));
  expect(screen.getByText(/needs the full build/)).toBeTruthy();
  expect(screen.queryByText('Check what’s covered')).toBeNull();
});

it('covers personal details before showing the preview, and sends nothing yet', async () => {
  await toPreview();
  const hidden = detectPii(PAGE);
  expect(jest.mocked(renderRedacted)).toHaveBeenLastCalledWith(expect.objectContaining({ base64: 'ORIGINAL' }), redactionBoxes(PAGE, hidden));
  expect(screen.getByText('One item covered')).toBeTruthy();
  expect(sendScan).not.toHaveBeenCalled();
  // Words the rules covered have no tap target; the others do.
  expect(screen.queryByLabelText('Word: Maria. Tap to cover it.')).toBeNull();
  expect(screen.getByLabelText('Word: WESTERN. Tap to cover it.')).toBeTruthy();
});

it('deletes the unredacted photo files as soon as the text is read (D135)', async () => {
  await toPreview();
  expect(discardPhotoFiles).toHaveBeenCalledWith('file:///r.jpg', 'file:///p.jpg');
});

it('lets the person cover another word and uncover it, redrawing each time', async () => {
  await toPreview();
  fireEvent.press(screen.getByLabelText('Word: WESTERN. Tap to cover it.'));
  expect(screen.getByText('2 items covered')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Covered by you. Tap to show it again.'));
  expect(screen.getByText('One item covered')).toBeTruthy();
  expect(jest.mocked(renderRedacted)).toHaveBeenCalledTimes(3);
});

it('sends the redacted text and image with the consent choice, then asks the person to check', async () => {
  jest.mocked(sendScan).mockResolvedValue({ ok: true, result: RESULT });
  await toPreview();
  fireEvent.press(screen.getByLabelText('Word: WESTERN. Tap to cover it.'));
  fireEvent(screen.getByLabelText('Keep this receipt for research'), 'valueChange', true);
  fireEvent.press(screen.getByText('Read my receipt'));
  await screen.findByText('Check each value');

  const sent = jest.mocked(sendScan).mock.calls[0][0];
  const text = JSON.stringify(sent.page);
  expect(text).not.toContain('Maria');
  expect(text).not.toContain('WESTERN');
  expect(text).toContain('$500.00');
  expect(sent.image).toEqual({ mediaType: 'image/jpeg', base64: 'REDACTED' });
  expect(sent.research_consent).toBe(true);
  expect(sent.today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(screen.getByText('$500.00')).toBeTruthy();
  expect(screen.getByText('One to check')).toBeTruthy();
});

it('goes from the answers to the result, and deletes the receipt on request', async () => {
  jest.mocked(sendScan).mockResolvedValue({ ok: true, result: RESULT });
  jest.mocked(confirmScan).mockResolvedValue({ ok: true, confirmed: CONFIRMED });
  await toPreview();
  fireEvent.press(screen.getByText('Read my receipt'));
  await screen.findByText('Check each value');
  fireEvent.press(screen.getByText('Amount received'));
  fireEvent.press(screen.getByText('Use MX$8,600.00'));
  fireEvent.press(screen.getByText('See what it cost'));
  await screen.findByText('What this transfer really cost');
  expect(jest.mocked(confirmScan).mock.calls[0][1]).toEqual({ amount_received: 8600 });
  fireEvent.press(screen.getByText('Delete this receipt now'));
  await screen.findByText('Deleted.');
  expect(forgetReceipt).toHaveBeenCalledWith(RESULT.id);
});

it('keeps the answers and says so when confirming fails', async () => {
  jest.mocked(sendScan).mockResolvedValue({ ok: true, result: RESULT });
  jest.mocked(confirmScan).mockResolvedValue({ ok: false, reason: 'expired' });
  await toPreview();
  fireEvent.press(screen.getByText('Read my receipt'));
  await screen.findByText('Check each value');
  fireEvent.press(screen.getByText('Amount received'));
  fireEvent.press(screen.getByText('This is right'));
  fireEvent.press(screen.getByText('See what it cost'));
  await screen.findByText(/has been deleted/);
  expect(screen.getByText('Check each value')).toBeTruthy();
});

it('keeps the preview and says so when sending fails', async () => {
  jest.mocked(sendScan).mockResolvedValue({ ok: false, reason: 'failed' });
  await toPreview();
  fireEvent.press(screen.getByText('Read my receipt'));
  await screen.findByText(/didn’t go through/);
  expect(screen.getByText('Check what’s covered')).toBeTruthy();
});

it('explains a photo with no text, or one it couldn’t line up', async () => {
  jest.mocked(recognize).mockResolvedValueOnce({ ok: false, reason: 'no_text' });
  render(<ScanScreen />);
  fireEvent.press(screen.getByText('Choose a photo'));
  await screen.findByText(/No text found/);
  jest.mocked(recognize).mockResolvedValueOnce({ ok: false, reason: 'misaligned' });
  fireEvent.press(screen.getByText('Choose a photo'));
  await screen.findByText(/nothing was covered/);
});

it('turns back a photo too blurry to read, before anything is covered or sent (D131)', async () => {
  jest.mocked(recognize).mockResolvedValueOnce({ ok: false, reason: 'blurry' });
  render(<ScanScreen />);
  fireEvent.press(screen.getByText('Choose a photo'));
  await screen.findByText(/too blurry to read/);
  expect(screen.queryByText('Check what’s covered')).toBeNull();
  expect(sendScan).not.toHaveBeenCalled();
});

it('warns on a slightly blurry photo, and still lets it through', async () => {
  jest.mocked(recognize).mockResolvedValueOnce({ ok: true, page: PAGE, sharpness: 'somewhat_blurry' });
  await toPreview();
  expect(screen.getByText(/a little blurry/)).toBeTruthy();
  expect(screen.getByText('Read my receipt')).toBeTruthy();
});

it('says so, and deletes the receipt, when no amount could be read at all', async () => {
  jest.mocked(sendScan).mockResolvedValue({
    ok: true,
    result: { ...RESULT, fields: { send_currency: RESULT.fields.send_currency }, to_confirm: [], suspect: null },
  });
  await toPreview();
  fireEvent.press(screen.getByText('Read my receipt'));
  await screen.findByText(/couldn’t read the amounts/);
  expect(forgetReceipt).toHaveBeenCalledWith(RESULT.id);
  expect(screen.queryByText('Check each value')).toBeNull();
});

it('asks for camera access when it’s refused', async () => {
  render(<ScanScreen />);
  fireEvent.press(screen.getByText('Take a photo'));
  await screen.findByText(/allow camera access/);
});

it('speaks Hindi when Hindi is chosen', async () => {
  mockSavedLanguage = 'hi';
  render(
    <LanguageProvider>
      <ScanScreen />
    </LanguageProvider>,
  );
  expect(screen.getByText('फ़ोटो लें')).toBeTruthy();
  await waitFor(() => expect(screen.getByText('फ़ोटो चुनें')).toBeTruthy());
});

it('asks once before anything can reach the AI model, and sends nothing on "Not now"', async () => {
  mockAiConsent = false;
  jest.mocked(sendScan).mockResolvedValue({ ok: true, result: RESULT });
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  await toPreview();
  expect(screen.getByText('An AI may read it')).toBeTruthy();

  fireEvent.press(screen.getByText('Read my receipt'));
  expect(alert).toHaveBeenCalledWith('Send to an AI service?', expect.stringContaining('Groq'), expect.any(Array));
  const [decline, allow] = alert.mock.calls[0][2]!;
  expect(decline.text).toBe('Not now');
  expect(jest.mocked(sendScan)).not.toHaveBeenCalled();

  allow.onPress!();
  await screen.findByText('Check each value');
  expect(jest.mocked(sendScan)).toHaveBeenCalledTimes(1);
  alert.mockRestore();
});
