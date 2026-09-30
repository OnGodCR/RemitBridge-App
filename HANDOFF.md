# Handoff

This file shows where the project stands right now. Read it first when you
resume. Update it at the end of every working session.

**Last updated:** 2026-09-30 (CAC Phase 2)

## Status: every MVP screen is built; the database needs one push, and there are no prices yet

The app has all the screens PRD 14.7 lists, in the website's own look (D62, D63):
onboarding (four steps), Compare, quote detail, "not covered yet" with the request form,
the route board, the tools, Learn, Account with saved comparisons and receipts, Add a price
and the metrics screen for admins. The WhatsApp bot is built and tested, waiting on Meta.

What stands between this and a working product, in order:

1. **Two migrations aren't applied** (`20260929010000_route_requests_and_metrics.sql`,
   `20260929020000_whatsapp.sql`). The permission classifier refused `supabase db push`
   from Claude as a production deploy, so Angad runs it (commands below). Until then, route
   requests fail with "That didn't go through", the board says request counts didn't load,
   and the metrics screen can't load.
2. **No prices.** All eight Tier 1 providers' terms forbid automated access (D52), so
   prices come from Add a price until one gives written permission. Only auto-replies so
   far (Xoom's media desk, Xe ticket 26724746); follow up on 2026-10-12.
3. **Sign-in on a real iPhone** hasn't been tried (Apple and Google are enabled, D60, D61).

**Supabase:** project ref `gmzljjdnwndvqciqicbx`. Three of five migrations applied. RLS smoke
test: 26/26 passed on the applied schema; it now has 37 checks, 11 of which need the two
new migrations. Edge Functions deployed: `delete-account`, `process-prices`. Not deployed:
`notify-route-launch` (needs `RESEND_API_KEY`), `whatsapp` (needs Meta).

## What changed on 2026-09-30

Angad is entering the app in the 2026 Congressional App Challenge (internal deadline
2026-10-23) with a receipt scanner and the features around it (D69). The work is on branch
`claude/gallant-hopper-51zhhm` until he merges it (D84).

- **Phase 1:** the gap report, `docs/cac-gap-report.md`. Angad accepted all 15
  recommendations; they're D70–D84.
- **Phase 2, built:**
  - **Formula:** the 1% remittance tax is in the one formula, both languages (D73, D75), with
    hand-derived test cases in `packages/formula/vectors.tax.json`.
  - **`packages/receipt`:** the pipeline, pure TypeScript. PII detection and redaction; the
    rule-based parser's frame, provider templates, fixtures and scoring harness, with the
    13 field extractors left as `TODO(angad)` stubs (D83); the Claude fallback with a strict
    JSON schema; merging with an extraction path per field; validation with the formula and
    the most likely misread value.
  - **Database:** `20260930000000_receipts.sql` adds `receipts`, `receipt_fields`,
    `receipt_comparisons`, the monthly model cap, `receipt_result()` and the private
    `receipt-images` bucket. Checked on a local Postgres (55 checks); the smoke test now has
    48 checks.
  - **`scan-receipt` Edge Function:** a second redaction pass, then reading, storing and
    forgetting, tested under vitest against fakes.
  - **App:** the Scan a receipt screen (Tools), which covers details on the phone and shows
    the preview; the English and Hindi string catalogue with a language setting on Account
    and Noto Sans Devanagari (D72); the app's first test runner (jest-expo, 26 tests);
    `eas.json` and `expo-dev-client` for development builds.
- `docs/AI_USAGE.md`: every session's files, for the CAC's AI-use disclosure.
- The privacy policy has a "Scanning a receipt" section and lists Anthropic (live once merged).

**Known limit:** `scan-receipt` runs without JWT verification (scanning works signed out,
and the publishable key isn't a JWT). Anyone with the app's public key can call it, so a
flood could use up the month's model calls (the cap stops the spending, not the calls) and
add junk rows that expire in 30 days. A per-install rate limit can come later if needed.

**Phase 2 stubs, on purpose:** the parser finds nothing until Angad writes the extractors,
so today every value comes from the model (or the person). The scan screen ends at a plain
list of what was read; the confirmation and result screens are Phase 3.

## What changed on 2026-09-29

- Onboarding rebuilt from the website's elements (D62) and checked in the simulator;
  Tools, Learn and Account lists became the website's divided index (D63).
- Route requests, the route board, "Ask for a route" (D64); launch emails (D67).
- Quote detail, saved comparisons, TrueCost's "compare what $X gets today" link (D66).
- Admin metrics screen and the `admin_metrics()` function, sessions via `app_opened` (D65).
- The WhatsApp bot: `packages/bot` + `supabase/functions/whatsapp` (D68).
- Google and Apple sign-in enabled (D60, D61); site and landing page live (D57, D59).

## What's next (Angad)

0. **CAC: review Phase 2** (above and in `docs/AI_USAGE.md`), then say go for Phase 3
   (confirmation screen, result screen, funding method in TrueCost and Compare). Meanwhile:
   - **Write the extractors** in `packages/receipt/src/extract/fields.ts` (each TODO says its
     inputs, output and expected behavior). Check them with
     `npm run parser:report -w @remitbridge/receipt` and `npm test -w @remitbridge/receipt`
     (`RECEIPT_STRICT=1` to fail on values not read yet).
   - **Model key:** create an Anthropic API key, set it with
     `supabase secrets set ANTHROPIC_API_KEY=...` in your own terminal, then
     `supabase functions deploy scan-receipt --use-api`. Without the key, receipts are read by
     the rules alone. The cap is 300 model calls a month (`RECEIPT_MODEL_MONTHLY_CAP`).
   - **Development build**, to scan on your iPhone: `cd mobile && npx eas-cli@latest init`,
     add the two `EXPO_PUBLIC_*` values as EAS environment variables for `development`, then
     `npx eas-cli@latest build --profile development --platform ios`. The OCR module
     (`@infinitered/react-native-mlkit-text-recognition` 5.0.1) hasn't been through a native
     build yet; this is the first one.
   - **The tax base (D75):** check in the IRS proposed regulations (Federal Register
     2026-07085) whether fees count toward the 1%. Claude's sandbox couldn't open them.
   - **Read the Hindi** in `mobile/src/i18n/hi.ts`, as well as the bot's.
1. **Push the migrations, then run the smoke test** from the repo root:
   ```bash
   supabase db push
   ```
   ```bash
   set -a; source mobile/.env.local; set +a; SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL SUPABASE_PUBLISHABLE_KEY=$EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY supabase/tests/rls_smoke.sh
   ```
   Expect 48 passed. There are three unapplied migrations now (the receipts one too); all
   were applied to a throwaway Postgres 16 with `supabase/tests/local_migrations.sh`, and its
   55 checks passed.
2. **Enter the first prices** with Add a price (Account tab). Compare, the quote detail and
   the bot all start working the moment one is published.
3. **Launch emails:** create an API key in Resend (sending access, remitbridgelabs.org),
   set it with `supabase secrets set RESEND_API_KEY=...` in your own terminal, then
   `supabase functions deploy notify-route-launch --use-api`.
4. **WhatsApp** (D68), when ready: a Meta business account and app with the WhatsApp
   product, a phone number, and a system-user token. Set the five `WHATSAPP_*` secrets
   listed at the top of `supabase/functions/whatsapp/index.ts`, deploy with
   `supabase functions deploy whatsapp --use-api`, register
   `https://gmzljjdnwndvqciqicbx.supabase.co/functions/v1/whatsapp` as the webhook with
   your verify token, and subscribe to the `messages` field. Read the Hindi replies in
   `packages/bot/src/messages.ts` first.
5. **Say yes or no** to: downloading nine more flags from flagcdn.com (Ukraine, Ecuador,
   Nicaragua, Uganda, Somalia, Eritrea, Cuba, Afghanistan, Venezuela; about 30 small PNGs;
   they show a plain tile until then); adding Google's verification TXT record at GoDaddy
   for brand verification (D61).
6. **Apple Team ID** (developer.apple.com → Membership) for universal links, so partner
   links open the app (D48). Claude couldn't read it without signing in.
7. **Disk:** 5.7 GB free on 2026-09-29; native builds (and so real store screenshots)
   need 15–20 GB. Most of the space is app caches in `~/Library/Caches` (17 GB): Chrome
   6.5 GB, ChatGPT Atlas 2.0 GB, Spotify 1.9 GB, and two app updaters' leftovers
   (`...ShipIt`) 1.6 GB. Clearing them from each app's own settings frees about 12 GB.
   The iOS 27 simulator runtime (7.5 GB) is needed; keep it.
8. **Partners:** a shortlist of nine Seattle-area organizations and a draft email are in
   `docs/outreach/partners.md` (not sent).

## The shape of the product

- **Mobile app** (Expo SDK 57, iOS and Android) on the app stores. No web app (D14).
- **Optional accounts** (email code, Apple, Google) to save comparisons and receipts.
  Comparing works without one (D19).
- **Metrics:** first-party events, an admin screen with a definition under every number,
  CSV export (D31, D65).
- **Engine:** Python on GitHub Actions. Every Tier 1 provider is manual for now (D52).
- **WhatsApp bot:** Meta Cloud API, webhook on Supabase Edge Functions (D68).
- **Supabase:** Postgres with RLS on every table, storage (raw archive), auth, Edge Functions.
- **Look:** the website's (D18, D62): brand green `#14705A`, Plus Jakarta Sans, the tiled
  bridge mark, eyebrows, two-tone titles, divided lists, the green left rule.

## What exists

| Path | What it is |
|---|---|
| `CLAUDE.md` | How to work on this repo: reply conventions, rules, voice, stack, secrets, git, open items |
| `DECISIONS.md` | Decisions on top of the PRD (D1–D68) |
| `docs/PRD.md` | PRD v0.4, kept as written |
| `docs/MANUAL_RESEARCH.md` | All eight Tier 1 providers, with the terms clause quoted |
| `docs/outreach/permission-request.md` | The permission email and the send/reply log |
| `packages/formula/` | The one total-cost formula, TypeScript and Python, pinned to `vectors.json` |
| `packages/receipt/` | The receipt pipeline: redaction, parser frame and templates (extractors are Angad's TODOs), the Claude fallback, merging, validation, fixtures and harness. 135 vitest tests, including the `scan-receipt` function against fakes |
| `packages/bot/` | The WhatsApp bot's logic: parser, planner, replies in English and Hindi. 58 vitest tests, including the real webhook run against a fake database |
| `engine/` | Python engine: adapters, publish gate, raw archive, manual adapter, `rb-engine` CLI |
| `supabase/migrations/` | Schema, RLS and seed. The last two (route requests and metrics; WhatsApp) are **not applied yet** |
| `supabase/functions/` | `delete-account`, `process-prices` (deployed); `notify-route-launch`, `whatsapp`, `scan-receipt` (not deployed) |
| `supabase/tests/rls_smoke.sh` | curl-based RLS test with the public key, 48 checks |
| `supabase/tests/local_migrations.sh` | Every migration on a throwaway Postgres, then `local/checks.sql` (55 checks); also in CI |
| `mobile/src/app/` | Screens: `onboarding/`, `sign-in/`, `(tabs)/` (Compare, Tools, Learn, Account), the tools, `scan`, `quote/[id]`, `routes`, `request-route`, `admin`, `metrics` |
| `mobile/src/i18n/` | The English and Hindi string catalogue for new screens (D72) |
| `mobile/src/__tests__/` | The app's jest tests (catalogue, Hindi font, scan helpers, the scan screen's flow) |
| `mobile/src/lib/` | Data and helpers. `routes.ts`, `countries.ts` and `format.ts` have no imports on purpose: the bot imports them |
| `mobile/scripts/` | `make-icons.py` (app icon, splash), `make-onboarding-art.py` (the website's ground and band) |
| `site/` | app.remitbridgelabs.org on Vercel: landing page, privacy, support, partner links |
| `.github/workflows/` | `ci.yml` (engine, formula, bot, typecheck, lint), `scrape.yml`, `manual-prices.yml`, `health.yml` |

The remote is `https://github.com/OnGodCR/RemitBridge-App.git` (private). Branch `main`.

### How to run things

- Tests: `npm test -w @remitbridge/formula`, `npm test -w @remitbridge/bot`,
  `npm test -w @remitbridge/receipt`, `npm test -w @remitbridge/mobile`,
  `cd engine && uv run pytest -q`, and `npm run typecheck` for every workspace.
- App: `cd mobile && npx expo start --lan`, then open `exp://<LAN IP>:8081` in Expo Go
  (`ipconfig getifaddr en0` gives the IP; it changes between networks, and Expo Go then
  loses Metro until it's reopened on the new address). `--localhost` doesn't work on this
  Mac: Metro binds to IPv6 `[::1]` only, while Expo Go asks for 127.0.0.1.
- Replaying onboarding: Account → "Replay onboarding (dev only)".
- Simulator quirk: the first tap after a screen change is often dropped; tap again.

### Local toolchain (checked 2026-09-29)

Xcode, Homebrew, Node 25, uv 0.12 (Python 3.12 managed by uv), Supabase CLI 2.75 (2.118
available). No Deno and no Docker: Edge Functions are typechecked with tsc against Deno
stubs, and the bot's webhook is tested under vitest. The system `python3` is 3.9; don't
use it for the engine.

## Known gaps between the PRD and the decisions

- PRD 14.1 puts the app inside the website. D1 and D14 make it a separate mobile app.
- PRD 5.6 and 11 say no personal financial data. D19 allows opt-in accounts with saved
  receipts under RLS and in-app deletion. D31 widens analytics, first-party and aggregate.
- PRD 9.2 and 9.13 assume Redis and an always-on worker. D13 uses GitHub Actions and Postgres.
- PRD 14.11 assumes a design system shared with the website. Under D18 the tokens are copied.
- PRD 5.8 wants WHY to use "the user's last quote" but also no amounts tied to a number.
  D68 keeps the privacy rule: WHY uses the $500 example on the last route.
- PRD Phase B's partner web widget has no web app to live in (D48 uses plain links instead).
