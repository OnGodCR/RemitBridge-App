/**
 * Countries for the From and To pickers. Only `live` ones can be chosen; the rest show as
 * "Soon" so people can see what's coming (PRD 6.2 and 6.5). A live To country must have a
 * matching route in lib/routes.ts.
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

// PRD 6.1 (live) and 6.2 (Tier 2, next).
export const RECEIVING: Country[] = [
  { code: 'IN', name: 'India', currency: 'INR', live: true },
  { code: 'MX', name: 'Mexico', currency: 'MXN', live: true },
  { code: 'PH', name: 'Philippines', currency: 'PHP', live: true },
  { code: 'VN', name: 'Vietnam', currency: 'VND', live: true },
  { code: 'CN', name: 'China', currency: 'CNY', live: false },
  { code: 'GT', name: 'Guatemala', currency: 'GTQ', live: false },
  { code: 'SV', name: 'El Salvador', currency: 'USD', live: false },
  { code: 'HN', name: 'Honduras', currency: 'HNL', live: false },
  { code: 'DO', name: 'Dominican Republic', short: 'Dominican Rep.', currency: 'DOP', live: false },
  { code: 'ET', name: 'Ethiopia', currency: 'ETB', live: false },
  { code: 'KE', name: 'Kenya', currency: 'KES', live: false },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', live: false },
  { code: 'PK', name: 'Pakistan', currency: 'PKR', live: false },
  { code: 'BD', name: 'Bangladesh', currency: 'BDT', live: false },
];
