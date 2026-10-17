import * as AppleAuthentication from 'expo-apple-authentication';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { CryptoDigestAlgorithm, digestStringAsync, randomUUID } from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

/**
 * The three sign-in methods (DECISIONS.md D29), all through Supabase Auth. Each returns
 * null on success, 'closed' when the person backed out (nothing to say), or the kind of
 * problem as a key; the screen turns the key into words in the app's language
 * (copy.signIn.errors).
 *
 * Apple and Google need provider credentials in the Supabase dashboard, and email codes
 * need a custom SMTP sender (D42). Until those exist, these say "not set up yet" rather
 * than show a raw error.
 */
export type SignInError = 'notReady' | 'notOpen' | 'rateLimit' | 'badCode' | 'badPassword' | 'offline' | 'notConnected' | 'generic';
type Result = SignInError | 'closed' | null;

function friendly(message: string): SignInError {
  const m = message.toLowerCase();
  if (m.includes('provider is not enabled') || m.includes('unsupported provider')) return 'notReady';
  // Supabase's built-in sender only mails the project's own team until custom SMTP is
  // set up (DECISIONS.md D42).
  if (m.includes('not authorized') || (m.includes('email address') && m.includes('invalid'))) return 'notOpen';
  if (m.includes('rate limit') || m.includes('security purposes')) return 'rateLimit';
  if (m.includes('expired') || m.includes('invalid')) return 'badCode';
  if (m.includes('network') || m.includes('fetch')) return 'offline';
  return 'generic';
}

export async function sendEmailCode(email: string): Promise<Result> {
  if (!supabase) return 'notConnected';
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: true },
  });
  return error ? friendly(error.message) : null;
}

/**
 * The one account App Review signs in with (D184). Reviewers can't receive an email code,
 * so this address gets a password field instead; the server accepts a password only for
 * the account listed in private.review_accounts and refuses it for everyone else (D135).
 */
export const REVIEW_EMAIL = 'review@remitbridgelabs.org';
export const isReviewEmail = (email: string) => email.trim().toLowerCase() === REVIEW_EMAIL;

export async function signInForReview(email: string, password: string): Promise<Result> {
  if (!supabase) return 'notConnected';
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (!error) return null;
  return error.message.toLowerCase().includes('invalid login') ? 'badPassword' : friendly(error.message);
}

export async function verifyEmailCode(email: string, code: string): Promise<Result> {
  if (!supabase) return 'notConnected';
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: code,
    type: 'email',
  });
  return error ? friendly(error.message) : null;
}

export async function signInWithApple(): Promise<Result> {
  if (!supabase) return 'notConnected';
  if (!(await providerEnabled('apple'))) return 'notReady';
  try {
    // A one-time nonce (D135): Apple puts its hash in the token, and Supabase checks it
    // against the original, so a token copied from somewhere else can't be replayed.
    const nonce = randomUUID();
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: await digestStringAsync(CryptoDigestAlgorithm.SHA256, nonce),
    });
    if (!credential.identityToken) return friendly('');
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce,
    });
    return error ? friendly(error.message) : null;
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return 'closed';
    return friendly(String(e));
  }
}

/**
 * A fresh authorization code from Apple's sheet, for deleting an account that signed in with
 * Apple: the server swaps it for a token and revokes it, as Apple asks (D145). 'closed' when
 * the person backs out; null when there's no code to be had (no Apple sign-in on this phone).
 */
export async function appleAuthorizationCode(): Promise<string | null | 'closed'> {
  try {
    const credential = await AppleAuthentication.signInAsync({ requestedScopes: [] });
    return credential.authorizationCode ?? null;
  } catch (e) {
    return (e as { code?: string }).code === 'ERR_REQUEST_CANCELED' ? 'closed' : null;
  }
}

/**
 * Google's own sign-in sheet (D129) shows "RemitBridge App" and no web address; the browser
 * flow below shows our Supabase project's address. Native needs the app build (Expo Go has
 * no Google module) and a Google client for the platform. iPhone: the iOS client. Android:
 * only the web client is passed, and Google matches the app by package name and signing
 * key's SHA-1, registered as an Android client in the same Google Cloud project. Android
 * went native on 2026-10-09, when the browser round trip crashed the first Android build on
 * the way back from Google's page.
 */
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const nativeGoogle =
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient &&
  !!GOOGLE_WEB_CLIENT_ID &&
  ((Platform.OS === 'ios' && !!GOOGLE_IOS_CLIENT_ID) || Platform.OS === 'android');

export async function signInWithGoogle(): Promise<Result> {
  if (!supabase) return 'notConnected';
  // Supabase hands back a URL even when Google isn't enabled; ask first so the person
  // sees a plain message instead of a JSON error page in the browser.
  if (!(await providerEnabled('google'))) return 'notReady';
  if (nativeGoogle) return signInWithGoogleNative();
  const redirectTo = Linking.createURL('sign-in/callback');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data.url) return friendly(error?.message ?? '');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return 'closed';
  const code = new URL(result.url).searchParams.get('code');
  if (!code) return friendly('');
  const exchange = await supabase.auth.exchangeCodeForSession(code);
  return exchange.error ? friendly(exchange.error.message) : null;
}

async function signInWithGoogleNative(): Promise<Result> {
  if (!supabase) return 'notConnected';
  // Required only here: loading it in Expo Go, which lacks the native module, would crash
  // (and Expo Go never gets here: nativeGoogle is false there). A plain require, not
  // import(): in development, import() made a separate bundle whose module numbers went
  // stale after a reload, and sign-in failed with "Requiring unknown module" (2026-10-11).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = require(
    '@react-native-google-signin/google-signin',
  ) as typeof import('@react-native-google-signin/google-signin');
  // The web client is the token's audience, so Supabase (which trusts it) accepts it.
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    ...(Platform.OS === 'ios' ? { iosClientId: GOOGLE_IOS_CLIENT_ID } : {}),
  });
  try {
    // Android needs Google Play services for the sheet; without them, say so plainly.
    if (Platform.OS === 'android') await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) {
      console.warn('[google sign-in] no account came back:', response.type);
      return 'closed';
    }
    const token = response.data.idToken;
    if (!token) return friendly('');
    const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token });
    // The real reason, for the developer's log; the person sees the friendly message.
    if (error) console.warn('[google sign-in] Supabase refused the token:', error.message);
    return error ? friendly(error.message) : null;
  } catch (e) {
    if (isErrorWithCode(e) && (e.code === statusCodes.SIGN_IN_CANCELLED || e.code === statusCodes.IN_PROGRESS)) return 'closed';
    console.warn('[google sign-in] failed:', isErrorWithCode(e) ? `code ${e.code}` : '', String(e));
    return friendly(String(e));
  }
}

async function providerEnabled(provider: 'google' | 'apple'): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '' },
    });
    const body = (await res.json()) as { external?: Record<string, boolean> };
    return !!body.external?.[provider];
  } catch {
    return true; // can't tell: let the real attempt decide
  }
}
