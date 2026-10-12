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

/** Renders the result with its details shown, where everything below the two answers is. */
const open = (c: ConfirmResponse, onAnother = jest.fn()) => {
  render(<ReceiptResult confirmed={c} onAnother={onAnother} />);
  fireEvent.press(screen.getByText('Show the details'));
};

const expected = computeTransferCost({ sent: 509.99, fee: 4.99, transferTax: 5, quotedRate: 17.2, midRate: 17.7, pickupCharge: 40 });

describe('true cost', () => {
  it('is the one formula’s total, with the tax on its own line', () => {
    open(confirmed());
    // The answer at the top, and the cash-vs-bank bars in the details.
    expect(screen.getAllByText(money(expected.totalCost, 'USD')).length).toBe(2);
    expect(screen.getAllByText('Federal remittance tax').length).toBe(2); // the cost bar's legend and the section
    expect(screen.getAllByText('$5.00').length).toBeGreaterThan(0);
    expect(screen.getByText(money(expected.markupCost, 'USD'))).toBeTruthy();
    // The charts say the same in words, for VoiceOver.
    expect(screen.getByLabelText(/This cost 5\.\d+%\. World average 6\.36%, UN target 3%\./)).toBeTruthy();
    expect(screen.getByLabelText(/^MXN\s8,560\.00 arrived, of MXN\s9,026\.82 possible\./)).toBeTruthy();
    expect(screen.getByText(/Mid-market rate: 1 USD = 17\.7 MXN \(Frankfurter, Sep 28, 2026\)/)).toBeTruthy();
  });

  it('says why when the day’s mid-market rate couldn’t be loaded', () => {
    open(confirmed({ mid: null }));
    expect(screen.getAllByText(/Couldn’t load that day’s mid-market rate/).length).toBeGreaterThan(0);
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
    open(confirmed({ best: best() }));
    expect(screen.getByText('With Ria, you could have kept')).toBeTruthy();
    expect(screen.getAllByText('$12.68')).toHaveLength(2); // at the top, and in the details
    expect(screen.getByText(/Your family would have received MXN\s8,710\.00/)).toBeTruthy();
    expect(screen.getByLabelText('Your cost $23.60. Ria: $10.92.')).toBeTruthy();
    expect(screen.getByText(/^Prices checked /)).toBeTruthy();
    expect(screen.getByText('Compared with: Ria, Western Union.')).toBeTruthy();
  });

  it('says plainly when today’s prices stand in, when the amount was estimated, and a bank payment', () => {
    open(confirmed({ best: best({ when: 'today', estimated: true, checked_amount: 200, paid_from: 'bank_account' }) }));
    expect(screen.getByText(/No prices from Sep 28, 2026, so these are today’s/)).toBeTruthy();
    expect(screen.getByText(/Estimated from the \$200 price/)).toBeTruthy();
    expect(screen.getByText(/Paying from a bank account usually costs less/)).toBeTruthy();
  });

  it('says so when the receipt already had the best price, and why when there is nothing to compare', () => {
    open(confirmed({ best: best({ provider_name: 'Western Union', same_provider: true, could_keep: 0 }) }));
    expect(screen.getByText('Western Union was already the best price we found.')).toBeTruthy();
    expect(screen.queryByText(/, you could have kept/)).toBeNull();
    screen.unmount();
    open(confirmed());
    expect(screen.getByText(/No prices yet for this kind of transfer/)).toBeTruthy();
  });
});

describe('advertised vs. paid', () => {
  it('shows the advertised rate, the capture, the receipt’s rate and the gap', () => {
    open(confirmed());
    expect(screen.getByLabelText('Mid-market rate 1 USD = 17.7 MXN. Advertised 1 USD = 17.3 MXN. Your receipt 1 USD = 17.2 MXN.')).toBeTruthy();
    expect(screen.getByText(/Advertised price checked Sep 28/)).toBeTruthy();
    expect(screen.getByText('Your rate cost $2.82 more than advertised.')).toBeTruthy();
  });

  it.each([
    ['no_quote', /No price from this provider that day/],
    ['not_tracked', /don’t check this provider yet/],
    ['no_route', /don’t check this route yet/],
    ['missing_values', /date, amount or rate is missing/],
  ] as const)('says plainly when there’s nothing to compare (%s)', (reason, text) => {
    open(confirmed({ comparison: { quote: null, gap: null, reason } }));
    expect(screen.getByText(text)).toBeTruthy();
  });
});

describe('the tax check', () => {
  it('confirms a correct 1% and shows the bank-funded equivalent', () => {
    open(confirmed());
    expect(screen.getByText('Paid by cash. 1% of $500.00 is $5.00. The receipt shows $5.00.')).toBeTruthy();
    expect(screen.getByLabelText(`From a bank account: ${money(expected.totalCost - 5, 'USD')} total, $5.00 less.`)).toBeTruthy();
    expect(screen.getByText('From a bank account')).toBeTruthy();
    expect(screen.getByText(/proposed rules/)).toBeTruthy();
  });

  it('says a tax line wasn’t found, without implying anything', () => {
    const { tax: _tax, ...noTax } = WU;
    open(confirmed({}, noTax));
    expect(screen.getByText('Paid by cash. 1% of $500.00 is $5.00. No tax line found.')).toBeTruthy();
  });

  it('says the tax doesn’t apply to a card payment', () => {
    open(confirmed({}, { ...WU, funding_method: 'debit_card', tax: undefined }));
    expect(screen.getByText('Paid by debit card, so no tax applies.')).toBeTruthy();
    expect(screen.queryByText(/proposed rules/)).toBeNull();
  });
});

describe('next time', () => {
  it('opens Compare on the same route, amount and delivery method', () => {
    open(confirmed());
    fireEvent.press(screen.getByText('Compare this route today'));
    expect(openCompare).toHaveBeenCalledWith({ routeId: 'us-mx', amount: 500, method: 'cash_pickup' });
  });

  it('says so when we don’t check the route', () => {
    open(confirmed({ route_id: null }));
    expect(screen.getByText('We don’t check this route yet.')).toBeTruthy();
  });
});

describe('standard disclosures', () => {
  it('names what wasn’t found, and says that isn’t a finding', () => {
    open(confirmed({ disclosures_missing: ['error_rights', 'cfpb_contact'] }));
    expect(screen.getByText('Not found on this receipt')).toBeTruthy();
    expect(screen.getByText('your rights if there’s an error')).toBeTruthy();
    expect(screen.getByText('the CFPB’s contact details')).toBeTruthy();
    expect(screen.getByText(/so this isn’t proof/)).toBeTruthy();
  });

  it('says so when everything was found', () => {
    open(confirmed());
    expect(screen.getByText('Every standard item was found.')).toBeTruthy();
    expect(screen.getByText('What this does not tell you')).toBeTruthy();
  });
});

describe('a small transfer', () => {
  it('says the tax doesn’t apply to $15 or less', () => {
    open(confirmed({ fields: fields({ ...WU, amount_sent: 12, fee: 2, tax: undefined, amount_received: 206.4 }) }));
    expect(screen.getByText('$15 or less, so no tax applies.')).toBeTruthy();
  });
});

describe('at a glance (D153)', () => {
  it('shows the cost with a plain mark, its parts, and the two things to do, until asked for more', () => {
    const onAnother = jest.fn();
    render(<ReceiptResult confirmed={confirmed()} onAnother={onAnother} />);
    expect(screen.getByText('This transfer cost you')).toBeTruthy();
    expect(screen.getByText(/^About average: 5\.\d% of what you sent$/)).toBeTruthy();
    expect(screen.getByText('Compare this route today')).toBeTruthy();
    expect(screen.getByText('Where the cost came from')).toBeTruthy();
    expect(screen.getByText('What arrived')).toBeTruthy();
    expect(screen.queryByText('Advertised vs. paid')).toBeNull();
    expect(screen.queryByText('What this does not tell you')).toBeNull();
    fireEvent.press(screen.getByText('Scan another receipt'));
    expect(onAnother).toHaveBeenCalled();
  });

  it('says what could have been saved, and with whom', () => {
    render(
      <ReceiptResult
        confirmed={confirmed({
          best: {
            best: {
              when: 'that_day', provider_id: 'ria', provider_name: 'Ria', captured_at: '2026-09-28T15:00:00Z', checked_amount: 500,
              estimated: false, fee: 2, offered_rate: 17.5, received: 8710, total_cost: 10.92, your_total_cost: 23.6, could_keep: 12.68,
              currency: 'USD', same_provider: false, paid_from: null, providers_compared: ['Ria'],
            },
            reason: null,
          },
        })}
        onAnother={jest.fn()}
      />,
    );
    expect(screen.getByText('With Ria, you could have saved')).toBeTruthy();
    expect(screen.getByText('$12.68')).toBeTruthy();
  });
});

