# Handoff

This file shows where the project stands right now. Read it first when you
resume. Update it at the end of every working session.

**Last updated:** 2026-09-30 (evening)

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

1. **Few prices.** Wise's come automatically from its Comparison API, with permission
   (D91), every 6 hours. The first run (2026-09-30, Actions run 36767752853) published 20:
   the app shows Wise on all four routes, e.g. $500 to India, ₹47,102, 1.7% total cost. The other seven providers forbid
   automated access (D52): Add a price, or follow up on 2026-10-12.
2. **Sign-in on a real iPhone** hasn't been tried (Apple and Google are enabled, D60, D61).

**Supabase:** project ref `gmzljjdnwndvqciqicbx`. All nine migrations applied (Angad pushed
the last two, `20260930020000_whatsapp_receipts` and `20260930030000_receipt_observatory`,
on 2026-09-30 evening). RLS smoke test: 52/52 after that push. Edge Functions deployed: `delete-account`, `process-prices`, `scan-receipt` (2026-09-30),
`notify-route-launch` and `whatsapp` (2026-10-01; both do nothing until their secrets are set). Not deployed:
`notify-route-launch` (needs `RESEND_API_KEY`), `whatsapp` (needs Meta).

## 2026-09-30 evening (local session, the go-live list)

- `supabase db push --dry-run` listed exactly `20260930020000_whatsapp_receipts` and
  `20260930030000_receipt_observatory`. Claude's `supabase db push` was refused as a
  production deploy; Angad ran it, and the smoke test passed 52/52.
- **The receipt model is going away.** OpenRouter lists `qwen/qwen3-vl-32b-instruct` as
  retired on 2026-10-09 (suggesting Qwen3.7 Plus). One provider serves it: Alibaba Cloud
  Int. (Singapore and China), no prompt training, retention "unknown", $0.104 in and
  $0.416 out per million tokens. Candidates with vision and structured outputs and no
  end date: `qwen/qwen3-vl-30b-a3b-instruct` ($0.15/$0.60), `qwen/qwen3.8-flash`
  ($0.15/$0.47), `qwen/qwen3.7-plus` ($0.32/$1.28). `qwen/qwen3.7-flash` is cheaper but
  doesn't list structured outputs, which D92 requires. The benchmark workflow now takes a
  `model` input to compare them.
- Universal links, app side: `ios.associatedDomains` and an Android intent filter in
  `app.json`, and a `p/[partner]` route that counts the visit and goes to `/`. The page's
  "Open the app" button now opens `remitbridge://p/<partner>`. Only the
  `apple-app-site-association` file is left, and it needs the Team ID.
- Disk: 12 GB free.
- `GITHUB_DISPATCH_TOKEN` (Angad, checked against GitHub first) and `WHATSAPP_RECEIPTS=on`
  are set in Supabase. WhatsApp now needs only Meta's four values.
- **WhatsApp is set up** (Meta app "RemitBridge", test number +1 555 184 5383, Phone number
  ID 1399186246604217, system-user token, webhook verified and subscribed to `messages`).
  The verify token was made twice (the first was lost from the clipboard); only the second
  is stored. **But Meta restricted the WhatsApp account at once** (error 131031, "Business
  Account locked"; Business Support Home: "Account Restricted, Duration: Permanent" until
  business verification), so no message can be sent or answered yet. RemitBridge isn't a
  registered business (D49), so whether and how to verify is Angad's decision.
- **UI pass (D101, D102), in progress:** Scan is the first tab and the app opens on it;
  Compare moved to `(tabs)/compare.tsx`; rows lead with drawn illustrations (D103, after
  Angad called the first icon tiles "too vibecoded"); shorter captions in all five languages.
  No yellow in the drawings; larger text on Scan. Learn is eight modules built from the
  glossary, with numbered lessons that open on tap (D104); How it works is in Account.
  No yellow anywhere, money colours included (D105). The website's blog is in the app,
  Learn → Blog (D106): `cd mobile && node scripts/port-blog.mjs` re-ports it (needs
  Google Chrome); then rerun the Hindi sheet script. Learn shows progress as a path of
  modules with Continue (D107, kept on the phone); saved comparisons and checks have
  their own screen, reached from Tools, Compare and Account (D108); the drawings have
  depth (D109).
- **2026-10-01, later:** the Wise thank-you and seven partner emails sent; `host.exp.Exponent`
  removed from Apple sign-in (D116); providers' terms read in a browser, Instarem cleared,
  the World Bank survey found (D115). Then, with Angad's yes: the Instarem adapter (20 of
  20 live quotes through the gate locally) and the survey's US rows in `research/` (D118).
- **Rate alerts (D113)** and a greeting (D114) are live. Angad pushed
  `20261001000000_rate_alerts.sql` on 2026-10-01; smoke test 55/55, and the next
  `rate-alerts.yml` run read the function ("0 alert(s) due"). A real push still needs the
  iPhone development build (Expo Go and simulators get no token). The sender is `.github/scripts/send-rate-alerts.mjs`, run by `rate-alerts.yml` after
  each price update. Remittance tax: still proposed; `tax-rules.yml` watches weekly (D110). WhatsApp is
  parked (D100). The Hindi review sheet is regenerated from the string files by
  `npx tsx scripts/review-sheet.ts hi` (in `mobile/`); rerun it after any string change.
- **Scrape schedule:** Angad confirmed it's running (2026-10-01). Earlier note: the `17 */6` cron added on 2026-09-30 had produced no
  scheduled run by 04:00 UTC on 2026-10-01 (00:17 was due); Claude started one by hand
  (run 36813213444, success). Check that 06:17 and later runs appear on their own; if
  not, look at the Health checks workflow's staleness alert.
- **Order of work (D99):** every free setup first (Resend done; GitHub token and Meta
  next), then the Apple Developer Program fee, the iPhone build and universal links, then
  testing. CLAUDE.md's open items are now grouped that way.
- **The receipt model moved to Groq's free tier (D98):** `qwen/qwen3.8-27b`, `GROQ_API_KEY`
  (set by Angad in Supabase and GitHub Actions). No more OpenRouter, no fallback models.
  About 60 receipts a day free; past that the rules read alone. The privacy policy names Groq.
  `scan-receipt` is deployed (2026-09-30). The first key was refused (401: the value had
  stray spaces); Angad made a new one and set it with a command that checks it against Groq
  first and reads it from the clipboard, so it never shows (README). The first live call
  (run 36800253679) read all 11 fields of one synthetic receipt right. Zero Data Retention
  is on (Angad, 2026-10-01).
- **Benchmark on Groq** (run 36800320699, 20 synthetic receipts, redacted text only, now
  `benchmark/results.md`): model mode 82.3% accuracy, 93.0% precision; combined 68.1%
  accuracy, 93.9% precision. Parser mode is 0% until Angad's extractors land. The gap
  between accuracy and precision is the free tier: the run hit 112 rate-limit waits, and
  6 receipts in combined mode (3 in model mode) gave up after five. What it reads, it
  reads right; how much it can read at once is the limit. Only 1 of 14 wrong values was
  flagged for checking, which is worth a look once the extractors exist.
- `RECEIPT_INTAKE_SECRET` (Supabase and GitHub Actions) and `WHATSAPP_HASH_SECRET`
  (Supabase) set by Claude with `openssl rand`, never displayed.
- EAS: Angad signed in (`ongodcr`); Claude ran `eas init` (project @ongodcr/remitbridge,
  ID 4f77369f-d571-441a-831d-f29591585375) and created `EXPO_PUBLIC_SUPABASE_URL` and
  `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as plaintext variables for `development`. Next:
  `eas device:create` and the build, which need Angad's Apple sign-in.
- The app runs in Expo Go on the iPhone 18 Pro simulator (`npx expo start --lan`, then
  `exp://192.168.1.25:8081`); Compare shows Wise's live price.

## 2026-10-01 (cloud session)

- The remittance tax now follows the IRS proposed rules (D97): no tax at $15 or less.
- `.github/workflows/benchmark.yml` runs the full receipt benchmark on GitHub, by hand. It
  needs an `OPENROUTER_API_KEY` Actions secret.
- `docs/translation-review/hi.md` is the Hindi review sheet; `docs/cac/submission.md` is the
  draft CAC entry and video script.
- Still Angad's: `supabase db push` for the two receipt migrations (refused for Claude as a
  production deploy, from the cloud and through a local session alike), the OpenRouter key,
  and the EAS build.

## CAC receipt scanner (all six phases on `main`: PR #1 on 2026-09-30, PR #2 on 2026-10-01)

Built by the cloud session for the Congressional App Challenge (D72–D90, D92), on the branch
`claude/gallant-hopper-51zhhm`; later phases reach `main` the same way, by PR (D87). `main` (languages D69, accessibility D70, flags) was merged into
the branch on 2026-09-30; the scanner uses the app-wide string catalogue.
- Phases 1–3 done: gap report (`docs/cac-gap-report.md`); `packages/receipt` (redaction,
  parser frame with Angad's 13 `TODO(angad)` extractors, model fallback, validation,
  result logic); `supabase/migrations/20260930000000_receipts.sql`; the `scan-receipt` Edge
  Function; the Scan a receipt screen with confirmation and result; the funding method and
  1% remittance tax in TrueCost and Compare. Every file is listed in `docs/AI_USAGE.md`.
- Tests: `npm test -w @remitbridge/receipt`, `npm test -w @remitbridge/mobile` (jest-expo),
  and `supabase/tests/local_migrations.sh` (77 checks, also in CI). The live smoke test has
  52 checks; the 4 for the photo queue and the observatory need their migrations.
- The model fallback is Qwen3 VL 32B through OpenRouter (D92), no longer Claude.
- Phase 4 done (2026-09-30): the accuracy benchmark in `benchmark/` (D85, D93). 60 synthetic
  receipts, drawn in Chromium and read back with tesseract.js; `npm run benchmark -w
  @remitbridge/receipt` scores parser, model and combined modes into `benchmark/results.md`.
  Parser mode is 0% until Angad's extractors land; the model modes need `OPENROUTER_API_KEY`
  in the shell and haven't been run (the key isn't in the cloud sandbox). The generator
  found two redaction bugs, both fixed.
- Phase 5 built (2026-09-30), approved by Angad 2026-10-01 but off until its secrets are set
  (D94): receipt photos on WhatsApp. The
  webhook queues a photo (`receipt_intake`, migration `20260930020000_whatsapp_receipts.sql`,
  not pushed), `.github/workflows/receipt-intake.yml` reads and redacts it, `scan-receipt`
  reads the redacted text, and the bot replies or checks unsure values one at a time. To turn
  it on: push the migration; `supabase secrets set RECEIPT_INTAKE_SECRET=... GITHUB_DISPATCH_TOKEN=... WHATSAPP_RECEIPTS=on`;
  the same `RECEIPT_INTAKE_SECRET` and `WHATSAPP_ACCESS_TOKEN` as GitHub Actions secrets;
  redeploy `whatsapp` and `scan-receipt`.
- Phase 6 built (2026-09-30): the disclosure check (D95), on the result screen and in the
  WhatsApp reply, scored in the benchmark; and the receipt observatory (D96), Learn → "What
  people paid", from `receipt_observatory()`. Migration `20260930030000_receipt_observatory.sql`,
  not pushed. All six CAC phases are built; Angad's extractors and the live setup are what's
  left.
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
2. **More prices:** push `20261001010000_instarem_provider.sql` so the Instarem adapter
   (D118) can save its quotes on the next Scrape run (the run before the push fails for
   Instarem only). The World Bank survey's US rows are in `research/world-bank-rpw/`. Everyone else: Add a price
   (Account tab) or their permission; `docs/MANUAL_RESEARCH.md` quotes each clause.
3. **Launch emails:** done 2026-10-01 (`notify-route-launch` deployed, `RESEND_API_KEY`
   set). The first real send is when a requested route goes live.
4. **WhatsApp** (D68), when ready: a Meta business account and app with the WhatsApp
   product, a phone number, and a system-user token. Set the five `WHATSAPP_*` secrets
   listed at the top of `supabase/functions/whatsapp/index.ts`, deploy with
   `supabase functions deploy whatsapp --use-api`, register
   `https://gmzljjdnwndvqciqicbx.supabase.co/functions/v1/whatsapp` as the webhook with
   your verify token, and subscribe to the `messages` field. Read the Hindi replies in
   `packages/bot/src/messages.ts` first.
5. **Google brand verification** is done (verified and published 2026-09-30). The consent
   screen's app name is "RemitBridge App"; rename it to "RemitBridge" in Google Cloud →
   Google Auth Platform → Branding if you prefer (that may need a new check).
6. **Apple Team ID** (developer.apple.com → Membership) for universal links, so partner
   links open the app (D48). It isn't anywhere on the Mac, and Chrome isn't signed in there.
7. **Disk:** 5.3 GB free on 2026-09-30; native builds (and so real store screenshots)
   need 15–20 GB. Most of the space is app caches in `~/Library/Caches` (17 GB): Chrome
   6.5 GB, ChatGPT Atlas 2.0 GB, Spotify 1.9 GB, and two app updaters' leftovers
   (`...ShipIt`) 1.6 GB. Clearing them from each app's own settings frees about 12 GB.
   The iOS 27 simulator runtime (7.5 GB) is needed; keep it.
8. **Partners:** eight of nine sent (2026-09-30 and 2026-10-01). El Centro de la Raza's web
   form is yours: it needs a phone number and an anti-spam answer. Replies go in the log
   in `docs/outreach/partners.md`.
9. **Translation reviewers** (D69): one fluent speaker each for Hindi, Spanish, Tagalog
   and Vietnamese, Hindi first. They read the draft in a development build (Account →
   Language), send corrections, and agree in writing to stand behind it; then their name
   and the date go in `mobile/src/i18n/languages.ts` and the language ships. Partner
   organizations (item 8) are a natural place to ask. Hindi: Angad's mother (D117).
10. **Wise:** the adapter is built and scheduled (D91); the thank-you to Simon Bruins went
   out 2026-10-01.
11. **CAC:** after the app is finished (D117).

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
| `DECISIONS.md` | Decisions on top of the PRD (D1–D114; D71 unused) |
| `docs/PRD.md` | PRD v0.4, kept as written |
| `docs/MANUAL_RESEARCH.md` | Every provider checked, with the terms clause quoted (D115) |
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
