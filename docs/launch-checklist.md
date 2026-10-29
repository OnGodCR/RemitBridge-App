# Publication readiness: App Store and Google Play

Updated 2026-10-16. **Not ready to submit yet.** This checklist distinguishes source
changes from deployment, signed builds, account verification and real-device evidence.
Older checked items are not proof that the latest version passed release testing.

## Prepared in source

- [x] Privacy, terms, support and app-domain overview updated for Remmy, lessons/games,
  newsletter, bank-account funding, RemitBridge choice and collection times in details.
- [x] AI consent names Cloudflare/Groq and discloses chat history; updated disclosure
  requires consent again. No message is sent when the person declines.
- [x] In-app Report reply with confirmation, success/error handling, backend moderation
  storage and rate limits. Reports contain the selected reply, not prompts/history.
- [x] Remmy actions run once per requested action; saving still needs a tap.
- [x] Shared Remmy/WhatsApp price tools use bank-account-funded compare_quotes, including
  eligible manual prices; original collection times are preserved.
- [x] Revised store descriptions, privacy/Data safety drafts, reviewer steps and rating
  guidance: [listing.md](store/listing.md).
- [x] Existing account deletion, Apple token revocation, optional authentication and
  just-in-time permission flows remain in source. Runtime verification remains below.

## Deploy and verify before building

- [x] Deployed `remmy` v11 and `whatsapp` v41 on 2026-10-14 after Angad explicitly authorized deployment. Both are ACTIVE; live navigation/validation checks pass. Both bundle shared agent code.
  No database migration is needed: reports use the existing `suggestions` table.
- [ ] Confirm report arrives in suggestions with prefix `[Remmy report]`, source `app`,
  text/language/date only. Cancel sends nothing. Network/server failure stays retryable.
- [x] Angad is responsible for reviewing Remmy reports/suggestions and acting on harmful
  outputs or obsolete records (confirmed 2026-10-14). New chat/account deletion do not delete them.
- [x] Public privacy/terms/support pages verified live without login; Angad confirmed the
  support mailbox receives mail and can reply (2026-10-14).
- [x] Angad confirmed account two-factor authentication and Groq zero-data-retention
  setting (2026-10-14).
- [ ] Verify Cloudflare production configuration and inspect production logs for raw prompts,
  replies, receipt text or unexpected personal data.
- [ ] Resolve or formally assess remaining dependency advisories: 70 full-workspace npm
  findings (54 high, 16 moderate, zero critical). See the audit; Expo Doctor is not a
  vulnerability or signed-bundle scan.
- [ ] Confirm receipt retention/deletion jobs, RLS, abuse limits, alert delivery and
  production function secrets. Use [security-review.md](security-review.md).
- [ ] Recheck public bank-funded quotes immediately before submission. Manual prices
  expire seven days after their original observation, not seven days after import.
  The Oct 14 import published 282 observations; held/incomplete rows must remain excluded.

Deployment commands, run from the repository root by the production operator:

```bash
supabase functions deploy remmy --project-ref gmzljjdnwndvqciqicbx
```

```bash
supabase functions deploy whatsapp --project-ref gmzljjdnwndvqciqicbx
```

## Organization and console gates: Angad/account holder

- [x] D-U-N-S received for RemitBridge Labs, confirmed by Angad 2026-10-14 (case 11089990).
- [x] Apple organization-conversion request submitted by Angad (2026-10-14).
- [x] Apple organization conversion complete (seen in Membership details 2026-10-28).
- [x] App Store Connect record created, app ID 6828251107; iOS 1.0.0 (8) uploaded 2026-10-28.
- [x] Google Play organization verification complete, confirmed by Angad 2026-10-16;
  he can now create the first app. App record/submission steps remain separate.
- [ ] Create/verify store app records for `org.remitbridgelabs.app`, intended US availability,
  agreements, reviewer contact and access instructions. No account was created in this audit.
- [ ] Complete current Apple privacy/age questionnaire and Play Data safety, financial
  features, content rating, target audience, access and deletion forms from listing.md.
  Do not use the old blanket 4+ or no-financial-features instructions.
- [ ] Owner/legal review of the revised privacy and terms, still marked draft in source.
  A code audit does not verify enforceability, jurisdictional disclosures or liability clauses.
- [x] New Hindi consent/report strings and changed choice label reviewed and approved,
  confirmed by Angad 2026-10-14. Spanish/Tagalog/Vietnamese remain drafts.
- [ ] Separate marketing website owner applies [website-handoff.md](store/website-handoff.md).
  This checkout's rules prohibit editing/deploying that separate repository from here.

## Build and release evidence

- [x] New production builds FINISHED from latest committed app source ff6af09: Android
  1.0.0 (8) and iOS 1.0.0 (5), 2026-10-16. Superseded by [the version 12 builds](store/release-builds-2026-10-18c.md).
  The uncommitted quote-card edit was preserved/excluded. Neither build submitted.
- [x] Basic artifact metadata inspected: expected identifiers/versions, Android target 36,
  blocked permissions absent, iOS purpose strings and aggregate privacy manifest present.
  Full security and real-device checks below remain separate.
- [ ] Confirm production environment points at the correct Supabase project and auth clients;
  no server-only keys in EXPO_PUBLIC variables. Verify signed binaries' SDK/target versions,
  permissions, privacy manifests, required-reason API declarations and absence of debug UI.
- [ ] Apple provisioning under the final team, and export-compliance answers for the actual
  binary. Do not infer the merged native manifest from app.json alone.
- [ ] Google Play App Signing SHA-256 in assetlinks and SHA-1 in Google OAuth, verified on
  a Play-installed build. Development-key authentication does not prove release authentication.
- [ ] Refresh iPhone and Android screenshots: actual final UI, Remmy, games and Compare choice.
  Existing October 12 images are historical assets, not current release evidence.
- [ ] Run the device acceptance checks below on a TestFlight iPhone and Play internal-test
  Android build, then run platform pre-launch/review checks and resolve findings.
- [ ] Account holder uploads/submits after these gates pass. Store approval is external.

Build commands, once organization/provisioning and deployment are ready, from `mobile/`:

```bash
npx eas-cli@latest build --profile production --platform ios
```

```bash
npx eas-cli@latest build --profile production --platform android
```

No paid build, account purchase or store submission is authorized by checking off a source change.

## Device acceptance checks

- [x] Android feature testing: Angad confirmed on 2026-10-14 that all new features were
  tested and work perfectly. This is user-reported feature validation in the existing
  Android setup; final Play-installed and iPhone acceptance checks remain below.


- [ ] Cold start and reload on real iPhone/Android, Wi-Fi and mobile data, with no Metro server.
- [ ] Compare: bank funding only; standard ranking and choice reflect largest payout;
  promotions separate; details show source/original time; estimates labelled; expired prices absent.
- [ ] Remmy: decline sends nothing; accept works; follow-up understands history; screen
  opens once; reopening never repeats it; fresh prompt can repeat intentionally; save needs tap.
- [ ] Remmy reporting: cancel/confirm, retry on error, report delivered and admin can review;
  harmful/scam-enabling/out-of-scope requests declined; no fabricated price on model failure.
- [ ] AI limits and network loss provide useful fallback; New chat clears local conversation.
- [ ] Scan: camera/library, denied permissions, blur rejection, all personal details covered
  before submission, review/additional cover, AI consent, correct fee/tax, research opt-in off
  by default, deletion and savings counter. Simulator build omits ML Kit and cannot prove this.
- [ ] Email/Google/Apple sign-in, sign-out, save, delete account, Apple grant revocation,
  newsletter opt-in/unsubscribe, alerts and push delivery with production signing.
- [ ] Lessons/games, glossary, accessible labels, large text, screen reader, light/dark themes,
  small-screen keyboard, all languages and legal/support links.

## Verification from this audit

Automated test/check results are recorded in [publication-audit.md](store/publication-audit.md).
Unperformed checks remain unchecked, including full device testing and store-console forms. Production deployment of these two functions is complete.
