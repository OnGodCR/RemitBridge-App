# AI usage log

For the Congressional App Challenge's AI-use disclosure. Each working session with Claude
(Anthropic's AI assistant, running as Claude Code) gets an entry. Each entry lists every file
Claude created or changed and what that file does or what changed in it. It also says what
Angad wrote himself and what Claude didn't do.

The log starts with the CAC work (D72, 2026-09-30). Earlier work on this repo was also done
with Claude. `git log` shows every commit, and commits Claude wrote carry a
`Co-Authored-By: Claude` line.

---

## 2026-09-30: Phase 1, the gap report

**What Claude did:** read the repo (formula package, schema and migrations, quote storage,
TrueCost and Compare screens, breakdown components, WhatsApp bot and webhook, design tokens,
CI, docs) and wrote a report on what exists and what's missing for each CAC feature. No
feature code was written.

**Files created**

- `docs/cac-gap-report.md`: says, for each of the eight CAC features, whether it already
  exists, partly exists (and what's missing) or hasn't been started. It also lists 15
  decisions needed before Phase 2, each with a recommendation. The main ones: on-device OCR
  instead of in-browser OCR, redaction style, a string catalogue for English and Hindi, adding
  the 1% tax to the one formula, what "amount sent" means on a receipt, where the LLM runs,
  server-side redaction for WhatsApp, where the result page lives, and quote matching.
- `docs/AI_USAGE.md`: this log.

**Files changed**

- `DECISIONS.md`: added D72 (receipt scanning is in scope for the CAC, replacing D30's "no
  receipt scanning for now"; Angad writes the parser's extraction heuristics himself).
- `CLAUDE.md`: added the open item "CAC receipt scanner (D72), Phases 2–6".
- `HANDOFF.md`: added a "What changed on 2026-09-30" section and updated the "Last updated"
  date.
- `README.md`: added the gap report and this log to the Docs table.

**Written by Angad, not Claude:** the feature brief and phase plan the report is checked
against.

**Not done by Claude:** Claude couldn't open the IRS proposed regulations on the remittance
tax from its sandbox (network blocked). The tax base in the report is marked unverified.

---

## 2026-09-30: Phase 2, data model, redaction, parser harness, model fallback, validation

**What Claude did:** recorded Angad's answers to the gap report as decisions D73–D87. Added
the remittance tax to the shared formula. Built the receipt pipeline package, the database
tables, the `scan-receipt` Edge Function, the app's scan screen with on-device redaction, a
string catalogue for English and Hindi, and tests for each. The field-extraction heuristics
were **not** written: they're stubs for Angad (D86).

### Files created

**Formula**
- `packages/formula/vectors.tax.json`: test cases for the remittance tax, in the formula and
  in `remittanceTax()`. Expected values were computed with exact fractions from the formula's
  definitions, not by running the code.

**Receipt pipeline (`packages/receipt/`)**
- `package.json`, `tsconfig.json`, `vitest.config.ts`: the new workspace, its TypeScript
  settings, and the aliases that swap Supabase and the Anthropic SDK for fakes in tests.
- `tsconfig.functions.json`, `src/test/deno.d.ts`: typecheck the `scan-receipt` Edge Function
  (Deno) with `tsc`, using the real package types and a stub for Deno's two globals.
- `src/types.ts`: the pipeline's types: the 13 field names and value types, OCR page, line,
  word and box, source spans, parsed and extracted fields, extraction paths, and the 0.8
  confidence threshold.
- `src/fields.ts`: per-field specs (kind, description, allowed values) and `checkValue()`,
  which validates any value from an extractor, the model or the person. Also converts values
  to and from the database's text column.
- `src/ocr.ts`: helpers with no receipt heuristics: line text, word offsets, box unions and
  spans. Also `pageFromLines()` (synthetic pages for fixtures), `fromMlKit()` (ML Kit output
  to a page) and `boxesInside()` (refuses boxes that don't fit the photo).
- `src/redact.ts`: PII detection. It covers labeled names and addresses, street/unit/ZIP/C.P.
  lines, phones, emails, UPI handles, Luhn-checked and masked cards, account and reference
  IDs, and long numbers not printed as money. Also `redactPage()` (text replaced by
  `[hidden]`), `redactionBoxes()` (padded boxes to paint) and `toggleWord()` (tap to cover
  or uncover a word).
- `src/templates.ts`: the provider-template structure. There's a filled-in generic template
  from Regulation E's model-form labels, name-only entries for the eight Tier 1 providers
  (`basis: 'unverified'`), `labelsFor()` and `templateFor()`.
- `src/extract/fields.ts`: **the 13 extractor functions, left as `TODO(angad)` stubs**
  returning `null`. Each has a docstring giving its inputs, output, confidence guidance and
  edge cases.
- `src/extract/index.ts`: maps each field name to its extractor.
- `src/parser.ts`: `parseReceipt()` runs the extractors in order, picks the template from the
  provider, checks every returned value, and catches extractors that throw.
- `src/harness.ts`: scoring against ground truth (correct/wrong/missing/extra), per-field
  and overall accuracy and precision, and a markdown table.
- `src/node/fixtures.ts`: loads and validates fixture files (Node only).
- `scripts/parser-report.ts`: prints the parser's score on the fixtures.
- `fixtures/western-union-cash-usd-mxn.json`, `remitly-bank-usd-inr.json`,
  `moneygram-money-order-usd-php.json`, `xoom-debit-usd-vnd.json`: four synthetic receipts
  (fictional people, 555-01xx phones) with ground truth, the personal details that must be
  covered, and the text that must stay.
- `src/model.ts`: the Claude fallback. It covers the frozen system prompt, the strict JSON
  answer schema, the request (redacted photo and numbered text, low effort, server-side
  refusal fallbacks), `readAnswer()` (checks each value again) and `askModel()` (handles
  refusal, truncation and non-JSON).
- `src/merge.ts`: which fields go to the model, merging parser and model values with an
  extraction path per field, and applying the person's corrections.
- `src/validate.ts`: the arithmetic checks through the formula (received, total, fee,
  currencies, rate against mid-market), confidence updates, `validated` flags, required
  fields, and picking the most likely misread value with a suggested correction.
- `src/pipeline.ts`: `readReceipt()`: parse, then the model for what's missing, then merge,
  then validate. It has three modes (rules only, combined, model only) for the benchmark.
- `src/api.ts`: the request and response types shared by the app and the Edge Function,
  input limits, `parseRequest()`, and `trustedToday()`.
- `src/index.ts`: the package's exports.
- `src/test/fake-model.ts`, `src/test/fake-supabase.ts`, `src/test/fake-anthropic.ts`: test
  doubles.
- Tests: `src/fields.test.ts`, `ocr.test.ts`, `redact.test.ts`, `parser.test.ts`,
  `harness.test.ts`, `fixtures.test.ts` (skips values the stubs don't read yet),
  `model.test.ts`, `merge.test.ts`, `validate.test.ts`, `pipeline.test.ts`, and
  `scan-function.test.ts` (runs the real Edge Function against fakes). 135 pass, 47 skipped.

**Database and server**
- `supabase/migrations/20260930000000_receipts.sql`: the `receipts`, `receipt_fields`,
  `receipt_comparisons` and `receipt_model_calls` tables. It has RLS with no policies,
  checks that enforce consent and 30-day expiry, `receipt_result()` (read by ID),
  `take_receipt_model_call()` (the monthly cap), `forget_expired_receipts()`, and the
  private `receipt-images` bucket.
- `supabase/functions/scan-receipt/index.ts`: the Edge Function. It checks the request,
  re-runs PII detection (and drops the image if it finds anything), reads the receipt
  (Claude gated by the cap, mid-market rate from Frankfurter), stores the fields, and keeps
  the image only with consent. It also handles `forget`.
- `supabase/functions/scan-receipt/deno.json`: the import map for the Anthropic SDK in Deno.

**App**
- `mobile/src/app/scan.tsx`: the Scan a receipt screen. You take or choose a photo; the
  phone reads it and covers details; you see the preview of the exact redacted image and
  can cover more words by tapping. There's a research-consent switch (off by default), then
  the send, a list of what was read, and a way to delete the receipt.
- `mobile/src/lib/receipt-scan.ts`: the phone-side steps. It prepares the photo (upright,
  1600 px, JPEG, metadata dropped), runs ML Kit OCR through an optional native lookup (so
  Expo Go doesn't crash), and paints solid black boxes with Skia.
- `mobile/src/lib/receipts.ts`: calls the `scan-receipt` function (scan and forget).
- `mobile/src/i18n/en.ts`, `hi.ts`, `index.ts`: the typed English and Hindi string
  catalogue, the language store, `useStrings()` and `fill()`. The Hindi is Claude's and
  unreviewed.
- `mobile/src/__tests__/i18n.test.tsx`, `app-text.test.tsx`, `receipt-scan.test.ts`,
  `scan-screen.test.tsx`: the app's first tests (26), covering the catalogue, the Hindi
  font switch, the OCR and redaction helpers, and the scan screen's flow.
- `mobile/eas.json`: EAS build profiles (development, preview, production), with no keys in it.

### Files changed

- `packages/formula/src/index.ts`: added `transferTax` (T) to `computeTransferCost` (it
  comes off before conversion; total cost includes it) and the `taxCost` output. Also added
  `FundingMethod`, `FUNDING_METHODS`, `TAXED_FUNDING`, `remittanceTax()`, and the shared
  rounding tolerance.
- `packages/formula/src/index.test.ts`: tax vectors, the invariant with tax, zero tax equal to
  no tax, and a check that the tolerance matches the engine's config.
- `packages/formula/python/remitbridge_formula/__init__.py`: the same tax changes in the
  Python twin (`transfer_tax`, `tax_cost`, `remittance_tax()` with decimal rounding).
- `packages/formula/python/tests/test_vectors.py`: runs the tax vectors in Python.
- `supabase/tests/local/checks.sql`: 17 receipt checks. They cover constraints, the cap,
  anon denials, reading by ID, expiry, cascade deletes and the private bucket.
- `supabase/tests/rls_smoke.sh`: 11 receipt checks against the live project, for 48 in all.
- `mobile/package.json`: added `@infinitered/react-native-mlkit-text-recognition`,
  `@infinitered/react-native-mlkit-core`, `@shopify/react-native-skia`, `expo-image-picker`,
  `expo-image-manipulator`, `expo-dev-client`, `@expo-google-fonts/noto-sans-devanagari`
  and `@remitbridge/receipt`. Also added jest-expo, Jest, React Native Testing Library and
  their types, plus the `test` script and Jest config.
- `mobile/app.json`: camera and photo permission messages (image picker plugin).
- `mobile/tsconfig.json`: allows `.ts` import paths (the shared packages use them) and adds
  Jest types.
- `mobile/src/app/_layout.tsx`: loads Noto Sans Devanagari and registers the `scan` screen.
- `mobile/src/app/(tabs)/tools.tsx`: adds "Scan a receipt" under "After you send".
- `mobile/src/app/(tabs)/account.tsx`: adds the English/Hindi language setting.
- `mobile/src/components/ui.tsx`: `AppText` switches to Noto Sans Devanagari, with taller
  lines, for text that contains Devanagari. Also added `hasDevanagari()`.
- `mobile/src/components/does-not-tell-you.tsx`: an optional translated title.
- `mobile/src/constants/theme.ts`: the Devanagari font names by weight.
- `mobile/src/lib/prefs.ts`: the stored language preference.
- `package-lock.json`: the new packages.
- `.github/workflows/ci.yml`: runs the receipt package and app tests, and a new job that
  applies every migration to a throwaway Postgres and runs its checks.
- `supabase/config.toml`: JWT verification off for `scan-receipt`, since scanning works
  signed out and the publishable key isn't a JWT; the reason is in the comment.
- `site/privacy.html`: a "Scanning a receipt" section, Anthropic and Frankfurter as
  processors, and the effective date.
- `DECISIONS.md` (D73–D87), `CLAUDE.md` (open items and stack), `HANDOFF.md`, `README.md`,
  and this file.

**Written by Angad, not Claude:** the decisions (he accepted the recommendations). The field
extractors are his to write.

**Not done or not verifiable by Claude in this session:**
- No native build was made, and no real phone or receipt was used. OCR and Skia drawing are
  tested with fakes; the iOS JavaScript bundle was built with `expo export`.
- No Anthropic API call was made; every model test uses a scripted fake.
- No live database was changed; the migration was run only on a throwaway local Postgres.
- The Expo documentation site and the IRS regulations were blocked from the sandbox. APIs
  were checked against the installed packages' type definitions instead, and the tax base
  is marked as an assumption (D78).

---

## 2026-09-30: Phase 3, confirmation screen, result screen, funding method

**What Claude did:** built the confirmation and result screens for a scanned receipt, the
server step behind them, and the funding method in TrueCost and Compare, with tests. It
recorded the defaults it picked as D88–D90. Angad's parser extractors are still his
TODOs.

### Files created

- `packages/receipt/src/result.ts`: the result logic, shared by the app, the server and
  later WhatsApp. It covers `formulaInputs()`/`receiptCost()` (a receipt's true cost
  through the one formula, S = amount + fee + tax), `taxCheck()` (applies or not; matches,
  not found or differs; bank-funded equivalent), `matchQuote()` (the published standing
  price nearest the transfer day, within 24 hours either side, same methods) and
  `advertisedGap()` (the rate gap in the sending currency, through the formula).
- `packages/receipt/src/result.test.ts`: 10 tests for those.
- `mobile/src/components/receipt-confirm.tsx`: the confirmation screen. The redacted photo
  has each value outlined where it was read (amber for values to check). Values to check
  are listed first, and there's an editor per field: typed numbers, codes and dates, a list
  for methods, the suggestion, or "This is right". The result stays locked until every value
  to check has an answer.
- `mobile/src/components/receipt-result.tsx`: the result screen:
  - true cost with TrueCost's `Answer` and `Breakdown` (a tax row when there is one) and
    the mid-market source and date;
  - advertised vs. paid, or the reason there's nothing to compare;
  - the tax check in neutral words, with the bank-funded equivalent;
  - "Compare this route today", which opens Compare with the route, amount and method.
- `mobile/src/components/choice-list.tsx`: a divided radio list for choices too long for a
  segmented control.
- `mobile/src/lib/receipt-format.ts`: shows receipt values (amounts in the right currency,
  dates, methods in the chosen language) and reads what the person types.
- `mobile/src/__tests__/receipt-result.test.tsx` (11 tests),
  `receipt-confirm.test.tsx` (4), and `funding.test.tsx` (7: Compare's estimate with tax,
  TrueCost's tax line, the value helpers).

### Files changed

- `packages/receipt/src/api.ts`: the `confirm` request and response (`ConfirmRequest`,
  `ConfirmResponse`, `Comparison`), checked by `parseRequest()`.
- `packages/receipt/src/index.ts`: exports `result.ts`.
- `packages/receipt/src/test/fake-supabase.ts`: `update`, `upsert`, `gte`, `lte`.
- `packages/receipt/src/scan-function.test.ts`: 4 tests of `confirm`. They cover
  correction, re-check, quote match and stored comparison; no match; an untracked
  provider; and refusals.
- `supabase/functions/scan-receipt/index.ts`: the `confirm` action. It loads the stored
  values, applies the person's answers, re-validates with the day's mid-market rate
  (`fetchMid`), matches the provider's published price (`compare`), and stores the fields
  and `receipt_comparisons`.
- `mobile/src/app/scan.tsx`: after sending, goes to the confirmation screen and then the
  result. Phase 2's plain list is removed.
- `mobile/src/lib/receipts.ts`: `confirmScan()`.
- `mobile/src/app/true-cost.tsx`: "You paid with" (six methods). A cash-type method adds the
  1% tax through the formula, shows a tax row and a one-line explanation, and folds the tax
  into the fee when saving.
- `mobile/src/app/(tabs)/index.tsx` (Compare): "You pay with". Only prices for that payment
  method show, a cash-type method adds the tax to each total cost with a one-line
  explanation, and there's an empty state when no prices exist for the method.
- `mobile/src/lib/quotes.ts`: `atAmount()` takes the funding method and includes the tax.
- `mobile/src/app/quote/[id].tsx`: takes the funding method from Compare; labels for the
  two new payment methods.
- `mobile/src/i18n/en.ts`, `hi.ts`: the confirmation, result and funding strings in English
  and Hindi. The Hindi is Claude's, unreviewed.
- `mobile/src/__tests__/scan-screen.test.tsx`: the flow now runs through confirmation and
  result.
- `engine/src/remitbridge_engine/models.py`: `MONEY_ORDER`, `CASHIERS_CHECK` payment methods.
- `packages/formula/python/tests/test_vectors.py`: a test that the engine's payment methods
  equal the formula's funding methods.
- `DECISIONS.md` (D88–D90), `HANDOFF.md`, `CLAUDE.md` (open items), and this file.

**Not done or not verifiable by Claude:** the same limits as Phase 2. There was no native
build, no real phone or receipt, no real model call, and no live database. Compare's
funding filter hasn't been seen against real prices, because none are entered yet.

---

## 2026-09-30: merging `main` (the other session's languages and accessibility work)

**What Claude did:** Angad asked to merge `main` into the CAC branch. Another Claude session,
on Angad's Mac, had pushed an app-wide language system (D69), accessibility work (D70) and
flags to `main`, which conflicted in 17 files. Claude took `main`'s version of every shared
screen and re-applied the CAC changes on top. No history was rewritten and nothing was
pushed to `main`.

**Removed (duplicates of `main`'s work):** `mobile/src/i18n/index.ts` (the branch's own
string store), `mobile/src/__tests__/app-text.test.tsx`, the Noto Sans Devanagari font and
its theme tokens, and the branch's language setting on Account.

**Changed:**
- `mobile/src/i18n/en.ts`, `hi.ts`, `es.ts`, `tl.ts`, `vi.ts`: added the scanner's strings
  (`scan`, `confirm`, `result`, `receiptFields`, `receiptPaths`, `funding`, a `titles` entry
  and a `tools` entry) and two payment labels. English and Hindi were carried over from the
  branch. Spanish, Tagalog and Vietnamese are new Claude drafts, which D69's reviewer rule
  keeps out of release builds.
- `mobile/src/app/scan.tsx`, `components/receipt-confirm.tsx`,
  `components/receipt-result.tsx`, `lib/receipt-format.ts`: ported to `main`'s `useCopy()`
  / `useLanguage()` API. Dates now go through `dayIn`.
- `mobile/src/app/(tabs)/index.tsx`, `true-cost.tsx`, `quote/[id].tsx`, `(tabs)/tools.tsx`,
  `_layout.tsx`: `main`'s versions, with the funding method, tax and scan entry re-applied.
- `mobile/app.json`, `mobile/package.json`, `package-lock.json`: both sides' plugins and
  packages. The lockfile was regenerated with npm.
- `mobile/src/__tests__/i18n.test.tsx` (rewritten: every language has every scanner key),
  `scan-screen.test.tsx`, `receipt-confirm.test.tsx`, `funding.test.tsx`: ported. The app
  has 79 tests.
- Decision numbers: the branch's D69–D87 became D72–D90 in `DECISIONS.md` and in every
  reference in code and docs (24 files). D71 was left to the other session.
- `CLAUDE.md`, `HANDOFF.md`: short CAC additions on top of `main`'s text.
- `docs/cac-gap-report.md`: one em dash replaced (house rule).

## 2026-09-30: switching the model fallback to Qwen through OpenRouter

**What Angad asked:** use a cheaper Chinese model through OpenRouter instead of Anthropic,
putting cost first. **What Claude did:** chose Qwen3 VL 32B Instruct (D92) and rewrote the
model client. Angad chose the provider and the priority; the model choice and the code are
Claude's.

**Changed:**
- `packages/receipt/src/model.ts`: the request is now OpenRouter's chat completions shape
  (system and user messages, the photo as a data URL, `response_format` with a strict JSON
  schema, `provider` routing that asks for hosts that keep nothing and honor every
  parameter, optional fallback models). New `openRouterClient()` over plain `fetch`,
  `replyJson()` (accepts one Markdown fence), and a `failed` ModelError reason. The date
  schema uses a description in place of `format: "date"`.
- `packages/receipt/src/pipeline.ts`: passes the fallback models through.
- `packages/receipt/src/test/fake-model.ts`: fakes the new client. `fake-anthropic.ts`
  deleted.
- `packages/receipt/src/model.test.ts`, `pipeline.test.ts`, `scan-function.test.ts`: tests for
  the new request, the client, fences, refusals, errors, `RECEIPT_MODEL_FALLBACKS`, and
  reading with the rules alone when OpenRouter fails. 158 receipt tests pass.
- `packages/receipt/package.json`, `vitest.config.ts`, `package-lock.json`: the Anthropic SDK
  removed.
- `supabase/functions/scan-receipt/index.ts`: reads `OPENROUTER_API_KEY`,
  `RECEIPT_MODEL_FALLBACKS`; cap default 2,000. `supabase/functions/scan-receipt/deno.json`
  deleted (it only mapped the SDK).
- `site/privacy.html`: OpenRouter and Qwen replace Anthropic as the processor.
- `DECISIONS.md` (D92, and a note on D79), `README.md`, `HANDOFF.md`, `CLAUDE.md`.

## 2026-09-30: Phase 4, the accuracy benchmark and synthetic receipts

**What Angad asked:** build Phase 4 (benchmark and synthetic generator). **What Claude did:**
wrote all of the files below. The rule-based extractors are still Angad's `TODO(angad)`
functions and were not touched; the benchmark measures them.

**Created:**
- `packages/receipt/src/synth.ts`: seeded synthetic receipt generator (values from the
  formula, Reg E labels and variants, layouts, fictional personal details, disclosures, the
  HTML drawing). `src/synth.test.ts`: determinism, every receipt passes the checks, tax only
  on cash-type funding, coverage, redaction on 200 generated receipts.
- `packages/receipt/src/node/tesseract.ts`: tesseract.js output to an OcrPage.
- `packages/receipt/src/benchmark.ts` and `src/benchmark.test.ts`: per-mode summaries and the
  `results.md` format.
- `packages/receipt/scripts/synthesize.ts`: draws each receipt in Chromium (Playwright), reads
  it with tesseract.js, writes the JSON and a redacted picture.
- `packages/receipt/scripts/benchmark.ts`: runs parser, model and combined modes and writes
  `benchmark/results.md`.
- `benchmark/README.md`, `benchmark/results.md` (parser mode only), and
  `benchmark/synthetic/synth-0001…0060-*.json` (generated).

**Changed:**
- `packages/receipt/src/redact.ts`: two fixes the generator found (a field line under a
  heading ending in an ID word; OCR-misread card masks). Tests added in `src/redact.test.ts`.
- `packages/receipt/src/node/fixtures.ts`: optional `mid_rate` and `disclosures`.
- `packages/receipt/src/model.ts`: `ModelError.reason` as a plain field, so Node can run the
  file by stripping types.
- `packages/receipt/package.json`, `package-lock.json`: dev dependencies tesseract.js,
  playwright-core, @tesseract.js-data/eng (about 70 MB installed); `synthesize` and
  `benchmark` scripts.
- `.github/workflows/ci.yml`: runs parser mode on the committed set.
- `.gitignore`: benchmark photos.
- `DECISIONS.md` (D93; D92 renumbered from D91, which the other session is using),
  `README.md`, `HANDOFF.md`, `CLAUDE.md`.

## 2026-09-30: Phase 5, receipt photos on WhatsApp

**What Angad asked:** build Phase 5 (WhatsApp photo intake with server-side redaction, the
same pipeline, a compact reply, confirming low-confidence values by text, in the user's
language). **What Claude did:** wrote all of the files below. Photo intake is built but off
until Angad agrees to the sealed-number exception in D94.

**Created:**
- `supabase/migrations/20260930020000_whatsapp_receipts.sql`: the `receipt_intake` queue,
  pending-check columns on `whatsapp_users`, `claim_receipt_intake()` and
  `forget_stale_receipt_intake()`.
- `packages/bot/src/receipt.ts` and `src/receipt.test.ts`: the replies (acknowledgement,
  can't read, failed, off, one question at a time, the compact result) in English and Hindi,
  and reading a person's answer (yes, a number, a date, a code, a method by number or word).
- `packages/receipt/src/node/intake.ts` and `src/intake.test.ts`: the worker's flow (claim,
  download from Meta, OCR, redact, scan, confirm, report back), with network and OCR passed in.
- `packages/receipt/scripts/intake-worker.ts`: runs the flow with tesseract.js.
- `.github/workflows/receipt-intake.yml`: the worker, started by a dispatch per photo.

**Changed:**
- `supabase/functions/whatsapp/index.ts`: photo messages queued with the number sealed
  (AES-GCM), the `?intake=done` report endpoint, the one-question-at-a-time checking, STOP
  also clearing queued photos. `packages/bot/src/index.ts` exports the new replies.
- `supabase/functions/scan-receipt/index.ts` and `packages/receipt/src/api.ts`: channel
  `whatsapp`, accepted only with `RECEIPT_INTAKE_SECRET`; redaction status `server`.
- Tests: `packages/bot/src/webhook.test.ts` (8 photo tests) with `src/test/fake-supabase.ts`
  gaining `rpc` and `update`; `packages/receipt/src/scan-function.test.ts` (2 tests).
- `packages/receipt/tsconfig.functions.json`: now typechecks the whatsapp function too.
- `supabase/tests/local/checks.sql` (14 checks), `supabase/tests/rls_smoke.sh` (3 checks).
- `site/privacy.html`: what happens to a receipt photo sent on WhatsApp.
- `DECISIONS.md` (D94), `HANDOFF.md`, `CLAUDE.md`, `README.md`.
- My migration was first named `20260930010000_…`, the same timestamp as the other
  session's Wise migration; it was renamed to `20260930020000_…` before either was pushed.

## 2026-09-30: Phase 6, the disclosure check and the receipt observatory

**What Angad asked:** build Phase 6 (a disclosure check listing standard items "not found on
this receipt"; an observatory of anonymized totals from research-consented receipts, with
the sample size prominent and labeled early results). **What Claude did:** wrote all of the
files below. D86 assigns the disclosure check to Claude.

**Created:**
- `packages/receipt/src/disclosures.ts` and `src/disclosures.test.ts`: the check, tested on
  the fixtures and on 120 synthetic receipts' ground truth.
- `supabase/migrations/20260930030000_receipt_observatory.sql`: `disclosures_missing`, the
  two cost columns, `receipt_result()` with disclosures, and `receipt_observatory()`.
- `mobile/src/lib/observatory.ts`, `mobile/src/app/observatory.tsx`, and
  `mobile/src/__tests__/observatory.test.tsx` (3 tests).

**Changed:**
- `supabase/functions/scan-receipt/index.ts`, `packages/receipt/src/api.ts`: disclosures
  worked out at scan, stored and returned; total cost and markup stored at confirm. Test in
  `packages/receipt/src/scan-function.test.ts`.
- `packages/receipt/src/benchmark.ts`, `scripts/benchmark.ts`: a disclosure-check table.
  `benchmark/results.md` regenerated.
- `packages/bot/src/receipt.ts` and its test: a "not found on this receipt" line in the
  WhatsApp result, in English and Hindi.
- `mobile/src/components/receipt-result.tsx`: a disclosures section and a "What this does not
  tell you" block. Tests in `mobile/src/__tests__/receipt-result.test.tsx`, fixtures in
  three other app tests.
- `mobile/src/i18n/en.ts`, `hi.ts`, `es.ts`, `tl.ts`, `vi.ts`: the new strings. English is the
  source; the other four are Claude's drafts behind D69's reviewer gate.
- `mobile/src/app/_layout.tsx`, `mobile/src/app/(tabs)/learn.tsx`: the screen and its entry.
- `supabase/tests/local/checks.sql` (7 checks), `supabase/tests/rls_smoke.sh` (1 check).
- `site/privacy.html`: the observatory's totals and the five-receipt minimum.
- `DECISIONS.md` (D95, D96), `HANDOFF.md`, `CLAUDE.md`.

## 2026-10-01: the remittance tax checked against the IRS proposed rules

**What Claude did:** read summaries of the proposed regulations (REG-114499-25) and found a
$15.00 small-transfer exclusion the formula didn't have; added it.
- `packages/formula/src/index.ts`, `packages/formula/python/remitbridge_formula/__init__.py`:
  `REMITTANCE_TAX_SMALL`, no tax at $15.00 or less. `packages/formula/vectors.tax.json`:
  cases at $15.00 and $15.01; the $0.49 case renamed.
- `packages/receipt/src/result.ts` and its test: tax status `small_transfer`.
- `mobile/src/components/receipt-result.tsx`, `mobile/src/i18n/*.ts`: the small-transfer
  line and new wording for the tax note, in five languages (four are drafts). Test in
  `mobile/src/__tests__/receipt-result.test.tsx`.
- `DECISIONS.md` (D97), `CLAUDE.md`.

## 2026-09-30: switching the model fallback to Groq's free tier

**What Angad asked:** find a free API, since OpenRouter needs paid credit. **What Claude
did:** compared free tiers (Groq, OpenRouter's free models, Gemini, Cloudflare Workers AI,
GitHub Models) against D92's needs: photos, a strict JSON schema, nothing kept or trained
on. Recommended Groq with Qwen3.8 27B (D98); Angad made the key, and Claude switched the code.
- `packages/receipt/src/model.ts`: `groqClient()` and `GROQ_URL` replace the OpenRouter
  client; the request drops OpenRouter's `provider` and `models` fields and turns Qwen's
  thinking off; `max_tokens` 1,500. Fallback models removed (also in `pipeline.ts`).
- `supabase/functions/scan-receipt/index.ts`: reads `GROQ_API_KEY`.
- `packages/receipt/scripts/benchmark.ts`, `src/benchmark.ts`, `.github/workflows/benchmark.yml`:
  the Groq key, waiting out 429s, a 60-minute timeout.
- Tests: `model.test.ts`, `scan-function.test.ts`, `benchmark.test.ts`, `test/fake-model.ts`.
  189 receipt tests pass.
- `site/privacy.html`: Groq replaces OpenRouter as the processor.
- `README.md`, `benchmark/README.md`, `docs/cac/submission.md`, `DECISIONS.md` (D98),
  `CLAUDE.md`, `HANDOFF.md`.

## 2026-10-01: the receipt extractors (D130)

**What Angad asked:** "go ahead and do the extractamountsent and allat stuff", after
Claude had explained the first extractor for him to write. **This changes D86:** the 13
rule-based extractors were to be Angad's own code, and they are now Claude's. Nothing in the
receipt parser was written by Angad.

**Created:**
- `packages/receipt/src/extract/read.ts`: the reading helpers. Which label each line starts
  with (longest wins), the value after a label (same line or the next), amounts with their
  currency ("$500.00", "500.00 USD", "₹88,150.00", a sign OCR garbled), exchange rates
  either way round, dates (month first unless the day settles it).
- `packages/receipt/src/extract/extract.test.ts`: 18 tests of the helpers and the
  extractors' traps (the peso "Transfer Amount", "Total to Recipient", "Date Available",
  "Ria" inside "Maria", cashier's check versus cash, a misread ₹).

**Changed:**
- `packages/receipt/src/extract/fields.ts`: the 13 `TODO(angad)` stubs replaced with working
  extractors, each with a confidence and the words it read.
- `packages/receipt/src/scan-function.test.ts`: the model-path tests use a "poor photo" of
  the Western Union receipt the rules can't read, since the rules now read the clean one; a
  new test checks the model isn't called when the rules read everything.
- Comments in `parser.ts`, `parser.test.ts`, `fixtures.test.ts`, `benchmark.ts`;
  `README.md`, `benchmark/README.md`, `DECISIONS.md` (D130), `CLAUDE.md`, `HANDOFF.md`.

**Results:** fixtures 47 of 47; 60 synthetic receipts read back with OCR, 97.8% accuracy and
99.0% precision before the OCR fixes, all but two values after. 262 receipt tests pass.
