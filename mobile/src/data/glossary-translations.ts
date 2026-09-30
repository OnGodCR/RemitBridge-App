import type { LanguageCode } from '@/i18n/languages';

/**
 * Glossary translations, keyed by language and then by the term's id in data/glossary.ts.
 * The English definitions stay canonical, as on the website. A translated entry shows only
 * when its language is offered (i18n/languages.ts), which in a release build means a named
 * reviewer has signed off.
 */
export type TermTranslation = { term: string; plain: string };

export const TERM_TRANSLATIONS: Partial<Record<LanguageCode, Record<string, TermTranslation>>> = {};
