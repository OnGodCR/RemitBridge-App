# To do

Everything still open, in one place (Angad, 2026-10-12: "make a list of exactly everything
we need to do"). CAC work is left out on purpose. The RemitBridge pane reads this file, so
tick items here (`- [x]`) as they land. Details live in CLAUDE.md's open items and
`docs/launch-checklist.md`.

## Store blockers (Angad)

- [ ] **Waiting on D&B**: case #11089990; Angad sent the certificate and form, no answer yet (2026-10-12). The D-U-N-S number gates both stores.
- [ ] **Apple account to an organization**: once the D-U-N-S arrives, your dad asks Apple Developer Support to convert it to RemitBridge Labs.
- [ ] **Google Play organization account**: in RemitBridge Labs' name, with the D-U-N-S ($25 once).
- [ ] **App Store Connect app record**: bundle `org.remitbridgelabs.app`, SKU `remitbridge`, English (U.S.). Claude reads the screen with you.
- [ ] **Paste the App Store listing**: from `docs/store/listing.md`, availability US only, the six 6.9-inch screenshots.
- [ ] **iPhone production build**: sign in to Apple once so EAS makes the App Store profile; Claude builds, you run `eas submit`.
- [ ] **Play Console**: upload the production `.aab`, then fill every form from `docs/store/listing.md`.
- [ ] **Android phone screenshots**: 2 to 8 from your Samsung (long side at most twice the short side).
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
- [ ] **WhatsApp in the app**: LINK and SAVE from the WhatsApp tab.
- [ ] **WhatsApp display name**: check Meta's review of "RemitBridge Labs".

## Content (Angad)

- [ ] **Three scan screenshots for the website**: covered receipt, "Check each value", the result, from your iPhone (sample receipt at `site/review/sample-receipt.jpg`).
- [ ] **Fresh hand-checked prices**: a new round in Add a price; India at $200 shows only Wise and Instarem.

## Legal, accounts and money (Angad)

- [ ] **Legal review**: `site/privacy.html` and `site/terms.html`, still marked draft.
- [ ] **License the name and domain to RemitBridge Labs**: in writing.
- [ ] **Read the security review**: `docs/security-review.md`, tick or comment on each change.
- [ ] **Two-factor everywhere**: Supabase, GitHub, Expo, the RemitBridge Gmail, Google Cloud, Vercel, GoDaddy, Resend, Groq, Meta.
- [ ] **Bylaws**: read the bylaws and board consent, choose officers, three signatures.
- [ ] **DMCA agent**: decide; Claude suggests skipping it until users can post public content.
- [x] **Send the Groq email**: sent 2026-10-12; Groq's automatic reply says no new tiers for now (enterprise only).
- [ ] **Clear old sealed WhatsApp numbers**: run `update public.whatsapp_users set number_sealed = null;` in the SQL editor (D148).
- [ ] **Renumber duplicate decisions**: D160 and D163 are each used twice; say yes and Claude renumbers.
- [ ] **hello@ profile photo**: Google case #76360017; Angad confirmed freeing the domain on 2026-10-12, so Google is deleting the unfinished Workspace. Then make a free Google account for hello@ and upload the logo.

## Translations

- [ ] **Hindi review**: your mom continues in `docs/translation-review/hi.md` from `fairRate.yourTransfer`, including the NEW and CHANGED rows and the bot's Hindi.
- [ ] **Spanish, Tagalog and Vietnamese reviewers**: a fluent volunteer for each, named with the date in `languages.ts`.
- [ ] **The site in Hindi**: after the legal review.

## Outreach

- [ ] **Provider permissions**: if still silent by 2026-10-25, find a named partnerships contact at each (log in `docs/outreach/permission-request.md`).
- [ ] **Xoom by another route**: the follow-up to PayPal's media desk bounced on 2026-10-11 (now an Asana inbox); use the newsroom contact form or find a named contact.

## Claude, waiting on something

- [ ] **India's prices**: held since 2026-10-12 morning (three rate sources disagree); check 2026-10-13, then decide on a 0.6% rule with Wise.
- [ ] **Uganda's prices**: held, its sources are 2.6% apart; needs a rule for thin currencies if you want one.
- [ ] **Play App Signing follow-up**: add the SHA-256 to `assetlinks.json` and a second Android Google sign-in client, once you send the keys.
- [ ] **Receipt scanning accuracy**: revisit with more real receipts.

## Later

- [ ] **Weekly email of suggestions, and `/open/` app links**
- [ ] **Remittance tax final rule**: the weekly workflow emails you when the IRS publishes it; then update the formula.
- [ ] **Nonprofit yearly**: Washington's annual report, and an accountant's look at the federal return.
- [ ] **Disk space on this Mac**: about 2.4 GB free; real native work needs 15 to 20 GB.
- [ ] **DCO check**: when the first outside contributor starts.
