# Handoff

This file shows where the project stands right now. Read it first when you
resume. Update it at the end of every working session.

**Last updated:** 2026-09-30

## Status: every MVP screen is built; the database needs one push, and there are no prices yet

The app has all the screens PRD 14.7 lists, in the website's own look (D62, D63):
onboarding (four steps), Compare, quote detail, "not covered yet" with the request form,
the route board, the tools, Learn, Account with saved comparisons and receipts, Add a price
and the metrics screen for admins. The WhatsApp bot is built and tested, waiting on Meta.

It meets the accessibility bar in D70 (AA contrast, the largest text sizes, VoiceOver,
44pt targets, offline prices), and it speaks five languages: English, plus drafts in
Hindi, Spanish, Tagalog and Vietnamese that only development builds show until a named
speaker signs off on each (D69).

What stands between this and a working product, in order:

1. **No prices.** All eight Tier 1 providers' terms forbid automated access (D52), so
   prices come from Add a price until one gives written permission. Wise said its
   Comparison API may be used (2026-09-30); the rest, follow up on 2026-10-12.
2. **Sign-in on a real iPhone** hasn't been tried (Apple and Google are enabled, D60, D61).

**Supabase:** project ref `gmzljjdnwndvqciqicbx`. All six migrations applied (Angad pushed
the last three on 2026-09-30). RLS smoke test: 48/48 on 2026-09-30. Edge Functions deployed: `delete-account`, `process-prices`. Not deployed:
`notify-route-launch` (needs `RESEND_API_KEY`), `whatsapp` (needs Meta).

## CAC receipt scanner (Phases 1–3 merged to `main` on 2026-09-30, PR #1)

Built by the cloud session for the Congressional App Challenge (D72–D90, D92), on the branch
`claude/gallant-hopper-51zhhm`; later phases reach `main` the same way, by PR (D87). `main` (languages D69, accessibility D70, flags) was merged into
the branch on 2026-09-30; the scanner uses the app-wide string catalogue.
- Phases 1–3 done: gap report (`docs/cac-gap-report.md`); `packages/receipt` (redaction,
  parser frame with Angad's 13 `TODO(angad)` extractors, model fallback, validation,
  result logic); `supabase/migrations/20260930000000_receipts.sql`; the `scan-receipt` Edge
  Function; the Scan a receipt screen with confirmation and result; the funding method and
  1% remittance tax in TrueCost and Compare. Every file is listed in `docs/AI_USAGE.md`.
- Tests: `npm test -w @remitbridge/receipt`, `npm test -w @remitbridge/mobile` (jest-expo),
  and `supabase/tests/local_migrations.sh` (55 checks, also in CI).
- The model fallback is Qwen3 VL 32B through OpenRouter (D92), no longer Claude.
- Phase 4 done (2026-09-30): the accuracy benchmark in `benchmark/` (D85, D93). 60 synthetic
  receipts, drawn in Chromium and read back with tesseract.js; `npm run benchmark -w
  @remitbridge/receipt` scores parser, model and combined modes into `benchmark/results.md`.
  Parser mode is 0% until Angad's extractors land; the model modes need `OPENROUTER_API_KEY`
  in the shell and haven't been run (the key isn't in the cloud sandbox). The generator
  found two redaction bugs, both fixed.
- Angad's next steps: review, write the extractors, set `OPENROUTER_API_KEY`
  (`supabase secrets set OPENROUTER_API_KEY=...` in his own terminal), make an EAS development build (scanning needs ML Kit, not in
  Expo Go), check the tax base (D78).
- Known limit: `scan-receipt` runs without JWT verification (scanning works signed out); the
  monthly model cap bounds spend.

## What changed on 2026-09-30

- Accessibility pass (D70): contrast measured and fixed, layouts that stack at large text,
  announcements, an adjustable rate chart, Bold Text, visible delete buttons, offline prices.
- Every string moved into `mobile/src/i18n/en.ts`; drafts in Hindi, Spanish, Tagalog and
  Vietnamese; the reviewer gate; Hind for Devanagari (D69).
- Mail links now show the address when the phone has no mail app, instead of doing nothing.
- Flags for the nine request-only countries (Angad's yes); every country has one.
- remitbridgelabs.org verified in Google Search Console on the RemitBridge Google account,
  with a second google-site-verification TXT record at GoDaddy (the older one is untouched).
- Partner outreach: Horn of Africa Services sent; East African Community Services in Drafts.
- Wise answered the permission request: its Comparison API may be used (logged in
  `docs/outreach/permission-request.md`).

## What changed on 2026-09-29

- Onboarding rebuilt from the website's elements (D62) and checked in the simulator;
  Tools, Learn and Account lists became the website's divided index (D63).
- Route requests, the route board, "Ask for a route" (D64); launch emails (D67).
- Quote detail, saved comparisons, TrueCost's "compare what $X gets today" link (D66).
- Admin metrics screen and the `admin_metrics()` function, sessions via `app_opened` (D65).
- The WhatsApp bot: `packages/bot` + `supabase/functions/whatsapp` (D68).
- Google and Apple sign-in enabled (D60, D61); site and landing page live (D57, D59).

## What's next (Angad)

1. **Future migrations:** turn ProtonVPN off first (it resets connections to Supabase's
   database port), test with `supabase/tests/local_migrations.sh`, then `supabase db push`
   and the smoke test (commands in README).
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
5. **Google brand verification** (D61): the domain is verified; say yes and Claude submits
   the brand verification in Google Cloud (OAuth consent screen, Branding).
6. **Apple Team ID** (developer.apple.com → Membership) for universal links, so partner
   links open the app (D48). It isn't anywhere on the Mac, and Chrome isn't signed in there.
7. **Disk:** 5.3 GB free on 2026-09-30; native builds (and so real store screenshots)
   need 15–20 GB. Most of the space is app caches in `~/Library/Caches` (17 GB): Chrome
   6.5 GB, ChatGPT Atlas 2.0 GB, Spotify 1.9 GB, and two app updaters' leftovers
   (`...ShipIt`) 1.6 GB. Clearing them from each app's own settings frees about 12 GB.
   The iOS 27 simulator runtime (7.5 GB) is needed; keep it.
8. **Partners:** Horn of Africa Services is sent. East African Community Services is ready
   in the RemitBridge Gmail's Drafts; the other seven texts are in
   `docs/outreach/partners.md` (El Centro de la Raza takes a web form).
9. **Translation reviewers** (D69): one fluent speaker each for Hindi, Spanish, Tagalog
   and Vietnamese, Hindi first. They read the draft in a development build (Account →
   Language), send corrections, and agree in writing to stand behind it; then their name
   and the date go in `mobile/src/i18n/languages.ts` and the language ships. Partner
   organizations (item 8) are a natural place to ask.
10. **Wise:** its Comparison API may be used (Simon Bruins, 2026-09-30). Decide whether to
   reply and whether to build a Wise adapter on the API. Only Wise's own quote from it
   would count; the same API returns other providers' prices as Wise reports them.

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
| `DECISIONS.md` | Decisions on top of the PRD (D1–D92; D71 unused; D91 is the other session's) |
| `docs/PRD.md` | PRD v0.4, kept as written |
| `docs/MANUAL_RESEARCH.md` | All eight Tier 1 providers, with the terms clause quoted |
| `docs/outreach/permission-request.md` | The permission email and the send/reply log |
| `packages/formula/` | The one total-cost formula, TypeScript and Python, pinned to `vectors.json` |
| `packages/bot/` | The WhatsApp bot's logic: parser, planner, replies in English and Hindi. 58 vitest tests, including the real webhook run against a fake database |
| `engine/` | Python engine: adapters, publish gate, raw archive, manual adapter, `rb-engine` CLI |
| `supabase/migrations/` | Schema, RLS and seed. The last two (route requests and metrics; WhatsApp) are **not applied yet** |
| `supabase/functions/` | `delete-account`, `process-prices` (deployed); `notify-route-launch`, `whatsapp` (not deployed) |
| `supabase/tests/rls_smoke.sh` | curl-based RLS test with the public key, 37 checks |
| `mobile/src/app/` | Screens: `onboarding/`, `sign-in/`, `(tabs)/` (Compare, Tools, Learn, Account), the tools, `quote/[id]`, `routes`, `request-route`, `admin`, `metrics` |
| `mobile/src/i18n/` | Every string: `en.ts` is the source, `es`/`hi`/`tl`/`vi` are drafts; `languages.ts` holds the reviewer gate (D69) |
| `mobile/src/lib/` | Data and helpers. `routes.ts`, `countries.ts` and `format.ts` have no imports on purpose: the bot imports them |
| `mobile/scripts/` | `make-icons.py` (app icon, splash), `make-onboarding-art.py` (the website's ground and band) |
| `site/` | app.remitbridgelabs.org on Vercel: landing page, privacy, support, partner links |
| `.github/workflows/` | `ci.yml` (engine, formula, bot, typecheck, lint), `scrape.yml`, `manual-prices.yml`, `health.yml` |

The remote is `https://github.com/OnGodCR/RemitBridge-App.git` (private). Branch `main`.

### How to run things

- Tests: `npm test -w @remitbridge/formula`, `npm test -w @remitbridge/bot`,
  `cd engine && uv run pytest -q`, and `npm run typecheck` for every workspace.
- App: `cd mobile && npx expo start --lan`, then open `exp://<LAN IP>:8081` in Expo Go
  (`ipconfig getifaddr en0` gives the IP; it changes between networks, and Expo Go then
  loses Metro until it's reopened on the new address). `--localhost` doesn't work on this
  Mac: Metro binds to IPv6 `[::1]` only, while Expo Go asks for 127.0.0.1.
- Replaying onboarding: Account → "Replay onboarding (dev only)".
- Simulator quirk: the first tap after a screen change often seems dropped. At least some
  of the time the tap landed and the simulator screenshot was a step behind (a mail alert
  turned up once per tap, late). Wait about two seconds before judging.
- Languages: Account → Language switches the app. Text size: `xcrun simctl ui booted
  content_size accessibility-extra-extra-extra-large` (and `large` to reset); relaunch
  the app after changing it, since the live change leaves a few frames half laid out.

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
