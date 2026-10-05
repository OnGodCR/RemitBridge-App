# RemitBridge: context for the Congressional App Challenge 2026

Upload this file to a Claude project. It holds everything needed to draft Angad's
Congressional App Challenge (CAC) answers, video script and anything else the form asks for.
Facts are as of 2026-10-04.

## How to use this document

You are helping Angad Kochar, a high school student, fill in his Congressional App Challenge
application for RemitBridge, an app he built. Follow these rules:

1. **Draft, don't ghostwrite.** Angad rewrites every answer in his own words before
   submitting. Write in a plain, natural student voice he can easily make his own. Where an
   answer needs his personal experience (why he built it, what was hard, what he learned),
   leave a clearly marked `[bracket]` with prompts. Never invent his story.
2. **Respect word limits exactly.** Count words, and state the count under each draft.
3. **Only claim what is true today.** Section 6 says what is live and what isn't. Never say
   WhatsApp is live, that the app is in the App Store, or that any translation is finished.
4. **Disclose AI honestly.** RemitBridge was built with heavy help from Claude (Anthropic's AI
   coding assistant). Section 7 has the facts. If a question touches on how the app was made,
   be truthful about it.
5. **Writing style:**
   - No em dashes.
   - No "it's not X, it's Y" sentences.
   - No hype words ("revolutionary", "game-changing", "best deal").
   - Short sentences, plain words.
   - Use the product terms: *mid-market rate*, *exchange-rate markup*, *total cost*,
     *amount received*, *provider*, *route*.
6. **Name:** "RemitBridge" (short) or "RemitBridge Labs" (the organization). Never call it a
   charity, a 501(c)(3) or a nonprofit corporation. Its incorporation isn't accepted yet.

## 1. Contest basics

- **Deadline:** official October 26, 2026; Angad's own deadline is October 23.
- **Demo video:** 3 minutes at most. It must say his name, the app's name and what the app
  is for.
- **Form answers so far:**
  - Programming languages: Python, JavaScript (as TypeScript), Other: TypeScript, SQL.
  - Cover photo: done (600x800 JPEG of the TrueCost result screen).

## 2. The problem

- People in the US send hundreds of billions of dollars a year to family abroad.
- A transfer has two costs:
  - the **fee** you can see;
  - the **exchange-rate markup**: the provider gives a worse rate than the real
    (mid-market) rate and keeps the difference.
- Ads say "low fee" or "zero fee", so most senders never see the second cost.
- The global average cost of sending money is about **6.36%** (World Bank). The UN
  Sustainable Development Goal target is **3%**.
- Since January 2026, US transfers paid in cash carry a **1% federal remittance tax**. Many
  senders don't know whether they were charged it correctly. The IRS rules are still
  proposed, not final.

## 3. What RemitBridge does

A free mobile app for iPhone and Android, built with Expo/React Native.

- **Compare.** Pick a route (US to India, Mexico, the Philippines or Vietnam to start) and
  an amount. Providers are ranked by **amount received**: what the family actually gets.
  Each result splits the total cost into the upfront fee and the exchange-rate markup. The
  top result is labeled "Most to your family", never "Best".
- **TrueCost.** Enter a transfer you already made and see what it really cost. Example
  from the app: $4.99 fee + $5.88 hidden in the rate = $10.87, 5.43% of the amount sent.
- **Receipt scanner.** Photograph a transfer receipt. The phone reads it with on-device
  text recognition and blurs names, addresses, phone numbers and account numbers **before
  anything leaves the phone**. The app then:
  - works out the true cost;
  - compares the rate with what the provider advertised that day;
  - checks the 1% tax;
  - lists standard disclosures it couldn't find;
  - shows "what you could have kept" with the cheapest provider.
- **Other tools:**
  - **Fair rate:** is this rate fair?
  - **Scam check:** common remittance fraud warnings.
  - **Yearly cost:** what you lose over a year of sending.
  - **Rate history**, plus **rate alerts** (push notification when a route gets cheaper).
  - **Glossary** and **Learn**.
  - **RemitBench:** how providers compare over time.
- **Ask for a route.** Users can request a country that isn't covered yet. They get an email
  when it launches, and their contact details are deleted after that.
- **WhatsApp bot.** Text "500 to India" to get a comparison, in English or Hindi, for people
  who won't install an app. Users can also link the bot to their account and get rate alerts
  there.
- **Languages.** English, with Hindi, Spanish, Tagalog and Vietnamese drafted. Each ships
  only after a fluent reviewer approves it (Angad's mother is reviewing Hindi).
- **Accessibility.** WCAG AA contrast, large text sizes, VoiceOver support, 44-point tap
  targets, and prices that still show offline.

## 4. How it works (technical)

- **Data engine (Python, GitHub Actions):** on a schedule, collects public price quotes from
  providers.
  - Every quote must pass a **publish gate** (checks against the mid-market rate and sanity
    rules) before users see it. Failing quotes are quarantined, not shown: "a missing quote
    is better than a wrong one."
  - Every raw response is archived, so every published number can be traced back.
- **Scraping ethics:**
  - Public pricing only: no logins, no CAPTCHA bypassing, no proxies.
  - One request at a time per site, with delays.
  - An honest user agent with a contact email.
  - If a provider is blocked (403 or 429), the engine stops instead of retrying.
  - **If a provider's terms forbid automated access, there is no scraper for it.**
    Angad checks those prices by hand and records them, and has emailed eight providers
    asking for permission. Wise said yes and is automated through its official API.
- **One formula everywhere:** total cost = fee + exchange-rate markup + pickup charges.
  It is written once in TypeScript and once in Python, and both copies must pass the same
  shared test cases, so no two screens can ever disagree.
- **Backend:** Supabase.
  - Postgres with row-level security, so each user can read only their own data.
  - Edge Functions on Deno run the WhatsApp webhook and the receipt scanner.
  - Auth by email code, Sign in with Apple, or Google.
- **Receipt pipeline:**
  - Google ML Kit OCR and Skia redaction run on the phone.
  - A rule-based parser reads 13 fields.
  - An AI vision model (Qwen3.8 27B on Groq) is called only for values the rules miss or
    doubt, and only ever sees the redacted image.
  - Accuracy: the rules alone passed 47 of 47 test fixtures, and scored 97.8% on 60
    synthetic OCR'd receipts.
- **Limits on AI spending:** 10 scans a day per phone, and 200 model calls a day overall.
- **Code size, roughly:**
  - 200 TypeScript files;
  - 32 Python files;
  - 18 database migrations;
  - an automated security test of 67 row-level security checks.

## 5. Values and design choices (good material for "impact" answers)

- **Never moves money.** RemitBridge has no "send" button and never holds funds; it only
  gives information.
- **No ads, no affiliate links,** and no provider can pay for placement. Angad turned down
  Wise's affiliate program.
- **Privacy:**
  - Accounts are optional.
  - Deleting your account in the app deletes all your data.
  - On WhatsApp, only a hashed phone number is stored.
  - Metrics are aggregate only.
- **Honesty:** every figure names its source and when it was checked. Every tool has a "What
  this does not tell you" section.
- **Community:** emailed nine Seattle-area community organizations that serve immigrant
  families about partnering, including El Centro de la Raza and Horn of Africa Services.
- **Organization:** run under RemitBridge Labs, a nonprofit Angad is forming. Its Articles
  were filed in Washington on 2026-10-02 and are awaiting acceptance. Contact:
  hello@remitbridgelabs.org.

## 6. Current status (do not overstate)

| Item | Status |
|---|---|
| Compare, tools, accounts, alerts | Built and working, tested in the iPhone simulator |
| Live prices | Wise and Instarem automated. 27 hand-checked prices for Remitly, Western Union, MoneyGram, Xoom, WorldRemit, Ria and Xe |
| Receipt scanner | Built and deployed. Waiting on the iPhone development build for a real scan (Apple Developer account processing) |
| WhatsApp bot | Built and tested. **Not live:** Meta restricts the account until the business is verified |
| App Store / Google Play | **Not published yet** |
| Translations | Drafts only. Hindi under review |
| Website / store pages | Live at app.remitbridgelabs.org |

## 7. AI use (for disclosure questions)

- **Angad:**
  - came up with the idea;
  - wrote the product requirements (PRD);
  - made every product decision (over 140 are recorded, with dates and reasons);
  - did the provider research and hand price checks;
  - did the outreach to providers and community groups;
  - tests the app and directs all the work.
- **Claude (Anthropic's AI coding assistant):** wrote most of the code under Angad's
  direction and review. This includes:
  - the app screens and the database;
  - the redaction and the receipt parser's field-extraction rules (written at Angad's
    request);
  - the benchmark and the WhatsApp bot.

  Claude also drafted documents, including the first CAC draft.
- **In the app itself:** an AI model (Qwen3.8 on Groq) reads receipt values the rules
  can't, and only ever sees redacted images.
- **Records:**
  - every Claude-written commit is marked `Co-Authored-By: Claude`;
  - `docs/AI_USAGE.md` logs, file by file, what Claude wrote for the receipt scanner.

## 8. Answers that need Angad's own input

Leave brackets for these and offer prompt questions:

- **Why he built it:** a personal or family connection to sending money home.
- **The hardest part:** candidates include keeping receipts private while still reading
  them, never publishing an unchecked number, and respecting providers' terms.
- **What he learned.**
- **What's next:**
  - launch on both stores;
  - WhatsApp going live;
  - more routes and providers;
  - finishing translations;
  - research on what senders really pay.

## 9. Demo video outline (about 2:45)

| Time | Shot | Say |
|---|---|---|
| 0:00 | On camera | Name, "RemitBridge", what it's for |
| 0:12 | Compare, $500 to India | Ranked by amount received; fee and markup split |
| 0:35 | Quote detail | Every number has a source and a time; unchecked prices aren't shown |
| 0:50 | Scan a receipt | Redaction on the phone before anything is sent |
| 1:30 | Scan result | True cost, the advertised rate, the 1% tax check, "what you could have kept" |
| 2:05 | Tools or Learn | (WhatsApp only if it's live by then) |
| 2:25 | On camera | Free, never touches money, can't be bought; families keep more |
