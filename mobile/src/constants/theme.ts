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

  // The brand band: the website's full-bleed green feature band, used as each tab's
  // header and the onboarding welcome.
  hero: '#14705a',
  heroText: '#ffffff',
  heroMuted: 'rgba(255,255,255,0.74)',
  heroField: '#ffffff',

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

  hero: '#0e4a3c',
  heroText: '#f2f6f4',
  heroMuted: 'rgba(242,246,244,0.7)',
  heroField: '#1a1e22',

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

/**
 * Noto Sans Devanagari, for Hindi (PRD 14.5, DECISIONS.md D72), at the same weights. Plus
 * Jakarta Sans has no Devanagari; AppText switches to these for any text that has it.
 */
export const DevanagariFonts: Record<(typeof Fonts)[keyof typeof Fonts], string> = {
  PlusJakartaSans_400Regular: 'NotoSansDevanagari_400Regular',
  PlusJakartaSans_500Medium: 'NotoSansDevanagari_500Medium',
  PlusJakartaSans_600SemiBold: 'NotoSansDevanagari_600SemiBold',
  PlusJakartaSans_700Bold: 'NotoSansDevanagari_700Bold',
  PlusJakartaSans_800ExtraBold: 'NotoSansDevanagari_800ExtraBold',
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/**
 * Corners stay modest: the website reads like a document, not a marketing page, and
 * pill-shaped everything was the main thing making the app look templated. Pills are
 * kept only for tiny status marks.
 */
export const Radius = {
  sm: 6,
  md: 10,
  lg: 12,
  pill: 9999,
} as const;

/** PRD 14.10: tap targets at least 44px. */
export const MinTapTarget = 44;
