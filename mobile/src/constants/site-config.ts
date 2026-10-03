/**
 * The operator's public details (DECISIONS.md D141), set once in site/site.config.json and
 * shared with the site, the Edge Functions and the engine. A change reaches the app with
 * its next build.
 */
import site from '../../../site/site.config.json';

/** RemitBridge Labs. The short name, RemitBridge, is the app's own name. */
export const LEGAL_NAME: string = site.LEGAL_NAME;
/** Where people and providers write to us (D22, D141). */
export const CONTACT_EMAIL: string = site.CONTACT_EMAIL;
/** True only once Washington's Secretary of State has accepted the Articles (D141). */
export const INCORPORATED: boolean = site.INCORPORATED;
