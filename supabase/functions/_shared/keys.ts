// The project's API keys inside an Edge Function (DECISIONS.md D137). Supabase's newer keys
// (sb_publishable_..., sb_secret_...) arrive as JSON dictionaries keyed by name; the legacy
// anon and service_role keys, which are tokens signed with the old JWT secret, as single
// values. The new ones win when present, so revoking the old secret breaks nothing here.

function fromDictionary(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    const keys = JSON.parse(raw) as Record<string, unknown>;
    const value = keys.default ?? Object.values(keys)[0];
    return typeof value === 'string' && value ? value : undefined;
  } catch {
    return undefined;
  }
}

/** Full access, bypassing row-level security: only for work the function itself checks. */
export function secretKey(): string {
  return fromDictionary(Deno.env.get('SUPABASE_SECRET_KEYS')) ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
}

/** The public key the app ships with: row-level security decides what it can do. */
export function publishableKey(): string {
  return fromDictionary(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')) ?? Deno.env.get('SUPABASE_ANON_KEY')!;
}
