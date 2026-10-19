# To do

Everything still open, in one place (Angad, 2026-10-12: "make a list of exactly everything
we need to do"). The RemitBridge pane reads this file, so
tick items here (`- [x]`) as they land. A `(due YYYY-MM-DD)` after a title puts it in the
pane's Due group, and Claude's own dated items go into Claude's instructions every session.
Details live in CLAUDE.md's open items and `docs/launch-checklist.md`.

## Before submitting: found in the 2026-10-17 review (Angad decides, Claude builds)

- [x] **Old hand prices as RemitBridge choice**: kept as is (D181, Angad 2026-10-17); hand prices compete until 7 days old, then leave Compare. The view already does this.
- [x] **Remmy says "today's checked prices"**: fixed 2026-10-17 (D182): Remmy and WhatsApp no longer say when prices were checked. Deployed 2026-10-17; Hindi review of two rows pending.
- [x] **Uncommitted quote-card edit**: kept with the estimate label and "arrives" restored (D183, 2026-10-17); Compare screenshot retaken.
- [x] **Redeploy `remmy` and `whatsapp`** for D182: both deployed by Angad 2026-10-17.
- [x] **New production builds**: iOS 1.0.0 (7) and Android 1.0.0 (11), 2026-10-18, with the sign-in fixes (superseded by version 12). Upload version code 11 to Play internal testing.
- [ ] **Fresh hand-price round right before submitting**: the Oct 12 to 14 prices leave Compare Oct 19 to 21.
- [ ] **Screenshots checked against the store builds**: the new set is from the web render; Remmy's icons draw blank there (`~/Desktop/RemitBridge-App-Store/README.md`).

- [x] **Review sign-in migration (D184)**: run by Angad in the SQL editor 2026-10-17 (`db push` hung at "Initialising login role"), recorded in the migration history, plus the read policy for Supabase Auth.
- [x] **App Review account**: review@remitbridgelabs.org created by Angad and on the review list; a password sign-in returned a token (2026-10-17).
- [x] **Play Console, Sign in details**: review account and instructions added by Angad (2026-10-17). It only works on the next build, which has the password field.
- [x] **Play Console, Target audience (18 and over) and Data safety**: saved by Claude 2026-10-17; App content shows nothing left.
- [x] **Play Console, Content rating**: IARC terms accepted, questionnaire filled (2026-10-17).
- [x] **New production builds for D184, D185 and D186**: built 2026-10-18, iOS 1.0.0 (6) and Android 1.0.0 (10), since superseded.
- [ ] **13-inch iPad screenshots for App Store Connect (D185)**: needed once the app supports iPad; take them from the iPad simulator after the new build.
- [ ] **Upload Play's tablet screenshots (D187)**: `Desktop/RemitBridge-App-Store/play-upload/4-tablet-7-inch` and `5-tablet-10-inch` (8 each) into the store listing's 7-inch and 10-inch slots.
- [ ] **Hindi for the terms and privacy step (D188)**: 12 new rows in `docs/translation-review/hi.md`.
- [ ] **Hindi for the licenses row and the "cheapest we found" line (D189)**: 3 rows in `docs/translation-review/hi.md`.
- [ ] **After launch: `site/p.html`**: change "coming soon to the App Store and Google Play" once both listings are live.
- [ ] **Try the terms step on the new build (D188)**: sign up, read both documents, accept; then sign out and in again (it shouldn't ask twice).
- [ ] **Legal review note (D188)**: the privacy policy could say the account keeps which terms version you accepted and when.
- [x] **Hindi for the review sign-in and onboarding questions (D184, D186)**: approved by Angad's mother, relayed by Angad 2026-10-17.

## Weekly rates, monthly fees (D193, 2026-10-18)

- [x] **First weekly round loaded**: 257 rates paired (Xoom and Xe added on Angad's word) with the Oct 12–14 fees (`engine/manual/quotes/2026-10-18-weekly-rates.json`), published through the Scrape workflow.
- [x] **Xoom and Xe**: same rate for any funding (Angad, 2026-10-18); paired with bank-account fees. 36 Xoom rates (mostly cash pickup) still have no fee on file.
- [ ] **Remitly has no fees on file**: its 52 rates wait for the November fee pass (or a fee check now).
- [ ] **Western Union**: 38 bank targets unchecked (Colombia, Nigeria, Kenya, Pakistan, Bangladesh first).
- [ ] **Ria Uganda +2.45%**: confirm or drop the two held rates.
- [ ] **Show the fee's date in Compare**: needs an app update (next build).
- [ ] **November fee pass**: every fee from Oct 12–14 stops counting on Nov 12–14.

## Only what has data, and Learn on the account (D190, D191, 2026-10-18)

- [x] **Hide what has no prices (D190)**: Compare, onboarding and Ask for a route offer only routes and ways of receiving with published prices; UPI, wallet, card, home delivery, Uganda, uncovered countries and the 13 summary-only posts held back in `docs/future-updates.md`.
- [x] **Learn progress kept with the account (D191)**: built, merged on sign-in.
- [x] **Learn progress migration**: run by Angad in the SQL editor 2026-10-18; smoke test 81/81 live (run by Claude).
- [x] **Redeploy `remmy` and `whatsapp`**: both deployed by Angad 2026-10-18.
- [x] **New production builds for D190 and D191**: iOS 1.0.0 (8) and Android 1.0.0 (12), 2026-10-18 (`docs/store/release-builds-2026-10-18c.md`). Android 12 on internal testing, tested by Angad.
- [ ] **Google Play review**: 1.0.0 (12) sent for review 2026-10-18 (US only; publishes when approved, managed publishing off). Watch for Google's email; answer any policy questions.
- [ ] **Hindi for "Somewhere else?" (D190)**: 1 changed row in `docs/translation-review/hi.md`.
- [ ] **Accept the terms again** on the new privacy date (October 18): expected, D188.

## Google Play, 2026-10-18 (drafts ready; nothing sent)

- [x] Internal testing release saved as a draft: 1.0.0 (11), version code 11; the only warning is the optional deobfuscation file (we don't shrink or obfuscate code).
- [x] Production release saved as a draft: 1.0.0 (11), United States only (Google counts 7 locations: the US and its territories).
- [x] Play App Signing key read from Play Console: SHA-1 `0C:CA:6B:F1:38:B9:56:3B:EE:F2:56:0C:E4:7E:65:34:FE:81:49:0F`, SHA-256 `AD:4C:25:DD:6B:54:D5:70:FD:E1:0D:5E:B0:42:2C:51:7D:61:36:84:7D:BD:42:07:17:BB:E1:84:68:DB:33:83`. SHA-256 added to `site/.well-known/assetlinks.json` (08660ae).
- [x] **Google sign-in for the Play-installed app**: "RemitBridge Android (Play signing key)" created by Claude with Angad's yes, 2026-10-18 (project remittances-benchmarking, package org.remitbridgelabs.app, Play SHA-1 above).
- [x] **Catalog access**: left at Play's default (included), Angad 2026-10-18 ("the catalog access thing is fine").
- [x] **Angad's final look-through** (`docs/store/play-final-review.md`): "everything looks good, proceed", 2026-10-18. Internal testing 1.0.0 (11) published to the tester list the same day; join link https://play.google.com/apps/internaltest/4701430448185471423. Next: publish internal testing to the testers, install from Play on the Samsung, test Google sign-in, then send production for review. Claude doesn't send or publish until Angad says.

## Store blockers (Angad)

- [x] **D-U-N-S received**, confirmed by Angad 2026-10-14 (case #11089990).
- [ ] **Apple organization conversion approval**: request submitted by Angad 2026-10-14; waiting for Apple.
- [x] **Google Play organization verification**: complete, confirmed by Angad 2026-10-16; first app can now be created.
- [ ] **App Store Connect app record**: bundle `org.remitbridgelabs.app`, SKU `remitbridge`, English (U.S.). Claude reads the screen with you.
- [ ] **Paste the App Store listing**: from `docs/store/listing.md`, availability US only, the eight new 6.9-inch screenshots in `~/Desktop/RemitBridge-App-Store/store/iphone-6.9/` (2026-10-17; the Oct 12 ones are out of date).
- [x] **iPhone production build**: 1.0.0 (5), b44747b9-818f-4850-a1ad-591e4ceaebc9 FINISHED 2026-10-16. Apple signing completed by Angad; not submitted.
- [ ] **Play Console**: create first app and upload the fresh production AAB, build 27908f86-1347-4fd0-9d45-0bfb457f330e, version code 8 (finished 2026-10-16). Do not use the older version code 6. Complete the forms from docs/store/listing.md.
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
- [x] **Remmy feedback, round 1 (D176)**: any "open X" works without the model, a per-minute limit, the composer follows the keyboard, AI answers in the terms. Built 2026-10-13.
- [x] **Deploy remmy and whatsapp for the agent fixes** (rounded figures, turn reader, failure causes): both deployed 2026-10-13. "What does 300 to Mexico cost?" answered 4 of 5 times; the miss showed Compare with "try asking another way".
- [x] **Remmy failure causes read and fixed** (2026-10-13): empty output from gpt-oss reasoning past the token cap (now 1500), and Groq 400 tool_use_failed (its failed_generation is used now). Compare cards carry the top three checked prices (e5f8c6f, deployed), so price questions show figures even when the model fails.
- [x] **Merge the PRs**: Learn games (#5) and Remmy (#6) merged into main, 2026-10-13.
- [x] **Hindi rows for Learn games and Remmy**: Angad confirmed his mother reviewed everything and approved it, 2026-10-13.

## Receipt scanner (Angad, D173)

- [x] **Redeploy for the fee fix**: scan-receipt and whatsapp both deployed 2026-10-12.
- [x] **Redeploy for the row fix (D174)**: scan-receipt and whatsapp both deployed 2026-10-13.
- [x] **Scan a real receipt again**: "reciept works much better" (Angad, 2026-10-13, after D174).
- [ ] **Send Claude the receipts that came out wrong**: a photo (or the values it read and what the receipt really says) for each, so each becomes a test case in `benchmark/receipts/`.

## Content (Angad)

- [ ] **Hand-checked prices with ChatGPT**: paste `docs/outreach/chatgpt-price-checks.md` into a ChatGPT project, then do a round ($200 and $500 to India, Mexico, the Philippines, Vietnam first); you click, it reads your screenshots and writes the SQL (D167).

## Legal, accounts and money (Angad)

- [ ] **Legal review**: `site/privacy.html` and `site/terms.html`, still marked draft.
- [ ] **License the name and domain to RemitBridge Labs**: in writing.
- [ ] **Read the security review**: `docs/security-review.md`, tick or comment on each change.
- [x] **Two-factor everywhere**: done by Angad on his own accounts, 2026-10-17.
- [x] **Deploy the security fixes (2026-10-17 audit)**: `remmy` and `scan-receipt` deployed by Angad 2026-10-17; both answer through the new limiters.
- [ ] **Remove the Expo Go sign-in addresses** once Expo Go testing is over: Supabase, Authentication, URL Configuration, delete the `exp://` entries, keep `remitbridge://**`.
- [ ] **Bylaws**: read the bylaws and board consent, choose officers, three signatures.
- [ ] **DMCA agent**: decide; Claude suggests skipping it until users can post public content.
- [x] **Send the Groq email**: sent 2026-10-12; Groq's automatic reply says no new tiers for now (enterprise only).
- [x] **Clear old sealed WhatsApp numbers**: run by Angad 2026-10-12 (D148).
- [ ] **Renumber duplicate decisions**: D160 and D163 are each used twice; say yes and Claude renumbers.
- [ ] **hello@ profile photo**: Google case #76360017: Angad confirmed Workspace was deleted, 2026-10-13. Free Google account setup for hello@ is in progress; then upload the logo.

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

## Reviewed price publication (2026-10-14)

- [x] Publish reviewed collection with seven-day intake and original dates (D177): 282 quotes published; 279 visible in Compare, CI passed.
- [ ] Resolve remaining collection holds: 69 verified rows lack app-compatible methods/currencies, 16 engine quarantines, 12 Uganda reference-rate holds. The 46 nonverified collection rows remain excluded.

## Phone feedback fixes (2026-10-14)

- [x] Fix Remmy repeating its last navigation when chat reopens; regression test covers reopening and a fresh prompt.
- [x] Compare uses only bank-account-funded quotes, with no payment-method selector (D178).
- [x] Android feature validation: Angad confirmed all new features work perfectly on his Android (2026-10-14). Final production-build/iPhone checks remain in the launch checklist.

- [x] Unify eligible Compare prices and label the top standard payout RemitBridge choice; collection date/time is in quote details (D179).
- [x] Hindi review: changed choice badge and new consent/report strings approved, confirmed by Angad 2026-10-14.

- [x] Update privacy/terms/support/store drafts and add Remmy reply reporting (D180).
- [ ] Publication gates and remaining dependency assessment: docs/launch-checklist.md.
- [x] remmy v11 and whatsapp v41 deployed and smoke-tested after Angad authorized Codex to deploy them.
