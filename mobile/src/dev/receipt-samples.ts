import {
  bestOption,
  pageFromLines,
  valuesFrom,
  type ConfirmResponse,
  type ExtractedFields,
  type PriceCandidate,
  type ScanResponse,
} from '@remitbridge/receipt';

/**
 * Sample receipts for the receipt preview screen (development builds only, D124), so the
 * scanner's later screens can be seen and polished in Expo Go, which can't run the scan.
 * Made up: no real person, transfer or price.
 */

const field = (value: unknown, confidence = 0.95, path: 'parser' | 'model' | 'user_corrected' = 'model') => ({
  value,
  confidence,
  path,
  validated: confidence >= 0.8,
});

/** A published standing price, as the comparison reads it. */
const price = (over: Partial<PriceCandidate>): PriceCandidate => ({
  id: 1,
  provider_id: 'ria',
  provider_name: 'Ria',
  route_id: 'us-mx',
  send_amount: 500,
  delivery_method: 'cash_pickup',
  payment_method: 'cash',
  fee: 2,
  offered_rate: 17.5,
  mid_market_rate: 17.7,
  pickup_charge: 0,
  is_promotional: false,
  captured_at: '2026-09-28T16:00:00Z',
  ...over,
});

/** Western Union, $500 in cash to a cash pickup in Mexico. */
const WU_FIELDS = {
  provider: field('Western Union'),
  send_currency: field('USD'),
  receive_currency: field('MXN'),
  amount_sent: field(500, 0.95, 'parser'),
  fee: field(4.99),
  tax: field(5),
  total_paid: field(509.99),
  exchange_rate: field(17.2),
  amount_received: field(8560, 0.4),
  pickup_charge: field(40),
  transfer_date: field('2026-09-28'),
  funding_method: field('cash', 0.9),
  delivery_method: field('cash_pickup', 0.9),
} as unknown as ExtractedFields;

export const SAMPLE_PAGE = pageFromLines([
  'WESTERN UNION',
  'Sender: [hidden]',
  'Receiver: [hidden]',
  'Transfer Amount $500.00',
  'Transfer Fees $4.99',
  'Transfer Taxes $5.00',
  'Total $509.99',
  'Exchange Rate 1 USD = 17.2000 MXN',
  'Transfer Amount 8,600.00 MXN',
  'Other Fees 40.00 MXN',
  'Total to Recipient 8,560.00 MXN',
]);

export const SAMPLE_SCAN: ScanResponse = {
  id: '00000000-0000-4000-8000-000000000001',
  expires_at: '2026-10-31T00:00:00Z',
  template_id: 'western-union',
  provider_id: 'western-union',
  route_id: 'us-mx',
  fields: WU_FIELDS,
  checks: [],
  suspect: { field: 'amount_received', suggestion: 8560 },
  missing: [],
  to_confirm: ['amount_received'],
  model: { asked: ['amount_received'], error: null },
  redaction: 'device',
  disclosures_missing: ['error_rights', 'cfpb_contact'],
};

const confirmedFields = { ...WU_FIELDS, amount_received: field(8560, 1, 'user_corrected') } as ExtractedFields;

/** The cash receipt, with that day's prices: another provider would have left more. */
export const SAMPLE_RESULT: ConfirmResponse = {
  id: SAMPLE_SCAN.id,
  fields: confirmedFields,
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
  // Worked out by the real comparison, so the sample can't disagree with the true cost above it.
  best: bestOption(
    valuesFrom(confirmedFields),
    {
      thatDay: [
        price({}),
        price({ id: 2, provider_id: 'western-union', provider_name: 'Western Union', fee: 4.99, offered_rate: 17.3, pickup_charge: 40 }),
      ],
      latest: [],
    },
    17.7,
    'western-union',
  ),
  disclosures_missing: ['error_rights', 'cfpb_contact'],
};

/** A bank transfer to India by card, a month old: today's prices, and a bank payment. */
const TODAY_FIELDS = {
  provider: field('Remitly'),
  send_currency: field('USD'),
  receive_currency: field('INR'),
  amount_sent: field(350, 1, 'user_corrected'),
  fee: field(3.99),
  exchange_rate: field(94.2),
  amount_received: field(32970),
  transfer_date: field('2026-09-01'),
  funding_method: field('debit_card'),
  delivery_method: field('bank_deposit'),
} as unknown as ExtractedFields;

export const SAMPLE_RESULT_TODAY: ConfirmResponse = {
  ...SAMPLE_RESULT,
  fields: TODAY_FIELDS,
  provider_id: 'remitly',
  route_id: 'us-in',
  mid: { rate: 95.4, date: '2026-09-01', source: 'Frankfurter' },
  comparison: { quote: null, gap: null, reason: 'no_quote' },
  best: bestOption(
    valuesFrom(TODAY_FIELDS),
    {
      thatDay: [],
      latest: [
        price({ provider_id: 'instarem', provider_name: 'Instarem', route_id: 'us-in', send_amount: 200, delivery_method: 'bank_deposit', payment_method: 'bank_account', fee: 0, offered_rate: 95.32, mid_market_rate: 95.4, captured_at: '2026-10-01T07:06:00Z' }),
        price({ id: 3, provider_id: 'wise', provider_name: 'Wise', route_id: 'us-in', send_amount: 200, delivery_method: 'bank_deposit', payment_method: 'bank_account', fee: 6.11, offered_rate: 95.96, mid_market_rate: 95.4, captured_at: '2026-10-01T07:08:00Z' }),
      ],
    },
    95.4,
    'remitly',
  ),
  disclosures_missing: [],
};

/** The cash receipt with no fair price to compare: says why instead of a number. */
export const SAMPLE_RESULT_NONE: ConfirmResponse = {
  ...SAMPLE_RESULT,
  comparison: { quote: null, gap: null, reason: 'no_quote' },
  best: { best: null, reason: 'no_prices' },
};
