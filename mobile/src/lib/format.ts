/**
 * Number and time formatting. American English (DECISIONS.md D8). Amounts always carry a
 * currency symbol or code (PRD 14.5).
 */

const WHOLE_UNIT_CURRENCIES = new Set(['VND', 'INR', 'PHP', 'JPY', 'KRW']);

export function money(amount: number, currency: string): string {
  const whole = WHOLE_UNIT_CURRENCIES.has(currency) && Math.abs(amount) >= 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(amount);
}

/** For screen readers: "41,620 Indian rupees" rather than "₹41,620" (PRD 14.10). */
export function moneySpoken(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'name',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function pct(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

/** "Checked 3h ago". Minutes under an hour, hours under two days, then days. */
export function checkedAgo(iso: string, now: Date = new Date()): string {
  const mins = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'Checked just now';
  if (mins < 60) return `Checked ${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `Checked ${hours}h ago`;
  return `Checked ${Math.round(hours / 24)}d ago`;
}
