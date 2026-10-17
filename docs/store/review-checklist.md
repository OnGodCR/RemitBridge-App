# App review checklist (2026-10-17)

Angad's 20-point list, checked against the code, the store drafts and the Play Console on
2026-10-17. "Done" means checked in source or in the console; device checks still need a
TestFlight or Play internal-test build.

| # | Item | Status | Where / what's left |
|---|---|---|---|
| 1 | No placeholder text | Done | No lorem, TODO or TBD in any screen. "Coming soon" exists in two places but never shows: WhatsApp is live, and no country in the pickers is disabled. |
| 2 | Every button works | Needs a device | 234 app tests pass and no button has an empty handler. Tap through every screen on the TestFlight and Play builds. |
| 3 | Demo login for the reviewer | Built, not live | D184: review@remitbridgelabs.org gets a password field. Left: `supabase db push`, create the account, add its row, type it into Play and App Store Connect, then a new build. |
| 4 | Privacy policy link | Done | Account > Privacy policy; https://app.remitbridgelabs.org/privacy in Play. |
| 5 | Delete account button | Done | Account > Delete account; Apple sign-ins are revoked (D145). Also by email on /support. |
| 6 | Sign in with Apple next to Google | Done | Shown first on iPhone (D29, guideline 4.8). |
| 7 | Restore purchases | Not needed | No in-app purchases. |
| 8 | Full price on the paywall | Not needed | No paywall, no subscriptions. |
| 9 | Terms of use link | Done | Account > Terms of use; https://app.remitbridgelabs.org/terms. |
| 10 | Ask before tracking | Not needed | No tracking and no ad SDKs; the privacy manifest says tracking is false, so no ATT prompt. |
| 11 | Explain the camera | Done | Camera and photo purpose strings in app.json; permission is asked only when scanning. |
| 12 | No "beta" anywhere | Done, one judgment call | No "beta", "test" or "preview build". Spanish, Tagalog and Vietnamese are labelled "Draft, not yet checked by a fluent speaker" (D151). That's honest, not beta, but Angad may hide those three languages in the iOS build if he'd rather not risk it. |
| 13 | Real screenshots | Needs a device check | The set in ~/Desktop/RemitBridge-App-Store is the real UI and live prices, captured from the web render. Remmy's header and send icons draw blank there; compare with TestFlight and retake those if they differ. |
| 14 | Never mention Android | Done | No Android or Google Play in the app's strings or the App Store text. The privacy policy names both platforms, which is expected. |
| 15 | Test on iPad | Done in compatibility mode; full screen built | 2026-10-17: the current dev build ran on the iPad Pro 11-inch simulator in iPhone compatibility mode (welcome, why it matters and route picker work). Angad asked for full screen (D185): `supportsTablet` is now true, with content in a centered 640-point column; checked in the web render at 834 points. Left: run the next build on the iPad simulator, and take 13-inch iPad screenshots for App Store Connect. |
| 16 | Report and block | Done | Remmy has Report reply (D180). People can't message each other, so there's nothing to block. |
| 17 | Say when data goes to AI | Done | A one-time permission before the first Remmy message and before the first receipt goes to the model; a note under the chat; privacy policy. |
| 18 | No copied names or icons | Done | Providers appear by name only, no logos. The WhatsApp tab uses a plain chat symbol, not WhatsApp's logo. |
| 19 | No crashes | Needs a device | Tests pass and the web render shows no errors. Only a real build proves it; the Android sign-in crash was fixed (D129). |
| 20 | API keys off the app | Done | The app holds only the Supabase publishable key and Google OAuth client IDs, which are public by design. Groq, Cloudflare, Resend, Meta and Apple keys live in Supabase secrets. |

## Play Console, 2026-10-17

Done: Advertising ID (no), Government apps (no), Health (none), Financial features (Other,
informational only), Content rating (Everyone, PEGI 3, all ages; IARC terms accepted by Angad),
internal tester list, new store description and short line.
Saved as drafts: Data safety (waits for Target audience) and the store listing (needs the icon,
feature graphic and screenshots uploaded).
Left: Sign in details (after D184 goes live), Target audience, the graphics, and the new AAB.
