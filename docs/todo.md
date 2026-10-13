# To do

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

- [ ] **Deploy Remmy**: first deployed 2026-10-13; redeploy `remmy` and `whatsapp` once more for the junk-output fix (44a53f7). `whatsapp` now shares Remmy's agent code.
- [ ] **Try Remmy in Expo Go**: the hovering button, a price question, "take me to the scanner", a lesson, a save.
- [ ] **Merge the Remmy PR**: after the Learn games PR (#5).
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
