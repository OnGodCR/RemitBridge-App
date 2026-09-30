# RemitBridge

A free, non-commercial tool that shows what it really costs to send money home.
It compares banks, credit unions and money transfer providers by **how much
your family receives**. Total cost is split into the upfront fee and the
exchange-rate markup hidden inside the rate. There are no affiliate links, the
method is public, and RemitBridge never touches anyone's money.

Surfaces: a mobile app for the App Store and Play Store, a WhatsApp bot, and
research built from the collected price data.

## Status

**Every MVP screen is built, and the WhatsApp bot is ready for Meta.** Prices come from
manual entry until a provider allows automated checks. See [`HANDOFF.md`](HANDOFF.md) for
where things stand and what's next.

## Launch routes

The launch routes all send from the US to: India (INR), Mexico (MXN), the
Philippines (PHP), and Vietnam (VND). More follow in tiers (see
[`docs/PRD.md`](docs/PRD.md), section 6).

## Layout

```
engine/              Python scraping engine: adapters, publish gate, raw archive, rb-engine CLI
mobile/              Expo app (iOS and Android): Compare, Tools, Learn, Account
packages/formula/    The one total-cost formula (TypeScript + Python), with shared test vectors
packages/bot/        The WhatsApp bot's logic (parser, replies in English and Hindi), tested with vitest
supabase/            Migrations, row-level security, Edge Functions (delete-account, process-prices,
                     notify-route-launch, whatsapp)
.github/workflows/   CI, scheduled scrapes, manual price checks, health checks
site/                app.remitbridgelabs.org: privacy policy, support, partner links (Vercel, root "site")
docs/                PRD, manual-research list
```

## Setup

You need Node 22+ (npm workspaces) and [uv](https://docs.astral.sh/uv/) for Python.

```bash
npm install                          # formula, bot and mobile
npm test -w @remitbridge/formula     # formula vectors (TypeScript)
npm test -w @remitbridge/bot         # WhatsApp bot, including its webhook against a fake database
cd engine && uv sync && uv run pytest -q   # engine + formula vectors (Python)
cd mobile && cp .env.example .env.local && npx expo start --lan
```

Database changes: `supabase db push`, then the RLS smoke test
(`SUPABASE_URL=... SUPABASE_PUBLISHABLE_KEY=... supabase/tests/rls_smoke.sh`). Edge Functions
deploy with `supabase functions deploy <name> --use-api`; their secrets are listed at the
top of each function and are set with `supabase secrets set`, never committed.

More detail is in [`engine/README.md`](engine/README.md) and [`mobile/README.md`](mobile/README.md).

## Docs

| File | Purpose |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Product requirements (v0.4) |
| [`DECISIONS.md`](DECISIONS.md) | Decisions made since the PRD; these win where they differ |
| [`HANDOFF.md`](HANDOFF.md) | Current state, what's next, open questions |
| [`CLAUDE.md`](CLAUDE.md) | Rules for working on this repo, and the open items |
| [`docs/MANUAL_RESEARCH.md`](docs/MANUAL_RESEARCH.md) | Providers blocked from scraping, left for manual research |
| [`docs/cac-gap-report.md`](docs/cac-gap-report.md) | Congressional App Challenge features: what exists, what's missing, decisions needed |
| [`docs/AI_USAGE.md`](docs/AI_USAGE.md) | Per-session log of files Claude created or changed, for the CAC's AI-use disclosure |
