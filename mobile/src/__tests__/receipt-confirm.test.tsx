/**
 * The confirmation screen: values to check come first and are marked, each needs an answer
 * before the result, answers can be a correction, the suggestion, or "This is right", and
 * a bad value is refused on the phone before it goes anywhere.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';

import { pageFromLines, type ScanResponse } from '@remitbridge/receipt';

import { ReceiptConfirm } from '@/components/receipt-confirm';

jest.mock('@/lib/prefs', () => ({ prefs: { language: () => null, setLanguage: () => undefined } }));
jest.mock('expo-image', () => ({ Image: () => null }));
jest.mock('expo-symbols', () => ({ SymbolView: () => null }));

const page = pageFromLines(['WESTERN UNION', 'Transfer Amount $500.00', 'Total to Recipient 8,650.00 MXN', 'Date: 09/28/2026']);

const RESULT: ScanResponse = {
  id: 'r1',
  expires_at: null,
  template_id: 'western-union',
  provider_id: 'western-union',
  route_id: 'us-mx',
  fields: {
    send_currency: { value: 'USD', confidence: 0.95, path: 'model', validated: true },
    receive_currency: { value: 'MXN', confidence: 0.95, path: 'model', validated: true },
    amount_sent: { value: 500, confidence: 0.95, path: 'parser', validated: true, source: { line: 1, words: [2, 3] } },
    amount_received: { value: 8650, confidence: 0.3, path: 'model', validated: false, source: { line: 2 } },
    transfer_date: { value: '2026-09-28', confidence: 0.9, path: 'model', validated: false, source: { line: 3 } },
  },
  checks: [],
  suspect: { field: 'amount_received', suggestion: 8600 },
  missing: ['funding_method'],
  to_confirm: ['amount_received', 'funding_method'],
  model: { asked: [], error: null },
  redaction: 'device',
};

function setup() {
  const onConfirm = jest.fn();
  render(<ReceiptConfirm photo={{ width: 400, height: 96, redacted: 'R' }} page={page} result={RESULT} sending={false} onConfirm={onConfirm} />);
  fireEvent(screen.getByTestId('confirm-photo'), 'layout', { nativeEvent: { layout: { width: 400, height: 96 } } });
  return onConfirm;
}

it('outlines each value where it was read, marking the ones to check', () => {
  setup();
  expect(screen.getByLabelText('Amount received: MX$8,650.00. Please check')).toBeTruthy();
  expect(screen.getByLabelText('Amount sent: $500.00')).toBeTruthy();
  expect(screen.getAllByText('Please check')).toHaveLength(2);
});

it('won’t go on until every value to check has an answer', () => {
  const onConfirm = setup();
  expect(screen.getByText('2 to check')).toBeTruthy();
  fireEvent.press(screen.getByText('2 to check'));
  expect(onConfirm).not.toHaveBeenCalled();
});

it('takes the suggestion, a choice from the list, and sends the answers', () => {
  const onConfirm = setup();
  fireEvent.press(screen.getByLabelText('Amount received: MX$8,650.00. Please check'));
  expect(screen.getByText('The other numbers suggest MX$8,600.00.')).toBeTruthy();
  fireEvent.press(screen.getByText('Use MX$8,600.00'));
  fireEvent.press(screen.getByText('Paid with'));
  fireEvent.press(screen.getByText('Money order'));
  fireEvent.press(screen.getByText('See what it cost'));
  expect(onConfirm).toHaveBeenCalledWith({ amount_received: 8600, funding_method: 'money_order' });
});

it('refuses a date that isn’t real or is in the future', () => {
  setup();
  fireEvent.press(screen.getByText('Date sent'));
  const input = screen.getByLabelText('Date sent');
  fireEvent.changeText(input, '13/45/2026');
  fireEvent.press(screen.getByText('Save'));
  expect(screen.getByText('That doesn’t look right for Date sent. Check it and try again.')).toBeTruthy();
  fireEvent.changeText(input, '9/27/2026');
  fireEvent.press(screen.getByText('Save'));
  expect(screen.getByText('Sep 27, 2026')).toBeTruthy();
  expect(screen.getAllByText('You entered').length).toBe(1);
});
