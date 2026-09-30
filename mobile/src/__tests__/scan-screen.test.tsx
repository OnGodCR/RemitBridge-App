/**
 * The scan screen's flow (app/scan.tsx), with the photo, OCR, drawing and network faked:
 * nothing is sent before the person presses "Read my receipt", what's sent is the redacted
 * text and image, their extra cover and consent choice go with it, and a result can be
 * deleted. Also: Expo Go, errors, and Hindi.
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { detectPii, pageFromLines, redactionBoxes, type ScanResponse } from '@remitbridge/receipt';

import ScanScreen from '@/app/scan';
import { setLanguage } from '@/i18n';
import { canScan, recognize, renderRedacted } from '@/lib/receipt-scan';
import { forgetReceipt, sendScan } from '@/lib/receipts';

jest.mock('@/lib/prefs', () => ({ prefs: { language: () => null, setLanguage: () => undefined } }));
jest.mock('@/lib/track', () => ({ track: jest.fn() }));
jest.mock('expo-image', () => ({ Image: () => null }));
jest.mock('expo-symbols', () => ({ SymbolView: () => null }));
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
}));
jest.mock('@/lib/receipts', () => ({ sendScan: jest.fn(), forgetReceipt: jest.fn(async () => true) }));

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
};

beforeEach(() => {
  jest.mocked(canScan).mockReturnValue(true);
  jest.mocked(recognize).mockResolvedValue({ ok: true, page: PAGE });
  jest.mocked(renderRedacted).mockClear();
  jest.mocked(sendScan).mockReset();
});

afterEach(() => act(() => setLanguage('en')));

async function toPreview() {
  render(<ScanScreen />);
  fireEvent.press(screen.getByText('Choose a photo'));
  await screen.findByText('Check what’s covered');
  fireEvent(screen.getByTestId('receipt-photo'), 'layout', { nativeEvent: { layout: { width: 400, height: 200 } } });
}

it('in Expo Go, says scanning needs the full build and offers no buttons', () => {
  jest.mocked(canScan).mockReturnValue(false);
  render(<ScanScreen />);
  expect(screen.getByText(/needs the full build/)).toBeTruthy();
  expect(screen.queryByText('Take a photo')).toBeNull();
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

it('lets the person cover another word and uncover it, redrawing each time', async () => {
  await toPreview();
  fireEvent.press(screen.getByLabelText('Word: WESTERN. Tap to cover it.'));
  expect(screen.getByText('2 items covered')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Covered by you. Tap to show it again.'));
  expect(screen.getByText('One item covered')).toBeTruthy();
  expect(jest.mocked(renderRedacted)).toHaveBeenCalledTimes(3);
});

it('sends the redacted text and image with the consent choice, then shows what was read', async () => {
  jest.mocked(sendScan).mockResolvedValue({ ok: true, result: RESULT });
  await toPreview();
  fireEvent.press(screen.getByLabelText('Word: WESTERN. Tap to cover it.'));
  fireEvent(screen.getByLabelText('Keep this receipt for research'), 'valueChange', true);
  fireEvent.press(screen.getByText('Read my receipt'));
  await screen.findByText('What the app read');

  const sent = jest.mocked(sendScan).mock.calls[0][0];
  const text = JSON.stringify(sent.page);
  expect(text).not.toContain('Maria');
  expect(text).not.toContain('WESTERN');
  expect(text).toContain('$500.00');
  expect(sent.image).toEqual({ mediaType: 'image/jpeg', base64: 'REDACTED' });
  expect(sent.research_consent).toBe(true);
  expect(sent.today).toMatch(/^\d{4}-\d{2}-\d{2}$/);

  expect(screen.getByText('5 of 13 values read.')).toBeTruthy();
  expect(screen.getByText('$500.00')).toBeTruthy();
  expect(screen.getByText('MX$8,560.00')).toBeTruthy();
  expect(screen.getByText('Cash')).toBeTruthy();
  expect(screen.getAllByText('Read by AI').length).toBeGreaterThan(0);
  expect(screen.getByText('Please check')).toBeTruthy();
});

it('deletes the receipt on request', async () => {
  jest.mocked(sendScan).mockResolvedValue({ ok: true, result: RESULT });
  await toPreview();
  fireEvent.press(screen.getByText('Read my receipt'));
  fireEvent.press(await screen.findByText('Delete this receipt now'));
  await screen.findByText('Deleted.');
  expect(forgetReceipt).toHaveBeenCalledWith(RESULT.id);
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

it('asks for camera access when it’s refused', async () => {
  render(<ScanScreen />);
  fireEvent.press(screen.getByText('Take a photo'));
  await screen.findByText(/allow camera access/);
});

it('speaks Hindi when Hindi is chosen', async () => {
  act(() => setLanguage('hi'));
  render(<ScanScreen />);
  expect(screen.getByText('फ़ोटो लें')).toBeTruthy();
  expect(screen.getByText('यह क्या नहीं बताता')).toBeTruthy();
  await waitFor(() => expect(screen.getByText('फ़ोटो चुनें')).toBeTruthy());
});
