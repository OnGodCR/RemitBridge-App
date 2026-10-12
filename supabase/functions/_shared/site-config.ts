// The operator's public details inside an Edge Function (DECISIONS.md D141). They're set in
// one place, site/site.config.json, which the site, the app and the engine read too; a
// function picks up a change when it's next deployed.
import site from '../../../site/site.config.json' with { type: 'json' };

/** Where people write to us, and the address our requests give as a contact. */
export const CONTACT_EMAIL: string = site.CONTACT_EMAIL;

/** The legal name, and its postal address once one is set (empty for now, by Angad's choice). */
export const LEGAL_NAME: string = site.LEGAL_NAME;
export const MAILING_ADDRESS: string = site.MAILING_ADDRESS;

/** The User-Agent on requests the functions make. */
export const USER_AGENT = `RemitBridge (${CONTACT_EMAIL})`;
