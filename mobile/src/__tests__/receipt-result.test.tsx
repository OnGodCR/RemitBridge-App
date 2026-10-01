/**
 * The result screen's parts: the true cost through the one formula, advertised vs. paid
 * (or why not), the tax check in neutral words, the disclosures not found, and "next time"
 * into Compare.
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
  best: { best: null, reason: 'no_prices' },
  disclosures_missing: [],
  ...over,
});

const expected = computeTransferCost({ sent: 509.99, fee: 4.99, transferTax: 5, quotedRate: 17.2, midRate: 17.7, pickupCharge: 40 });

describe('true cost', () => {
  it('is the one formula’s total, with the tax on its own line', () => {
    render(<ReceiptResult confirmed={confirmed()} />);
    // The headline, and again on the cash-vs-bank bars in the tax check.
    expect(screen.getAllByText(money(expected.totalCost, 'USD')).length).toBe(2);
    expect(screen.getAllByText('Federal remittance tax').length).toBe(2); // the cost bar's legend and the section
    expect(screen.getAllByText('$5.00').length).toBeGreaterThan(0);
    expect(screen.getByText(money(expected.markupCost, 'USD'))).toBeTruthy();
    // The charts say the same in words, for VoiceOver.
    expect(screen.getByLabelText(/This transfer cost 5\.\d+% of what was sent\. The world average is 6\.36%; the UN target is 3%\./)).toBeTruthy();
    expect(screen.getByLabelText(/^MX\$8,560\.00 arrived\. At the mid-market rate with no fee, MX\$9,026\.82 would have\./)).toBeTruthy();
    expect(screen.getByText(/Mid-market rate from Frankfurter: 1 USD = 17\.7 MXN, for Sep 28, 2026/)).toBeTruthy();
  });

  it('says why when the day’s mid-market rate couldn’t be loaded', () => {
    render(<ReceiptResult confirmed={confirmed({ mid: null })} />);
    expect(screen.getByText(/couldn’t be loaded/)).toBeTruthy();
  });
});

describe('what you could have kept (D119)', () => {
  const best = (over: Partial<NonNullable<ConfirmResponse['best']['best']>> = {}): ConfirmResponse['best'] => ({
    best: {
      when: 'that_day',
      provider_id: 'ria',
      provider_name: 'Ria',
      captured_at: '2026-09-28T15:00:00Z',
      checked_amount: 500,
      estimated: false,
      fee: 2,
      offered_rate: 17.5,
      received: 8710,
      total_cost: 10.92,
      your_total_cost: 23.6,
      could_keep: 12.68,
      currency: 'USD',
      same_provider: false,
      paid_from: null,
      providers_compared: ['Ria', 'Western Union'],
      ...over,
    },
    reason: null,
  });

  it('leads with what could have been kept, names who, and says what was compared', () => {
    render(<ReceiptResult confirmed={confirmed({ best: best() })} />);
    expect(screen.getByText('With Ria, you could have kept')).toBeTruthy();
    expect(screen.getByText('$12.68')).toBeTruthy();
    expect(screen.getByText(/your family would have received MX\$8,710\.00/)).toBeTruthy();
    expect(screen.getByLabelText('Your cost $23.60. Ria: $10.92.')).toBeTruthy();
    expect(screen.getByText(/within a day of your transfer/)).toBeTruthy();
    expect(screen.getByText('Compared with: Ria, Western Union. We don’t have prices from every provider yet.')).toBeTruthy();
  });

  it('says plainly when today’s prices stand in, when the amount was estimated, and a bank payment', () => {
    render(<ReceiptResult confirmed={confirmed({ best: best({ when: 'today', estimated: true, checked_amount: 200, paid_from: 'bank_account' }) })} />);
    expect(screen.getByText(/We don’t have prices from Sep 28, 2026, so these are today’s/)).toBeTruthy();
    expect(screen.getByText(/the price for \$200, the nearest amount we check/)).toBeTruthy();
    expect(screen.getByText(/That’s paying from a bank account/)).toBeTruthy();
  });

  it('says so when the receipt already had the best price, and why when there is nothing to compare', () => {
    render(<ReceiptResult confirmed={confirmed({ best: best({ provider_name: 'Western Union', same_provider: true, could_keep: 0 }) })} />);
    expect(screen.getByText('You already had the best price we found: Western Union.')).toBeTruthy();
    expect(screen.queryByText(/, you could have kept/)).toBeNull();
    screen.unmount();
    render(<ReceiptResult confirmed={confirmed()} />);
    expect(screen.getByText(/nothing fair to compare with/)).toBeTruthy();
  });
});

describe('advertised vs. paid', () => {
  it('shows the advertised rate, the capture, the receipt’s rate and the gap', () => {
    render(<ReceiptResult confirmed={confirmed()} />);
    expect(screen.getByLabelText('Mid-market rate 1 USD = 17.7 MXN. Advertised 1 USD = 17.3 MXN. Your receipt 1 USD = 17.2 MXN.')).toBeTruthy();
    expect(screen.getByText(/Advertised price checked Sep 28/)).toBeTruthy();
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
    expect(screen.getByLabelText(`Paid from a bank account instead, the same transfer would have cost ${money(expected.totalCost - 5, 'USD')} in total, $5.00 less.`)).toBeTruthy();
    expect(screen.getByText('From a bank account')).toBeTruthy();
    expect(screen.getByText(/proposed rules do/)).toBeTruthy();
  });

  it('says a tax line wasn’t found, without implying anything', () => {
    const { tax: _tax, ...noTax } = WU;
    render(<ReceiptResult confirmed={confirmed({}, noTax)} />);
    expect(screen.getByText('This one was paid by cash. 1% of $500.00 is $5.00. No tax line was found on this receipt.')).toBeTruthy();
  });

  it('says the tax doesn’t apply to a card payment', () => {
    render(<ReceiptResult confirmed={confirmed({}, { ...WU, funding_method: 'debit_card', tax: undefined })} />);
    expect(screen.getByText('This one was paid by debit card, so the tax doesn’t apply.')).toBeTruthy();
    expect(screen.queryByText(/proposed rules do/)).toBeNull();
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

describe('standard disclosures', () => {
  it('names what wasn’t found, and says that isn’t a finding', () => {
    render(<ReceiptResult confirmed={confirmed({ disclosures_missing: ['error_rights', 'cfpb_contact'] })} />);
    expect(screen.getByText('Not found on this receipt')).toBeTruthy();
    expect(screen.getByText('your rights if there’s an error')).toBeTruthy();
    expect(screen.getByText('the CFPB’s contact details')).toBeTruthy();
    expect(screen.getByText(/doesn’t mean the provider left anything out/)).toBeTruthy();
  });

  it('says so when everything was found', () => {
    render(<ReceiptResult confirmed={confirmed()} />);
    expect(screen.getByText('Every standard item was found on this receipt.')).toBeTruthy();
    expect(screen.getByText('What this does not tell you')).toBeTruthy();
  });
});

describe('a small transfer', () => {
  it('says the tax doesn’t apply to $15 or less', () => {
    render(<ReceiptResult confirmed={confirmed({ fields: fields({ ...WU, amount_sent: 12, fee: 2, tax: undefined, amount_received: 206.4 }) })} />);
    expect(screen.getByText('This was a transfer of $15 or less, so the tax doesn’t apply.')).toBeTruthy();
  });
});

