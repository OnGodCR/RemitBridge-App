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
  // 90% white: 5.2:1 on the green, the website's measured value. 74% was 4.1:1 and failed AA.
  heroMuted: 'rgba(255,255,255,0.9)',
  heroField: '#ffffff',

  // Semantic money colours (PRD 14.5), identical in every chart and breakdown. No yellow
  // (D105, Angad): the hidden cost is a lighter green than what arrives, and every bar has
  // a text legend, so colour never carries the meaning alone.
  moneyReceived: '#14705a', // brand green: the part that reaches family
  moneyFee: '#8d97a3', // neutral grey: visible, expected cost
  moneyMarkup: '#46a085', // mid green: the hidden cost; 3.2:1 on white, lighter than received (1.9:1 apart)
  moneyMarkupText: '#0e5c49', // deep green for text, 7.9:1 on white; bars and dots keep the lighter one
  moneyPickup: '#8fcab6', // pale green: secondary hidden cost
  targetLine: '#5b6470', // the dashed 3% UN target
  stale: '#646d78', // desaturated grey, always with the word "Stale"; 5.0:1 (the old #9aa3ae was 2.4:1)

  // The blog's five series (D106), from the website's palette (src/lib/palette.js): `ink`
  // for the label and active filter, `bar` for the dot, `tint` behind a number cover.
  // Series 4 is the website's amber there, so here it's a slate teal (D105, no yellow).
  series: {
    all: { ink: '#1c2024', bar: '#5b6470', tint: '#f2f4f7' },
    series1: { ink: '#0f5a48', bar: '#14705a', tint: '#e6f2ee' },
    series2: { ink: '#17558f', bar: '#1b5fa8', tint: '#e7eff9' },
    series3: { ink: '#5a3e96', bar: '#6a4ba8', tint: '#efeaf8' },
    series4: { ink: '#2b5566', bar: '#356a7d', tint: '#e6eef1' },
    series5: { ink: '#97325a', bar: '#a63c63', tint: '#faeaef' },
  },
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
  moneyMarkup: '#a8e0cd', // pale mint, 11.3:1 on the dark card, lighter than received
  moneyMarkupText: '#a8e0cd',
  moneyPickup: '#5d8f80',
  targetLine: '#9aa3ae',
  stale: '#9aa3ae', // 7.2:1 on the dark background (the old #6b747e was 3.9:1)

  // Lighter inks for the dark background, the same hues.
  series: {
    all: { ink: '#eef1f4', bar: '#9aa3ae', tint: '#20252a' },
    series1: { ink: '#7fd1b5', bar: '#3fae8e', tint: '#173229' },
    series2: { ink: '#93bdeb', bar: '#5b93d6', tint: '#16263a' },
    series3: { ink: '#bba6ea', bar: '#9479d6', tint: '#251d38' },
    series4: { ink: '#93c3d3', bar: '#5d9bb0', tint: '#172a31' },
    series5: { ink: '#eba1bc', bar: '#d36a92', tint: '#36192a' },
  },
};

export const Colors = { light, dark } as const;
export type ThemeColors = typeof light;

/**
 * Hind, for Hindi: Plus Jakarta Sans has no Devanagari, and a phone's fallback font doesn't
 * match it (PRD 14.5 asks for a matched one). Hind was drawn to sit with Latin text, and
 * carries Latin too, so numbers and names in a Hindi sentence match the words around them.
 * AppText swaps it in weight for weight. Loaded in app/_layout.tsx.
 */
export const DevanagariFonts: Record<string, string> = {
  PlusJakartaSans_400Regular: 'Hind_400Regular',
  PlusJakartaSans_500Medium: 'Hind_500Medium',
  PlusJakartaSans_600SemiBold: 'Hind_600SemiBold',
  PlusJakartaSans_700Bold: 'Hind_700Bold',
  PlusJakartaSans_800ExtraBold: 'Hind_700Bold',
};

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
