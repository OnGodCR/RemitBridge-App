/**
 * Currencies for the tools (TrueCost, Fair rate, Rate history). Wider than the Compare
 * routes, because these tools only need a mid-market rate, not our checked quotes: anyone
 * can check a receipt for any of these. All 31 are published by Frankfurter v2 (checked
 * 2026-09-29). `flag` is the country whose flag stands for the currency.
 */
export interface Currency {
  code: string;
  name: string;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US dollar', flag: 'US' },
  { code: 'CAD', name: 'Canadian dollar', flag: 'CA' },
  { code: 'GBP', name: 'British pound', flag: 'GB' },
  { code: 'EUR', name: 'Euro', flag: 'EU' },
  { code: 'AUD', name: 'Australian dollar', flag: 'AU' },
  { code: 'AED', name: 'UAE dirham', flag: 'AE' },
  { code: 'SAR', name: 'Saudi riyal', flag: 'SA' },
  { code: 'INR', name: 'Indian rupee', flag: 'IN' },
  { code: 'MXN', name: 'Mexican peso', flag: 'MX' },
  { code: 'PHP', name: 'Philippine peso', flag: 'PH' },
  { code: 'VND', name: 'Vietnamese dong', flag: 'VN' },
  { code: 'CNY', name: 'Chinese yuan', flag: 'CN' },
  { code: 'GTQ', name: 'Guatemalan quetzal', flag: 'GT' },
  { code: 'HNL', name: 'Honduran lempira', flag: 'HN' },
  { code: 'DOP', name: 'Dominican peso', flag: 'DO' },
  { code: 'COP', name: 'Colombian peso', flag: 'CO' },
  { code: 'PEN', name: 'Peruvian sol', flag: 'PE' },
  { code: 'BRL', name: 'Brazilian real', flag: 'BR' },
  { code: 'JMD', name: 'Jamaican dollar', flag: 'JM' },
  { code: 'HTG', name: 'Haitian gourde', flag: 'HT' },
  { code: 'NGN', name: 'Nigerian naira', flag: 'NG' },
  { code: 'GHS', name: 'Ghanaian cedi', flag: 'GH' },
  { code: 'KES', name: 'Kenyan shilling', flag: 'KE' },
  { code: 'ETB', name: 'Ethiopian birr', flag: 'ET' },
  { code: 'EGP', name: 'Egyptian pound', flag: 'EG' },
  { code: 'PKR', name: 'Pakistani rupee', flag: 'PK' },
  { code: 'BDT', name: 'Bangladeshi taka', flag: 'BD' },
  { code: 'NPR', name: 'Nepalese rupee', flag: 'NP' },
  { code: 'LKR', name: 'Sri Lankan rupee', flag: 'LK' },
  { code: 'IDR', name: 'Indonesian rupiah', flag: 'ID' },
  { code: 'KRW', name: 'South Korean won', flag: 'KR' },
];

export function currency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? { code, name: code, flag: '' };
}
