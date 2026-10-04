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
"non-commercial". *Answers:* PRD 13 open question 4. *Replaced by D141 (2026-10-02).*

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

**D53. Email sign-in goes through Resend on remitbridgelabs.org.** Connected
2026-09-28 with Resend's Supabase integration, so the API key went from Resend
into Supabase without passing through anyone's hands. The sender is
`RemitBridge <RemitBridge@remitbridgelabs.org>`, and the DNS records (DKIM,
plus SPF and MX on `send`) are in GoDaddy. The code template and sender name were
set through the Management API, not `supabase config push`: with the password
absent locally, a push could blank the SMTP settings. *Closes:* D42's blocker.

**D54. Prices entered in the app go through the engine's gate, not around it.**
The admin-only "Add a price" screen (Account tab, admins only) saves one quote per entry to
`manual_observations`, under RLS: admins insert as themselves and read all rows,
nobody else sees anything, and only the engine changes a row. The engine's manual adapter
takes pending rows alongside the JSON files, runs them through the same normaliser, gate and
archive, and writes each outcome (published, quarantined, rejected, or skipped as too old)
back to the row, where the screen shows it. The app checks only the arithmetic before saving,
with the shared formula and the engine's tolerance, to catch typos early; it never decides
what is shown. A new "Manual prices" workflow runs the check. The `process-prices` Edge
Function starts it right after an entry when `GITHUB_DISPATCH_TOKEN` (a fine-grained token,
this repo only, Actions read and write) is set in Supabase; otherwise a three-hourly
schedule catches it, inside the six-hour freshness limit. Chosen over re-implementing the
gate in TypeScript, which would have created a second gate that could drift from the first.
*Touches:* D52, PRD 9.4 strategy 5, PRD 9.7.

**D55. Flags are back, as bundled images.** Angad found the two-letter code badges didn't
say clearly enough which country was which. Flags return as small flat PNGs bundled in the
app (`mobile/assets/flags`, 1x/2x/3x, 240 KB total), not emoji: emoji flags don't render on
Windows or some Android builds and look different everywhere else. The images are flagcdn.com's
flat flags (public domain), downloaded once, so the app makes no third-party request for them.
Each keeps its real proportions at a fixed height, in a fixed-width column so names line up.
*Revises:* D44's "text labels over decoration" for countries only.

**D56. The app icon is the website's bridge mark.** Same look as the website (D18): the
white arch-and-pier mark from remitbridgelabs.org's favicon, on brand green #14705A. iOS
uses the layered `.icon` format with the mark as a vector layer; Android gets an adaptive
icon sized inside the launcher's safe zone plus a monochrome version for themed icons; the
splash shows the mark on green. `mobile/scripts/make-icons.py` regenerates the PNGs.

**D57. The app's web pages are a static site in `site/`, deployed as its own Vercel
project at app.remitbridgelabs.org.** The website is already on Vercel, so this adds one
more project from this repo (root directory `site`) rather than a new host. Pages: home,
privacy policy, support, and the partner link `/p/<partner>` (D48). The partner page
records a `partner_link_opened` event (D31, platform `web`, a random ID kept in the
browser) and offers "Open the app" with the partner passed along, plus "Learn more". It
doesn't auto-redirect: that is flaky across browsers, and a clear button is honest.
Universal links (the association files) wait for the Apple developer account (D32),
which provides the team ID they need. The privacy policy describes exactly what
`track()` and the schema store, including that signed-in events carry the account ID
until the account is deleted. *Resolves:* D28's hosting question. *Touches:* D48.

**D58. The website's tools move into the app, under four tabs.** Compare · Tools · Learn ·
Account. *Tools* groups them by when you'd use them: before sending (Fair rate, Scam
check), after (TrueCost, Yearly cost), and Rates (Rate history). *Learn* absorbs the old
"How it works" tab and adds the Glossary (all 80 terms, ported with American spelling and
"markup" for "margin") and RemitBench (the research design, results not yet claimed);
the blog, papers and workshops open on the website (D33). *Account* gains "Your checks":
TrueCost receipts saved to `saved_transfers`, costs recomputed from the saved inputs with
the one formula rather than stored. Each tool is a screen pushed on the root stack, so it
gets a native back button (nested stacks gave their first screen none) and a plain URL
(/fair-rate, /true-cost...; folders named tools/ and learn/ collided with the tabs of the
same name). Mid-market rates for the tools come straight from Frankfurter v2 (31
currencies, any date, date ranges); no user data goes over the wire. The chart and the
slider are plain views, so no new native dependency was added, with disk space short.
Every figure names its source (World Bank RPW Q3 2025 global average 6.36%, UN SDG 10.c
target 3%). *Ports:* the website's /truecost, /fair-rate, /reckoner, /rate-history,
/scam-check, /glossary, /remitbench.

**D59. The landing page is a scroll story, after hidewire.org.** At Angad's request,
app.remitbridgelabs.org opens on a dark hero, then a pinned phone that walks through five
steps (Fair rate, TrueCost, Rate history, Scam check, the app), swapping to the matching
real screenshot and shifting the glow color at each, with the step text alternating
sides and progress bars below. Plain CSS (sticky positioning) and a few lines of script;
no library. It reads top to bottom without script, turns motion off under
prefers-reduced-motion, and on phones stacks the text under the phone. Screenshots are
from the simulator with Expo Go's floating dev button painted out; they get replaced with
development-build captures before launch.

**D60. Sign in with Apple is native only, and needs no secret.** The app uses Apple's own
sheet (expo-apple-authentication) and hands the identity token to Supabase
(signInWithIdToken). Supabase trusts two audiences: `org.remitbridgelabs.app` (the app)
and `host.exp.Exponent` (Expo Go, for testing now). Expo Go is removed from the list
before launch. No Services ID or signing key is needed, since there's no web or Android
Apple sign-in; the button only shows on iOS devices that support it. The App ID's "Sign in
with Apple" capability gets switched on by EAS at the first build (`usesAppleSignIn` is
already in app.json). Enabled 2026-09-29, the day Angad's Apple Developer account came
through (D32).

**D61. Google sign-in uses a web OAuth client in the RemitBridge Google account.** The
client "RemitBridge via Supabase" (web application) lives in the Google Cloud project
"Remittances Benchmarking", owned by remitbridgesystemlabs@gmail.com (which needed
2-Step Verification turned on first: Google Cloud enforces it since September 2, 2026).
Its only redirect URI is Supabase's `/auth/v1/callback`. The consent screen is named
"RemitBridge", links the home page and privacy policy, authorizes remitbridgelabs.org and
the Supabase domain, has no logo (a logo forces Google's review), asks only for basic
scopes, and is published to production. Angad pasted the ID and secret into Supabase
himself; the "Enable" switch had stayed off and was turned on through the Management API.
Checked: Supabase's authorize endpoint answers 302 to accounts.google.com, and the app opens
Google's sign-in page. Until Google verifies the brand, that page says "continue to
gmzljjdnwndvqciqicbx.supabase.co" rather than "RemitBridge"; brand verification (proving
remitbridgelabs.org in Search Console) fixes that for free.

**D62. Onboarding and sign-in use the website's own elements, not template ones.** Angad
called the first redesign vibe-coded. It had a glow blob, a shadowed "illustrative" card in
grey and amber, and icon-bullet promises. Rebuilt from the website's components instead: its
page ground (the bridge mark tiled at 6%, with a mint light) and green band, rendered by
`mobile/scripts/make-onboarding-art.py` from Backdrop.jsx; the outlined LogoMark; the
two-tone DisplayTitle; uppercase eyebrows; divided-index lists instead of card grids; the
green left-rule callout; its sourced figures ($905B, 6.36%, 3%) on a new "Why it matters"
step; its 0.55s, 12pt "rise" entrance; and fully rounded bold buttons, app-wide. Sign-in
buttons carry the providers' own marks (Apple's official button, Google's "G" per its
guidelines, an envelope for email). Onboarding is now four steps.

**D63. Lists everywhere are the website's divided index.** The Tools, Learn and Account
lists were grouped cards with an icon on a mint tile in every row: the settings-screen
template. They now follow the website's home-page index: hairline rules above and between,
a bold title, one plain line, the green arrow (up-right for pages that open on the website),
and the group's name as an uppercase eyebrow. No icons and no card. Decided 2026-09-29 under
Angad's "follow the anti-vibe coding practices" (D62).

**D64. Route requests and the route board (PRD 6.7).** Every country in the pickers can now
be chosen. A pair we don't check shows "Not covered yet", how many people have asked, and a
request form: how the money should arrive (optional) and an email to hear back at
(optional, never pre-filled, since storing it is opt-in). Requests go in `route_requests`,
which nobody but admins can read. The public route board shows every route with its
status (live, being built, under review, requested, not feasible) and a count per route
from `route_request_counts()`, which returns aggregates only and counts each account or
install once, leaving out internal installs. The same install can't ask for a route twice
(a unique index). An address is deleted when the launch email goes out (a check makes
keeping both impossible), or at once if the route is marked not feasible (a trigger).
Tier 3 and the special-handling countries (PRD 6.3, 6.4) joined the To list, so people can
ask for them; nine of them have no bundled flag yet and show a plain tile. Sending the
launch emails is not built yet: it has to exist before any requested route goes live.

**D65. The admin metrics screen reads one database function.** `admin_metrics(p_days)`
refuses anyone who isn't an admin (42501) and computes every figure on the screen, so each
is reproducible from raw rows and defined once; the app shows each definition under its
number, and Export shares them as CSV. Internal installs are those in `internal_installs`
plus every install ever signed in to an admin account. Savings are worked out in the
database from published quotes, never trusted from the app: per install, route, amount and
day compared, the most minus the median amount received among 3+ standing prices, in
dollars at the mid-market rate. Sessions come from a new `app_opened` event (launch, or a
return after 30 minutes away); `comparison_run` now also records how many prices came
back, for the "saw prices" step of the funnel.

**D66. Saved comparisons and the quote detail.** Signed-in people can save a comparison
(route, amount, delivery method) from Compare; Account lists them, a tap reopens Compare
on them with today's prices, and pressing and holding deletes one. Signed out, Save
explains what an account is for and offers sign-in. Tapping a quote opens its detail (PRD
14.7 screen 3): the breakdown bar, every figure in the total, delivery and payment,
promotions, source and check time, the provider's last 30 days of published prices for
the same route and amount, a link to Fair rate with the quote filled in (PRD 5.7), and
"This price looks wrong", which opens an email with the quote's details filled in.

**D67. Launch emails for route requests go through Resend's API, started by an admin.**
The `notify-route-launch` Edge Function sends the one email promised when someone asked
to hear about a route (D64), then deletes their address in the same update that marks
them notified. It refuses anyone who isn't an admin, and refuses a route that isn't
`live`, so nobody hears about a launch that hasn't happened. Admins start it from the
route board, which shows how many people each live route owes an email. Mail comes from
RemitBridge@remitbridgelabs.org, the sender auth mail already uses (D53), with replies
to the Gmail address. It needs a `RESEND_API_KEY` Supabase secret, which Angad sets;
until then it sends nothing and says so.

**D68. The WhatsApp bot is built; it waits on Meta.** Meta's Cloud API directly, as the
stack says. The logic (reading messy messages, deciding what to do, every reply in
English and Hindi) is `packages/bot`, with no Deno or network code, so it's tested with
vitest; the webhook is `supabase/functions/whatsapp`, which checks Meta's signature on
every delivery, looks up prices and sends the reply. It uses the app's own country, route
and number-formatting files and the one formula, and reads prices with the public key, so
RLS decides what it can show exactly as it does for the app. Commands per PRD 5.8: an
amount and a country in almost any form, UPI/cash/bank/wallet filters, WHY, HINDI and
ENGLISH, HELP, plus REQUEST, SCAM, CHECK and STOP. A route we don't cover gets "Reply YES
and we'll count your request", which files a route request with source `whatsapp` and no
contact (launch messages on WhatsApp need approved templates, so they're post-MVP).
What's kept per number, in `whatsapp_users`: an HMAC of the number with a secret, the
language, the last route and method, a route waiting for YES, and a rate-limit counter
(30 messages an hour). Never the number, a name or an amount; STOP deletes the row. That
resolves a tension in PRD 5.8 between "the user's last quote as the example" for WHY and
"no amounts tied to identities": WHY uses the $500 example on the person's last route.
The Hindi is Claude's and needs Angad's read before launch. To go live Angad needs a Meta
business account and app, a WhatsApp number, a system-user token, five secrets (listed at
the top of the function), the migrations pushed, the function deployed, and the webhook
registered in Meta.

## 2026-09-30: accessibility and languages

Angad asked for UI and UX that works for as many people as possible, and for the features
already discussed. These are the defaults Claude picked on his behalf; each can be changed.

**D69. Five languages, and a translation ships only once a named speaker stands behind
it.** PRD 5.5. Every word the app shows or reads aloud lives in `mobile/src/i18n/en.ts`,
and each language is a full copy of it (`es.ts`, `hi.ts`, `tl.ts`, `vi.ts`), checked by
the type system. The website's rule carries over and is enforced in code: a language is
offered in a release build only when `i18n/languages.ts` names its reviewer and the date
they agreed in writing. Until then it's a draft: it shows only in development builds,
marked Draft, so the reviewer can read it in the app. Today all four are Claude's drafts
with no reviewer, so a release build offers English alone and shows no language button.
- The language is the one picked in the app, else the phone's own if the app offers it,
  else English. Onboarding's first screen has a globe button; Account has a Language
  section and, in any language but English, a "wrong translation? tell us" link.
- Register, picked for Angad: Latin American Spanish with "tú", worded to avoid gendered
  adjectives about the reader; Hindi with आप and the money words people use (फ़ीस,
  मिड-मार्केट रेट); Filipino in the "mo/ka" register of Filipino money apps, keeping
  English where people say it (fee, bank, e-wallet, rate); Vietnamese with "bạn".
- Hindi uses Hind, a Devanagari face drawn to sit with Latin text (PRD 14.5), with
  taller lines and no negative letter spacing. Every piece of text declares its language,
  so VoiceOver reads it in the right voice.
- Money keeps US formatting ($1,234.56) in every language, to match provider sites and
  the bot; dates use the language's own format.
- Stays English: the admin screens and metrics, RemitBench's research write-up (which
  says so in the reader's language), and glossary definitions until translated. The
  English term shows under a translated one, since that's the word on receipts.
- To publish a language: a fluent speaker reads it in a development build, agrees in
  writing, and their name and the date go in `languages.ts`. Hindi first (PRD order).

**D70. The accessibility bar.** Checked in the simulator, not just written:
- Contrast: every text color passes WCAG AA (4.5:1) on the backgrounds it sits on, light
  and dark. Amber stays for bars and dots; text uses a darker amber token.
- Text size: the app works at the largest iOS accessibility size. Reading text scales in
  full; big figures and titles scale less (2x under 20pt, 1.6x from 20pt, 1.4x from 28pt)
  so they don't break mid-word. From 135% text, side-by-side fields and choices stack
  instead of truncating. Checked in English, Hindi and Vietnamese.
- Touch: 44pt minimum targets, and no action that needs press-and-hold (saved items
  have a visible delete button).
- Screen readers: headings are marked, outcomes are announced (saved, deleted, asked,
  errors), the rate chart is adjustable (swipe up and down to hear each day), and iOS
  Bold Text thickens the bundled font too.
- Slow or no connection: Compare keeps the last prices it loaded for 48 hours and shows
  them under "You're offline" with when they were loaded, rather than an error.
- Nothing fails silently: a mail link on a phone with no mail app shows the address to
  write to instead of doing nothing.

---

*Numbering note:* the Congressional App Challenge decisions below were first written as
D69–D87 on the branch `claude/gallant-hopper-51zhhm`, in parallel with D69–D70 on `main`.
When `main` was merged into the branch (2026-09-30), they were renumbered to D72–D90
(D71 was left to the other session), and every reference in code and docs was updated.

## 2026-09-30: the Congressional App Challenge build

**D72. Receipt scanning is in scope, for the 2026 Congressional App Challenge (internal
deadline 2026-10-23).** Angad asked for a receipt scanner (on-device OCR and redaction, a
rule-based parser, an LLM fallback for missing or low-confidence fields, validation with the
one formula, a confirmation screen), a scan result screen (true cost, advertised vs. paid,
the 1% federal remittance tax check, "next time" into Compare), a funding-method input in
TrueCost and Compare, a disclosure check, WhatsApp photo intake, receipt tables, a receipt
observatory, and an accuracy benchmark. It's built in phases, and each one stops for his
review. Rules that come with it: only the listed features; the one formula everywhere, never
a second version; new strings in English and Hindi; no names, addresses, phone numbers or
account numbers stored or logged; tests for everything; a running log in `docs/AI_USAGE.md`
for the CAC's AI-use disclosure. **Angad writes the parser's field-extraction heuristics
himself.** Claude builds only the interface, types, provider templates, test harness and
fixture loading, and leaves the heuristics as marked TODO stubs. The gap report
(`docs/cac-gap-report.md`) lists the decisions this needs before Phase 2.
*Supersedes:* D30's "no receipt scanning for now" (bank connections stay out).

**D73–D87: Angad's answers to the gap report (2026-09-30).** He said "go ahead with your
recommendations" to all fifteen decisions in `docs/cac-gap-report.md`. Where a
recommendation left a number open, Claude picked a default under D10, noted below.

**D73. OCR runs on the phone.** It uses Google ML Kit text recognition, through
`@infinitered/react-native-mlkit-text-recognition` (an Expo module, so it runs natively on
React Native's New Architecture; `@react-native-ml-kit/text-recognition` was tried first
and dropped because it only works through the old bridge's compatibility layer). It returns
each word with its box. The
redaction is drawn with `@shopify/react-native-skia`, and photos come from `expo-image-picker`.
ML Kit isn't in Expo Go, so scanning needs a development build, made with EAS in the cloud
(local native builds need disk space this Mac doesn't have). In Expo Go the scan screen says
so and does nothing else. *Answers:* gap report 1.

**D74. Redaction uses solid boxes, not blur, and hides too much rather than too little.** It
hides any line labeled as a sender, recipient or address; phone numbers; emails; card numbers
(Luhn); account, routing, CLABE, IFSC and UPI details; confirmation and tracking numbers; and
any run of seven or more digits that isn't formatted as money. The preview lets the person
tap any word to hide it or show it again. The text that leaves the phone has every hidden
word replaced, and the server runs the same detection again as a second line of defense.
*Answers:* 2.

**D75. Superseded by D69.** The CAC branch first had its own English/Hindi string
catalogue, a language setting on Account and Noto Sans Devanagari. When `main` was merged
on 2026-09-30, those were dropped for the app-wide system in D69: the receipt scanner's
strings now live in `mobile/src/i18n/en.ts` like every other screen's, with drafts in
Hindi, Spanish, Tagalog and Vietnamese under D69's reviewer rule, and Hindi uses Hind.
*Answers:* gap report 3.

**D76. The 1% remittance tax is part of the one formula.** `computeTransferCost` and its
Python twin take an optional `transferTax` (T, sending currency). It comes off before
conversion, like the fee, because S is everything the sender paid, and total cost is
F + T + markup + pickup. With T = 0, nothing changes. `remittanceTax()` and the list of taxed
funding methods live in the same package, so the rule exists once. The tax test cases are in
`vectors.tax.json`: they're derived by hand, because the website has no tax, and both
languages must pass them. *Answers:* 4.

**D77. What each receipt field means.** `amount_sent` is the transfer amount as printed,
before the fee and the tax. `total_paid` (new, optional) is the printed total. The formula's
S is amount_sent + fee + tax. Validation checks that received ≈ amount_sent × rate − pickup,
and that total_paid ≈ amount_sent + fee + tax when a total is printed. Both checks use the
engine's tolerance: the larger of 0.2% or one unit of the currency (D36), and 2 cents for the
total. `delivery_method` is also a new optional field, for matching prices (D82). *Answers:*
5, and part of 10.

**D78. Default tax base, unverified.** *Checked against the proposed regulations by D97.* 1% of the transfer amount (the fee and the tax
itself excluded), rounded half up to the cent. It applies to transfers on or after
2026-01-01 funded by cash, money order or cashier's check. Bank accounts and cards are
exempt. This matches the "$500, $5 tax" examples in public guides, but the IRS proposed
regulations (Federal Register 2026-07085) couldn't be read from Claude's sandbox. So the tax
check says it's an assumption until the base is checked. *Answers:* 6.

**D79. The model fallback runs only on the server, on Claude.** *Model and API superseded by
D92 (Qwen through OpenRouter); the scope, schema and cap rules stand.* The `scan-receipt` Edge
Function calls the Anthropic API with the official SDK. The key is the `ANTHROPIC_API_KEY`
Supabase secret, which Angad sets. Details:
- **Model:** `claude-opus-5-5` at `low` effort by default; `RECEIPT_MODEL` overrides it.
- **Output:** a strict JSON schema (structured outputs), checked again by our own validator.
- **Refusals:** server-side refusal fallbacks are on (`fallbacks: "default"`).
- **Scope:** it's asked only for fields the parser missed or read with confidence below
  **0.8**. It gets the redacted image and the redacted text, never the original.
- **Spend cap:** **300 model calls per calendar month** (`RECEIPT_MODEL_MONTHLY_CAP`),
  counted in the database. Past the cap, the person types the missing values.

At roughly 2–5 cents a call, the cap keeps it under about $15 a month. *Answers:* 7.

**D80. WhatsApp receipt photos are read by a GitHub Actions worker** (Phase 5). The webhook
acknowledges the photo, and a workflow downloads it from Meta, runs OCR and redaction, then
the same pipeline, and replies 1–3 minutes later. No new host. *Answers:* 8.

**D81. Receipts are anonymous and short-lived.**
- **No person attached:** receipts carry no user ID and no install ID. `channel` is `app` or
  `whatsapp`.
- **Reading a result:** anyone holding a receipt's unguessable ID can read its result
  through `receipt_result()`. Nobody can read the tables directly.
- **30 days:** 30 days after submission, a receipt's fields and comparison are deleted unless
  the person gave research consent.
- **Images:** the redacted image is never stored unless the person gave research consent;
  then it goes to the private `receipt-images` bucket.
- **Full result page:** it will live on the site at `/r/<id>` (a link page under D28).
- **Your checks:** saving a result there makes a separate, owner-only copy (D19).

*Answers:* 9.

**D82. How a receipt is matched to an advertised price** (built in Phase 3). The match is:
- same provider and route;
- the checked amount from `checkedAmountFor`;
- the same payment method, and the same delivery method, when the receipt shows them;
- the published quote captured nearest the transfer date, within ±24 hours.

The gap comes from the formula: markup cost at the receipt's rate minus markup cost at the
advertised rate, on the same converted amount, in the sending currency. When nothing matches,
the section says so. *Answers:* 10.

**D83. Funding methods are `bank_account`, `debit_card`, `credit_card`, `cash`,
`money_order` and `cashiers_check`.** They're the existing payment-method names plus two. Compare gets a funding input
that filters prices to that method (which also stops a provider showing twice), and a
cash-type method adds the tax through the formula. *Answers:* 11.

**D84. The app gets a test runner: `jest-expo` with `@testing-library/react-native`.** Logic
lives in plain TypeScript packages tested with vitest. *Answers:* 12.

**D85. Benchmark images of real receipts stay out of git** unless they've been through the
redactor and Angad has checked them. Their ground-truth JSON is committed. Synthetic
receipts are rendered from HTML with Playwright and read with tesseract.js in Node. That's a
different OCR from the phone's, so benchmark accuracy is a proxy. The model-only mode runs on
demand, never in CI. *Answers:* 13.

**D86. Who writes what.** Angad writes the field-extraction heuristics: the `TODO(angad)`
functions in `packages/receipt/src/extract/`. Claude writes everything around them,
including PII detection, validation and the disclosure check. *Answers:* 14.

**D87. The CAC work stays on the branch `claude/gallant-hopper-51zhhm` until Angad merges
it.** It's an exception to D11 and D24 for this work only. *Answers:* 15.

## 2026-09-30: Phase 3 defaults

Angad said "continue working" after Phase 2, so Phase 3 went ahead on the recommendations
already agreed (D73–D87). These are the defaults Claude picked on his behalf (D10):

**D88. Confirming a receipt.** Every value on the "to check" list must be answered before
the result is shown. Those are the likeliest misread value, anything required that's
missing, and anything below 0.8 confidence. The answer can be a correction, the suggested
value, or "This is right". Each answer is stored as `user_corrected`. Anyone with the
receipt's ID can confirm it, as they can read or delete it (D81). The server checks every
value again, looks up the day's mid-market rate, and stores the comparison and tax check
in `receipt_comparisons`.

**D89. Matching the advertised price, in detail** (refines D82). Only published standing
prices count; first-transfer promotions are one-time offers, not the advertised price. The
window is the transfer day plus 24 hours either side, measured from its midday UTC. When
the receipt shows a payment or delivery method, that method must match exactly, so a
money-order receipt has no match until money-order prices exist. The gap uses the day's
mid-market rate when it loads, otherwise the quote's own.

**D90. Funding method in TrueCost and Compare.** Both default to a bank account.
- **Tax:** for cash, money order and cashier's check, the 1% tax is added on top of what was
  paid, on the transfer amount (what's sent less the fee). It comes off before conversion,
  so it raises total cost and leaves the amount received, and the ranking, alone.
- **Compare** shows only prices checked for the chosen payment method. If there are none,
  it says so rather than showing another method's prices. This also ends the double listing
  of a provider with two payment methods.
- **A saved TrueCost check** folds the tax into the fee, since `saved_transfers` has no tax
  column and the formula treats the two identically.
- **The engine's payment methods** gain `money_order` and `cashiers_check`. A test pins
  them to the formula's funding list.

## 2026-09-30: the first automated prices

**D91. Wise's own prices come from its Comparison API, with Wise's written permission.**
Wise's website terms forbid automated access without prior written permission, so Wise
was manual (D52). Angad's permission request asked whether the Comparison API was open to
a small free project; on 2026-09-30 Simon Bruins of Wise answered that the current
documentation "is correct and you can use it. If you are a considerate user it shouldn't
be a problem." Angad then asked Claude to "just do everything", which included this.
- **What's used:** `GET https://api.wise.com/v4/comparisons/` for each route and amount,
  and from each answer only Wise's own quote (alias `wise`). The other providers in the
  answer are Wise's estimates of its competitors, not prices those providers published, so
  they are never stored in `quotes`, shown or used to rank (the raw response is archived
  whole, as every response is). wise.com's pages are never fetched.
- **What a quote means:** a bank transfer paid from a bank account, delivered to a bank
  account. Wise's comparison data covers only that; card pay-in costs more and needs
  another source. Source is `api`; the checked time is the `dateCollected` Wise gives,
  which is the moment of the request, and a quote priced more than 6 hours earlier is
  refused.
- **Considerate:** one request at a time, 5 seconds apart, 20 a run (4 routes × 5 amounts),
  4 runs a day on the Scrape schedule (every 6 hours at :17), with the honest user agent.
  The engine's rules still apply: no retry on 403 or 429, the circuit breaker, every
  response archived, the publish gate.
- **Drift check:** fingerprints only the envelope and Wise's own quotes. The whole response
  changes shape with whichever competitors Wise lists, which would hold every run.
- **A live rate beats a daily reference.** Frankfurter's mid-market rate is a daily fix
  while Wise's rate is live, so Wise's markup often comes out slightly below zero (−0.1% to
  −0.3% on the first run) and its total cost a little under its fee. That's the formula
  working, not an error. The quote detail now shows the markup with its sign, so the rows
  add up, and says the reference is a daily rate; the cost bar splits the amount sent
  exactly.
- **Not done:** Wise also documents an unauthenticated quote endpoint that prices each
  pay-in method. The permission was for the Comparison API, so that endpoint isn't used.
  The docs say future API versions will need authentication; when that lands, the adapter
  needs a Wise API token, which Angad would create.

## 2026-09-30: The receipt model

**D92. Receipts are read by Qwen3 VL 32B through OpenRouter, not Claude** (replaces D79's
model and API). Angad chose cost first, and asked for a cheaper Chinese model through
OpenRouter.
- **Model:** `qwen/qwen3-vl-32b-instruct` (Alibaba's Qwen3 VL 32B Instruct). It reads photos,
  supports a strict JSON schema, and lists at about $0.10 per million input tokens and $0.42
  per million output tokens. A receipt (photo, text and answer) is about 2,000–3,000 tokens,
  so roughly a tenth of a cent, against 2–5 cents on Claude. OpenRouter's site is blocked from
  Claude's sandbox, so these figures come from search results, not the live model list;
  check them on openrouter.ai before relying on them. Qwen3.7 Flash is cheaper still; the
  Phase 4 benchmark will show whether it reads well enough.
- **Why Qwen VL:** of the cheap Chinese models, DeepSeek's are text only, and the fallback
  sends the redacted photo as well as the text. Qwen's VL line is the established vision one.
- **API:** OpenRouter's chat completions endpoint over plain `fetch`, so no SDK. The key is
  the `OPENROUTER_API_KEY` Supabase secret, which Angad sets. `RECEIPT_MODEL` overrides the
  model and `RECEIPT_MODEL_FALLBACKS` (comma-separated) lists models to try if it fails; none
  by default.
- **Privacy:** every request asks OpenRouter for providers that don't store or train on what
  they're sent (`data_collection: "deny"`) and that honor every parameter, so the schema is
  enforced (`require_parameters: true`). Only the redacted photo and text are ever sent, as
  before. If no provider of a model meets both, OpenRouter refuses the request, and the
  person types the values; the fix is another model, not relaxing either rule.
- **Spend cap:** raised from 300 to **2,000 calls a month**, which is about $2 at the listed
  price.
- **Unchanged:** the strict schema, our own check of every value, the 0.8 threshold, and
  that only the scan-receipt Edge Function calls the model.

## 2026-09-30: Phase 4 defaults

**D93. How the benchmark is built** (details under D85; defaults Claude picked under D10).
- **Synthetic set:** 60 receipts, seeds 1–60, committed as JSON with tesseract.js's OCR of
  each. They cover all eight Tier 1 providers, all six funding methods, and five receiving
  currencies (MXN, INR, PHP, VND, GTQ). Numbers come from the one formula, so a correct
  reading passes every receipt check. Wording is Regulation E's labels and common variants,
  not any provider's real wording.
- **Scores:** accuracy (of the values shown, the share read right) and precision (of the
  values read, the share right), per field and overall, for each mode; plus the share read by
  the rules, the share of wrong values the checks flagged for the person, the model's
  failures, and redaction leaks.
- **Model modes** run only by hand, with `OPENROUTER_API_KEY` in the shell. They're never in
  CI. CI runs parser mode on the committed set.
- **Real receipts** go in `benchmark/receipts/`. Their JSON names personal details (so the
  redaction check has something to check), so it stays out of git unless every detail has been
  swapped for a made-up one. Photos stay out unless redacted and checked (D85).
- **Redaction fixes the generator found:** a heading ending in an ID word ("Transfer
  confirmation") hid the year on the next line; and a masked card that OCR read as `**+*4118`
  wasn't hidden. Both are fixed and tested.

## 2026-09-30: Phase 5, receipt photos on WhatsApp

**D94. How a WhatsApp receipt photo is read** (builds on D80; defaults Claude picked under
D10, with one privacy exception that needs Angad's yes before it's switched on).
- **Flow:** the whatsapp function queues the photo in `receipt_intake` and replies "got it".
  A GitHub Actions worker (`receipt-intake.yml`) downloads the photo from Meta, reads it with
  tesseract.js, hides personal details with the phone's redaction code, and sends only the
  redacted text through `scan-receipt` as channel `whatsapp`. It then reports back, and the
  whatsapp function sends the reply.
- **No photo leaves the worker.** WhatsApp receipts are read from the redacted text alone,
  with no image to the model. The photo is held in memory and never written to disk or
  stored. There's no research-consent question on WhatsApp, so no WhatsApp receipt is kept
  past 30 days.
- **The exception: the number is sealed for minutes.** The reply has to reach the person
  after the worker finishes, so the queue row holds the number encrypted (AES-GCM, with a key
  derived from `WHATSAPP_HASH_SECRET` that only the whatsapp function has). The worker never
  sees it. The row is deleted when the reply goes out, and every row is deleted after an hour
  regardless. This bends the rule "on WhatsApp, store only a hashed phone number", so photo
  intake stays off (`WHATSAPP_RECEIPTS`) until Angad agrees. **Angad agreed on 2026-10-01**,
  and CLAUDE.md's privacy rule now names the exception. It still needs the WhatsApp go-live
  and the secrets below before it runs.
- **Checking values:** the bot asks about unsure values one at a time (at most four), each
  answer confirmed through `scan-receipt`, and then sends the result. It names any values that
  weren't confirmed. While it's asking, `whatsapp_users` holds the receipt's ID and the field
  being asked. That's cleared when the checking ends, or when the person sends a new photo or
  an ordinary message instead.
- **Starting the worker:** a workflow dispatch per photo (`GITHUB_DISPATCH_TOKEN`), with no
  schedule. Rows expire in an hour, and a schedule often enough to matter would use most of
  the private repo's Actions minutes. Intake also needs `RECEIPT_INTAKE_SECRET`, shared by the
  two functions and the worker.
- **Language:** replies in the bot's language (English or Hindi). The Hindi needs the same
  read as the rest of the bot's (D68).
- **Limits:** photos up to 10 MB (JPEG, PNG or WebP). A photo with under four lines of text,
  or no digits at all, gets "couldn't read a receipt". OCR is tesseract's, not ML Kit's, so
  WhatsApp reads less well than the app. The benchmark's synthetic set measures that OCR.

## 2026-09-30: Phase 6, the disclosure check and the observatory

**D95. The disclosure check** (defaults Claude picked under D10).
- **Items:** the receipt items in Regulation E (12 CFR 1005.31(b)(2)): transfer amount, fees,
  taxes (only for a cash-type transfer), total, exchange rate, amount received, date
  available, recipient, error-resolution rights, cancellation, the provider's contact
  details, and the CFPB's.
- **How:** the amounts count as found when a value was read for them. The rest count as found
  when their usual words appear in the redacted text. The recipient's name is hidden, but its
  label stays.
- **When:** it's worked out once, at scan time, from what the parser and the model read. A
  value the person typed in wasn't on the receipt, so it doesn't count as found. It's stored
  in `receipts.disclosures_missing`.
- **Wording:** the only claim is "not found on this receipt", always with the note that a
  photo can cut part of it off. It never says a provider broke a rule. On the synthetic set
  it's right on every item. Those receipts use the wording the check looks for, which the
  benchmark says.

**D96. The receipt observatory.**
- **Which receipts:** only research-consented receipts that went through the result (a
  `receipt_comparisons` row), through one database function, `receipt_observatory()`, that
  anyone can read.
- **What it shows:** per provider and route, the median total cost and exchange-rate markup,
  and how many got a worse rate than advertised. Overall, the tax totals and how often each
  disclosure wasn't found.
- **Privacy:** no group smaller than **five** receipts is shown, and no breakdown at all
  while there are fewer than five receipts in all. The start date is given to the month only.
- **The screen:** Learn → "What people paid", labeled "Early results", with the sample size
  first. The method line says "typical" means the median. There's a "What this does not tell
  you" block: people who share receipts aren't a random sample.
- **Stored for it:** `receipt_comparisons` gains `total_cost_pct` and `markup_pct`, from
  the one formula at the day's mid-market rate, written when a receipt is confirmed.

## 2026-10-01: The remittance tax, checked

**D97. The tax follows the IRS proposed regulations** (REG-114499-25, Federal Register
2026-07085, April 13, 2026; proposed 26 CFR 49.4475-1). Claude checked these from search
summaries; the Federal Register itself is blocked from its sandbox.
- **Fees aren't taxed.** The taxed amount is what will reach the recipient. "Service fees,
  State taxes, and charges for other goods and services that are not ultimately transferred
  to the designated recipient" aren't part of it. That's D78's assumption, so the base
  doesn't change.
- **Small transfers aren't taxed.** Transfers of $15.00 or less are left out
  (`REMITTANCE_TAX_SMALL` in the formula, both languages, with test cases at $15.00 and
  $15.01). The receipt tax check says so in plain words.
- **Not final.** The rules apply from the quarter after they're published as final, and as
  of this check they weren't. The app's note now says we follow the proposed rules, which
  aren't final yet.

## 2026-09-30: The receipt model, again

**D98. Receipts are read by Qwen3.8 27B on Groq's free tier, not Qwen3 VL 32B on
OpenRouter** (replaces D92's model and API; its scope, schema and cap rules stand). Angad
asked for something free, since OpenRouter needs prepaid credit, and created the Groq key
the same day.
- **Why the switch was needed anyway:** on 2026-09-30 OpenRouter listed
  `qwen/qwen3-vl-32b-instruct` as going away on 2026-10-09, served by one provider (Alibaba
  Cloud, Singapore and China; no prompt training, retention "unknown").
- **Model:** `qwen/qwen3.8-27b`, Groq's only model that reads images and one of three it
  holds to a strict JSON schema (`strict: true`, with our `anyOf`-null fields). Thinking is
  off (`reasoning_effort: "none"`, `reasoning_format: "hidden"`, which Groq requires with a
  schema), and `max_tokens` is 1,500, since Groq counts what's asked for against the
  per-minute limit. `RECEIPT_MODEL` still overrides it.
- **Free tier, from Groq's docs:** 30 requests a minute, 1,000 a day, 8,000 tokens a
  minute, 200,000 a day for this model. A receipt is about 3,000 tokens (an image counts as
  2,048), so about 60 receipts a day and 2 a minute. Past that, Groq answers 429 and the
  rules read alone; the person types what's missing, as when the monthly cap is reached.
- **Privacy:** Groq keeps no inference data by default, except logs for up to 30 days when
  investigating errors or abuse; Zero Data Retention (Data Controls) removes that exception.
  Its docs don't say "no training" in so many words; third-party summaries say training is
  excluded by contract. The privacy policy says what Groq says.
- **Fallback models are gone** (`RECEIPT_MODEL_FALLBACKS`): Groq has no field for them, and
  no second model there reads images.
- **Other free options looked at:** OpenRouter's `:free` models (most endpoints may train
  on or publish prompts, which our privacy setting excludes; 50 a day); Gemini's free tier
  (prompts may be used to improve Google's products); Cloudflare Workers AI (schema mode only
  on text models, not guaranteed); GitHub Models (prototyping only).
- **Benchmark:** the workflow takes a `model` input and the `GROQ_API_KEY` secret, and the
  script waits out 429s instead of counting them as failures.

## 2026-10-01: Order of the go-live

**D99. Set up every feature first, test after, and pay Apple last.** Angad asked to finish
setting up all the features before exact testing, and to have everything else done before
paying the Apple Developer Program fee ($99 a year). The fee gates only the iPhone
development build, universal links (the Team ID), Sign in with Apple in a real build,
TestFlight and the App Store; Resend, WhatsApp (Meta's test number), the GitHub token, the
extractors, the reviews and Expo Go are free. The membership year starts at payment, so
waiting costs nothing. CLAUDE.md's open items are grouped to match: features to set up,
testing, the CAC submission, thank-yous and outreach, before launch, watching and later.

## 2026-10-01: WhatsApp parked, and the app's look

**D100. WhatsApp is parked.** Meta restricted the new WhatsApp Business Account at once
(error 131031; "Account Restricted, Duration: Permanent" until business verification), and
RemitBridge isn't a registered business (D49). Angad chose to park it rather than register a
business, use a parent's account, or add another channel. Everything on our side stays set
(secrets, webhook, subscription), so it works with no changes if Meta lifts the
restriction. Unofficial WhatsApp libraries were ruled out: they break WhatsApp's terms and
get numbers banned. Telegram stays an option if a chat channel is wanted later.

**D101. The receipt scanner is the first tab, and the app opens on it.** Angad: a real
receipt is a better lead-in than Compare, which "is kind of just math". The tabs are Scan ·
Compare · Tools · Learn · Account (replacing D58's four). Scan left Tools. Links that open
Compare (saved comparisons, TrueCost, the route board) now go to `/compare`; a partner link
and the sign-in callback land on `/`, so on Scan.

**D102. Fewer words, more icons** (Angad: "too much text, not enough... icons"). Reverses
D63's "no icon tiles" and softens D44/D47's "text labels over decoration": every list row
and card leads with an SF Symbol on a mint tile, but icons go next to words, never instead
of them, and there is still no emoji. Tools and Learn's "How it works" and "Go deeper"
become two-column cards (`components/tile-grid.tsx`) with a few words each; the tab
headers lose their subtitle line; the Scan tab leads with one large scan icon, two buttons,
three icon steps and one privacy line. In Expo Go the scan card shows as it will in the
app, and pressing it explains that scanning needs the full build.

**D103. Drawn illustrations in an editorial list, not icon tiles** (replaces D102's tiles
and cards). Angad found the mint-square icons and two-column cards "too vibecoded", and
chose a mix: the website's editorial index (divided list, big titles, no cards) with
custom illustrations. `components/illustrations.tsx` holds one set, drawn as SVG
(react-native-svg, which Expo Go includes): a 64-unit square, ink outlines 2 units wide, a
mint disc behind each, and colour only from the money palette, green for what arrives,
grey for the fee, amber for the hidden markup. So the pictures repeat what the numbers
say: Scan's lead is a receipt in a viewfinder with a name covered and the markup in amber;
the third step is Compare's own cost bar. Settings rows (Account, website links) keep a
small plain SF Symbol in ink, with no tile. Still no emoji (D44).

**D104. Learn is modules; How it works moves to Account.** Angad asked to split Learn into
modules and move "How it works" to Account.
- **Modules:** eight short topics built from the glossary's 80 terms, every term in exactly
  one (`src/data/modules.ts`, checked by a test): The basics; What a transfer really costs;
  How money arrives; Staying safe; Why remittances matter; How money moves between banks;
  Inside a provider; Crypto and stablecoins. Sender-facing topics come first, plumbing
  and crypto last. A module shows its drawing and one line, then its terms as numbered
  lessons that open to the glossary's definition, then a "Try it" tool where one fits
  (Fair rate, Compare, Scam check, What people paid). The A to Z glossary stays under
  "Go deeper". Definitions stay English in every language, as in the glossary.
- **How it works** (fee plus markup, checked prices, no affiliate deals, wrong price) is
  about RemitBridge, not a lesson, so it sits in Account above About.
- **No yellow in the drawings** (Angad, the same day): the hidden markup is a translucent
  green highlighter. The money colours in charts and cost bars (PRD 14.5's amber for the
  markup) are unchanged until Angad says otherwise.

**D105. No yellow anywhere** (replaces PRD 14.5's amber for the markup). Angad doesn't like
the yellow. The cost hidden in the rate is now a mid green (#46a085, 3.2:1 on white),
lighter than the green of what arrives (1.9:1 apart), with a deep green for text (#0e5c49,
7.9:1); pickup charges are a pale green; dark mode uses a pale mint. Every bar and dot has
a text legend, so colour never carries the meaning alone. On the receipt confirmation
screen, values to check are outlined in ink, heavier, instead of amber, since a green
outline would look like a confirmed one. The drawings use a translucent green highlighter
for the markup (D104).

**D106. The website's blog lives in the app too, formatted as on the website.** Angad asked
for the blogs in the app "with similar formatting as the way it is on the website".
- **Ported, not linked:** `mobile/scripts/port-blog.mjs` reads the website repo (never
  writes to it) and writes `src/data/blog.json`: all 30 posts' catalogue entries, and the
  17 written in full with their body blocks exactly as the website stores them. Rerun it
  when the website publishes or edits a post.
- **Figures:** on the website they're React components. The script captures each one
  from the live post page with headless Chrome at phone width (430 px, 2x) and checks the
  count against the data before saving (86 figures). Photo covers are copied and
  resized to 1200 px. 8.8 MB in `assets/blog` in all.
- **Layout:** the website's index (written-in-full count, series as text toggles that are
  also the colour key, cards with cover, series, title, summary, date and read time) and
  post page (cover, series, title, author, date, summary, body, sources, "Keep reading").
  Inline tokens work as on the site: bold, glossary terms (open the glossary), and links
  between posts (open the post in the app; TrueCost and the reckoner open the app's
  tools; anything else opens the website).
- **Colours:** the website's series hues are theme tokens; series 4's amber became a
  slate teal (D105), in the app and in its captured figures.
- **Not yet:** posts are English in every language (the app says so). Figures are
  pictures, so VoiceOver can't read the words inside them; the paragraphs around each
  figure carry the same points. Posts the website writes in its dashboard, if any, aren't
  in the port.

**D107. Learn shows progress, Duolingo-style, without the games.** Angad asked for Learn to
feel more like Duolingo, with "a level of progression" but no "crazy gamification".
- **The tab:** the green band shows terms learned out of 80 with a bar, and a Continue
  button to the first unread lesson; below it, the modules wind down the screen as a path
  of round nodes, each with its drawing inside a ring that fills as its lessons are read,
  a tick when finished, and an "Up next" tag on the next one.
- **A module:** a progress bar; opening a lesson counts it as learned and turns its
  number into a tick; once all are read, a "Module complete" card offers the next module.
- **What it isn't:** no points, streaks, hearts or locks; any module opens any time.
- **Privacy:** progress is kept on the phone (`lib/learn-progress.ts`, local storage),
  like the other preferences, and never sent.

**D108. Saved comparisons and checks get their own screen, reachable from where they're
made.** Angad asked where people find saved comparisons from the tools. They were only at
the bottom of Account, signed in. Now `/saved` holds both, and is reached from the top of
Tools, from Compare (a link under "Save this comparison", and the confirmation itself),
and from Account (one row instead of two lists). Signed out, it says saving needs a free
account and offers sign-in.
- **Also:** Compare's quote cards no longer print the source ("Official API"), at
  Angad's request, to cut text. The source stays on each price's own screen, a tap away,
  and in the card's spoken label, so every figure still names its source (PRD 14.6).

**D109. Depth in the drawings** (Angad: the app is "a tad bit bland"; "maybe something that
makes them look 3D"). Each illustration is drawn in three stacked layers: its disc, shaded
from mint to a deeper mint with a soft highlight at the top left; the drawing as a faded
deep-green silhouette a little down and right; then the drawing. The Learn path's nodes sit
on a darker rim they sink into when pressed, like Duolingo's buttons. All colours are
theme tokens (`depth`, `depthOpacity`, `accentDeep`, `glow`, `glowOpacity`), lighter in
dark mode.

**D110. The tax watch is automatic.** Checked 2026-10-01: the IRS rules on the 1% remittance
tax (IRC 4475) are still proposed (Federal Register 2026-07085); the latest step is Notice
2026-52, extending providers' deposit-penalty relief until final rules apply. So D97's
tax stands. Instead of someone remembering to look, `.github/workflows/tax-rules.yml` asks
the Federal Register API every Monday for an IRS final rule on remittance transfers and
fails, which emails the repo owner, when one appears. Then the final text gets checked
against D97 and the formula updated.

**D111. Learn has two parts, and the path climbs.** Angad: split the modules and the other
learning resources into two tabs, and start the modules at the bottom, going up. Learn's
green band stays fixed with a Modules | Library switch; Modules has the progress, Continue
and the path, now drawn from the bottom up (module 1 lowest) and opened scrolled to the
module you're on; Library has the blog, the glossary A to Z, the route board, What people
paid, RemitBench and the website's papers and workshops.

**D112. Learn's chunky, raised look, everywhere.** Angad: the Learn tab looks great, but the
rest is still too bland. The pieces that make Learn feel alive are now the app's shared
components, so every screen gets them:
- **Buttons** are chunky, like Duolingo's: a darker lip under each (deep green under
  green, a grey rim under outlined, deep green under white on the band) that the button
  sinks into while pressed. The lip and the sink trade the same height, so nothing moves.
- **Cards** sit on a soft rim along their bottom edge.
- **Rows that go somewhere** (Tools, Library, Account, a quote's links) are chunky cards on
  a rim, sinking when pressed, with the drawing or a symbol on a mint disc. Rows that
  state facts (a price breakdown, How it works, saved items) keep the website's thin
  dividers, since they're for reading, not tapping.
- **The green band** carries the website's bridge mark, large and faint, behind the title.
Tokens: `primaryDeep`, `rim`, `inverseRim`.

**D113. Rate alerts are push notifications, built now** (D34 said post-launch; Angad asked
for them now). "Tell me when it's better" on Compare opens a screen with a target in the
receiving currency, starting a little above today's best standing price for the checked
amount, method and payment, moved in round steps (₹100 near ₹47,000).
- **Storage:** `rate_alerts` (migration 20261001000000), owner-only by RLS like saved
  comparisons, at most ten each, deleted with the account; a client can't mark one sent.
  It holds the phone's Expo push token and the language, nothing else about the device.
- **Sending:** the "Rate alerts" workflow runs after every Scrape and Manual prices run.
  It calls `due_rate_alerts()` (service role only: it returns tokens), which matches each
  alert against the best standing, fresh, non-promotional price, and sends through Expo's
  push service in the person's language, at most once in 20 hours per alert. Phones that
  stopped taking notifications have their alerts deleted. Before the migration is pushed,
  the workflow finds nothing and passes.
- **Tapping one** opens Compare on that route, amount and method. Alerts are listed on
  the Saved screen, with delete.
- **Needs before it works for real:** the migration pushed, and the iPhone development
  build (Expo Go and simulators can't get a real push token; EAS sets up Apple's push key
  with the paid Apple account).
- Privacy policy updated: what's kept, and that Expo, Apple and Google deliver the message.

**D114. "Hi, [name]" on the home tab.** Angad asked for a greeting at the top. The Scan tab's
green band says "Hi, Angad" above its question, or "Hi there" with no name. The name is
the one typed in Account ("Your name", shown when signed in), else the one Google or Apple
gave, first name only, kept in the account's metadata and deleted with it. Also fixed:
the empty saved-comparisons "Compare prices" button still went to `/`, which is Scan since
D101; it goes to Compare.

**D115. Which other providers can be automated, checked 2026-10-01** (Angad: "check for more
prices and any ways to expand our aggregate database"). Read in a real browser, since plain
requests were blocked on 2026-09-28. Full quotes are in `docs/MANUAL_RESEARCH.md`.
- **Terms forbid automated access** (no adapter): Ria, MoneyGram, Xe, WorldRemit, Xoom
  (PayPal's user agreement), Pangea, Intermex, Taptap Send, and Remitly (2026-09-28).
  Sendwave is the same company as WorldRemit (Zepz) and is treated the same until its
  own sender terms are read.
- **Western Union:** neither its terms nor robots.txt forbids it, but its prices load
  through a call guarded by bot protection. Getting past that would break PRD 9.12, so
  it stays manual, waiting on the permission request sent 2026-09-28.
- **Instarem: cleared.** Its terms and US customer agreement have no automated-access
  clause, robots.txt allows everything but `/wp-admin/`, and its own site's quote endpoint
  (`/api/v1/public/transaction/computed-value`) answered one honest request with its rate,
  its fees and when the rate was updated. It is the next adapter to build, once Angad says
  go: a provider row (a migration he pushes), the adapter with archived raw responses,
  and care with its "first transfer" and "special FX rate" offers, which are promotions
  (the gate's `is_promotional`).
- **The World Bank's Remittance Prices Worldwide** publishes provider-by-provider prices for
  42 US routes (including MoneyGram, Ria, Western Union, WorldRemit, Pangea and banks),
  free to reuse with credit ("The World Bank, Remittance Prices Worldwide, available at
  http://remittanceprices.worldbank.org") and without implying endorsement. The newest
  survey is Q3 2025 (collected August 2025), so it never appears as a current price in
  Compare. It fits research, the observatory and Learn, labelled with its quarter. The
  Excel download needs Angad's yes (a plain request got 403; a browser can fetch it).

**D116. `host.exp.Exponent` removed from Apple sign-in's client IDs** (Angad, 2026-10-01; the
D60 "before launch" item, done early). Apple sign-in now accepts only the app's own bundle,
`org.remitbridgelabs.app`, changed live through Supabase's Management API and matched in
`supabase/config.toml`. Sign in with Apple no longer works inside Expo Go, which was only
ever a development convenience (the simulator hides Apple anyway); the development build
has the real bundle ID.

**D117. Two of Angad's calls, 2026-10-01.** The CAC entry waits until the app itself is
finished (the deadlines stay Oct 23 internal, Oct 26 official). The Hindi translation
review goes to Angad's mother: she reads `docs/translation-review/hi.md`, agrees in writing,
and is named with the date in `mobile/src/i18n/languages.ts` (D69).

**D118. Instarem is automated, and the World Bank survey is in the repo for research**
(Angad's yes to both, 2026-10-01).
- **Instarem adapter** (`engine/src/remitbridge_engine/adapters/instarem.py`): Instarem's
  public quote endpoint, 20 quotes a run (four routes, the amount grid), bank deposit paid
  from a bank account, 5 seconds between requests, on the same 6-hourly Scrape schedule.
  A signed-out visitor gets a first-transfer rate; the adapter publishes the standing
  (`regular_*`) rate and fees instead, working out the amount received the way Instarem
  does (fees off, then the rate), and refuses any quote where Instarem's own first-transfer
  figure doesn't match that calculation, or that carries a warning, a tax or a coupon. The
  first local run against the live endpoint published 20 of 20 through the gate: no fee,
  markups of 0.4% to 0.9%. Migration `20261001010000_instarem_provider.sql` adds the
  provider row, which quotes need; the smoke test now expects 9 providers.
- **World Bank Remittance Prices Worldwide**: `research/world-bank-rpw/` holds `extract.py`,
  the 28,532 US-sending rows from Q2 2016 to Q1 2025 as `us-sends.csv`, and `summary.md`
  (every service surveyed on the four Tier 1 routes in Q1 2025, and the median cost of a
  $200 transfer by year). The 49 MB workbook isn't committed. The website shows a newer
  round (Q3 2025) than the download. Nothing here reaches Compare; any use in the app names
  the World Bank and the quarter, and never implies the World Bank endorses RemitBridge.

**D119. A scanned receipt says what you could have kept** (Angad, 2026-10-01: "how much money
they could have saved if they chose the most efficient provider"). A new part of the result,
right after the true cost, built by `bestOption` in `packages/receipt/src/result.ts` (so the
app, the Edge Function and any later surface agree) and fed by `scan-receipt`.
- **The comparison:** every provider's published standing price for the same route and
  checked amount, the same way of receiving, and the same way of paying. Each option sends
  the receipt's own amount with its own fee and rate (and the same tax), costed with the one
  formula at the receipt day's mid-market rate; "could have kept" is the difference in true
  cost, in dollars, plus what the family would have received.
- **Which prices:** from within a day of the transfer when we have any; otherwise today's,
  and the screen says so ("We don't have prices from Sep 3, so these are today's").
- **Fair, or nothing:** a cash pickup is never compared with a bank deposit, and promotions
  never count. A card payer is also compared with paying from a bank account when that's
  all we have, and told so (they have a bank account); a cash or money-order payer isn't
  (they may not). With nothing fair to compare, the screen says why instead of a number.
- **Honest scope:** every result names the providers compared and says we don't have every
  provider yet; an amount we don't check is worked out from the nearest checked amount and
  labelled. When the receipt already had the best price, it says that.
- Not yet in the WhatsApp reply (parked, D100). `scan-receipt` redeployed 2026-10-01.

**D120. Swipe left or right to change tabs** (Angad, 2026-10-01). A sideways pan anywhere on
a tab moves to the next or previous tab in the bar's order (Scan, Compare, Tools, Learn,
Account), in `mobile/src/app/(tabs)/_layout.tsx`. It must be clearly sideways (a gesture
that starts vertical stays with the scroll view) and long or quick enough, so reading and
scrolling are unchanged. Native tabs switch without updating the layout's `usePathname`, so
each tab records itself when it comes into view (`lib/current-tab.ts`). The app now has
the gesture-handler root it needs (`GestureHandlerRootView` in the root layout).

**D121. Motion across the app** (Angad, 2026-10-01: "more animations that make the app
smoother"). In the website's register (D18, `components/motion.ts`): short, small,
ease-out, and off when the phone asks for reduced motion. In `components/motion-views.tsx`:
- **Tabs:** each tab's body rises into place when it comes into view (a fade and a 10pt
  lift after a tap; a 28pt slide from the side swiped from, D120). Native tabs switch with
  no motion of their own. A body starts hidden, and the tab coming into view hides the
  others (out of sight by then), so a tab only animates in from hidden: resetting on its
  own focus flashed the content first (Angad, 2026-10-01), and resetting on blur blanked a
  tab while a pushed screen slid over it.
- **Compare:** the price cards arrive in turn, best first, each time a new set loads, and
  each card's cost bar fills from the left.
- **Progress:** Learn's progress bar and a module's progress bar fill to their value.
- **Segmented choices** (delivery method, Modules | Library): one green thumb slides to the
  choice. When stacked for large text, the chosen row is filled as before.
Tests run with the stand-ins Reanimated ships (`mobile/jest.setup.js`).

**D122. Learn's path climbs a mountain** (Angad, 2026-10-01: "add a background to the learn",
then "make the learn icons more centered"). Behind the modules, a broad mint mountain with
its shaded side drawn the way the app's drawings show depth (D109), rolling hills at its
foot where module 1 sits, and a few dots in the sky; mint tokens only, so dark mode
follows, and it scrolls with the path (`LearnBackdrop` in `components/learn-path.tsx`).
The dashed line is green at low opacity so it reads on the mint, and each module's name
sits on a small card so it reads on the scene. The path's sideways swing is halved (at most
52pt either side of the middle), so the modules zigzag gently near the centre.

**D123. Store readiness without the accounts** (Angad, 2026-10-01: "finish everything except
the stuff that requires the accounts"; his dad will hold the Apple and Google accounts
until Angad is 18, then the apps transfer).
- **`docs/store/listing.md`:** every field both stores ask for, drafted to paste: names,
  descriptions, keywords, URLs, App Privacy and Data safety answers that follow
  `site/privacy.html`, age and content ratings, the financial-features declaration ("no
  financial features": the app shows information and never moves money), notes for App
  Review, the closed-test message for Google's 12 testers, and the screenshot plan.
- **Build config:** `usesNonExemptEncryption: false` (standard HTTPS only, so no export
  question on each upload); Android asks for the camera explicitly and no longer for the
  microphone, overlay or legacy storage writes it never used.
- **EAS:** the two public `EXPO_PUBLIC_SUPABASE_*` values now exist for preview and
  production builds too (they were development-only, so those builds would have shipped
  without a database).
- Not doable without accounts: Android push needs a Firebase project's FCM key uploaded to
  EAS; submission IDs go in `eas.json` once the store records exist.

**D124. The scanner's later screens can be seen before the iPhone build.** A development-
only screen, Account > "Preview the receipt screens" (`mobile/src/app/dev/receipt-preview.tsx`,
a release build sends the route home), shows the value check and the result three ways
(that day's prices, today's, nothing fair to compare) with made-up receipts and a drawn
stand-in for the covered photo (`mobile/src/dev/`). The samples' comparisons are worked out
by the real `bestOption`, so they agree with the true cost above them. First fix from it:
"what you could have kept" is a mint card with a green left edge, so it reads apart from the
dark true-cost block above it.

**D125. The glossary in Hindi** (Claude's draft, 2026-10-01). All 80 definitions, in the
Hindi app strings' own words (कंपनी for provider, फ़ीस for fee, मिड-मार्केट रेट), in
`mobile/src/data/glossary-translations.ts`. The glossary and the module lessons both show
the Hindi with the English term beneath it, since that's the word printed on receipts
(`termIn`). The Hindi review sheet now carries the glossary too, term and definition, 840
lines in all. Like the rest of Hindi, it shows only in development builds until the
reviewer signs off (D69). Spanish, Tagalog and Vietnamese glossaries wait for reviewers.

**D126. The receipt result shows rather than tells** (Angad, 2026-10-01: "way too much text…
add more data visualizations"). Each paragraph became a chart with a short label
(`mobile/src/components/receipt-charts.tsx`):
- **The cost on a scale:** the receipt's % as a dot, with the UN target (3%, the good zone
  shaded) and the world average (6.36%) marked.
- **Where the cost came from:** one bar split into fee, tax, markup and pickup, amounts
  beneath.
- **What arrived:** the whole bar is what the mid-market rate with no fee would have
  delivered; the filled part is what did; the end is marked as lost.
- **Could have kept:** your cost and the cheapest provider's as two bars.
- **Advertised vs. paid:** mid-market, advertised and the receipt's rate as dots on one
  line, so the gaps are distances.
- **Tax** and **"paid from a bank instead"** as a status line and two bars; **missing
  disclosures** as small chips.
Every chart's accessibility label carries the same facts in words, and the tests check
those labels. Red stays for real errors: a mismatch shows a neutral mark. The long "rule"
and "advertised" sentences are gone from all five languages.

**D127. Firebase for Android push** (Angad, 2026-10-01). Firebase project `remitbridge` on the
RemitBridge Google account (Spark, free; Analytics and the Developer Program sign-up off),
with the Android app `org.remitbridgelabs.app` registered. Its `google-services.json` is
config rather than a secret, but holds an API key, so it stays out of git: it's at
`mobile/google-services.json` (git-ignored) and on EAS as the secret file
`GOOGLE_SERVICES_JSON` for every environment, read by `mobile/app.config.ts`. Angad
generated the service account key and uploaded it with `eas credentials` as the FCM V1 key
(2026-10-01); it's a real secret, so it never passed through Claude.

**D128. A warmer greeting** (Angad, 2026-10-01: "Hi there" felt off-putting). The home tab
now greets by the phone's time of day, with the first name when we have one and an
exclamation mark: "Good morning, Angad!", "Good afternoon!", "Good evening!" (morning 4 am to
noon, afternoon to 5 pm). In all five languages (Spanish with its opening ¡).
Then moved out of the green band (Angad: "way too easy to ignore"): it sits at the top of the
page, 28pt extra-bold dark text with a green left edge, and the band's subtitle is full
white rather than the muted tint, for contrast. The privacy line under the steps now says
details are covered "before anything is sent to our database" (Angad's wording).

**D129. Native Google sign-in** (Angad, 2026-10-01: Google's page said "continue to
gmzljjdnwndvqciqicbx.supabase.co"). The browser flow shows the Supabase project's address;
Google's own sign-in sheet (`@react-native-google-signin/google-signin`) shows the app's
name and no address, and its ID token goes to `supabase.auth.signInWithIdToken`, as Apple's
does. A custom auth domain was the other way, at about $35 a month on Supabase's paid plan,
with the browser page still there. The Google clients live in the "Remittances
Benchmarking" Google Cloud project, beside the web client Supabase already trusts.
- Native runs on iPhone in the app build; Expo Go (no native module) and Android keep the
  browser flow. Android needs its own Google client with the signing key's SHA-1, which
  exists only after the first Android build.
- Set up 2026-10-01: the iOS OAuth client "RemitBridge iOS" (bundle `org.remitbridgelabs.app`,
  `526944791895-a408…`; public, as client IDs are), as `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
  locally and on EAS beside the web ID; Supabase's Google client IDs are now web then iOS,
  with the nonce check skipped (iOS tokens need it). The browser flow still uses the web
  client, checked. Seen for real in the iPhone build.

**D130. Claude writes the receipt extractors** (Angad, 2026-10-01: "go ahead and do the
extractamountsent and allat stuff"). Supersedes D86's split and D72's "Angad writes the
parser's field-extraction heuristics himself": all 13 functions in
`packages/receipt/src/extract/fields.ts` are Claude's, with shared reading helpers in
`extract/read.ts` (labels at the start of a line, longest label wins; amounts with their
currency; rates either way round; dates month first). **For the CAC's AI-use disclosure,
the rule-based parser is now AI-written**; `docs/AI_USAGE.md` says so, and the write-up
(`docs/cac/submission.md`) must not claim it as Angad's code.
- Results: the four fixtures 47 of 47. The 60 synthetic receipts read back with OCR, which
  weren't used to write the rules: 97.8% accuracy and 99.0% precision on the first run
  (model mode was 82.3% on Groq, D98). After handling OCR's usual slips (a currency sign
  read as a stray letter or as a "3", a name split in two, "=" stuck to a number), all but
  two values right, and the one wrong number is flagged for the person to check.
- Anything read through a smudge or a guess gets a confidence below 0.8, so the model and
  the person check it (D79); an amount received far from amount sent × rate is flagged.
- A cash pickup is inferred, at 0.5, from a pickup charge when the receipt doesn't print the
  delivery method.

**D131. A blurry receipt is turned back, with a reason** (Angad, 2026-10-01: "if a receipt is
ever too blurry, it should tell the user so"). Before, only a photo with no text at all was
caught; a blurry one gave garbled text that went through as if it were fine.
- **On the phone, before anything is covered or sent** (`packages/receipt/src/quality.ts`,
  `mobile/src/lib/receipt-scan.ts`): in each word OCR found, the steepest step from paper to
  ink is compared with the word's contrast, which estimates the blur's width; divided by the
  word's height, so it means the same at any photo size. The page's median word decides.
- **Calibrated, not guessed:** 8 synthetic receipts drawn at blurs from 0 to 5 px and read
  back with tesseract. At 0.075 or less the rules read every value; 0.075 to 0.095, 64% to
  100%; from about 0.095, half or fewer. So 0.09 and up is "too blurry to read, take it
  again", and 0.07 to 0.09 shows a warning on the preview but lets the person continue.
- **Backstop after the server reads it:** if neither the rules nor the model found the amount
  sent, the total or the amount received, the app says it couldn't read the amounts (the
  photo may be blurry or cut off), asks for another, and deletes the stored receipt.
- "No text found" now also says the photo may be blurry. If the pixels can't be measured, the
  scan goes on (the backstop still applies). Thresholds come from tesseract, not the phone's
  ML Kit: check them on real phone photos.

**D132. Smoother motion** (Angad, 2026-10-01: "make all the animations higher quality").
Springs replace fixed-time curves for things that move because of a touch or a choice
(`SNAPPY` and `GENTLE` in `components/motion.ts`, damped just short of a bounce); fills use one
long ease-out (`EASE_OUT`, expo). Specifically: chunky buttons now spring down onto their lip
as a transform (before, an instant border swap that jumped); the segmented thumb springs; a
tab arriving fades fast while it moves on a spring, with a slight scale from 98.5% after a tap;
lists reflow on a spring; bars fill on the longer curve; each Scan step rises in instead of
swapping in a frame. All of it still stops when the phone asks for reduced motion.

**D133. The confirmation screen doesn't say who read a value** (Angad, 2026-10-01: "remove
the read by AI thing"). The line under each value said "Read from the text" or "Read by AI";
now it shows only what the person can act on: "You entered" for a changed value, "Not found"
for a missing one, and "Please check" as before. Which reader found each value is still
stored (`receipt_fields.extraction_path`) and measured by the benchmark.

**D134. The Apple developer account is an individual one, in Angad's dad's name** (Angad,
2026-10-01, with his dad's permission). Individual / Sole Proprietor, so the App Store shows
his dad's legal name as the seller; an organization account would show "RemitBridge" but needs
a registered entity and a D-U-N-S number, which RemitBridge doesn't have (D49). Enrolled on
the web the same day: details confirmed, the Program License Agreement accepted and the $99
paid by Angad on his dad's account. Apple says a purchase can take up to 48 hours to process.
The app moves to Angad's own account when he's 18 (D123).

**D135. A security pass over every place sensitive data lives or moves** (Angad, 2026-10-01:
"go through every data security concern that could possibly arise and solve it"). The whole
list, with what stops each threat, is `docs/SECURITY.md`. What changed:
- **No password sign-in.** Supabase's email provider takes passwords even though the app
  never uses one, and sign-ups were auto-confirmed: anyone could register another person's
  address with a password and later read what that person saved. Email confirmation is now
  on (live), and `custom_access_token_hook` refuses a token for a password sign-in or a
  session that began with one (in the migration; switched on once it's pushed). Code
  sign-ups get a random password from Supabase, so "has a password" couldn't be the test.
- **Sign-in redirects** go only to `remitbridge://` and Expo Go on a private network
  (live); `exp://**` let any Expo server on the internet receive someone's sign-in.
- **The session on the phone** is AES-256-GCM encrypted with a Keychain/Keystore key that
  never leaves the device (`expo-secure-store`, expo-crypto's AES); a plain-text session
  from an older build is encrypted on first read. Android backup is off.
- **Apple sign-in** sends a one-time nonce. **Unredacted photo files** are deleted from the
  app's cache once OCR has read them.
- **Rate limits per network address** on what the public key can write and on
  scan-receipt (30 scans an hour); only an HMAC of the address with a daily random key is
  kept, for a day. The WhatsApp function and worker are exempt via the intake secret.
- **Images** must really be JPEG or PNG (first bytes) and at most 8 MB.
- **Promised deletions run on a clock** (pg_cron): expired receipts hourly, WhatsApp numbers
  within the hour, rate-limit counters daily. Before, they ran only when the next receipt or
  photo arrived.
- Trigger functions and `is_admin()` are no longer callable anonymously; every function has
  a fixed search_path; free-text columns are capped; push tokens are kept out of logs; the
  privacy policy now covers route-request emails, the network address and the safeguards.
- Found and fixed nothing in git history (one "Meta token" hit was bytes of a sample JPEG).
  `npm audit`'s three findings are inside Expo's build tools only.
- **An exposure of Claude's own making:** reading the project's API settings printed the
  legacy JWT secret into the session. It isn't public, but it is treated as compromised:
  rotating it (move functions and workflows to the new `sb_secret_` key, then Migrate,
  Rotate and Revoke under Settings > JWT) is Angad's next step with Claude.

**D136. Learn teaches by lessons, not fold-out definitions** (Angad, 2026-10-01: "make the
terms be taught in a more gamified way rather than just being basic dropdowns").
- A lesson (`app/lesson/[id].tsx`, logic in `lib/lesson.ts`) takes up to five new words:
  each on a card, then "Which word means this?" (four choices); then a review round the
  other way, "What does X mean?" (three definitions). A miss comes back once at the end.
  10 XP right first time, 5 on the retry; a combo counter; a day streak; a finish screen
  with XP, accuracy and the streak. Haptics on answers. Full screen with a close button.
- Wrong answers shake and grey; they're never red (red is for real errors, PRD 14.5).
- A word counts as learned when it's answered right. XP and the streak stay on the phone.
- The module screen has "Start lesson" (or "Practice these words") and a word list that
  opens each word in the glossary; Learn's Continue starts the next lesson directly, and the
  streak and XP show under its progress bar.
- **The dropped first tap, found:** a view with a Reanimated `entering` animation ignored
  taps for a few seconds after it appeared (Continue seemed broken in a lesson). Every
  `entering` in the app (onboarding, sign-in, Compare's cards, the Scan steps, lessons) is
  now `Rise` or a spring on the view's own transform, and taps land at once (checked in the
  simulator).

**D137. Off the legacy keys, so the exposed JWT secret can be revoked** (Angad, 2026-10-02:
"change the master key"). The legacy anon and service_role keys are tokens signed with the
JWT secret Claude printed into a session (D135), so revoking that secret switches them off.
First, everything was made to work with Supabase's newer keys as well:
- Edge Functions read `SUPABASE_SECRET_KEYS` / `SUPABASE_PUBLISHABLE_KEYS` when the platform
  provides them, else the legacy values (`supabase/functions/_shared/keys.ts`).
- The engine, the WhatsApp photo worker, the rate-alert sender and the workflows send an
  `sb_` key only in the apikey header (it isn't a token) and a legacy key as before; the
  GitHub secret `SUPABASE_SERVICE_ROLE_KEY` can hold either.
- `delete-account`, `process-prices` and `notify-route-launch` no longer rely on the
  gateway's JWT check (it only knows the legacy secret); each already checks the caller in
  code, and all three were tested refusing no login, a forged token and the public key (401).
- SSL enforcement is on for the database (Angad's ask, same day).
Then: a secret key into the GitHub secret from Angad's terminal; Migrate and Rotate under
Settings > JWT Keys; once everything runs on the new keys, disable the legacy keys and
revoke the old secret.
- 2026-10-02: done so far. The GitHub secret now holds the project's `sb_secret_` key (set from
  Angad's terminal, never displayed); rate alerts, manual prices and a full Scrape run (reads
  and raw-archive uploads) passed on it; a throwaway function confirmed Edge Functions get the
  newer keys, then was deleted. The project already signed logins with an ECC key, with the
  legacy HS256 secret "previously used". Disabling the legacy keys and revoking the secret
  are Angad's clicks: the browser step was refused for Claude.

**D138. WhatsApp in the app: link a chat to an account, chat with the bot, show its number**
(Angad, 2026-10-02: "it should do all of the above, but most specifically it should link
whatsapp to this account"). Built without storing phone numbers:
- **Linking:** Account > Link WhatsApp makes a one-time code (six characters without
  0/O/1/I, ten minutes, one live per person) and opens WhatsApp with "LINK <code>" typed in.
  Sending it proves the person holds the number; the bot calls `link_whatsapp()`, which
  points the chat's existing keyed-hash row at the account. Then "SAVE 500 to India" on
  WhatsApp adds that comparison to the account's Saved (the amount goes to the account the
  person chose, never to the chat's row). UNLINK on WhatsApp or Unlink in the app undoes it;
  deleting the account unlinks it (a check that tied the link and its date together made
  account deletion fail, caught by the local checks, so a trigger clears the date instead).
- **Chat on WhatsApp** with the bot's number, from the public `app_settings` table, so it
  switches on for everyone (`whatsapp_live` = true) without a new build once Meta lets the
  bot reply to anyone; until then only development builds show it.
- **Not built: rate alerts by WhatsApp.** Messaging someone first needs their real number,
  which the privacy rule doesn't allow to be stored; that's Angad's call.

**D139. Rate alerts by WhatsApp, with the number kept encrypted** (Angad, 2026-10-02: "you
can store numbers as long as its encrypted for whatsapp and abides by all data
protection/privacy"). This changes the privacy rule "on WhatsApp, store only a hashed phone
number" for one case: a chat the person has linked to their account.
- **When it's kept:** only when someone links WhatsApp (D138), which the app explains next to
  the button. The bot seals the number with AES-GCM under a key only the whatsapp function
  holds (derived from WHATSAPP_HASH_SECRET with its own label, separate from the photo
  queue's), and stores only the sealed text (`whatsapp_users.number_sealed`).
- **When it's deleted:** unlinking (app or UNLINK), STOP, or deleting the account clears the
  number and deletes that person's WhatsApp alerts, by trigger, so no path can leave either
  behind. Checked locally for all three.
- **Who can open it:** only the whatsapp function, when the "Rate alerts" workflow hands it
  due alerts (authenticated by RECEIPT_INTAKE_SECRET). Never logged; sent only to Meta.
- **Alerts:** `rate_alerts.channel` is 'push' or 'whatsapp'; a WhatsApp alert needs no push
  token and is refused without a linked chat. Messages go through the approved template
  `rate_alert` (`docs/whatsapp-templates.md`), English and Hindi.
- The privacy policy says all of this in plain words.
- 2026-10-02, done: Angad disabled the legacy API keys and revoked the legacy HS256 secret.
  Checked: the secret shows "revoked", the old anon key is refused as a key and as a token
  (401), the smoke test passes 63/63, and the Manual prices workflow passes on the new key.

**D140. Limits on AI spending, per person and per day** (Angad, 2026-10-02: "someone
shouldnt just be able to drain all my api because theyre spamming it. set a limit on number
of msgs maybe, and same for number of reciept uploads on the app"). Each receipt scan asks
the model at most once; answering its follow-up questions asks it nothing. Before this, one
person could spend the month's 2,000 model calls in a day: the app had only 30 scans an
hour per network address, and WhatsApp only 30 messages an hour per number. Defaults picked
on Angad's behalf:
- **App:** 10 scans a day per phone (the app's random install ID, sent with each scan), 10 a
  day per signed-in account across its phones, and 100 a day per network address, on top of
  30 an hour per address. The install ID can be left out or made up, so the address limit
  and the model caps are what bound someone set on spending. The Scan tab says which limit
  was hit: "try again in an hour" or "you can check more tomorrow".
- **WhatsApp:** 10 receipt photos a day per number (told so each time; the photo isn't
  queued), and 100 messages a day per number (one reply, then silence), on top of 30 an
  hour. The WhatsApp worker's own scans aren't counted again in scan-receipt.
- **Overall:** 200 model calls a day (`RECEIPT_MODEL_DAILY_CAP`), beside 2,000 a month, so a
  bad day spends at most a tenth of the month. Past either cap, receipts are still read by
  the rules and the person types what's missing.
- **Privacy:** the counters keep only an HMAC of the ID, number hash or address under the
  day's random key, deleted within a day (as D135's address limits). The privacy policy
  says so.
- **Fail open:** if a counter can't be reached, the request goes through; the model caps
  still hold, and they fail closed (no call without an allowance).
- 2026-10-02, live: the migration applied by Angad in the SQL editor (the CLI couldn't reach
  the database from his network), `whatsapp` and `scan-receipt` deployed, and the live smoke
  test passes 66/66 with the three new denials (42501).

**D141. RemitBridge Labs: the operator, its public details, and research receipts kept 24
months** (Angad, 2026-10-02). Replaces D49.
- **Structure.** The project is being incorporated as a Washington nonprofit corporation,
  "RemitBridge Labs" (the state stores REMITBRIDGE LABS). The Articles were filed on
  2026-10-02 and are not accepted yet. The old names "RemitBridge Systems Lab" and
  "RemitBridge System Labs" are retired; "RemitBridge" stays the short name (the app, the
  logo, the WhatsApp display name). Angad owns the code, the RemitBridge name and the
  domain. The code is MIT-licensed by him (`LICENSE`), which already covers the
  corporation's use; the name and the domain will be licensed to RemitBridge Labs under a
  written agreement that doesn't exist yet (`OWNERSHIP.md`). RemitBridge Labs publishes and
  operates the app, the site and the bot, and is the party in the privacy policy and terms.
- **Legal-status wording is gated.** `INCORPORATED` in `site/site.config.json` (false until
  Angad says the state has accepted the Articles) switches the site footer and the app's
  Account line from "© 2026 RemitBridge Labs" to "© 2026 RemitBridge Labs, a Washington
  nonprofit corporation". **Never say "charity", "501(c)(3)" or "tax-deductible" anywhere
  until Angad says the IRS has approved it.**
- **One config file** for the operator's public details: `site/site.config.json` holds
  `LEGAL_NAME`, `CONTACT_EMAIL`, `MAILING_ADDRESS`, `META_DOMAIN_VERIFICATION` and
  `INCORPORATED`. The site's build (`site/build.mjs`, run by Vercel) stamps them into the
  HTML, because Meta's domain check reads raw HTML and runs no JavaScript; the app, the Edge
  Functions (`_shared/site-config.ts`) and the engine's user agent read the same file. No
  home address ever goes in it.
- **Contact email moves to hello@remitbridgelabs.org** (forwarded to the Gmail), for Meta's
  verification to match the business to its domain. Everything reads `CONTACT_EMAIL`; the
  value stays the Gmail until Angad confirms forwarding works, then that one value changes
  (and the functions are redeployed). Past outreach logs keep the address they were sent from.
- **Privacy policy and terms describe what the code does** (Angad: "the policy must describe
  what the code actually does. Keep the features"). Both are marked "DRAFT: pending legal
  review" and stay English-only until that review; app strings get all five languages.
  WhatsApp numbers: hashed, except encrypted for up to an hour while a receipt photo is read
  (D94) and while a chat is linked, for alerts (D139). Receipts: covered text, and sometimes
  the covered photo, go to Groq with zero data retention; the text is never stored; the
  figures are kept 30 days. Price sources: providers' public websites, provider APIs used
  with permission (Wise), prices entered by RemitBridge staff, Frankfurter's mid-market
  rates. Found while writing it and added: GitHub runs the WhatsApp photo reader (the
  original photo, in memory only), Meta carries the bot's messages, Vercel hosts the site.
- **Research receipts end after 24 months**, image and figures, instead of never
  (`20261003010000_research_retention.sql`). Every receipt now has an end date. The hourly
  job deletes expired receipts without an image; one with an image is deleted by
  scan-receipt on the next scan, image first through the Storage API, row second, because
  Supabase doesn't allow deleting Storage files from SQL and deleting only the row would
  leave the image behind.
- **DCO:** `CONTRIBUTING.md` requires signed-off commits. The check that enforces it (pull
  requests and pushes to `main`) is turned on when the first outside contributor starts;
  until then Angad is the only committer and pushes straight to `main` (D24). Claude never
  adds a Signed-off-by line: that certification has to come from Angad.
- **Stores:** no change now. Once incorporated, RemitBridge Labs gets a D-U-N-S number and
  Organization developer accounts on Apple (converted from the individual one, D134) and
  Google, so it shows as the publisher.
- 2026-10-03: forwarding for hello@remitbridgelabs.org runs through ImprovMX's free plan
  (GoDaddy charges for forwarding). Angad made the ImprovMX account; Claude added the alias
  and three DNS records at GoDaddy (two MX, one SPF TXT), leaving every other record as it
  was. The domain had no MX before, so nothing that received mail could break. It only
  receives; sending as hello@ is a later step.
- 2026-10-03: live. The 24-month migration was run by Angad in the SQL editor and
  scan-receipt deployed (smoke test 67/67). hello@remitbridgelabs.org forwards (Angad's
  test arrived, first in Spam) and sends: Gmail's "Send mail as" through Resend's SMTP with
  a sending-only key Angad created for this domain (the permission system refused Claude
  creating the key, as a secret write), replying from the address a message was sent to.
  `CONTACT_EMAIL` switched to it.
- 2026-10-03, Angad: **no mailing address on the site** ("Lets not put a PO box and rather
  tell them to get in contact if there's a need for that"). `MAILING_ADDRESS` stays empty,
  and the Contact sections (support, privacy, terms) say "Need our mailing address? Email
  hello@remitbridgelabs.org and we'll send it." Setting a value later shows it instead.
- 2026-10-03, Angad: he has also started filing to register RemitBridge Labs as a
  nonprofit/charity, under review. The wording rule doesn't change until he says it's
  approved: no "charity", "501(c)(3)" or "tax-deductible", and "nonprofit corporation" only
  with `INCORPORATED`. A state charity registration and IRS 501(c)(3) recognition are
  separate approvals; "tax-deductible" needs the IRS one.

**D142. Hand price checks with Claude transcribing** (Angad, 2026-10-04: "im comfortable with
doing this since i am doing all the clicks so its not automated"). For the hand checks of
providers whose terms forbid automated access (D52), Angad drives each provider's page
himself, and Claude reads the numbers from screenshots of what he has on screen and fills
the sheet. Claude flagged that these terms ban copying prices by automated tools and that
reading the page this way could count; Angad decided it's acceptable because a person does
every navigation and click. Limits: Claude never navigates, clicks or types on a
provider's site, there's no schedule, and it's only the hand-check sheet. Each screenshot is
kept as the evidence for its price. Prices still load as manual observations and pass the
same publish gate. Fee-on-top providers (Remitly) are recorded with the amount actually
paid (send amount plus fee), so (paid − fee) × rate matches what the page shows.

