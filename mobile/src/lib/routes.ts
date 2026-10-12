/**
 * The live routes: Tier 1 (PRD 6.1) and Tier 2 (D158). Mirrors
 * engine/src/remitbridge_engine/config.py and the seeds in supabase/migrations; keep the three
 * in step. "Route" in the UI, "corridor" in docs
 * (PRD 14.4).
 *
 * No imports, on purpose: the WhatsApp bot (packages/bot) imports this file directly and
 * runs on Deno, which can't resolve the app's "@/" paths.
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
  // Tier 2 (D158, 2026-10-11): every other country Wise or Instarem prices from the US. Bank
  // deposit only, which is all either quotes; other providers are added by hand on a few routes.
  { id: 'us-cn', country: 'China', sendCurrency: 'USD', receiveCurrency: 'CNY', deliveryMethods: ['bank_deposit'] },
  { id: 'us-gt', country: 'Guatemala', sendCurrency: 'USD', receiveCurrency: 'GTQ', deliveryMethods: ['bank_deposit'] },
  { id: 'us-hn', country: 'Honduras', sendCurrency: 'USD', receiveCurrency: 'HNL', deliveryMethods: ['bank_deposit'] },
  { id: 'us-do', country: 'Dominican Republic', sendCurrency: 'USD', receiveCurrency: 'DOP', deliveryMethods: ['bank_deposit'] },
  { id: 'us-et', country: 'Ethiopia', sendCurrency: 'USD', receiveCurrency: 'ETB', deliveryMethods: ['bank_deposit'] },
  { id: 'us-ke', country: 'Kenya', sendCurrency: 'USD', receiveCurrency: 'KES', deliveryMethods: ['bank_deposit'] },
  { id: 'us-ng', country: 'Nigeria', sendCurrency: 'USD', receiveCurrency: 'NGN', deliveryMethods: ['bank_deposit'] },
  { id: 'us-pk', country: 'Pakistan', sendCurrency: 'USD', receiveCurrency: 'PKR', deliveryMethods: ['bank_deposit'] },
  { id: 'us-bd', country: 'Bangladesh', sendCurrency: 'USD', receiveCurrency: 'BDT', deliveryMethods: ['bank_deposit'] },
  { id: 'us-kr', country: 'South Korea', sendCurrency: 'USD', receiveCurrency: 'KRW', deliveryMethods: ['bank_deposit'] },
  { id: 'us-ua', country: 'Ukraine', sendCurrency: 'USD', receiveCurrency: 'UAH', deliveryMethods: ['bank_deposit'] },
  { id: 'us-co', country: 'Colombia', sendCurrency: 'USD', receiveCurrency: 'COP', deliveryMethods: ['bank_deposit'] },
  { id: 'us-pe', country: 'Peru', sendCurrency: 'USD', receiveCurrency: 'PEN', deliveryMethods: ['bank_deposit'] },
  { id: 'us-ni', country: 'Nicaragua', sendCurrency: 'USD', receiveCurrency: 'NIO', deliveryMethods: ['bank_deposit'] },
  { id: 'us-jm', country: 'Jamaica', sendCurrency: 'USD', receiveCurrency: 'JMD', deliveryMethods: ['bank_deposit'] },
  { id: 'us-ht', country: 'Haiti', sendCurrency: 'USD', receiveCurrency: 'HTG', deliveryMethods: ['bank_deposit'] },
  { id: 'us-br', country: 'Brazil', sendCurrency: 'USD', receiveCurrency: 'BRL', deliveryMethods: ['bank_deposit'] },
  { id: 'us-gh', country: 'Ghana', sendCurrency: 'USD', receiveCurrency: 'GHS', deliveryMethods: ['bank_deposit'] },
  { id: 'us-np', country: 'Nepal', sendCurrency: 'USD', receiveCurrency: 'NPR', deliveryMethods: ['bank_deposit'] },
  { id: 'us-lk', country: 'Sri Lanka', sendCurrency: 'USD', receiveCurrency: 'LKR', deliveryMethods: ['bank_deposit'] },
  { id: 'us-eg', country: 'Egypt', sendCurrency: 'USD', receiveCurrency: 'EGP', deliveryMethods: ['bank_deposit'] },
  { id: 'us-ug', country: 'Uganda', sendCurrency: 'USD', receiveCurrency: 'UGX', deliveryMethods: ['bank_deposit'] },
];

/** The route between two country codes, if it's live. */
export function routeFor(from: string, to: string): Route | undefined {
  return ROUTES.find((r) => r.id === `${from}-${to}`.toLowerCase());
}

/** The engine's amount grid (PRD 9.11). Prices exist for these amounts only. */
export const AMOUNTS = [100, 200, 500, 1000, 2000] as const;

/**
 * Prices are checked at the grid amounts only. For any other amount, use the largest
 * checked amount at or below it (the smallest one if it's below the grid): same fee and
 * same rate, run through the one formula. Fees often change at tier breaks, so the result
 * is always labelled as an estimate. Shared by Compare and the WhatsApp bot.
 */
export function checkedAmountFor(amount: number): number {
  const below = AMOUNTS.filter((a) => a <= amount);
  return below.length ? below[below.length - 1] : AMOUNTS[0];
}

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  bank_deposit: 'Bank deposit',
  cash_pickup: 'Cash pickup',
  mobile_wallet: 'Mobile wallet',
  upi: 'UPI',
  debit_card: 'Debit card',
  home_delivery: 'Home delivery',
};
