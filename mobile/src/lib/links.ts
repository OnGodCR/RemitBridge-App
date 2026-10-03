import * as WebBrowser from 'expo-web-browser';
import { Alert, Linking } from 'react-native';

import { CONTACT_EMAIL } from '@/constants/site-config';
import type { Copy } from '@/i18n/en';

/** The app's own web pages (DECISIONS.md D57), served from site/ at app.remitbridgelabs.org. */
export const SITE = 'https://app.remitbridgelabs.org';

export const LINKS = {
  privacy: `${SITE}/privacy`,
  support: `${SITE}/support`,
  terms: `${SITE}/terms`,
} as const;

/** Where people and providers write to us (D22, D141), including "this price looks wrong". */
export const CONTACT = CONTACT_EMAIL;

/**
 * Starts an email to us in the phone's mail app. A phone with no mail app set up makes
 * openURL reject, and the tap used to do nothing at all; now it says where to write.
 */
export function writeToUs(copy: Copy, subject?: string, body?: string) {
  const query = [subject && `subject=${encodeURIComponent(subject)}`, body && `body=${encodeURIComponent(body)}`]
    .filter(Boolean)
    .join('&');
  Linking.openURL(`mailto:${CONTACT}${query ? `?${query}` : ''}`).catch(() =>
    Alert.alert(copy.common.noMailTitle, copy.common.noMailBody(CONTACT)),
  );
}

/** Opens a page in an in-app browser sheet, so people stay in the app. */
export function openPage(url: string) {
  WebBrowser.openBrowserAsync(url).catch(() => undefined);
}
