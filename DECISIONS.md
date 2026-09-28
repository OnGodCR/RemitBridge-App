# Decisions

This file logs what has been decided on top of [`docs/PRD.md`](docs/PRD.md).
Newest entries go at the bottom. Where an entry disagrees with the PRD, the entry
wins. Never delete an entry; if a decision changes, add a new one that
supersedes it and say which one.

Each entry gives the date, the decision, why it was made, and which PRD section
it touches.

---

## 2026-09-28: first round, after reading PRD v0.4

**D1. This repo holds the entire app, separate from the website.**
remitbridgelabs.org is a different project in a different repo. The two may have
similar tools, but they share no code or deploys.
*Touches:* PRD 14.1 (the PRD recommends putting the app inside the site at
`/compare`) and 5.7 (which moves the site's tools into the app). How much of
5.7 still applies is an open question; see `HANDOFF.md`.

**D2. Use whichever language fits each part.**
The scraping engine is Python, as the PRD says. Other parts don't have to be.
The hard requirement is that every part computes total cost with the same,
correct formula. That is enforced by a shared set of test cases that every
implementation must pass.
*Touches:* PRD 9.13 and 14.4 (formula consistency).

**D3. Tier 1 adapters:** Remitly, Wise, Xoom, Western Union, MoneyGram, Xe,
WorldRemit, and Ria.
*Touches:* PRD 6.6 and 12 (Phase 1's "8 adapters covering Tier 1").

**D4. Providers whose terms or robots.txt forbid automated access get no
adapter.** Their names go into `docs/MANUAL_RESEARCH.md` and Angad researches
them by hand.
*Touches:* PRD 9.12.

**D5. Supabase for database, storage, and auth. No Clerk.**
*Touches:* PRD 9.13.

**D6. Scheduling: GitHub Actions scheduled workflows (proposed, not
final).** Angad asked whether GitHub scheduled workflows can replace the
always-on worker in PRD 9.13. The tradeoffs are in `HANDOFF.md`; this becomes
final once he confirms.
*Touches:* PRD 9.2 (Redis queue) and 9.13 (scheduling).

**D7. WhatsApp: Meta Cloud API directly**, because it is cheaper than Twilio.
*Touches:* PRD 5.8, and answers PRD 13 open question 3.

**D8. American English** across the app, bot, and every written surface.
*Touches:* PRD 14.3 rule 8, and part of PRD 13 open question 1.

**D9. English only at launch.** UI strings stay in string files so languages
can be added later without code changes. Hindi is an open item in `CLAUDE.md`.
*Touches:* PRD 5.5, 5.7 (the Hindi version of every tool), and 14.5 (the
Devanagari font).

**D10. Claude sets the default validation thresholds.** This covers the anomaly
threshold, the tolerance for disagreement between FX sources, the rounding
tolerance, and similar values. Each default gets recorded here when it's set,
with its reasoning, so it can be tuned later.
*Touches:* PRD 9.7.

**D11. Commit straight to `main`.**

**D12. Build order: start with a bare-minimum scaffold, then refine.** Claude
picks the natural starting point.
*Touches:* PRD 12.
