# Launch checklist: App Store and Google Play

Everything left before RemitBridge can be submitted to each store, as of 2026-10-12.
Who does each: **Angad** (needs his sign-in, his phone or a decision), **Claude**, or
**both**. Tick items here as they land; CLAUDE.md's open items point here.

Already done, so not listed: the store listing, privacy and age-rating answers
(`docs/store/listing.md`), privacy policy and terms (live), in-app account deletion and
the deletion web page, Sign in with Apple and its token revocation (D145), the AI
disclosure (D145), push notifications, app icons and splash, the Apple and Android
signing keys, universal links and Android App Links, build settings for production.

## The one thing both stores wait on

- [ ] **D-U-N-S number** for RemitBridge Labs (D&B case #11089990; documents sent
      2026-10-09). D&B usually answers in about 5 business days and may call
      (425) 500-9144. *Angad.* Both store accounts publish as RemitBridge Labs only with it
      (D141, D143, D146).

## iPhone (App Store)

### Blocking

- [ ] **Convert the Apple account to an organization**, once the D-U-N-S arrives: Angad's
      dad (a director, so he can sign for RemitBridge Labs) asks Apple Developer Support to
      convert the individual account. *Angad and his dad.* (Publishing earlier under the
      individual account is possible, but `listing.md` says to wait, D146.)
- [ ] **App Store Connect app record**: My Apps → + → RemitBridge, bundle ID
      `org.remitbridgelabs.app`, SKU `remitbridge`, English (U.S.). *Angad*, with Claude
      reading the screen.
- [ ] **Paste the listing** from `docs/store/listing.md`: description, keywords, URLs,
      category, App Privacy answers, age rating, review notes, a review phone number;
      availability **US only**. *Angad*, Claude checks.
- [x] **6.9-inch iPhone screenshots** (1320 × 2868, six): done 2026-10-12 in
      `docs/store/screenshots/iphone-6.9/`, real simulator shots scaled 9.45% (same shape).
      Scan, Compare, the quote, Yearly cost, Learn, WhatsApp.
- [ ] **Production build and submit**: Claude runs `eas build --profile production
      --platform ios`; Angad runs `eas submit -p ios` and signs in to Apple once. *Both.*
- [x] **Checked 2026-10-12 (Claude):** expo-doctor 21/21 after bringing 12 packages to SDK
      57's patch versions; app type check, lint and 156 tests pass; Info.plist purpose
      strings specific; export compliance answered; Sign in with Apple, account deletion and
      the AI-consent prompt in place; review notes link a sample receipt
      (`/review/sample-receipt.jpg`) and explain the age screen.
- [ ] **App Store provisioning profile**: the production build needs one, and making it
      needs Angad's Apple sign-in once (`eas build --profile production --platform ios`
      asks). Best done after the organization conversion, so it's made for the final team.
- [ ] **Real-phone checks on the iPhone build**: Sign in with Apple and Google; delete an
      Apple-signed-in test account; a blurry receipt is turned back (D131); a rate alert
      arrives as a notification; the new tabs, Account button and savings counter. *Angad.*

### Should do first

- [ ] **Legal review** of the privacy policy and terms (still marked draft). *Angad.*
- [ ] **Security review** (`docs/security-review.md`) and two-factor on every account.
      *Angad.*
- [ ] **Fresh hand prices** so reviewers see a full Compare (the Oct 4 round drops out on
      Oct 11; Wise and Instarem stay current on their own). *Both*, about 30 minutes.

## Android (Google Play)

### Blocking

- [ ] **Google Play organization account** in RemitBridge Labs' name, with the D-U-N-S
      number ($25 one time). Organization accounts skip the 12-tester, 14-day closed test.
      *Angad.*
- [ ] **Real-phone checks on Android** (only the development build has run so far):
      a receipt scan (ML Kit and the redaction have never run on Android), Google sign-in
      (now the native sheet), a rate alert notification, the new tab bar and Learn.
      *Angad*, on his Android.
- [ ] **Play App Signing's key**: once the app is in Play Console, copy its SHA-256 and
      SHA-1 (Setup → App signing). Claude adds the SHA-256 to `assetlinks.json` and creates
      a second Android sign-in client with the SHA-1. *Both.*
- [ ] **Play Console forms** from `docs/store/listing.md`: store listing, Data safety,
      content rating, target audience (18+), financial features ("none"), account
      deletion URL, app access, advertising ID ("no"), release notes. All drafted
      2026-10-12, with the 512 × 512 icon (`docs/store/play-icon-512.png`). *Angad*, Claude
      checks.
- [ ] **Phone screenshots** from Angad's Android. *Angad.* The 1024 × 500 feature graphic
      is done (`docs/store/play-feature-graphic.png`, 2026-10-12).
- [ ] **Production build and submit**: Claude runs `eas build --profile production
      --platform android` (an .aab); the first upload goes through Play Console by hand,
      later ones with `eas submit` and a Play service-account key that Angad creates.
      *Both.*

### Should do first

- The same legal review, security review and fresh prices as for iPhone.

## Not needed for launch

- **WhatsApp going live.** The WhatsApp tab says "coming soon" until it is, which is fine
  for review. Still open: the webhook isn't delivering messages, then a real number.
- **The EIN.** Needed for 501(c)(3) status, a bank account and Google for Nonprofits, not
  for either store.
- **Other languages.** English only until a reviewer signs off on each (D69).
- **The hello@ profile photo.**

## This Mac

- [ ] **Disk space: 3.7 GB free** (2026-10-10). Cloud builds don't need local space, but
      the simulator, Xcode and downloads do. Clearing app caches (`~/Library/Caches`) frees
      several GB.
