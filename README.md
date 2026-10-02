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
manual entry until a provider allows automated checks. A receipt scanner for the 2026
Congressional App Challenge is being built in phases (D72): the data model, redaction,
parser harness, model fallback, validation and the scan screen are in. The app speaks
English, with drafts in Hindi, Spanish, Tagalog and Vietnamese waiting on reviewers (D69). See [`HANDOFF.md`](HANDOFF.md)
for where things stand and what's next.

## Launch routes

The launch routes all send from the US to: India (INR), Mexico (MXN), the
Philippines (PHP), and Vietnam (VND). More follow in tiers (see
[`docs/PRD.md`](docs/PRD.md), section 6).

## Layout

```
engine/              Python scraping engine: adapters, publish gate, raw archive, rb-engine CLI
mobile/              Expo app (iOS and Android): Scan, Compare, Tools, Learn, Account
mobile/src/i18n/     Every string the app shows: English source, drafts in Hindi, Spanish,
                     Tagalog and Vietnamese, and the reviewer gate that keeps drafts out of releases.
                     `npx tsx scripts/review-sheet.ts hi` rebuilds docs/translation-review/hi.md from them
mobile/scripts/      port-blog.mjs ports the website's blog (posts, figures, covers) into the app
.github/scripts/     send-rate-alerts.mjs: the rate alert sender, run by the Rate alerts workflow
packages/formula/    The one total-cost formula (TypeScript + Python), with shared test vectors
packages/bot/        The WhatsApp bot's logic (parser, replies in English and Hindi, receipt photo replies),
                     tested with vitest
packages/receipt/    The receipt pipeline: redaction, the rule-based parser (extract/: the 13 field
                     extractors and their reading helpers), provider templates, the model fallback, validation; fixtures and harness;
                     the synthetic receipt generator, the benchmark scripts, and the WhatsApp photo worker
benchmark/           Receipt reading accuracy: real and synthetic receipts with ground truth, results.md
supabase/            Migrations, row-level security, Edge Functions (delete-account, process-prices,
                     notify-route-launch, whatsapp, scan-receipt)
.github/workflows/   CI, scheduled scrapes, manual price checks, health checks, the WhatsApp photo worker
site/                app.remitbridgelabs.org: privacy policy, support, partner links (Vercel, root "site")
docs/                PRD, manual-research list, store/listing.md (what to paste into both stores)
research/            world-bank-rpw/: the World Bank's US remittance price survey (Q2 2016 to Q1 2025)
                     as CSV, its summary, and extract.py to rebuild both from the downloaded workbook
```

## Setup

You need Node 22+ (npm workspaces) and [uv](https://docs.astral.sh/uv/) for Python.

```bash
npm install                          # formula, bot and mobile
npm test -w @remitbridge/formula     # formula vectors (TypeScript)
npm test -w @remitbridge/bot         # WhatsApp bot, including its webhook against a fake database
npm test -w @remitbridge/receipt     # receipt pipeline, including the scan-receipt function against fakes
npm run parser:report -w @remitbridge/receipt   # how the rule-based parser scores on the fixtures
npm test -w @remitbridge/mobile      # the app's screens and helpers (jest-expo)
npm run typecheck                    # every workspace, and the scan-receipt Edge Function
cd engine && uv sync && uv run pytest -q   # engine + formula vectors (Python)
cd mobile && cp .env.example .env.local && npx expo start --lan
```

Receipt scanning needs a development build, because its OCR module isn't in Expo Go (D73).
Builds run on EAS, in the cloud: `cd mobile && npx eas-cli@latest init` once, set
`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as EAS environment
variables for the `development` environment, then
`npx eas-cli@latest build --profile development --platform ios`.

Migrations can be tested on a throwaway Postgres before they're pushed:
`supabase/tests/local_migrations.sh` (set `PG_BIN` to your Postgres `bin` folder).

Database changes: `supabase db push`, then the RLS smoke test
(`SUPABASE_URL=... SUPABASE_PUBLISHABLE_KEY=... supabase/tests/rls_smoke.sh`). Edge Functions
deploy with `supabase functions deploy <name> --use-api`; their secrets are listed at the
top of each function and are set with `supabase secrets set`, never committed. `scan-receipt`
reads `GROQ_API_KEY` (without it, receipts are read by the rules alone), and optionally
`RECEIPT_MODEL` and `RECEIPT_MODEL_MONTHLY_CAP` (D98).

To set or rotate the Groq key without it ever showing on screen or in shell history: paste
this command into a terminal without pressing Enter, copy the key from Groq's "Create API
Key" pop-up (the list only shows a masked version), then press Enter. It checks the key with
Groq, saves it to Supabase and GitHub Actions only if Groq answers 200, and empties the
clipboard.

```sh
GQ_KEY="$(pbpaste | tr -d '[:space:]')"; code=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $GQ_KEY" https://api.groq.com/openai/v1/models); echo "Groq says: $code (key starts ${GQ_KEY:0:4}, ${#GQ_KEY} characters)"; if [ "$code" = 200 ]; then supabase secrets set GROQ_API_KEY="$GQ_KEY" && printf %s "$GQ_KEY" | gh secret set GROQ_API_KEY; fi; unset GQ_KEY; pbcopy </dev/null
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
| [`docs/cac-gap-report.md`](docs/cac-gap-report.md) | Congressional App Challenge features: what exists, what's missing, decisions needed |
| [`docs/AI_USAGE.md`](docs/AI_USAGE.md) | Per-session log of files Claude created or changed, for the CAC's AI-use disclosure |
