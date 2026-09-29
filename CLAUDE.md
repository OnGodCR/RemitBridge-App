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

These are deferred on purpose, not forgotten. Update this list as things land.

- [ ] **More languages.** English only for now. The UI strings live in files
      so Hindi (first), then Spanish, Tagalog, Vietnamese and others can be
      added without code changes. Hindi also needs a matched Devanagari font
      (PRD 14.5).
- [ ] **Permission requests: 7 of 8 sent 2026-09-28**, waiting on replies. Xe
      publishes no email, so it needs its help-centre form. Log replies in
      `docs/outreach/permission-request.md` (D52). Follow up after three weeks.
- [ ] **Manual price entry form** (D52): an admin-only screen where prices read off
      providers' sites are entered and then run through the engine's gate. It needs
      Angad signed in once, then marked admin.
- [ ] **Disk space.** Under 4 GB free again on 2026-09-28; native builds need 15–20 GB.
- [ ] **App icon and splash.** Still the Expo template's placeholders.
- [ ] **Apple and Google sign-in credentials** in the Supabase dashboard. Apple
      needs the developer account (D32); Google needs a Cloud OAuth client.
- [ ] **Check on a real phone:** in the simulator, the first tap after a screen
      change was sometimes dropped. It looked like Expo Go's dev overlay, but
      that's unconfirmed.
- [ ] **Bank connections or receipt scanning** for past transfers. Manual
      entry only for now (D30).
- [ ] **Apple Developer and Google Play accounts.** Angad enrolls closer to
      submission (D32).
- [ ] **Rate alerts as push notifications.** Post-launch (D34).
- [ ] **Partner link** (D48): a shareable link on the app subdomain that opens the
      app or falls back to the store or website. Build it with the subdomain pages (D28).
- [ ] **Partner outreach** (D50): no partners yet; Seattle-area organizations, special
      corridors first.
- [ ] **All eight Tier 1 providers are manual for now** (terms checked 2026-09-28).
      See `docs/MANUAL_RESEARCH.md`.
- [x] Email sign-in through Resend on remitbridgelabs.org, code template live
      (D53). Done 2026-09-28.
- [x] GitHub Actions secrets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set
      (piped from the Supabase CLI, never displayed); a scrape run read the database
      with them. Done 2026-09-28.
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
  - On WhatsApp, store only a hashed phone number.
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

- American English. English is the only language for now (see Open items).
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
