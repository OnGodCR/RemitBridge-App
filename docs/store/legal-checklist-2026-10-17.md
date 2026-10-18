# Legal checklist, 2026-10-17

Angad's 20-point "so your app doesn't get sued" list, checked against the app, the site at
app.remitbridgelabs.org and the store drafts. "Fixed today" items are in commit history for
this date.

| # | Item | Status | Where / notes |
|---|---|---|---|
| 1 | Privacy policy | Done; fixed today | `site/privacy.html`, also inside the app (D188). Added three missing disclosures: the partner-link visit count on this site, the record of which terms version an account accepted, and Google's ML Kit. Last updated October 17, 2026. |
| 2 | Terms of service | Done | `site/terms.html`, inside the app, accepted by every account (D188). |
| 3 | Refund policy | Not needed | The app is free: no purchases, subscriptions or ads, so there is nothing to refund. The terms say it is free. |
| 4 | Cookie policy | Not needed; covered | The site sets no cookies. The privacy policy now says so, and describes the one thing the site does keep: a random ID in the browser on partner links. The app has no cookies. |
| 5 | Cookie consent banner | Not needed | No cookies and no third-party trackers. The partner-link visit count is first-party and disclosed. The app is US only. |
| 6 | Form consents | Done | Newsletter off by default (D169); receipt research off by default; a one-time AI permission before Remmy or the model (D175); route-request email optional, used once, then deleted; terms and privacy accepted with an unticked switch (D188). |
| 7 | No unnecessary data | Done | Accounts optional; a random install ID, not hardware or advertising IDs; WhatsApp numbers hashed; receipts covered on the phone before upload; birth year never stored, only pass or block. |
| 8 | Audit third-party SDKs | Done; fixed today | Every service that receives data is named in the privacy policy (Supabase, Resend, Apple, Google, Expo, Groq, Cloudflare, Meta, GitHub, Vercel, Frankfurter); Google's ML Kit added today. The security audit found no ad or analytics SDKs. Play's install-referrer library is linked by expo-application but never called. |
| 9 | Remove dark patterns | Done | No pre-ticked boxes; declining the terms is a visible button that keeps the app usable; unsubscribe and account deletion are one step each; no countdowns or confirmshaming. |
| 10 | Remove hidden fees | Done | The app is free. Its whole job is showing transfer fees and exchange-rate markups. |
| 11 | Remove fake reviews | Done | No reviews, ratings or testimonials anywhere. |
| 12 | Remove unsupported claims | Done; fixed today | Every figure names its source. "Your receipt was already the cheapest" now says "the cheapest we found", in all five languages. The ranking is described as by amount received, not a recommendation. |
| 13 | Accessibility alt text | Done | App: accessibility pass (D70). Site: all 25 images have alt text. |
| 14 | Color contrast | Done | App: AA (D70). Site: text colors pass AA on their backgrounds. |
| 15 | Keyboard navigation | Done | Site: every control is a real link or button, and focus outlines aren't hidden. The app follows VoiceOver and TalkBack instead. |
| 16 | Business details | Done | RemitBridge Labs, a Washington nonprofit corporation, and hello@remitbridgelabs.org, in the terms, the privacy policy, the site footer and Account. No public mailing address, by Angad's choice (the support page says to email for it). |
| 17 | Age consent for kids' data | Done | A neutral birth-year check before any account; 13 or under can't make one (D164). Play's target audience is 18 and over. |
| 18 | Unsubscribe link in emails | Done | Every newsletter has an unsubscribe link and one-tap List-Unsubscribe headers. The route-launch email is a single message someone asked for, after which their address is deleted. Sign-in codes are transactional. |
| 19 | License fonts and images | Done; added today | New page app.remitbridgelabs.org/licenses, linked from Account and the site footer: both fonts (OFL), flags (public domain), Lucide icons (ISC), and all 364 open-source packages in the app with their copyright lines and full license texts. Regenerate with `node site/licenses-page.mjs` after changing the app's dependencies. |
| 20 | Data deletion request | Done | Account > Delete account deletes everything at once; by email from the support page; Play's deletion URL is set. |

## After launch

- `site/p.html` says the app is "coming soon" to the stores. Change it once both listings are live.
- The legal review of the privacy policy and terms is still Angad's (they say draft in source).
