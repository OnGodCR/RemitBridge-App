# Completed production builds, 2026-10-16

Angad authorized fresh iOS and Android production builds. These are build requests only;
no automatic submission, public release or paid upgrade was requested.

Source: `ff6af09c59a020a2af765fb6644460684d63f796` (since the 2026-10-17 history rewrite: `6ba381d`; same files), including the Remmy advice disclaimer.
A clean detached checkout at `/private/tmp/remitbridge-release-ff6af09` preserves the
uncommitted quote-card edit in the primary workspace; that edit is not in these builds.
The clean source passes 231 mobile tests, mobile typecheck and lint.

## Android

- Build ID: `27908f86-1347-4fd0-9d45-0bfb457f330e`
- Profile: production; distribution: store; version 1.0.0; version code 8.
- Status: FINISHED. Store AAB available (150,305,152 bytes).
- [Download AAB](https://expo.dev/artifacts/eas/oFGLwnFyekToblgHBQbzjTIFtyDDuabkXEAGTs2Vqis.aab)
- [Build page](https://expo.dev/accounts/ongodcr/projects/remitbridge/builds/27908f86-1347-4fd0-9d45-0bfb457f330e)
- Existing remote Android keystore reused with frozen credentials.
- The initial archive upload failed for local disk space before a build job was created;
  version code 7 was reserved. A temporary `.easignore` copied the existing secret/cache
  exclusions and additionally excluded Git metadata, graph, research, engine, benchmark,
  documentation and non-runtime website assets. The 10.4 MB upload then succeeded. Runtime
  mobile/packages source, assets, patches and site config remain included. No personal
  files were deleted. The packaging exclusion exists only in the build checkout.

## iOS

- Build ID: `b44747b9-818f-4850-a1ad-591e4ceaebc9`
- Profile: production; distribution: store; version 1.0.0; build number 5.
- Status: FINISHED. IPA available (60,670,660 bytes).
- [Build page](https://expo.dev/accounts/ongodcr/projects/remitbridge/builds/b44747b9-818f-4850-a1ad-591e4ceaebc9)
- [Download IPA](https://expo.dev/artifacts/eas/WhEQ8TGmGcP2lYaTtzXS85QF2w11mWYjNiVq54D2Bkw.ipa)
- Angad completed Apple sign-in, chose the existing distribution certificate and created
  the App Store provisioning profile directly in his terminal. Credentials were saved on EAS.
- His upload then failed with ENOSPC. Codex removed only the obsolete, reinstallable
  EAS CLI 24.13 download cache (about 160 MB), restoring about 300 MB free, and retried
  with the saved credentials frozen. Upload and cloud build succeeded without another login.
- Signing uses Rahul Kochar's current individual Apple team. Organization conversion is
  still a separate publication gate; recheck the team/profile after it completes.
- Build counters 2 through 4 were reserved during setup/upload attempts, not completed builds.
- Temporary source checkout is retained because the user's terminal is currently in it;
  it can be removed when no longer needed. No new build is needed merely to record these docs.

## Artifact metadata inspection

Downloaded only ZIP directory and manifest/plist ranges, not the full packages, to avoid
using scarce Mac disk space. This is metadata inspection, not a cryptographic signature
verification or full SDK/reachable-code security audit.

- Android: package `org.remitbridgelabs.app`, version 1.0.0 (8), min SDK 24, target SDK 36,
  allowBackup false, no debuggable attribute present. Camera/notification permissions are
  present; AD_ID, microphone, broad storage/media and location permissions are absent.
  JAR signature entries and application DEX are present.
- iOS: bundle `org.remitbridgelabs.app`, version 1.0.0 (5), minimum iOS 16.4, non-exempt
  encryption false. Specific receipt camera/photo purpose strings present; microphone
  purpose absent. App privacy manifest, code-signature resources and provisioning profile
  present. App manifest declares tracking false and required-reason API entries for file
  timestamps (C617.1), UserDefaults (CA92.1, C56D.1) and boot time (35F9.1).
- Both artifacts identify the same source commit shown above. These checks do not establish
  real-device behavior, App Privacy/Data safety answers or legal approval.

## Still separate

Full artifact/security review, TestFlight/Play internal-test installation, store forms and
submission remain separate release gates. A production Android AAB is not directly
installable like an APK. iPhone testing still requires the signed device/store build.

## Signing command troubleshooting

The visible Codex terminal initially returned `zsh: command not found: npx`: its PATH
omitted `/opt/homebrew/bin`, where Node and npx are installed. Prefixing PATH with `/opt/homebrew/bin` was verified in a minimal shell and the user successfully ran EAS afterward. Codex opened the terminal panel but its available controls
cannot type into that panel; the account holder pastes the command and enters Apple sign-in.

Angad also confirmed Google Play verification fully complete on 2026-10-16, with first-app
creation now available. Creating that record and uploading the AAB are still separate steps.
