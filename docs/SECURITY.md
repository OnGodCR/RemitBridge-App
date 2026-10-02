# Security and data protection

What RemitBridge holds, who could want it, and what stops them. Written from the audit of
2026-10-01 (DECISIONS.md D135); update it whenever a table, function, secret or data flow
changes. Where this file and the code disagree, the code is wrong until proven otherwise.

## What's sensitive

| Data | Where | Who can read it |
|---|---|---|
| Saved transfers, comparisons, rate alerts (amounts, notes, push token) | `saved_*`, `rate_alerts` | The owner only (RLS), the service role |
| Email address, name, sign-in identities | Supabase Auth | The owner; admins see only a count of sign-ups |
| Route-request emails | `route_requests.notify_email` | Admins; deleted after the launch email or when a route is marked not feasible |
| Scanned receipt values (no person, no account, no device) | `receipts`, `receipt_fields`, `receipt_comparisons` | Only whoever holds the receipt's random ID; deleted after 30 days unless research consent |
| Redacted receipt images (research consent only) | Storage `receipt-images`, private | Service role only |
| WhatsApp numbers | As an HMAC (`whatsapp_users`); sealed with AES-GCM for at most an hour while a photo is read (`receipt_intake`); and, for a chat linked to an account, sealed with a separate key for alerts (`number_sealed`), deleted on unlink, STOP or account deletion (D139) | Opened only by the whatsapp function |
| Usage events (random install ID) | `events` | Admins, as totals |
| Network addresses | Never stored; an HMAC with a key that changes daily, for rate limits, deleted within a day | Nobody through the API |

## Threats and what stops them

**Reading someone else's data through the API.** Every table has row-level security; tables
only functions use have no policies at all. `supabase/tests/local/checks.sql` (signed in,
admin, service role) and `supabase/tests/rls_smoke.sh` (the live project, public key) prove
it; a denial only counts with Postgres's 42501. Security-definer functions check the caller
first (`admin_metrics`) or are granted to the service role only.

**Taking over an account.**
- No passwords: `custom_access_token_hook` refuses any token for a password sign-in or a
  session that began with one, so an account someone pre-registers with another person's
  address and a password is useless to them. Email confirmation is on.
- Sign-in redirects go only to `remitbridge://` and Expo Go on a private network (never an
  arbitrary `exp://` server, which could receive someone's sign-in).
- Google uses PKCE in the browser and Google's own sheet on iPhone; Apple sign-in sends a
  one-time nonce, so a copied token can't be replayed.
- On the phone, the session is AES-256-GCM encrypted with a key in the Keychain/Keystore,
  this device only (`mobile/src/lib/secure-session.ts`): it never goes into a backup.
  Android backup is off entirely (`allowBackup: false`).

**Personal details in receipts.** Redacted on the phone before anything is sent, checked
again on the server (if the server finds more, the image is dropped). The unredacted photo
files are deleted from the app's cache as soon as OCR has read them. The text is never
stored; values only. Images are stored only with research consent, only real JPEG/PNG
(checked by their first bytes), at most 8 MB.

**Floods and abuse.** Per-address limits on everything the public key can write (events,
route requests, saved items, rate alerts) and on the scan-receipt function (30 scans an
hour); the model has a monthly cap. The WhatsApp function is checked by Meta's signature and
rate-limited per number; its worker and it prove themselves with `RECEIPT_INTAKE_SECRET`.

**Promised deletions not happening.** pg_cron deletes expired receipts hourly, WhatsApp
numbers waiting for a reply every 10 minutes (and after an hour regardless), and rate-limit
counters daily; the functions also clean up on each call.

**Secrets leaking.** No `.env`, key file or service account is in git, history included
(checked 2026-10-01). Keys go straight from a terminal into Supabase, GitHub or EAS, never
into the chat. Logs never carry receipt text, values, numbers or push tokens. The
service-role key exists only in Edge Functions and GitHub Actions.

**Supply chain.** `npm audit` (2026-10-01): node-forge, uuid and decode-uri-component, all
inside Expo's build tooling, none shipped in the app or touching user data; they clear when
Expo updates them. Workflows have read-only permissions and no untrusted input in `run:`.

## Still to do (people, not code)

- Rotate the legacy JWT secret (it was printed into a Claude session on 2026-10-01).
- Turn on SSL enforcement for direct database connections.
- Two-factor authentication on every account that can reach data: Supabase, GitHub, Expo,
  Google (the RemitBridge Gmail and Cloud), Apple, Vercel, GoDaddy, Resend, Groq, Meta.
- Keep the database password long and random (it can't be checked from here).
