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
provider's site, there's no schedule, and it's only the hand-check sheet. The evidence for
each price is its page address and check time (saving screenshots as files didn't work in
this setup). Where a page shows a first-transfer deal next to the struck-through regular
rate and fee, the regular price is loaded (received = (paid − fee) × regular rate) and the
deal goes in the promo text; where only the deal is shown, the deal is loaded, labelled
first transfer only. Prices still load as manual observations and pass the
same publish gate. Fee-on-top providers (Remitly) are recorded with the amount actually
paid (send amount plus fee), so (paid − fee) × rate matches what the page shows.
- 2026-10-04, first round: 27 hand prices (7 providers x 4 routes at $500, bank deposit;
  WorldRemit doesn't offer bank deposit to Vietnam), read by Claude from Angad's screen.
  Remitly, MoneyGram and WorldRemit pages didn't show the payment or delivery method;
  Angad confirmed bank account to bank deposit for those. Ria Philippines and Vietnam are
  debit card (the page's setting). Loaded by Angad in the SQL editor, run through the gate
  by the Manual prices workflow (run 37189113707): published 27, quarantined 0. Hand prices
  turn stale after 24 hours (STALE_AFTER_S), so they need re-checking to stay current.

**D143. Google Play waits for the RemitBridge Labs organization account** (Angad, 2026-10-04:
"I want to register it with a nonprofit for google so lets hold off for that"). No personal
Play account through Angad's dad; the app is published on Google Play by RemitBridge Labs as
an organization once Washington accepts the Articles and it has a D-U-N-S number. Side
effect: Google's 12-tester, 14-day closed test applies to new personal accounts, not
organization ones. Google for Nonprofits (a separate program) needs the IRS 501(c)(3) letter.
Replaces the personal-account plan in D32/D123 for Google Play only; Apple stays individual
for now (D134), so the CAC demo isn't held up.

**D144. Hand-checked prices stay in Compare for 7 days, as "Older prices"** (Angad,
2026-10-07: "add all the comparisions we previously sourced to the app as well", then
"Both": keep old hand prices visible, marked old, and re-check them). PRD 9.5 drops every
price from the rankings at 48 hours, which suits scraped and API prices that refresh every
few hours, but hand prices (D142) need Angad at the keyboard, so they vanished two days after
each check. Now a new view, `compare_quotes`, adds hand-checked prices up to 7 days old, with
`is_older` past 48 hours. Compare lists those under their own "Older prices" heading with a
line saying to check with the provider, ranked among themselves and never above a current
price; each card still says "Stale" and when it was checked. Only Compare uses the view:
`latest_quotes` is unchanged, so rate alerts, the WhatsApp bot and the receipt result stay on
the 48-hour window.
- Found while doing it: hand prices are stored at the total paid (D142: $501.99 for $500 plus
  a $1.99 fee), but Compare asked only for rows at exactly the checked amount, so fee-on-top
  hand prices never matched $500 (5 of the 7 hand-checked providers on India). Compare now
  takes each provider's price checked at up to 5% above the amount, keeps the nearest (a
  current one before an older one), and works it out at the amount with the one formula,
  labelled as an estimate from the checked amount, like any amount between checked ones.

**D145. Apple's privacy rules, checked before submission** (Angad, 2026-10-08: "check that
all the apple conditions are met with the privacy policy and everything"). Already met: the
privacy policy in App Store Connect and in the app, in-app account deletion, Sign in with
Apple beside Google, purpose strings for the camera and photos, no tracking, and a privacy
manifest assembled at build time from every library's own. Two gaps, fixed:
- **Third-party AI (guideline 5.1.2(i)):** Apple wants personal data sent to a third-party
  AI disclosed and permitted first. The covered receipt text (sometimes the covered photo)
  can reach Groq's model when the rules miss a figure (D98), and the app never said so. Now
  the scan preview says it every time ("An AI may read it"), and the first send asks once,
  Allow or Not now; Not now sends nothing. The choice is kept on the phone. The privacy
  policy says the same.
- **Sign in with Apple on deletion:** Apple asks apps to revoke a person's Sign in with Apple
  grant when they delete their account. Deleting an Apple account now opens Apple's sheet
  for a one-time code; delete-account swaps it for a token and revokes it through Apple's
  REST API, then deletes the account. Backing out of the sheet cancels; a failed or
  unconfigured revocation never blocks the deletion. No Apple token is stored. Needs a Sign
  in with Apple key from the developer account and four `APPLE_*` secrets, set by Angad.
- The App Store privacy answers (`docs/store/listing.md`) gained the phone number kept while
  WhatsApp is linked, the email on a route request, and the random install ID.

**D146. RemitBridge Labs is incorporated; claims go to it alone** (Angad, 2026-10-08: he has
the certificate; "make sure they can only sue this legal entity and not me or my parents"). Washington accepted
the Articles (Meta lists the business as REMITBRIDGE LABS), so `INCORPORATED` is true: the
site, the footer and the app say "RemitBridge Labs, a Washington nonprofit corporation"
(never "charity", "501(c)(3)" or "tax-deductible" until the IRS approves, D141). The terms
now say:
- the agreement is with RemitBridge Labs and no one else, a legal entity separate from the
  people who found, run, work or volunteer for, contribute to or support it, and their
  families;
- claims relating to RemitBridge may be brought only against RemitBridge Labs, none of those
  people is personally liable, and each can enforce that clause as if they'd signed;
- liability is capped at $50, no indirect or consequential damages, one year to bring a
  claim, Washington courts only, and a severability clause.
The privacy policy names RemitBridge Labs as the one responsible for the data. These clauses
do what contract terms can: courts can still hold a person liable for their own acts, or
look past a corporation that isn't kept separate (its own bank account, records and
decisions). The lawyer reviewing the drafts should confirm them. Two things that make the
separation real are outside this repo: the app is still published from an individual Apple
account in Angad's dad's name, and the code, name and domain are still owned by Angad
personally (OWNERSHIP.md). The store listing now says to publish only after the Apple account
is converted to an organization (which needs a D-U-N-S number).


**D147. The app's site takes the website's look, on white** (Angad, 2026-10-09: "make all
the website on app.remitbridge.org much more aesthetic as well. Stick with the consistent
color scheme"). The landing page leaves the dark ink of D59 for white, matching the
website's /app page, which he had just asked to be white: the glow is a faint green, the
phone frame stays dark, the TrueCost figure loses its amber (one green, no third accent),
and the closing section sits on the website's mint. Every page gets the website's sticky
white header with the bridge mark and links to Support, Privacy, Terms and the website's
/app page, and the website's dark ink footer. Privacy, terms and support become a white
sheet on a mint band, with green-dot lists and ruled section breaks. Light only, like the
website; the old dark-mode tokens are gone.

**D160. The document pages get a layout, and a green hero** (numbered D148 when written; renumbered, as another D148 landed the same day) (Angad, 2026-10-09: "make the
UI for support, Terms and privacy policy better", then "I don't like the minty background,
just stick with the green"). `docLayout()` in `site/build.mjs` lays out any page with
`<main class="wrap">` at build time, so the HTML stays a plain run of headings to edit and
nothing needs script: the title and date sit in a green hero (the green the header used to
be), each h2 gets an id and a number, a contents list built from the h2s sits beside the
sheet on wide screens and marks the section being read, and privacy's "In short" becomes a
summary card. The fonts load all five weights the website loads (400 to 800), with its
heading rule and no synthesised bold.

**D147. WhatsApp gets a tab; Account moves to the top right; Android gets its own tab bar**
(Angad, 2026-10-09, after his first look at the Android build: the bot is "a major feature",
and the stock Android bar "just doesn't have that feel"). Android's bottom bar holds five tabs
at most, so of three options he chose to move Account out of it: the tabs are Scan, Compare,
WhatsApp, Tools, Learn, and Account is a round button at the top right of every tab (the
name's first letter when signed in), opening Account as a pushed screen with its own back
button. The WhatsApp tab says what the bot does and that it needs no app, opens the chat,
lists the bot's commands, links a chat to an account, and says "coming soon" to everyone
until `app_settings.whatsapp_live`. iPhone keeps the system tab bar; Android draws its own
(flat, hairline on top, no Material pill, the colour easing between tabs), chosen over
restyling the stock one. The bot's replies now say "the WhatsApp tab > Link WhatsApp".
- Same day, found on Android: every icon was a bare SF Symbol name, which draws nothing on
  Android, so Android had no checkmarks, arrows or back buttons (the likely cause of Learn
  looking "very weird"). `components/icon.tsx` maps each SF name to its Material Symbol,
  with a test that fails when an icon has no Android match.

**D148. Rate alerts are push notifications only; a linked WhatsApp keeps no number** (Angad,
2026-10-09: "lets configure rate alerts to only be push notifications"). A WhatsApp alert is a
message RemitBridge starts, which Meta charges for and which needs a payment method and an
approved template; replies to people who write to the bot are free. So the alert screen no
longer offers "Tell me by WhatsApp", and the bot's LINK no longer seals the number: it was kept
only so those alerts could reach the person (D139), and with nothing to send there's no reason
to hold it. A linked chat is now just the keyed hash tied to an account, for SAVE. The
WhatsApp tab, the link note, the privacy policy and the App Store answers say so. The D139
sending code stays in place, unused, if WhatsApp alerts ever come back; any number sealed
before today should be cleared with one SQL line (Angad's to run). Supersedes D139.

**D149. A savings counter on the Scan tab, kept on the phone** (Angad, 2026-10-09: "a savings
counter in the app (the total of 'what you could have kept' across all scans)"). Each
confirmed scan adds its "could have kept" (D119) to a running total, shown at the top of Scan
in the same mint box as the receipt result's figure: the total, and how many receipts it
covers; if every receipt was already the cheapest we had, it says that instead. It's kept
in the app's local storage, one entry per receipt (never counted twice; deleting the receipt
takes it out), because scanned receipts carry no account or device ID on the server, and a
server-side total would need one. US dollars only, which is every route's sending currency
today. The privacy policy says the total stays on the phone. It doesn't follow a person to a
new phone or across reinstalls; an account-backed total would need receipts tied to accounts,
which the privacy policy rules out for now.

**D150. RemitBridge Labs gets an EIN and bylaws, not a bank account or 501(c)(3)** (Angad,
2026-10-10: "we are not doing bank account and 501c3, we only need bylaws and ein"). The EIN
(through the IRS online application, with his dad as responsible party) and the bylaws (with a
first board consent) go ahead; a bank account and the Form 1023-EZ application don't, for
now. What follows from that, recorded so it isn't forgotten:
- The wording rule stays as it is: never "charity", "501(c)(3)" or "tax-deductible" (D141).
- RemitBridge's costs stay on family cards. That weakens the money separation D146 relies
  on, so each cost's receipt should be kept and, ideally, the board consent should say the
  family pays them on the corporation's behalf.
- Without tax exemption, the corporation likely files a federal corporate return each year
  even with no income; an accountant should confirm before spring 2027.
- If he changes his mind on 501(c)(3), filing within 27 months of 2026-10-08 keeps the
  exemption reaching back to the start.
`docs/nonprofit-setup.md` marks the two as not doing.
Later the same day the EIN was put off too (Angad: "lets not set it up for now"), after
asking why it's needed: nothing in front of us needs one (neither store, Meta or D&B asks),
and it mainly matters for a bank account, 501(c)(3) or hiring. So only the bylaws go ahead
now; the EIN steps stay in `docs/nonprofit-setup.md` for when something asks for it. The
corporation's documents are kept in the RemitBridge Google Drive, folder "RemitBridge Labs"
(set up 2026-10-10).


**D161. The landing page matches the website's /app page** (first written as D149; renumbered for the same reason) (Angad, 2026-10-10: "update the
app.remitbridge.org page to look like this as well"). Same hero (two tilted phones: Rate
history behind, TrueCost in front), the same five story steps in the same order and words
(Tools, Fair rate, TrueCost, Rate history, Scam check), then the same "Everything in the
app" section on green: a phone whose tab bar switches Scan, Compare, Tools, Learn and
Account, each feature a row, and all 21 features listed beside it under their tabs, every
pick moving the phone and the list together. It is static HTML with lucide's icons inlined
and a few lines of script, since this site has no framework. The two pages share no code (this
repo never imports from the website), so a feature added to the app goes into both lists.
The closing section is white.

**D151. Spanish, Tagalog and Vietnamese ship before a review, marked Draft; Hindi takes its
reviewer's fixes** (Angad, 2026-10-10: "for now, add tagalog, spanish and vietnamese. in the
account section specifically state that we need volunteers who can go through this"). This
changes D69 for those three: release builds now offer them, still labeled Draft in the
picker, with a note that no fluent speaker has checked them. Account's Language section gets
a "We need volunteers" row that emails hello@ (subject "Translation volunteer"). Hindi stays
in development builds, because its review is under way and its reviewer can finish it; once
she signs off, her name and date go in `languages.ts` as before. A volunteer who reviews one
of the three is named there the same way, and the Draft label then goes. The risk accepted:
a draft could say something slightly wrong about money, so the numbers stay untranslated
(US format) and the "Something reads wrong? Tell us" row stays beside each.
Hindi fixes from Angad's mother's notes, the same day: सहेज (save) becomes सेव everywhere
(her request), and the lines she flagged are rewritten: Step {step} of {of}, What it
should be, Where do you send money?, Most to your family (it lacked "money"), Upfront fee,
Live, the account line, the glossary count and XP earned. Search (खोजें) and Sources (स्रोत)
were already spelled the standard way, so they're unchanged and noted back to her.
"Your comparisons, saved" was removed from the app on 2026-10-07.
Later the same day Angad moved Hindi to the store versions too ("move all of these to the
full build, not just the dev build"): all five languages ship, every one but English marked
Draft until its reviewer signs.

**D152. Learn's path, redrawn** (Angad, 2026-10-10: "the UI of the learn tab just isnt
aethetically pleasing enough. make it better"). Kept: the Duolingo-style path climbing from
module 1 at the bottom (D107, D111), the chunky nodes and Continue. Changed:
- Nodes alternate left and right, each with its label card beside it on the open side, so
  every row uses the full width. Before, the labels sat under the nodes in one column down
  the middle, and the gentle swing (kept narrow after Angad found a wide swing off-centre on
  2026-10-01) made the path read as a straight line.
- Each card shows "Module N", the name, a small progress bar and the count. A started
  module's card gets a green left edge.
- The trail is solid green where you've walked it and dotted beyond. Modules not yet
  started sit back a little, and the one you're up to has a soft pulse (still when the phone
  asks for less motion).
- The solid mint mountain is replaced with a sky that deepens to mint, soft clouds, a faint
  far ridge and the same hills at the foot. A flag at the top marks the finish.
- The header's three rows (count, bar, streak) become one: a percent ring with the count and
  the streak beside it.
- Library opens with the newest full post as a card with its cover, above "All posts".
It was checked in a web render of the app at phone size, in light and dark. The simulator
wouldn't boot on this Mac, so the check on a real phone is still Angad's.

**D153. The receipt result leads with two answers** (Angad, 2026-10-11: "after scanning a
reciept, there's too much text to digest and nobody who is using the app will be able to
digest these words. think about the audience and fix this"; "add a go back or option to
scan another reciept"). The result opens with:
- what the transfer cost, marked low (at or under the UN's 3%), about average (up to the
  world's 6.36%) or high;
- what could have been saved, and with whom.
Then Compare this route today and Scan another receipt. The six detailed sections, with
every source, limit and the delete button, sit behind "Show the details". Every step after
the first has a back arrow to the start. The audience is people sending money home, often
in a second language, who want the answer more than the method.

**D154. Fewer words everywhere** (Angad, 2026-10-11: "there's just too much text and too
many warnings everywhere. Reduce the amount of text everywhere on the app."). 154 strings
were shortened in all five languages, keeping each fact and dropping its explanation.
- Source lines still name the source and the day, as CLAUDE.md requires, in a parenthesis
  instead of a sentence.
- "What this does not tell you" stays on every tool, collapsed as before, with shorter
  items.
- New copy follows the same bar: one fact per line. If a note needs explaining, it goes
  behind details or into the limits list.
The Hindi rows are marked CHANGED 2026-10-11 for the reviewer.

**D155. Android's tabs are pages in a native pager** (Angad, 2026-10-11: swiping between
tabs "way too choppy"). The swipe used to change tabs only after the finger lifted, so
nothing followed the finger. On Android the tabs now sit in react-native-pager-view, behind
a small custom navigator on expo-router's useNavigationBuilder (components/pager-tabs.tsx),
with the same bottom bar. Tabs load when shown or next to the one shown.
- iPhone keeps its native tab bar and the old swipe; a pager there would mean giving up
  the system bar Angad likes.
- The tab entrance animation is off on Android, since it hid the tabs beside you.
- Native code, so it needs new Android builds.

**D156. Redaction leaves the fine print alone** (Angad, 2026-10-11: "the thing that adds
the black box is covering up way too much. fix this by making the classification model
better and feeding more data"). The redaction is rules, not a trained model, so "better"
meant tighter rules, measured on more data.
- A label like "sender" or "customer" now counts only at the start of a line or before a
  colon, and never when what follows reads as a sentence.
- The lines hidden under a label must be short.
- Headings ("Customer Receipt") and toll-free or CFPB numbers stay readable.
- The synthetic receipts now carry Regulation E-style fine print, and
  `packages/receipt/scripts/redaction-report.ts` measures both sides. Personal words
  missed: 0. Words hidden that should show: 5.4% before, 2.1% after, the rest being the
  made-up people's own addresses.
- A screenshot of a real over-covered receipt is the next best data, if Angad can share
  one with the personal details already covered.

**D157. The receipt model thinks before it answers** (Angad, 2026-10-11: "if think increased
accuracy than why wouldnt we want to turn it on?", then set RECEIPT_REASONING=default himself).
Groq has one vision model, qwen/qwen3.8-27b, and RemitBridge stays on its free tier (no paid
plan), so the lever left was Qwen's thinking, off since D98 to save tokens. Two pairs of
benchmark runs (20 synthetic receipts each, free tier):
- precision (values read right) 94.3% on vs 93.2% off;
- about twice the time per receipt;
- accuracy swung with how many receipts the rate limit let through, so it doesn't measure
  thinking.
The gain is small and the cost is time and free-tier tokens. Angad turned it on, then the
same evening chose no thinking after all ("lets proceed with the no thining mode for groq"):
RECEIPT_REASONING is unset, so the default (none) applies. The setting stays for a later
measurement on real receipts.

**D158. Wise and Instarem on every route they price; everyone else by hand on a few** (Angad,
2026-10-11: "Now that we have instarem and WISE's API, let's go ahead and set that up for every
single route since we have infinite data for them, and for all the other ones we will just
focus on manual scraping w a few"). One request per currency to each, that day:
- Wise's Comparison API prices 22 more countries from USD, Instarem's quote endpoint 15 of
  them, and both mid-market sources cover all 22.
- They join the first four as Tier 2 routes, bank deposit only, which is all either quotes.
- Somalia, Eritrea, Cuba, Afghanistan and Venezuela had neither, and El Salvador and Ecuador
  use dollars, so they stay request-only.
- Wise goes from 20 requests a run to 130, about 11 minutes at its 5-second spacing; Instarem
  to 95. Still one request at a time, four runs a day.
- A route goes live on its own when its first checked price is published (a trigger on
  quotes). The first four, published since 2026-09-30, had never left "building" and are
  set live.
- The other providers stay hand-checked (D142) on a few routes, not all 26.

**D159. The WhatsApp bot gets a model, on Cloudflare's free tier** (Angad, 2026-10-11: "i want
to connect an AI model to the whatsapp bot too, but not something from grok but still free",
then "yes lets set start setting everything up"; scope in `docs/whatsapp-ai-scope.md`).
- **Where it fits:** only messages the rule parser can't read go to the model. It sorts them
  into the parser's own commands (prices, a new country, a scam worry, a greeting), a
  question, a suggestion, or off topic.
- **Questions** are answered in a few sentences from our own notes: features, short
  answers, the glossary and the blog. Each answer goes out with one link.
- **The model never writes a price.** Its answers are refused if they carry a number the
  notes don't, a link, or too many words. Any failure falls back to the plain reply.
- **Suggestions** go to a `suggestions` table with no phone number, read in Account → Admin
  → Suggestions. A suggestion naming a country we don't cover becomes a route request, so
  it counts toward the next routes.
- **Defaults Claude picked:** suggestions in the app first, answers kept to RemitBridge and
  sending money (Meta's terms bar general-purpose assistants), links to the website until
  new builds can carry app links.
- **Model:** Cloudflare Workers AI's free allowance, because it states it doesn't train on
  what it's sent. Gemini's free tier does, and Groq was excluded at Angad's request.
  Qwen3 30B-A3B beat Gemma 4 26B on 150 labelled messages: about 97% of intents after the
  route-request rule, 39 of 40 questions answered, 0.6 s. Gemma mostly returned no text.
- **Limits:** 20 model calls a number and 400 a day, inside the free 10,000 neurons. The
  message text is all Cloudflare gets.
- The privacy policy says so (dated October 12). The bot's new Hindi lines wait for the
  same review as the rest of its Hindi.

**D160. The WhatsApp bot is an agent: the model decides, our backend supplies the data**
(Angad, 2026-10-12: "we dont need a parser ... it should just reply with our data while
answering questions in a natural way ... call our backend and get that ... everything else
should just be the ai making its own decisions and responding with its own natural text").
- **The model reads every message** and writes every reply in its own words. When it needs
  data or an action, it calls tools (packages/bot/src/agent.ts, a small JSON protocol of our
  own):
  - get_prices: the same published quotes, ranking and formula as Compare, every figure
    preformatted;
  - get_routes;
  - search_knowledge: the glossary, features, short answers and the blog;
  - request_route;
  - save_suggestion.
- **The model is gpt-oss-120b** on Cloudflare's free tier. Qwen3 now only runs the older
  understand step, which is kept for the test script.
- **The number rule still holds.** Every number in a reply must appear in a tool result,
  our basic notes or the person's own message, and links must be ours. One reply that
  breaks it goes back to the model with the stray numbers named; a second sends the person
  the plain bot's answer.
- **Still exact commands:** LINK, UNLINK, FORGET or STOP, HINDI or ENGLISH, SAVE …, and YES
  to a route the plain bot offered, where a misread would do harm. Receipt photos keep
  their pipeline.
- **The parser and templates stay only as the fallback** when the model is missing, fails
  its checks, or passes a cap: 25 conversations a number and 80 a day, about 100-120 free
  neurons each.
This replaces D159's parser-first routing. D159's knowledge, suggestions table, privacy text
and limits carry over.


**D162. Every page gets the website's pointer backdrop** (Angad, 2026-10-12: "add the cursor
background to the .app and also to the app page on the website"). The website's Backdrop,
rebuilt without React and injected by `site/build.mjs` into every page: the bridge mark
tiled at 6% behind everything, and a soft green light that follows the pointer. Green bands
(`data-band`: the landing's feature section, the document pages' hero) carry their own white
light, and the page light stands down inside one, so only one glows at a time. No light on
touch screens or under reduced motion. The landing's old fixed glows are hidden in its favour.

**D163. The WhatsApp agent falls back across free providers, and uses fewer tokens**
(written as D161, renumbered: D160 and D161 were already taken) (Angad, 2026-10-12: "lets go with what you suggested"). Cloudflare's free tier holds about
80 conversations a day, so each model call now tries, in order:
1. Cloudflare Workers AI, gpt-oss-120b, while the day's 80 have room;
2. Groq, `openai/gpt-oss-120b`;
3. Groq, `openai/gpt-oss-20b`;
4. the plain bot (parser and templates).
A provider that errors (a 429 at its daily limit, a timeout, an outage) is skipped for the
rest of that conversation. Groq's limits are per model, so the bot's two models never eat
into the receipt model's (Qwen3.8 27B) budget. Groq runs with `reasoning_effort: low`, and
the existing `GROQ_API_KEY` (Zero Data Retention on) serves both. Each answer records which
provider wrote it (`whatsapp_ai`, `provider`). The 25 a number a day still covers all
providers.
Tokens: the system prompt is about 30% shorter, and `get_prices` gives one line per provider
in place of repeated JSON keys, so a price conversation takes about 30% fewer tokens
(roughly 2,800 to 2,000). On Groq's 200,000 tokens a day per model, that is about 100
conversations on each.
Not done: several Groq accounts to multiply the limits (against Groq's terms; Angad agreed).
Asked Groq for a nonprofit tier instead (email drafted for Angad).
The privacy policy now names Groq for WhatsApp messages too.

**D164. Legal audit, Angad's list of six** (Angad, 2026-10-12: "Audit my app for legal
exposure and fix every issue"). Each item checked against the code first:
- **Age check at account creation (COPPA): added.** The sign-in screen, the one way into
  every account (Apple, Google, email), first asks the year of birth, in the FTC's neutral
  form (no hint of the cutoff). 13 or under by year (a 13 could still be 12) is told
  accounts are for 13 and up; the phone keeps `rb.ageGate` = ok or blocked so going back
  can't change it. The year is never stored or sent. Comparing needs no account, so no one
  loses the app. Privacy and terms say so. 13, not 18, because both policies already said 13
  and RemitBridge moves no money.
- **Fonts: self-hosted.** The site loaded Plus Jakarta Sans from Google on every page; it
  now serves the five weights itself (`site/fonts/`, with the SIL Open Font License), from
  the app's own font package. The app already bundled its fonts. The built site makes no
  outside requests.
- **Session replay: none exists.** No replay, analytics or tracking SDK in the app or the
  site; metrics are first-party (D31) and record no screens or keystrokes. Nothing to turn off.
- **Unsubscribe and address in marketing email: no marketing email exists.** Besides sign-in
  codes, the only email is the one-time route launch notice the person asked for, after
  which their address is deleted, so there is no list to leave. It now signs with the legal
  name and prints `MAILING_ADDRESS` automatically once one is set (empty by Angad's choice,
  2026-10-03). If RemitBridge ever sends newsletters, they need both.
- **Renewal terms by a subscribe button: no subscriptions exist.** The app is free, with no
  in-app purchases.
- **DMCA designated agent: not registered; Angad's call.** Registration is an account on the
  Copyright Office's DMCA directory and a fee (Angad's to do), it publishes a postal address,
  and it protects only content users post publicly, which RemitBridge doesn't host. The terms
  gained a Copyright section saying how to send a notice to hello@.

**D163. The app site gets the basics a real site has** (Angad, 2026-10-12, from a checklist:
"add anything from this list that you can"). A 404 page (Vercel serves `404.html` with a
real 404 status), `robots.txt` and `sitemap.xml` generated from `PUBLIC_PATHS` in
`build.mjs`, a canonical link and Open Graph and Twitter tags on every page read from that
page's own title and description, a 1200 by 630 share image in the website's style, and the
apple-touch icon and `favicon.ico`. Not done, on purpose: a cookie banner (the site sets no
cookies; the partner page keeps a random ID in local storage for one first-party count),
web analytics (needs turning on in Vercel's dashboard first), and a mailing address (Angad's
choice, 2026-10-03).

**D165. The landing page uses the real screenshots, and the app's real tabs** (Angad,
2026-10-12: "a lot of the screenshots have been taken so go ahead and check them"). The
story now runs eight real screens (Scan, Compare, a quote, Rate alerts, Fair rate, Yearly
cost, Learn, Scam check), and the hero shows Scan and Compare. The feature phone's bar
matches the app (Scan, Compare, WhatsApp, Tools, Learn; Account behind the avatar), with a
WhatsApp group from the app's own copy, and picking a feature that has a screenshot shows
it in the phone. The observatory screenshot ("0 shared receipts") is left out: an empty
state reads as an unused feature. Same change on the website's /app page.

**D166. Wise breaks a tie between the two mid-market rate sources** (Angad, 2026-10-12:
"Add a third source"). Mexico published no prices from Oct 9 and India none from Oct 12,
because Frankfurter (the central bank's once-a-weekday fixing) and open.er-api drifted more
than 0.5% apart while the peso and the rupee moved. The rule stays strict: when the two
disagree, the engine asks Wise's comparison API, which marks its own quote as the mid-market
rate and prices it live, for that one pair. If Wise agrees within 0.5% with exactly one of
the two, that source is used and all three rates are kept as checks; if it agrees with
neither, isn't available, or stops calling its rate mid-market (a markup above zero), the
pair is held as before. Pairs that agree never touch Wise, so it sees a few requests a run
at most, within the use Wise approved (D91). Loosening the limit to 1.5% was the other
option and was turned down: it would let a bigger gap into published total costs.

**D167. ChatGPT takes over the hand price checks from Claude, under D142's limit** (Angad,
2026-10-12: "describe all the workflow we have for scraping data manually ... have it add
onto that and take that task over from you"). The whole workflow is written up as a prompt
in `docs/outreach/chatgpt-price-checks.md`: the rules, one check step by step, how to read fee-on-top
prices and first-transfer deals, the arithmetic check, the allowed values, the SQL Angad runs
in the Supabase SQL editor, what the engine does with each row (6-hour load window, the
Manual prices workflow, the four outcomes), freshness (24 hours current, 7 days as Older
prices), a running log, and what to build on (more routes, a rotation, change checks, faster
rounds). D142's limit carries over unchanged: Angad does every navigation and click on a
provider's site, and ChatGPT works only from his screenshots, never in agent mode or by
browsing those sites. Prices still enter only as manual observations through the same gate.
Claude steps back from routine rounds and helps only when rows are quarantined or rejected
without a clear reason, or when the format has to change.

**D168. Google Play shows the organization's registered address** (Angad, 2026-10-12: "Keep
the home address"). Google Play lists an organization developer's address on its store page,
and it must match D&B's record for the D-U-N-S number, which is the Sammamish address Angad
gave D&B. Asked whether to switch to a registered-agent or mailbox address first, Angad chose
to keep it: faster and free. The app site still shows no mailing address (2026-10-03); only
the Play listing will.

**D169. A newsletter people opt into, from the app** (Angad, 2026-10-12: "add a newsletter
feature", choosing a newsletter for users over an internal digest). Off by default; a switch
under Account turns it on for a signed-in account, and it goes to the address that account
already signs in with, so nothing new is collected (`newsletter_subscribers` keeps the user,
the date, the app language and a random unsubscribe token; nobody can read the table from the
app). Admins write an issue in plain text on Account, Admin, Write a newsletter, send a test
to themselves, then send to everyone through the `send-newsletter` function (Resend, batches
of 100, each issue logged in `newsletter_issues`, a second full send within 10 minutes
refused). Every issue ends with why it came, a one-tap unsubscribe link (the site's
`/unsubscribe` page, which POSTs to `newsletter-unsubscribe`; a GET only redirects, so link
scanners remove nobody), List-Unsubscribe headers for Gmail and Apple Mail's own button, and
the legal name, postal address and email. Defaults picked on Angad's behalf: **a full send is
refused until `MAILING_ADDRESS` in `site/site.config.json` is set**, because CAN-SPAM asks for
a postal address in commercial email and a newsletter can count as that, while the config
says never a home address (so a PO box or mailbox service, or Angad's explicit choice
otherwise); no open or click tracking; English issues for now, with the language kept for
later. Resend's free plan sends 100 emails a day, which caps an issue at 100 people until
that changes. Sign in with Apple's "Hide My Email" addresses only receive mail once
remitbridgelabs.org is registered with Apple's private email relay. The privacy policy and
both stores' privacy answers now name the newsletter.

*Changed the same day (Angad: "a newsletter isn't meant to be for advertising, its just
updates and its ONLY opt in in settings and during onboarding"):* the postal-address block on
full sends is gone, since the newsletter is opted-in updates rather than advertising; an
address still prints in every issue once `MAILING_ADDRESS` is set. Onboarding's sign-in step
gains an "Email me updates now and then" switch, off by default, applied only once the
sign-in succeeds and dropped on "Not now".

**D170. Hindi ships as reviewed** (Angad, 2026-10-12: "my mom approved everything, drop the
label"). Angad's mother read every row of `docs/translation-review/hi.md`, the bot's Hindi,
the glossary and the six newsletter rows, and approved them; Angad relayed that in writing
the same day. `languages.ts` now records her as the reviewer with that date, so D69's rule is
met and Hindi loses the Draft label and leaves the "We need volunteers" list. The app doesn't
show reviewers' names, so none is needed on screen. Spanish, Tagalog and Vietnamese stay
drafts under D151. New Hindi strings from here on go into `hi.md` as NEW rows for her to read.

**D171. Compare is the first tab again, and the app opens on it; Scan is second** (Angad,
2026-10-12: "Make compare the main tab and scan the 2nd tab"). Reverses D101's order. The
route files swap: Compare is `(tabs)/index.tsx` (`/`) and Scan is `(tabs)/scan.tsx`
(`/scan`), so everything that lands on `/` (the app's launch, a partner link, the sign-in
callback, leaving sign-in) now lands on Compare, and every link that opened Compare
(`openCompare`, saved comparisons, the Learn module's tool link) uses `/`. The tab bar reads
Compare · Scan · WhatsApp · Tools · Learn on both platforms, and swiping follows that order.
The "Hi, [name]" greeting (D114) stays on Scan's band, where it was built.

**D172. Learn's lessons become six game modes** (Angad, 2026-10-12: "add game-modes or
something else cool that makes learning actually engaging"; he approved all six from
ChatGPT's proposal). Built by ChatGPT (Codex) from `docs/outreach/chatgpt-learn-games.md`,
reviewed and finished by Claude. Logic is pure in `lib/learn-games.ts`, the shared pieces in
`components/learn-lesson.tsx`, the screen in `app/lesson/[id].tsx`.
- **Match pairs:** up to three words and their meanings, matched by taps. A wrong pair stays
  on the board; getting it later earns the retry XP.
- **Quick fire:** true or false, does this meaning fit the word. The timer is opt-in, counts
  up only, pauses on feedback and in the background, and changes nothing about the score.
- **Spot the hidden cost** (Cost module): two labelled-fictional USD to MXN transfers;
  which leaves the family more. Worked out with `computeTransferCost`, so the arithmetic
  matches the rest of the app; ranked by amount received.
- **Read the receipt** (Basics and Cost): a fictional receipt in a provider's own wording
  ("Service charge", "FX rate applied", "Payout amount"), and the question uses ours (fee,
  exchange rate, amount received). Claude changed this in review: the first version labelled
  each line with the very word the question asked for, which gave the answer away.
- **Spot the warning sign** (Safety): four scenarios, including "Not enough information"
  for an ID check that proves nothing either way.
- **Final round:** every word in the module, in both recall formats, plus the module's
  applied questions.
The module screen lists its modes; the path names the recommended one, which rotates as
words are learned and becomes the final round once the module is done. Words count as learned
only when answered in a word game; applied questions earn XP without marking unrelated words.
Wrong answers still shake and grey, never red (D136). Library opens with post 1 under "Start
here" instead of the newest post, which was a technical one. Also restored in review:
`lesson_started` and `lesson_finished` events, which the rewrite had dropped, now with the
mode. Checked on Angad's phone before merging.

*Redesigned the same day* (Angad, after playing it: "too much text and jargon. Nobody would
actually want to do this. Think about duolingo"). Every question now works like Duolingo's:
one big prompt of a few words, chunky answer tiles, a Check button, and a sheet that slides up
green ("Nice!") or grey ("Not quite.") with one line and Continue. Match boards clear pair by
pair with no button between pairs. New words get the module's drawing and one sentence.
"Who sends more?" shows only each side's fee and rate, and reveals what arrives after Check;
in some puzzles the zero-fee side wins and in others it loses. "Spot the scam" is a chat
message and three choices (red flag, looks fine, can't tell) instead of four phrases. The
finish screen bounces in with counting stats. Gone: the timer, "Show the details", the mode
label over every question, the fictional-amount sentence (a small "Example" tag stays), and
the mode names under the path's cards. The module screen offers the games as icon tiles.
**D173. A receipt can include its fee in the amount sent** (Angad, 2026-10-12: the scanner
"simply needs to be better... It's simply not transcribing well enough right now OR the
calculation based formula is wrong"). Checked first: the shared formula's 56 test cases and
the engine's 107 tests pass, and the rule-based reader got every field right on all 60
synthetic receipts (99.7%) and on the sample receipt photo through OCR. The gap found:
everything assumed the fee sits on top of "amount sent". Some receipts take it out instead
("Amount $200.00, fee $5.00, total $200.00", and $195 is converted). Those failed both
consistency checks, so a correctly read value was flagged as a misread, and the cost counted
the fee twice. `packages/receipt/src/fee-included.ts` now decides from the receipt itself:
a total equal to the amount means the fee was inside it; with no total, whichever reading the
amount received fits. The cost, the checks and the WhatsApp reply all use it. Fee-on-top
receipts are unchanged. The next step is real receipts: the app's failures need the photos or
the misread values, added to `benchmark/receipts/` as test cases.

**D174. Rows the phone's OCR splits are put back together, and doubtful values go to the
model** (Angad, 2026-10-12: "basically nothing is found... I need to type everything out
manually... it might make sense to switch to a better model"). The cause wasn't the model.
ML Kit reads a receipt in blocks by layout, so a row like "Transfer fee ...... $5.00" came
back as two lines, label and value, and the value's box often starts a pixel above its
label's. Sorted by top edge, each value landed before its label and paired with the row
above: a test receipt read as amount sent $4.99, fee $504.99, total 1, rate 8,600. The checks
then failed everything and the person typed it all. The benchmark never saw it because its
synthetic receipts go through tesseract, which keeps rows whole. Now `joinRows` (ocr.ts)
joins lines that share most of their height and sit side by side, in the app's `fromMlKit`
and again in `readReceipt`, so scans from builds already installed are fixed once
`scan-receipt` is redeployed. Second: values the rules read confidently but that fail the
received or total check are now doubted and sent to the model with the photo, where before a
confident wrong value stood and the model was never asked. On the model itself: Groq's only
vision model is the one already in use (Qwen 3.8 27B, D98), so there's nothing better on the
free tier there; revisit once real receipts show what's still missed.

**D175. Remmy, an assistant inside the app that can act in it** (Angad, 2026-10-12: "a
little chatbot that can do everything that whatsapp bot does within the app itself... make
sure it can also be 'agentic' by taking actions within the app... a hovering icon in
remitbridge's style"). Remmy runs the WhatsApp agent (D160) on the same free models (D163),
through a new `remmy` Edge Function. The function and the WhatsApp one now share
`supabase/functions/_shared/agent.ts` for the model chain and the data tools, so both
surfaces answer the same way. Remmy also has four app tools: open Compare on a route, open
a screen, start a lesson, and offer a save. They don't act on the server. Each adds an
action to the reply, and the app shows it as a card, with an Open, Start or Save button.
When the person asked to go somewhere, the card opens it after a short pause. Actions are
checked against one list (`mobile/src/lib/remmy-actions.ts`) on both sides, so a model can
only name screens, routes and lessons that exist. A save always waits for a tap, and nothing
Remmy does moves money, changes a setting or contacts a provider. The prompt has Remmy's own
persona, and the conversation's last 8 turns go along so a follow-up makes sense. Their
numbers count as sources for the stray-number check. Nothing of the conversation is stored:
it lives in the app's memory until the app closes or the person starts a new chat. Metrics
record only which tools ran. Limits (D140): 40 messages a day per install and 200 per
network address, and the same daily model budget as WhatsApp. Past a limit, Remmy says it's
resting, and a plain "500 to India" still gets its Compare card. Before the first message
the app asks once, with Allow / Not now, as the receipt scanner does (Apple 5.1.2(i)), and
the chat says it uses an AI model. The button is a green speech bubble with the bridge mark
as a brow, hovering above the tab bar on every tab. It opens Remmy as a sheet.

**D176. Remmy's actions no longer depend on the model, it has a burst limit, and its
composer follows the keyboard** (Angad, 2026-10-13: "agentic stuff only works with the
prompt designed. I need the harness to work regardless of what the prompt is, may it be
'Open user settings'... enable rate limiting... the chatbox doesnt move at all"). One table
in `mobile/src/lib/remmy-actions.ts` names every screen the way people say it, in the five
app languages ("user settings", "profile", "log out", "privacy policy", "ajustes",
"settings kholo"). A short plain request ("open user settings", "where's the glossary", or
just "settings") is matched there and opened by the function without a model call. Price
questions still go to the model, so Compare opens on the route. Any screen name the model
uses goes through the same table. A name that fits nothing gets the real list back to choose
from. If the model answers a clear "take me to..." without acting, the table adds the card.
When no model can answer, a screen named in the message still comes back as a card to tap.
Remmy can now open sign-in and, in the browser, the privacy policy, terms and support. A
test table of 24 everyday phrasings, and four that must still reach the model, keeps this
honest. Limits: 8 messages a minute per install on top of the daily ones, with its own "slow
down" reply; the app also drops a second send within 1.5 seconds and caps a message at 500
characters. The composer now rides on Reanimated's live keyboard height. A
KeyboardAvoidingView measured from the window misplaced it in the iPhone sheet and did
nothing on Android, which draws edge to edge. Dragging the thread dismisses the keyboard,
and the thread scrolls to the end when the keyboard opens. The terms gain an "AI answers"
section: replies can be wrong, so check figures in Compare; what Remmy can and can't do; and
don't type passwords, codes or account numbers. The privacy policy says a plain screen
request never reaches a model, that the app asks before the first message, and what not to
type.

D176, live check the same day: screen requests worked on the first deploy, but every Mexico
price question failed. The reason: $300 to Mexico is estimated from the $200 check, so
amounts have cents ("MXN 5,457.84"); the model rounds them to 5,458, and the number check
threw out the reply. Rounding a checked figure (to one decimal or a whole number) now passes;
a different figure still doesn't. gpt-oss also once answered with its plan in plain text
("We need to call open_compare."). Plain text that names a tool, or opens with "we need to",
"let's call" or "the user is asking", is now sent back once for a proper answer. Two more
fixes: a price question always gets its Compare card, even when the model only talks; and a
failed answer says "Try asking another way" instead of "I'm taking a short break".


D176, later the same day, from the failure causes Angad read in `remmy_limited`: no figures
were refused, so the number check wasn't to blame. Four fixes, all in the shared agent code
(WhatsApp has them too):
- `readTurn` walks balanced JSON objects, because gpt-oss sometimes wrote a tool call and a
  guessed reply in one turn. An unreadable turn is sent back once.
- Groq's 400 `tool_use_failed` carries the model's text as `failed_generation`, and that is
  now used as the answer.
- gpt-oss spent the 700-token cap reasoning and returned nothing, so the cap is now 1500. It
  isn't higher because Groq's free tier may count the cap against 8,000 tokens a minute.
- Each provider's error goes into `props.causes`.

Since the free models still miss some turns, every Compare card Remmy shows now carries the
top three checked prices (the same quotes, ranking and formula as Compare). A price question
shows real figures even when the model's text doesn't come through.


**D177. Reviewed manual prices can enter the engine for seven days from observation**
(Angad, 2026-10-14: "this data can last a total of 7 days so this is fine").
The former six-hour intake rule is seven days, matching the existing manual-price display
window. Original observation timestamps remain unchanged, and Compare retains its stale
and older-price labels. The import-time cross-checked reference is used for cost calculation,
so its source remains recorded separately from the original provider observation. All other
publish checks remain active. Collection CSV outcomes alone do not publish a price: missing
methods, missing rates and payout currencies that differ from the app route stay held.
Regular terms reconstructed from observed regular rates retain promotional page evidence
in the archive without being incorrectly labelled first-transfer prices. Recipient pickup
charges were excluded from this collection by Angad; the archived blank and exclusion are
retained, and arithmetic compares the payout before recipient pickup charges.


**D178. Compare offers bank-account-funded prices only** (Angad, 2026-10-14,
clarified "I meant bank-account funding only"). Remove the payment-method selector and
show the existing bank-account label as plain text. Keep filtering actual quote
payment_method values; never relabel debit-card or credit-card quotes as bank-funded.
Receipt analysis and manual cost calculators still describe the transfer actually entered.


**D179. Eligible manual prices share the regular ranking; collection time is in details**
(Angad, 2026-10-14). Remove the Older prices section and rank all eligible standard
quotes by amount received. The highest standard payout is labelled RemitBridge choice,
including when there is only one result. First-transfer offers remain labelled separately.
Compare cards omit collection time and stale labels; opening a quote shows its original
collection date/time and source. Existing seven-day manual expiry and publish checks remain.


**D180. Update disclosures and publication readiness for the actual Remmy feature set**
(Angad, 2026-10-14). Privacy, terms, support and store drafts must reflect chat history,
third-party AI, operational identifiers, diagnostics, separate suggestions/reports, games,
newsletter and current Compare behavior. Add an in-app AI-reply report with confirmation,
using the existing private suggestions inbox, without storing prompt/history or attached
account/install identifiers in reports. Limits still use the installation ID in transit.
Version the corrected Remmy consent so prior users see it again. Make agent price tools
match bank-funded eligible Compare prices. Keep deployment/build/account/legal/security
and real-device gates explicit rather than claiming publication readiness from source alone.


**D181. Hand prices up to seven days old keep competing for RemitBridge choice**
(Angad, 2026-10-17: "For prices > 48 hours don't change anything. Only change if it is more
than 7 days"). Claude's review found a five-day-old hand price ranked as RemitBridge choice
for $500 to India, above a price checked that morning. Angad keeps D179 as it is: an
eligible hand price ranks with the live ones until it is seven days old, and then leaves.
No code change: the `compare_quotes` view already drops manual prices past seven days, and
Compare, Remmy and WhatsApp all read it. Each quote's details still show when it was checked.


**D182. Remmy and WhatsApp don't say when prices were checked** (Angad, 2026-10-17: "We
dont need to tell them when prices have been collected honestly. We will update them
manually every 7 days on our backend, but even for the remmy stuff no need to say that").
Hand prices are refreshed on the backend every seven days and leave at seven days (D181).
Remmy's Compare card no longer shows "Checked 5d ago", and its replies no longer say
"today's" prices, which wasn't true of hand prices. The shared agent's price tool stops
passing the check time to the model, so the AI can't mention it either, and WhatsApp's plain
price reply drops "Prices checked X ago". The quote detail screen still shows each price's
source and check time one tap away, as the store listing and reviewer notes describe;
this overrides the "every figure names when it was checked" rule only for Remmy and WhatsApp.


**D183. Compare cards: amount, dollar cost, and the estimate label** (Angad, 2026-10-17:
"keep it with the fixes you just proposed"). Each Compare card shows the amount received,
then "arrives · $X cost", and "Estimated from the $Y check" when the typed amount sits
between checked amounts. The % cost, the delivery time and the breakdown bar move to the
quote's details. An earlier uncommitted edit had dropped the estimate label and said
"Arrived", which read like a finished transfer; both are fixed. It reuses existing strings,
so no translation changes.


**D184. A password sign-in for App Review only** (Angad, 2026-10-17: "option B honestly",
and "dont start the build until I tell you"). Google Play and Apple ask for sign-in details
their reviewers can use, and reviewers can't create accounts or receive email codes.
RemitBridge refuses every password sign-in (D135). Now the token hook allows a password only
for an account listed in `private.review_accounts`, a table only the database owner can fill;
everyone else is still refused (local checks cover both). In the app, typing
review@remitbridgelabs.org on the email screen swaps the code step for a password field.
Angad creates the account in the Supabase dashboard with a password of his own and types it
into the store consoles himself; Claude never sees it. Saying nothing is restricted would
not have been true, since saving and alerts need an account. Needs the migration pushed and
a new build, which waits for Angad's go-ahead.
Live 2026-10-17: Angad ran the migration in the SQL editor and created the account. The
first sign-in was still refused because the project had switched row-level security on
for the new table, hiding it from Supabase Auth; a read policy for `supabase_auth_admin`
only fixed it, and the review account's password sign-in then returned a token.


**D185. The app fills the iPad screen** (Angad, 2026-10-17: "why doesnt it cover the full
iPad screen? it should cover the whole thing"). `supportsTablet` is now true, with
`requireFullScreen` so the portrait-only app passes App Store validation without
supporting every orientation and Split View. On wide screens a `useGutter` hook keeps content in a
640-point column centered on the screen while the green bands and backgrounds reach both
edges; phones are unchanged (the gutter is the old padding there). Remmy stays a sheet,
which iPadOS already draws as a centered card. Seen in the web render at 834 points wide.
It needs the next build to take effect, and App Store Connect will then ask for 13-inch
iPad screenshots.


**D186. Onboarding asks its questions first and ends on sign-up** (Angad, 2026-10-17:
"have the sign-up at the end and move all the questions to the beginning"). The order is
now Welcome (with the language), route, "About you" (year of birth and the newsletter
switch), why it matters, then sign-up with only the account buttons and "Not now". The age
check works as before: neutral, only pass or block is kept, never the year. "Not now" on
About you skips the questions, and the sign-up step then asks the year before any account
button, as it always did. The newsletter switch moved off the sign-up step, so "I already
have an account" no longer shows it (Account still has it).


**D187. Tablets turn freely; phones stay upright** (Angad, 2026-10-17: "lets support
landscape properly"). The app now declares every orientation, because Android 16 (API 36,
which the app targets) ignores a portrait lock on tablets anyway, and Play's large-screen
guidance expects rotation. At startup `lib/orientation.ts` locks anything narrower than
600 points on its short side back to portrait, so phones don't change. With every
orientation declared, D185's `requireFullScreen` came out again, so iPads also get Split
View; the centered column handles narrow windows. Remmy, which fills the screen on an
Android tablet, measures its own width for the same column. Checked in the web render at
1280 by 800. Play's tablet screenshots (8 at 7 inches, portrait 1080 by 1920, and 8 at
10 inches, landscape 2560 by 1440) are in the Desktop upload folder.


**D188. An account agrees to the terms and privacy policy, read inside the app** (Angad,
2026-10-17: "after they create an account, add a page that asks them to accept ToS and
Privacy Policy and implements them into the app itself"). Both documents now open inside
the app, from Account, Remmy, WhatsApp and the new step, generated from site/terms.html
and site/privacy.html by `site/legal-for-app.mjs`; the site build fails if the app's copy
falls behind, so the two never say different things. The text stays English, with a
note in other languages, until a translation is reviewed. Any signed-in account that
hasn't agreed to the current versions sees only the consent step: both documents, an
unticked switch, "Accept and continue", or "Sign out instead" (the app keeps working
without an account). The agreement is stored on the account (`user_metadata.legal_accepted`,
the version and time); a new date on either document asks everyone again. No migration.


**D189. A public licenses page, and three privacy disclosures** (Angad's legal checklist,
2026-10-17: "make sure that everything thats needed here is actually here"). Of the 20
points, 17 were already met. Three gaps were closed: the privacy policy now says this site
sets no cookies and that partner links keep a random ID to count visits, that an account
keeps which terms version it accepted and when (D188), and that Google's ML Kit reads
receipts on the phone and may send Google basic device data. A new page,
app.remitbridgelabs.org/licenses, generated by `site/licenses-page.mjs` from the app's
shipped dependencies, credits the fonts, flags and icons and lists every open-source
package with its license (linked from Account and the site footer). "The cheapest" on a
receipt now says "the cheapest we found". Full list: `docs/store/legal-checklist-2026-10-17.md`.


**D190. The app offers only what has prices** (Angad, 2026-10-18: "Apple and Google want the
full app, so get rid of features we dont have data for. Add them to a future updates list.
This includes UPI for India and every other corridor/route we dont have data for"). Compare,
onboarding and Ask for a route now read which routes and ways of receiving have published,
bank-funded prices (`mobile/src/lib/availability.ts`, from `compare_quotes`, kept on the
phone between launches) and offer only those. So Uganda (built, nothing published, D166)
and the countries with no route are gone from Compare's pickers, and UPI, mobile wallet,
debit card and home delivery are gone everywhere (`routes.ts` lists bank deposit, plus cash
pickup on the four Tier 1 routes; Remmy's route list reads the same prices). A route or
method comes back by itself once a price publishes, with no app update. Cash pickup shows
wherever hand prices exist, so it comes and goes with each round. With one way of
receiving, Compare names it instead of drawing a one-option switch. Add a price keeps every
method, since a hand price is how a new one starts. The 13 summary-only blog posts and their
empty series are hidden too, and "Coming soon" is gone from the pickers. Onboarding's
"Somewhere else?" line now points to Account, Route board. Everything held back:
`docs/future-updates.md`.

**D191. Learn progress follows the account** (Angad, 2026-10-18: "my learn tab reset
completely because i uninstalled and reinstalled, make sure thats something linked to the
account and backend, not the device"). New table `learn_progress`, one row per account
(terms learned, XP, streak, last lesson day, lessons), owner only by RLS, deleted with the
account, writes rate-limited. On sign-in the phone's and the account's progress are merged
(every term from either, the larger counts, the streak from the later day) and both get the
result; while signed in, each change is written a moment later (`mobile/src/lib/learn-sync.ts`).
If the read fails, nothing is written, so a phone can't overwrite the account. Signed out,
progress stays on the phone, as before. The privacy policy says so (dated October 18, which
asks accounts to accept the terms again, D188). Migration
`20261018000000_learn_progress.sql`, for Angad to run in the SQL editor.

**D192. The repo keeps only the app and its store material** (Angad, 2026-10-18: "clean up
the entire repo, delete all files related to CAC and only keep the stuff related to app
store and google store. Delete any other unnecessary files too"). Deleted: `docs/cac/`, the
CAC gap report and CAC to-dos, and `docs/AI_USAGE.md` (written for CAC's AI disclosure;
Angad chose to drop it). Also deleted: `CHATGPT_HANDOFF.md`, `research/world-bank-rpw/`,
`site/screens/` (the website's screenshots), the superseded build notes for Oct 16 and the
first two Oct 18 rounds, and the finished Learn-games ChatGPT brief. Kept: `benchmark/`
(CI runs the receipt benchmark on it), `docs/roadmap-2.0.md` (Angad's choice), the open
ChatGPT research and price-check briefs, and every store document. Earlier entries here and
in HANDOFF.md still name some deleted files; git history has them.

**D193. Rates weekly, fees monthly** (Angad, 2026-10-18: "collecting all exchange rate
differences every week, but collecting all the fees only every month since fees almost never
change"). A hand price can now be built from this week's verified rate plus the newest fee
checked for the same provider, route, typed amount, receiving and payment method, and
promotional-or-regular basis, as long as that fee was checked in the last 31 days
(`MANUAL_FEE_MAX_AGE_S`). The rate still counts for 7 days (D177). The amount received is
(send amount minus fee) times the new rate, the arithmetic every earlier full quote met; the
quote is dated by its rate, and the fee's own date, source and screenshot stay in the
archived evidence. Nothing is guessed: a rate whose screen didn't show the payment method,
or with no matching fee, is held. `engine/scripts/combine_weekly_rates.py` does the pairing.
First round, 2026-10-18: 486 rows; 159 paired (Ria 64, MoneyGram 50, Western Union 24,
WorldRemit 21) and 327 held (184 with no payment or delivery method, including every Xoom,
Xe and Remitly rate; 80 skipped checks; 37 with no matching fee; 16 payout-currency
mismatches; 8 USD payouts; the 2 Ria Uganda changes awaiting Angad). Local dry run: 153
published, 6 quarantined by the range check (MoneyGram Ethiopia and Nigeria, WorldRemit
Nigeria beat mid-market). Compare shows only the rate's date for now; showing the fee's
date too needs an app update.
Same day, Angad: "Xoom and Xe show the same rate whatever the payment method, so pair their
rates with the bank-account fees and publish them." A blank payment method from those two
providers is now the bank-account rate (`SAME_RATE_ANY_FUNDING`), recorded as such in the
evidence; everyone else's blank stays held. That added Xoom 50 and Xe 48: 257 paired, 229 held
(36 Xoom with no matching fee, mostly cash pickup). Dry run: 249 published, 8 quarantined
(the 6 above plus Xe Ethiopia, 10% above mid-market).
Then Angad, on the two Ria Uganda rates up 2.45%: "ria is fine". `combine_weekly_rates.py
--confirmed ria/us-ug` treats a confirmed change like any verified rate and notes who
confirmed it; both pair (259 in all). The dry run published them, but the production run an hour later
held all of Uganda: USD/UGX sources then disagreed by 0.59% (D166), so they wait for a rerun.

2026-10-25, Angad, on the 34 weekly rates that moved over 2% since 2026-10-18: "publish everything".
`--confirmed` for MoneyGram, Remitly, Ria, Xe and Xoom to Egypt; MoneyGram, Ria, Xe and Xoom to
Uganda; Ria and Western Union to Mexico; Xe to the Philippines. 248 rates now pair (28 more);
Remitly Egypt and Xoom cash pickup to Egypt still have no fee on file. The publish gate still
decides: the dry run published 202 and quarantined 10 (the 4 Ethiopia range failures, plus
Ria Mexico and Xe Philippines, whose total cost moved over 2 points from their recent median),
and held 36 on DOP and NGN source disagreement. A confirmation never overrides the gate.
