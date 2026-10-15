# Publication audit, 2026-10-14

**Status: source updated; submission remains gated.** This audit covers the mobile app,
its shared Supabase agent code, app-domain pages in this repository, and store materials.
It does not certify legal compliance, account status, production deployment or store approval.

## Changes

Privacy/terms/support and the app-domain overview now describe Remmy's tools, Cloudflare
and Groq processing, recent history, pseudonymous operational identifiers, diagnostic events,
local conversation lifetime, separate suggestion/report storage, lesson/game progress,
optional newsletter and rate alerts. Corrected account-deletion language: removing the
account link does not anonymize installation-level events. Removed absolute provider
retention language and explained service metadata.

Compare documentation now reflects bank-account funding, RemitBridge choice for the
highest listed standard payout, separate promotions, original collection times in details,
seven-day manual eligibility and final-provider verification. The label is not paid placement
or personalized advice. Receipt/calculator funding methods remain independent.

Remmy now has Report reply, with explicit confirmation before sending only the selected
reply to the existing suggestions moderation inbox. It sends no prompt/history or attached
account/install ID in the stored report. The transport uses an installation ID for a
five-report daily abuse limit; the limit fails closed. Reports are capped to fit the existing
1000-character suggestion field. No new migration or third-party reporting service.
Existing users see the corrected AI-sharing permission again, and a persistent AI warning
links to privacy during a chat. Added safety instructions and removed arbitrary exception
text from agent failure logs/metrics. These measures still require live adversarial testing.

The shared agent price query now matches Compare's bank funding, eligible manual-price
view and nearby checked-amount selection. Previously Remmy queried latest_quotes without
funding restrictions. Expanded the function TypeScript check to include Remmy and fixed
three pre-existing unsafe accesses of `now` on a possible save action.

Updated six SDK-compatible Expo patch dependencies. Nonbreaking audit fixes upgraded
shell-quote. Upgraded development-only Vitest from 2.1 to 4.1.11 to remove critical test-runner
advisories; all existing tests pass without changing their assertions for the migration.

## Verified locally

- 785 tests pass: 231 mobile, 204 bot/Edge harness, 294 receipt, 56 formula.
- Workspace typechecks pass, including scan-receipt, WhatsApp and now Remmy functions.
- Mobile Expo lint passes; site validation and generated build pass.
- Expo Doctor: 21/21 after the SDK patch updates.
- Generated privacy page inspected in the browser, including Remmy section and navigation.
- Report test verifies explicit submission excludes prompt/history and stored identifiers;
  rejection/unavailable limiter fails closed; client failure remains retryable.
- Price regression verifies bank funding and eligible three-day manual rows with original time.
- Previous scanner test act warning and intentional secure-session error-path warnings remain.

## Dependency security gate

Full-workspace npm audit after fixes: **70 advisories: 54 high, 16 moderate, 0 critical**.
These are npm dependency/advisory counts, not 70 independently exploitable mobile flaws.
Many are propagated through Metro, Jest, Expo CLI or native libraries' tooling dependencies.
The audit is not clean. A signed-bundle inventory and reachable-code review are still needed.
Do not waive these because Expo Doctor passes, and do not run audit fix --force, which
proposes incompatible Expo/React Native downgrades and cross-SDK upgrades.

Examples requiring follow-up:

| Dependency | Reported issue / action |
|---|---|
| braces / micromatch | High denial of service, propagated through Jest/Metro; no safe upstream fix reported by npm. Assess untrusted pattern reachability. |
| node-forge | High signature-verification issue in Expo code-signing tooling. Review signing-path exposure and upstream patch. |
| decode-uri-component / query-string | Moderate malformed-input denial of service through Expo Router; inspect deep-link parsing in release runtime and use a supported patch when available. |
| sprintf-js / argparse | Moderate unbounded precision denial of service in test/config tooling. Review reachability. |
| uuid / xcode | Moderate buffer bounds advisory in native project generation tooling. Review use and supported upstream patch. |

npm's scoped install reported zero for the three Vitest workspaces; the **full-workspace**
audit still reports the counts above. Only the full-workspace result is used here.

## Still required

Use [the launch checklist](../launch-checklist.md) for owners and commands. Production
functions are intentionally not deployed by this audit: the project handoff assigns those
deploys to Angad. New signed builds and real-device evidence are required, along with
organization/store setup, updated console declarations, screenshots, legal review and the
new translation review. No console forms, support emails, paid builds or submissions were sent.

The separate marketing website is excluded by the checkout's explicit repository boundary.
Its concrete update brief is [website-handoff.md](website-handoff.md).

## Primary references checked

- [Apple review guidelines](https://developer.apple.com/app-store/review/guidelines/): explicit third-party AI permission, privacy and deletion.
- [Apple App Privacy definitions](https://developer.apple.com/app-store/app-privacy-details/).
- [Apple age rating questionnaire](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/): use the actual questionnaire; no blanket 4+ answer.
- [Google AI-generated content](https://support.google.com/googleplay/android-developer/answer/13985936?hl=en): in-app reporting and restricted-content controls.
- [Google Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en): off-device and ephemeral processing.
- [Google financial-features declaration](https://support.google.com/googleplay/android-developer/answer/13849271?hl=en): declare the actual informational functions; no automatic none answer.
- [Cloudflare data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/).
- [Groq Your Data](https://console.groq.com/docs/your-data): ZDR content versus retained usage metadata.
- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) and local Expo Doctor.
- [Vitest 4 migration](https://v4.vitest.dev/guide/migration.html).
