import { useSyncExternalStore } from 'react';

import { prefs } from '@/lib/prefs';

import { en, type Strings } from './en';
import { hi } from './hi';

/**
 * The app's string catalogue (DECISIONS.md D72): English and Hindi, typed, with no library.
 * The language is an on-device preference, set on the Account tab; it starts as English.
 */
export type Language = 'en' | 'hi';
export type { Strings };

const CATALOGUES: Record<Language, Strings> = { en, hi };

let current: Language = prefs.language() === 'hi' ? 'hi' : 'en';
const listeners = new Set<() => void>();

export function getLanguage(): Language {
  return current;
}

export function setLanguage(language: Language) {
  if (language === current) return;
  current = language;
  prefs.setLanguage(language);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useLanguage(): Language {
  return useSyncExternalStore(subscribe, getLanguage, getLanguage);
}

/** The strings for the current language; re-renders when it changes. */
export function useStrings(): Strings {
  return CATALOGUES[useLanguage()];
}

export function stringsFor(language: Language): Strings {
  return CATALOGUES[language];
}

/** Fills "{name}" placeholders: fill('{count} items', { count: 3 }). */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => (key in values ? String(values[key]) : m));
}
