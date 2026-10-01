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

End every reply with the open items below, as a short checklist showing what is
done and what is not. Do this in every reply, not only when the list comes up.

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

- [ ] **WhatsApp: the first real messages** (D68, D94). Set up 2026-10-01: Meta app
      "RemitBridge" with a business portfolio (unverified), Meta's free test number
      +1 555 184 5383 (Phone number ID 1399186246604217) with Angad's phone as the one
      allowed recipient; all five `WHATSAPP_*` secrets plus `WHATSAPP_RECEIPTS=on`,
      `RECEIPT_INTAKE_SECRET` and `GITHUB_DISPATCH_TOKEN` in Supabase; `WHATSAPP_ACCESS_TOKEN`
      (system user `remitbridge-bot`, never expires) and `RECEIPT_INTAKE_SECRET` in GitHub
      Actions; webhook verified and subscribed to `messages`. Never change
      `WHATSAPP_HASH_SECRET` now, or every stored hash stops matching. Left: the test texts
      (below); a real number, payment method and business verification only when going public.
- [ ] **Apple Developer Program ($99 a year), then the iPhone development build** (D73).
      Angad pays last, once everything free is set up (2026-10-01). EAS is ready: account
      `ongodcr`, project @ongodcr/remitbridge linked, the two `EXPO_PUBLIC_SUPABASE_*`
      variables created for development. Left: `eas device:create`, Developer Mode,
      `eas build --profile development --platform ios`, all Angad's (Apple sign-in).
- [ ] **Universal links** (D48): the app side is in (the associated domain, the
      `p/[partner]` route, 2026-09-30). Left: the Team ID (paid membership) for
      `site/.well-known/apple-app-site-association`.
- [ ] **Receipt parser extractors:** Angad writes the 13 `TODO(angad)` functions in
      `packages/receipt/src/extract/fields.ts` (D86). Until then, the model reads every value.
- [ ] **More prices.** Wise's are live (D91, every 6 hours). The other seven Tier 1 providers
      are manual (terms checked 2026-09-28, `docs/MANUAL_RESEARCH.md`): Add a price, or
      their permission.

### Testing (once the features are set up)

- [ ] **Scan a real receipt** on the iPhone development build.
- [ ] **Apple and Google sign-in** on a real iPhone (the simulator hides Apple).
- [ ] **Dropped first tap:** in the simulator, the first tap after a screen change sometimes
      seemed dropped; on 2026-09-30 at least some had landed and the screenshot lagged.
      Check on a real phone.
- [ ] **WhatsApp:** text "500 to India", then send a receipt photo.
- [ ] **Launch email:** the first real send, when a requested route goes live.

### CAC submission (internal deadline Oct 23, official Oct 26)

- [ ] **Write-up and video:** Angad rewrites `docs/cac/submission.md` (Claude's draft,
      2026-10-01) in his own words, records the demo video (3 minutes at most), and submits.
- [ ] **Scanner live for the demo** (D72): all six phases on `main`, every migration live
      (52/52), the model on Groq. Left: the iPhone build and a real scan (above).

### Thank-yous and outreach (Angad sends)

- [ ] **Thank-you to Simon Bruins at Wise** for the Comparison API permission (D91). Drafted
      by Claude as a reply in his thread in the RemitBridge Gmail (2026-10-01); it also
      declines the affiliate program he mentioned. Angad reads it and sends.
- [ ] **Permission requests:** all 8 sent 2026-09-28; Wise said yes, the rest only
      auto-replies (Xoom's media desk, Xe ticket 26724746). Follow up on 2026-10-12
      (calendar reminder set). Log replies in `docs/outreach/permission-request.md` (D52).
- [ ] **Partner emails** (D50): Horn of Africa Services sent 2026-09-30; East African
      Community Services is in the RemitBridge Gmail's Drafts; the other seven texts are in
      `docs/outreach/partners.md`. The permission system stopped Claude after the first send
      (2026-09-30) and again while drafting the Filipino Community one (2026-10-01): that
      draft has the address and subject but no text yet. The rest are Angad's.
- [ ] **Translation reviewers** (D69): the Hindi sheet is ready to send,
      `docs/translation-review/hi.md` (585 strings). Hindi, Spanish, Tagalog and Vietnamese
      are Claude's drafts and show only in development builds until a fluent speaker reads
      each, agrees in writing, and is named with the date in `mobile/src/i18n/languages.ts`.
      Hindi first; the bot's Hindi (D68) needs the same read. Glossary definitions are
      still English in every language.

### Before launch

- [ ] **Remove `host.exp.Exponent`** from Supabase's Apple client IDs (D60).
- [ ] **Store screenshots from a development build** (no Expo Go dev button); also swap
      them into `site/screens/` (D59).
- [ ] **Google Play developer account.** Angad enrolls closer to submission (D32).
- [ ] **Disk space and memory.** 12 GB free on 2026-09-30; native builds and real store
      screenshots need 15–20 GB. With 8 GB of RAM, the simulator takes 1–2 minutes to boot.

### Watching and later

- [ ] **Remittance tax: final IRS regulations.** Checked against the proposed ones on
      2026-10-01 (D97). Re-check when they're final.
- [ ] **Bank connections or receipt scanning for past transfers.** Manual entry only (D30).
- [ ] **Rate alerts as push notifications.** Post-launch (D34).

### Done

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

Visual register (D44, D47): no emoji, modest corners, hairlines over shadows,
segmented controls over pill chips, and text labels over decoration. Color comes
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
- **Contact** (scraper user agent, methodology screen): remitbridgesystemlabs@gmail.com.

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
