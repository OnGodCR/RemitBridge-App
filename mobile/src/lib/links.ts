import * as WebBrowser from 'expo-web-browser';

/** The app's own web pages (DECISIONS.md D57), served from site/ at app.remitbridgelabs.org. */
export const SITE = 'https://app.remitbridgelabs.org';

export const LINKS = {
  privacy: `${SITE}/privacy`,
  support: `${SITE}/support`,
} as const;

/** Opens a page in an in-app browser sheet, so people stay in the app. */
export function openPage(url: string) {
  WebBrowser.openBrowserAsync(url).catch(() => undefined);
}
