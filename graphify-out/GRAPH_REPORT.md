# Graph Report - RemitBridge-App  (2026-10-10)

## Corpus Check
- 401 files · ~841,400 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2415 nodes · 6313 edges · 160 communities (118 shown, 42 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 84 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c42f36aa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Handoff
- Permission request: pricing data
- types.ts
- LocalStore
- metrics.tsx
- learn-progress.ts
- expo
- ocr.ts
- test_wise.py
- formula/package.json
- compilerOptions
- test_vectors.py
- compilerOptions
- package.json
- api.ts
- 9. The scraping engine (core system)
- AGENTS.md
- eslint.config.js
- adapters/__init__.py
- dependencies
- 14. Design system and brand consistency
- blog.tsx
- bot/package.json
- compare.tsx
- admin.tsx
- review-sheet.ts
- compilerOptions
- Google Play
- receipt-scan.ts
- languages.ts
- secure-session.ts
- devDependencies
- (tabs)/_layout.tsx
- synthesize.ts
- models.py
- synth.ts
- illustrations.tsx
- account.tsx
- receipt/package.json
- react-native-worklets
- @supabase/supabase-js
- compilerOptions
- remitbridge-engine
- bot/src/index.ts
- RemitBridge: context for the Congressional App Challenge 2026
- RemitBridge — Product Requirements Document
- rls_smoke.sh
- compilerOptions
- 5. MVP features
- 6. Corridors
- build.mjs
- webhook.test.ts
- Partner outreach: Seattle-area organizations
- test_instarem.py
- expo-symbols
- send-rate-alerts.mjs
- extract.py
- 1. Why this exists
- whatsapp/index.ts
- run_adapter
- rate-alerts.ts
- learn-path.tsx
- vercel.json
- expo-web-browser
- make-icons.py
- cli.py
- receipt.ts
- The four Tier 1 routes, Q1 2025
- make-onboarding-art.py
- fetchQuotes
- scripts/benchmark.ts
- Providers for manual research
- motion-views.tsx
- whatsapp-section.tsx
- i18n/index.tsx
- expo-font
- model.ts
- runner.py
- local_migrations.sh
- modules.ts
- AI usage log
- PoliteClient
- README.md
- RemitBridge App
- Decisions
- Open items
- RemitBridge
- Engine
- test_gate.py
- expo-localization
- extract/fields.ts
- icon.test.ts
- Congressional App Challenge 2026: draft entry
- @infinitered/react-native-mlkit-core
- track
- CAC gap report: the receipt scanner and what goes with it
- port-blog.mjs
- website-legal-entity.md
- react-native-safe-area-context
- Receipt reading benchmark
- lesson/[id].tsx
- Launch checklist: App Store and Google Play
- @shopify/react-native-skia
- @react-native-google-signin/google-signin
- expo-status-bar
- expo-router
- expo-image-manipulator
- Hindi review sheet
- expo-linking
- formula/src/index.ts
- react-native
- parse.ts
- observatory.ts
- receipt-preview.tsx
- expo-splash-screen
- @remitbridge/formula
- ManualAdapter
- useTheme
- Security review (for Angad)
- expo-crypto
- react-native-screens
- datetime
- Security and data protection
- Contributing
- RemitBridge Labs: setting up the nonprofit
- saved-checks.tsx
- react-native-web
- expo-dev-client
- WhatsApp message templates
- expo-router
- blockedPermissions
- CREDITS.md
- ios
- android
- react
- react-dom
- react-native-gesture-handler
- react-native-svg
- adaptiveIcon
- extra
- expo-constants
- plugins
- expo-file-system
- receipt-result.test.tsx
- expo-haptics
- expo-image-picker
- expo-secure-store
- expo-system-ui
- experiments
- @remitbridge/receipt

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 181 edges
2. `useCopy()` - 129 edges
3. `track()` - 62 edges
4. `AppText()` - 58 edges
5. `Spacing` - 51 edges
6. `expo-router` - 48 edges
7. `useLanguage()` - 45 edges
8. `money()` - 44 edges
9. `Fonts` - 43 edges
10. `FieldName` - 36 edges

## Surprising Connections (you probably didn't know these)
- `normalize()` --calls--> `compute_transfer_cost()`  [INFERRED]
  engine/src/remitbridge_engine/normalize.py → packages/formula/python/remitbridge_formula/__init__.py
- `extractSendCurrency()` --indirect_call--> `field()`  [INFERRED]
  packages/receipt/src/extract/fields.ts → mobile/src/dev/receipt-samples.ts
- `scoreFields()` --indirect_call--> `field()`  [INFERRED]
  packages/receipt/src/harness.ts → mobile/src/dev/receipt-samples.ts
- `readAnswer()` --indirect_call--> `field()`  [INFERRED]
  packages/receipt/src/model.ts → mobile/src/dev/receipt-samples.ts
- `FieldValues` --references--> `DeliveryMethod`  [EXTRACTED]
  packages/receipt/src/types.ts → mobile/src/lib/routes.ts

## Import Cycles
- None detected.

## Communities (160 total, 42 thin omitted)

### Community 0 - "Handoff"
Cohesion: 0.14
Nodes (14): 2026-09-30 evening (local session, the go-live list), 2026-10-01 (cloud session), 2026-10-10: where things stand, CAC receipt scanner (all six phases on `main`: PR #1 on 2026-09-30, PR #2 on 2026-10-01), Handoff, How to run things, Known gaps between the PRD and the decisions, Local toolchain (checked 2026-09-29) (+6 more)

### Community 1 - "Permission request: pricing data"
Cohesion: 0.33
Nodes (5): From 2026-10-08: signing as an incorporated nonprofit, Permission request: pricing data, Round 2: shorter ask to more providers (2026-10-04), What was sent, Where to send

### Community 2 - "types.ts"
Cohesion: 0.08
Nodes (47): read(), ExtractionContext, Extractor, Extractors, Checked, checkValue(), deserializeValue(), FIELD_SPECS (+39 more)

### Community 3 - "LocalStore"
Cohesion: 0.08
Nodes (11): Any, LocalStore, mid_market_rows(), AsyncClient, Path, Protocol, quote_row(), Store (+3 more)

### Community 4 - "metrics.tsx"
Cohesion: 0.14
Nodes (14): Breakdown(), Group(), MetricsScreen(), PERIODS, styles, TOOL_LABELS, ListFact(), EnglishOnly() (+6 more)

### Community 5 - "learn-progress.ts"
Cohesion: 0.19
Nodes (14): dayBefore(), learned, LearnStats, listeners, localDay(), markLearned(), nextStep(), recordLesson() (+6 more)

### Community 6 - "expo"
Cohesion: 0.20
Nodes (9): expo, icon, name, orientation, owner, scheme, slug, userInterfaceStyle (+1 more)

### Community 7 - "ocr.ts"
Cohesion: 0.13
Nodes (32): pages, showsWord(), checkDisclosures(), missingDisclosures(), TODAY, FIXTURES_DIR, loadFixtures(), parseFixture() (+24 more)

### Community 8 - "test_wise.py"
Cohesion: 0.15
Nodes (22): _delivery(), The shape of what this adapter reads: the envelope and Wise's own quotes. The…, An ISO 8601 duration such as PT44M27S or P2DT3H, in seconds., Wise's own estimate in plain words. Nothing when Wise gives none., _seconds(), WiseAdapter, mid(), no_sleep() (+14 more)

### Community 9 - "formula/package.json"
Cohesion: 0.13
Nodes (14): devDependencies, typescript, vitest, typescript, vitest, main, name, private (+6 more)

### Community 10 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowImportingTsExtensions, paths, strict, types, extends, include, @/assets/* (+7 more)

### Community 11 - "test_vectors.py"
Cohesion: 0.16
Nodes (16): compute_transfer_cost(), The one total-cost formula (the TrueCost method, PRD 14.4). Python twin of…, The 1% federal remittance tax, rounded half up to the cent. The base is the…, S sent, F fee and T transfer tax (sending currency), Q quoted and M mid-market…, Twelve identical transfers. No compounding, no assumption about future rates., remittance_tax(), TransferCost, yearly_cost() (+8 more)

### Community 12 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, allowImportingTsExtensions, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck (+6 more)

### Community 13 - "package.json"
Cohesion: 0.15
Nodes (12): devDependencies, patch-package, name, private, scripts, postinstall, test, typecheck (+4 more)

### Community 14 - "api.ts"
Cohesion: 0.09
Nodes (31): page, RESULT, Comparison, ConfirmRequest, ConfirmResponse, isBox(), isNum(), LIMITS (+23 more)

### Community 15 - "9. The scraping engine (core system)"
Cohesion: 0.14
Nodes (14): 9.10 Engine SLOs, 9.11 Schedule, 9.12 Scraper conduct, 9.13 Tech stack, 9.1 Design principles, 9.2 Architecture, 9.3 The adapter framework, 9.4 Multi-strategy extraction (+6 more)

### Community 16 - "AGENTS.md"
Cohesion: 0.33
Nodes (5): Building with EAS, Commands, Expo has changed — do not trust your training data, Navigation & Routing, Rules

### Community 19 - "dependencies"
Cohesion: 0.08
Nodes (25): expo, expo-apple-authentication, expo-device, expo-glass-effect, @expo-google-fonts/hind, @expo-google-fonts/plus-jakarta-sans, expo-image, expo-notifications (+17 more)

### Community 20 - "14. Design system and brand consistency"
Cohesion: 0.17
Nodes (12): 14.10 Accessibility and low-bandwidth use, 14.11 Enforcement, 14.1 Where the app lives, 14.2 Naming, 14.3 Voice and writing rules, 14.4 Shared terminology, 14.5 Visual foundations, 14.6 Core components (+4 more)

### Community 21 - "blog.tsx"
Cohesion: 0.18
Nodes (18): BlogPostScreen(), styles, go(), Inline(), PostBlock(), PostCard(), PostCover(), SeriesMark() (+10 more)

### Community 22 - "bot/package.json"
Cohesion: 0.13
Nodes (14): devDependencies, typescript, vitest, typescript, vitest, main, name, private (+6 more)

### Community 23 - "compare.tsx"
Cohesion: 0.10
Nodes (39): QuoteDetail(), rate(), styles, AlertLink(), cleanAmount(), Compare(), FundingPicker(), Notice() (+31 more)

### Community 24 - "admin.tsx"
Cohesion: 0.16
Nodes (18): AddPriceScreen(), cleanNumber(), Field(), RecentRow(), STATUS_LABEL, styles, arithmeticCheck(), EntryStatus (+10 more)

### Community 25 - "review-sheet.ts"
Cohesion: 0.12
Nodes (23): cell(), Code, doc, draft, DRAFTS, leaves(), lines, next (+15 more)

### Community 26 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck, strict (+3 more)

### Community 27 - "Google Play"
Cohesion: 0.14
Nodes (13): Age rating, App Privacy ("nutrition label"), App Store, Closed test (required before the first public release), Content rating (IARC questionnaire), Data safety, Financial features declaration, Google Play (+5 more)

### Community 28 - "receipt-scan.ts"
Cohesion: 0.06
Nodes (46): partOfDay(), ScanScreen(), canScan(), discardPhotoFiles(), measureSharpness(), MlKit, MlKitText, OcrOutcome (+38 more)

### Community 29 - "languages.ts"
Cohesion: 0.23
Nodes (9): TERM_TRANSLATIONS, TermTranslation, LanguageProvider(), startingLanguage(), isReviewed(), LanguageCode, LANGUAGES, languagesNeedingReview() (+1 more)

### Community 30 - "secure-session.ts"
Cohesion: 0.11
Nodes (13): encryptionKey(), fromBase64(), fromUtf8(), open(), seal(), secureSessionStorage, toBase64(), utf8() (+5 more)

### Community 31 - "devDependencies"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-expo, jest, jest-expo, devDependencies, eslint, eslint-config-expo, jest (+35 more)

### Community 32 - "(tabs)/_layout.tsx"
Cohesion: 0.32
Nodes (6): ORDER, styles, swipe, AppTabs(), currentTab(), setSwipeDirection()

### Community 33 - "synthesize.ts"
Cohesion: 0.13
Nodes (15): LANG, require, count, first, IMAGES, LANG, OUT, require (+7 more)

### Community 34 - "models.py"
Cohesion: 0.08
Nodes (34): ABC, Adapter, AdapterMeta, The adapter framework (PRD 9.3). An adapter holds only what is specific to one…, A hash of the response's structure (keys and types, not values), for drift…, Which routes, delivery methods and payment methods this provider serves., Every quote to ask for this run: supported routes x methods x the amount grid., Ask for one quote with one strategy. Return the raw response untouched. (+26 more)

### Community 35 - "synth.ts"
Cohesion: 0.07
Nodes (35): FundingMethod, DISCLOSURE_ITEMS, DisclosureResult, TEXT_SIGNS, Fixture, addDays(), CITIES, Corridor (+27 more)

### Community 36 - "illustrations.tsx"
Cohesion: 0.17
Nodes (30): ArrivalArt, Art, BankArt, BasicsArt, ChainArt, CheckedArt, depth(), FairRateArt (+22 more)

### Community 37 - "account.tsx"
Cohesion: 0.06
Nodes (50): AccountScreen(), NameField(), styles, Navigator(), useAlertTaps(), useSessionEvents(), CodeStep(), EmailStep() (+42 more)

### Community 38 - "receipt/package.json"
Cohesion: 0.08
Nodes (23): devDependencies, playwright-core, tesseract.js, @tesseract.js-data/eng, typescript, vitest, typescript, vitest (+15 more)

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, paths, skipLibCheck (+11 more)

### Community 45 - "bot/src/index.ts"
Cohesion: 0.13
Nodes (32): AMOUNTS, Route, ago(), countryIn(), EN_THE, formatCompare(), formatDailyLimit(), formatForgotten() (+24 more)

### Community 46 - "RemitBridge: context for the Congressional App Challenge 2026"
Cohesion: 0.17
Nodes (11): 1. Contest basics, 2. The problem, 3. What RemitBridge does, 4. How it works (technical), 5. Values and design choices (good material for "impact" answers), 6. Current status (do not overstate), 7. AI use (for disclosure questions), 8. Answers that need Angad's own input (+3 more)

### Community 47 - "RemitBridge — Product Requirements Document"
Cohesion: 0.20
Nodes (10): 10. Success metrics, 11. Risks, 12. Milestones, 13. Open questions, 2. Positioning and competitors, 3. Users, 4. Goals and non-goals, 7. Roadmap (post-MVP) (+2 more)

### Community 48 - "rls_smoke.sh"
Cohesion: 0.47
Nodes (4): check(), pg(), post(), rls_smoke.sh script

### Community 49 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck (+10 more)

### Community 50 - "5. MVP features"
Cohesion: 0.22
Nodes (9): 5.1 Total-cost comparison, 5.2 "Where your money went" breakdown, 5.3 Provider database, 5.4 Methodology page, 5.5 Multilingual UI, 5.6 Basic analytics, 5.7 Migration of existing RemitBridge tools, 5.8 WhatsApp bot (promoted to MVP) (+1 more)

### Community 51 - "6. Corridors"
Cohesion: 0.25
Nodes (8): 6.1 Tier 1 — Launch (4 corridors), 6.2 Tier 2 — First expansion (10 corridors), 6.3 Tier 3 — Broad coverage (14 corridors), 6.4 Special-handling corridors, 6.5 Future sending countries (Phase 2 of coverage), 6.6 Provider universe (per adapter, not per corridor), 6.7 Corridor request system, 6. Corridors

### Community 52 - "build.mjs"
Cohesion: 0.27
Nodes (12): build(), copyrightLine(), docLayout(), escape(), files(), legalEntity(), loadConfig(), out (+4 more)

### Community 53 - "webhook.test.ts"
Cohesion: 0.11
Nodes (17): clients, createClient(), query(), reset(), Row, rpcCalls, rpcs, tables (+9 more)

### Community 54 - "Partner outreach: Seattle-area organizations"
Cohesion: 0.33
Nodes (5): Draft email, Log, Partner outreach: Seattle-area organizations, What to ask for, Who, and why

### Community 55 - "test_instarem.py"
Cohesion: 0.36
Nodes (15): InstaremAdapter, fixture(), parametrize, The Instarem adapter against real responses from its quote endpoint…, raw(), req(), test_a_failed_answer_a_warning_a_tax_or_a_coupon_is_refused(), test_a_full_run_publishes_all_four_routes_through_the_gate() (+7 more)

### Community 57 - "send-rate-alerts.mjs"
Cohesion: 0.17
Nodes (10): COUNTRY, gone, H, messages, money(), push, sent, sentWhatsApp (+2 more)

### Community 58 - "extract.py"
Cohesion: 0.38
Nodes (9): _clean(), extract(), main(), _median(), _num(), _pct(), _period_label(), Path (+1 more)

### Community 59 - "1. Why this exists"
Cohesion: 0.67
Nodes (3): 1. Why this exists, The end goal, in one sentence, What "success" looks like in 12 months

### Community 60 - "whatsapp/index.ts"
Cohesion: 0.05
Nodes (60): checkedAmountFor(), cors, cors, NAMES, cors, capped(), cheapest(), clientIp() (+52 more)

### Community 61 - "run_adapter"
Cohesion: 0.17
Nodes (25): _er_api(), fetch_mid_market(), _frankfurter(), FxUnavailable, AsyncClient, Exception, Mid-market reference rates from two free sources, cross-checked (PRD 9.7 check…, No trustworthy mid-market rate for a pair right now. (+17 more)

### Community 62 - "rate-alerts.ts"
Cohesion: 0.24
Nodes (8): AlertChannel, createAlert(), CreateResult, pushToken(), TokenResult, ALERT, mockInsert, mockPush

### Community 63 - "learn-path.tsx"
Cohesion: 0.18
Nodes (11): CLOUDS, Halo(), LearnBackdrop(), LearnPath(), Node(), Ring(), styles, MODULE_ART (+3 more)

### Community 64 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, cleanUrls, headers, ignoreCommand, outputDirectory, rewrites

### Community 66 - "make-icons.py"
Cohesion: 0.40
Nodes (3): mark(), Rebuild the app icons from the website mark: `python3 scripts/make-icons.py`…, Draw the mark so its 64-unit design fits `box` px (the favicon's own 64 grid),…

### Community 67 - "cli.py"
Cohesion: 0.09
Nodes (25): datetime, archive_key(), LocalArchive, AsyncClient, Path, The raw archive (PRD 9.1 principle 4): every response, compressed and…, Writes to engine/.archive. For development and tests; gitignored., Uploads to the private `raw-archive` bucket in Supabase Storage. (+17 more)

### Community 68 - "receipt.ts"
Cohesion: 0.13
Nodes (19): LINK, DELIVERY_WORDS, DISCLOSURE_WORDS, formatReceiptAck(), formatReceiptFailed(), formatReceiptQuestion(), formatReceiptsOff(), formatReceiptUnreadable() (+11 more)

### Community 69 - "The four Tier 1 routes, Q1 2025"
Cohesion: 0.25
Nodes (7): India (47 services surveyed), Median total cost of a $200 transfer, by year, Mexico (46 services surveyed), Philippines (57 services surveyed), The four Tier 1 routes, Q1 2025, Vietnam (31 services surveyed), World Bank remittance prices: sending from the US

### Community 70 - "make-onboarding-art.py"
Cohesion: 0.23
Nodes (9): band(), ground(), light(), mark(), Render the website's backdrop art for the app: `python3 scripts/make-…, A round pen along the path: no seams where segments meet., The outlined mark, white on transparent, at `scale` px per viewBox unit., The resting light: color at `alpha` in the middle, nothing at 60% of 38rem. (+1 more)

### Community 71 - "fetchQuotes"
Cohesion: 0.43
Nodes (6): fetchQuotes(), fromCache(), nearest(), rank(), remember(), q()

### Community 72 - "scripts/benchmark.ts"
Cohesion: 0.07
Nodes (48): f(), byItem, imageFor(), leaks, lost, md, modes, readAll() (+40 more)

### Community 73 - "Providers for manual research"
Cohesion: 0.40
Nodes (5): Checked 2026-10-01, nothing to automate, Neither forbidden nor automated, Not yet checked, Providers for manual research, Public datasets

### Community 74 - "motion-views.tsx"
Cohesion: 0.12
Nodes (20): Stat(), STATS, styles, Why(), EASE_OUT, GENTLE, RISE_DELAYS, RISE_DISTANCE (+12 more)

### Community 75 - "whatsapp-section.tsx"
Cohesion: 0.45
Nodes (8): WhatsAppSection(), formatNumber(), linkStatus, newLinkCode(), openChat(), unlinkWhatsApp(), whatsAppSettings, mockSession

### Community 76 - "i18n/index.tsx"
Cohesion: 0.07
Nodes (66): styles, styles, styles, ModuleScreen(), styles, SETUPS, styles, TESTS (+58 more)

### Community 79 - "model.ts"
Cohesion: 0.06
Nodes (47): answerSchema(), askModel(), buildRequest(), ChatRequest, ChatResponse, DEFAULT_MODEL, GROQ_URL, groqClient() (+39 more)

### Community 80 - "runner.py"
Cohesion: 0.11
Nodes (28): Archive, Protocol, _anomaly(), _is_promotional(), _math_ok(), _range_problems(), The publish gate (PRD 9.7). A quote reaches users only if it passes every…, Sets validation_status, validation_notes and is_promotional on each quote, in… (+20 more)

### Community 81 - "local_migrations.sh"
Cohesion: 0.67
Nodes (3): LC_ALL, run(), local_migrations.sh script

### Community 82 - "modules.ts"
Cohesion: 0.21
Nodes (10): Term, TERMS, BY_ID, MODULES, moduleTerms(), BY_ID, currentAnswer(), lessonIds (+2 more)

### Community 83 - "AI usage log"
Cohesion: 0.09
Nodes (23): 2026-09-30: merging `main` (the other session's languages and accessibility work), 2026-09-30: Phase 1, the gap report, 2026-09-30: Phase 2, data model, redaction, parser harness, model fallback, validation, 2026-09-30: Phase 3, confirmation screen, result screen, funding method, 2026-09-30: Phase 4, the accuracy benchmark and synthetic receipts, 2026-09-30: Phase 5, receipt photos on WhatsApp, 2026-09-30: Phase 6, the disclosure check and the receipt observatory, 2026-09-30: switching the model fallback to Groq's free tier (+15 more)

### Community 84 - "PoliteClient"
Cohesion: 0.20
Nodes (8): PoliteClient, AsyncClient, parametrize, test_gives_up_after_max_attempts(), test_never_retries_when_told_to_stop(), test_retries_transient_errors_then_succeeds(), test_waits_between_requests_to_the_same_domain(), Response

### Community 86 - "RemitBridge App"
Cohesion: 0.22
Nodes (9): Git, graphify, Keeping the docs current, Product rules that are also code rules, RemitBridge App, Secrets, Stack, Talking to Angad (+1 more)

### Community 87 - "Decisions"
Cohesion: 0.11
Nodes (19): 2026-09-28: Angad's answers on partners, structure, and prices, 2026-09-28: during the first build slice, 2026-09-28: first round, after reading PRD v0.4, 2026-09-28: onboarding and the Compare controls, 2026-09-28: second round, 2026-09-28: third round, 2026-09-30: accessibility and languages, 2026-09-30: Phase 3 defaults (+11 more)

### Community 88 - "Open items"
Cohesion: 0.25
Nodes (8): Before launch, CAC submission (internal deadline Oct 23, official Oct 26), Done, Features to set up, Open items, Testing (once the features are set up), Thank-yous and outreach (Angad sends), Watching and later

### Community 89 - "RemitBridge"
Cohesion: 0.29
Nodes (7): Docs, Launch routes, Layout, RemitBridge, Setup, Status, The operator's details and the site

### Community 90 - "Engine"
Cohesion: 0.33
Nodes (5): Adapters, Adding an adapter, Engine, How a run works, Manual quotes

### Community 91 - "test_gate.py"
Cohesion: 0.42
Nodes (11): gate(), make(), test_a_clean_quote_publishes(), test_captured_at_defaults_to_now(), test_huge_fee_is_held(), test_markup_over_15_percent_is_held(), test_provider_rounding_is_tolerated(), test_rate_well_above_mid_market_needs_a_promo_label() (+3 more)

### Community 93 - "extract/fields.ts"
Cohesion: 0.12
Nodes (41): deliveryIn(), extractAmountReceived(), extractAmountSent(), extractDeliveryMethod(), extractExchangeRate(), extractFee(), extractFundingMethod(), extractPickupCharge() (+33 more)

### Community 95 - "Congressional App Challenge 2026: draft entry"
Cohesion: 0.17
Nodes (11): App name, Congressional App Challenge 2026: draft entry, Demo video script (about 2 minutes 45 seconds), How does it work?, One-line description, Technologies, Use of AI tools (disclose this), What did you learn? / What would you do next? (+3 more)

### Community 97 - "track"
Cohesion: 0.08
Nodes (53): FairRateScreen(), knownCurrency(), styles, ObservatoryScreen(), styles, PartnerLink(), fmt(), PERIODS (+45 more)

### Community 98 - "CAC gap report: the receipt scanner and what goes with it"
Cohesion: 0.33
Nodes (5): CAC gap report: the receipt scanner and what goes with it, Decisions I need before Phase 2, Item by item, Rough fit against Oct 23, What the new work sits on

### Community 99 - "port-blog.mjs"
Cohesion: 0.17
Nodes (9): app, appCovers, assets, blogJs, { bodies }, coverFiles, images, out (+1 more)

### Community 102 - "Receipt reading benchmark"
Cohesion: 0.14
Nodes (12): Real receipts (`receipts/`), Receipt reading benchmark, Running it, Synthetic receipts (`synthetic/`), What this does not tell you, By field (accuracy), Disclosure check, Receipt reading benchmark (+4 more)

### Community 103 - "lesson/[id].tsx"
Cohesion: 0.12
Nodes (29): Celebration(), haptic(), Lesson(), LessonScreen(), Option(), OptionState, pick(), styles (+21 more)

### Community 104 - "Launch checklist: App Store and Google Play"
Cohesion: 0.18
Nodes (10): Android (Google Play), Blocking, Blocking, iPhone (App Store), Launch checklist: App Store and Google Play, Not needed for launch, Should do first, Should do first (+2 more)

### Community 109 - "expo-router"
Cohesion: 0.06
Nodes (63): PickRoute(), styles, RequestRoute(), styles, BoardRow(), LaunchEmails(), RouteBoard(), STAGES (+55 more)

### Community 113 - "formula/src/index.ts"
Cohesion: 0.13
Nodes (27): ReceiptResult(), formatReceiptResult(), computeTransferCost(), FUNDING_METHODS, MATH_TOLERANCE_ABS, MATH_TOLERANCE_REL, REMITTANCE_TAX_FROM, REMITTANCE_TAX_RATE (+19 more)

### Community 116 - "parse.ts"
Cohesion: 0.10
Nodes (24): ALIASES, CHECK, CURRENCY_TO_COUNTRY, ENGLISH, findAmount(), findMethod(), findPlaces(), FORGET (+16 more)

### Community 117 - "observatory.ts"
Cohesion: 0.38
Nodes (5): fetchObservatory(), Observatory, ObservatoryGroup, DATA, fetchMock

### Community 119 - "receipt-preview.tsx"
Cohesion: 0.17
Nodes (12): Part, styles, confirmedFields, field(), SAMPLE_PAGE, SAMPLE_RESULT, SAMPLE_RESULT_NONE, SAMPLE_RESULT_TODAY (+4 more)

### Community 123 - "ManualAdapter"
Cohesion: 0.19
Nodes (4): RouteSupport, ManualAdapter, Path, (provider_id, request, observation) for every recorded observation.

### Community 125 - "useTheme"
Cohesion: 0.08
Nodes (47): AlertScreen(), Step(), BlogIndex(), ReceiptPreview(), GlossaryScreen(), Ask(), Feedback(), Finish() (+39 more)

### Community 126 - "Security review (for Angad)"
Cohesion: 0.22
Nodes (8): 1. Changes already live (please review), 2. Changes waiting on your `supabase db push` (please review, then push), 3. Changes in the app (ship with the next build; please review), 4. Things only you can do, 4b. WhatsApp numbers (your yes, 2026-10-02), 4c. Limits on AI spending (your ask, 2026-10-02; D140), 5. Checked and fine (nothing to do, for your information), Security review (for Angad)

### Community 131 - "Security and data protection"
Cohesion: 0.40
Nodes (4): Security and data protection, Still to do (people, not code), Threats and what stops them, What's sensitive

### Community 132 - "Contributing"
Cohesion: 0.50
Nodes (3): Commits, Contributing, Sign off every commit (Developer Certificate of Origin)

### Community 133 - "RemitBridge Labs: setting up the nonprofit"
Cohesion: 0.25
Nodes (7): 1. EIN (federal tax ID): put off (Angad, 2026-10-10), 2. Organize the board: this month, 3. Bank account: NOT DOING (D150), 4. Federal tax exemption (501(c)(3)): NOT DOING (D150), 5. Every year, 6. After the EIN, things that open up, RemitBridge Labs: setting up the nonprofit

### Community 134 - "saved-checks.tsx"
Cohesion: 0.26
Nodes (10): SavedScreen(), styles, SavedChecks(), styles, costOf(), deleteCheck(), fetchChecks(), NewCheck (+2 more)

### Community 139 - "blockedPermissions"
Cohesion: 0.22
Nodes (9): blockedPermissions, android.permission.READ_EXTERNAL_STORAGE, android.permission.READ_MEDIA_AUDIO, android.permission.READ_MEDIA_IMAGES, android.permission.READ_MEDIA_VIDEO, android.permission.READ_MEDIA_VISUAL_USER_SELECTED, android.permission.RECORD_AUDIO, android.permission.SYSTEM_ALERT_WINDOW (+1 more)

### Community 141 - "ios"
Cohesion: 0.22
Nodes (9): usesNonExemptEncryption, ios, associatedDomains, bundleIdentifier, config, icon, supportsTablet, usesAppleSignIn (+1 more)

### Community 142 - "android"
Cohesion: 0.29
Nodes (7): allowBackup, intentFilters, package, permissions, predictiveBackGestureEnabled, android, android.permission.CAMERA

### Community 149 - "adaptiveIcon"
Cohesion: 0.40
Nodes (5): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon

### Community 150 - "extra"
Cohesion: 0.50
Nodes (4): projectId, extra, eas, router

### Community 152 - "plugins"
Cohesion: 0.50
Nodes (4): plugins, expo-apple-authentication, expo-localization, expo-sqlite

### Community 154 - "receipt-result.test.tsx"
Cohesion: 0.50
Nodes (4): confirmed(), expected, fields(), WU

### Community 160 - "experiments"
Cohesion: 0.67
Nodes (3): reactCompiler, typedRoutes, experiments

## Knowledge Gaps
- **782 isolated node(s):** `Talking to Angad`, `Keeping the docs current`, `Features to set up`, `Testing (once the features are set up)`, `CAC submission (internal deadline Oct 23, official Oct 26)` (+777 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **42 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `expo-router` connect `expo-router` to `(tabs)/_layout.tsx`, `track`, `account.tsx`, `saved-checks.tsx`, `lesson/[id].tsx`, `motion-views.tsx`, `whatsapp-section.tsx`, `i18n/index.tsx`, `modules.ts`, `onboarding/_layout.tsx`, `compare.tsx`, `blog.tsx`, `receipt-preview.tsx`, `plugins`, `admin.tsx`, `sign-in/_layout.tsx`, `useTheme`, `callback.tsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `useTheme()` connect `useTheme` to `track`, `metrics.tsx`, `account.tsx`, `saved-checks.tsx`, `lesson/[id].tsx`, `illustrations.tsx`, `motion-views.tsx`, `i18n/index.tsx`, `expo-router`, `formula/src/index.ts`, `compare.tsx`, `blog.tsx`, `receipt-preview.tsx`, `admin.tsx`, `receipt-scan.ts`, `learn-path.tsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `plugins` connect `plugins` to `expo-router`, `expo`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `Talking to Angad`, `Keeping the docs current`, `Features to set up` to the rest of the system?**
  _782 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Handoff` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0819252432155658 - nodes in this community are weakly interconnected._
- **Should `LocalStore` be split into smaller, more focused modules?**
  _Cohesion score 0.08084163898117387 - nodes in this community are weakly interconnected._