/**
 * The funding method in Compare and TrueCost (D80): a cash-type method adds the 1% federal
 * tax through the one formula, raising the total cost and leaving the amount received
 * (and so the ranking) alone; other methods change nothing.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';

import { computeTransferCost } from '@remitbridge/formula';

import TrueCostScreen from '@/app/true-cost';
import { money } from '@/lib/format';
import { atAmount, type LatestQuote } from '@/lib/quotes';
import { editText, formatValue, parseTyped, usDate } from '@/lib/receipt-format';
import { en } from '@/i18n/en';

jest.mock('@/lib/supabase', () => ({ supabase: null }));
jest.mock('@/lib/prefs', () => ({ prefs: { language: () => null, setLanguage: () => undefined } }));
jest.mock('@/lib/track', () => ({ track: jest.fn() }));
jest.mock('@/lib/auth', () => ({ useAuth: () => ({ session: null }) }));
jest.mock('expo-symbols', () => ({ SymbolView: () => null }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/lib/fx', () => ({
  ...jest.requireActual('@/lib/fx'),
  useMidRate: () => ({ state: 'ready', rate: 17.7, date: '2026-09-28', source: 'Frankfurter' }),
}));

const QUOTE = {
  id: 1,
  provider_id: 'x',
  provider_name: 'X',
  route_id: 'us-mx',
  send_currency: 'USD',
  receive_currency: 'MXN',
  send_amount: 500,
  delivery_method: 'bank_deposit',
  payment_method: 'cash',
  fee: 5,
  offered_rate: 17.2,
  mid_market_rate: 17.7,
  mid_market_source: 'test',
  pickup_charge: 0,
  amount_received: 8514,
  markup_pct: 2.82,
  total_cost: 18.96,
  total_cost_pct: 3.79,
  delivery_time: null,
  is_promotional: false,
  source: 'manual',
  captured_at: '2026-09-28T12:00:00Z',
  is_stale: false,
} as LatestQuote;

describe('Compare’s estimate with a funding method', () => {
  it('leaves a bank-funded price exactly as checked', () => {
    expect(atAmount(QUOTE, 500)).toEqual({ ...QUOTE, basedOn: null, tax: 0 });
  });

  it('adds 1% of the transfer amount for cash, through the formula, without changing what arrives', () => {
    const shown = atAmount(QUOTE, 500, 'cash')!;
    const expected = computeTransferCost({ sent: 504.95, fee: 5, transferTax: 4.95, quotedRate: 17.2, midRate: 17.7 });
    expect(shown.tax).toBe(4.95);
    expect(shown.total_cost).toBeCloseTo(expected.totalCost, 9);
    expect(shown.amount_received).toBeCloseTo(495 * 17.2, 9);
    expect(shown.basedOn).toBeNull();
  });

  it('does the same between checked amounts', () => {
    const shown = atAmount(QUOTE, 700, 'money_order')!;
    expect(shown.tax).toBe(6.95);
    expect(shown.basedOn).toBe(500);
  });
});

describe('TrueCost with a funding method', () => {
  const fill = () => {
    render(<TrueCostScreen />);
    fireEvent.changeText(screen.getByLabelText('Fee, in USD'), '5');
    fireEvent.changeText(screen.getByLabelText('Rate you got, in MXN'), '17.2');
  };

  it('has no tax for a bank account', () => {
    fill();
    const plain = computeTransferCost({ sent: 200, fee: 5, quotedRate: 17.2, midRate: 17.7 });
    expect(screen.getByText(money(plain.totalCost, 'USD'))).toBeTruthy();
    expect(screen.queryByText(/federal tax/)).toBeNull();
  });

  it('adds and explains the 1% for cash, in the total cost', () => {
    fill();
    fireEvent.press(screen.getByText('Cash'));
    const taxed = computeTransferCost({ sent: 201.95, fee: 5, transferTax: 1.95, quotedRate: 17.2, midRate: 17.7 });
    expect(screen.getByText(money(taxed.totalCost, 'USD'))).toBeTruthy();
    expect(screen.getByText('Paid by cash, so a 1% federal tax of $1.95 is added. It’s in the total cost.')).toBeTruthy();
    expect(screen.getByText('Federal remittance tax')).toBeTruthy();
  });
});

describe('typing and showing receipt values', () => {
  it('reads US dates and refuses impossible ones', () => {
    expect(usDate('9/28/2026')).toBe('2026-09-28');
    expect(usDate('02/30/2026')).toBeUndefined();
    expect(parseTyped('amount_sent', '1,250.50')).toBe(1250.5);
    expect(parseTyped('amount_sent', '')).toBeUndefined();
    expect(parseTyped('send_currency', 'usd')).toBe('USD');
    expect(editText('transfer_date', '2026-09-08')).toBe('9/8/2026');
  });

  it('shows amounts in the right currency and methods in words', () => {
    const v = { send_currency: 'USD', receive_currency: 'MXN' };
    expect(formatValue('fee', 4.99, v, en)).toBe('$4.99');
    expect(formatValue('amount_received', 8560, v, en)).toBe('MX$8,560.00');
    expect(formatValue('funding_method', 'cashiers_check', v, en)).toBe('Cashier’s check');
    expect(formatValue('transfer_date', '2026-09-28', v, en)).toBe('Sep 28, 2026');
  });
});
