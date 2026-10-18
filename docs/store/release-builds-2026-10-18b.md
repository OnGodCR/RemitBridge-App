# Final production builds, 2026-10-18 (second round)

Replace iOS 6 and Android 10 from earlier the same day, which had the Google sign-in stall
(`docs/store/release-builds-2026-10-18.md`). Angad confirmed both fixes on his phone with
the dev server first ("Google shows the account chooser, and the terms step comes
after"). Builds only: nothing was submitted.

Source: `3a7c2bc` on `main`. The app code is `c4e9702`; the one later commit only changes
CAC video docs. Since the first round: the terms step drawn over the app (`6a51d84`),
Google's account chooser on every sign-in (`820fc16`), older dev builds tolerate the missing
orientation module (`093fe27`), and the dev-only Replay onboarding button removed
(`c4e9702`). Before building: 791 JS tests, the workspace typecheck, lint and the site check.

## iOS

- Build ID: `b313cf9c-72b6-4a81-b0c1-8c1a4af2ed3f`; version 1.0.0, build number 7; store.
- Status: FINISHED. [Download IPA](https://expo.dev/artifacts/eas/NtwoaiFC2I4LqkipRpY6bJk8-eyj8ngzjQwV20ea7cQ.ipa) · [Build page](https://expo.dev/accounts/ongodcr/projects/remitbridge/builds/b313cf9c-72b6-4a81-b0c1-8c1a4af2ed3f)
- Team QS9F7JU6H2 (individual; organization conversion pending with Apple).

## Android

- Build ID: `f7830e0f-616d-405e-bd03-de513b68aafb`; version 1.0.0, version code 11; store.
- Status: FINISHED. [Download AAB](https://expo.dev/artifacts/eas/k5FdF_I2NlHY3P9eZKMqQL7BpecSDR515yQj1m7D7EU.aab) · [Build page](https://expo.dev/accounts/ongodcr/projects/remitbridge/builds/f7830e0f-616d-405e-bd03-de513b68aafb)
- Saved to `~/Downloads/RemitBridge-1.0.0-11-play.aab` for the Play upload. The older AABs
  (version codes 8 and 10) were moved to the Trash.

## Next

1. Play: upload version code 11 to internal testing in place of the old 1.0.0 (8) draft,
   roll out to the tester list, then send Claude the App signing SHA-256 and SHA-1.
2. iOS waits for Apple's organization conversion before App Store Connect.
