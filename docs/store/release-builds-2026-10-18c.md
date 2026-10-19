# Production builds, 2026-10-18 (third round, D190 and D191)

Replace iOS 7 and Android 11, which offered UPI and other
methods with no prices, showed Uganda and summary-only posts, and kept Learn progress on
the phone only. Before building: 797 JS tests, typecheck, lint, the site check, the RLS
smoke test 81/81 live; `learn_progress` migration run by Angad; `remmy` and `whatsapp`
redeployed by Angad. Builds only: nothing submitted.

Source: `39a1919` on `main` (app code `d015de8`).

## iOS

- Build ID: `ad19a66c-14ee-496c-b22b-538303a3a154`; version 1.0.0, build number 8; store.
- Status: FINISHED. [Download IPA](https://expo.dev/artifacts/eas/xUP9ioYDCi9rmTyhD3QUZ1aLTU9afbU_UueFhvyl-NI.ipa)
- [Build page](https://expo.dev/accounts/ongodcr/projects/remitbridge/builds/ad19a66c-14ee-496c-b22b-538303a3a154)

## Android

- Build ID: `65789764-841f-4b5d-8124-9cd73b2dfcf3`; version 1.0.0, version code 12; store.
- Status: FINISHED. [Download AAB](https://expo.dev/artifacts/eas/kSZJe7gDTEtUH5sIKniEJvpRlNRi6xByEwXC-SNI3l0.aab); saved to `~/Downloads/RemitBridge-1.0.0-12-play.aab`.
- [Build page](https://expo.dev/accounts/ongodcr/projects/remitbridge/builds/65789764-841f-4b5d-8124-9cd73b2dfcf3)

## Next

1. Play internal testing: version code 12 published to the tester list, 2026-10-18 3:14 PM (Claude, on Angad's "do the tester stuff"). Notes copied from 11; the one warning is the optional deobfuscation file.
2. Angad tested 12 on his phone: "Version 12 works on my phone" (2026-10-18).
3. Production: the draft now holds only 12, named 1.0.0 (12), United States, same notes.
   **Sent to Google for review 2026-10-18** on Angad's word ("Replace the production draft
   with 12 and send it for review"): 10 changes (release, country, store listing, content
   rating, target audience, privacy policy, ads, data safety, health apps, category).
   Managed publishing is off, so Play publishes as soon as Google approves; reviews usually
   take up to 7 days.
