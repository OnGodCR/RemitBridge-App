/**
 * No imports, on purpose: the WhatsApp bot (packages/bot) imports this file directly.
 *
 * Countries for the From and To pickers. Every one can be picked. A pair with a route in
 * lib/routes.ts shows prices; any other pair shows "not covered yet" with the request form
 * (PRD 6.7). `live` marks the countries that have a route from the US.
 */
export interface Country {
  code: string;
  name: string;
  currency: string;
  live: boolean;
  /** Shown in the dropdown field when the full name won't fit. */
  short?: string;
}

// PRD 6.5: sending countries after the US.
export const SENDING: Country[] = [
  { code: 'US', name: 'United States', short: 'US', currency: 'USD', live: true },
  { code: 'CA', name: 'Canada', currency: 'CAD', live: false },
  { code: 'GB', name: 'United Kingdom', short: 'UK', currency: 'GBP', live: false },
  { code: 'AE', name: 'United Arab Emirates', short: 'UAE', currency: 'AED', live: false },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', live: false },
  { code: 'AU', name: 'Australia', currency: 'AUD', live: false },
];

// PRD 6.1 (live), 6.2 (Tier 2, next), 6.3 (Tier 3) and 6.4 (special handling). Only the
// live ones have prices; picking any other shows "not covered yet" and the request form
// (PRD 6.7), so the list is also what people can ask for.
export const RECEIVING: Country[] = [
  { code: 'IN', name: 'India', currency: 'INR', live: true },
  { code: 'MX', name: 'Mexico', currency: 'MXN', live: true },
  { code: 'PH', name: 'Philippines', currency: 'PHP', live: true },
  { code: 'VN', name: 'Vietnam', currency: 'VND', live: true },
  { code: 'CN', name: 'China', currency: 'CNY', live: true },
  { code: 'GT', name: 'Guatemala', currency: 'GTQ', live: true },
  { code: 'SV', name: 'El Salvador', currency: 'USD', live: false },
  { code: 'HN', name: 'Honduras', currency: 'HNL', live: true },
  { code: 'DO', name: 'Dominican Republic', short: 'Dominican Rep.', currency: 'DOP', live: true },
  { code: 'ET', name: 'Ethiopia', currency: 'ETB', live: true },
  { code: 'KE', name: 'Kenya', currency: 'KES', live: true },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', live: true },
  { code: 'PK', name: 'Pakistan', currency: 'PKR', live: true },
  { code: 'BD', name: 'Bangladesh', currency: 'BDT', live: true },
  { code: 'KR', name: 'South Korea', currency: 'KRW', live: true },
  { code: 'UA', name: 'Ukraine', currency: 'UAH', live: true },
  { code: 'CO', name: 'Colombia', currency: 'COP', live: true },
  { code: 'EC', name: 'Ecuador', currency: 'USD', live: false },
  { code: 'PE', name: 'Peru', currency: 'PEN', live: true },
  { code: 'NI', name: 'Nicaragua', currency: 'NIO', live: true },
  { code: 'JM', name: 'Jamaica', currency: 'JMD', live: true },
  { code: 'HT', name: 'Haiti', currency: 'HTG', live: true },
  { code: 'BR', name: 'Brazil', currency: 'BRL', live: true },
  { code: 'GH', name: 'Ghana', currency: 'GHS', live: true },
  { code: 'NP', name: 'Nepal', currency: 'NPR', live: true },
  { code: 'LK', name: 'Sri Lanka', currency: 'LKR', live: true },
  { code: 'EG', name: 'Egypt', currency: 'EGP', live: true },
  { code: 'UG', name: 'Uganda', currency: 'UGX', live: true },
  { code: 'SO', name: 'Somalia', currency: 'SOS', live: false },
  { code: 'ER', name: 'Eritrea', currency: 'ERN', live: false },
  { code: 'CU', name: 'Cuba', currency: 'CUP', live: false },
  { code: 'AF', name: 'Afghanistan', currency: 'AFN', live: false },
  { code: 'VE', name: 'Venezuela', currency: 'VES', live: false },
];

/** Any country in either list, by code. */
export function countryName(code: string): string {
  return [...SENDING, ...RECEIVING].find((c) => c.code === code.toUpperCase())?.name ?? code;
}
