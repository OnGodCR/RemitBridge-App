# Handoff

This file shows where the project stands right now. Read it first when you
resume. Update it at the end of every working session.

**Last updated:** 2026-09-28

## Status: pre-build

No application code exists yet. **Angad said not to start building until he
gives the go-ahead.** That go-ahead is waiting on the follow-up questions below.

## What exists

| Path | What it is |
|---|---|
| `CLAUDE.md` | How to work on this repo: rules, voice, secrets, git, open items, graphify |
| `HANDOFF.md` | This file |
| `README.md` | What the project is, with the planned layout (setup commands come later) |
| `DECISIONS.md` | Decisions made on top of the PRD (D1–D12 so far) |
| `docs/PRD.md` | PRD v0.4, converted from the published artifact and kept as written |
| `docs/MANUAL_RESEARCH.md` | Providers blocked from scraping, left for manual research (empty) |
| `.claude/settings.json` | graphify hooks that check the knowledge graph before searches and reads |
| `.gitattributes` | graphify's merge driver for `graphify-out/graph.json` |
| `.git/hooks/post-commit`, `post-checkout` | graphify graph rebuilds (not tracked by git) |

The remote is `https://github.com/OnGodCR/RemitBridge-App.git` and the branch is `main`.

## What's next

1. Angad answers the follow-up questions below.
2. Record the answers in `DECISIONS.md`.
3. On his go-ahead, build a bare-minimum scaffold (D12). The natural first slice
   is the engine core: the adapter base class, one adapter end to end, the
   normalizer, the shared formula with its test cases, the publish gate,
   the raw archive, the Supabase schema, and a scheduled workflow.

## Proposal: scheduling on GitHub Actions (D6, awaiting confirmation)

Angad asked whether GitHub scheduled workflows can replace the always-on worker
in PRD 9.13. **They can for the MVP**, with these changes to the PRD
architecture:

- **No Redis queue.** Each scheduled run is one process. It works through the
  providers concurrently in memory, one request at a time per domain.
- **State lives in Supabase, not memory.** Circuit-breaker state, adapter
  health, and response fingerprints go in Postgres, so each run picks up
  where the last one stopped.
- **Workflows:** a scrape every 6 hours (digital providers), a daily run (banks
  and credit unions, later), and an hourly health check.

Tradeoffs to accept:

- **Timing is loose.** GitHub may delay scheduled runs during busy periods, and
  can occasionally drop them. That's fine for 6-hourly scraping. The hourly
  health check becomes "roughly hourly", which still meets the PRD's target of
  detecting a broken adapter within 2 hours most of the time.
- **Minutes.** Public repos run free. Private repos get 2,000 free minutes a
  month; the Tier 1 load is roughly 1,000–1,500 minutes a month.
- **Inactivity.** In a public repo, GitHub disables scheduled workflows after
  60 days without repo activity.
- **Datacenter IPs.** GitHub's runners use cloud IP ranges, which some bot
  protection treats with suspicion. Any cloud host has this problem, so it
  isn't specific to GitHub Actions.
- **The WhatsApp webhook can't run on Actions.** It needs an always-on HTTPS
  endpoint, so it needs its own host (question 3).

Moving to a VM later stays cheap: the engine will be a plain command-line tool
that the workflow calls, so any server could run the same command.

## Follow-up questions (asked 2026-09-28, not yet answered)

1. **Scheduling:** confirm GitHub Actions with the changes above? *(Recommended: yes.)*
2. **Web app stack and host:** Next.js (TypeScript) on Vercel? It
   server-renders results, which suits slow phones (PRD 14.10). *(Recommended.)*
3. **WhatsApp webhook host:** a Supabase Edge Function, which keeps it
   inside Supabase? *(Recommended.)*
4. **Domain:** where will the app live? The PRD's examples use
   `remitbridgelabs.org/compare`, which is the website. A Vercel URL works
   until this is decided.
5. **Existing tools (PRD 5.7):** now that the app is separate, should it
   rebuild TrueCost, Fair rate, Yearly cost, Rate history and Scam check, or
   launch with Compare only and list the others as open items?
6. **Look and formula source:** should the app match the website's brand
   (green `#14705A`, Geist), or have its own? May Claude read the website
   repo's TrueCost code (read-only) so the formula matches it exactly?
7. **Who signs in?** Recommended: admins only (health dashboard, coverage
   matrix, quarantine review). Senders never sign in.
8. **Supabase project:** a new one for the app, or share the website's?
   *(Recommended: new.)*
9. **Repo visibility:** public or private? This affects Actions minutes and how
   transparent the scraper is.
10. **Contact email** for the scraper's user agent and the methodology page:
    should it be the lab's address, remitbridgesystemlabs@gmail.com?
11. **Alerts:** Discord or email?
12. **Pushing:** push to `origin` after each commit without asking?
13. **Reply conventions:** the website repo starts each reply with "hi, angad"
    and ends with the open-items checklist. Does Angad want the same here?

## Known gaps between the PRD and the decisions

- PRD 14.1 puts the app inside the website. D1 says it's separate (question 4).
- PRD 5.7 migrates the website's tools into the app. Scope is pending (question 5).
- PRD 9.2 and 9.13 assume Redis and an always-on worker. D6 proposes GitHub Actions.
- PRD 14.5 and 14.11 assume a design system shared with the website (question 6).
