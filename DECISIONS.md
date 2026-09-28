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

---

## 2026-09-28: second round

**D13. Scheduling on GitHub Actions is confirmed.** This makes D6 final.
There is no Redis queue: each scheduled run is one process, with per-domain
concurrency handled in memory. Circuit-breaker state, adapter health, and
response fingerprints live in Supabase, so each run picks up where the last
one stopped. Loose timing is accepted: GitHub may delay or skip scheduled runs,
and the "hourly" health check is really roughly hourly. The engine stays a plain
command-line tool, so a VM could run it later without changes.
*Supersedes:* PRD 9.2 (Redis and worker pool) and 9.13 (always-on worker).

**D14. There is no web app. The product is a mobile app published on the app
stores.** Angad's reason: app-store distribution gives the metrics he wants.
Every screen in PRD 14.7 becomes an app screen, and "Compare page" in the PRD
means the Compare screen. The server-rendering advice in PRD 14.10 doesn't apply;
its goal (fast answers on old phones and slow networks) still does.
*Supersedes:* the web parts of PRD 5.1, 5.4, 14.7, and 14.10. The partner web
widget (Phase B) is an open item.

**D15. The WhatsApp webhook runs on Supabase Edge Functions.**

**D16. The app uses Angad's existing domain.** Which domain it is, and what the
bot's "full list" link opens, are pending (see `HANDOFF.md`).

**D17. The website's tools are rebuilt for the app:** TrueCost, Fair rate,
Yearly cost, Rate history, and Scam check. They read live data where PRD 5.7
says they should.
*Touches:* PRD 5.7. It is still open whether the blog, papers, glossary,
workshops, and fellowships come into the app.

**D18. The app looks like the website.** Same brand green `#14705A`, Geist, and
the same semantic money colors. Claude may **read** the website repo, never
write to it, to copy the design tokens and the exact TrueCost formula.
*Touches:* PRD 14.4 and 14.5. The two repos still share no code (D1): tokens
and the formula are copied here and pinned by test cases.

**D19. Anyone can create an account (Supabase Auth)** to keep their history:
saved comparisons and past transfers they enter themselves. Comparing works
without an account.
*Supersedes:* PRD 5.6 and the privacy row of PRD 11 ("no personal financial
data"). Transfer amounts are now stored against signed-in users. The rules that
follow from that: storing anything is opt-in; every user table has row-level
security so only its owner can read it; deleting an account inside the app
deletes all of that user's data (Apple requires in-app account deletion); and
aggregate metrics never expose an individual user.

**D20. The new app gets its own new Supabase project**, separate from the
website's.

**D21. The repo should be private.** Angad left this to Claude. Reasons: the
adapters contain provider endpoints and terms-of-service notes that are better
left unpublished; the Tier 1 load (~1,000–1,500 Actions minutes a month) fits
the 2,000 free private minutes; and private repos don't have the 60-day
inactivity shutoff for scheduled workflows. The method is still public, on the
methodology screen. Opening the source later stays possible. **The repo was
public as of this entry; Angad flips it in GitHub settings.**

**D22. The contact email is remitbridgesystemlabs@gmail.com.** It goes in the
scraper's user agent and on the methodology screen.

**D23. Engine alerts (PRD 9.9) go to Angad by email.** They're for maintainers,
not users. The triggers are: two failures in a row, a circuit breaker tripping,
schema drift, a route falling below 5 providers, and a missed coverage target.

**D24. Claude pushes to `origin` after each commit without asking.**
Force-pushes and history rewrites still need an explicit yes.

**D25. Reply conventions match the website repo:** every reply starts with
"hi, angad" and ends with the open-items checklist.

---

## 2026-09-28: third round

**D26. Ship on both iOS and Android.**

**D27. The app is built with Expo (React Native, TypeScript).** Angad left this to
Claude. One codebase serves both stores. It's React, like the website, so the
website's look (D18) carries over. It also runs on a phone through Expo Go
before any developer account exists (see D32).

**D28. The web pages the app needs live on a subdomain of remitbridgelabs.org,
served from this repo** (e.g. `app.remitbridgelabs.org`). They are: the privacy
policy, the support page, the links from the bot that open the app or the
store, and the association files that let links open the app. The website repo
stays untouched. The exact subdomain is confirmed when it's set up.
*Resolves:* D16.

**D29. Sign-in methods: email code, Sign in with Apple, and Google.** All go
through Supabase Auth.

**D30. Users enter past transfers by hand.** No bank connections and no
receipt scanning for now. Revisiting that is an open item.

**D31. Metrics: track as much as honestly possible.** The app's purpose
includes supporting Angad's college applications, so broad measurement is a
goal in its own right. How:
- **First-party events in Supabase, with no third-party analytics SDK.** We own
  the raw data, so every figure can be reproduced and defended if someone
  asks, and the store privacy labels stay simple.
- **What gets tracked:**
  - Usage: installs, sessions, daily/weekly/monthly active users, retention
    (day 1, 7, 30), screen views, and the funnel from route picked to results
    seen to quote detail opened.
  - Activity: comparisons by channel (app or WhatsApp), routes and amounts
    (bucketed), use of each tool, sign-ups, saved transfers, route requests,
    and reports of wrong prices.
  - Impact: estimated savings, the engine's quotes collected, providers and
    routes covered, the engine's reliability and accuracy, and partner
    organizations reached.
- **Honesty rules, so the numbers survive scrutiny:**
  - Every metric has a written definition.
  - Savings are always best option vs. the median option (PRD 10).
  - Internal and test devices and accounts are excluded.
  - App and WhatsApp counts are never double-counted.
  - No number is shown without a way to reproduce it from the raw events.
- **Privacy limits:** installs are identified by a random anonymous ID. There
  is no cross-app tracking (so no App Tracking Transparency prompt), no device
  fingerprinting, and no location beyond the route the user picks. Everything
  is disclosed in the store privacy labels.
- An **admin-only metrics screen** shows these totals, and it can be exported.
*Supersedes:* the "basic analytics" of PRD 5.6 in scope, while keeping its
aggregate-only principle.

**D32. The Apple and Google developer accounts come later.** Angad enrolls when
store submission is near. Until then, development runs in simulators and in
Expo Go.

**D33. Glossary in the app; blog, papers, workshops and fellowships stay on the
website, linked from the app.** *Resolves:* the D17 open point.

**D34. Rate alerts come after launch, as push notifications** rather than
WhatsApp template messages, since push is free. *Touches:* PRD 7 Phase A and 5.8.
