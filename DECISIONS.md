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

---

## 2026-09-28: during the first build slice

**D35. Mid-market reference: Frankfurter, cross-checked against open.er-api.com.**
Both are free and keyless, and both are daily references, not live rates; the
methodology screen says so. Frankfurter is the reference because the website uses
it. On 2026-09-28 the two agreed within 0.12% on INR, MXN, PHP and VND. Coinbase
was tried and dropped: its MXN was 1.4% off both. A live keyed source (the
website uses Twelve Data) is an open option if daily references prove too coarse.
*Touches:* PRD 9.7 check 3 and 9.13.

**D36. Publish-gate defaults (the thresholds D10 asked for).** These live in
`engine/src/remitbridge_engine/config.py`. Change the code and this entry together.
- FX sources may disagree by up to **0.5%**; beyond that, the currency is held.
- Math tolerance: the larger of **0.2%** or **1 unit** of the receiving currency,
  because providers round.
- Markup range: **−0.5% to 15%**. The floor sits below zero because the reference
  is daily and the provider's rate is live; a bigger gap has to be a labelled promotion.
- A fee above **15%** of the amount sent is held.
- Tier consistency: markup may jump by at most **3 points** between neighboring grid amounts.
- Anomaly: total cost moving more than **2 points** from the provider's 7-day median
  is held.
- Circuit breaker: opens after **3** failed runs in a row, or at once on a block,
  with a **6-hour** cooldown.
- Manual quotes must be run within **6 hours** of being observed.
- Per domain: a delay of at least **3 s** between requests (more if robots.txt asks),
  a 20 s timeout, and 3 attempts for transient errors only.

**D37. Correction to D18: the website's typeface is Plus Jakarta Sans, not
Geist.** Plus Jakarta Sans is what the site's `index.html` loads and what its CSS
names; the Geist package in its `package.json` is unused. The app uses Plus
Jakarta Sans.

**D38. Wise and Remitly get no adapter (D4 applied).** Their terms forbid
automated access (see `docs/MANUAL_RESEARCH.md`). The other six couldn't be read with
a plain request. The engine ships with the manual adapter only, and the scraping
approach is waiting on Angad.

**D39. Manual quotes run when a file is added, not on the schedule.** A push to
`engine/manual/quotes/` triggers the Scrape workflow for the manual adapter.
Scheduled runs pass `--skip-manual`. Observations older than 6 hours are skipped
and reported, not failed.

**D40. Scheduled workflows stay off until the first scraping adapter exists.**
There's nothing for them to do yet, and each run spends private-repo Actions
minutes. The `schedule:` blocks are commented out in `scrape.yml` and `health.yml`.

---

## 2026-09-28: onboarding and the Compare controls

**D41. Onboarding leads with account creation, but "Skip for now" stays.** Angad
asked for onboarding where people create an account. It has three steps:
welcome, "Where do you send money?", then Apple / Google / email code. Skipping
remains possible because Apple rejects apps that force sign-up when the core
feature doesn't need an account (App Store guideline 5.1.1), and comparing
prices doesn't. The country picked in onboarding becomes Compare's default.
*Refines:* D19.

**D42. Email sign-in needs custom SMTP before launch.** On the free tier,
Supabase refuses email-template changes while using its built-in sender, and
that sender only mails the project's own team. So the 6-digit code email
(`supabase/templates/code.html`) can't go live until custom SMTP is set up.
Resend is the natural choice: the website already uses it. Until then, email
sign-in shows "isn't open yet". Apple and Google need their provider
credentials in the dashboard, and show "isn't set up yet" until then.

**D43. The amount is typed freely; prices are exact only at checked amounts.**
Angad asked for a typed amount and From/To dropdowns. The engine still checks
prices only at $100, $200, $500, $1,000 and $2,000 (PRD 9.11: each extra amount
multiplies request volume). For any other amount, the app takes each provider's
quote at the largest checked amount at or below it (the smallest one if the
amount is below the grid) and runs the same fee and rate through the shared
formula package, so it's the same arithmetic as the engine. Each card then says
"Estimated from the $500 check". Metrics record the checked amount, never the
exact figure typed. From lists the PRD 6.5 sending countries and To lists the
Tier 2 countries, all as "Soon" until they're live.
*Touches:* PRD 5.1 and 14.6 (route picker, amount input).

**D44. Visual direction: restrained, like the website.** Angad said the app looked
"vibecoded". The fixes:
- No emoji anywhere. Countries get a two-letter code mark instead of a flag.
- Modest corners (6/10/12) instead of pills. Pills are kept only for tiny status marks.
- A segmented control for delivery method instead of pill chips.
- Divided lists instead of floating tiles, and a thin step bar in onboarding.
- Calmer headline sizes and weights.
- The ranking tag is plain green text, not a pill badge.

Keep new UI in this register: hairlines, not shadows; text labels, not
decoration.

**D45. Provider search on Compare.** A search field matches provider names
(case- and accent-insensitive) against the public `providers` table. Picking one
narrows the results to that provider, and clearing it shows everyone again.
Searches are logged as `provider_searched` (D31). The "Most to your family" tag
is hidden when a single provider is shown, since there's nothing to rank.

**D46. Provider search removed; the country dropdowns get search instead.**
Supersedes D45. Angad clarified that "search for companies" meant search inside
the From and To country lists. Each country sheet now has a search field that
matches on name, two-letter code or currency ("mex", "MX" and "MXN" all find
Mexico). The provider search component is deleted; it's in git history
(`acac6e0`) if it's ever wanted.

**D47. Color, in the website's own vocabulary.** Refines D44 after Angad found the
restrained pass "too basic". The colors used:
- **Brand green (#14705A) as a full-width header band** on every tab, running under
  a light status bar. On Compare it holds the countries and amount in white fields.
- **A green onboarding welcome.**
- **The selected delivery segment filled green.**
- **Country code marks in mint and green.**
- **"What this does not tell you" as a mint panel.**
- **A 4pt green left edge on the top-ranked quote** (the website's "rule" mark).
- **Mint icon tiles on How it works.**

Dark mode has its own deeper band (#0E4A3C). Still no emoji and no pills (D44).

---

## 2026-09-28: Angad's answers on partners, structure, and prices

**D48. Partners get a plain link, not an embed or a QR code.** A shareable link on
the app's subdomain (D28) opens the app if it's installed, and otherwise sends
people to the App Store or the website. It replaces PRD Phase B's embeddable
widget and QR code.

**D49. Structure: a personal project that runs like a nonprofit, not
registered.** Angad is the seller of record in the app stores and the name on the
data license. Nothing in the app, the store listings or the docs may call
RemitBridge a nonprofit, charity or 501(c)(3). It may say "free" and
"non-commercial". *Answers:* PRD 13 open question 4.

**D50. No partner organizations yet.** Outreach to Seattle-area organizations
(especially for the special-handling corridors, PRD 6.4) is an open item.
*Answers:* PRD 13 open question 2 (none yet).

**D51. Angad reviews and merges every adapter repair.** Claude drafts fixes
(PRD 9.6), and nothing merges without him. *Answers:* PRD 13 open question 5.

**D52. Prices: entered by hand, plus asking for permission.** On 2026-09-28 all
eight Tier 1 providers were checked on their live terms. Seven forbid automated
access outright. Western Union's US terms don't mention it, but its other
terms do and its site blocks automated requests. So under D4 no provider gets a
scraper for now. Prices come from people reading providers' public calculators
and entering them. Meanwhile Angad emails every provider asking for written
permission or an official feed (`docs/outreach/permission-request.md`). A
provider moves to automated collection only with permission in writing, recorded
here and in its adapter's `terms_note`.
*Supersedes:* the scraping parts of D3 and D38 for now. *Touches:* PRD 9 (the
engine's gate, archive and runner are unchanged; only where quotes come from changes).
