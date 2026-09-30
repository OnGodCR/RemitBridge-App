import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

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
export type SignInError = 'notReady' | 'notOpen' | 'rateLimit' | 'badCode' | 'offline' | 'notConnected' | 'generic';
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
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) return friendly('');
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });
    return error ? friendly(error.message) : null;
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return 'closed';
    return friendly(String(e));
  }
}

export async function signInWithGoogle(): Promise<Result> {
  if (!supabase) return 'notConnected';
  // Supabase hands back a URL even when Google isn't enabled; ask first so the person
  // sees a plain message instead of a JSON error page in the browser.
  if (!(await providerEnabled('google'))) return 'notReady';
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
