# Handoff

This file shows where the project stands right now. Read it first when you
resume. Update it at the end of every working session.

**Last updated:** 2026-09-28

## Status: app built and connected; waiting on prices and sign-in

The app is built and connected: onboarding, Compare with search and estimates, How it
works, Account. What's missing:

- **Prices.** All eight Tier 1 providers' terms forbid automated access, or in Western
  Union's case aren't clear and its site blocks it (D52, `docs/MANUAL_RESEARCH.md`). So
  prices come from manual entry until a provider gives written permission. Angad sends
  the permission emails (`docs/outreach/permission-request.md`). Next to build: the
  admin-only manual price entry form.
- **Sign-in.** It needs custom SMTP (Resend) for email codes (D42), plus Apple and Google
  credentials. The entry form is admin-only, so Angad has to be able to sign in first.
- **GitHub Actions secrets** for the engine: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

**Supabase:** project ref `gmzljjdnwndvqciqicbx`, owned by Angad's separate
RemitBridge account (the CLI is logged into that account). Both migrations are
applied. `supabase/tests/rls_smoke.sh` passes 24/24 with the publishable key: every
denial returns Postgres's `42501`, not just any 4xx. The events trigger was proven
to overwrite a backdated `created_at` (migration `20260928000100` asserts it).

## The shape of the product (as of D34)

- **Mobile app** (Expo, iOS and Android) on the app stores. No web app. Screens: Compare, Results, Quote
  detail, Route not covered, Route board, Methodology, and the rebuilt tools:
  TrueCost, Fair rate, Yearly cost, Rate history, and Scam check.
- **Optional accounts** (email code, Apple, Google) to save comparisons and
  past transfers entered by hand. Comparing works without an account.
- **Metrics:** broad, first-party, and honest (D31), with an admin metrics screen.
- **Store-required pages** live on a remitbridgelabs.org subdomain served from this repo (D28).
- **Engine:** Python, run by GitHub Actions on a schedule (every 6 hours for
  digital providers, roughly hourly for health checks). Tier 1 adapters:
  Remitly, Wise, Xoom, Western Union, MoneyGram, Xe, WorldRemit, and Ria.
- **WhatsApp bot:** Meta Cloud API, with the webhook on Supabase Edge Functions.
- **Supabase** (a new project): Postgres, storage (the raw archive), auth, and Edge Functions.
- **Look:** same as the website (brand green `#14705A`, Plus Jakarta Sans, the semantic money colors).
- **Maintainer alerts:** email to Angad.

## What exists

| Path | What it is |
|---|---|
| `CLAUDE.md` | How to work on this repo: reply conventions, rules, voice, stack, secrets, git, open items, graphify |
| `HANDOFF.md` | This file |
| `README.md` | What the project is, with the planned layout (setup commands come later) |
| `DECISIONS.md` | Decisions made on top of the PRD (D1–D52) |
| `docs/PRD.md` | PRD v0.4, converted from the published artifact and kept as written |
| `docs/MANUAL_RESEARCH.md` | All eight Tier 1 providers, with the terms clause quoted and the date checked |
| `docs/outreach/permission-request.md` | The permission email draft and a send/reply log |
| `packages/formula/` | The total-cost formula in TypeScript (`src/`) and Python (`python/`), both pinned to `vectors.json`, which was generated from the website's TrueCost code |
| `engine/` | Python engine: adapter framework, polite client, FX cross-check, archive, publish gate, runner, `rb-engine` CLI, manual adapter. See `engine/README.md` |
| `supabase/migrations/` | `…000000_init.sql`: the schema with RLS, the `latest_quotes` view, the raw-archive bucket, and the Tier 1 seed. `…000100_rls_test_install.sql`: asserts the events trigger, removes the smoke test's events, and marks its install as internal. **Both applied to the live project.** |
| `supabase/tests/rls_smoke.sh` | curl-based RLS test run with the public key. Run it after every schema change |
| `mobile/` | Expo SDK 57 app. Onboarding (`app/onboarding`), sign-in (`app/sign-in`: Apple, Google, email code), and tabs (`app/(tabs)`): Compare (a green header band with From/To dropdowns that have search, and a typed amount; a delivery segmented control), How it works, and Account (sign out, delete account). Session in expo-sqlite localStorage; metrics via `lib/track.ts`. Checked in the iOS Simulator against the live project |
| `supabase/functions/delete-account/` | Deletes the caller's own account with the service-role key the platform injects. Deployed; refuses anonymous and forged-token calls |
| `.github/workflows/` | `ci.yml` (engine lint and tests, formula tests, typecheck, expo lint); `scrape.yml` and `health.yml` with their schedules off until an adapter exists (D40) |
| `.claude/settings.json` | graphify hooks that check the knowledge graph before searches and reads |
| `.gitattributes` | graphify's merge driver for `graphify-out/graph.json` |
| `.git/hooks/post-commit`, `post-checkout` | graphify graph rebuilds (not tracked by git) |

The remote is `https://github.com/OnGodCR/RemitBridge-App.git`. The branch is
`main`, and it's pushed. The repo is **public** and should be made private (D21).

## What's next

1. **GitHub Actions secrets** (Angad, in the repo's Settings → Secrets and variables
   → Actions): `SUPABASE_URL` = `https://gmzljjdnwndvqciqicbx.supabase.co`, and
   `SUPABASE_SERVICE_ROLE_KEY` = the **secret** key from the Supabase dashboard
   (Project Settings → API keys). Never through the chat.
2. **First real quotes.** Record a manual observation, push it, watch Scrape
   publish it, and see it on the Compare screen.
3. **Scraping, depending on Angad's decision:** check the six unread terms in a real
   browser; draft permission emails; build adapters only for cleared providers.
4. **Later slices:**
   - accounts (email code, Apple, Google), saved comparisons and transfers, in-app
     account deletion;
   - metrics events and the admin metrics screen (D31);
   - the rebuilt tools (TrueCost first);
   - route requests and the route board;
   - the WhatsApp bot;
   - the store-required pages on the subdomain;
   - engine hardening;
   - an app icon.

### How to run things

- Engine: `cd engine && uv sync && uv run pytest -q` (see `engine/README.md`).
- Formula (TypeScript): `npm test -w @remitbridge/formula`.
- App: `cd mobile && npx expo start --lan`, then open `exp://<LAN IP>:8081` in Expo
  Go (`ipconfig getifaddr en0` shows the current LAN IP; it changes between networks).
  `mobile/.env.local` holds the project URL and publishable key (gitignored). On this Mac, `--localhost` didn't work: Metro bound to IPv6 `[::1]` only and
  the simulator couldn't reach it. The LAN IP (192.168.1.25 at the time) did.
- Disk: after the npm cache was cleared on 2026-09-28 the Mac had 7.7 GB free, but it
  drifted back to 3.9 GB within hours. Native iOS builds will need 15–20 GB free.
- RLS: `SUPABASE_URL=... SUPABASE_PUBLISHABLE_KEY=... supabase/tests/rls_smoke.sh`.

### Local toolchain (checked 2026-09-28)

Installed: Xcode, Homebrew, Node 25, uv 0.12 (Python 3.12.14 managed by uv), and the
Supabase CLI 2.75 (2.118 is available). The system `python3` is 3.9; don't use it
for the engine.

## Known gaps between the PRD and the decisions

- PRD 14.1 puts the app inside the website. D1 and D14 replace that with a
  separate mobile app.
- PRD 5.6 and 11 say no personal financial data. D19 allows opt-in accounts
  with saved transfers, under RLS, with in-app deletion. D31 widens analytics
  well beyond PRD 5.6, keeping it first-party and aggregate.
- PRD 9.2 and 9.13 assume Redis and an always-on worker. D13 uses GitHub Actions
  with state in Postgres.
- PRD 14.11 assumes a design-system package shared with the website. Under D18
  the tokens are copied here instead, since the repos share no code.
- PRD Phase B's partner web widget has no web app to live in (open item).
