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
  aiConsent: 'rb.aiConsent',
  remmyConsent: 'rb.remmyConsent',
  ageGate: 'rb.ageGate',
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
  /** The language picked in the app, if any; otherwise the phone's language decides. */
  language: () => get(KEYS.language),
  setLanguage: (code: string) => set(KEYS.language, code),
  /** Said yes, once, to receipt text going to the AI model (Apple 5.1.2(i); D145). */
  aiConsent: () => get(KEYS.aiConsent) === '1',
  setAiConsent: () => set(KEYS.aiConsent, '1'),
  /** Said yes, once, to Remmy's messages going to the AI model (Apple 5.1.2(i); D175). */
  remmyConsent: () => get(KEYS.remmyConsent) === '1',
  setRemmyConsent: () => set(KEYS.remmyConsent, '1'),
  /**
   * The account age check (COPPA): 'ok' or 'blocked', once per phone, so going back can't
   * change the answer. Only this flag is kept; the year itself is never stored or sent.
   */
  ageGate: (): 'ok' | 'blocked' | null => {
    const v = get(KEYS.ageGate);
    return v === 'ok' || v === 'blocked' ? v : null;
  },
  setAgeGate: (v: 'ok' | 'blocked') => set(KEYS.ageGate, v),
  installId: (): string => {
    let id = get(KEYS.installId);
    if (!id) {
      id = randomUUID();
      set(KEYS.installId, id);
    }
    return id;
  },
};
