import 'expo-sqlite/localStorage/install';

import { AESEncryptionKey, AESKeySize, AESSealedData, aesDecryptAsync, aesEncryptAsync } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

/**
 * Where the sign-in session lives on the phone (DECISIONS.md D135). The session holds the
 * tokens that read a person's saved transfers, so it isn't kept as plain text: it's
 * encrypted (AES-256-GCM) with a key that lives in the iPhone Keychain or Android Keystore,
 * marked for this device only, so it never goes into a backup or onto another phone. The
 * encrypted text sits in the app's local storage, because the Keychain refuses long values
 * and a session with Apple's or Google's details can be several kilobytes.
 *
 * Without the key (a restored backup, a new phone) the stored session can't be opened, and
 * the person simply signs in again. A session saved in plain text by an older version is
 * encrypted the first time it's read.
 *
 * supabase-js calls getItem/setItem/removeItem with its own storage key.
 */
const KEY_NAME = 'rb.sessionKey';
const SEALED = 'rb1:';

let keyPromise: Promise<AESEncryptionKey> | null = null;

function encryptionKey(): Promise<AESEncryptionKey> {
  keyPromise ??= (async () => {
    const options = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY };
    const stored = await SecureStore.getItemAsync(KEY_NAME, options);
    if (stored) return AESEncryptionKey.import(stored, 'hex');
    const key = await AESEncryptionKey.generate(AESKeySize.AES256);
    await SecureStore.setItemAsync(KEY_NAME, await key.encoded('hex'), options);
    return key;
  })();
  // A failure (no Keychain) is retried next time rather than remembered.
  keyPromise.catch(() => (keyPromise = null));
  return keyPromise;
}

async function seal(value: string): Promise<string> {
  const sealed = await aesEncryptAsync(toBase64(value), await encryptionKey());
  return SEALED + (await sealed.combined('base64'));
}

async function open(stored: string): Promise<string> {
  const sealed = AESSealedData.fromCombined(stored.slice(SEALED.length));
  return fromBase64(await aesDecryptAsync(sealed, await encryptionKey(), { output: 'base64' }));
}

export const secureSessionStorage = {
  async getItem(name: string): Promise<string | null> {
    let stored: string | null;
    try {
      stored = localStorage.getItem(name);
    } catch {
      return null;
    }
    if (stored === null) return null;
    if (!stored.startsWith(SEALED)) {
      // Saved in plain text by an older version: encrypt it now, then use it.
      await secureSessionStorage.setItem(name, stored);
      return stored;
    }
    try {
      return await open(stored);
    } catch {
      // Sealed with a key this phone no longer has (restored from a backup): sign in again.
      safeRemove(name);
      return null;
    }
  },
  async setItem(name: string, value: string): Promise<void> {
    try {
      localStorage.setItem(name, await seal(value));
    } catch {
      // Never fall back to plain text: without a key the session lasts until the app closes.
      safeRemove(name);
    }
  },
  async removeItem(name: string): Promise<void> {
    safeRemove(name);
  },
};

function safeRemove(name: string) {
  try {
    localStorage.removeItem(name);
  } catch {
    // Nothing stored, or storage unavailable: either way nothing is left to remove.
  }
}

// UTF-8 text to and from base64, which is what the AES functions take for strings.
function toBase64(text: string): string {
  const bytes = utf8(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return fromUtf8(bytes);
}

function utf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function fromUtf8(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; ) {
    const b = bytes[i];
    const n = b < 0x80 ? 1 : b < 0xe0 ? 2 : b < 0xf0 ? 3 : 4;
    let cp = n === 1 ? b : b & (0xff >> (n + 1));
    for (let j = 1; j < n; j++) cp = (cp << 6) | (bytes[i + j] & 0x3f);
    out += String.fromCodePoint(cp);
    i += n;
  }
  return out;
}
