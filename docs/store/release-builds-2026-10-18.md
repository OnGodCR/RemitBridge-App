# Final production builds, 2026-10-18

Angad's go-ahead on 2026-10-17 (local time): "Build now; any Hindi fixes can go in the next
update." Builds only: nothing was submitted to either store.

Source: `6919f34` on `main`. The app code is `cf27f4c` (the two later commits only change
CAC video docs). Before building: 791 JS tests (formula 204, bot 56, receipt 294, app
237), 110 engine tests, the workspace typecheck, lint, Deno checks of all 8 Edge
Functions, the site check, and Expo Doctor 21/21 after taking SDK 57's latest patch
releases. Live RLS smoke test 79/79 earlier the same day.

What's new since the 2026-10-16 builds: the App Review password sign-in (D184), full-screen
iPad (D185), onboarding questions before sign-up (D186), tablets in landscape with phones
upright (D187), terms and privacy inside the app with acceptance (D188), the licenses row
and the privacy policy of October 17 (D189), the simpler Compare card (D183), and no
"checked X ago" in Remmy (D182). Known: 15 Hindi rows not yet reviewed (Angad's call to
build anyway; fixes go in the next update).

## iOS

- Build ID: `ee443299-66ac-4c43-81fc-c03ec843db85`
- Profile: production; distribution: store; version 1.0.0; build number 6; SDK 57.
- Status: FINISHED.
- [Download IPA](https://expo.dev/artifacts/eas/NPnShCbEZw7B5la_L64zBOfIgiqBqrycVgV1hgb_b5w.ipa)
- [Build page](https://expo.dev/accounts/ongodcr/projects/remitbridge/builds/ee443299-66ac-4c43-81fc-c03ec843db85)
- Signed by team QS9F7JU6H2 (still the individual account; the organization conversion is
  pending with Apple). Distribution certificate and profile valid to 2027-10-07.

## Android

- Build ID: `70c36417-f8c7-4358-979d-5eaf370225e5`
- Profile: production; distribution: store; version 1.0.0; version code 10.
- Status: FINISHED.
- [Download AAB](https://expo.dev/artifacts/eas/D_FXY4au6OmqNhro-THIurvNNasq_mTNNj9fjlOuhBw.aab)
- [Build page](https://expo.dev/accounts/ongodcr/projects/remitbridge/builds/70c36417-f8c7-4358-979d-5eaf370225e5)
- Existing remote keystore reused. The Firebase config comes from the `GOOGLE_SERVICES_JSON`
  EAS file secret (the CLI's "not checked in" warning refers only to the local fallback).

## Next

1. Play: upload the AAB to internal testing in place of the old 1.0.0 (8) draft, roll it
   out to the tester list, then send Claude the App signing SHA-256 and SHA-1.
2. Install from Play on the Samsung and run the checks in `docs/launch-checklist.md`
   (Google sign-in needs the Play signing SHA-1 registered first).
3. iOS waits for Apple's organization conversion before App Store Connect.
