# To do

Everything still open, in one place (Angad, 2026-10-12: "make a list of exactly everything
we need to do"). CAC work is left out on purpose. The RemitBridge pane reads this file, so
tick items here (`- [x]`) as they land. A `(due YYYY-MM-DD)` after a title puts it in the
pane's Due group, and Claude's own dated items go into Claude's instructions every session.
Details live in CLAUDE.md's open items and `docs/launch-checklist.md`.

## Before submitting: found in the 2026-10-17 review (Angad decides, Claude builds)

- [x] **Old hand prices as RemitBridge choice**: kept as is (D181, Angad 2026-10-17); hand prices compete until 7 days old, then leave Compare. The view already does this.
- [x] **Remmy says "today's checked prices"**: fixed 2026-10-17 (D182): Remmy and WhatsApp no longer say when prices were checked. Deployed 2026-10-17; Hindi review of two rows pending.
- [x] **Uncommitted quote-card edit**: kept with the estimate label and "arrives" restored (D183, 2026-10-17); Compare screenshot retaken.
- [x] **Redeploy `remmy` and `whatsapp`** for D182: both deployed by Angad 2026-10-17.
- [ ] **New production builds** (code is ready as of 2026-10-17), then TestFlight and Play internal testing.
- [ ] **Fresh hand-price round right before submitting**: the Oct 12 to 14 prices leave Compare Oct 19 to 21.
- [ ] **Screenshots checked against the store builds**: the new set is from the web render; Remmy's icons draw blank there (`~/Desktop/RemitBridge-App-Store/README.md`).

- [x] **Review sign-in migration (D184)**: run by Angad in the SQL editor 2026-10-17 (`db push` hung at "Initialising login role"), recorded in the migration history, plus the read policy for Supabase Auth.
- [x] **App Review account**: review@remitbridgelabs.org created by Angad and on the review list; a password sign-in returned a token (2026-10-17).
- [ ] **Play Console, Sign in details**: Yes, add the review address and your password (you type the password), with the instructions from `docs/store/listing.md`.
- [x] **Play Console, Content rating**: IARC terms accepted, questionnaire filled (2026-10-17).
- [ ] **New production builds for D184, D185 and D186**: only when Angad says go. The iPad (D185) and the new onboarding order (D186) also take effect with them.
- [ ] **13-inch iPad screenshots for App Store Connect (D185)**: needed once the app supports iPad; take them from the iPad simulator after the new build.
- [ ] **Hindi for the onboarding questions step (D186)**: four new rows in `docs/translation-review/hi.md`.

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
