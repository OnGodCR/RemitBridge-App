# RemitBridge App

A free, non-commercial tool that compares what it really costs to send money
from the US. It ranks providers by **amount received** and splits the total cost
into the upfront fee and the exchange-rate markup. The core is a scraping engine
that collects provider quotes. On top of it sit a **mobile app for the app
stores** (there is no web app; see D14), a WhatsApp bot, and research built from
the collected data.

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

## Talking to Angad

Start every reply with `hi, angad`.

Keep the open items below current. Don't repeat the list at the end of replies: Angad
asked on 2026-10-04 to stop ("dont regurgiate open items, just keep them in a .md file"),
until he asks for it again. Mention only what changed.

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

These are deferred on purpose, not forgotten. Update this list as things land. Grouped
by kind (Angad's request, 2026-10-01): set every feature up first, then test.

### Features to set up

- [ ] **WhatsApp: parked (D100).** The first real messages wait on Meta (D68, D94). Set up 2026-10-01: Meta app
      "RemitBridge" with a business portfolio (unverified), Meta's free test number
      +1 555 184 5383 (Phone number ID 1399186246604217) with Angad's phone as the one
      allowed recipient; all five `WHATSAPP_*` secrets plus `WHATSAPP_RECEIPTS=on`,
      `RECEIPT_INTAKE_SECRET` and `GITHUB_DISPATCH_TOKEN` in Supabase; `WHATSAPP_ACCESS_TOKEN`
      (system user `remitbridge-bot`, never expires) and `RECEIPT_INTAKE_SECRET` in GitHub
      Actions; webhook verified and subscribed to `messages`. Never change
      `WHATSAPP_HASH_SECRET` now, or every stored hash stops matching. **Blocked by Meta:**
      the first sends failed with error 131031 "Business Account locked"; Business Support
      Home shows the WhatsApp account (ID 1656013116119219) "Account Restricted, Duration:
      Permanent" until the business is verified (2026-10-01). Verification asks for a
      business's legal documents: RemitBridge Labs' Articles were filed 2026-10-02 (D141), so
      once Washington accepts them they can verify it, with hello@remitbridgelabs.org and the
      `facebook-domain-verification` tag (`META_DOMAIN_VERIFICATION`). Nothing else on our
      side needs to change once Meta lifts it. 2026-10-03: the Meta portfolio is renamed
      RemitBridge Labs; domain verification uses a DNS TXT record on `@` at GoDaddy
      (`facebook-domain-verification=...`, live), so the site's meta tag isn't needed.
      **remitbridgelabs.org is Verified in Meta (2026-10-04)**: the www entry was dropped
      (www is a CNAME and can't hold the record) and its old code removed from GoDaddy; keep
      the remaining code, which Meta re-checks. Portfolio email confirmed and two-factor
      required for everyone (Angad, 2026-10-04); his own Facebook account must have
      two-factor on to keep access. Left: Start verification with the accepted Articles
      (or an EIN letter).
- [ ] **Apple Developer Program ($99 a year), then the iPhone development build** (D73).
      Angad's dad holds it until Angad is 18 (D123): an individual account in his name (D134),
      enrolled and paid 2026-10-01; Apple can take up to 48 hours to process it. It must land
      by about Oct 10 for the CAC demo's scan. EAS is ready: account
      `ongodcr`, project @ongodcr/remitbridge linked, the two `EXPO_PUBLIC_SUPABASE_*`
      variables created for development. Left: `eas device:create`, Developer Mode,
      `eas build --profile development --platform ios`, all Angad's (Apple sign-in).
- [ ] **WhatsApp in the app (D138):** built 2026-10-02: link a chat to an account with a
      one-time code (no number stored), SAVE from WhatsApp into Saved, UNLINK, Chat on
      WhatsApp with the bot's number (development builds until `app_settings.whatsapp_live`).
      Migration pushed 2026-10-02 (smoke test 63/63). Left: try LINK from his phone; flip
      `whatsapp_live` once Meta lifts the restriction.
- [ ] **Rate alerts by WhatsApp (D139):** built 2026-10-02, the number kept encrypted only
      while linked. Migration pushed 2026-10-02. Left: create the `rate_alert` template from
      `docs/whatsapp-templates.md` in WhatsApp Manager (needs Angad signed in to Meta).
- [ ] **Universal links** (D48): the app side is in (the associated domain, the
      `p/[partner]` route, 2026-09-30). Left: the Team ID (paid membership) for
      `site/.well-known/apple-app-site-association`.
- [ ] **"What you could have kept" on the receipt result (D119):** built and `scan-receipt`
      deployed 2026-10-01, all tests pass. Left: seen for real once the iPhone build can scan. It
      grows more useful as prices pile up.
- [x] **Receipt parser extractors (D130):** Claude wrote all 13 at Angad's request; 47 of 47
      on the fixtures, 97.8% on 60 OCR'd synthetic receipts before the OCR fixes. The model
      now reads only what the rules miss or doubt. Done 2026-10-01. The CAC write-up must
      say the parser is AI-written (`docs/AI_USAGE.md`).
- [ ] **More prices** (D115). Wise's are live (D91, every 6 hours). Terms read in a browser
      2026-10-01 (`docs/MANUAL_RESEARCH.md`): Ria, MoneyGram, Xe, WorldRemit, Xoom, Remitly,
      Pangea, Intermex and Taptap Send forbid automation; Western Union's terms don't, but its
      prices sit behind bot protection. **Instarem is live** (D118): migration pushed by Angad,
      smoke test 55/55 with 9 providers, and the first Scrape run published 20 of 20; it
      tops Compare for $500 to India (2026-10-01). The World Bank survey's US rows are in
      `research/world-bank-rpw/` for research. Paysend is cleared but not built: its public pages show one
      amount and one price for several ways of receiving, so its numbers can't be verified yet;
      asked press@paysend.com for a feed on 2026-10-01 (`docs/outreach/permission-request.md`). The rest: Add a price, or their permission.
      **2026-10-04: 27 hand prices live** (Remitly, Western Union, MoneyGram, Xoom, WorldRemit,
      Ria, Xe to all four routes at $500; D142). They go stale after 24 hours, so they need a
      regular re-check (the sheet: `RemitBridge-prices-filled-2026-10-04.csv` in Angad's
      Downloads). Instarem showed as stale on 2026-10-04: check its Scrape runs.

- [ ] **RemitBridge Labs (D141):** built 2026-10-02: one config file (`site/site.config.json`)
      for the operator's public details, the site build, footer, Contact, new privacy policy
      and terms (drafts, pending legal review), Terms and © in the app, `LICENSE`,
      `OWNERSHIP.md`, `CONTRIBUTING.md`, research receipts kept 24 months. Left:
      - [x] `20261003010000_research_retention` run by Angad in the SQL editor, `scan-receipt`
        deployed, smoke test 67/67 (2026-10-03).
      - [x] `CONTACT_EMAIL` is hello@remitbridgelabs.org (2026-10-03): site, functions
        redeployed; the app with its next build, the engine on its next run.
        Forwarding set up 2026-10-03: ImprovMX (free; Angad's account, signed up with the
        RemitBridge Gmail), alias hello@ to remitbridgesystemlabs@gmail.com, plus ImprovMX's
        catch-all `*` (Angad to decide whether to keep it); GoDaddy DNS gained MX
        mx1.improvmx.com (10), mx2.improvmx.com (20) and TXT `v=spf1 include:spf.improvmx.com
        ~all`; ImprovMX shows the domain Active; Angad's test arrived (in Spam at first, marked
        not spam; the second went straight to the Inbox). Sending: Gmail "Send mail as" hello@
        through smtp.resend.com:587 (TLS) with a Resend key Angad created ("Gmail send-as
        hello", sending access, this domain only); replies go from the address a message was
        sent to. A reply from hello@ reached Angad's Inbox (Resend: Delivered; DKIM via
        resend._domainkey, DMARC p=quarantine already on the domain). ImprovMX's catch-all `*`
        alias deleted at Angad's go-ahead ("make sure everything else looks good"), so only
        hello@ forwards. Done 2026-10-03.
      - [x] The website (separate repo) shows hello@ (3cc1ba5) and is renamed to RemitBridge
        Labs (06c37cd), live 2026-10-03. Its `notify-message` function (only the header of
        contact-form notifications to Angad) wasn't deployed: the token Angad made lacked
        `edge_functions_write`; Angad chose to leave it and deleted the token (2026-10-03).
        It goes live with the website's next function deploy from an account with access.
      - `INCORPORATED` to true once Washington accepts the Articles (and `OWNERSHIP.md`'s
        "await acceptance" line); `META_DOMAIN_VERIFICATION` from Meta.
      - [x] No mailing address on the site (Angad, 2026-10-03): the Contact sections ask
        people to email for it. Charity registration also filed by Angad, under review;
        the wording rule holds until he says it's approved.
      - Legal review of `site/privacy.html` and `site/terms.html`; the written license of
        the name and domain to RemitBridge Labs; then the site's Hindi.
      - The DCO check, when the first outside contributor starts.

### Testing (once the features are set up)

- [ ] **Scan a real receipt** on the iPhone development build.
- [ ] **A blurry receipt on a real phone (D131):** the blur limits were calibrated on
      tesseract, not ML Kit; check that a shaky photo is turned back and a sharp one isn't.
- [ ] **Apple and Google sign-in** on a real iPhone (the simulator hides Apple).
- [ ] **Dropped first tap:** found and fixed 2026-10-01 (D136): Reanimated `entering`
      animations kept views from taking taps for a few seconds; all replaced. Confirm on a real phone.
- [ ] **WhatsApp:** text "500 to India", then send a receipt photo.
- [ ] **Launch email:** the first real send, when a requested route goes live.

### CAC submission (internal deadline Oct 23, official Oct 26)

Angad does this once the app itself is finished (D117).

- [ ] **Write-up and video:** Angad rewrites `docs/cac/submission.md` (Claude's draft,
      2026-10-01) in his own words, records the demo video (3 minutes at most), and submits.
- [ ] **Scanner live for the demo** (D72): all six phases on `main`, every migration live
      (52/52), the model on Groq. Left: the iPhone build and a real scan (above).

### Thank-yous and outreach (Angad sends)

- [ ] **Permission requests:** all 8 sent 2026-09-28; Wise said yes, the rest only
      auto-replies (Xoom's media desk, Xe ticket 26724746). Follow-ups sent 2026-10-04 to
      all seven (Angad's request); next nudge 2026-10-12 (calendar reminder set). Round 2
      (shorter email, from hello@) to six more on 2026-10-04: Viamericas, Instarem, Pangea,
      Félix Pago, Taptap Send, BOSS Money. Log replies in `docs/outreach/permission-request.md` (D52).
- [x] **Partner emails** (D50): all nine sent. Eight from the RemitBridge Gmail (Horn of
      Africa Services 2026-09-30, the other seven 2026-10-01); El Centro de la Raza through its
      web form by Angad, 2026-10-01. Log replies in `docs/outreach/partners.md`.
- [ ] **Translation reviewers** (D69): Angad's mother reviews Hindi (D117), from
      `docs/translation-review/hi.md` (840 lines, now with the glossary, D125). Hindi, Spanish, Tagalog and Vietnamese
      are Claude's drafts and show only in development builds until a fluent speaker reads
      each, agrees in writing, and is named with the date in `mobile/src/i18n/languages.ts`.
      Hindi first; the bot's Hindi (D68) needs the same read. **The review is under way in
      `hi.md` itself** (Angad marked "ENDED HERE" at `fairRate.yourTransfer`, 2026-10-03):
      never regenerate it with `scripts/review-sheet.ts`, which rewrites the whole file and
      would wipe the reviewer's column. Add new strings as rows by hand instead. The glossary is drafted in
      Hindi (D125); still English in Spanish, Tagalog and Vietnamese.

### Before launch

- [ ] **Security review (Angad):** read `docs/security-review.md`, every change from the
      security pass in plain words, and tick or comment on each (Angad hadn't seen it, 2026-10-01).
- [x] **Limits on AI spending (D140):** app: 10 scans a day per phone and per account, 100
      per address; WhatsApp: 10 photos and 100 messages a day per number; 200 model calls a
      day overall. Migration applied by Angad in the SQL editor (the CLI's connections were
      reset by his network), both functions deployed, smoke test 66/66. Done 2026-10-02.
- [ ] **Security (D135, `docs/SECURITY.md`):** the code and the live auth settings are done
      (2026-10-01). Left:
      - [x] Migration pushed by Angad, sign-in hook on, smoke test 58/58 (2026-10-02).
      - [x] SSL enforcement on (2026-10-02).
      - [x] **Exposed legacy JWT secret retired (D137):** everything moved to the newer keys,
        legacy keys disabled and the HS256 secret revoked by Angad; the old key now gets 401,
        smoke test 63/63, workflows pass on the new key. Done 2026-10-02.
      - Two-factor on every account that can reach data (Supabase, GitHub, Expo, the
        RemitBridge Gmail, Google Cloud, Vercel, GoDaddy, Resend, Groq, Meta), Angad's.

- [x] **Store listing drafted** (`docs/store/listing.md`), store build config tidied, and
      the public Supabase values set for preview and production builds (D123). Done 2026-10-01.
- [x] **Android push notifications set up (D127):** Firebase project `remitbridge`, its Android
      app wired in, and the FCM V1 key uploaded to EAS by Angad. Done 2026-10-01. A real
      Android notification waits on an Android build.
- [ ] **Native Google sign-in on Android (D129):** an Android OAuth client with the signing
      key's SHA-1, after the first Android build; iPhone is set up (2026-10-01).
- [ ] **Store screenshots from a development build** (no Expo Go dev button); also swap
      them into `site/screens/` (D59).
- [ ] **Google Play developer account (D143):** on hold for an organization account in
      RemitBridge Labs' name (Angad, 2026-10-04), not a personal one through his dad. Needs the
      accepted Articles and a D-U-N-S number. Organization accounts skip the personal-account
      rule of a 12-tester, 14-day closed test.
- [ ] **Stores publish as RemitBridge Labs (D141):** once incorporated, get a D-U-N-S number,
      then convert the Apple account to an Organization (Apple Developer Support) and create
      or convert a Google Play Organization account, so RemitBridge Labs shows as publisher.
- [ ] **Disk space and memory.** 12 GB free on 2026-09-30; native builds and real store
      screenshots need 15–20 GB. With 8 GB of RAM, the simulator takes 1–2 minutes to boot.

### Watching and later

- [ ] **Remittance tax: final IRS regulations.** Still proposed on 2026-10-01 (Notice
      2026-52 extended penalty relief). Watched automatically: the weekly "Remittance tax
      rules" workflow fails and emails Angad when a final rule appears (D110); then update
      the formula against the final text.
- [ ] **Bank connections or receipt scanning for past transfers.** Manual entry only (D30).
- [ ] **Rate alerts (D113): live 2026-10-01** (migration pushed by Angad, smoke test 55/55,
      the sender reads it). Left: a real push needs the iPhone development build (Expo Go
      and simulators get no token).

### Done

- [x] Thank-you to Simon Bruins at Wise sent (it also declines the affiliate program).
      Done 2026-10-01.
- [x] `host.exp.Exponent` removed from Supabase's Apple client IDs, live and in
      `supabase/config.toml` (D116). Done 2026-10-01.

- [x] `GITHUB_DISPATCH_TOKEN` in Supabase (fine-grained, RemitBridge-App only, Actions read
      and write), checked against GitHub before saving: receipt photos on WhatsApp can start
      their worker, and price entries are checked in minutes. Done 2026-10-01.

- [x] Launch emails: `notify-route-launch` deployed and `RESEND_API_KEY` set (sending
      access, remitbridgelabs.org), checked against Resend before saving (D67). Done 2026-10-01.
- [x] Receipt model on Groq's free tier (D98): Qwen3.8 27B replaces OpenRouter's Qwen3 VL
      32B (retiring 2026-10-09); `GROQ_API_KEY` in Supabase and GitHub Actions, Zero Data
      Retention on, `scan-receipt` deployed. Benchmark, 20 synthetic receipts, text only
      (run 36800320699): model 82.3% accuracy, 93.0% precision; the misses are mostly
      free-tier 429s, not misreadings. Done 2026-10-01.
- [x] The two receipt migrations pushed by Angad; smoke test 52/52. Done 2026-09-30.
- [x] All seven migrations on `main` pushed by Angad (route requests, metrics, WhatsApp,
      receipts, the Wise provider row); smoke test 48/48, and the route board loads in the
      app. Done 2026-09-30.
- [x] Wise adapter on its Comparison API (D91): 20 live quotes passed the gate on the first
      local run; Scrape schedule on. Google brand verified and published: the sign-in page
      now says "RemitBridge App". Done 2026-09-30.
- [x] Flags for the nine request-only countries, from flagcdn.com with Angad's yes.
      Every country has one now. Done 2026-09-30.
- [x] Accessibility pass (D70): AA contrast, the largest text sizes (checked in English,
      Hindi and Vietnamese), VoiceOver announcements and headings, 44pt targets, Bold
      Text, offline prices, no press-and-hold-only actions. Done 2026-09-30.
- [x] Every string in `mobile/src/i18n/`, with the reviewer gate, Hind for Hindi, and
      drafts in Hindi, Spanish, Tagalog and Vietnamese (D69). Done 2026-09-30.
- [x] Onboarding rebuilt from the website's own elements and checked in the simulator
      (D62); Tools, Learn and Account lists as the website's divided index (D63).
      Done 2026-09-29.
- [x] Quote detail, saved comparisons, and TrueCost's "compare what $X gets today" link
      (D66). Done 2026-09-29.
- [x] Route requests, the route board and "Ask for a route" (D64), with launch emails
      (D67). Built 2026-09-29; migrations live 2026-09-30.
- [x] Admin metrics screen with a definition under every number and CSV export, from one
      database function (D65). Built 2026-09-29; migrations live 2026-09-30.
- [x] WhatsApp bot built and tested: parser, replies in English and Hindi, webhook with
      signature checks and a keyed hash in place of the number (D68). Built 2026-09-29;
      going live is Meta setup.
- [x] remitbridgesystemlabs@gmail.com made an admin (Angad, 2026-09-29), so Add a price
      shows on its Account tab.
- [x] Email sign-in through Resend on remitbridgelabs.org, code template live
      (D53). Done 2026-09-28.
- [x] GitHub Actions secrets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set
      (piped from the Supabase CLI, never displayed); a scrape run read the database
      with them. Done 2026-09-28.
- [x] Admin "Add a price" screen, `manual_observations` table with RLS (26/26
      smoke checks), engine write-back of each outcome, Manual prices workflow, and the
      `process-prices` Edge Function (D54). Done 2026-09-28.
- [x] Country flags as bundled images in the pickers, fields and onboarding (D55).
      Done 2026-09-29.
- [x] App icon and splash: the website's bridge mark on brand green, for iOS (layered
      .icon), Android (adaptive + monochrome) and the splash (D56). Done 2026-09-29.
- [x] Store-required pages and the partner link, built as `site/` (home, privacy,
      support, `/p/<partner>` with a counted visit) (D57). Done 2026-09-29.
- [x] `site/` live at https://app.remitbridgelabs.org (Vercel project, root `site`;
      GoDaddy CNAME `app`), SSL valid, all pages 200; Privacy and Support linked from
      the Account tab. Done 2026-09-29.
- [x] The website's tools rebuilt in the app under Compare · Tools · Learn · Account:
      Fair rate, Scam check, TrueCost (with saved checks), Yearly cost, Rate history,
      Glossary, RemitBench (D58). Done 2026-09-29.
- [x] Landing page at app.remitbridgelabs.org rebuilt as a scroll story with a pinned
      phone, after hidewire.org (D59). Done 2026-09-29.
- [x] Sign in with Apple enabled in Supabase (native; app + Expo Go audiences) (D60).
      Done 2026-09-29.
- [x] Google sign-in: OAuth client, consent screen published, enabled in Supabase (D61).
      Done 2026-09-29.
- [x] graphify installed: CLAUDE.md rules, search hooks, and post-commit and
      post-checkout rebuild hooks. The graph builds once code exists. Done 2026-09-28.
- [x] PRD v0.4 read end to end. Decisions D1–D52 are recorded in
      `DECISIONS.md`. Done 2026-09-28.
- [x] Project docs set up and pushed to `origin/main`. Done 2026-09-28.
- [x] First build slice: formula (pinned to TrueCost), engine core, schema, and
      the Compare and How it works screens, plus CI. Done 2026-09-28.
- [x] Repo made private (D21). Done 2026-09-28.
- [x] Supabase linked (`gmzljjdnwndvqciqicbx`), both migrations applied, RLS smoke
      test 24/24, and the app reads the live project. Done 2026-09-28.
- [x] Onboarding with account creation, the Account tab with in-app deletion
      (the `delete-account` Edge Function), and far less text. Done 2026-09-28.
- [x] Compare has From/To dropdowns and a typed amount, estimated between
      checked amounts with the shared formula (D43). Done 2026-09-28.
- [x] No emoji, a restrained visual pass, then brand color in the website's
      vocabulary (D44, D47). Search inside the country dropdowns (D46). The country
      sheet's close button moved clear of Expo Go's dev button. Done 2026-09-28.

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
- **Privacy.** Accounts are optional, and comparing works without one (D19).
  - Signed-in users can save comparisons and the past transfers they enter.
    Every user table has row-level security so only its owner can read it.
  - Deleting an account inside the app deletes all of that user's data.
  - Metrics are aggregate only.
  - On WhatsApp, store only a hashed phone number. The one exception (D94, Angad's yes on
    2026-10-01): while a receipt photo is being read, the number is kept encrypted for at
    most an hour, and deleted as soon as the reply goes out.
  - Delete the contact details from a route request once its launch
    notification has gone out.
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

Visual register (D44, D47, D103, D109, D112): no emoji, segmented controls over pill chips.
Buttons and rows that go somewhere are chunky (a darker lip they sink into when pressed);
cards sit on a soft rim; rows that state facts keep thin dividers. Few words:
rows lead with the app's own illustrations (`components/illustrations.tsx`, one style, money
colours only) or, for settings, a small ink symbol; never icon tiles, never an icon in place
of a label. Color comes
from the website's vocabulary: a brand-green header band, mint tints, and a green
left edge on what counts. Use tokens from constants/theme.ts, never a hex value.

- American English is the source. Every string lives in `mobile/src/i18n/en.ts`, never
  inline in a screen; each other language is a full copy, shipped only once reviewed (D69).
- Use the terminology table in PRD 14.4: *mid-market rate*, *exchange-rate
  markup*, *total cost*, *amount received*, *provider*. Say *route* in the UI and
  *corridor* in docs and research.
- Plain words and short sentences. No hype: never "Best deal!". The top result
  is "Most to your family", not "Best".
- Every figure names its source and when it was checked. Every tool gets a
  "What this does not tell you" section.

## Stack

- **Mobile app:** Expo (React Native, TypeScript), for iOS and Android. No web app.
  The pages the store requires (privacy policy, support, link handling) live on a
  remitbridgelabs.org subdomain served from this repo (D28).
- **Auth:** email code, Sign in with Apple, and Google, through Supabase Auth.
- **Metrics:** first-party events in Supabase, with the honesty and privacy rules in D31.
- **Supabase** (a new project, not the website's) for Postgres, storage (the raw
  archive), auth, and Edge Functions (the WhatsApp webhook). **No Clerk.**
- **Engine:** Python, run by GitHub Actions scheduled workflows. No Redis;
  state lives in Postgres (D13).
- **WhatsApp:** Meta Cloud API directly, not Twilio.
- **Receipt scanning:** OCR and redaction on the phone (ML Kit, Skia); the pipeline in
  `packages/receipt`; Qwen3.8 27B on Groq's free tier, only from the `scan-receipt` Edge
  Function (D73–D78, D98).
- **Maintainer alerts:** email to Angad.
- Use whichever language fits each part. Every part must use the same total-cost formula.
- **Look:** same as the website (D18). The website repo
  (`../RemitBridge-System-Labs---Website`) may be **read** for design tokens and
  the TrueCost formula. Never write to it.
- **Contact** (scraper user agent, methodology screen, every page): `CONTACT_EMAIL` in
  `site/site.config.json`, read everywhere (D141): hello@remitbridgelabs.org, which
  forwards to remitbridgesystemlabs@gmail.com (the account behind every service).
- **Name:** RemitBridge Labs in full; RemitBridge for short. Never "charity", "501(c)(3)" or
  "tax-deductible" until Angad says the IRS approved it; "nonprofit corporation" only once
  `INCORPORATED` is true (D141).

## Secrets

- Never commit `.env` files or keys. Check `.gitignore` before adding
  anything that holds a secret.
- Never ask Angad to paste an API key into the chat. Keys go straight into the
  platform (`supabase secrets set`, GitHub Actions secrets, host env).
- The Supabase service-role key never goes into a browser bundle.
- Row-level security is what protects the data, not the UI. Write the policy
  before the feature, and test it with curl: extend and run
  `supabase/tests/rls_smoke.sh`. A denial only counts if Postgres returns `42501`;
  a bare 4xx can be a malformed request passing for a policy.

## Git

- Commit straight to `main`, and push to `origin` after each commit without
  asking (D24).
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
