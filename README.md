# RemitBridge

A free, non-commercial tool that shows what it really costs to send money home.
It compares banks, credit unions and money transfer providers by **how much
your family receives**. Total cost is split into the upfront fee and the
exchange-rate markup hidden inside the rate. There are no affiliate links, the
method is public, and RemitBridge never touches anyone's money.

Planned surfaces: a mobile app for the App Store and Play Store, a WhatsApp
bot, and research built from the collected price data.

## Status

**First build slice done.** It has the formula, the engine core, the schema, and the Compare
screen. See [`HANDOFF.md`](HANDOFF.md) for where things stand.

## Launch routes

The launch routes all send from the US to: India (INR), Mexico (MXN), the
Philippines (PHP), and Vietnam (VND). More follow in tiers (see
[`docs/PRD.md`](docs/PRD.md), section 6).

## Layout

```
engine/              Python scraping engine: adapters, publish gate, raw archive, rb-engine CLI
mobile/              Expo app (iOS and Android): Compare, How it works
packages/formula/    The one total-cost formula (TypeScript + Python), with shared test vectors
supabase/            Schema migrations, row-level security, Edge Functions (delete-account, process-prices)
.github/workflows/   CI, scheduled scrapes, manual price checks, health checks
docs/                PRD, manual-research list
```

## Setup

You need Node 22+ (npm workspaces) and [uv](https://docs.astral.sh/uv/) for Python.

```bash
npm install                          # formula + mobile
npm test -w @remitbridge/formula     # formula vectors (TypeScript)
cd engine && uv sync && uv run pytest -q   # engine + formula vectors (Python)
cd mobile && cp .env.example .env.local && npx expo start --lan
```

More detail is in [`engine/README.md`](engine/README.md) and [`mobile/README.md`](mobile/README.md).

## Docs

| File | Purpose |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Product requirements (v0.4) |
| [`DECISIONS.md`](DECISIONS.md) | Decisions made since the PRD; these win where they differ |
| [`HANDOFF.md`](HANDOFF.md) | Current state, what's next, open questions |
| [`CLAUDE.md`](CLAUDE.md) | Rules for working on this repo, and the open items |
| [`docs/MANUAL_RESEARCH.md`](docs/MANUAL_RESEARCH.md) | Providers blocked from scraping, left for manual research |
