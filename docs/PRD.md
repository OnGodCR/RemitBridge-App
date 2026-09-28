> **Source:** RemitBridge PRD v0.4, copied from the published artifact
> (https://claude.ai/artifact/GZEdqgodmhLqt2JUnrvgbV) and converted to Markdown on 2026-09-28.
>
> This file is the product intent, kept as written. It is not edited to match later decisions.
> Where [`DECISIONS.md`](../DECISIONS.md) disagrees with it, `DECISIONS.md` wins.
> If a new PRD version comes out, replace this file and note the version in `DECISIONS.md`.

# RemitBridge — Product Requirements Document

**Owner:** Angad Kochar · **Status:** Draft v0.4 · **Last updated:** September 28, 2026

**What changed in v0.4:** new Section 14 on design and brand consistency with remitbridgelabs.org; migration table (5.7) filled in with the site's existing tools; overlapping roadmap items merged into existing tools.

**v0.3:** full corridor list with rollout tiers and a public corridor-request system (Section 6); the scraping engine is rebuilt as the core system of the product (Section 9).

**v0.2:** scraping became the primary data source, existing RemitBridge tools move into the app (5.7), WhatsApp bot promoted to MVP (5.8), post-MVP ideas kept as a phased roadmap.

---

## 1. Why this exists

Migrant workers send money home every month, and the true cost of each transfer is hidden in two places: the upfront fee and the exchange-rate markup buried inside the rate. Most senders compare only the fee, which is exactly the number providers compete on while quietly widening the FX margin. The UN's Sustainable Development Goal 10.c target is to bring average remittance costs below 3%; the global average has sat well above that for years.

RemitBridge Systems Lab consolidates into one product: a free, transparent comparison engine that shows the **total cost** of a transfer (fee + FX markup) across banks, credit unions, and money transfer operators (MTOs), available on the web and over WhatsApp, with research built from the data it collects.

### The end goal, in one sentence

Measurably reduce what families in a few specific corridors pay to send money home, and publish what we learn.

### What "success" looks like in 12 months

Real, verifiable numbers rather than page views: active users, transfers compared, estimated dollars saved, and at least one partner organization using RemitBridge with its own community.

---

## 2. Positioning and competitors

Existing players include commercial comparison sites (Monito, CompareRemit), provider-run comparisons (Wise publishes fee comparisons against banks), and the World Bank's Remittance Prices Worldwide database, which surveys prices quarterly across hundreds of corridors.

**Where RemitBridge is different:**

| Gap in existing tools | RemitBridge's answer |
|---|---|
| Commercial sites earn affiliate commissions, which can bias rankings | No affiliate links. Ranking is purely by amount received. Methodology is public. |
| World Bank data is authoritative but quarterly | Automated, near-daily data for focus corridors, benchmarked against World Bank figures |
| Tools assume English fluency, a laptop, and financial literacy | WhatsApp-first access, multilingual (starting with Hindi), plain-language FX explanations |
| No link to community organizations | Built to be embedded and used by credit unions, immigrant resource centers, and cultural associations |

**Scope decision:** launch deep on 4 corridors, then expand in tiers to the full list in Section 6, with user requests setting the order. The scraping engine makes adding corridors cheap once provider adapters exist, since most providers serve many corridors from the same quote flow.

---

## 3. Users

**Primary: the sender.** An immigrant worker in the US sending $200–$1,000 home monthly. Often on a phone, frequently already on WhatsApp, sometimes more comfortable in a language other than English, and cares about one number: how much arrives on the other end.

**Secondary: the partner organization.** A credit union, immigrant resource center, consulate outreach program, or cultural association that wants to point its members to a trustworthy, non-commercial tool.

**Tertiary: the researcher/journalist.** Someone who wants clean, current price data for a corridor.

---

## 4. Goals and non-goals

**Goals**

1. Show the true total cost of a transfer across providers for supported corridors.
2. Explain the hidden FX markup in plain language.

3. Reach senders where they already are (WhatsApp).
4. Make the tool easy for partner organizations to adopt.

5. Produce original research from the collected data.
6. Consolidate all existing RemitBridge tools into one product.

**Non-goals**

- **Moving money.** RemitBridge never holds, sends, or touches funds. Doing so would require state money transmitter licensing. Information only.
- Covering every corridor globally.

- Earning affiliate revenue.

---

## 5. MVP features

### 5.1 Total-cost comparison

User enters send amount, sending country, receiving country, and delivery method (bank deposit, cash pickup, mobile wallet, UPI for India). Results are ranked by **amount received**, not by fee.

Each result shows: provider, upfront fee, exchange rate offered, mid-market rate, FX markup (%), total cost (%), amount recipient gets, estimated delivery speed, and a "checked X hours ago" timestamp.

### 5.2 "Where your money went" breakdown

A simple visual for each option splitting the sent amount into what arrived, the visible fee, and the hidden FX markup.

### 5.3 Provider database

Time-series quote records populated by the scraping engine (Section 9). See Section 8 for the data model.

### 5.4 Methodology page

Explains how total cost is calculated, how and how often data is collected, what the freshness timestamp means, and that there are no affiliate relationships. Includes a contact for providers who believe a listing is wrong.

### 5.5 Multilingual UI

English and Hindi at launch. String files structured so Spanish, Tagalog, Vietnamese, and others can be added without code changes.

### 5.6 Basic analytics

Privacy-respecting usage metrics: comparisons run (web and WhatsApp), corridors used, and estimated savings vs. the median option. No personal financial data collected.

### 5.7 Migration of existing RemitBridge tools

All current RemitBridge tools move into the app under one navigation and one design system, and the old standalone versions redirect to their new locations.

| Existing tool | Current location | Role after the app launches | Changes needed |
|---|---|---|---|
| **TrueCost** | /truecost | "Check a transfer you already made." Stays as the receipt checker | Add a "Compare what you'd get today" link that pre-fills Compare with the same route and amount; share the total-cost formula with Compare |
| **Fair rate** | /fair-rate | Stays; linked from quote detail | Show live provider rates next to the fair-rate reference |
| **Yearly cost** | /reckoner | Becomes the savings calculator from the roadmap | Pull live quotes so it can say "switching from X to Y saves ~$Z a year" |
| **Rate history** | /rate-history | Becomes "best time to send" | Add provider-level history from the scraped time series, not just the mid-market rate |
| **Scam check** | /scam-check | Stays; added to WhatsApp as `scam` | Share components and tokens; add Hindi |
| **Coming soon / RemitBench** | /coming-soon | Lists upcoming routes and features | Replace the static list with the live route board (6.7) |
| **Blog (30 posts) and research papers** | /blog, /papers | The Research section | Embed live-data charts where posts cite prices; each quarterly corridor report publishes here |
| **Glossary, Workshops, Fellowships** | /glossary, /workshops, /fellowships | Community layer | Glossary feeds the shared terminology file (14.4); workshop kit uses the app |

**Migration principles:** any tool that uses remittance prices should read from the live database instead of hardcoded or manual numbers; existing blog posts move into a **Research** section and get updated with live-data charts where relevant; every migrated tool gets a Hindi version.

### 5.8 WhatsApp bot (promoted to MVP)

The highest-leverage feature for actual senders. Built on the WhatsApp Business Platform (Meta's Cloud API directly, or via a provider such as Twilio).

**Core interaction:** the user texts something like `500 USD INR` or `send 500 to India` and gets back the top three options ranked by amount received, each with fee, markup, and delivery time, plus a link to the full comparison on the web.

**MVP commands**

| User sends | Bot replies with |
|---|---|
| `500 USD INR` / natural language | Top 3 options by amount received |
| `upi 500` / `cash 500` | Results filtered by delivery method |
| `why` | Plain-language explanation of the hidden FX markup, with the user's last quote as the example |
| `hindi` / `english` | Switches reply language |
| `help` | Command list |

**Design constraints**

- Replies must fit on one phone screen. No walls of text.
- Parse messy input ("500 dollars to india", "₹", "rs", "$500") with a forgiving parser, and fall back to a clarifying question rather than an error.

- The bot is a thin interface on the same comparison API the web app uses. No separate logic.
- Store only what's needed: a hashed phone number for rate limiting and language preference. No names, no amounts tied to identities.

- **Rate alerts are post-MVP** because proactive messages outside a user-started conversation require approved message templates, explicit opt-in, and carry per-message costs. Reactive replies are the cheap, simple case; start there.

---

## 6. Corridors

All corridors below send **from the United States**. Each row lists the delivery methods that matter most in that corridor, since the cheapest option often depends on how the money arrives. "Seattle-area community" marks corridors with sizable local diaspora communities. Confirm these with partner organizations before prioritizing.

### 6.1 Tier 1 — Launch (4 corridors)

| # | Receiving country | Currency | Key delivery methods | Seattle-area community | Why launch |
|---|---|---|---|---|---|
| 1 | India | INR | Bank deposit, UPI | ✓ | Founder corridor, Hindi UI, largest receiving country globally |
| 2 | Mexico | MXN | Bank deposit, cash pickup, debit card | ✓ | Largest US outbound corridor by volume |
| 3 | Philippines | PHP | Bank deposit, cash pickup, mobile wallet (GCash) | ✓ | Large corridor, strong mobile-wallet usage |
| 4 | Vietnam | VND | Bank deposit, cash pickup, home delivery | ✓ | Large local community, underserved by English-only tools |

### 6.2 Tier 2 — First expansion (10 corridors)

| # | Receiving country | Currency | Key delivery methods | Seattle-area community |
|---|---|---|---|---|
| 5 | China | CNY | Bank deposit, Alipay / WeChat | ✓ |
| 6 | Guatemala | GTQ | Bank deposit, cash pickup | |
| 7 | El Salvador | USD | Bank deposit, cash pickup | |
| 8 | Honduras | HNL | Bank deposit, cash pickup | |
| 9 | Dominican Republic | DOP | Bank deposit, cash pickup | |
| 10 | Ethiopia | ETB | Bank deposit, cash pickup | ✓ |
| 11 | Kenya | KES | Mobile money (M-Pesa), bank deposit | ✓ |
| 12 | Nigeria | NGN | Bank deposit | |
| 13 | Pakistan | PKR | Bank deposit, mobile wallet, cash pickup | |
| 14 | Bangladesh | BDT | Bank deposit, mobile wallet (bKash) | |

### 6.3 Tier 3 — Broad coverage (14 corridors)

| # | Receiving country | Currency | Key delivery methods | Seattle-area community |
|---|---|---|---|---|
| 15 | South Korea | KRW | Bank deposit | ✓ |
| 16 | Ukraine | UAH | Bank deposit, card | ✓ |
| 17 | Colombia | COP | Bank deposit, cash pickup | |
| 18 | Ecuador | USD | Bank deposit, cash pickup | |
| 19 | Peru | PEN | Bank deposit, cash pickup | |
| 20 | Nicaragua | NIO | Bank deposit, cash pickup | |
| 21 | Jamaica | JMD | Bank deposit, cash pickup | |
| 22 | Haiti | HTG | Cash pickup, mobile wallet | |
| 23 | Brazil | BRL | Bank deposit, PIX | |
| 24 | Ghana | GHS | Mobile money, bank deposit | |
| 25 | Nepal | NPR | Bank deposit, cash pickup | |
| 26 | Sri Lanka | LKR | Bank deposit | |
| 27 | Egypt | EGP | Bank deposit, cash pickup | |
| 28 | Uganda | UGX | Mobile money | |

### 6.4 Special-handling corridors

These matter to real communities, including some in Seattle, but can't be treated like normal corridors. Each needs its own approach before launch.

| Receiving country | Community | Complication | Approach |
|---|---|---|---|
| Somalia | ✓ | No formal banking system for most recipients; transfers run mostly through specialized operators with limited or no online calculators; US banks have cut ties with many of these operators | Manual/partner-sourced quotes; work with a Somali community organization; clearly labeled data source |
| Eritrea | ✓ | Very few formal providers | Manual quotes; partner-sourced |
| Cuba | | US sanctions rules restrict who can send and through which providers; availability changes with policy | Show only currently permitted providers; legal-status banner; re-check policy before each release |
| Afghanistan | ✓ | Sanctions and banking restrictions; few functioning channels | Research before listing; may be info-only (no rankings) |
| Venezuela | | Official and market exchange rates can diverge, so "mid-market rate" is ambiguous | Show both reference rates and explain the difference |

For any corridor with a history of gaps between official and market rates, the methodology page states which reference rate markup is calculated against.

### 6.5 Future sending countries (Phase 2 of coverage)

Once US coverage is solid, add other sending countries. Most major providers use the same calculator for all sending countries, so this mostly extends existing adapters.

| Sending country | Priority receiving corridors | Why |
|---|---|---|
| Canada | India, Philippines, China, Pakistan | Nearby diaspora links to Seattle area; same major providers |
| United Kingdom | India, Pakistan, Nigeria, Poland | Large, well-documented market |
| UAE | India, Pakistan, Philippines, Bangladesh | Among the largest remittance-sending countries in the world |
| Saudi Arabia | India, Pakistan, Bangladesh, Egypt | Very large outbound volumes |
| Australia | India, Philippines, China, Vietnam | Similar provider set |

### 6.6 Provider universe (per adapter, not per corridor)

Adapters are built per provider, and each adapter covers every corridor that provider serves. Initial provider list to verify for coverage and calculator access:

- **Digital MTOs / fintechs:** Remitly, Wise, Xoom (PayPal), WorldRemit, Sendwave, Xe, Western Union (online), MoneyGram (online), Ria
- **Corridor specialists:** Intermex and Viamericas (Latin America), Pangea (Latin America and Asia), Taptap Send (Africa and Asia)

- **Banks:** Chase, Bank of America, Wells Fargo, Citi (international wire pricing and FX)
- **Credit unions:** BECU and other Washington credit unions offering international transfers

The **coverage matrix** (providers × corridors) is tracked in the admin dashboard. A corridor launches when it has at least 5 providers with healthy adapters.

### 6.7 Corridor request system

Users can ask for corridors that aren't covered yet, and requests drive the expansion order.

**How users request**

- **Web:** A "Don't see your country?" button on the comparison page opens a short form with sending country, receiving country, and preferred delivery method. An optional email or WhatsApp opt-in notifies them when it launches.
- **WhatsApp:** `request nepal` or an unsupported query like `500 USD NPR` gets a reply saying the corridor isn't covered yet and offering to log a request.

- **Partners:** Partner organizations can submit requests on behalf of their community, weighted more heavily.

**Public corridor board** A public page lists every requested corridor with request count and status: *Requested → Under review → Building → Live* (or *Not feasible*, with a reason). This shows demand transparently and doubles as research data on where coverage gaps are.

**Prioritization score** Each requested corridor gets a score used to set build order:

| Factor | Weight | Notes |
|---|---|---|
| Number of unique requests | High | Deduplicated by hashed contact or IP |
| Partner organization request | High | A partner request signals real distribution |
| Existing adapter coverage | High | If 5+ current adapters already serve the corridor, it's nearly free to launch |
| Estimated corridor volume | Medium | From public remittance data |
| Special handling needed | Negative | Sanctions, informal channels, or multiple exchange rates add work |

**Launch notifications** When a corridor goes live, everyone who opted in gets a single notification (email or WhatsApp template message). Contact details are deleted after notification unless the user opts into ongoing alerts.

**Data stored per request:** sending country, receiving country, delivery method, source (web/WhatsApp/partner), timestamp, hashed contact (only if opted in).

---

## 7. Roadmap (post-MVP)

**Phase A — Sender value**

- **Savings calculator:** built into the existing Yearly cost tool (see 5.7).
- **WhatsApp rate alerts:** Opt-in notification when a corridor's best total cost beats a threshold.

- **Best time to send:** built into the existing Rate history tool, powered by the scraped time series.
- **Promo-rate honesty flag:** First-transfer promotional rates shown separately from standing rates.

- **Recipient-side view:** Which delivery methods work where in India (UPI, bank, cash pickup).

**Phase B — Partners**

- **Embeddable widget:** One line of code for a partner's website, with their branding.
- **Printable one-pagers:** Monthly multilingual "cheapest ways to send to India" flyer, auto-generated from the database.

- **Shareable WhatsApp link/QR code:** Partners post a QR code that opens a chat with the bot. Likely the easiest adoption path for community centers and places of worship.
- **Partner dashboard:** Aggregate, anonymous stats on how their community uses the tool.

- **Workshop kit:** Slides and a script for a 30-minute session on remittance costs.

**Phase C — Research and credibility**

- **Open dataset:** Publish cleaned price data (CSV) under an open license.
- **Quarterly corridor report:** Original analysis from the scraped time series, e.g., how FX markups differ between banks and digital MTOs, or how US → India costs compare with the SDG 3% target.

- **World Bank benchmark:** Validate scraped numbers against the World Bank survey to demonstrate accuracy.
- **Mystery-shopper study:** Volunteers compare in-person agent quotes in Seattle-area neighborhoods with scraped online prices.

**Phase D — Reach**

- **Short-form explainers:** 30-second videos showing the hidden markup with real, current numbers.
- **Case studies:** With permission, anonymized stories of families who switched providers.

---

## 8. Data model

**Provider**: id, name, type (bank / credit union / MTO / fintech), website, adapter_id, active flag, robots/terms notes

**Corridor**: id, send country, send currency, receive country, receive currency, tier, status (live / building / requested / not feasible), reference-rate note

**Provider-corridor coverage**: provider_id, corridor_id, supported delivery methods, supported payment methods, adapter health status, last valid quote at

**Quote**: provider_id, corridor_id, send amount, delivery method, payment method, fee, offered FX rate, mid-market rate at capture time, computed markup %, computed total cost %, amount received, delivery time, is_promotional, source (scraper / API / manual / partner), extraction strategy used, scrape_run_id, validation status, captured_at

**Mid-market rate**: currency pair, rate, source, timestamp (multiple sources stored for cross-checking)

**Scrape run**: id, adapter_id, adapter version, strategy used, started_at, finished_at, status (success / partial / failed / blocked), quotes captured, quotes rejected, error class, error message, raw response archive path

**Corridor request**: id, send country, receive country, delivery method, source, hashed contact (optional), created_at

Quotes are append-only time series. History powers "best time to send" and the research reports.

---

## 9. The scraping engine (core system)

**The scraping engine is the product.** Every comparison, WhatsApp reply, widget, flyer, and research report is only as good as the data it pulls. If the engine is slow, wrong, or down, RemitBridge is wrong. So the engine gets the most engineering attention, the most testing, and the strictest quality bar in the project. "Strong" here means four things: it **covers** every provider in every live corridor, it's **accurate** enough to publish, it **recovers** on its own when sites change, and it's **sustainable** so providers don't block it.

### 9.1 Design principles

1. **Never publish a number we can't verify.** A missing quote is better than a wrong one.
2. **Assume every site will break.** Sites redesign and change APIs without warning. The engine is built to detect breakage in minutes and degrade gracefully, not to hope sites stay the same.

3. **Isolate failures.** One provider breaking never affects another.
4. **Keep everything.** Every raw response is archived so any published number can be traced back and re-parsed.

5. **Be a good citizen.** Low, steady request volume. Getting blocked is the biggest threat to coverage, so conduct is a reliability feature, not just ethics.

### 9.2 Architecture

```
                ┌──────────────── Scheduler ────────────────┐
                │  per-provider schedules, jitter, priorities │
                └──────────────────────┬─────────────────────┘
                                       ▼
                             Job queue (Redis + worker pool)
                     per-domain concurrency limit = 1, rate limits
                                       ▼
        ┌─────────────────────── Provider adapter ───────────────────────┐
        │  Strategy 1: provider's calculator/quote JSON endpoint          │
        │  Strategy 2: headless browser (Playwright) on public calculator │
        │  Strategy 3: alternate public page (rates page, help center)    │
        │  Strategy 4: AI-assisted extraction (fallback, strict checks)   │
        │  Strategy 5: flag for manual collection                         │
        └──────────────────────────────┬─────────────────────────────────┘
                                       ▼
                 Raw archive (every response, compressed, timestamped)
                                       ▼
                          Normalizer → Quote schema
                                       ▼
          Validator: math checks → range checks → cross-source checks
                          → anomaly detection → quarantine or publish
                                       ▼
                    Postgres (quotes, runs, coverage matrix)
                                       ▼
        Comparison API → web app · WhatsApp bot · widget · flyers · reports
                                       ▲
       Monitoring: health dashboard · alerts · coverage matrix · SLOs
```

### 9.3 The adapter framework

Every adapter inherits from a shared base class so every provider behaves the same way to the rest of the system.

**Each adapter defines:**

- `corridors()` — which corridors, delivery methods, and payment methods it supports
- `strategies` — an ordered list of extraction strategies to try

- `fetch_quote(corridor, amount, delivery, payment)` — returns raw data
- `parse(raw)` — returns a normalized quote

- `health_check()` — one cheap known-good request to confirm the adapter still works
- Metadata: provider name, adapter version, robots.txt and terms notes, maintainer, last verified date

**The base class handles everything shared:** retries, backoff, rate limiting, timeouts, raw archiving, logging, metrics, error classification, and strategy fallback. Adapters contain only provider-specific logic, which keeps them short (typically under 150 lines) and lets a new contributor write one in an afternoon using the **Adapter Guide** (a docs page with a template, a checklist, and a worked example).

### 9.4 Multi-strategy extraction

Each adapter tries strategies in order and records which one succeeded.

| Strategy | When it's used | Strengths | Weaknesses |
|---|---|---|---|
| 1. Calculator JSON endpoint | Default whenever the site's calculator calls one | Fast, cheap, exact numbers, rarely breaks visually | Endpoints can change parameters or add tokens |
| 2. Headless browser | No usable endpoint, or endpoint requires page-generated tokens | Sees what a real user sees | Slower, heavier, breaks on redesigns |
| 3. Alternate public page | Primary calculator is down | Some providers publish rate tables or fee schedules | May be less granular |
| 4. AI-assisted extraction | Strategies 1–3 fail due to layout changes | Reads a page like a person would, survives redesigns | Must pass stricter validation; never the sole source for more than 48 hours |
| 5. Manual flag | Everything fails | Keeps a human in the loop | Slow |

**AI-assisted extraction** sends the rendered page text (or screenshot) to an LLM with a strict JSON schema for the quote. Output goes through the full validator plus an extra check: the extracted numbers must appear literally in the page source. Quotes from this strategy are tagged, and the adapter is automatically flagged for repair so this stays a bridge, not a crutch.

### 9.5 Reliability features

- **Retries with exponential backoff and jitter** for transient errors (timeouts, 5xx). No retries on 403/429; those go to the blocked-handling path.
- **Circuit breaker per provider:** after repeated failures, the adapter pauses and stops sending requests, then tries a single health check on a cooldown. This prevents hammering a broken or annoyed site.

- **Error classification:** every failure is tagged (network, timeout, parse error, schema drift, blocked, validation reject) so the dashboard shows *why* things break, not just that they did.
- **Idempotent jobs:** re-running a job never creates duplicate quotes.

- **Per-domain concurrency limit of 1** and a minimum delay between requests to the same site.
- **Schedule jitter** so requests don't land at identical times every run.

- **Graceful degradation:** if a provider has no fresh valid quote, it drops to "stale" display, then disappears from rankings after 48 hours. The rest of the comparison keeps working.

### 9.6 Change detection (catching breakage before it matters)

- **Schema drift detection:** each adapter stores a fingerprint of the response structure (JSON keys and types, or key page elements). If the fingerprint changes, the run is flagged even if parsing "succeeds," since a silent change is the most dangerous kind of break.
- **Health checks** run every hour against one known request per provider, separate from full scrape runs.

- **Canary runs:** after any adapter code change, it runs against live sites in a test mode before its quotes can be published.
- **Recorded fixtures:** each adapter has saved real responses used in automated tests. When a site changes, the new raw response becomes a new fixture, so the fix is tested against the exact thing that broke it.

- **AI-assisted repair suggestions:** when an adapter breaks, the old fixture, the new response, and the adapter code are sent to an LLM to draft a fix as a pull request. A human reviews and merges; nothing auto-deploys.

### 9.7 Accuracy and validation (the publish gate)

Every quote passes all of these before it's visible to users:

1. **Math check:** amount received = (send amount − fee) × offered rate, within rounding tolerance. Catches parser errors that grab the wrong number.
2. **Range checks:** offered rate below mid-market; markup between 0% and 15%; fee non-negative and plausible for the amount.

3. **Cross-source mid-market check:** mid-market rate is pulled from two or more FX sources; if they disagree beyond a threshold, the run is held.
4. **Tier consistency:** quotes across the amount grid for one provider should follow a sensible pattern (e.g., fees don't jump wildly between $200 and $500 without a known tier break).

5. **Anomaly detection:** a quote that moves more than a set threshold from the provider's recent history is quarantined for review instead of published.
6. **Promo detection:** keywords and pattern checks flag promotional first-transfer rates so they're labeled rather than ranked as standard.

**Human verification layer**

- **Weekly spot checks:** volunteers manually check a random sample of published quotes against live sites. Match rate is published on the methodology page as the accuracy figure.
- **User reports:** a "This price looks wrong" button on each result (and `wrong` on WhatsApp) flags the quote for review.

- **Quarterly benchmark** against the World Bank's Remittance Prices Worldwide data.

### 9.8 Coverage management

- **Coverage matrix:** providers × corridors grid in the admin dashboard, colored by health (fresh / stale / broken / unsupported). This is the single view of how complete the database is.
- **Launch rule:** a corridor goes live only with 5+ healthy providers.

- **Coverage SLO:** at least 90% of provider-corridor pairs in live corridors have a valid quote under 24 hours old.
- **New corridor pipeline:** when a requested corridor (Section 6.7) is approved, the system first checks which existing adapters already support it, then lists which new adapters are needed.

### 9.9 Monitoring and alerting

- **Health dashboard:** per-adapter last success, success rate over 7 days, strategy used, quotes captured vs. rejected, average run time.
- **Alerts** (Discord or email) when an adapter fails twice in a row, a circuit breaker trips, schema drift is detected, a corridor drops below the launch threshold, or the coverage SLO is missed.

- **Weekly engine report** auto-generated: coverage, accuracy, breakages, and repair times. Doubles as a great artifact for showing how rigorous the project is.

### 9.10 Engine SLOs

| Measure | Target |
|---|---|
| Scheduled runs completing successfully | 95%+ |
| Provider-corridor pairs with a fresh quote (under 24h) | 90%+ |
| Spot-check accuracy | 97%+ match |
| Time to detect a broken adapter | Under 2 hours |
| Time to repair a broken adapter | Under 72 hours |
| Wrong quotes reaching users (confirmed via reports or spot checks) | Under 1% |

### 9.11 Schedule

- Digital MTOs and fintechs: every 6 hours (rates move with markets)
- Banks and credit unions: daily

- Health checks: hourly
- Mid-market rates: fetched at the same moment as each run so markup uses a matching timestamp

- Amount grid per corridor: $100, $200, $500, $1,000, $2,000, times supported delivery and payment methods. Grid stays small because it multiplies request volume.

### 9.12 Scraper conduct

Blocking is the biggest threat to coverage, so these are reliability rules as much as ethics:

- Low, steady volume: one grid per provider per scheduled run, per-domain concurrency of 1, delays between requests.
- Users never trigger scraping. They query the database.

- Honest user agent with a contact email.
- Public pricing only. No logins, account creation, or CAPTCHA bypassing, and no rotating proxies to get around blocks.

- robots.txt and terms reviewed and noted in each adapter's metadata.
- If a provider blocks the scraper or asks us to stop, the adapter is paused, the request is logged, and we reach out about an official data feed. That provider moves to manual or partner-sourced quotes in the meantime.

- Where a provider offers an official API, switch to it.

### 9.13 Tech stack

- **Language:** Python
- **HTTP:** `httpx` (async) for endpoint strategies

- **Browser:** Playwright for browser strategies
- **Queue and workers:** Redis with RQ or Celery

- **Database:** Postgres (Supabase for hosting, auth, and an API)
- **Raw archive:** object storage (Supabase Storage or S3), compressed

- **Scheduling:** a small always-on worker (e.g., a cloud VM or Railway/Fly.io) rather than GitHub Actions, since the engine now needs queues, health checks, and circuit breakers
- **Testing:** pytest with recorded fixtures for every adapter, run in CI on every change

- **Monitoring:** structured logs plus a simple metrics dashboard (Grafana or a custom admin page)
- **FX sources:** two or more free mid-market rate APIs for cross-checking

---

## 10. Success metrics

| Metric | Target (6 months post-launch) |
|---|---|
| Unique users (web + WhatsApp) | 500+ |
| Comparisons run | 2,000+ |
| Share of comparisons via WhatsApp | Tracked (tests the WhatsApp-first hypothesis) |
| Estimated annual savings surfaced | Tracked and reported with a stated method |
| Partner organizations using the tool, QR code, or flyer | 2+ |
| Corridors live | All 4 Tier 1 + at least 5 Tier 2 |
| Providers with healthy adapters | 15+ |
| Quotes in database | 100,000+ |
| Engine SLOs (Section 9.10) | Met for 4 consecutive weeks |
| Corridor requests received | Tracked; top requests reviewed monthly |
| Original research pieces from own data | 2 |

Define "estimated savings" conservatively (best option vs. median option, not vs. the worst) so the number survives scrutiny.

---

## 11. Risks

| Risk | Mitigation |
|---|---|
| Provider sites change and break adapters | Multi-strategy extraction, schema drift detection, hourly health checks, fixture tests, AI-assisted repair PRs |
| Provider objects to scraping or blocks it | Conduct rules in 9.12; circuit breakers; stop on request; fall back to manual or official data |
| Bad data gets published | Six-step publish gate, quarantine, spot checks, user reports, raw archive |
| Scraping cost/infrastructure grows | Small amount grid, endpoint-first strategies, adapters shared across corridors |
| Special-handling corridors produce misleading data | Separate approach per corridor (6.4); legal-status banners; reference-rate notes |
| WhatsApp costs or policy changes | Keep MVP to user-initiated replies; bot is a thin layer over the API so the same logic can move to SMS or Telegram |
| Looking like a clone of Monito/Wise | Non-commercial, WhatsApp-first, multilingual, community-embedded |
| Privacy | No personal financial data; hashed phone numbers only |
| Regulatory creep | Never add a "send money" button or hold funds |

---

## 12. Milestones

| Phase | Timeframe | Deliverables |
|---|---|---|
| 0. Validate | 2 weeks | Talk to 10+ senders; confirm FX-markup awareness gap; inventory existing RemitBridge tools; verify provider coverage for Tier 1 |
| 1. Engine core | 5 weeks | Adapter framework + base class, queue and workers, normalizer, full publish gate, raw archive, fixture tests, health dashboard, 8 adapters covering Tier 1 |
| 2. Core app | 4 weeks | Comparison API, web comparison page, breakdown visual, methodology page, English + Hindi |
| 3. WhatsApp + migration | 3 weeks | WhatsApp bot MVP commands; existing tools migrated and redirected; corridor request form + public board |
| 3b. Engine hardening | 3 weeks | Schema drift detection, circuit breakers, AI-assisted extraction and repair, coverage matrix, SLO alerts, Adapter Guide |
| 3c. Tier 2 rollout | Ongoing | Add adapters and corridors in order of prioritization score |
| 4. Partners | Ongoing | Approach 5 organizations with WhatsApp QR code, widget, and flyer; land 1–2 |
| 5. Research | Quarterly | First corridor report from scraped time series; open dataset release |

---

## 13. Open questions

1. Canonical name (14.2), spelling convention (14.3), and whether Compare lives at /compare or a subdomain (14.1).
2. Which Seattle-area partners can help validate special-handling corridors (6.4)?

3. Meta Cloud API directly or Twilio for WhatsApp? (Direct is cheaper; Twilio is faster to set up.)
4. How is RemitBridge structured: independent project, club, or under a future nonprofit?

5. Who's on the adapter maintenance rotation, and who reviews AI-drafted repair PRs?

---

## 14. Design system and brand consistency

The comparison app, WhatsApp bot, partner widget, and flyers should feel like one product with remitbridgelabs.org, not a separate project bolted on. This section defines what "consistent" means and how to enforce it.

### 14.1 Where the app lives

**Recommendation:** inside the main site on the same domain (e.g., `remitbridgelabs.org/compare`) rather than a separate app subdomain. The site already has a Tools section, a footer navigation, and a methodology culture; the comparison engine should be the newest and most prominent tool, not a different website. One domain also consolidates search traffic and makes partner links simpler.

The homepage's primary call to action changes from "Try the calculator" to the live comparison, with TrueCost kept as the "check a transfer you already made" path.

### 14.2 Naming

The name currently appears in three forms: **RemitBridge Systems Lab** (site title and meta tags), **RemitBridge System Labs** (email address and other materials), and **RemitBridge** (logo and footer). Pick one canonical form before the app launches, since it will appear on the WhatsApp Business profile, partner flyers, and the open dataset license.

| Use | Form |
|---|---|
| Full name (first mention, legal, dataset license, WhatsApp profile description) | RemitBridge Systems Lab *(matches the site; confirm)* |
| Short name (logo, nav, WhatsApp display name, UI) | RemitBridge |
| Tool names | One word or short phrase, title case, no "RemitBridge" prefix: TrueCost, Fair rate, Rate history, Compare |

**Naming the comparison tool:** it should match the existing tool names' style (short, plain, describes the job). Candidates: **Compare**, **Best rate**, **Send smarter**. "Compare" is clearest and translates easily.

### 14.3 Voice and writing rules

The site already has a strong, distinctive voice. The app, bot, and flyers must match it. The rules below are drawn from how the site currently writes.

1. **Plain words, short sentences.** "The fee on the receipt is usually the small part." No jargon without an immediate explanation; link to the Glossary for anything technical.
2. **Human stakes over abstractions.** The site talks about money "meant for rent, school fees or a doctor." Results pages can do the same in small doses (e.g., "That's $38 more for your family this year").

3. **Name the source every time.** TrueCost names which FX source answered rather than crediting a fixed one. Every quote in the app shows where it came from and when it was checked.
4. **Say what the tool can't do.** Every existing tool has a "What this does not tell you" section. The comparison page gets one too (promo rates, agent-level charges, receiving-country taxes, rate movement since the last check).

5. **No hype, no sales language.** Never "Best deal!" or "Save big!" The app states facts: "Sends ₹41,210. Costs 1.8% in total."
6. **Calm about limitations.** The site's line "None of this is hedging" is the tone: limitations are part of the method, not an apology.

7. **Privacy stated plainly.** Mirror TrueCost's "Nothing is sent anywhere, and nothing is saved unless you choose to." The app and bot each get a one-line privacy statement in that style.
8. **One spelling convention.** The site currently uses British spellings ("itemised"). Decide once (British or American) and apply it to the app, bot, and flyers.

### 14.4 Shared terminology

The same concepts must use the same words across site, app, bot, and flyers, in every language. Maintain one terminology file that feeds both the UI strings and the Glossary page.

| Concept | Use | Avoid |
|---|---|---|
| Rate with no markup | Mid-market rate | Real rate, true rate, interbank rate |
| Provider's margin in the rate | Exchange-rate markup | Spread, hidden fee (except as a plain-language explainer) |
| Fee + markup + pickup charge, as % of amount sent | Total cost | True cost, real cost, all-in fee |
| What the recipient gets | Amount received | Payout, recipient amount |
| A company that sends money | Provider | MTO (except in research posts) |
| Country pair | Route (in the UI) · Corridor (in research and docs) | Mixing both in the UI |

**Formula consistency:** the comparison engine must compute total cost using exactly the TrueCost method (fee taken off first, markup applied to the converted amount, pickup charges converted at mid-market, the three summed). Put this in one shared function used by TrueCost, Compare, Yearly cost, the bot, and the research pipeline, so no two tools can ever disagree on the same transfer.

### 14.5 Visual foundations

**Design tokens, shared.** Extract the current site's colors, type scale, spacing, radius, and shadows into a single tokens file (CSS custom properties, plus a JSON export). The site and the app both import it; nothing hardcodes a hex value. Changing a brand color then updates every surface at once.

**Color**

- **Brand primary:** `#14705A` (the site's existing theme color, a deep green). Used for primary actions, links, the logo, and positive values.
- **Semantic colors for money** (used identically in every chart and breakdown on site and app):

| Meaning | Color role | Notes |
|---|---|---|
| Amount received | Brand green | The part that reaches family |
| Upfront fee | Neutral grey | Visible, expected cost |
| Exchange-rate markup | Warm amber | The hidden cost; draws the eye without looking like an error |
| Pickup / other charges | Muted amber or hatched amber | Secondary hidden cost |
| 3% UN target line | Dashed neutral line | Appears on every cost chart, matching the homepage |
| Stale / unverified data | Desaturated grey + label | Never color alone |

- Red is reserved for genuine errors and Scam check warnings, not for "expensive." A high-cost provider isn't doing something wrong in the UI's language; it's just more expensive.
- All pairings meet WCAG AA contrast, and every color-coded value also has a text label.

- Dark-mode variants for every token, defined alongside the light ones.

**Typography**

- Use the site's existing typefaces and scale via the shared tokens.
- **Devanagari:** add a matched Devanagari face (e.g., Noto Sans Devanagari) tuned to the Latin face's x-height and weight so Hindi pages don't look like a fallback. Repeat for each script as languages are added (Vietnamese diacritics, Amharic, etc.).

- **Numbers:** tabular (monospaced) figures for all amounts and rates so columns line up and values don't jitter when they update.
- **Currency formatting:** locale-aware (₹41,210 with Indian digit grouping like ₹1,00,000 in Hindi and Indian English contexts; $1,000.00 in US English), always with the currency symbol or code.

**Iconography and imagery**

- Keep the site's existing icon style; flags follow the TrueCost currency selector pattern.
- **Provider names as text, not logos.** Provider logos are trademarks and pull visual attention toward brands; plain names keep the ranking neutral and the page calm.

- No stock photos of smiling families. Charts and numbers are the imagery, as on the homepage.

### 14.6 Core components

Components built once in the shared system and used on both site and app:

| Component | Description | Used in |
|---|---|---|
| **Route picker** | From/to currency selector with flags, matching TrueCost | Compare, TrueCost, Rate history, Yearly cost |
| **Amount input** | Large, numeric keypad on mobile, currency code attached | All calculators |
| **Quote card** | Provider name, amount received (largest text), total cost %, fee, markup, speed, delivery method, freshness badge | Compare results, widget |
| **Cost breakdown bar** | Single horizontal bar split into received / fee / markup / pickup using semantic colors, with labels | Compare, TrueCost results, flyers, research charts |
| **Freshness badge** | "Checked 3 hours ago" · "Stale" · "Unverified" with source on tap | Every quote |
| **Target line** | Dashed 3% marker on any cost chart | Homepage, Compare, Rate history, reports |
| **"What this does not tell you" block** | Standard collapsible section with consistent heading | Every tool page |
| **Source line** | Small text naming the data source and date | Every figure |
| **Report-a-problem link** | "This price looks wrong" | Quote card |
| **Empty and error states** | Plain-language, never blame the user, always offer the next step (e.g., request a route) | All tools |

### 14.7 Key screens for the app

1. **Compare (home of the tool):** route picker, amount, delivery method, then results. On mobile, the first result is visible without scrolling after entering an amount.
2. **Results:** quote cards ranked by amount received. The top card shows "Most to your family" rather than "Best" or "Winner." A summary line at the top: "Sending $500 to India: recipients get between ₹40,100 and ₹41,620 depending on provider."

3. **Quote detail:** full cost breakdown bar, delivery and payment options, recent rate history for that provider, promo flags, source and check time.
4. **Route not covered:** explanation plus the request form and current request count for that route.

5. **Route board:** public status of requested and upcoming routes.
6. **Methodology and data:** how prices are gathered, engine accuracy figure from spot checks, update schedule, link to the open dataset.

7. **Partner embed:** the Compare tool in a compact frame with the partner's name and a small "by RemitBridge" line.

### 14.8 WhatsApp bot branding

- **Display name:** RemitBridge. **Profile picture:** the logo mark on brand green.
- **Profile description** in the site's voice, e.g., "Find out how much your family actually receives. Free, no ads, no affiliate deals. From RemitBridge Systems Lab."

- **Message style:** same terminology table, same number formatting, same calm tone. Bold only the amount received. Every result message ends with the check time and a link to the full comparison.
- **Example reply:**

```
Sending $500 to India (bank deposit)

1. Provider A: *₹41,620* arrives · 0.9% total cost · minutes
2. Provider B: *₹41,480* arrives · 1.2% · same day
3. Provider C: *₹41,150* arrives · 2.0% · 1–2 days

Prices checked 2 hours ago.
Full list: remitbridgelabs.org/compare/...
Reply WHY to see where the rest goes.
```

- Commands for existing tools: `check` walks through TrueCost for a past receipt; `scam` links to or runs Scam check.

### 14.9 Print, social, and partner materials

- **Monthly route flyers** (Phase B) use the same tokens, cost breakdown bar, and target line, auto-generated from the database, with a WhatsApp QR code in brand green.
- **Social cards and OG images** follow the existing `og-image.png` style; each route gets an auto-generated share image with its current cost range.

- **Partner co-branding rule:** the partner's name can appear at the top; RemitBridge's colors, formula, terminology, and "no affiliate deals" line never change in partner versions.
- **Workshop slides** use the same tokens and charts so a community member recognizes the tool after the session.

### 14.10 Accessibility and low-bandwidth use

- WCAG 2.1 AA as the minimum on every surface. Keep the site's skip-link and extend it to the app.
- Senders are often on older phones and slow connections. Compare results should be server-rendered so the core answer loads without heavy JavaScript; interactivity layers on top. This also partly addresses the site's current note that its tools need JavaScript to run.

- Tap targets at least 44px; amount inputs trigger the numeric keypad.
- Screen-reader labels spell out currency and percentages ("41,620 Indian rupees arrive, 0.9 percent total cost").

### 14.11 Enforcement

- **One design-system package** (tokens, components, terminology file, formula function) consumed by the site, the app, the flyer generator, and the bot's message formatter.
- **Brand checklist** in every pull request touching user-facing text or UI: tokens used (no hardcoded colors), terminology file used, source line present, "What this does not tell you" present on new tools, Hindi strings added.

- **Visual regression tests** on core components so an app change can't silently drift from the site.
- **Quarterly brand review:** walk every surface (site, app, bot, flyer, widget) side by side.

