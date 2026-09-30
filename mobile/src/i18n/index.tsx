import { getLocales } from 'expo-localization';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { en, type Copy } from '@/i18n/en';
import { es } from '@/i18n/es';
import { hi } from '@/i18n/hi';
import { tl } from '@/i18n/tl';
import { vi } from '@/i18n/vi';
import { LANGUAGES, offeredLanguages, type Language, type LanguageCode } from '@/i18n/languages';
import { countryName } from '@/lib/countries';
import { currency } from '@/lib/currencies';
import { prefs } from '@/lib/prefs';

/**
 * The app's language (PRD 5.5, DECISIONS.md D69). Chosen in this order: the one picked in
 * the app; the phone's own language, if the app offers it; English. Only offered languages
 * count (i18n/languages.ts), so an unreviewed translation can't be reached in a release
 * build even if a phone asks for it.
 */
const COPY: Record<LanguageCode, Copy> = { en, es, hi, tl, vi };

function startingLanguage(): LanguageCode {
  const offered = offeredLanguages().map((l) => l.code);
  const saved = prefs.language() as LanguageCode | null;
  if (saved && offered.includes(saved)) return saved;
  for (const locale of getLocales()) {
    // iOS reports Filipino as "fil"; the app files it under Tagalog, "tl".
    const code = (locale.languageCode === 'fil' ? 'tl' : locale.languageCode) as LanguageCode;
    if (offered.includes(code)) return code;
  }
  return 'en';
}

interface LanguageState {
  language: Language;
  copy: Copy;
  setLanguage: (code: LanguageCode) => void;
}

const Ctx = createContext<LanguageState>({ language: LANGUAGES[0], copy: en, setLanguage: () => undefined });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<LanguageCode>(startingLanguage);
  const value = useMemo<LanguageState>(
    () => ({
      language: LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0],
      copy: COPY[code],
      setLanguage: (next) => {
        prefs.setLanguage(next);
        setCode(next);
      },
    }),
    [code],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/**
 * Marks a part of the screen as English whatever the app's language: RemitBench's write-up,
 * glossary definitions not yet translated, the admin screens. Text inside keeps the Latin
 * font and is read by an English VoiceOver voice, instead of a Hindi voice reading English.
 */
const EnglishCtx = createContext(false);

export function EnglishOnly({ children }: { children: ReactNode }) {
  return <EnglishCtx.Provider value>{children}</EnglishCtx.Provider>;
}

/** The language a piece of text is in: the app's, unless it sits inside EnglishOnly. */
export function useTextLanguage(): Language {
  const { language } = useContext(Ctx);
  return useContext(EnglishCtx) ? LANGUAGES[0] : language;
}

/** The words for the current language. */
export function useCopy(): Copy {
  return useContext(Ctx).copy;
}

export function useLanguage(): LanguageState {
  return useContext(Ctx);
}

/** A country's name in the current language, falling back to the English list. */
export function countryIn(copy: Copy, code: string): string {
  return copy.countries[code.toUpperCase()] ?? countryName(code);
}

/** A currency's name in the current language, falling back to the English list. */
export function currencyIn(copy: Copy, code: string): string {
  return copy.currencies[code] ?? currency(code).name;
}

/** "3h ago", in the current language. Minutes under an hour, hours under two days, then days. */
export function agoIn(copy: Copy, iso: string, now: Date = new Date()): string {
  const mins = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return copy.time.justNow;
  if (mins < 60) return copy.time.minutesAgo(mins);
  const hours = Math.round(mins / 60);
  if (hours < 48) return copy.time.hoursAgo(hours);
  return copy.time.daysAgo(Math.round(hours / 24));
}

/** "Sep 29, 2026" in the current language, for a YYYY-MM-DD day, without time-zone drift. */
export function dayIn(language: Language, day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  try {
    return new Date(y, m - 1, d).toLocaleDateString(language.locale, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
