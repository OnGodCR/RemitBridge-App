import 'expo-sqlite/localStorage/install';

import { randomUUID } from 'expo-crypto';

/**
 * Small on-device preferences. Nothing here leaves the phone except the install ID, which
 * is a random UUID used to count installs and sessions (DECISIONS.md D31): it isn't a
 * device identifier and says nothing about who the person is.
 */
const KEYS = {
  onboarded: 'rb.onboarded',
  homeRoute: 'rb.homeRoute',
  installId: 'rb.installId',
  language: 'rb.language',
} as const;

function get(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function set(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Preferences are a convenience; never let storage break the app.
  }
}

export const prefs = {
  onboarded: () => get(KEYS.onboarded) === '1',
  setOnboarded: (done: boolean) => set(KEYS.onboarded, done ? '1' : null),
  homeRoute: () => get(KEYS.homeRoute),
  setHomeRoute: (routeId: string) => set(KEYS.homeRoute, routeId),
  /** The language for translated screens (D72): 'en' or 'hi'. */
  language: () => get(KEYS.language),
  setLanguage: (language: string) => set(KEYS.language, language),
  installId: (): string => {
    let id = get(KEYS.installId);
    if (!id) {
      id = randomUUID();
      set(KEYS.installId, id);
    }
    return id;
  },
};
