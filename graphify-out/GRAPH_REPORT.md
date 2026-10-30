# Graph Report - RemitBridge-App  (2026-10-29)

## Corpus Check
- 518 files · ~16,349,405 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2904 nodes · 7790 edges · 176 communities (130 shown, 46 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 123 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2810585e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Handoff
- Permission request: pricing data
- types.ts
- LocalStore
- receipt-confirm.tsx
- scan-receipt/index.ts
- expo
- ocr.ts
- test_wise.py
- formula/package.json
- compilerOptions
- test_vectors.py
- compilerOptions
- package.json
- run_adapter
- 9. The scraping engine (core system)
- AGENTS.md
- eslint.config.js
- adapters/__init__.py
- dependencies
- 14. Design system and brand consistency
- learn-games.ts
- bot/package.json
- src/agent.ts
- lesson-screen.test.tsx
- review-sheet.ts
- compilerOptions
- Google Play
- remmy.ts
- model.ts
- lesson.ts
- devDependencies
- Quote
- bot/src/index.ts
- models.py
- synth.ts
- useTheme
- remmy-actions.ts
- receipt/package.json
- (tabs)/index.tsx
- newsletter.tsx
- compilerOptions
- remitbridge-engine
- rate-history.tsx
- whatsapp/index.ts
- RemitBridge — Product Requirements Document
- rls_smoke.sh
- compilerOptions
- 5. MVP features
- 6. Corridors
- build.mjs
- webhook.test.ts
- Partner outreach: Seattle-area organizations
- test_instarem.py
- send-rate-alerts.mjs
- Path
- admin.tsx
- Google Play: final look-through before shipping (2026-10-18)
- formula/src/index.ts
- To do
- secure-session.test.ts
- vercel.json
- result.ts
- make-icons.py
- RawResponse
- lesson/[id].tsx
- api.ts
- make-onboarding-art.py
- learn-progress.ts
- scripts/benchmark.ts
- fee-included.test.ts
- cli.py
- ui.tsx
- whatsapp-section.tsx
- expo-font
- expo-apple-authentication
- runner.py
- local_migrations.sh
- legal.ts
- secure-session.ts
- PoliteClient
- README.md
- RemitBridge App
- Decisions
- extra
- RemitBridge
- Engine
- test_gate.py
- metrics.tsx
- extract/fields.ts
- App review checklist (2026-10-17)
- app-tabs.tsx
- receipt-result.test.tsx
- expo-constants
- Security and data protection
- port-blog.mjs
- website-legal-entity.md
- datetime
- Receipt reading benchmark
- true-cost.tsx
- Publication audit, 2026-10-14
- @shopify/react-native-skia
- i18n/index.tsx
- expo-haptics
- expo-glass-effect
- scan.tsx
- Hindi review sheet
- expo-dev-client
- RemitBridge 2.0: what comes after launch
- Future updates
- supabase.ts
- parse.ts
- account.tsx
- expo-device
- rate-alerts.ts
- collection.py
- 1. Why this exists
- expo-file-system
- expo-image-picker
- Security review (for Angad)
- routes.ts
- expo-crypto
- @expo-google-fonts/plus-jakarta-sans
- ai.ts
- synthesize.ts
- sign-in.ts
- RemitBridge Labs: setting up the nonprofit
- expo-web-browser
- expo-linking
- What exists
- WhatsApp message templates
- blockedPermissions
- CREDITS.md
- ios
- android
- expo-localization
- react-native-gesture-handler
- expo-notifications
- Providers for manual research
- plugins
- Scope: an AI model in the WhatsApp bot
- send-newsletter/index.ts
- expo-sqlite
- licenses-page.mjs
- quotes.ts
- expo-status-bar
- apple.ts
- expo-system-ui
- react-native-pager-view
- @expo/ui
- @infinitered/react-native-mlkit-core
- react-native
- Publication readiness: App Store and Google Play
- chatgpt-research-task.md
- chatgpt-price-checks.md
- Security audit, 2026-10-17
- react-native-reanimated
- react-native-svg
- commit-id-map-2026-10-17.md
- @remitbridge/formula
- @remitbridge/receipt
- react-native-worklets
- @supabase/supabase-js
- Legal checklist, 2026-10-17
- @infinitered/react-native-mlkit-text-recognition
- @react-native-google-signin/google-signin
- react-native-web

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 207 edges
2. `useCopy()` - 142 edges
3. `track()` - 68 edges
4. `AppText()` - 65 edges
5. `Spacing` - 59 edges
6. `useLanguage()` - 56 edges
7. `money()` - 55 edges
8. `expo-router` - 54 edges
9. `Fonts` - 49 edges
10. `useGutter()` - 46 edges

## Surprising Connections (you probably didn't know these)
- `normalize()` --calls--> `compute_transfer_cost()`  [INFERRED]
  engine/src/remitbridge_engine/normalize.py → packages/formula/python/remitbridge_formula/__init__.py
- `quotes()` --indirect_call--> `q()`  [INFERRED]
  supabase/functions/_shared/agent.ts → mobile/src/__tests__/quotes-rank.test.ts
- `buildGame()` --indirect_call--> `field()`  [INFERRED]
  mobile/src/lib/learn-games.ts → packages/bot/src/webhook.test.ts
- `Inline()` --indirect_call--> `TOKEN()`  [INFERRED]
  mobile/src/components/blog.tsx → packages/bot/src/newsletter.test.ts
- `termsIn()` --indirect_call--> `TOKEN()`  [INFERRED]
  mobile/src/lib/reading.ts → packages/bot/src/newsletter.test.ts

## Import Cycles
- None detected.

## Communities (176 total, 46 thin omitted)

### Community 0 - "Handoff"
Cohesion: 0.05
Nodes (40): 2026-09-30 evening (local session, the go-live list), 2026-10-01 (cloud session), 2026-10-10: where things stand, 2026-10-11: Android feedback, 2026-10-12: Android sign-ins fixed, WhatsApp linking confirmed, the newsletter (D169), 2026-10-12: legal audit (D164), 2026-10-12: screenshots, Mexico's prices, the code email, WhatsApp replies, store prep, 2026-10-12: the WhatsApp agent's fallbacks (D163) (+32 more)

### Community 1 - "Permission request: pricing data"
Cohesion: 0.29
Nodes (6): 2026-10-12: inbox check, From 2026-10-08: signing as an incorporated nonprofit, Permission request: pricing data, Round 2: shorter ask to more providers (2026-10-04), What was sent, Where to send

### Community 2 - "types.ts"
Cohesion: 0.09
Nodes (41): read(), Extractor, Extractors, LabelHit, applyCorrection(), fieldsForModel(), mergeFields(), ModelInput (+33 more)

### Community 3 - "LocalStore"
Cohesion: 0.08
Nodes (11): Any, LocalStore, mid_market_rows(), AsyncClient, datetime, Path, Protocol, quote_row() (+3 more)

### Community 4 - "receipt-confirm.tsx"
Cohesion: 0.13
Nodes (22): Answers, Editor(), ReceiptConfirm(), styles, currencyOf(), editText(), formatValue(), parseTyped() (+14 more)

### Community 5 - "scan-receipt/index.ts"
Cohesion: 0.18
Nodes (17): checkedAmountFor(), capped(), cheapest(), compare(), confirm(), CORS, expiry(), fetchMid() (+9 more)

### Community 6 - "expo"
Cohesion: 0.15
Nodes (12): reactCompiler, typedRoutes, expo, experiments, icon, name, orientation, owner (+4 more)

### Community 7 - "ocr.ts"
Cohesion: 0.09
Nodes (44): pages, clean(), count, misses, offenders, score(), showsWord(), checkDisclosures() (+36 more)

### Community 8 - "test_wise.py"
Cohesion: 0.19
Nodes (19): _delivery(), An ISO 8601 duration such as PT44M27S or P2DT3H, in seconds., Wise's own estimate in plain words. Nothing when Wise gives none., _seconds(), WiseAdapter, fixture(), _FourRoutes, parametrize (+11 more)

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
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck (+8 more)

### Community 13 - "package.json"
Cohesion: 0.15
Nodes (12): devDependencies, patch-package, name, private, scripts, postinstall, test, typecheck (+4 more)

### Community 14 - "run_adapter"
Cohesion: 0.20
Nodes (20): LocalArchive, Path, Writes to engine/.archive. For development and tests; gitignored., run_adapter(), mid(), no_sleep(), test_a_full_run_publishes_all_four_routes_through_the_gate(), FakeAdapter (+12 more)

### Community 15 - "9. The scraping engine (core system)"
Cohesion: 0.14
Nodes (14): 9.10 Engine SLOs, 9.11 Schedule, 9.12 Scraper conduct, 9.13 Tech stack, 9.1 Design principles, 9.2 Architecture, 9.3 The adapter framework, 9.4 Multi-strategy extraction (+6 more)

### Community 16 - "AGENTS.md"
Cohesion: 0.33
Nodes (5): Building with EAS, Commands, Expo has changed — do not trust your training data, Navigation & Routing, Rules

### Community 19 - "dependencies"
Cohesion: 0.08
Nodes (26): expo, @expo-google-fonts/hind, expo-image, expo-image-manipulator, expo-router, expo-secure-store, expo-splash-screen, expo-symbols (+18 more)

### Community 20 - "14. Design system and brand consistency"
Cohesion: 0.17
Nodes (12): 14.10 Accessibility and low-bandwidth use, 14.11 Enforcement, 14.1 Where the app lives, 14.2 Naming, 14.3 Voice and writing rules, 14.4 Shared terminology, 14.5 Visual foundations, 14.6 Core components (+4 more)

### Community 21 - "learn-games.ts"
Cohesion: 0.09
Nodes (34): boardDone(), buildGame(), ChoiceQuestion, CHOICES, comparison(), costAnswer(), exampleTransfer, gameAccuracy() (+26 more)

### Community 22 - "bot/package.json"
Cohesion: 0.13
Nodes (14): devDependencies, typescript, vitest, typescript, vitest, main, name, private (+6 more)

### Community 23 - "src/agent.ts"
Cohesion: 0.17
Nodes (20): AgentContext, AgentResult, appPrompt(), humanize(), norm(), objectsIn(), readTurn(), runAgent() (+12 more)

### Community 24 - "lesson-screen.test.tsx"
Cohesion: 0.33
Nodes (3): GameMode, mockBack, mockParams

### Community 25 - "review-sheet.ts"
Cohesion: 0.14
Nodes (21): cell(), Code, doc, draft, DRAFTS, leaves(), lines, next (+13 more)

### Community 26 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck, strict (+3 more)

### Community 27 - "Google Play"
Cohesion: 0.11
Nodes (18): Advertising ID, Age rating, App access (Sign in details), App Privacy ("nutrition label"), App Store, Closed test (required before the first public release), Content rating (IARC questionnaire), Data safety (+10 more)

### Community 28 - "remmy.ts"
Cohesion: 0.12
Nodes (20): REMMY_SCREENS, boldParts(), emit(), executedActions, listeners, messages, newChat(), RemmyMessage (+12 more)

### Community 29 - "model.ts"
Cohesion: 0.06
Nodes (47): answerSchema(), askModel(), buildRequest(), ChatRequest, ChatResponse, DEFAULT_MODEL, DEFAULT_REASONING, GROQ_URL (+39 more)

### Community 30 - "lesson.ts"
Cohesion: 0.21
Nodes (16): moduleTerms(), accuracy(), buildLesson(), distractors(), firstSentence(), LessonAction, lessonDone(), lessonReducer() (+8 more)

### Community 31 - "devDependencies"
Cohesion: 0.04
Nodes (44): eslint, eslint-config-expo, jest, jest-expo, devDependencies, eslint, eslint-config-expo, jest (+36 more)

### Community 32 - "Quote"
Cohesion: 0.21
Nodes (13): _anomaly(), _is_promotional(), _math_ok(), _range_problems(), The publish gate (PRD 9.7). A quote reaches users only if it passes every…, Sets validation_status, validation_notes and is_promotional on each quote, in…, Index -> problem, for quotes whose markup jumps against their grid neighbour., run_gate() (+5 more)

### Community 33 - "bot/src/index.ts"
Cohesion: 0.13
Nodes (28): DeliveryMethod, countryIn(), EN_THE, formatAnswer(), formatCompare(), formatDailyLimit(), formatForgotten(), formatOffTopic() (+20 more)

### Community 34 - "models.py"
Cohesion: 0.07
Nodes (34): ABC, Adapter, AdapterMeta, The adapter framework (PRD 9.3). An adapter holds only what is specific to one…, A hash of the response's structure (keys and types, not values), for drift…, Which routes, delivery methods and payment methods this provider serves., Every quote to ask for this run: supported routes x methods x the amount grid., Ask for one quote with one strategy. Return the raw response untouched. (+26 more)

### Community 35 - "synth.ts"
Cohesion: 0.09
Nodes (30): addDays(), CITIES, Corridor, CORRIDORS, DELIVERY_WORDS, escapeHtml(), FINE_PRINT, FONTS (+22 more)

### Community 36 - "useTheme"
Cohesion: 0.06
Nodes (67): Step(), BlogPostScreen(), styles, BlogIndex(), styles, Welcome(), Stat(), Why() (+59 more)

### Community 37 - "remmy-actions.ts"
Cohesion: 0.16
Nodes (17): ALIAS_LIST, ALIASES, bare(), DeliveryMethod, fold(), isScreen(), matchIntent(), REMMY_MODES (+9 more)

### Community 38 - "receipt/package.json"
Cohesion: 0.08
Nodes (23): devDependencies, playwright-core, tesseract.js, @tesseract.js-data/eng, typescript, vitest, typescript, vitest (+15 more)

### Community 39 - "(tabs)/index.tsx"
Cohesion: 0.08
Nodes (42): PickRoute(), RequestRoute(), cleanAmount(), Compare(), CompareScreen(), styles, useQuotes(), LearnScreen() (+34 more)

### Community 40 - "newsletter.tsx"
Cohesion: 0.13
Nodes (17): NewsletterScreen(), styles, fetchSuggestions(), FILTERS, Status, styles, Suggestion, SuggestionsScreen() (+9 more)

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, paths, skipLibCheck (+12 more)

### Community 45 - "rate-history.tsx"
Cohesion: 0.18
Nodes (17): fmt(), PERIODS, RateHistoryScreen(), styles, parseDate(), daysAgo(), fetchMidRate(), fetchRateSeries() (+9 more)

### Community 46 - "whatsapp/index.ts"
Cohesion: 0.08
Nodes (54): formatLinked(), formatNotText(), formatRateLimited(), formatSaveNote(), plan(), DELIVERY_WORDS, DISCLOSURE_WORDS, formatReceiptAck() (+46 more)

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
Cohesion: 0.14
Nodes (24): build(), copyrightLine(), docLayout(), escape(), files(), legalEntity(), loadConfig(), out (+16 more)

### Community 53 - "webhook.test.ts"
Cohesion: 0.07
Nodes (29): env, handlers, issue, mail, people(), site, TOKEN(), env (+21 more)

### Community 54 - "Partner outreach: Seattle-area organizations"
Cohesion: 0.33
Nodes (5): Draft email, Log, Partner outreach: Seattle-area organizations, What to ask for, Who, and why

### Community 55 - "test_instarem.py"
Cohesion: 0.29
Nodes (16): InstaremAdapter, fixture(), _FourRoutes, parametrize, The Instarem adapter against real responses from its quote endpoint…, The adapter on the four routes the saved answers cover., raw(), req() (+8 more)

### Community 57 - "send-rate-alerts.mjs"
Cohesion: 0.17
Nodes (10): COUNTRY, gone, H, messages, money(), push, sent, sentWhatsApp (+2 more)

### Community 59 - "admin.tsx"
Cohesion: 0.19
Nodes (15): AddPriceScreen(), cleanNumber(), Field(), RecentRow(), STATUS_LABEL, styles, arithmeticCheck(), EntryStatus (+7 more)

### Community 60 - "Google Play: final look-through before shipping (2026-10-18)"
Cohesion: 0.33
Nodes (5): Decide, Google Play: final look-through before shipping (2026-10-18), Not part of this submission, Ready, for your look-through, Then, in order (each only on your word)

### Community 61 - "formula/src/index.ts"
Cohesion: 0.18
Nodes (15): atAmount(), costOf(), NewCheck, SaveCheckError, SavedCheck, computeTransferCost(), FUNDING_METHODS, MATH_TOLERANCE_ABS (+7 more)

### Community 62 - "To do"
Cohesion: 0.11
Nodes (18): Before submitting: found in the 2026-10-17 review (Angad decides, Claude builds), Claude, waiting on something, Content (Angad), Google Play, 2026-10-18 (drafts ready; nothing sent), Later, Legal, accounts and money (Angad), Newsletter (Angad, D169), Only what has data, and Learn on the account (D190, D191, 2026-10-18) (+10 more)

### Community 63 - "secure-session.test.ts"
Cohesion: 0.14
Nodes (6): secureSessionStorage, Key, mockKeychain, mockStorage, Sealed, SESSION

### Community 64 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, cleanUrls, headers, ignoreCommand, outputDirectory, rewrites

### Community 65 - "result.ts"
Cohesion: 0.19
Nodes (13): REMITTANCE_TAX_FROM, REMITTANCE_TAX_SMALL, advertisedGap(), bestOption, BestResult, matchingDay(), matchQuote(), PriceCandidate (+5 more)

### Community 66 - "make-icons.py"
Cohesion: 0.40
Nodes (3): mark(), Rebuild the app icons from the website mark: `python3 scripts/make-icons.py`…, Draw the mark so its 64-unit design fits `box` px (the favicon's own 64 grid),…

### Community 67 - "RawResponse"
Cohesion: 0.10
Nodes (17): The shape of what this adapter reads: the envelope and Wise's own quotes. The…, Archive, archive_key(), AsyncClient, Protocol, The raw archive (PRD 9.1 principle 4): every response, compressed and…, Uploads to the private `raw-archive` bucket in Supabase Storage., SupabaseArchive (+9 more)

### Community 68 - "lesson/[id].tsx"
Cohesion: 0.06
Nodes (53): GlossaryScreen(), styles, Lesson(), LessonScreen(), MatchBoard(), PriceCard(), Question(), rate() (+45 more)

### Community 69 - "api.ts"
Cohesion: 0.08
Nodes (32): FundingMethod, Comparison, ConfirmRequest, ForgetRequest, isBox(), isNum(), LIMITS, Parsed (+24 more)

### Community 70 - "make-onboarding-art.py"
Cohesion: 0.23
Nodes (9): band(), ground(), light(), mark(), Render the website's backdrop art for the app: `python3 scripts/make-…, A round pen along the path: no seams where segments meet., The outlined mark, white on transparent, at `scale` px per viewBox unit., The resting light: color at `alpha` in the middle, nothing at 60% of 38rem. (+1 more)

### Community 71 - "learn-progress.ts"
Cohesion: 0.13
Nodes (26): MODULES, AuthProvider(), adoptProgress(), dayBefore(), learned, LearnSnapshot, listeners, localDay() (+18 more)

### Community 72 - "scripts/benchmark.ts"
Cohesion: 0.06
Nodes (51): f(), field(), byItem, imageFor(), leaks, lost, md, modes (+43 more)

### Community 73 - "fee-included.test.ts"
Cohesion: 0.33
Nodes (8): roundingTolerance(), Amounts, feeIncluded(), INSIDE, totalPaidBy(), formulaInputs(), receiptCost(), validateReceipt()

### Community 74 - "cli.py"
Cohesion: 0.38
Nodes (9): _accept_drift(), _backends(), _fx(), _health(), main(), AsyncClient, rb-engine: the command the scheduled workflows run. rb-engine run [--adapter ID…, _run() (+1 more)

### Community 75 - "ui.tsx"
Cohesion: 0.09
Nodes (49): styles, styles, styles, styles, STATS, styles, SETUPS, styles (+41 more)

### Community 76 - "whatsapp-section.tsx"
Cohesion: 0.12
Nodes (25): WhatsAppSection(), BlogBlock, BlogPost, BLOG_IMAGES, linkTarget(), POSTS, relatedTo(), SERIES (+17 more)

### Community 80 - "runner.py"
Cohesion: 0.13
Nodes (24): _cross_check(), _er_api(), _frankfurter(), FxUnavailable, _pct(), AsyncClient, Exception, Mid-market reference rates from two free sources, cross-checked (PRD 9.7 check… (+16 more)

### Community 81 - "local_migrations.sh"
Cohesion: 0.67
Nodes (3): LC_ALL, run(), local_migrations.sh script

### Community 82 - "legal.ts"
Cohesion: 0.18
Nodes (11): Accepted, acceptedVersion(), acceptLegal(), LEGAL_DOCS, LEGAL_VERSION, LegalBlock, LegalDoc, LegalDocId (+3 more)

### Community 83 - "secure-session.ts"
Cohesion: 0.36
Nodes (8): base64Bytes(), encryptionKey(), fromBase64(), fromUtf8(), open(), seal(), toBase64(), utf8()

### Community 84 - "PoliteClient"
Cohesion: 0.15
Nodes (20): fetch_mid_market(), One entry per quote currency: a cross-checked rate, or the reason there isn't…, PoliteClient, AsyncClient, mock(), test_a_wise_rate_with_a_markup_is_not_a_reference(), test_agreeing_sources_give_a_named_reference_rate(), test_disagreeing_sources_hold_the_pair() (+12 more)

### Community 85 - "README.md"
Cohesion: 0.20
Nodes (5): Commits, Contributing, Sign off every commit (Developer Certificate of Origin), RemitBridge mobile app, Ownership

### Community 86 - "RemitBridge App"
Cohesion: 0.12
Nodes (17): Before launch, Done, Features to set up, Git, graphify, Keeping the docs current, Open items, Product rules that are also code rules (+9 more)

### Community 87 - "Decisions"
Cohesion: 0.11
Nodes (19): 2026-09-28: Angad's answers on partners, structure, and prices, 2026-09-28: during the first build slice, 2026-09-28: first round, after reading PRD v0.4, 2026-09-28: onboarding and the Compare controls, 2026-09-28: second round, 2026-09-28: third round, 2026-09-30: accessibility and languages, 2026-09-30: Phase 3 defaults (+11 more)

### Community 88 - "extra"
Cohesion: 0.50
Nodes (4): projectId, extra, eas, router

### Community 89 - "RemitBridge"
Cohesion: 0.29
Nodes (7): Docs, Launch routes, Layout, RemitBridge, Setup, Status, The operator's details and the site

### Community 90 - "Engine"
Cohesion: 0.33
Nodes (5): Adapters, Adding an adapter, Engine, How a run works, Manual quotes

### Community 91 - "test_gate.py"
Cohesion: 0.42
Nodes (11): gate(), make(), test_a_clean_quote_publishes(), test_captured_at_defaults_to_now(), test_huge_fee_is_held(), test_markup_over_15_percent_is_held(), test_provider_rounding_is_tolerated(), test_rate_well_above_mid_market_needs_a_promo_label() (+3 more)

### Community 92 - "metrics.tsx"
Cohesion: 0.16
Nodes (12): Breakdown(), Group(), MetricsScreen(), PERIODS, styles, TOOL_LABELS, csvCell(), DEFINITIONS (+4 more)

### Community 93 - "extract/fields.ts"
Cohesion: 0.12
Nodes (42): deliveryIn(), extractAmountReceived(), extractAmountSent(), extractDeliveryMethod(), extractExchangeRate(), extractFee(), extractFundingMethod(), ExtractionContext (+34 more)

### Community 95 - "app-tabs.tsx"
Cohesion: 0.12
Nodes (13): ORDER, styles, swipe, AppTabs(), BarProps, CleanTabBar(), styles, TABS (+5 more)

### Community 96 - "receipt-result.test.tsx"
Cohesion: 0.40
Nodes (4): confirmed(), expected, fields(), WU

### Community 98 - "Security and data protection"
Cohesion: 0.40
Nodes (4): Security and data protection, Still to do (people, not code), Threats and what stops them, What's sensitive

### Community 99 - "port-blog.mjs"
Cohesion: 0.17
Nodes (9): app, appCovers, assets, blogJs, { bodies }, coverFiles, images, out (+1 more)

### Community 102 - "Receipt reading benchmark"
Cohesion: 0.14
Nodes (12): Real receipts (`receipts/`), Receipt reading benchmark, Running it, Synthetic receipts (`synthetic/`), What this does not tell you, By field (accuracy), Disclosure check, Receipt reading benchmark (+4 more)

### Community 103 - "true-cost.tsx"
Cohesion: 0.09
Nodes (46): FairRateScreen(), knownCurrency(), styles, styles, QuoteDetail(), rate(), styles, Results() (+38 more)

### Community 104 - "Publication audit, 2026-10-14"
Cohesion: 0.25
Nodes (8): Changes, Dependency security gate, Primary references checked, Publication audit, 2026-10-14, Still required, Subsequent Android feedback, 2026-10-14, Subsequent production builds, 2026-10-16, Verified locally

### Community 107 - "i18n/index.tsx"
Cohesion: 0.05
Nodes (63): BoardRow(), LaunchEmails(), RouteBoard(), STAGES, styles, Flag(), FLAG_SLOT, FLAGS (+55 more)

### Community 110 - "scan.tsx"
Cohesion: 0.05
Nodes (74): RedactedPhoto(), ScanScreen(), Step, styles, ArrivalArt, Art, BankArt, BasicsArt (+66 more)

### Community 111 - "Hindi review sheet"
Cohesion: 0.17
Nodes (11): App Review sign-in, 2026-10-17 (D184), For the reviewer, Hindi review sheet, Learn game modes (2026-10-12), Licenses row and a qualified claim, 2026-10-17 (legal checklist), Onboarding questions step, 2026-10-17 (D186), Publication disclosure and reporting additions, 2026-10-14, Remmy (2026-10-13) (+3 more)

### Community 113 - "RemitBridge 2.0: what comes after launch"
Cohesion: 0.14
Nodes (13): 1. Your money, over a year: a personal remittance record, 2. A rights checker: "was this transfer done right?", 3. Scam shield on WhatsApp, 4. Community prices: receipts that help everyone, 5. Reaching people without smartphones or data, 6. Smarter alerts that state facts, not forecasts, 7. Tools for the organizations that serve senders, 8. Open data and a public price index (+5 more)

### Community 114 - "Future updates"
Cohesion: 0.25
Nodes (7): Future updates, Learn, RemitBridge 2.0 (Angad, 2026-10-18), Routes, Sending countries, Stores and languages, Ways of receiving

### Community 115 - "supabase.ts"
Cohesion: 0.23
Nodes (8): SavedComparison, SaveResult, fetchObservatory(), Observatory, ObservatoryGroup, supabase, DATA, fetchMock

### Community 116 - "parse.ts"
Cohesion: 0.10
Nodes (26): Country, RECEIVING, SENDING, ALIASES, CHECK, CURRENCY_TO_COUNTRY, ENGLISH, findAmount() (+18 more)

### Community 117 - "account.tsx"
Cohesion: 0.07
Nodes (57): AccountScreen(), NameField(), NewsletterSwitch(), styles, AlertScreen(), Navigator(), useAlertTaps(), useSessionEvents() (+49 more)

### Community 120 - "rate-alerts.ts"
Cohesion: 0.19
Nodes (11): AlertChannel, createAlert(), CreateResult, pushToken(), RateAlert, startingTarget(), targetStep(), TokenResult (+3 more)

### Community 121 - "collection.py"
Cohesion: 0.18
Nodes (19): datetime, Pair a reviewed weekly-rate CSV with the monthly fees already on file (D193);…, Prepare a reviewed CSV for the manual adapter; never writes to Supabase., combine_weekly_rates(), _fee_key(), prepare_collection(), Validate reviewed collection CSV rows before feeding the ordinary manual…, Pair this week's verified rates with the newest monthly fee for the same quote… (+11 more)

### Community 123 - "1. Why this exists"
Cohesion: 0.67
Nodes (3): 1. Why this exists, The end goal, in one sentence, What "success" looks like in 12 months

### Community 126 - "Security review (for Angad)"
Cohesion: 0.12
Nodes (13): 1. Changes already live (please review), 2. Changes waiting on your `supabase db push` (please review, then push), 3. Changes in the app (ship with the next build; please review), 4. Things only you can do, 4b. WhatsApp numbers (your yes, 2026-10-02), 4c. Limits on AI spending (your ask, 2026-10-02; D140), 5. Checked and fine (nothing to do, for your information), Security review (for Angad) (+5 more)

### Community 127 - "routes.ts"
Cohesion: 0.09
Nodes (27): Availability, FALLBACK, fromRows(), listeners, load(), methodsFor(), refresh(), ALL_DELIVERY_METHODS (+19 more)

### Community 130 - "ai.ts"
Cohesion: 0.06
Nodes (40): all, Labelled, messages, misses, out, report, samples, AiClient (+32 more)

### Community 131 - "synthesize.ts"
Cohesion: 0.13
Nodes (15): LANG, require, count, first, IMAGES, LANG, OUT, require (+7 more)

### Community 132 - "sign-in.ts"
Cohesion: 0.29
Nodes (11): friendly(), isReviewEmail(), providerEnabled(), Result, REVIEW_EMAIL, signInForReview(), signInWithApple(), signInWithGoogle() (+3 more)

### Community 133 - "RemitBridge Labs: setting up the nonprofit"
Cohesion: 0.25
Nodes (7): 1. EIN (federal tax ID): put off (Angad, 2026-10-10), 2. Organize the board: this month, 3. Bank account: NOT DOING (D150), 4. Federal tax exemption (501(c)(3)): NOT DOING (D150), 5. Every year, 6. After the EIN, things that open up, RemitBridge Labs: setting up the nonprofit

### Community 136 - "What exists"
Cohesion: 0.67
Nodes (3): How to run things, Local toolchain (checked 2026-09-29), What exists

### Community 139 - "blockedPermissions"
Cohesion: 0.20
Nodes (10): blockedPermissions, android.permission.READ_EXTERNAL_STORAGE, android.permission.READ_MEDIA_AUDIO, android.permission.READ_MEDIA_IMAGES, android.permission.READ_MEDIA_VIDEO, android.permission.READ_MEDIA_VISUAL_USER_SELECTED, android.permission.RECORD_AUDIO, android.permission.SYSTEM_ALERT_WINDOW (+2 more)

### Community 141 - "ios"
Cohesion: 0.22
Nodes (9): usesNonExemptEncryption, ios, associatedDomains, bundleIdentifier, config, icon, supportsTablet, usesAppleSignIn (+1 more)

### Community 142 - "android"
Cohesion: 0.17
Nodes (12): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, allowBackup, intentFilters, package (+4 more)

### Community 151 - "Providers for manual research"
Cohesion: 0.40
Nodes (5): Checked 2026-10-01, nothing to automate, Neither forbidden nor automated, Not yet checked, Providers for manual research, Public datasets

### Community 152 - "plugins"
Cohesion: 0.50
Nodes (4): plugins, expo-apple-authentication, expo-localization, expo-sqlite

### Community 154 - "Scope: an AI model in the WhatsApp bot"
Cohesion: 0.18
Nodes (10): Feature suggestions, How we'd know it works, Questions for Angad, Rules it has to keep, Scope: an AI model in the WhatsApp bot, What changes, What it can link to, What the bot does today (+2 more)

### Community 155 - "send-newsletter/index.ts"
Cohesion: 0.09
Nodes (23): RFC-8058, cors, cors, NAMES, cors, service(), service(), buildEmail() (+15 more)

### Community 158 - "licenses-page.mjs"
Cohesion: 0.15
Nodes (12): byLicense, copyrightLines(), head, licenseFile(), licenseOf(), ofl, order, packages (+4 more)

### Community 159 - "quotes.ts"
Cohesion: 0.26
Nodes (12): fetchQuote(), fetchQuotes(), fromCache(), HistoryPoint, LatestQuote, nearest(), numeric(), QuotesResult (+4 more)

### Community 162 - "apple.ts"
Cohesion: 0.31
Nodes (7): cors, appleConfig, b64url(), clientSecret(), revokeApple(), RevokeResult, text()

### Community 175 - "Publication readiness: App Store and Google Play"
Cohesion: 0.29
Nodes (7): Build and release evidence, Deploy and verify before building, Device acceptance checks, Organization and console gates: Angad/account holder, Prepared in source, Publication readiness: App Store and Google Play, Verification from this audit

### Community 179 - "Security audit, 2026-10-17"
Cohesion: 0.33
Nodes (5): Fixed today, Left, Result, Security audit, 2026-10-17, What was checked

## Knowledge Gaps
- **957 isolated node(s):** `2026-10-28: App Store submission started`, `2026-10-24: Google Play badge on the site`, `2026-10-24: second weekly round (D193)`, `2026-10-18: weekly rates with monthly fees (D193)`, `2026-10-18: repo cleanup` (+952 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **46 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useTheme()` connect `useTheme` to `lesson/[id].tsx`, `receipt-confirm.tsx`, `true-cost.tsx`, `newsletter.tsx`, `(tabs)/index.tsx`, `ui.tsx`, `i18n/index.tsx`, `scan.tsx`, `account.tsx`, `admin.tsx`, `metrics.tsx`, `app-tabs.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `expo-router` connect `lesson/[id].tsx` to `useTheme`, `true-cost.tsx`, `(tabs)/index.tsx`, `ui.tsx`, `i18n/index.tsx`, `whatsapp-section.tsx`, `legal.ts`, `account.tsx`, `plugins`, `onboarding/_layout.tsx`, `admin.tsx`, `remmy.ts`, `app-tabs.tsx`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `DeliveryMethod` connect `bot/src/index.ts` to `quotes.ts`, `ai.ts`, `synth.ts`, `useTheme`, `types.ts`, `api.ts`, `(tabs)/index.tsx`, `ui.tsx`, `i18n/index.tsx`, `supabase.ts`, `parse.ts`, `account.tsx`, `rate-alerts.ts`, `admin.tsx`, `remmy.ts`, `extract/fields.ts`, `routes.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `2026-10-28: App Store submission started`, `2026-10-24: Google Play badge on the site`, `2026-10-24: second weekly round (D193)` to the rest of the system?**
  _957 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Handoff` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08766233766233766 - nodes in this community are weakly interconnected._
- **Should `LocalStore` be split into smaller, more focused modules?**
  _Cohesion score 0.07716701902748414 - nodes in this community are weakly interconnected._