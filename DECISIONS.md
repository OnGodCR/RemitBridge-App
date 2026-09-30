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
