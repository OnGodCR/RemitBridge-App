# Handoff

This file shows where the project stands right now. Read it first when you
resume. Update it at the end of every working session.

**Last updated:** 2026-09-28

## Status: pre-build

No application code exists yet. **Angad said not to start building until he
gives the go-ahead.** That go-ahead is waiting on the third round of questions below.

## The shape of the product (as of D25)

- **Mobile app** on the app stores. No web app. Screens: Compare, Results, Quote
  detail, Route not covered, Route board, Methodology, and the rebuilt tools:
  TrueCost, Fair rate, Yearly cost, Rate history, and Scam check.
- **Optional accounts** (Supabase Auth) to save comparisons and past transfers.
  Comparing works without an account.
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
| `DECISIONS.md` | Decisions made on top of the PRD (D1–D25) |
| `docs/PRD.md` | PRD v0.4, converted from the published artifact and kept as written |
| `docs/MANUAL_RESEARCH.md` | Providers blocked from scraping, left for manual research (empty) |
| `.claude/settings.json` | graphify hooks that check the knowledge graph before searches and reads |
| `.gitattributes` | graphify's merge driver for `graphify-out/graph.json` |
| `.git/hooks/post-commit`, `post-checkout` | graphify graph rebuilds (not tracked by git) |

The remote is `https://github.com/OnGodCR/RemitBridge-App.git`. The branch is
`main`, and it's pushed. The repo is **public** and should be made private (D21).

## What's next

1. Angad answers the third round of questions below.
2. Record the answers in `DECISIONS.md`.
3. On his go-ahead, build a bare-minimum scaffold (D12):
   - A monorepo with an `engine/` (Python) folder, a `mobile/` folder, the
     shared formula with its test cases, `supabase/` migrations, and the
     scheduled workflows.
   - One adapter working end to end.
   - The Compare screen reading real quotes.

## Third round of questions (asked 2026-09-28, not yet answered)

1. **Platforms:** iOS only, or iOS and Android? *(Recommended: both, from one
   codebase.)*
2. **App framework:** Expo (React Native, TypeScript)? One codebase serves both
   stores, and it's React, like the website, so its look carries over.
   *(Recommended.)*
3. **Domain:** which domain is it (remitbridgelabs.org)? The app still needs
   a few web pages even without a web app:
   - a privacy policy URL and a support URL, which the App Store requires;
   - a target for the bot's "full list" link, so it opens the app if it's
     installed and the store listing if not;
   - a small file that lets links open the app.

   Where should those live: a subdomain served from this repo (e.g.
   `app.remitbridgelabs.org`), or pages added to the website? *(Recommended:
   the subdomain, so the website repo stays untouched.)*
4. **Sign-in methods:** email code, Sign in with Apple, Google? Apple requires
   Sign in with Apple whenever Google sign-in is offered. *(Recommended: all three.)*
5. **Past transfers:** users type them in themselves (e.g. from a TrueCost
   receipt check), with no bank connections and no receipt-photo scanning?
   *(Recommended for MVP.)*
6. **Metrics:** which numbers matter most? Recommended: downloads from App Store
   Connect and Play Console, plus our own events table in Supabase
   (comparisons, routes, savings found, sign-ups), and no third-party trackers.
   That keeps the store privacy label clean and fits the no-ads promise.
   Or do you want a product-analytics service such as PostHog?
7. **Developer accounts:** Apple Developer Program ($99/yr) and Google Play
   ($25 one-time) need enrolling, and only Angad can do that. Enroll as an
   individual or as an organization? An organization needs a legal entity and
   a D-U-N-S number, and its name shows as the seller. This ties into the
   PRD's open question about how RemitBridge is structured.
8. **Website content in the app:** should the blog, papers, glossary,
   workshops and fellowships come in? Recommended: the glossary in the app
   (it feeds the shared terminology), and the rest stays on the website,
   linked from the app.
9. **Rate alerts:** an app can send push notifications for free, which is cheaper
   than WhatsApp template messages. Keep rate alerts post-MVP as the PRD says, but
   plan for them as push notifications? *(Recommended.)*

## Known gaps between the PRD and the decisions

- PRD 14.1 puts the app inside the website. D1 and D14 replace that with a
  separate mobile app.
- PRD 5.6 and 11 say no personal financial data. D19 allows opt-in accounts
  with saved transfers, under RLS, with in-app deletion.
- PRD 9.2 and 9.13 assume Redis and an always-on worker. D13 uses GitHub Actions
  with state in Postgres.
- PRD 14.11 assumes a design-system package shared with the website. Under D18
  the tokens are copied here instead, since the repos share no code.
- PRD Phase B's partner web widget has no web app to live in (open item).
