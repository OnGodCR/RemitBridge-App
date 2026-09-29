import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';

/**
 * The three sign-in methods (DECISIONS.md D29), all through Supabase Auth. Each returns
 * null on success or a short, plain message to show the person.
 *
 * Apple and Google need provider credentials in the Supabase dashboard, and email codes
 * need a custom SMTP sender (D42). Until those exist, these return a friendly
 * "not set up yet" rather than a raw error.
 */

type Result = string | null;

const NOT_READY = 'This sign-in option isn’t set up yet. Try another, or skip for now.';

function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('provider is not enabled') || m.includes('unsupported provider')) return NOT_READY;
  // Supabase's built-in sender only mails the project's own team until custom SMTP is
  // set up (DECISIONS.md D42).
  if (m.includes('not authorized') || (m.includes('email address') && m.includes('invalid'))) return 'Email sign-in isn’t open yet. Try another option, or skip for now.';
  if (m.includes('rate limit') || m.includes('security purposes')) return 'Too many tries. Wait a minute and try again.';
  if (m.includes('expired') || m.includes('invalid')) return 'That code didn’t work. Check it or send a new one.';
  if (m.includes('network') || m.includes('fetch')) return 'No connection. Check your internet and try again.';
  return 'Something went wrong. Try again.';
}

export async function sendEmailCode(email: string): Promise<Result> {
  if (!supabase) return 'Not connected.';
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: true },
  });
  return error ? friendly(error.message) : null;
}

export async function verifyEmailCode(email: string, code: string): Promise<Result> {
  if (!supabase) return 'Not connected.';
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: code,
    type: 'email',
  });
  return error ? friendly(error.message) : null;
}

export async function signInWithApple(): Promise<Result> {
  if (!supabase) return 'Not connected.';
  if (!(await providerEnabled('apple'))) return NOT_READY;
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
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return ''; // they closed it
    return friendly(String(e));
  }
}

export async function signInWithGoogle(): Promise<Result> {
  if (!supabase) return 'Not connected.';
  // Supabase hands back a URL even when Google isn't enabled; ask first so the person
  // sees a plain message instead of a JSON error page in the browser.
  if (!(await providerEnabled('google'))) return NOT_READY;
  const redirectTo = Linking.createURL('sign-in/callback');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data.url) return friendly(error?.message ?? '');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return ''; // closed or cancelled
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
