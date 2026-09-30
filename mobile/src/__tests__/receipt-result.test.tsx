/**
 * The result screen's four parts: the true cost through the one formula, advertised vs.
 * paid (or why not), the tax check in neutral words, and "next time" into Compare.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';

import { computeTransferCost } from '@remitbridge/formula';
import type { ConfirmResponse, ExtractedFields, FieldValues } from '@remitbridge/receipt';

import { ReceiptResult } from '@/components/receipt-result';
import { money } from '@/lib/format';
import { openCompare } from '@/lib/open-compare';

jest.mock('@/lib/prefs', () => ({ prefs: { language: () => null, setLanguage: () => undefined } }));
jest.mock('@/lib/open-compare', () => ({ openCompare: jest.fn() }));
jest.mock('expo-symbols', () => ({ SymbolView: () => null }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const WU: Partial<FieldValues> = {
  provider: 'Western Union',
  send_currency: 'USD',
  receive_currency: 'MXN',
  amount_sent: 500,
  fee: 4.99,
  tax: 5,
  exchange_rate: 17.2,
  amount_received: 8560,
  pickup_charge: 40,
  transfer_date: '2026-09-28',
  funding_method: 'cash',
  delivery_method: 'cash_pickup',
};

const fields = (v: Partial<FieldValues>): ExtractedFields =>
  Object.fromEntries(Object.entries(v).map(([k, value]) => [k, { value, confidence: 1, path: 'user_corrected', validated: true }])) as ExtractedFields;

const confirmed = (over: Partial<ConfirmResponse> = {}, values: Partial<FieldValues> = WU): ConfirmResponse => ({
  id: 'r1',
  fields: fields(values),
  checks: [],
  suspect: null,
  missing: [],
  to_confirm: [],
  provider_id: 'western-union',
  route_id: 'us-mx',
  mid: { rate: 17.7, date: '2026-09-28', source: 'Frankfurter' },
  comparison: {
    quote: { id: 77, provider_id: 'western-union', captured_at: '2026-09-28T15:00:00Z', offered_rate: 17.3, send_amount: 500, delivery_method: 'cash_pickup', payment_method: 'cash' },
    gap: { advertisedRate: 17.3, receiptRate: 17.2, gapAmount: 2.82, gapCurrency: 'USD' },
    reason: null,
  },
  ...over,
});

const expected = computeTransferCost({ sent: 509.99, fee: 4.99, transferTax: 5, quotedRate: 17.2, midRate: 17.7, pickupCharge: 40 });

describe('true cost', () => {
  it('is the one formula’s total, with the tax on its own line', () => {
    render(<ReceiptResult confirmed={confirmed()} />);
    expect(screen.getByText(money(expected.totalCost, 'USD'))).toBeTruthy();
    expect(screen.getAllByText('Federal remittance tax').length).toBe(2); // the breakdown row and the section
    expect(screen.getByText('$5.00')).toBeTruthy();
    expect(screen.getByText(money(expected.markupCost, 'USD'))).toBeTruthy();
    expect(screen.getByText(/Mid-market rate from Frankfurter: 1 USD = 17\.7 MXN, for Sep 28, 2026/)).toBeTruthy();
  });

  it('says why when the day’s mid-market rate couldn’t be loaded', () => {
    render(<ReceiptResult confirmed={confirmed({ mid: null })} />);
    expect(screen.getByText(/couldn’t be loaded/)).toBeTruthy();
  });
});

describe('advertised vs. paid', () => {
  it('shows the advertised rate, the capture, the receipt’s rate and the gap', () => {
    render(<ReceiptResult confirmed={confirmed()} />);
    expect(screen.getByText(/Western Union showed 1 USD = 17\.3 MXN for this route at \$500, checked Sep 28/)).toBeTruthy();
    expect(screen.getByText('Your receipt: 1 USD = 17.2 MXN.')).toBeTruthy();
    expect(screen.getByText('The rate you got cost $2.82 more than the advertised one.')).toBeTruthy();
  });

  it.each([
    ['no_quote', /no price from this provider checked within a day/],
    ['not_tracked', /don’t check this provider’s prices/],
    ['no_route', /don’t check prices on this route yet/],
    ['missing_values', /date, amount or rate is missing/],
  ] as const)('says plainly when there’s nothing to compare (%s)', (reason, text) => {
    render(<ReceiptResult confirmed={confirmed({ comparison: { quote: null, gap: null, reason } })} />);
    expect(screen.getByText(text)).toBeTruthy();
  });
});

describe('the tax check', () => {
  it('confirms a correct 1% and shows the bank-funded equivalent', () => {
    render(<ReceiptResult confirmed={confirmed()} />);
    expect(screen.getByText('This one was paid by cash. 1% of $500.00 is $5.00, and the receipt shows $5.00.')).toBeTruthy();
    expect(screen.getByText(`Paid from a bank account instead, the same transfer would have cost ${money(expected.totalCost - 5, 'USD')} in total, $5.00 less.`)).toBeTruthy();
    expect(screen.getByText(/not yet checked against the IRS/)).toBeTruthy();
  });

  it('says a tax line wasn’t found, without implying anything', () => {
    const { tax: _tax, ...noTax } = WU;
    render(<ReceiptResult confirmed={confirmed({}, noTax)} />);
    expect(screen.getByText('This one was paid by cash. 1% of $500.00 is $5.00. No tax line was found on this receipt.')).toBeTruthy();
  });

  it('says the tax doesn’t apply to a card payment', () => {
    render(<ReceiptResult confirmed={confirmed({}, { ...WU, funding_method: 'debit_card', tax: undefined })} />);
    expect(screen.getByText('This one was paid by debit card, so the tax doesn’t apply.')).toBeTruthy();
    expect(screen.queryByText(/not yet checked against the IRS/)).toBeNull();
  });
});

describe('next time', () => {
  it('opens Compare on the same route, amount and delivery method', () => {
    render(<ReceiptResult confirmed={confirmed()} />);
    fireEvent.press(screen.getByText('Compare this route today'));
    expect(openCompare).toHaveBeenCalledWith({ routeId: 'us-mx', amount: 500, method: 'cash_pickup' });
  });

  it('says so when we don’t check the route', () => {
    render(<ReceiptResult confirmed={confirmed({ route_id: null })} />);
    expect(screen.getByText('We don’t check this route yet.')).toBeTruthy();
  });
});
