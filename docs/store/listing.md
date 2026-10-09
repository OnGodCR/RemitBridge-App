# Store listings: what to paste (D123)

Everything the App Store and Google Play ask for, drafted so the account holder can paste it
(Angad's dad holds both accounts until Angad is 18; the apps move to Angad then). Answers
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
| Contact email | `CONTACT_EMAIL` in `site/site.config.json`: hello@remitbridgelabs.org once Angad confirms its forwarding works (D141) |
| Developer / seller name | Comes from the developer account, not from here: today Angad's dad's name (individual accounts, D134). It becomes RemitBridge Labs only with Organization accounts, which need the corporation's D-U-N-S number (D141, D146). Publish only after the conversion, so the seller is the corporation, not a person |
| Copyright | 2026 RemitBridge Labs |

## App Store

**Subtitle** (30 max, this is 26):

```
True cost of sending money
```

**Promotional text** (170 max):

```
Scan a transfer receipt to see the fee, the markup hidden in the exchange rate, and what you could have kept. Compare providers by what your family receives.
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
Choose a country, an amount and how the money should arrive. Providers are ranked by how much your family receives, never by who pays us, because nobody does. Every price says where it came from and when it was checked.

RATE ALERTS
Pick a target and get one notification when a provider's price reaches it.

LEARN
Short modules explain exchange rates, fees, markups and scams in plain words, with tools to check a rate, spot a scam, and add up a year of sending.

WHAT REMITBRIDGE DOES NOT DO
RemitBridge never moves money. There is no "send" button, no affiliate links and no advertising. Comparing prices needs no account.

Routes today: the US to India, Mexico, the Philippines and Vietnam, with more on request.
```

**What's New** (first version):

```
The first version of RemitBridge.
```

### App Privacy ("nutrition label")

Tracking: **No**. The app doesn't track people across other companies' apps or websites.

| Data type (Apple's name) | Collected | Linked to the person | Used for tracking | Purposes |
|---|---|---|---|---|
| Contact Info: Email Address | Yes, with an account; or given on a route request (deleted once the launch email is sent) | Yes | No | App Functionality |
| Contact Info: Name | Yes, if given or shared by Apple/Google | Yes | No | App Functionality |
| Financial Info: Other Financial Info (saved transfers, receipt values) | Yes | Yes for saved items; No for scanned receipts | No | App Functionality, Analytics (receipt totals) |
| User Content: Photos or Videos (the covered receipt photo, kept only with "Keep for research") | Yes | No | No | App Functionality, Other Purposes (research totals) |
| User Content: Other User Content (saved comparisons, notes) | Yes | Yes | No | App Functionality |
| Identifiers: User ID (account, and the random install ID) | Yes | Yes | No | App Functionality, Analytics |
| Identifiers: Device ID (notification token, for rate alerts) | Yes | Yes | No | App Functionality |
| Usage Data: Product Interaction | Yes | Yes when signed in | No | Analytics |

Not collected: location, contacts, browsing or search history, health, sensitive info,
diagnostics, purchases, advertising data.

Checked against Apple's rules on 2026-10-08 (D145):

- **Third-party AI (5.1.2(i)):** the covered receipt text, and sometimes the covered photo,
  can go to Groq's model. The scan screen says so every time, and the app asks once, with
  Allow / Not now, before the first receipt is sent. The policy says the same.
- **Account deletion (5.1.1(v)):** in the app, Account > Delete account. For Sign in with
  Apple accounts, the app gets a fresh code from Apple's sheet and the server revokes the
  grant through Apple's REST API (needs the `APPLE_*` secrets).
- **Sign in with Apple (4.8):** offered alongside Google and email, first in the list.
- **Privacy manifest:** the build assembles the app's PrivacyInfo.xcprivacy from every
  library's own (React Native's "Privacy Manifest Aggregation"); the app's own code calls no
  required-reason API directly. Tracking: none, so no App Tracking Transparency prompt.
- **Permissions:** camera and photos only when scanning, notifications only when turning
  on an alert, each with a purpose string; no location, microphone or contacts.
- **Privacy policy:** linked in App Store Connect and in the app (Account > Privacy policy).

### Age rating

Answer **None** or **No** to every content question (violence, profanity, gambling,
contests, mature themes, medical, alcohol). "Unrestricted web access": **No** (links open
specific pages only). Result: **4+**.

### Notes for App Review

```
RemitBridge is a free information tool. It compares the cost of sending money from the US to family abroad and never moves money: there is no send button, no payments and no affiliate links.

No account is needed: open the app, go to Compare, and prices load for the US to India, Mexico, the Philippines and Vietnam. Signing in (email code, Sign in with Apple, or Google) is optional and only saves comparisons, receipt checks and rate alerts.

Scan (the first tab) reads a photo of a money-transfer receipt. Any receipt photo from a money-transfer provider works; personal details are covered on the phone before anything is sent. When our own rules can't read a figure, the covered text (and sometimes the covered photo) goes to Groq's AI model with zero data retention; the app asks permission before the first receipt is sent.

Prices come from providers' public prices (Wise with written permission, Instarem's public quote endpoint) and from prices checked by hand. Each price shows its source and when it was checked.

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
  Apple, Google and Groq process data on RemitBridge's behalf, which Google counts as
  service providers, not sharing.
- Is all data encrypted in transit? **Yes.**
- Can people ask for their data to be deleted? **Yes**: in the app (Account > Delete
  account) and by email. Account deletion URL for the form:
  https://app.remitbridgelabs.org/support

| Data type (Google's name) | Collected | Optional | Purposes |
|---|---|---|---|
| Personal info: Email address | Yes | Yes (accounts are optional) | Account management, App functionality |
| Personal info: Name | Yes | Yes | App functionality |
| Personal info: User IDs | Yes | No (a random install ID) | Analytics, App functionality |
| Financial info: Other financial info | Yes | Yes | App functionality, Analytics |
| Photos and videos: Photos | Yes | Yes (only when scanning; kept only with consent) | App functionality, Analytics |
| App activity: App interactions | Yes | No | Analytics |
| Device or other IDs | Yes | Yes (rate alerts only) | App functionality |

Not collected: location, contacts, messages, audio, files, calendar, health, web browsing,
app info and performance, purchase history.

### Financial features declaration

Choose **"My app doesn't provide any financial features"**. RemitBridge shows information
about other companies' prices. It doesn't hold, send, lend, invest or exchange money.

### Content rating (IARC questionnaire)

- Category: **Reference, News, or Educational**.
- Violence, sexuality, language, controlled substances, gambling: **No** to all.
- Do users interact or exchange content with each other? **No.**
- Does the app share the user's location? **No.**
- Does the app allow digital purchases? **No.**
- Expected result: Everyone / PEGI 3.

### Target audience and content

- Target age group: **18 and over** (people sending money). This keeps the app out of the
  Families program, which it isn't designed for.
- Contains ads: **No.**
- Government app: **No.** News app: **No** (the blog is learning material).

### Closed test (required before the first public release)

New personal accounts must run a closed test with **at least 12 testers, opted in for 14
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

- **iPhone 6.9" (required):** 1320 × 2868. Six, in this order: Scan, a receipt result with
  "what you could have kept", Compare, a quote's detail, Learn's path, Tools.
- **Android phone:** at least 2 (same six work), 9:16 or 16:9, at least 1080 px wide.
- **Play feature graphic:** 1024 × 500, the bridge mark on brand green with "What it really
  costs to send money home".
- No device frames needed; no Expo Go dev button in any shot.
