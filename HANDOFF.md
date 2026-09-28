# Handoff

This file shows where the project stands right now. Read it first when you
resume. Update it at the end of every working session.

**Last updated:** 2026-09-28

## Status: pre-build

No application code exists yet. Every question is answered (D1–D34).
**Building starts only when Angad gives the go-ahead.**

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
- **Look:** same as the website (brand green `#14705A`, Geist, the semantic money colors).
- **Maintainer alerts:** email to Angad.

## What exists

| Path | What it is |
|---|---|
| `CLAUDE.md` | How to work on this repo: reply conventions, rules, voice, stack, secrets, git, open items, graphify |
| `HANDOFF.md` | This file |
| `README.md` | What the project is, with the planned layout (setup commands come later) |
| `DECISIONS.md` | Decisions made on top of the PRD (D1–D34) |
| `docs/PRD.md` | PRD v0.4, converted from the published artifact and kept as written |
| `docs/MANUAL_RESEARCH.md` | Providers blocked from scraping, left for manual research (empty) |
| `.claude/settings.json` | graphify hooks that check the knowledge graph before searches and reads |
| `.gitattributes` | graphify's merge driver for `graphify-out/graph.json` |
| `.git/hooks/post-commit`, `post-checkout` | graphify graph rebuilds (not tracked by git) |

The remote is `https://github.com/OnGodCR/RemitBridge-App.git`. The branch is
`main`, and it's pushed. The repo is **public** and should be made private (D21).

## What's next: the first build slice (on go-ahead)

The goal is a bare-minimum scaffold where one real quote flows from a provider
site to a phone screen:

1. **Repo skeleton:** `engine/` (Python 3.12 with uv), `mobile/` (Expo),
   `packages/formula/` (the total-cost formula in TypeScript and Python, plus
   shared test cases), `supabase/` (migrations and RLS), and
   `.github/workflows/`.
2. **Formula first.** Copy the TrueCost method from the website repo (read-only)
   and write the shared test cases before anything uses it.
3. **Supabase schema:** the PRD section 8 tables, the engine's state tables
   (D13), and the events table (D31), all with RLS written first.
4. **Engine core:** the adapter base class, **one** Tier 1 adapter end to
   end, the normalizer, the publish gate, and the raw archive, run by a
   scheduled workflow.
5. **Mobile:** a Compare screen that reads published quotes, in the website's
   look.

Later slices: the other 7 adapters, the rest of the screens and tools, accounts,
metrics, the WhatsApp bot, the store-required pages, and engine hardening.

### What Angad will need to do (Claude can't)

- **Create the new Supabase project** in his Supabase account. Then run
  `supabase login` in a terminal so Claude can link and push migrations. Keys go
  in through `supabase secrets set` and GitHub Actions secrets, never the chat.
- **Make the repo private** (D21).
- **Later:** create the Meta WhatsApp Business account, the Google and Apple
  sign-in credentials, DNS for the subdomain, and the developer accounts (D32).

### Local toolchain (checked 2026-09-28)

Installed: Xcode, Homebrew, Node 25, Python 3.12 (Homebrew), and the Supabase
CLI. Missing: `uv`, which Claude installs via Homebrew at build start. The
system `python3` is 3.9; don't use it for the engine.

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
