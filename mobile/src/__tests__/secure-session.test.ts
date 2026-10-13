/**
 * The sign-in session on the phone (lib/secure-session.ts, D135): stored only encrypted,
 * readable back, an older plain-text session encrypted on first read, and never written in
 * plain text when the Keychain can't be used. The AES and Keychain modules are native, so
 * stand-ins here: a reversible scramble that hides the text, and an in-memory Keychain.
 */
// jest.mock calls below are hoisted above this import.
import { secureSessionStorage } from '@/lib/secure-session';

const mockKeychain = new Map<string, string>();
let mockKeychainBroken = false;
const mockStorage = new Map<string, string>();

jest.mock('expo-sqlite/localStorage/install', () => ({}));
jest.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'afterFirstUnlockThisDeviceOnly',
  getItemAsync: async (k: string) => {
    if (mockKeychainBroken) throw new Error('no keychain');
    return mockKeychain.get(k) ?? null;
  },
  setItemAsync: async (k: string, v: string) => {
    if (mockKeychainBroken) throw new Error('no keychain');
    mockKeychain.set(k, v);
  },
}));
jest.mock('expo-crypto', () => {
  // "Encryption" that reverses the base64 text into bytes: enough to prove the plain text isn't stored.
  class Key {
    hex: string;
    constructor(hex: string) {
      this.hex = hex;
    }
    static async generate() {
      return new Key('k'.repeat(64));
    }
    static async import(hex: string) {
      return new Key(hex);
    }
    async encoded() {
      return this.hex;
    }
  }
  // Sealed data is bytes, and fromCombined takes only bytes, as on Android: given base64 text
  // it throws, which is the bug that broke every Android sign-in (2026-10-12).
  class Sealed {
    bytes: Uint8Array;
    constructor(bytes: Uint8Array) {
      this.bytes = bytes;
    }
    static fromCombined(data: Uint8Array) {
      if (!(data instanceof Uint8Array)) throw new TypeError('fromCombined takes a byte array');
      return new Sealed(data);
    }
    async combined() {
      return btoa(String.fromCharCode(...this.bytes));
    }
  }
  const reversedBytes = (text: string) => Uint8Array.from([...text].reverse(), (c) => c.charCodeAt(0));
  return {
    AESKeySize: { AES256: 256 },
    AESEncryptionKey: Key,
    AESSealedData: Sealed,
    aesEncryptAsync: async (b64: string) => new Sealed(reversedBytes(b64)),
    aesDecryptAsync: async (s: Sealed) => String.fromCharCode(...s.bytes).split('').reverse().join(''),
  };
});

const SESSION = JSON.stringify({ access_token: 'secret-access', refresh_token: 'secret-refresh', user: { email: 'ünïcode@example.org' } });

beforeAll(() => {
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => mockStorage.get(k) ?? null,
    setItem: (k: string, v: string) => mockStorage.set(k, v),
    removeItem: (k: string) => mockStorage.delete(k),
  };
});

beforeEach(() => {
  mockStorage.clear();
  mockKeychain.clear();
  mockKeychainBroken = false;
});

it('stores the session only encrypted, and reads it back', async () => {
  await secureSessionStorage.setItem('sb-auth', SESSION);
  const stored = mockStorage.get('sb-auth')!;
  expect(stored.startsWith('rb1:')).toBe(true);
  expect(stored).not.toContain('secret-refresh');
  expect(mockKeychain.has('rb.sessionKey')).toBe(true);
  expect(await secureSessionStorage.getItem('sb-auth')).toBe(SESSION);
});

it('encrypts a session an older version saved in plain text, keeping the person signed in', async () => {
  mockStorage.set('sb-auth', SESSION);
  expect(await secureSessionStorage.getItem('sb-auth')).toBe(SESSION);
  expect(mockStorage.get('sb-auth')!.startsWith('rb1:')).toBe(true);
});

it('never writes plain text when the Keychain can’t be used', async () => {
  mockKeychainBroken = true;
  // A fresh copy of the module, which hasn't fetched its key yet.
  let fresh!: typeof secureSessionStorage;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    fresh = (require('@/lib/secure-session') as typeof import('@/lib/secure-session')).secureSessionStorage;
  });
  await fresh.setItem('sb-auth', SESSION);
  expect(mockStorage.has('sb-auth')).toBe(false);
});

it('forgets a session it can no longer open, so the person signs in again', async () => {
  mockStorage.set('sb-auth', 'rb1:not-really-sealed');
  const decrypt = jest.requireMock('expo-crypto') as { aesDecryptAsync: (s: unknown) => Promise<string> };
  const original = decrypt.aesDecryptAsync;
  decrypt.aesDecryptAsync = async () => {
    throw new Error('bad tag');
  };
  expect(await secureSessionStorage.getItem('sb-auth')).toBeNull();
  expect(mockStorage.has('sb-auth')).toBe(false);
  decrypt.aesDecryptAsync = original;
});

it('removes the session on sign-out', async () => {
  await secureSessionStorage.setItem('sb-auth', SESSION);
  await secureSessionStorage.removeItem('sb-auth');
  expect(mockStorage.has('sb-auth')).toBe(false);
});
