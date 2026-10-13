# Handoff to ChatGPT (from Claude, 2026-10-13)

Angad is moving day-to-day work on RemitBridge from Claude to you because Claude's usage is
nearly used up. This file is everything Claude knew at the moment of handoff: the rules, where
the work stands, what comes next, and how to run the app in Expo Go. Read it top to bottom
once. The two appendices are copies of the full open-items list ("the MOD", from
`CLAUDE.md`) and the to-do list (`docs/todo.md`) as they stood at handoff.

`main` was at `b816305` when this was written. Everything described here is committed and
pushed; nothing is waiting uncommitted.

---

## 1. How to work with Angad

- **Start every reply with `hi, angad`.**
- Don't repeat the whole open-items list at the end of replies (his request, 2026-10-04).
  Mention only what changed, and keep the lists in the files current.
- **Writing rule for anything people read** (app copy, bot replies, emails, docs): no em
  dashes, and no "it's not X, it's Y" constructions. Short plain sentences. Commas and colons
  instead of dashes.
- **Free tier only.** No paid plans for anything (Groq, Supabase, Cloudflare, Vercel, EAS).
  Fix problems within free limits. Don't recommend paid upgrades unless he asks.
- **Production is Angad's.** You write and test migrations and Edge Functions; Angad deploys
  them and runs SQL in the Supabase SQL editor. Give him the exact command in its own code
  block. Never ask him to paste an API key, password or token into the chat. Keys go straight
  into the platform (`supabase secrets set`, GitHub Actions secrets, EAS env).
- **Provider websites (D142):** Angad does every click on a provider's site. An AI only reads
  his screenshots and writes the SQL for hand-checked prices.
- **Never create accounts or enter credentials for him.** Never send email or messages on his
  behalf without his explicit yes for that exact message.
- **Names:** "RemitBridge Labs" in full, "RemitBridge" for short. Never say "charity",
  "501(c)(3)" or "tax-deductible" (the IRS hasn't approved anything). "Nonprofit corporation"
  is allowed (incorporated in Washington, D146).
- He tests on an **iPhone** (development build installed) and a **Samsung Android** phone.
  For big Android APKs, tell him to open the expo.dev link in **Samsung Internet**; Chrome
  stalls at 100%.

## 2. The project in a paragraph

RemitBridge is a free, non-commercial app that compares what it really costs to send money
from the US. It ranks providers by **amount received** and splits the cost into the upfront
fee and the exchange-rate markup. Parts:

- **Engine** (Python, GitHub Actions on a schedule): collects prices and archives every raw response.
- **Mobile app** (Expo SDK 57, expo-router, React Native, TypeScript; iOS and Android, no web app).
- **Backend:** Supabase (Postgres with row-level security, Auth, Storage, Edge Functions on Deno).
- **WhatsApp bot** (Meta Cloud API, number +1 601-980-1089).
- **Receipt scanner:** OCR and redaction on the phone, then a model on Groq's free tier.
- **Remmy:** a chat assistant inside the app (new today, D175).
- **Small site:** app.remitbridgelabs.org, served from `site/` on Vercel.

Repo: `OnGodCR/RemitBridge-App` (private). Supabase project ref: `gmzljjdnwndvqciqicbx`.
The marketing website is a **separate repo** (`RemitBridge-System-Labs---Website`): you may
read it, but never edit or deploy it from here.

### Documents, in the order to read them

| File | What it is |
|---|---|
| `CLAUDE.md` | The project's rules and the full open-items list (the MOD). Its rules apply to you too. |
| `DECISIONS.md` | Every decision, numbered D1 to D175, with dates and reasons. It overrides the PRD. |
| `HANDOFF.md` | Where things stand, newest section first. Update it at the end of each session. |
| `docs/todo.md` | The whole to-do list grouped by who acts. Angad's "RemitBridge pane" reads it. |
| `README.md` | Setup and commands. |
| `docs/PRD.md` | The original product spec (v0.4). |
| `docs/launch-checklist.md` | Everything left before each store submission. |
| `docs/translation-review/hi.md` | The Hindi review sheet, filled in by Angad's mother. **Never regenerate it** with `scripts/review-sheet.ts`, which would wipe her column. Add new rows by hand at the end. |
| `docs/AI_USAGE.md` | The record of AI use for the CAC submission. |
| `docs/roadmap-2.0.md` | Claude's 2.0 ideas, a draft. |

### Repo layout

```
mobile/                 Expo app (src/app = screens via expo-router, src/components, src/lib, src/i18n)
packages/formula/       the one total-cost formula (TypeScript) + shared test vectors
packages/bot/           WhatsApp/Remmy agent, parser, replies (vitest, fake Supabase)
packages/receipt/       receipt pipeline: OCR rows, rules, redaction, model, validation
engine/                 Python scraper and publish gate
supabase/functions/     Edge Functions: whatsapp, remmy, scan-receipt, send-newsletter,
                        newsletter-unsubscribe, notify-route-launch, process-prices,
                        delete-account, and _shared/ (agent.ts, keys.ts, site-config.ts)
supabase/migrations/    SQL migrations (Angad runs them); supabase/tests/rls_smoke.sh
site/                   app.remitbridgelabs.org (privacy, terms, support, /p/<partner>, /unsubscribe)
docs/                   everything above, plus store/, outreach/, cac/, handoffs/
```

## 3. Rules that are code rules (breaking one is a bug)

- **Never publish a number we can't verify.** A missing quote beats a wrong one. Quotes pass
  the publish gate; failures are quarantined, never silently dropped. Every published number
  traces back to an archived raw response.
- **Rank by amount received only.** No affiliate links, no paid placement, never "best".
  The top result is "Most to your family".
- **One total-cost formula everywhere** (the TrueCost method, `packages/formula`): fee off
  first, markup on the converted amount, pickup charges at mid-market, add the three. Every
  copy must pass the shared test vectors.
- **Never move money.** No send button.
- **Privacy:** accounts are optional; every user table has RLS (owner-only); deleting an
  account deletes all its data; metrics are aggregate only; WhatsApp stores only a keyed hash
  of the number (except up to an hour, encrypted, while a receipt photo is read); route-request
  emails are deleted after the launch email.
- **Scraper conduct:** public pricing only, no logins, no CAPTCHA bypass, no rotating proxies,
  concurrency 1 per domain with delay and jitter, honest user agent with the contact email,
  never retry a 403/429. If a provider's terms or robots.txt forbid automation, build no
  adapter; record it in `docs/MANUAL_RESEARCH.md`.
- **Words:** every string lives in `mobile/src/i18n/en.ts` (never inline). Spanish, Hindi,
  Tagalog and Vietnamese are full copies (`es.ts`, `hi.ts`, `tl.ts`, `vi.ts`); when you add a
  key to `en.ts`, add it to all four (TypeScript will fail otherwise), and add a Hindi row to
  `hi.md` marked `NEW <date>`. Use the PRD's terms: *mid-market rate*, *exchange-rate markup*,
  *total cost*, *amount received*, *provider*; *route* in the UI. Few words, one fact per
  line, details behind "Show the details".
- **Look:** theme tokens from `mobile/src/constants/theme.ts` only, never a hex value. No emoji.
  Segmented controls over pill chips. Illustrations from `components/illustrations.tsx`.
- **Secrets:** never commit `.env` files or keys; check `.gitignore`. The service-role key
  never goes in the app. RLS is what protects data: write the policy first and test it with
  `supabase/tests/rls_smoke.sh`; a denial only counts if Postgres returns `42501`.

## 4. Git workflow

- Commit **straight to `main`** and push after each commit (D24). Feature work that Angad wants
  reviewed goes on a branch with a PR (as Learn games and Remmy did today).
- **Check the branch before every commit** (`git branch --show-current`). This checkout is
  shared between agents; one may have left it on another branch.
- Commit messages explain **why**, in prose, including what was tried and failed. Never claim a
  change the diff doesn't contain.
- **Don't add a `Signed-off-by` line**; that certification has to come from Angad personally.
- No force-pushes or history rewrites without his explicit yes.
- After code changes, run `graphify update .` (keeps `graphify-out/` current; free, AST only).
  The `graphify-out/` files change on their own after commits; it's fine to discard them
  (`git checkout -- graphify-out`) if they block a branch switch.
- Decision numbers: the last one is **D175** (Remmy). A cloud Claude session ("Remitbridge
  Cloud") was told to use D176 and up, so check `DECISIONS.md` on `origin/main` for the highest
  number before adding one. D160 and D163 are each used twice (renumbering waits on Angad's yes).

## 5. Running the app in Expo Go (and when you need a development build)

### One-time setup on the Mac

1. Node 22+ and npm (the repo uses npm workspaces), plus [uv](https://docs.astral.sh/uv/) only
   if you touch the Python engine.
2. From the repo root: `npm install` (installs every workspace and applies `patches/`).
3. The app's environment: `mobile/.env.local` **already exists on Angad's Mac** with all four
   values. On a fresh machine: `cd mobile && cp .env.example .env.local`, then fill in:
   - `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase
     dashboard, Project Settings, API. Both are public by design.
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`: Google Cloud
     project `remittances-benchmarking`, Credentials (only needed for native Google sign-in in
     development builds).
   - Never put the service-role key or the database password in this file.
4. On the phone: install **Expo Go** from the App Store or Play Store. The phone and the Mac
   must be on the same Wi-Fi.

### Start it

```bash
cd mobile && npx expo start --lan
```

- **iPhone:** open the Camera app, point it at the QR code in the terminal, tap the banner.
- **Android:** open Expo Go and use "Scan QR code".
- If the phone can't reach the Mac (school or guest Wi-Fi), use `npx expo start --tunnel`.
- In the terminal: `r` reloads, `m` opens the dev menu, `j` opens the debugger. On the phone,
  shake it for the dev menu. After pulling new JavaScript, press `r` to see the changes.
- If Metro acts up after a branch switch: `npx expo start --lan --clear`.
- Don't use the web preview (`--web`): `react-native-pager-view` breaks the web bundle, and
  Angad asked for Expo Go anyway.

### What Expo Go can't do (needs a development build)

Expo Go only has its own bundled native modules. These parts of the app need the
**development build** that's already installed on Angad's iPhone and Samsung:

- **Receipt scanning:** ML Kit text recognition and Skia redaction (D73).
- **Native Google sign-in** on Android, and on iPhone when both client IDs are set. In Expo
  Go the code falls back to the browser flow (`mobile/src/lib/sign-in.ts` checks
  `ExecutionEnvironment.StoreClient`).
- **Sign in with Apple** for real (the simulator hides it).
- **Push notifications** (rate alerts): no token in Expo Go or simulators.
- **Universal links** (`/p/<partner>` opening the app).

To run the latest JavaScript inside the installed development build instead of Expo Go:

```bash
cd mobile && npx expo start --dev-client --lan
```

Then open the RemitBridge development app on the phone and scan the QR code (or pick the
server from its list).

### Building with EAS (only when native code or config changes)

EAS account `ongodcr`, project `@ongodcr/remitbridge`. Credentials (Apple certificate and
profiles, Android keystore, APNs key) are stored on EAS, so builds don't need Apple sign-in.

```bash
cd mobile && npx eas-cli@latest build --profile development --platform ios
```

Profiles in `mobile/eas.json`: `development` (dev client, internal), `simulator` (iOS
simulator, used for screenshots), `preview` (release JavaScript, internal; for judging real
smoothness on Android), `production` (store builds, version auto-incremented). New JavaScript
alone doesn't need a build: Expo Go or the dev client picks it up. A new native module or an
`app.json` plugin change does. The Mac has very little free disk (about 2.4 GB), so builds
must run on EAS, not locally.

### Checks before calling anything done

```bash
npm test -w @remitbridge/mobile
```
```bash
npm test -w @remitbridge/bot
```
```bash
npm test -w @remitbridge/receipt
```
```bash
npm test -w @remitbridge/formula
```
```bash
npm run typecheck
```
```bash
cd mobile && npx expo lint
```

At handoff: app 225 tests, bot 161, all passing; typecheck and lint clean. CI runs on every
push to `main` (engine, TypeScript packages and app, migrations on a throwaway Postgres).

### Deploying (Angad runs these)

Each Edge Function deploys on its own:

```bash
supabase functions deploy <name> --project-ref gmzljjdnwndvqciqicbx
```

Functions that check the caller themselves have `verify_jwt = false` in
`supabase/config.toml` (whatsapp, remmy, newsletter-unsubscribe and others). Migrations: Angad
pastes the SQL into the Supabase SQL editor (his network resets the CLI's database
connections), then runs `supabase/tests/rls_smoke.sh` (76/76 at last run).

## 6. What happened in the last sessions (newest first)

- **2026-10-13, merged:** PR #5 (Learn game modes) and PR #6 (Remmy) are both on `main`.
- **Remmy (D175), live:** `remmy` and `whatsapp` deployed by Angad and checked live:
  - "what does 500 to India cost?" answers "**₹47,550** arrives..." with a Compare card;
  - "take me to the scanner" opens it by itself;
  - "teach me to spot scams" offers the Safety lesson.

  How it works:
  - **The button:** a floating mascot (`components/remmy.tsx`) over every tab opens the chat
    sheet (`app/remmy.tsx`).
  - **The app side:** the conversation is kept in memory only (`lib/remmy.ts`).
  - **The server side:** the `remmy` function runs the same agent as WhatsApp (shared code
    in `supabase/functions/_shared/agent.ts` and `packages/bot/src/agent.ts`), plus four app
    tools: `open_compare` (also returns today's prices), `open_screen`, `start_lesson` and
    `save_comparison`. Each tool adds an action, and the app renders it as a card.
  - **Safety:** actions are checked on both sides against `mobile/src/lib/remmy-actions.ts`.
  - **Permission:** the app asks once, Allow / Not now, before the first message goes to the
    AI model (Apple 5.1.2(i)).
  - **Limits:** 40 messages a day per install and 200 per network address.
  - **Privacy policy:** it has a Remmy section.
- **Fixes found during Remmy's live test (all deployed):**
  - The model chain now treats junk output (no letters, or one character repeated 30+ times)
    as a failure and moves to the next provider.
  - `open_compare` returns prices, so price answers pass the stray-number check.
  - WhatsApp replies turn `**bold**` into `*bold*`.
- **Learn game modes (D172):**
  - A Duolingo-style redesign: match pairs, a cost game, receipt tapping, scam-or-not.
  - Start bubble fixed.
  - "Hey Angad" greeting on every tab header.
- **Receipt scanner (D173, D174):** fee-included receipts handled; ML Kit's split rows
  rejoined (`joinRows`); doubtful values sent to the model. Angad: "reciept works much better".
- **Newsletter (D169):** opt-in only (Account switch and onboarding), admin composer, unsubscribe
  page; no postal address (updates, not ads). Hindi review finished (D170). Compare is the
  first tab, Scan second (D171).
- **CAC:**
  - Cover image: `docs/cac/cover-showcase.jpg`.
  - Essay prompt for you: `docs/cac/chatgpt-essay-prompt.md`.
  - Draft: `docs/cac/submission.md`.

## 7. What to do next, in order

1. **D&B check (due 2026-10-14):** D&B (case #11089990) promised the D-U-N-S number within 24
   to 48 hours of 2026-10-12. Ask Angad to search the RemitBridge Gmail
   (remitbridgesystemlabs@gmail.com) for it. If it hasn't come, draft a short status email
   for him to send from hello@remitbridgelabs.org. **The D-U-N-S number gates both app
   stores.**
2. **D&B chase (due 2026-10-16):** only if still nothing; draft a firmer email to
   research@iresearch.dnb.com for Angad to send.
3. **Remmy round 1 (D176) is built and pushed:** any "open X" works without the model (alias table in `mobile/src/lib/remmy-actions.ts`; add aliases there when a phrasing misses, with a row in the test table in `packages/bot/src/remmy.test.ts`), a per-minute limit, the composer follows the keyboard, AI answers in the terms. Angad deploys `remmy` again.
   3. **Angad tries Remmy in Expo Go:** the floating button, a price question, "take me to the
   scanner", a lesson, a save (needs sign-in). Fix whatever he reports.
4. **Hindi rows for Remmy:** 39 new rows at the end of `docs/translation-review/hi.md` for
   Angad's mother. Apply her changes to `mobile/src/i18n/hi.ts`.
5. **CAC submission (internal deadline Oct 23, official Oct 26):** Angad rewrites the essays in
   his own words (from `docs/cac/chatgpt-essay-prompt.md`), records a demo video of 3 minutes at
   most, and submits. The write-up must say the receipt parser is AI-written. **Backfill
   `docs/AI_USAGE.md`** for Oct 3 to 11 (it has a gap), and add how ChatGPT is used from now on.
6. **Store blockers, all waiting on the D-U-N-S:**
   1. Convert the Apple account to an organization (Angad's dad asks Apple Developer Support).
   2. Create a Google Play organization account.
   3. Create the App Store Connect record.
   4. Make the iPhone production build.
   5. Upload the Play `.aab` (EAS build 520e9e31, versionCode 6). Note: it predates Learn
      games and Remmy, so a fresh production build is needed for those.
7. **Receipt accuracy:** when Angad sends receipts that read wrong, turn each into a test case
   in `benchmark/receipts/` (made when needed; real receipts stay out of git unless every
   personal detail is swapped for a made-up one, D85). Synthetic fixtures are in
   `packages/receipt/fixtures/`.
8. Everything else is in the appendices, grouped by who acts.

### Watch-outs

- **Hindi on new strings:** Hindi is marked reviewed (D170), but new strings since then (the
  newsletter, Learn games, Remmy) are unreviewed drafts until Angad's mother signs off on the
  `NEW` rows.
- **Uganda's prices:** held on purpose (D166); its three rate sources disagree by 2.6%.
- **No Supabase logs:** Claude couldn't read function logs (CLI v2.75 has no logs command).
  For live debugging, call the function with the publishable key from `mobile/.env.local`
  without printing it, for example a POST to `/functions/v1/remmy` with a test `install_id`.
- **Groq and Cloudflare free limits:** both models run within free limits. The WhatsApp and
  Remmy chain is Cloudflare gpt-oss-120b, then Groq gpt-oss-120b, then Groq gpt-oss-20b, then
  plain replies (D163). The receipt model is Groq `qwen/qwen3.8-27b`.

---

# Appendix A: open items (the MOD, copied from `CLAUDE.md` at handoff)

These are deferred on purpose, not forgotten. Update this list as things land. Grouped
by kind (Angad's request, 2026-10-01): set every feature up first, then test.

## Features to set up

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
      enrolled and paid 2026-10-01; **active 2026-10-07** (Team ID QS9F7JU6H2, Program License
      Agreement accepted the same day). It must land
      by about Oct 10 for the CAC demo's scan. EAS is ready: account
      `ongodcr`, project @ongodcr/remitbridge linked, the two `EXPO_PUBLIC_SUPABASE_*`
      variables created for development. 2026-10-07: Angad signed in to Apple from
      `eas build`, which registered `org.remitbridgelabs.app` (Associated Domains, Push,
      Sign in with Apple), made the distribution certificate, the ad hoc profile with his
      iPhone (UDID ...801E) and an APNs key, all stored on EAS, so later builds need no
      Apple sign-in. The first build failed on ML Kit's `Text` clashing with SwiftUI's
      (patched, `patches/`); the second build (ad0d3252) finished 2026-10-07. Installed on Angad's
      iPhone; **a real receipt scanned end to end, 2026-10-08** ("it all works").
- [ ] **WhatsApp in the app (D138):** built 2026-10-02: link a chat to an account with a
      one-time code (no number stored), SAVE from WhatsApp into Saved, UNLINK, Chat on
      WhatsApp with the bot's number (development builds until `app_settings.whatsapp_live`).
      Migration pushed 2026-10-02 (smoke test 63/63). LINK and SAVE work from Angad's Samsung (2026-10-12, after the Android
      sign-in fix ad1afdc); `whatsapp_live` is on (2026-10-11).
- [x] **Rate alerts by WhatsApp (D139): dropped for push-only (D148, 2026-10-09).** No
      template or Meta payment method needed; LINK keeps no number. Angad cleared the numbers
      sealed before then, 2026-10-12.
- [ ] **WhatsApp on its real number (2026-10-11):** Google Voice +1 601-980-1089, Phone Number ID
      1401205103074407, in the new messaging account "RemitBridge Labs" (2494223487766004).
      Webhooks subscribed on that account (the toggle was off, which is why the test number's
      message never reached us), `remitbridge-bot` given full access, `WHATSAPP_PHONE_NUMBER_ID`
      set, `app_settings.whatsapp_number` = 16019801089. Angad's "500 to India" and "500 to
      Vietnam" got replies, and so did his dad's phone (not an app admin). App icon, category
      and policy URLs set and the Meta app published; `whatsapp_live` = true (Angad's SQL,
      2026-10-11). LINK + SAVE tried from the app and working, and Meta approved the display name (2026-10-12).
- [ ] **WhatsApp going live (2026-10-09):** the account is **Approved** and the business
      **Verified** (restriction lifted). Meta app: RemitBridge, App ID 1004249319342214 (no
      icon yet; needed before Live). A test "500 to India" was delivered but the whatsapp
      function got **no call**: check the webhook's `messages` subscription and use Meta's
      Test button. Then: a real number (Angad's thinking Google Voice), app icon, app Live,
      `whatsapp_live` on.
- [ ] **An AI model in the WhatsApp bot (scoped 2026-10-11, `docs/whatsapp-ai-scope.md`):** free,
      not Groq; it understands the message and picks what to show, answers from our content
      with links, and logs feature suggestions for Angad. The model never writes a number.
      **Live 2026-10-12 (D159):** Cloudflare Workers AI, Qwen3 30B-A3B, secrets set by
      Angad, suggestions migration run (smoke test 70/70), `whatsapp` v27 deployed. Since
      then an agent with tools (D160, v28), and **D163 (v29): Cloudflare gpt-oss-120b, then
      Groq gpt-oss-120b, then Groq gpt-oss-20b, then the plain bot; about 30% fewer tokens.**
      2026-10-12: the agent writes like a person (prompt rules plus `humanize()`), and
      receipt replies are short blocks; the tax lines no longer contradict; pesos show as
      MXN; a fee read twice as a pickup charge is dropped (whatsapp, scan-receipt deployed).
      2026-10-12: LINK and SAVE work from the app; the bot's Hindi read by Angad's mother
      with nothing to change; no rerun of the model test (Angad); Groq email sent. Left:
      Angad's live test (a question, a suggestion, a new country, off topic, a receipt); app
      links (`/open/...`, needs builds) later.
- [ ] **Remmy, the assistant in the app (D175, 2026-10-13):** built on branch `remmy`: the
      hovering button, the chat sheet, the `remmy` function (the WhatsApp agent plus four app
      actions, checked on both sides), a one-time AI permission, the privacy section. Deployed and
      checked live, and merged with the Learn games (2026-10-13). `whatsapp` redeployed with
      the bold fix the same day. Left: Angad tries it in Expo Go.
- [ ] **Receipt scanning accuracy (Angad, 2026-10-11):** "could still use more work". To revisit
      once the other features are set up, with more real data. The $9.99-read-as-$999.99 fee
      no longer happens, per Angad.
- [ ] **Universal links** (D48): the app side is in (the associated domain, the
      `p/[partner]` route, 2026-09-30). `site/.well-known/apple-app-site-association` is
      live with Team ID QS9F7JU6H2 (read from Membership details, 2026-10-07; the site build
      now publishes `.well-known`). Left: a partner link opening the app on the iPhone
      development build; Android's `assetlinks.json` after the first Android build.
- [ ] **"What you could have kept" on the receipt result (D119):** built and `scan-receipt`
      deployed 2026-10-01, all tests pass. Left: seen for real once the iPhone build can scan. It
      grows more useful as prices pile up.
- [x] **Receipt parser extractors (D130):** Claude wrote all 13 at Angad's request; 47 of 47
      on the fixtures, 97.8% on 60 OCR'd synthetic receipts before the OCR fixes. The model
      now reads only what the rules miss or doubt. Done 2026-10-01. The CAC write-up must
      say the parser is AI-written (`docs/AI_USAGE.md`).
- [ ] **Wise and Instarem on 26 routes (D158, 2026-10-11):** 22 new Tier 2 routes; migration run
      by Angad, and the first run published 179 prices (Wise 99, Instarem 80). 23 routes live.
      2026-10-12: the Dominican Republic and Nicaragua are live with prices. Uganda is still
      building: its three rate sources are 2.6% apart (Frankfurter 4,075, open.er-api 4,027,
      Wise 4,135), so D166 rightly holds it. Left: a rule for thin currencies, if Angad wants one.
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
      Downloads). Instarem showed as stale on 2026-10-04 (fresh again 2026-10-07).
      **D144 (2026-10-07):** hand prices now stay 7 days in Compare as "Older prices", and
      fee-on-top hand prices match $500 at last. `20261007000000_compare_quotes.sql` run by
      Angad in the SQL editor 2026-10-08, smoke test 68/68; $500 to India now lists 9
      providers (Wise and Instarem current, 7 hand-checked under Older prices). The Oct 4
      prices leave Compare on Oct 11. Left: a fresh round of hand checks.
      **D166 (2026-10-12):** Mexico (from Oct 9) and India (from Oct 12) published nothing
      because Frankfurter and open.er-api drifted past 0.5%; Wise now breaks the tie. Mexico
      came back at 17:51 UTC. India is still held: all three disagree (Frankfurter 96.24,
      open.er-api 96.96 and stale, Wise 95.73; Wise is 0.53% from Frankfurter). India returned on
      its own (published 2026-10-13 00:46 UTC); no rule change needed.

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
      - [x] `INCORPORATED` is true (Angad has the certificate, 2026-10-08; D146), with
        entity-only liability terms; `OWNERSHIP.md` updated. The website (separate repo)
        has no privacy policy, terms or © line yet: handed to a website session.
      - [x] Meta business verification submitted 2026-10-08 as an Institution; **Meta emailed
        "Verification successful for REMITBRIDGE LABS" the same evening.** Next for WhatsApp:
        request a review of the restriction in Business Support Home, then a real number.
      - [ ] **D-U-N-S (D&B case #11089990):** requested through Apple's tool 2026-10-08. D&B's
        iResearch team (research@iresearch.dnb.com) asked the same night, within 72 hours, for
        the certificate plus their Business Information Form (BIR_FORM_USA.docx). Angad
        replied with both; no answer yet (2026-10-12). Then the Apple account conversion.
      - [x] No mailing address on the site (Angad, 2026-10-03): the Contact sections ask
        people to email for it. Charity registration also filed by Angad, under review;
        the wording rule holds until he says it's approved.
      - Legal review of `site/privacy.html` and `site/terms.html`; the written license of
        the name and domain to RemitBridge Labs; then the site's Hindi.
      - The DCO check, when the first outside contributor starts.

## Testing (once the features are set up)

- [x] **Scan a real receipt** on the iPhone development build. Done 2026-10-08 (Angad).
- [ ] **A blurry receipt on a real phone (D131):** the blur limits were calibrated on
      tesseract, not ML Kit; check that a shaky photo is turned back and a sharp one isn't.
- [ ] **Apple and Google sign-in** on a real iPhone (the simulator hides Apple).
- [ ] **Dropped first tap:** found and fixed 2026-10-01 (D136): Reanimated `entering`
      animations kept views from taking taps for a few seconds; all replaced. Confirm on a real phone.
- [ ] **WhatsApp:** text "500 to India", then send a receipt photo.
- [ ] **Launch email:** the first real send, when a requested route goes live.

## CAC submission (internal deadline Oct 23, official Oct 26)

Angad does this once the app itself is finished (D117).

- [ ] **Write-up and video:** Angad rewrites `docs/cac/submission.md` (Claude's draft,
      2026-10-01) in his own words, records the demo video (3 minutes at most), and submits.
- [ ] **Scanner live for the demo** (D72): all six phases on `main`, every migration live
      (52/52), the model on Groq. Left: the iPhone build and a real scan (above).

## Thank-yous and outreach (Angad sends)

- [ ] **Permission requests:** all 8 sent 2026-09-28; Wise said yes, the rest only
      auto-replies (Xoom's media desk, Xe ticket 26724746). Follow-ups sent 2026-10-04 to
      all seven (Angad's request). **Second follow-ups to all 14 silent providers sent 2026-10-11**
      from hello@ (log in `permission-request.md`); if still silent by 2026-10-25, find a named
      partnerships contact for each. Xe Care
      redirected us to data@xe.com (2026-10-06); emailed them 2026-10-08. Round 2
      (shorter email, from hello@) to six more on 2026-10-04: Viamericas, Instarem, Pangea,
      Félix Pago, Taptap Send, BOSS Money. Log replies in `docs/outreach/permission-request.md` (D52).
- [x] **Partner emails** (D50): all nine sent. Eight from the RemitBridge Gmail (Horn of
      Africa Services 2026-09-30, the other seven 2026-10-01); El Centro de la Raza through its
      web form by Angad, 2026-10-01. Log replies in `docs/outreach/partners.md`.
- [ ] **Newsletter (D169, 2026-10-12):** built: an Account switch (off by default), the admin
      composer (Account, Admin, Write a newsletter), `send-newsletter` and
      `newsletter-unsubscribe`, the site's `/unsubscribe` page, privacy policy and store answers.
      Migration run by Angad and both functions deployed 2026-10-12, smoke test 76/76.
      No postal-address block (opted-in updates, not ads); an opt-in switch on onboarding's
      sign-in step too. Redeployed. Apple's private email relay registered
      (four sources, all SPF) and Resend tracking confirmed off. Left: the new build (520e9e31).
- [ ] **Translation reviewers** (D69): Angad's mother reviews Hindi (D117), from
      `docs/translation-review/hi.md` (840 lines, now with the glossary, D125). Hindi, Spanish, Tagalog and Vietnamese
      are Claude's drafts. A fluent speaker reads each, agrees in writing, and is named with
      the date in `mobile/src/i18n/languages.ts`. **D151 (2026-10-10):** all four ship in store
      builds before that, marked Draft, with "We need volunteers" in Account (Hindi too, at
      Angad's word the same day). Her first notes are applied
      (सहेज → सेव, 10 flagged lines; rows marked CHANGED 2026-10-10 in `hi.md`).
      **Hindi review finished 2026-10-12** (Angad: his mother "reviewed all the hindi stuff
      and had nothing else to add"), the bot's Hindi included; Hindi no longer shows Draft
      (`languages.ts`, consent 2026-10-12, relayed by Angad; her name isn't shown in the app). **The review is under way in
      `hi.md` itself** (Angad marked "ENDED HERE" at `fairRate.yourTransfer`, 2026-10-03):
      never regenerate it with `scripts/review-sheet.ts`, which rewrites the whole file and
      would wipe the reviewer's column. Add new strings as rows by hand instead. The glossary is drafted in
      Hindi (D125); still English in Spanish, Tagalog and Vietnamese.

## Before launch

- [ ] **Nonprofit setup: `docs/nonprofit-setup.md`** (2026-10-10): only the bylaws (D150);
      the EIN put off the same day (nothing needs it yet); no bank account or 501(c)(3).
      Left: the bylaws and board consent read, officers chosen, three signatures. Yearly:
      Washington's annual report, and an accountant's check on a federal return.
- [x] **Corporate documents in Drive** (2026-10-10): the RemitBridge Google Drive (not
      Angad's personal one) has "RemitBridge Labs" with 00 Read me first, then 01 Corporate
      records, 02 Registrations and accounts, 03 Policies, 04 App store and launch, 05 Brand,
      06 Prices and research, 07 Costs and receipts. No passwords or keys in it. Signed bylaws,
      the CP 575 (if the EIN happens) and the D-U-N-S letter go into 01 and 02 when they exist.
- [ ] **Launch checklist: `docs/launch-checklist.md`** (2026-10-10), everything left before
      each store submission, with who does what. The D-U-N-S number gates both stores.

- [ ] **A logo next to emails from hello@ (parked 2026-10-09):** Gmail shows a blank avatar for
      hello@remitbridgelabs.org because the address has no Google account photo. A Google
      account for hello@ already exists ("username is taken"); signing in needs a reset code
      (sent to hello@, which forwards to the RemitBridge Gmail) and Google then asked for a
      phone number that has hit its limit. Retry later, or use a different number; then
      upload `RemitBridge-profile-picture.png` (Angad's Downloads) as its photo.
      2026-10-10: the taken name is an unfinished Google Workspace signup for the domain
      ("Workspace account is not active"; the admin console loops). Fix: Google's
      no-admin-access form to delete it, then a free account via "use your existing email".
      Filed 2026-10-10: case #76360017 (CNAME `76360017` -> google.com added at GoDaddy;
      Google asked to keep it until the case closes); knowledge-test passed 2026-10-11, now
      asking Google to delete the org on their side.

- [x] **Sign in with Apple key for account deletion (D145):** delete-account revokes the
      Apple grant. Key VN43KBGHT6 (Sign in with Apple, org.remitbridgelabs.app) created by
      Angad; all four `APPLE_*` secrets set from his terminal; Apple accepted the signed client
      secret (a dummy code got `invalid_grant`, not `invalid_client`). Done 2026-10-08. Left:
      one real deletion of an Apple-signed-in test account on the iPhone build.

- [ ] **Legal audit (D164, 2026-10-12):** age check, self-hosted fonts and the email's
      sign-off done; no replay, marketing email or subscriptions exist. Left: see the age
      screen on a phone (seen working on the simulator 2026-10-12); Angad decides on a DMCA agent
      (an account and fee at the Copyright Office's DMCA directory, and a public postal
      address; only matters if users ever post public content); the store age ratings
      should say the app isn't for children.
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
- [ ] **D147 (2026-10-09): WhatsApp tab, Account top-right, Android's own tab bar, Android
      icons.** Built and pushed; Hindi rows added by hand; bot wording deployed. Left: Angad
      checks both phones (Learn on Android especially); a preview (release) Android build to
      judge real smoothness, since development builds run unoptimized JavaScript.
- [ ] **Android readiness (2026-10-08):** never built or run on Android before today. Fixed:
      broad photo permissions blocked (Play's photo/video policy; the system photo picker needs
      none) and an email route to deletion on /support (Play's deletion-URL rule). Left: the
      first Android build and a run on a real Android phone (ML Kit, Skia redaction, Google
      sign-in, notifications); `site/.well-known/assetlinks.json` with the signing key's
      SHA-256 (EAS's key, plus Play App Signing's once on Play); Play screenshots and the
      1024x500 feature graphic; the Play account (D143). **2026-10-08: the first Android
      build (development, bc602593) compiled on the first try**, signed with a keystore EAS
      made (SHA-256 5D:02:45:...:E3:AC, SHA-1 89:8B:A7:E9:14:CC:23:31:65:AA:3D:1C:9D:9B:06:2C:E2:87:F1:05,
      read from the APK's v2 signing block). `assetlinks.json` is live with that SHA-256; add
      Play App Signing's SHA-256 once the app is on Play.
- [ ] **Native Google sign-in on Android (D129):** the browser flow crashed the Android build
      on the way back from Google (2026-10-09), so Android now uses the native sheet (7906dc8).
      Android OAuth client "RemitBridge Android (EAS key)" created by Claude with Angad's yes in
      Google Cloud project remittances-benchmarking (package org.remitbridgelabs.app, SHA-1
      89:8B:A7:E9:14:CC:23:31:65:AA:3D:1C:9D:9B:06:2C:E2:87:F1:05), 2026-10-09. Left: confirm
      on Angad's Android; add a second Android client with Play App Signing's SHA-1 once on
      Play. iPhone is set up (2026-10-01).
- [ ] **Angad's Android feedback, 2026-10-11 (D153-D156), all built and pushed:** the
      receipt result as two answers and two buttons, with details behind a toggle and a back
      arrow; 154 strings shortened in five languages; Android tabs in a native pager; the
      redaction rules leaving fine print, headings and toll-free numbers alone
      (`scan-receipt` redeployed). Left: Angad tries the new Android builds (development
      d41936d6, preview a5686cd5) for the swipe, and a real receipt for the black boxes; the
      iPhone needs a new build for the pager module only when its JS next updates past this.
- [ ] **Learn redrawn (D152, 2026-10-10):** zigzag path with side cards, walked trail, a
      flag at the top, one-row header, the newest post in Library. Checked in a web render
      only; left: Angad looks on both phones.
- [ ] **Screenshots (2026-10-12):** 15 of Angad's 18 for the website's /app page are in
      `site/screens/` (the `simulator` build profile), and six 6.9-inch App
      Store shots in `docs/store/screenshots/iphone-6.9/`. Left: the three scan shots (covered
      receipt, "Check each value", the result) from Angad's iPhone, since the simulator build
      has no ML Kit; the sample receipt is at `site/review/sample-receipt.jpg`.
- [ ] **Google Play developer account (D143):** on hold for an organization account in
      RemitBridge Labs' name (Angad, 2026-10-04), not a personal one through his dad. Needs the
      accepted Articles and a D-U-N-S number. Organization accounts skip the personal-account
      rule of a 12-tester, 14-day closed test.
- [ ] **Stores publish as RemitBridge Labs (D141):** once incorporated, get a D-U-N-S number,
      then convert the Apple account to an Organization (Apple Developer Support) and create
      or convert a Google Play Organization account, so RemitBridge Labs shows as publisher.
- [ ] **Disk space and memory.** 12 GB free on 2026-09-30; native builds and real store
      screenshots need 15–20 GB. With 8 GB of RAM, the simulator takes 1–2 minutes to boot.

## Watching and later

- [ ] **Remittance tax: final IRS regulations.** Still proposed on 2026-10-01 (Notice
      2026-52 extended penalty relief). Watched automatically: the weekly "Remittance tax
      rules" workflow fails and emails Angad when a final rule appears (D110); then update
      the formula against the final text.
- [ ] **Bank connections or receipt scanning for past transfers.** Manual entry only (D30).
- [ ] **Rate alerts (D113): live 2026-10-01** (migration pushed by Angad, smoke test 55/55,
      the sender reads it). Left: a real push needs the iPhone development build (Expo Go
      and simulators get no token).

## Done

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

---

# Appendix B: the to-do list (copied from `docs/todo.md` at handoff)

Everything still open, in one place (Angad, 2026-10-12: "make a list of exactly everything
we need to do"). CAC work is left out on purpose. The RemitBridge pane reads this file, so
tick items here (`- [x]`) as they land. A `(due YYYY-MM-DD)` after a title puts it in the
pane's Due group, and Claude's own dated items go into Claude's instructions every session.
Details live in CLAUDE.md's open items and `docs/launch-checklist.md`.

## Store blockers (Angad)

- [ ] **Waiting on D&B**: case #11089990; D&B confirmed on 2026-10-12 that the number comes in 24 to 48 hours. The D-U-N-S number gates both stores.
- [ ] **Apple account to an organization**: once the D-U-N-S arrives, your dad asks Apple Developer Support to convert it to RemitBridge Labs.
- [ ] **Google Play organization account**: in RemitBridge Labs' name, with the D-U-N-S ($25 once).
- [ ] **App Store Connect app record**: bundle `org.remitbridgelabs.app`, SKU `remitbridge`, English (U.S.). Claude reads the screen with you.
- [ ] **Paste the App Store listing**: from `docs/store/listing.md`, availability US only, the six 6.9-inch screenshots.
- [ ] **iPhone production build**: sign in to Apple once so EAS makes the App Store profile; Claude builds, you run `eas submit`.
- [ ] **Play Console**: upload the production `.aab` from EAS build 520e9e31 (versionCode 6: the Android sign-in fix, the newsletter with its onboarding opt-in, reviewed Hindi, and Compare as the first tab; finished 2026-10-12, checked: no AD_ID or photo permissions; NOT eb1d1d43, which can't keep anyone signed in), then fill every form from `docs/store/listing.md`.
- [x] **Android phone screenshots**: six from the Samsung, in `docs/store/screenshots/android/` (2026-10-12).
- [ ] **Play App Signing keys**: after the first Play upload, send Claude the SHA-256 and SHA-1 (Setup > App signing).

## Test on real phones (Angad)

- [ ] **Sign in with Apple and Google on the iPhone**
- [ ] **Delete an Apple-signed-in test account**: checks the Apple revoke (D145).
- [ ] **A blurry receipt**: a shaky photo is turned back, a sharp one isn't (D131).
- [ ] **A rate alert notification arrives**: iPhone first, Android once on Play.
- [ ] **The first tap works right away**: the dropped-tap fix (D136).
- [ ] **The age screen before an account**: on the phone, not just the simulator (D164).
- [ ] **A partner link opens the app**: `app.remitbridgelabs.org/p/...` on iPhone and Android.
- [ ] **"What you could have kept" on a real scan** (D119)
- [ ] **Android run-through**: a receipt scan (ML Kit, the black boxes), Google sign-in, the swipe between tabs, Learn (preview build a5686cd5).
- [ ] **WhatsApp live test**: a question, a suggestion, a new country, something off topic, a receipt photo.
- [x] **WhatsApp in the app**: Chat on WhatsApp, Link to your account and SAVE all work on the Samsung after the Android sign-in fix (ad1afdc), 2026-10-12. The three extra Saved rows were test saves from earlier that day; Angad deleted them.
- [x] **WhatsApp display name**: Meta approved "RemitBridge Labs" (2026-10-12).

## Newsletter (Angad, D169)

- [x] **Run the newsletter migration**: run by Angad in the SQL editor 2026-10-12; smoke test 76/76.
- [x] **Deploy the two functions**: `send-newsletter` and `newsletter-unsubscribe` deployed 2026-10-12; the unsubscribe link redirects to the live `/unsubscribe` page.
- [x] **Redeploy send-newsletter**: redeployed 2026-10-12 without the postal-address block.
- [x] **Apple's email relay**: registered 2026-10-12 in your dad's account: remitbridgelabs.org, send.remitbridgelabs.org (Resend's bounce domain), RemitBridge@ and hello@, all four passing SPF. Resend's open and click tracking were never set up, so they're off.
- [ ] **Store privacy answers**: email is now also used for the newsletter (`docs/store/listing.md`); pick those when you fill in App Store Connect and Play.
- [x] **Hindi for the six newsletter rows**: approved by your mom; Hindi no longer shows Draft (2026-10-12).

## Remmy (Angad, D175)

- [x] **Deploy Remmy**: `remmy` and `whatsapp` deployed 2026-10-13. Live check: "500 to India" answers from today's prices with a Compare card, "take me to the scanner" opens it, "teach me to spot scams" starts the Safety lesson.
- [x] **WhatsApp after the refactor**: "500 to India" answered (2026-10-13), with the asterisks showing around the amounts.
- [x] **Redeploy whatsapp for the bold fix** (18dd46e): deployed 2026-10-13.
- [ ] **Try Remmy in Expo Go**: the hovering button, a price question, "take me to the scanner", a lesson, a save.
- [x] **Merge the PRs**: Learn games (#5) and Remmy (#6) merged into main, 2026-10-13.
- [ ] **Hindi rows for Remmy**: your mother reads the new rows at the end of `hi.md`.

## Receipt scanner (Angad, D173)

- [x] **Redeploy for the fee fix**: scan-receipt and whatsapp both deployed 2026-10-12.
- [x] **Redeploy for the row fix (D174)**: scan-receipt and whatsapp both deployed 2026-10-13.
- [x] **Scan a real receipt again**: "reciept works much better" (Angad, 2026-10-13, after D174).
- [ ] **Send Claude the receipts that came out wrong**: a photo (or the values it read and what the receipt really says) for each, so each becomes a test case in `benchmark/receipts/`.

## Content (Angad)

- [ ] **CAC essays**: paste `docs/cac/chatgpt-essay-prompt.md` into ChatGPT with the form's questions, then rewrite the drafts in your own words; note in the AI-use answer how they were drafted.

- [ ] **Three scan screenshots for the website**: covered receipt, "Check each value", the result, from your iPhone (sample receipt at `site/review/sample-receipt.jpg`).
- [ ] **Learn game modes with ChatGPT**: paste `docs/outreach/chatgpt-learn-games.md`, pick from its proposal, then it opens a pull request (branch `chatgpt/learn-game-modes`) for Claude to review and merge. It also swaps Library's "Latest post" for the first post.
- [ ] **Hand-checked prices with ChatGPT**: paste `docs/outreach/chatgpt-price-checks.md` into a ChatGPT project, then do a round ($200 and $500 to India, Mexico, the Philippines, Vietnam first); you click, it reads your screenshots and writes the SQL (D167).

## Legal, accounts and money (Angad)

- [ ] **Legal review**: `site/privacy.html` and `site/terms.html`, still marked draft.
- [ ] **License the name and domain to RemitBridge Labs**: in writing.
- [ ] **Read the security review**: `docs/security-review.md`, tick or comment on each change.
- [ ] **Two-factor everywhere**: Supabase, GitHub, Expo, the RemitBridge Gmail, Google Cloud, Vercel, GoDaddy, Resend, Groq, Meta.
- [ ] **Bylaws**: read the bylaws and board consent, choose officers, three signatures.
- [ ] **DMCA agent**: decide; Claude suggests skipping it until users can post public content.
- [x] **Send the Groq email**: sent 2026-10-12; Groq's automatic reply says no new tiers for now (enterprise only).
- [x] **Clear old sealed WhatsApp numbers**: run by Angad 2026-10-12 (D148).
- [ ] **Renumber duplicate decisions**: D160 and D163 are each used twice; say yes and Claude renumbers.
- [ ] **hello@ profile photo**: Google case #76360017; Angad confirmed freeing the domain on 2026-10-12, so Google is deleting the unfinished Workspace. Then make a free Google account for hello@ and upload the logo.

## Translations

- [x] **Hindi review**: your mom finished every row, including the NEW and CHANGED ones and the bot's Hindi, with nothing more to change (2026-10-12). Six newsletter rows were added after, marked NEW.
- [ ] **Spanish, Tagalog and Vietnamese reviewers**: a fluent volunteer for each, named with the date in `languages.ts`.
- [ ] **The site in Hindi**: after the legal review.

## Outreach

- [ ] **Provider permissions**: if still silent by 2026-10-25, find a named partnerships contact at each (log in `docs/outreach/permission-request.md`).
- [ ] **Run the ChatGPT research task**: `docs/outreach/chatgpt-research-task.md` (providers per route, APIs, terms, official contacts, Xoom's new contact); bring the results to Claude to check and log.
- [ ] **Xoom by another route**: the follow-up to PayPal's media desk bounced on 2026-10-11 (now an Asana inbox); use the newsroom contact form or find a named contact.

## Claude, waiting on something

- [ ] **Check on D&B** (due 2026-10-14): D&B promised the number within 24 to 48 hours of 2026-10-12; search the RemitBridge inbox for it, and if it hasn't come, draft a short status email for Angad to send from hello@.
- [ ] **Chase D&B** (due 2026-10-16): only if the number still hasn't come; draft a firmer email to research@iresearch.dnb.com for Angad.
- [x] **India's prices**: back on their own; the 00:46 UTC run on 2026-10-13 published India (and Mexico). No 0.6% rule needed.
- [ ] **Uganda's prices**: held, its sources are 2.6% apart; needs a rule for thin currencies if you want one.
- [ ] **Play App Signing follow-up**: add the SHA-256 to `assetlinks.json` and a second Android Google sign-in client, once you send the keys.
- [ ] **Receipt scanning accuracy**: revisit with more real receipts.

## Later

- [ ] **Weekly email of suggestions, and `/open/` app links**
- [ ] **Remittance tax final rule**: the weekly workflow emails you when the IRS publishes it; then update the formula.
- [ ] **Nonprofit yearly**: Washington's annual report, and an accountant's look at the federal return.
- [ ] **Disk space on this Mac**: about 2.4 GB free; real native work needs 15 to 20 GB.
- [ ] **DCO check**: when the first outside contributor starts.

---

Keep `CLAUDE.md`'s open items and `docs/todo.md` current from here on; these appendices are a
snapshot and will go stale.
