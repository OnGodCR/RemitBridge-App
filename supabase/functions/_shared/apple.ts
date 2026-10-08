// Revokes a person's Sign in with Apple grant when they delete their account (DECISIONS.md
// D145). Apple asks every app that offers Sign in with Apple to do this, through its REST
// API: https://developer.apple.com/documentation/sign_in_with_apple/revoke_tokens
//
// The app sends a fresh authorization code from Apple's sheet; this swaps it for a refresh
// token and revokes that, which ends RemitBridge's access for that Apple Account. Nothing is
// stored: no Apple token is kept between sign-in and deletion.
//
// Needs four secrets, set by Angad from his terminal (never in chat):
//   APPLE_TEAM_ID       QS9F7JU6H2
//   APPLE_KEY_ID        the ID of the Sign in with Apple key (Certificates, IDs & Profiles > Keys)
//   APPLE_PRIVATE_KEY   that key's .p8 file, as text
//   APPLE_CLIENT_ID     the bundle ID, org.remitbridgelabs.app
// Without them, revokeApple says so and does nothing, and the account is still deleted.

const APPLE = 'https://appleid.apple.com';

export interface AppleConfig {
  teamId: string;
  keyId: string;
  privateKey: string;
  clientId: string;
}

export function appleConfig(env: (name: string) => string | undefined = (n) => Deno.env.get(n)): AppleConfig | null {
  const teamId = env('APPLE_TEAM_ID');
  const keyId = env('APPLE_KEY_ID');
  const privateKey = env('APPLE_PRIVATE_KEY');
  const clientId = env('APPLE_CLIENT_ID');
  return teamId && keyId && privateKey && clientId ? { teamId, keyId, privateKey, clientId } : null;
}

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const text = (s: string) => b64url(new TextEncoder().encode(s));

/** The client secret Apple wants: a JWT signed with the .p8 key (ES256), good for 5 minutes. */
export async function clientSecret(c: AppleConfig, now = Math.floor(Date.now() / 1000)): Promise<string> {
  const der = Uint8Array.from(
    atob(c.privateKey.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')),
    (ch) => ch.charCodeAt(0),
  );
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const head = text(JSON.stringify({ alg: 'ES256', kid: c.keyId }));
  const body = text(JSON.stringify({ iss: c.teamId, iat: now, exp: now + 300, aud: APPLE, sub: c.clientId }));
  // WebCrypto signs ECDSA as raw r||s, which is the form JWS's ES256 uses.
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(new Uint8Array(sig))}`;
}

export type RevokeResult = 'revoked' | 'not_configured' | 'failed';

export async function revokeApple(code: string, c: AppleConfig | null = appleConfig(), fetcher: typeof fetch = fetch): Promise<RevokeResult> {
  if (!c) return 'not_configured';
  try {
    const secret = await clientSecret(c);
    const form = (fields: Record<string, string>) => ({
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(fields),
    });
    const tokenRes = await fetcher(
      `${APPLE}/auth/token`,
      form({ client_id: c.clientId, client_secret: secret, code, grant_type: 'authorization_code' }),
    );
    if (!tokenRes.ok) return 'failed';
    const { refresh_token: refresh, access_token: access } = (await tokenRes.json()) as { refresh_token?: string; access_token?: string };
    const token = refresh ?? access;
    if (!token) return 'failed';
    const revokeRes = await fetcher(
      `${APPLE}/auth/revoke`,
      form({ client_id: c.clientId, client_secret: secret, token, token_type_hint: refresh ? 'refresh_token' : 'access_token' }),
    );
    return revokeRes.ok ? 'revoked' : 'failed';
  } catch {
    return 'failed';
  }
}
