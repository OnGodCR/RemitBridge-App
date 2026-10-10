/**
 * The languages the app can speak (PRD 5.5, DECISIONS.md D69). English is the source.
 *
 * The rest follow the website's rule (its src/data/glossary.js): a translation reaches
 * people only once a named speaker has agreed, in writing and with a date, to stand behind
 * it. That's enforced here in code rather than trusted to whoever edits a translation file
 * next. Until then a language shows only in development builds, marked as a draft, so
 * reviewers can read it in the app itself before they sign.
 *
 * The exception (Angad, 2026-10-10, D151): every language ships before its review, still
 * marked Draft, with a call for volunteer reviewers on the Account screen. Hindi's review is
 * under way; the others have no reviewer yet.
 */
export type LanguageCode = 'en' | 'hi' | 'es' | 'tl' | 'vi';

export interface Language {
  code: LanguageCode;
  /** Its own name, the way its speakers look for it in a list. */
  name: string;
  english: string;
  /** BCP 47, for dates and so VoiceOver pronounces the text in the right language. */
  locale: string;
  /** Who stands behind the translation, and when they agreed. Null until someone does. */
  reviewer: { name: string; consentOn: string } | null;
  /** Offered in release builds before a review, marked Draft (D151). */
  draftInRelease?: true;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', english: 'English', locale: 'en-US', reviewer: null },
  { code: 'hi', name: 'हिन्दी', english: 'Hindi', locale: 'hi-IN', reviewer: null, draftInRelease: true },
  { code: 'es', name: 'Español', english: 'Spanish', locale: 'es-US', reviewer: null, draftInRelease: true },
  { code: 'tl', name: 'Tagalog', english: 'Filipino (Tagalog)', locale: 'fil-PH', reviewer: null, draftInRelease: true },
  { code: 'vi', name: 'Tiếng Việt', english: 'Vietnamese', locale: 'vi-VN', reviewer: null, draftInRelease: true },
];

/** English is the source; any other language needs a reviewer with a consent date. */
export function isReviewed(l: Language): boolean {
  return l.code === 'en' || !!(l.reviewer?.name && l.reviewer.consentOn);
}

/**
 * The languages people can pick: reviewed ones always, the drafts D151 releases early, and
 * every other draft only in development builds.
 */
export function offeredLanguages(dev: boolean = __DEV__): Language[] {
  return LANGUAGES.filter((l) => isReviewed(l) || l.draftInRelease || dev);
}

/** Offered drafts with no reviewer yet: the languages that need volunteers. */
export function languagesNeedingReview(dev: boolean = __DEV__): Language[] {
  return offeredLanguages(dev).filter((l) => !isReviewed(l));
}
