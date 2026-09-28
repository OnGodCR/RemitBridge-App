# RemitBridge App

A free, non-commercial tool that compares what it really costs to send money
from the US. It ranks providers by **amount received** and splits the total cost
into the upfront fee and the exchange-rate markup. The core is a scraping engine
that collects provider quotes. On top of it sit a web app, a WhatsApp bot, and
research built from the collected data.

This repo holds the whole app. It is **separate from the remitbridgelabs.org
website** (`RemitBridge-System-Labs---Website`). The two share an owner and some
ideas, but not code, deploys, or a database. Do not import from, edit, or
deploy the website repo from here.

The rest of the documentation:

- [`docs/PRD.md`](docs/PRD.md): what the product should be (PRD v0.4, kept as written).
- [`DECISIONS.md`](DECISIONS.md): what has been decided since. Where it disagrees with the PRD, it wins.
- [`HANDOFF.md`](HANDOFF.md): where things stand right now and what comes next.
- [`README.md`](README.md): what the project is, and how to set it up and run it.
- [`docs/MANUAL_RESEARCH.md`](docs/MANUAL_RESEARCH.md): providers that get no adapter, left for Angad to research.

## Keeping the docs current

These files are the project's memory between sessions. Update them as part of
the work, not afterwards:

- **HANDOFF.md:** at the end of every working session, and after any change that
  alters what exists, how to run it, or what comes next.
- **DECISIONS.md:** whenever Angad makes a decision, or a default is picked on his
  behalf. Record it with the date, the decision, and why.
- **Open items (below):** add each deferred item when it comes up, and tick it
  with a date when it lands.
- **README.md:** whenever setup, commands, environment variables, or layout change.
- **docs/MANUAL_RESEARCH.md:** whenever a provider gets no adapter because
  its terms or robots.txt forbid automated access.

## Open items

These are deferred on purpose, not forgotten. Update this list as things land.

- [ ] **More languages.** English only for now. The UI strings live in files
      so Hindi (first), then Spanish, Tagalog, Vietnamese and others can be
      added without code changes. Hindi also needs a matched Devanagari font
      (PRD 14.5).
- [ ] **Follow-up questions from 2026-09-28** are unanswered. See `HANDOFF.md`.
      No build work starts until Angad says go.
- [ ] **Scheduling on GitHub Actions** was Angad's suggestion. It needs
      his confirmation now that the tradeoffs are laid out (`HANDOFF.md`).
- [ ] **PRD open questions** not answered yet: which Seattle-area partners
      can validate the special-handling corridors, how RemitBridge is
      structured legally, and who reviews adapter repairs.
- [ ] **Providers needing manual research.** None so far. See
      `docs/MANUAL_RESEARCH.md`.
- [x] graphify installed: CLAUDE.md rules, search hooks, and post-commit and
      post-checkout rebuild hooks. The graph builds once code exists. Done 2026-09-28.
- [x] PRD v0.4 read end to end. The first round of decisions is recorded in
      `DECISIONS.md`. Done 2026-09-28.

## Product rules that are also code rules

Everything below comes from the PRD. Breaking one of these rules is a bug, not
a style choice.

- **Never publish a number we can't verify.** A missing quote is better than a
  wrong one. A quote reaches users only after it passes the publish gate
  (PRD 9.7). Anything that fails is quarantined, not dropped silently.
- **Rank by amount received.** Never rank by fee, never use affiliate links,
  and never let a provider pay for placement.
- **Use one total-cost formula everywhere.** Use the TrueCost method: take the
  fee off first, apply the markup to the converted amount, convert pickup charges
  at the mid-market rate, and add the three. It lives in one canonical place,
  plus shared test cases that every language's copy must pass. No two surfaces
  may ever disagree about the same transfer.
- **Never move money.** No "send" button, and no holding or touching funds.
  RemitBridge gives information only.
- **Privacy:** no personal financial data. On WhatsApp, store only a hashed phone
  number (for rate limits and preferences). Delete the contact details from a
  route request once its launch notification has gone out.
- **Scraper conduct** is a reliability rule (PRD 9.12):
  - Public pricing only: no logins, account creation, CAPTCHA bypassing, or rotating proxies.
  - Per-domain concurrency of 1, with a delay between requests and jitter on the schedule.
  - An honest user agent that includes a contact email.
  - Users never trigger scraping. They read from the database.
  - A 403 or 429 is never retried. It goes to the blocked path and pauses the adapter.
- **If a provider's terms or robots.txt forbid automated access, don't build an
  adapter.** Record the provider in `docs/MANUAL_RESEARCH.md` for Angad to research.
- **Keep every raw response.** Every published number must trace back to an
  archived raw response.

## Words and voice

- American English. English is the only language for now (see Open items).
- Use the terminology table in PRD 14.4: *mid-market rate*, *exchange-rate
  markup*, *total cost*, *amount received*, *provider*. Say *route* in the UI and
  *corridor* in docs and research.
- Plain words and short sentences. No hype: never "Best deal!". The top result
  is "Most to your family", not "Best".
- Every figure names its source and when it was checked. Every tool gets a
  "What this does not tell you" section.

## Stack

- Supabase for Postgres, storage (the raw archive), and auth. **No Clerk.**
- Use whichever language fits each part. The engine is Python (per the PRD);
  other parts may differ. Every part must use the same total-cost formula.
- WhatsApp: Meta Cloud API directly, not Twilio.

## Secrets

- Never commit `.env` files or keys. Check `.gitignore` before adding
  anything that holds a secret.
- Never ask Angad to paste an API key into the chat. Keys go straight into the
  platform (`supabase secrets set`, GitHub Actions secrets, host env).
- The Supabase service-role key never goes into a browser bundle.
- Row-level security is what protects the data, not the UI. Write the policy
  before the feature, and test it with curl.

## Git

- Commit straight to `main`.
- Commit messages explain **why**, in prose, including what was tried and failed.
  Never claim a change the diff doesn't contain.
- Force-pushes and history rewrites need an explicit yes.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
