# Security audit, 2026-10-17

Run before the final store builds, at Angad's request ("run a full security audit in
everything you can do it on"). Angad checked his own accounts (two-factor and access) the
same day. Everything below was checked by Claude against the live project, a fresh app
bundle, the release builds on disk, and the source.

## Result

No secret is exposed, and no stranger can read or change anyone's data. Four things were
fixed or tightened; two small items are left, listed at the end.

## What was checked

| Area | How | Result |
|---|---|---|
| Secrets in the repository | Every tracked file, and every commit in the history on every branch, searched for Supabase secret keys, JWTs, Groq, Resend, Meta, AWS, Google and GitHub tokens and private keys | None. Only key *names* and test fakes. The one look-alike is a sample receipt image stored as text. The legacy key exposed before D137 was revoked on 2026-10-02. |
| Secrets in the app | A production-mode Android bundle exported and searched; the EAS production environment listed | Only public values: the Supabase address and publishable key, and the Google client IDs. The Firebase config is a hidden EAS file. No server key or secret name. |
| Row-level security, live | `supabase/tests/rls_smoke.sh` with the public key against the live project | 79 of 79 pass. Three checks added today: `mid_market_rates` and `provider_routes` refuse inserts (42501), and the `private` schema (the review list, the rate limiter) isn't served at all. Deletes and edits on public tables touch 0 rows. |
| Account metadata | Everything that reads `user_metadata` | Used only for the display name and the terms acceptance (D188), never for access. Admin rights come from `profiles`, which strangers can't write. |
| Edge Functions | Each function's caller check | Admin functions check `is_admin()` with the caller's own token; delete-account deletes only the caller; WhatsApp's Meta signature and the receipt worker's secret are compared in constant time; unsubscribe answers the same whether a token matched; the model spending caps fail closed. |
| Sign-in, live | `/auth/v1/settings` and `supabase/config.toml` | Email code, Apple and Google only; anonymous sign-in off; email confirmation on; refresh-token rotation on; one-hour tokens; passwords refused by the hook except the App Review account (D184). |
| On the phone | `secure-session.ts`, `prefs.ts`, the release manifests | The session is AES-256-GCM encrypted with a key in the Keychain or Keystore, this device only, never backed up. Plain storage holds only preferences and a random install ID. iOS blocks plain HTTP (`NSAllowsArbitraryLoads` false in the real build); Android has no cleartext setting and `allowBackup` false. |
| Dependencies | `npm audit`, all and production | 70 entries (no critical). All but three are build tools that run on the Mac or EAS (Metro, the Expo CLI, Jest, patch-package), not in the app. Those three (expo-router, query-string, decode-uri-component) are one issue that reaches the app: see below. |

## Fixed today

1. **Remmy's per-address limit could be dodged.** It read the first `x-forwarded-for`
   entry, which a caller can write. Remmy and the scanner now share `_shared/client-ip.ts`,
   which prefers the platform's `cf-connecting-ip` and `x-real-ip`, the same order the
   database uses (`private.request_ip`).
2. **Two limiters let requests through when they couldn't be checked.** The scanner's
   hourly and daily limits, and Remmy's per-address limit, now refuse when the database
   can't answer. (A request with no address at all is still allowed by the database
   function, so this doesn't lock anyone out.)
3. **The smoke test missed three places.** Added, as above.
4. **Earlier today:** the review list's row-level security policy (D184), the terms
   acceptance (D188).

Fixes 1 and 2 are in the source and need Angad to deploy the two functions:

```bash
supabase functions deploy remmy --project-ref gmzljjdnwndvqciqicbx
```

```bash
supabase functions deploy scan-receipt --project-ref gmzljjdnwndvqciqicbx
```

## Left

- **Expo Go sign-in addresses (Angad, dashboard):** Authentication, URL Configuration still
  allows `exp://` addresses for Expo Go on a local network. Once testing in Expo Go is over,
  remove them and keep `remitbridge://**`. Low risk until then.
- **One app dependency (`decode-uri-component`, via expo-router):** a deliberately broken
  link could freeze the app for whoever taps it; no data is exposed. The fixed version only
  ships as an ES module that expo-router's `query-string` can't load, so forcing it would
  break link handling. Wait for Expo to update it.
- **Not testable from here:** that the platform overwrites `cf-connecting-ip` and
  `x-real-ip` (it should, as Cloudflare and the gateway set them), and device-level checks,
  which belong to the TestFlight and Play internal-test runs in `docs/launch-checklist.md`.
