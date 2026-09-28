# Handoff

This file shows where the project stands right now. Read it first when you
resume. Update it at the end of every working session.

**Last updated:** 2026-09-28

## Status: first build slice done, waiting on two things

The first slice is built, tested and pushed (2026-09-28). What's blocking:

1. **The scraping decision.** Wise's and Remitly's terms forbid automated access,
   and the other six couldn't be read with a plain request (D38,
   `docs/MANUAL_RESEARCH.md`). The recommendation to Angad: launch on manual
   quotes while asking providers for written permission or official feeds. The
   alternatives are partner APIs, or scraping despite the terms (not recommended).
2. **The Supabase project isn't visible to the CLI.** Angad signed the CLI into the
   new account (orgs "RemitBridge App" and "RemitBridge System Labs"), but
   `supabase projects list` returns no projects. The migration hasn't been pushed yet.

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
| `DECISIONS.md` | Decisions made on top of the PRD (D1–D40) |
| `docs/PRD.md` | PRD v0.4, converted from the published artifact and kept as written |
| `docs/MANUAL_RESEARCH.md` | Wise and Remitly (terms forbid scraping); six providers not yet checked |
| `packages/formula/` | The total-cost formula in TypeScript (`src/`) and Python (`python/`), both pinned to `vectors.json`, which was generated from the website's TrueCost code |
| `engine/` | Python engine: adapter framework, polite client, FX cross-check, archive, publish gate, runner, `rb-engine` CLI, manual adapter. See `engine/README.md` |
| `supabase/migrations/20260928000000_init.sql` | The schema with RLS, the `latest_quotes` view, the raw-archive bucket, and the Tier 1 seed. Parses with Postgres's parser; **not yet run against a live database** |
| `mobile/` | Expo SDK 57 app: Compare and How it works screens, the website's tokens and font. Seen running in the iOS Simulator (iPhone 18 Pro) showing the "Not connected yet" state |
| `.github/workflows/` | `ci.yml` (engine lint and tests, formula tests, typecheck, expo lint); `scrape.yml` and `health.yml` with their schedules off until an adapter exists (D40) |
| `.claude/settings.json` | graphify hooks that check the knowledge graph before searches and reads |
| `.gitattributes` | graphify's merge driver for `graphify-out/graph.json` |
| `.git/hooks/post-commit`, `post-checkout` | graphify graph rebuilds (not tracked by git) |

The remote is `https://github.com/OnGodCR/RemitBridge-App.git`. The branch is
`main`, and it's pushed. The repo is **public** and should be made private (D21).

## What's next

1. **Supabase.** Once the CLI can see the project: `supabase link --project-ref <ref>`,
   then `supabase db push`, then test the RLS with curl (anon can read published
   quotes; anon can't read events, quarantined quotes or saved data; a user can't
   read another user's rows).
2. **Wire it up.** Put `EXPO_PUBLIC_SUPABASE_URL` and
   `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `mobile/.env.local`. Add the
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` GitHub Actions secrets (Angad adds
   them in GitHub settings; never through the chat).
3. **First real quotes.** Record a manual observation, push it, watch Scrape
   publish it, and see it on the Compare screen.
4. **Scraping, depending on Angad's decision:** check the six unread terms in a real
   browser; draft permission emails; build adapters only for cleared providers.
5. **Later slices:**
   - accounts (email code, Apple, Google), saved comparisons and transfers, in-app
     account deletion;
   - metrics events and the admin metrics screen (D31);
   - the rebuilt tools (TrueCost first, since it uses the shared formula);
   - route requests and the route board;
   - the WhatsApp bot;
   - the store-required pages on the subdomain;
   - engine hardening: AI extraction and repair, coverage matrix, email alerts;
   - an app icon.

### How to run things

- Engine: `cd engine && uv sync && uv run pytest -q` (see `engine/README.md`).
- Formula (TypeScript): `npm test -w @remitbridge/formula`.
- App: `cd mobile && npx expo start --lan`, then open `exp://<LAN IP>:8081` in Expo
  Go. On this Mac, `--localhost` didn't work: Metro bound to IPv6 `[::1]` only and
  the simulator couldn't reach it. The LAN IP (192.168.1.25 at the time) did.
- Disk: the Mac had about 4 GB free on 2026-09-28 (the npm cache was cleared, which
  brought it to 7.7 GB). Native iOS builds will need 15–20 GB free.

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
