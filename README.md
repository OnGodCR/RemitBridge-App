# RemitBridge

A free, non-commercial tool that shows what it really costs to send money home.
It compares banks, credit unions and money transfer providers by **how much
your family receives**. Total cost is split into the upfront fee and the
exchange-rate markup hidden inside the rate. There are no affiliate links, the
method is public, and RemitBridge never touches anyone's money.

Planned surfaces: a web comparison page, a WhatsApp bot, and research built
from the collected price data.

## Status

**Pre-build.** Only the planning docs exist so far. See [`HANDOFF.md`](HANDOFF.md) for
where things stand.

## Launch routes

The launch routes all send from the US to: India (INR), Mexico (MXN), the
Philippines (PHP), and Vietnam (VND). More follow in tiers (see
[`docs/PRD.md`](docs/PRD.md), section 6).

## Planned layout

This layout is a proposal and will change once the stack is confirmed.

```
engine/              Python scraping engine: adapters, normalizer, publish gate, raw archive
web/                 Web app: Compare, results, methodology, route board
bot/                 WhatsApp webhook (Meta Cloud API)
packages/formula/    The one total-cost formula, with shared test cases every language must pass
supabase/            Schema migrations and row-level security policies
.github/workflows/   Scheduled scrapes, health checks, CI
docs/                PRD, adapter guide, manual research list
```

## Setup

Setup commands will go here once there is code to run.

## Docs

| File | Purpose |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Product requirements (v0.4) |
| [`DECISIONS.md`](DECISIONS.md) | Decisions made since the PRD; these win where they differ |
| [`HANDOFF.md`](HANDOFF.md) | Current state, what's next, open questions |
| [`CLAUDE.md`](CLAUDE.md) | Rules for working on this repo, and the open items |
| [`docs/MANUAL_RESEARCH.md`](docs/MANUAL_RESEARCH.md) | Providers blocked from scraping, left for manual research |
