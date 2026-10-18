# Google Play: final look-through before shipping (2026-10-18)

Everything is filled in and saved. Nothing has been published or sent for review: Angad
looks through it once, then gives the word.

## Ready, for your look-through

| Area | State | Where in Play Console |
|---|---|---|
| Store listing | Name "RemitBridge: Compare Transfers", the short line and the story-style description; icon, feature graphic, 8 phone, 8 seven-inch and 8 ten-inch tablet screenshots | Grow users > Store listings > Default store listing |
| Category and contact | Set (hello@remitbridgelabs.org, app.remitbridgelabs.org) | Store settings |
| App content | All declarations complete ("You're all caught up"): privacy policy, ads (none), app access (review account), content rating, target audience 18 and over, data safety, financial features, government and health | Policy and programs > App content |
| Review sign-in | review@remitbridgelabs.org with your password and instructions; works on build 11 (D184) | App content > Sign in details |
| Internal testing | Draft release 1.0.0 (11) with release notes; tester list has your Gmail | Test and release > Internal testing |
| Production | Draft release 1.0.0 (11), same notes; United States only | Test and release > Production |
| Signing | Play App Signing on. Its SHA-256 is in assetlinks.json (partner links) and its SHA-1 has its own Google sign-in client, "RemitBridge Android (Play signing key)" (allow a few hours) | Protected with Play > App signing |

The one release warning is the optional deobfuscation file: the app isn't shrunk or
obfuscated, so there is nothing to upload.

## Decide

- **Catalog access** (Play's notice on the production release): Google's Play Catalog
  Access Program shares Play's US catalog with third-party Android stores, and apps are
  included by default. Leave it, or opt out under Advanced settings > Catalog access.
- **Fresh hand prices:** 279 hand-checked prices (Western Union, Ria, Xoom, MoneyGram, Xe,
  WorldRemit, from Oct 12 to 14) leave Compare on Oct 19 to 21. Wise and Instarem stay
  (refreshed automatically). A new round before or while Google reviews keeps Compare full
  (`docs/outreach/chatgpt-price-checks.md`).

## Then, in order (each only on your word)

1. Internal testing: Edit release > Next > Save and publish. It goes only to your tester
   list.
2. Install it from Play's internal test link on the Samsung. Check Google sign-in (the
   account chooser, then the terms step), email code, a scan, Compare and Remmy.
3. Production: Edit release > Next > Save, then Publishing overview > Send changes for
   review. Managed publishing is off, so Play publishes as soon as Google approves; turn
   it on first if you'd rather press the final button yourself.

## Not part of this submission

Apple waits for the organization conversion. 15 Hindi rows (D188, D189) go in the next
update.
