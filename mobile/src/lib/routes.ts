/**
 * Tier 1 routes (PRD 6.1). Mirrors engine/src/remitbridge_engine/config.py and the seed in
 * supabase/migrations; keep the three in step. "Route" in the UI, "corridor" in docs
 * (PRD 14.4).
 */

export type DeliveryMethod =
  | 'bank_deposit'
  | 'cash_pickup'
  | 'mobile_wallet'
  | 'upi'
  | 'debit_card'
  | 'home_delivery';

export interface Route {
  id: string;
  country: string;
  sendCurrency: string;
  receiveCurrency: string;
  deliveryMethods: DeliveryMethod[];
}

export const ROUTES: Route[] = [
  {
    id: 'us-in',
    country: 'India',
   
    sendCurrency: 'USD',
    receiveCurrency: 'INR',
    deliveryMethods: ['bank_deposit', 'upi'],
  },
  {
    id: 'us-mx',
    country: 'Mexico',
   
    sendCurrency: 'USD',
    receiveCurrency: 'MXN',
    deliveryMethods: ['bank_deposit', 'cash_pickup', 'debit_card'],
  },
  {
    id: 'us-ph',
    country: 'Philippines',
   
    sendCurrency: 'USD',
    receiveCurrency: 'PHP',
    deliveryMethods: ['bank_deposit', 'cash_pickup', 'mobile_wallet'],
  },
  {
    id: 'us-vn',
    country: 'Vietnam',
   
    sendCurrency: 'USD',
    receiveCurrency: 'VND',
    deliveryMethods: ['bank_deposit', 'cash_pickup', 'home_delivery'],
  },
];

/** The route between two country codes, if it's live. */
export function routeFor(from: string, to: string): Route | undefined {
  return ROUTES.find((r) => r.id === `${from}-${to}`.toLowerCase());
}

/** The engine's amount grid (PRD 9.11). Prices exist for these amounts only. */
export const AMOUNTS = [100, 200, 500, 1000, 2000] as const;

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  bank_deposit: 'Bank deposit',
  cash_pickup: 'Cash pickup',
  mobile_wallet: 'Mobile wallet',
  upi: 'UPI',
  debit_card: 'Debit card',
  home_delivery: 'Home delivery',
};
