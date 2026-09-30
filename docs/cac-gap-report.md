# CAC gap report: the receipt scanner and what goes with it

Written 2026-09-30, before any feature code. For each item in Angad's Congressional App
Challenge brief, it says what already exists in this repo, what is partly there, and what
hasn't been started. The decisions needed before Phase 2 come after the table.

## What the new work sits on

- **App:** Expo SDK 57 (React Native, TypeScript), iOS and Android. **There is no web app
  and no browser** (D14). It runs in Expo Go today, so it only has the native modules Expo Go
  bundles. There is no camera, image picker, OCR or image-editing library.
- **Database:** Supabase Postgres. Schema changes are plain SQL files in
  `supabase/migrations/`, with row-level security on every table. There is no ORM: the app
  and the bot use `supabase-js`. Policies are tested by `supabase/tests/rls_smoke.sh` (live,
  public key) and `supabase/tests/local_migrations.sh` + `local/checks.sql` (throwaway
  Postgres).
- **The one formula:** `computeTransferCost` in `packages/formula/src/index.ts`, with a
  Python twin, both pinned to `vectors.json`. Inputs: S sent, F fee, Q quoted rate, M
  mid-market rate, R pickup charge. **It has no tax term and no funding method.** Rounding
  tolerance lives in the engine: the larger of 0.2% or 1 unit of the receiving currency
  (`engine/.../config.py`, D36).
- **Stored quotes:** `quotes` is append-only. Published rows are publicly readable, and each
  has `provider_id`, `route_id`, `send_amount` (grid: 100/200/500/1,000/2,000),
  `delivery_method`, `payment_method`, `offered_rate` and `captured_at`. `latest_quotes`
  shows the last 48 hours. **No prices have been entered yet**, and all eight providers are
  manual (D52).
- **Breakdown components:** `Breakdown` in `mobile/src/components/tool.tsx` (TrueCost's
  rows) and `CostBreakdownBar` in `quote-card.tsx` (the bar, which takes a stored quote).
- **WhatsApp bot:** logic in `packages/bot` (pure TypeScript, vitest), webhook in
  `supabase/functions/whatsapp`. It handles text only: an image gets the "send text" reply.
  It has English and Hindi, as a language switch inside each reply function.
- **i18n: there is none in the app.** Every screen has its strings inline (the open item says
  so). The only Hindi is inside the bot's `messages.ts`.
- **Tests:** vitest in `packages/formula` and `packages/bot`, pytest in `engine`. **The
  mobile app has no test runner**, only typecheck and lint.
- **LLM:** nothing calls a model anywhere. The engine names an `ai_extraction` strategy but
  doesn't use it.
- **D30 says "no receipt scanning for now."** This brief reverses that. It's recorded as D69.

## Item by item

| # | Item | Status | What exists / what's missing |
|---|---|---|---|
| 1a | On-device OCR and redaction | Not started | No OCR, camera or image library. Tesseract.js doesn't run in React Native, and there's no browser to run it in (decision 1). |
| 1b | Rule-based parser (harness only) | Not started | Nothing to reuse except `packages/bot/src/parse.ts`'s number reading, as a pattern. Heuristics are Angad's (TODO stubs). |
| 1c | LLM fallback | Not started | No model client, no key, no schema validation library. |
| 1d | Validation | Partly exists | The formula and the engine's rounding tolerance exist, and `mobile/src/lib/admin.ts` already checks a quote's arithmetic before saving. Missing: per-field confidence, the tax line in the check, and picking the most likely wrong field. |
| 1e | Confirmation screen | Not started | `Field`/`Fields` rows in `tool.tsx` can be reused for corrections. No image view with boxes. |
| 2 | Result: true cost | Exists | TrueCost's `Answer` + `Breakdown`, fed by the formula. Needs a tax row once the formula has one. |
| 2 | Result: advertised vs. paid | Partly exists | The data model supports it (public `quotes` with `captured_at`; `fetchQuoteHistory` is the query pattern). Missing: the matching query, the gap figure, the "no matching price" state. In practice it will always say "no match" until prices are entered. |
| 2 | Result: tax check | Not started | Nothing knows about the 1% tax. |
| 2 | Result: next time | Exists | `openCompare({ routeId, amount, method })` already pre-fills Compare (TrueCost uses it). |
| 3 | Funding method in TrueCost and Compare | Partly exists | Quotes carry `payment_method` (`bank_account`, `debit_card`, `credit_card`, `cash`), and the quote detail shows it as "How you pay". Missing: money order and cashier's check; any input in TrueCost or Compare; the tax in the formula. Compare doesn't filter on payment method today, so a provider with two payment methods shows twice. |
| 4 | Disclosure check | Not started | — |
| 5 | WhatsApp photo intake | Partly exists | Signature check, hashed numbers, language choice, English and Hindi replies, rate limits. Missing: media download from Meta, server-side OCR and redaction, the pipeline call, the reply, and "confirm this value" follow-ups. |
| 6 | Receipt, ReceiptField, ReceiptComparison | Not started | The migration system, RLS patterns and both test harnesses are ready to extend. |
| 7 | Receipt observatory | Not started | The aggregate-only pattern exists (`route_request_counts()`, `admin_metrics()`). |
| 8 | Accuracy benchmark | Not started | No `benchmark/` folder, no image rendering, no scoring. |

## Decisions I need before Phase 2

Each has my recommendation first.

1. **OCR runs on the phone, so it needs a development build.** With no browser, the
   equivalent of "OCR in the browser" is OCR on the device. I recommend Google ML Kit text
   recognition (`@react-native-ml-kit/text-recognition`, Apple Vision is the alternative on
   iOS). It returns each word with its box, which the redaction and the confirmation screen
   both need. For drawing the redaction and saving the redacted image, I recommend
   `@shopify/react-native-skia`, plus `expo-image-picker` for the camera and photo library.
   The catch is that ML Kit isn't in Expo Go. Scanning then only works in a development
   build, which means EAS cloud builds (local native builds need 15–20 GB, and there's 5.6
   GB free). Everything else keeps working in Expo Go. I'll confirm each package against the
   SDK 57 docs before adding it. **Yes to these three packages and a dev build?**
2. **How redaction works.** I recommend solid boxes rather than blur, because blurred text
   can sometimes be read back. Detection would lean toward hiding too much: it hides any line
   that is labeled as a sender or recipient, looks like an address, phone, card (a Luhn
   check) or account number, or is a long run of digits. It keeps amounts, rates, dates, the
   provider's name and the field labels. The preview would also let the person tap to hide
   anything that was missed. **Boxes instead of blur, and tap-to-hide?**
3. **i18n doesn't exist yet.** I recommend a small typed string catalogue for the new screens
   only (`mobile/src/i18n/en.ts` and `hi.ts`, plus a `useStrings()` hook, with no library),
   and a language setting on Account. That would also be the start of the open item that
   moves every screen's strings into files. Hindi needs a Devanagari font (PRD 14.5): Noto Sans
   Devanagari from the same `@expo-google-fonts` family. As with the bot (D68), the Hindi is
   mine and needs your read. **OK?**
4. **The tax and the one formula.** The rule is one formula, so the tax has to go into it,
   not beside it. My proposal:
   - Add an optional `transferTax` (T, in the sending currency) to `computeTransferCost` and
     its Python twin. It comes off before conversion, the same way the fee does, and total
     cost becomes F + T + markup + pickup. With T = 0, every existing result is unchanged.
   - Add a `remittanceTax(amount, fundingMethod)` in the same package, so the 1% rule
     lives in one place.
   - Add new test cases in a separate file. `vectors.json`'s expected values come from the
     website's code and must not be hand-edited, and the website has no tax, so these would
     be the first cases that don't come from the website.

   **Yes?**
5. **What "amount sent" means on a receipt.** US receipts usually print a transfer amount,
   then the fee, the tax, and a total. The TrueCost formula's S is the total paid. Your
   check, "amount received ≈ (amount sent − fee) × rate", holds if "amount sent" is the
   total. I recommend the parser read both lines: `amount_sent` would be the transfer amount
   as printed, and a new optional `total_paid` field would be the total. The checks would
   then be received ≈ amount_sent × rate − pickup, and total ≈ amount_sent + fee + tax. Both
   go through the formula with S = amount_sent + fee + tax. **Add `total_paid` and use that
   mapping?**
6. **The tax base is unverified.** The law taxes 1% of "the amount of the transfer" (IRC
   4475) for transfers after 2025-12-31 funded by cash, money order, cashier's check or a
   similar physical instrument. My default is 1% of the transfer amount, excluding the fee,
   rounded to the cent. That matches the "$500 → $5" examples, but I couldn't read the IRS
   proposed regulations from here to confirm whether fees are in the base. **Could you check,
   or should I use this default and mark it as an assumption on screen?**
7. **The LLM runs on the server.** A model key can't ship inside the app. The pipeline would
   run in a new Edge Function (`scan-receipt`). The parser, validation and schema checks would
   live in a new pure-TypeScript `packages/receipt` (like `packages/bot`), so the app, the
   Edge Function and the benchmark all run the same code. I recommend Claude's vision model
   through the Anthropic API. You'd set `ANTHROPIC_API_KEY` in Supabase secrets yourself,
   and the privacy page would say that redacted images go to Anthropic. **Anthropic OK? Any
   monthly spend cap to build in?**
8. **Server-side redaction for WhatsApp.** Edge Functions get 2 s of CPU per request and
   150 MB of memory on the free plan. OCR plus redaction on a phone photo will likely exceed
   that. The options:
   - (a) GitHub Actions as the worker, like Manual prices: the webhook replies "reading your
     receipt", a workflow runs Tesseract and the same pipeline, and the result arrives about
     1–3 minutes later. WhatsApp allows replies within 24 hours, and it needs no new host.
   - (b) A small OCR container on a new host (Fly.io or Cloud Run): faster, but new
     infrastructure and a new account.
   - (c) Sending the unredacted photo straight to the model: this breaks "redact before
     anyone else sees it", so I don't recommend it.

   **(a)?**
9. **Where the full result lives, and who can read it.** There's no web app, and links can't
   open the app until universal links exist (D48, which needs the Apple Team ID). I recommend
   a read-only page on the existing site (`app.remitbridgelabs.org/r/<id>`, a link page under
   D28), loaded by an unguessable ID through a database function. Receipts would have no user
   ID (anonymous by design), and `channel` would be `app` / `whatsapp` rather than `web`. Your
   spec only deletes images. I'd also delete the field values after 30 days unless research
   consent was given. A signed-in person could still save the result to "Your checks" (the
   existing owner-only table). **Agree, including the 30 days?**
10. **Matching the advertised price.** Receipts rarely name a delivery method, while quotes are
    stored per delivery method, payment method and grid amount. I'd add an optional
    `delivery_method` field. Matching would be: same provider and route, the checked amount
    from `checkedAmountFor`, same payment method if known, and the capture nearest the
    transfer date within ±24 hours. The gap comes from the formula: the markup cost at the
    receipt rate minus the markup cost at the advertised rate, on the same converted amount,
    in the sending currency. Receipts from providers outside our eight get "we don't track
    this provider yet". For the CAC demo, you'd need to enter prices on the days of your test
    transfers.
11. **Funding methods.** Add `money_order` and `cashiers_check` to the payment-method list
    (engine enum, app labels, bot). In Compare, the funding input would filter quotes to that
    payment method, which also fixes the double listing. A cash-type method adds the 1%
    through the formula, with a one-line explanation.
12. **Tests for screens.** Logic goes in `packages/receipt` with vitest. For the screens, I
    recommend adding `jest-expo` and `@testing-library/react-native` as dev dependencies,
    the app's first test runner. **OK?** From this cloud session I can't run a simulator or
    real OCR. You'd check scanning on your phone in the dev build.
13. **Real receipts in `benchmark/`.** They contain names and account numbers. I recommend
    gitignoring the images there and committing only the ground-truth JSON, unless an image
    has been through the redactor and you've checked it. The synthetic generator would render
    HTML templates to PNG with Playwright (Chromium is already here), and the benchmark would
    OCR them with tesseract.js in Node. That's a different OCR engine from the phone's, so
    benchmark accuracy is a proxy. "Parser only" will score near zero until your heuristics
    are in, and "model only" costs API calls, so it runs on demand, not in CI.
14. **Where your part ends.** You write the field extraction (1b). PII detection for
    redaction (1a) and the disclosure check (item 4, keyword spotting like "cancel" and
    "refund") are mine unless you'd rather write the disclosure detectors too. **Mine?**
15. **Branch.** This session is set to push to `claude/gallant-hopper-51zhhm`, not `main`
    (D24). Everything for the CAC goes there until you merge it.

## Rough fit against Oct 23

Phase 2 depends on decisions 1–9. Phase 3 needs a dev build to test scanning on a phone.
Phase 5 depends on the Meta setup, which is still open, so it can be built and tested against
a fake, but not tried end to end until WhatsApp is live. Phase 6 (the disclosure check and
the observatory) is the one to drop if time runs short.
