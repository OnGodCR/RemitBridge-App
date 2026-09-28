/**
 * Design tokens. Copied from the website (RemitBridge-System-Labs---Website/src/index.css)
 * on 2026-09-28 so the app looks like the same product (DECISIONS.md D18). The two repos
 * share no code, so if the website's palette changes, change it here too.
 *
 * Nothing in the app hardcodes a hex value: use `useTheme()` and these names.
 *
 * The website has no dark mode. The dark values here are the app's own, chosen to keep
 * the same hues and to clear WCAG AA on their surfaces.
 */

const light = {
  background: '#f9fafb',
  card: '#ffffff',
  text: '#1c2024',
  textSecondary: '#5b6470',
  border: '#e4e7eb',
  muted: '#f2f4f7',
  primary: '#14705a',
  primaryForeground: '#ffffff',
  accent: '#e8f2ee',
  accentForeground: '#14705a',
  destructive: '#b3261e', // genuine errors and Scam check only, never "expensive" (PRD 14.5)

  // Semantic money colours (PRD 14.5), identical in every chart and breakdown.
  moneyReceived: '#14705a', // brand green: the part that reaches family
  moneyFee: '#8d97a3', // neutral grey: visible, expected cost
  moneyMarkup: '#c47f17', // warm amber: the hidden cost, eye-catching but not an error
  moneyPickup: '#e3b867', // muted amber: secondary hidden cost
  targetLine: '#5b6470', // the dashed 3% UN target
  stale: '#9aa3ae', // desaturated grey, always with a text label
};

const dark: typeof light = {
  background: '#111416',
  card: '#1a1e22',
  text: '#eef1f4',
  textSecondary: '#9aa3ae',
  border: '#2b3137',
  muted: '#20252a',
  primary: '#3fae8e',
  primaryForeground: '#0b1f19',
  accent: '#173229',
  accentForeground: '#7fd1b5',
  destructive: '#f2b8b5',

  moneyReceived: '#3fae8e',
  moneyFee: '#7b858f',
  moneyMarkup: '#e0a33a',
  moneyPickup: '#b98d4a',
  targetLine: '#9aa3ae',
  stale: '#6b747e',
};

export const Colors = { light, dark } as const;
export type ThemeColors = typeof light;

/** Plus Jakarta Sans, the website's typeface. Loaded in app/_layout.tsx. */
export const Fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** The website's --radius is 1rem. */
export const Radius = {
  sm: 12,
  md: 14,
  lg: 16,
  pill: 9999,
} as const;

/** PRD 14.10: tap targets at least 44px. */
export const MinTapTarget = 44;
