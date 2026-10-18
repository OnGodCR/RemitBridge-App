# Production builds, 2026-10-18 (third round, D190 and D191)

Replace iOS 7 and Android 11 (`release-builds-2026-10-18b.md`), which offered UPI and other
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
2. Angad installs it from the internal test link and checks Compare (no UPI, no Uganda),
   Learn progress after sign-in, and sign-in.
3. Production: replace the 1.0.0 (11) draft with 12, then send for review on Angad's word.
