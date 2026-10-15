# Store listings: what to paste (D123)

Everything the App Store and Google Play ask for, drafted so the account holder can paste it
under the intended RemitBridge Labs organization accounts. Organization verification and D-U-N-S remain release gates. Answers
follow `site/privacy.html` exactly. If the app or the policy changes, change both.

Character limits are the stores' own, and every field below fits.

## Shared

| Field | Value |
|---|---|
| App name | RemitBridge |
| Bundle ID / package | `org.remitbridgelabs.app` (both stores) |
| Category | Finance (Apple secondary: Education) |
| Price | Free. No in-app purchases, no ads, no subscriptions |
| Support URL | https://app.remitbridgelabs.org/support |
| Privacy policy URL | https://app.remitbridgelabs.org/privacy |
| Terms of use URL | https://app.remitbridgelabs.org/terms (D141) |
| Marketing / website URL | https://app.remitbridgelabs.org |
| Contact email | `CONTACT_EMAIL` in `site/site.config.json`: hello@remitbridgelabs.org (forwarding confirmed) |
| Developer / seller name | Comes from the developer account, not from here: today Angad's dad's name (individual accounts, D134). It becomes RemitBridge Labs only with Organization accounts, which need the corporation's D-U-N-S number (D141, D146). Publish only after the conversion, so the seller is the corporation, not a person |
| Copyright | 2026 RemitBridge Labs |

## App Store

**Subtitle** (30 max, this is 26):

```
True cost of sending money
```

**Promotional text** (170 max):

```
Compare bank-funded transfers, scan receipts and ask Remmy about costs. See who delivers the most, learn with games, and check each price's collection time.
```

**Keywords** (100 max, no spaces after commas):

```
remittance,send money,exchange rate,transfer fee,compare,India,Mexico,Philippines,Vietnam,receipt
```

**Description** (4000 max):

```
RemitBridge shows what it really costs to send money from the US to family abroad.

Every transfer has two costs: the fee you can see, and a markup hidden in the exchange rate. RemitBridge splits them apart, so you can see the whole cost and what your family actually receives.

SCAN A RECEIPT
Take a photo of a transfer receipt. RemitBridge reads it on your phone, covers your name, address and account numbers before anything is sent, and shows:
- the true cost: fee, exchange-rate markup, tax and pickup charges
- whether the 1% federal remittance tax was charged correctly
- what you could have kept with the cheapest provider we had prices for

COMPARE PROVIDERS
Choose a country, an amount and how the money should arrive. Providers are ranked by how much your family receives, never by who pays us, because nobody does. Bank-account funding only. RemitBridge choice marks the highest listed standard amount received; promotions are separate. Tap a price for its source and collection time. Hand-checked quotes may remain eligible for up to seven days. Confirm the provider's final price.

ASK REMMY
Ask about costs, open a comparison or settings, and start a lesson. Saving a comparison needs your tap. AI answers can be wrong; do not share private details. Chat uses Cloudflare or Groq after your permission, and you can report replies in the app.

RATE ALERTS
Pick a target and get one notification when a provider's price reaches it.

LEARN
Lessons and games explain rates, fees, markups and scams, with tools to check a rate and add up a year of sending. An optional newsletter brings updates; unsubscribe anytime.

WHAT REMITBRIDGE DOES NOT DO
RemitBridge never moves money. There is no "send" button, no affiliate links and no advertising. Comparing prices needs no account.

Supports routes from the US to 26 countries, including India, Mexico, the Philippines and Vietnam. Available quotes vary by route, amount and receiving method; request more countries in the app.
```

**What's New** (first version):

```
The first version of RemitBridge.
```

### App Privacy ("nutrition label")

Tracking: **No**. The app doesn't track people across other companies' apps or websites.

| Data type (Apple's name) | Collected | Linked to the person | Used for tracking | Purposes |
|---|---|---|---|---|
| Contact Info: Email Address | Yes, with an account; or given on a route request (deleted once the launch email is sent) | Yes | No | App Functionality, Developer's Advertising or Marketing (the opt-in newsletter, D169) |
| Contact Info: Name | Yes, if given or shared by Apple/Google | Yes | No | App Functionality |
| Financial Info: Other Financial Info (saved transfers, receipt values) | Yes | Yes for saved items; No for scanned receipts | No | App Functionality, Analytics (receipt totals) |
| User Content: Photos or Videos (the covered receipt photo, kept only with "Keep for research") | Yes | No | No | App Functionality, Other Purposes (research totals) |
| User Content: Other User Content (saved comparisons, notes, submitted suggestions and reported AI replies) | Yes | Yes for saved items; suggestions/reports have no attached account ID but may contain personal text | No | App Functionality, Other Purposes (moderation) |
| Identifiers: User ID (account, and the random install ID) | Yes | Yes | No | App Functionality, Analytics |
| Identifiers: Device ID (notification token, for rate alerts) | Yes | Yes | No | App Functionality |
| Usage Data: Product Interaction | Yes | Yes when signed in; otherwise pseudonymous install ID | No | Analytics |
| Diagnostics: Other Diagnostic Data (Remmy failures/limits) | Yes | Pseudonymous install ID; treat as linked unless identity is irreversibly removed | No | App Functionality, Analytics |

Not collected: location, contacts, browsing or search history, health, sensitive info,
purchases, advertising data.

Remmy chat text and recent history reach our backend and Cloudflare/Groq for immediate processing. Apply Apple's collection definition to transient processing, but declare retained suggestions/reports as user content and operational diagnostics. Do not omit data merely because accounts are optional. Installation IDs can remain after account deletion. Check the final SDK inventory and production configuration before completing the form.

Reviewed against current Apple guidance on 2026-10-14; final forms must match the submitted build:

- **Third-party AI (5.1.2(i)):** the covered receipt text, and sometimes the covered photo,
  can go to Groq's model. The scan screen says so every time, and the app asks once, with
  Allow / Not now, before the first receipt is sent. The policy says the same.
  Remmy, the in-app assistant (D175), sends what the person types to Cloudflare's or Groq's
  model; it asks the same way, once, before the first message, and says under the chat
  box that it uses an AI model.
- **Account deletion (5.1.1(v)):** in the app, Account > Delete account. For Sign in with
  Apple accounts, the app gets a fresh code from Apple's sheet and the server revokes the
  grant through Apple's REST API (needs the `APPLE_*` secrets).
- **Sign in with Apple (4.8):** offered alongside Google and email, first in the list.
- **Privacy manifest:** the build assembles the app's PrivacyInfo.xcprivacy from every
  library's own (React Native's "Privacy Manifest Aggregation"); inspect the final merged archive for required-reason declarations used by app and SDK code. Do not assume source configuration proves the manifest is complete. Tracking: none, so no App Tracking Transparency prompt.
- **Permissions:** camera and photos only when scanning, notifications only when turning
  on an alert, each with a purpose string; no location, microphone or contacts.
- **Privacy policy:** linked in App Store Connect and in the app (Account > Privacy policy).

### Age rating

Complete the current App Store Connect questionnaire truthfully for the submitted build,
including AI/chat capabilities, safety controls and linked content. Do not answer None to
all questions or promise a 4+ result. Use the rating Apple calculates and any required
regional declarations. Made for Kids stays off. Accounts require age 13+, while Play's
intended audience is adults sending money. These are separate from the content rating.

### Notes for App Review

```
RemitBridge is a free information tool. It compares the cost of sending money from the US to family abroad and never moves money: there is no send button, no payments and no affiliate links.

No account is needed: open the app, go to Compare, and prices load for the US to 26 countries, including India, Mexico, the Philippines and Vietnam. Signing in (email code, Sign in with Apple, or Google) is optional and enables saved comparisons, manually entered transfers and rate alerts. Scans do not require an account.

Scan (the second tab, after Compare) reads a photo of a money-transfer receipt. To test it without a receipt of your own, open this sample on another screen and photograph it, or save it to Photos and use "Choose a photo": https://app.remitbridgelabs.org/review/sample-receipt.jpg (every name and number on it is made up). Personal details are covered on the phone before anything is sent. When our own rules can't read a figure, the covered text (and sometimes the covered photo) goes to Groq's AI model with zero data retention; the app asks permission before the first receipt is sent.

Creating an account first asks for a year of birth (a neutral age screen; accounts are for 13 and older). The year is never stored or sent.

The WhatsApp tab links to our WhatsApp bot (+1 601-980-1089), which answers the same price questions in a chat.

Prices come from providers' public prices (Wise with written permission, Instarem's public quote endpoint) and from prices checked by hand. Tap a price to see its source and original collection time. Compare shows bank-account funding only. RemitBridge choice marks the highest listed standard amount received; promotions are separate. Hand-checked quotes can remain eligible for up to seven days.

Remmy: tap the assistant, allow the AI disclosure, and ask "open account settings". Return to Remmy: the action must not repeat. Ask "compare 500 to India" or "start a lesson about scams". Saving requires a separate tap and optional sign-in. Use Report reply below an AI answer; cancel sends nothing, confirm submits only that answer for moderation. AI limits can make replies unavailable; ordinary navigation and Compare remain accessible. New chat clears local chat memory, not submitted reports.

Account deletion: Account > Delete account.
Contact: hello@remitbridgelabs.org
```

Export compliance: answered in the app's config (`usesNonExemptEncryption: false`), so App
Store Connect won't ask on each upload. The app uses HTTPS, and encrypts its own sign-in
session on the phone with the operating system's AES (CryptoKit on iOS, through expo-crypto,
D135): encryption that only protects the app's own data is exempt, so the answer stays no.

## Google Play

**Short description** (80 max, this is 77):

```
See the fee and the hidden exchange-rate markup, and compare who sends most.
```

**Full description**: the App Store description above (it fits Play's 4000 too).

### Data safety

- Is data collected or shared? **Collected: yes. Shared: no.** Supabase, Resend, Expo,
  Apple, Google, Cloudflare and Groq process data on RemitBridge's behalf, which Google counts as
  service providers, not sharing.
- Is all data encrypted in transit? **Yes.**
- Can people ask for their data to be deleted? **Yes**: in the app (Account > Delete
  account) and by email. Account deletion URL for the form:
  https://app.remitbridgelabs.org/support

| Data type (Google's name) | Collected | Optional | Purposes |
|---|---|---|---|
| Personal info: Email address | Yes | Yes (accounts are optional) | Account management, App functionality, Developer communications (the opt-in newsletter, D169) |
| Personal info: Name | Yes | Yes | App functionality |
| Personal info: User IDs | Yes | No (a random install ID) | Analytics, App functionality |
| Financial info: Other financial info | Yes | Yes | App functionality, Analytics |
| Photos and videos: Photos | Yes | Yes (only when scanning; kept only with consent) | App functionality, Analytics |
| App activity: App interactions | Yes | No | Analytics |
| App activity: Other user-generated content (Remmy prompts/history, suggestions and reported replies) | Yes; chats processed ephemerally, suggestions/reports retained | Yes | App functionality, Fraud prevention/security, Analytics (moderation) |
| App info and performance: Diagnostics | Yes | No | App functionality, Analytics |
| Device or other IDs | Yes | Yes (rate alerts only) | App functionality |

Not collected: location, contacts, audio, calendar, health, web browsing, purchase history.

Declare chat input even when processed ephemerally, following the form's ephemeral-processing question. Use Other user-generated content for AI chat and reports; classify any developer-support messages in the category the current form specifies. Random install IDs are mandatory operational identifiers, not only optional alert tokens. Recheck each service-provider sharing exemption against actual contracts; do not treat every third party as exempt automatically.

### Financial features declaration

Complete the current financial-features declaration for the informational comparison,
financial education and calculators actually provided. Do not automatically choose no
financial features. If the form's available categories require Other, describe these
functions and explain that RemitBridge does not execute transfers, hold funds, lend or
invest. Resolve the console's classification before submission.

### Content rating (IARC questionnaire)

- Category: **Reference, News, or Educational**.
- Violence, sexuality, language, controlled substances, gambling: **No** to all.
- Do users interact or exchange content with each other? **No.**
- Does the app share the user's location? **No.**
- Does the app allow digital purchases? **No.**
- Declare AI-generated answers and reporting/safety controls wherever asked. Use the assigned result, not a predetermined rating.

### Target audience and content

- Target age group: **18 and over** (people sending money). This keeps the app out of the
  Families program, which it isn't designed for.
- Contains ads: **No.**
- Government app: **No.** News app: **No** (the blog is learning material).

### App access

Select the access answer that reflects account-gated Saved, alerts and deletion. Provide working review access/instructions if requested; do not claim every feature works signed out. Signing in is optional
(an email code, Sign in with Apple or Google, all self-serve), and Compare, Learn, Remmy and scanning work signed out. If a reviewer wants to try Scan without a receipt, the same sample as Apple's:
https://app.remitbridgelabs.org/review/sample-receipt.jpg

### Advertising ID

"Does your app use advertising ID?" **No.** The app has no ads and no analytics SDK, and
the build blocks the `AD_ID` permission so no library can add it.

### Store settings and graphics

- App category: **Finance**. Tags: personal finance, money transfer, education.
- Contact: hello@remitbridgelabs.org, website https://app.remitbridgelabs.org.
- App icon: `docs/store/play-icon-512.png` (512 × 512).
- Feature graphic: `docs/store/play-feature-graphic.png` (1024 × 500).
- Phone screenshots: 2 to 8, PNG or JPEG, each side 320 to 3840 px, and the long side no
  more than twice the short side. Take them on the Android phone (Play wants the Android
  app as it looks there); most phones' screenshots fit, but a 20:9 phone's full-height shot
  is over 2:1, so crop a little from the bottom.

### First release

App bundle: the production build's `.aab` from EAS (signed with the upload key EAS holds;
choose Google-generated app signing key when Play Console asks). Release name: use the new production version and actual auto-incremented build number. Older builds predate Remmy and must not be submitted.
Release notes:

```
First release. Compare what it costs to send money from the US to 26 countries, ranked by how much your family receives. Scan a transfer receipt to see what it really cost.
```

After the first upload, copy Play App Signing's SHA-256 and SHA-1 (Setup > App signing)
to Claude: the SHA-256 goes into `site/.well-known/assetlinks.json` (links open the app) and
the SHA-1 into a second Android sign-in client in Google Cloud (Google sign-in keeps working
on Play installs).

### Closed test (required before the first public release)

Only for a personal account; the organization account in RemitBridge Labs' name (D143)
skips it. New personal accounts must run a closed test with **at least 12 testers, opted in for 14
days in a row**, before applying for production. Message for testers:

```
Thanks for testing RemitBridge! It shows what it really costs to send money abroad.

1. Join the test with the link I sent, using the Google account on your Android phone.
2. Install RemitBridge from the Play Store page the link opens.
3. Keep it installed for at least 14 days, and open it a few times: try Compare, a tool or two, and Learn.
4. If anything looks wrong or confusing, tell me what you were doing and what you expected.

You don't need an account, and the app never asks for money or bank details.
```

## Screenshots (from a development build, D59)

- **iPhone 6.9" (required):** 1320 × 2868, captured 2026-10-12, now requiring refresh for Remmy, games and revised Compare, in
  `docs/store/screenshots/iphone-6.9/`: Scan, Compare, a quote's detail, Yearly cost, Learn,
  WhatsApp.
- **Android phone:** see Store settings and graphics above.
- **Play feature graphic:** done, `docs/store/play-feature-graphic.png`.
- No device frames needed; no Expo Go dev button in any shot.

## Final submission gates (2026-10-14)

See [launch-checklist.md](../launch-checklist.md). These are drafts for the account holder,
not evidence that console forms, legal review or signed production builds are complete.
Refresh screenshots from the actual production UI, include Remmy and its safety/reporting
controls in review instructions, and verify all legal URLs without signing in.

Primary policy references:
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), especially 5.1.1 and 5.1.2.
- [Apple App Privacy definitions](https://developer.apple.com/app-store/app-privacy-details/).
- [Google Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en).
- [Google AI-generated content](https://support.google.com/googleplay/android-developer/answer/13985936?hl=en).
