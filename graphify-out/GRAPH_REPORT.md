# Graph Report - RemitBridge-App  (2026-10-13)

## Corpus Check
- 445 files · ~1,100,940 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2771 nodes · 7456 edges · 173 communities (132 shown, 41 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 123 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `82ad5117`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Handoff
- Permission request: pricing data
- types.ts
- LocalStore
- metrics.tsx
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
- lesson/[id].tsx
- bot/package.json
- useCopy
- admin.tsx
- review-sheet.ts
- compilerOptions
- Google Play
- illustrations.tsx
- model.ts
- track
- devDependencies
- Quote
- lesson.ts
- models.py
- synth.ts
- formula/src/index.ts
- ui.tsx
- receipt/package.json
- expo-router
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
- useTheme
- send-rate-alerts.mjs
- extract.py
- 1. Why this exists
- whatsapp/index.ts
- scan.tsx
- To do
- expo-device
- vercel.json
- app/_layout.tsx
- make-icons.py
- RawResponse
- FieldValues
- The four Tier 1 routes, Q1 2025
- make-onboarding-art.py
- i18n/index.tsx
- scripts/benchmark.ts
- Providers for manual research
- @expo-google-fonts/plus-jakarta-sans
- newsletter.ts
- languages.ts
- expo-font
- remmy.ts
- runner.py
- local_migrations.sh
- expo-sqlite
- AI usage log
- PoliteClient
- README.md
- RemitBridge App
- Decisions
- account.tsx
- RemitBridge
- Engine
- test_gate.py
- expo-localization
- extract/fields.ts
- eval-ai.ts
- Congressional App Challenge 2026: draft entry
- @infinitered/react-native-mlkit-core
- src/agent.ts
- CAC gap report: the receipt scanner and what goes with it
- port-blog.mjs
- website-legal-entity.md
- react-native-safe-area-context
- Receipt reading benchmark
- app/remmy.tsx
- Launch checklist: App Store and Google Play
- @shopify/react-native-skia
- expo-file-system
- expo-status-bar
- expo-glass-effect
- expo-image-manipulator
- Hindi review sheet
- expo-linking
- RemitBridge 2.0: what comes after launch
- @expo-google-fonts/hind
- react-native-reanimated
- parse.ts
- synthesize.ts
- ai.ts
- expo-splash-screen
- observatory.ts
- rate-alerts.ts
- whatsapp-section.tsx
- expo-router
- Security review (for Angad)
- @expo/ui
- expo-crypto
- react-native-screens
- scam-check.tsx
- Security and data protection
- experiments
- RemitBridge Labs: setting up the nonprofit
- @infinitered/react-native-mlkit-text-recognition
- react-native-web
- expo-dev-client
- WhatsApp message templates
- react
- blockedPermissions
- CREDITS.md
- ios
- android
- module/[id].tsx
- secure-session.ts
- react-dom
- learn-progress.ts
- alert.tsx
- api.ts
- extra
- expo-constants
- plugins
- pager-tabs.tsx
- Scope: an AI model in the WhatsApp bot
- send-newsletter/index.ts
- email.ts
- expo-image-picker
- expo-system-ui
- cli.py
- chatgpt-essay-prompt.md
- apple.ts
- react-native-pager-view
- adaptiveIcon
- sign-in.ts
- chatgpt-learn-games.md
- @remitbridge/receipt
- quotes.ts
- chatgpt-research-task.md
- chatgpt-price-checks.md
- computeTransferCost

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 201 edges
2. `useCopy()` - 138 edges
3. `track()` - 66 edges
4. `AppText()` - 62 edges
5. `Spacing` - 55 edges
6. `money()` - 53 edges
7. `expo-router` - 52 edges
8. `useLanguage()` - 49 edges
9. `Fonts` - 46 edges
10. `FieldName` - 39 edges

## Surprising Connections (you probably didn't know these)
- `normalize()` --calls--> `compute_transfer_cost()`  [INFERRED]
  engine/src/remitbridge_engine/normalize.py → packages/formula/python/remitbridge_formula/__init__.py
- `Inline()` --indirect_call--> `TOKEN()`  [INFERRED]
  mobile/src/components/blog.tsx → packages/bot/src/newsletter.test.ts
- `buildGame()` --indirect_call--> `field()`  [INFERRED]
  mobile/src/lib/learn-games.ts → packages/bot/src/webhook.test.ts
- `Pending` --references--> `FieldName`  [EXTRACTED]
  supabase/functions/whatsapp/index.ts → packages/receipt/src/types.ts
- `ScanScreen()` --calls--> `detectPii()`  [EXTRACTED]
  mobile/src/app/(tabs)/scan.tsx → packages/receipt/src/redact.ts

## Import Cycles
- None detected.

## Communities (173 total, 41 thin omitted)

### Community 0 - "Handoff"
Cohesion: 0.10
Nodes (20): 2026-09-30 evening (local session, the go-live list), 2026-10-01 (cloud session), 2026-10-10: where things stand, 2026-10-11: Android feedback, 2026-10-12: Android sign-ins fixed, WhatsApp linking confirmed, the newsletter (D169), 2026-10-12: legal audit (D164), 2026-10-12: screenshots, Mexico's prices, the code email, WhatsApp replies, store prep, 2026-10-12: the WhatsApp agent's fallbacks (D163) (+12 more)

### Community 1 - "Permission request: pricing data"
Cohesion: 0.29
Nodes (6): 2026-10-12: inbox check, From 2026-10-08: signing as an incorporated nonprofit, Permission request: pricing data, Round 2: shorter ask to more providers (2026-10-04), What was sent, Where to send

### Community 2 - "types.ts"
Cohesion: 0.11
Nodes (37): read(), Extractor, Extractors, LabelHit, fieldsForModel(), mergeFields(), ModelResult, Reasoning (+29 more)

### Community 3 - "LocalStore"
Cohesion: 0.08
Nodes (11): Any, LocalStore, mid_market_rows(), AsyncClient, datetime, Path, Protocol, quote_row() (+3 more)

### Community 4 - "metrics.tsx"
Cohesion: 0.16
Nodes (12): Breakdown(), Group(), MetricsScreen(), PERIODS, styles, TOOL_LABELS, csvCell(), DEFINITIONS (+4 more)

### Community 5 - "scan-receipt/index.ts"
Cohesion: 0.11
Nodes (30): trustedToday(), Checked, checkValue(), deserializeValue(), FIELD_SPECS, FieldKind, FieldSpec, isRealDate() (+22 more)

### Community 6 - "expo"
Cohesion: 0.20
Nodes (9): expo, icon, name, orientation, owner, scheme, slug, userInterfaceStyle (+1 more)

### Community 7 - "ocr.ts"
Cohesion: 0.09
Nodes (43): pages, clean(), count, misses, offenders, score(), showsWord(), checkDisclosures() (+35 more)

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
Cohesion: 0.14
Nodes (18): @remitbridge/formula, compute_transfer_cost(), The one total-cost formula (the TrueCost method, PRD 14.4). Python twin of…, The 1% federal remittance tax, rounded half up to the cent. The base is the…, S sent, F fee and T transfer tax (sending currency), Q quoted and M mid-market…, Twelve identical transfers. No compounding, no assumption about future rates., remittance_tax(), TransferCost (+10 more)

### Community 12 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck (+8 more)

### Community 13 - "package.json"
Cohesion: 0.15
Nodes (12): devDependencies, patch-package, name, private, scripts, postinstall, test, typecheck (+4 more)

### Community 14 - "run_adapter"
Cohesion: 0.26
Nodes (16): LocalArchive, Path, Writes to engine/.archive. For development and tests; gitignored., run_adapter(), FakeAdapter, The smallest honest adapter: one JSON endpoint, one route, one method., respond(), setup() (+8 more)

### Community 15 - "9. The scraping engine (core system)"
Cohesion: 0.14
Nodes (14): 9.10 Engine SLOs, 9.11 Schedule, 9.12 Scraper conduct, 9.13 Tech stack, 9.1 Design principles, 9.2 Architecture, 9.3 The adapter framework, 9.4 Multi-strategy extraction (+6 more)

### Community 16 - "AGENTS.md"
Cohesion: 0.33
Nodes (5): Building with EAS, Commands, Expo has changed — do not trust your training data, Navigation & Routing, Rules

### Community 19 - "dependencies"
Cohesion: 0.07
Nodes (27): expo, expo-apple-authentication, expo-haptics, expo-image, expo-notifications, expo-secure-store, expo-symbols, expo-web-browser (+19 more)

### Community 20 - "14. Design system and brand consistency"
Cohesion: 0.17
Nodes (12): 14.10 Accessibility and low-bandwidth use, 14.11 Enforcement, 14.1 Where the app lives, 14.2 Naming, 14.3 Voice and writing rules, 14.4 Shared terminology, 14.5 Visual foundations, 14.6 Core components (+4 more)

### Community 21 - "lesson/[id].tsx"
Cohesion: 0.08
Nodes (44): Lesson(), MatchBoard(), PriceCard(), Question(), rate(), receiptValue(), resultFor(), SAFETY_ICONS (+36 more)

### Community 22 - "bot/package.json"
Cohesion: 0.13
Nodes (14): devDependencies, typescript, vitest, typescript, vitest, main, name, private (+6 more)

### Community 23 - "useCopy"
Cohesion: 0.08
Nodes (41): styles, Welcome(), styles, Stat(), STATS, styles, Why(), brandStyles (+33 more)

### Community 24 - "admin.tsx"
Cohesion: 0.19
Nodes (15): AddPriceScreen(), cleanNumber(), Field(), RecentRow(), STATUS_LABEL, styles, arithmeticCheck(), EntryStatus (+7 more)

### Community 25 - "review-sheet.ts"
Cohesion: 0.12
Nodes (23): cell(), Code, doc, draft, DRAFTS, leaves(), lines, next (+15 more)

### Community 26 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck, strict (+3 more)

### Community 27 - "Google Play"
Cohesion: 0.11
Nodes (17): Advertising ID, Age rating, App access, App Privacy ("nutrition label"), App Store, Closed test (required before the first public release), Content rating (IARC questionnaire), Data safety (+9 more)

### Community 28 - "illustrations.tsx"
Cohesion: 0.11
Nodes (38): ORDER, styles, swipe, styles, ArrivalArt, Art, BankArt, BasicsArt (+30 more)

### Community 29 - "model.ts"
Cohesion: 0.06
Nodes (46): answerSchema(), askModel(), buildRequest(), ChatRequest, ChatResponse, DEFAULT_MODEL, DEFAULT_REASONING, GROQ_URL (+38 more)

### Community 30 - "track"
Cohesion: 0.07
Nodes (71): FairRateScreen(), knownCurrency(), styles, ObservatoryScreen(), styles, PartnerLink(), fmt(), PERIODS (+63 more)

### Community 31 - "devDependencies"
Cohesion: 0.04
Nodes (44): eslint, eslint-config-expo, jest, jest-expo, devDependencies, eslint, eslint-config-expo, jest (+36 more)

### Community 32 - "Quote"
Cohesion: 0.21
Nodes (13): _anomaly(), _is_promotional(), _math_ok(), _range_problems(), The publish gate (PRD 9.7). A quote reaches users only if it passes every…, Sets validation_status, validation_notes and is_promotional on each quote, in…, Index -> problem, for quotes whose markup jumps against their grid neighbour., run_gate() (+5 more)

### Community 33 - "lesson.ts"
Cohesion: 0.21
Nodes (16): moduleTerms(), accuracy(), buildLesson(), distractors(), firstSentence(), LessonAction, lessonDone(), lessonReducer() (+8 more)

### Community 34 - "models.py"
Cohesion: 0.07
Nodes (34): ABC, Adapter, AdapterMeta, The adapter framework (PRD 9.3). An adapter holds only what is specific to one…, A hash of the response's structure (keys and types, not values), for drift…, Which routes, delivery methods and payment methods this provider serves., Every quote to ask for this run: supported routes x methods x the amount grid., Ask for one quote with one strategy. Return the raw response untouched. (+26 more)

### Community 35 - "synth.ts"
Cohesion: 0.08
Nodes (31): addDays(), CITIES, Corridor, CORRIDORS, DELIVERY_WORDS, escapeHtml(), FINE_PRINT, FONTS (+23 more)

### Community 36 - "formula/src/index.ts"
Cohesion: 0.19
Nodes (12): costOf(), NewCheck, SaveCheckError, SavedCheck, FUNDING_METHODS, FundingMethod, MATH_TOLERANCE_ABS, MATH_TOLERANCE_REL (+4 more)

### Community 37 - "ui.tsx"
Cohesion: 0.06
Nodes (68): BlogPostScreen(), styles, BlogIndex(), styles, GlossaryScreen(), styles, styles, fetchSuggestions() (+60 more)

### Community 38 - "receipt/package.json"
Cohesion: 0.08
Nodes (23): devDependencies, playwright-core, tesseract.js, @tesseract.js-data/eng, typescript, vitest, typescript, vitest (+15 more)

### Community 39 - "expo-router"
Cohesion: 0.08
Nodes (37): RequestRoute(), styles, BoardRow(), LaunchEmails(), RouteBoard(), STAGES, styles, SavedScreen() (+29 more)

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, paths, skipLibCheck (+11 more)

### Community 45 - "bot/src/index.ts"
Cohesion: 0.12
Nodes (35): AMOUNTS, checkedAmountFor(), DELIVERY_LABELS, Route, ROUTES, AgentContext, ago(), countryIn() (+27 more)

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
Cohesion: 0.20
Nodes (15): build(), copyrightLine(), docLayout(), escape(), files(), legalEntity(), loadConfig(), out (+7 more)

### Community 53 - "webhook.test.ts"
Cohesion: 0.05
Nodes (42): BlogBlock, BlogPost, BLOG_IMAGES, linkTarget(), POSTS, relatedTo(), SERIES, SeriesId (+34 more)

### Community 54 - "Partner outreach: Seattle-area organizations"
Cohesion: 0.33
Nodes (5): Draft email, Log, Partner outreach: Seattle-area organizations, What to ask for, Who, and why

### Community 55 - "test_instarem.py"
Cohesion: 0.27
Nodes (17): InstaremAdapter, fixture(), _FourRoutes, parametrize, The Instarem adapter against real responses from its quote endpoint…, The adapter on the four routes the saved answers cover., raw(), req() (+9 more)

### Community 56 - "useTheme"
Cohesion: 0.10
Nodes (34): QuoteDetail(), rate(), styles, AppTabs(), BarProps, CleanTabBar(), IosTabs(), styles (+26 more)

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
Cohesion: 0.08
Nodes (53): formatDailyLimit(), formatForgotten(), formatNotText(), formatPhotoLimit(), formatRateLimited(), formatRequested(), LINK, DELIVERY_WORDS (+45 more)

### Community 61 - "scan.tsx"
Cohesion: 0.07
Nodes (50): RedactedPhoto(), ScanScreen(), Step, styles, Answers, canScan(), discardPhotoFiles(), measureSharpness() (+42 more)

### Community 62 - "To do"
Cohesion: 0.15
Nodes (12): Claude, waiting on something, Content (Angad), Later, Legal, accounts and money (Angad), Newsletter (Angad, D169), Outreach, Receipt scanner (Angad, D173), Remmy (Angad, D175) (+4 more)

### Community 64 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, cleanUrls, headers, ignoreCommand, outputDirectory, rewrites

### Community 65 - "app/_layout.tsx"
Cohesion: 0.20
Nodes (10): Navigator(), useAlertTaps(), useSessionEvents(), AccessibilityProvider(), BoldText, stackOptions(), useIsAdmin(), AuthContext (+2 more)

### Community 66 - "make-icons.py"
Cohesion: 0.40
Nodes (3): mark(), Rebuild the app icons from the website mark: `python3 scripts/make-icons.py`…, Draw the mark so its 64-unit design fits `box` px (the favicon's own 64 grid),…

### Community 67 - "RawResponse"
Cohesion: 0.10
Nodes (17): The shape of what this adapter reads: the envelope and Wise's own quotes. The…, Archive, archive_key(), AsyncClient, Protocol, The raw archive (PRD 9.1 principle 4): every response, compressed and…, Uploads to the private `raw-archive` bucket in Supabase Storage., SupabaseArchive (+9 more)

### Community 68 - "FieldValues"
Cohesion: 0.29
Nodes (6): confirmed(), expected, fields(), WU, Fixture, FieldValues

### Community 69 - "The four Tier 1 routes, Q1 2025"
Cohesion: 0.25
Nodes (7): India (47 services surveyed), Median total cost of a $200 transfer, by year, Mexico (46 services surveyed), Philippines (57 services surveyed), The four Tier 1 routes, Q1 2025, Vietnam (31 services surveyed), World Bank remittance prices: sending from the US

### Community 70 - "make-onboarding-art.py"
Cohesion: 0.23
Nodes (9): band(), ground(), light(), mark(), Render the website's backdrop art for the app: `python3 scripts/make-…, A round pen along the path: no seams where segments meet., The outlined mark, white on transparent, at `scale` px per viewBox unit., The resting light: color at `alpha` in the middle, nothing at 60% of 38rem. (+1 more)

### Community 71 - "i18n/index.tsx"
Cohesion: 0.08
Nodes (32): PickRoute(), AlertLink(), cleanAmount(), Compare(), CompareScreen(), FundingPicker(), Notice(), styles (+24 more)

### Community 72 - "scripts/benchmark.ts"
Cohesion: 0.06
Nodes (50): f(), field(), byItem, imageFor(), leaks, lost, md, modes (+42 more)

### Community 73 - "Providers for manual research"
Cohesion: 0.40
Nodes (5): Checked 2026-10-01, nothing to automate, Neither forbidden nor automated, Not yet checked, Providers for manual research, Public datasets

### Community 75 - "newsletter.ts"
Cohesion: 0.24
Nodes (10): NewsletterScreen(), newsletterStatus(), sendIssue(), SendResult, SentIssue, sentIssues(), setNewsletter(), subscriberCount() (+2 more)

### Community 76 - "languages.ts"
Cohesion: 0.24
Nodes (10): AccountScreen(), LanguageProvider(), LanguageState, startingLanguage(), isReviewed(), Language, LanguageCode, LANGUAGES (+2 more)

### Community 79 - "remmy.ts"
Cohesion: 0.07
Nodes (37): saveComparison(), SavedComparison, SaveResult, DeliveryMethod, isScreen(), REMMY_MODES, REMMY_MODULES, REMMY_SCREENS (+29 more)

### Community 80 - "runner.py"
Cohesion: 0.13
Nodes (24): _cross_check(), _er_api(), _frankfurter(), FxUnavailable, _pct(), AsyncClient, Exception, Mid-market reference rates from two free sources, cross-checked (PRD 9.7 check… (+16 more)

### Community 81 - "local_migrations.sh"
Cohesion: 0.67
Nodes (3): LC_ALL, run(), local_migrations.sh script

### Community 83 - "AI usage log"
Cohesion: 0.08
Nodes (24): 2026-09-30: merging `main` (the other session's languages and accessibility work), 2026-09-30: Phase 1, the gap report, 2026-09-30: Phase 2, data model, redaction, parser harness, model fallback, validation, 2026-09-30: Phase 3, confirmation screen, result screen, funding method, 2026-09-30: Phase 4, the accuracy benchmark and synthetic receipts, 2026-09-30: Phase 5, receipt photos on WhatsApp, 2026-09-30: Phase 6, the disclosure check and the receipt observatory, 2026-09-30: switching the model fallback to Groq's free tier (+16 more)

### Community 84 - "PoliteClient"
Cohesion: 0.15
Nodes (20): fetch_mid_market(), One entry per quote currency: a cross-checked rate, or the reason there isn't…, PoliteClient, AsyncClient, mock(), test_a_wise_rate_with_a_markup_is_not_a_reference(), test_agreeing_sources_give_a_named_reference_rate(), test_disagreeing_sources_hold_the_pair() (+12 more)

### Community 85 - "README.md"
Cohesion: 0.18
Nodes (5): Commits, Contributing, Sign off every commit (Developer Certificate of Origin), RemitBridge mobile app, Ownership

### Community 86 - "RemitBridge App"
Cohesion: 0.12
Nodes (17): Before launch, CAC submission (internal deadline Oct 23, official Oct 26), Done, Features to set up, Git, graphify, Keeping the docs current, Open items (+9 more)

### Community 87 - "Decisions"
Cohesion: 0.11
Nodes (19): 2026-09-28: Angad's answers on partners, structure, and prices, 2026-09-28: during the first build slice, 2026-09-28: first round, after reading PRD v0.4, 2026-09-28: onboarding and the Compare controls, 2026-09-28: second round, 2026-09-28: third round, 2026-09-30: accessibility and languages, 2026-09-30: Phase 3 defaults (+11 more)

### Community 88 - "account.tsx"
Cohesion: 0.15
Nodes (20): NameField(), styles, AccountButton(), HeroBackdrop(), HeroHeader(), StatusBarShield(), styles, CONTACT_EMAIL (+12 more)

### Community 89 - "RemitBridge"
Cohesion: 0.29
Nodes (7): Docs, Launch routes, Layout, RemitBridge, Setup, Status, The operator's details and the site

### Community 90 - "Engine"
Cohesion: 0.33
Nodes (5): Adapters, Adding an adapter, Engine, How a run works, Manual quotes

### Community 91 - "test_gate.py"
Cohesion: 0.28
Nodes (14): mid(), no_sleep(), gate(), make(), test_a_clean_quote_publishes(), test_captured_at_defaults_to_now(), test_huge_fee_is_held(), test_markup_over_15_percent_is_held() (+6 more)

### Community 93 - "extract/fields.ts"
Cohesion: 0.11
Nodes (45): deliveryIn(), extractAmountReceived(), extractAmountSent(), extractDeliveryMethod(), extractExchangeRate(), extractFee(), extractFundingMethod(), ExtractionContext (+37 more)

### Community 94 - "eval-ai.ts"
Cohesion: 0.15
Nodes (8): all, Labelled, messages, misses, out, report, samples, Understood

### Community 95 - "Congressional App Challenge 2026: draft entry"
Cohesion: 0.17
Nodes (11): App name, Congressional App Challenge 2026: draft entry, Demo video script (about 2 minutes 45 seconds), How does it work?, One-line description, Technologies, Use of AI tools (disclose this), What did you learn? / What would you do next? (+3 more)

### Community 97 - "src/agent.ts"
Cohesion: 0.20
Nodes (16): AgentResult, appPrompt(), humanize(), norm(), readTurn(), runAgent(), strayLinks(), strayNumbers() (+8 more)

### Community 98 - "CAC gap report: the receipt scanner and what goes with it"
Cohesion: 0.33
Nodes (5): CAC gap report: the receipt scanner and what goes with it, Decisions I need before Phase 2, Item by item, Rough fit against Oct 23, What the new work sits on

### Community 99 - "port-blog.mjs"
Cohesion: 0.17
Nodes (9): app, appCovers, assets, blogJs, { bodies }, coverFiles, images, out (+1 more)

### Community 102 - "Receipt reading benchmark"
Cohesion: 0.14
Nodes (12): Real receipts (`receipts/`), Receipt reading benchmark, Running it, Synthetic receipts (`synthetic/`), What this does not tell you, By field (accuracy), Disclosure check, Receipt reading benchmark (+4 more)

### Community 103 - "app/remmy.tsx"
Cohesion: 0.09
Nodes (28): NewsletterSwitch(), ActionCard(), Dot(), HeaderButton(), RemmyBubble(), RemmyChat(), SCREEN_ICON, screenTitle() (+20 more)

### Community 104 - "Launch checklist: App Store and Google Play"
Cohesion: 0.18
Nodes (10): Android (Google Play), Blocking, Blocking, iPhone (App Store), Launch checklist: App Store and Google Play, Not needed for launch, Should do first, Should do first (+2 more)

### Community 111 - "Hindi review sheet"
Cohesion: 0.40
Nodes (4): For the reviewer, Hindi review sheet, Learn game modes (2026-10-12), Remmy (2026-10-13)

### Community 113 - "RemitBridge 2.0: what comes after launch"
Cohesion: 0.14
Nodes (13): 1. Your money, over a year: a personal remittance record, 2. A rights checker: "was this transfer done right?", 3. Scam shield on WhatsApp, 4. Community prices: receipts that help everyone, 5. Reaching people without smartphones or data, 6. Smarter alerts that state facts, not forecasts, 7. Tools for the organizations that serve senders, 8. Open data and a public price index (+5 more)

### Community 116 - "parse.ts"
Cohesion: 0.10
Nodes (25): ALIASES, CHECK, CURRENCY_TO_COUNTRY, ENGLISH, findAmount(), findMethod(), FORGET, HELP (+17 more)

### Community 117 - "synthesize.ts"
Cohesion: 0.20
Nodes (8): count, first, IMAGES, LANG, OUT, require, ROOT, { values: args }

### Community 119 - "ai.ts"
Cohesion: 0.09
Nodes (36): RECEIVING, routeFor(), answer, ANSWER_PROMPT(), chainClient(), checkAnswer(), cloudflareClient(), COUNTRIES (+28 more)

### Community 121 - "observatory.ts"
Cohesion: 0.38
Nodes (5): fetchObservatory(), Observatory, ObservatoryGroup, DATA, fetchMock

### Community 123 - "rate-alerts.ts"
Cohesion: 0.22
Nodes (9): AlertChannel, createAlert(), CreateResult, pushToken(), RateAlert, TokenResult, ALERT, mockInsert (+1 more)

### Community 124 - "whatsapp-section.tsx"
Cohesion: 0.44
Nodes (9): WhatsAppSection(), formatNumber(), linkStatus, newLinkCode(), openChat(), signedInCall(), unlinkWhatsApp(), whatsAppSettings (+1 more)

### Community 126 - "Security review (for Angad)"
Cohesion: 0.22
Nodes (8): 1. Changes already live (please review), 2. Changes waiting on your `supabase db push` (please review, then push), 3. Changes in the app (ship with the next build; please review), 4. Things only you can do, 4b. WhatsApp numbers (your yes, 2026-10-02), 4c. Limits on AI spending (your ask, 2026-10-02; D140), 5. Checked and fine (nothing to do, for your information), Security review (for Angad)

### Community 130 - "scam-check.tsx"
Cohesion: 0.33
Nodes (6): Answer, ANSWERS, QUESTIONS, riskLabel(), ScamCheckScreen(), styles

### Community 131 - "Security and data protection"
Cohesion: 0.40
Nodes (4): Security and data protection, Still to do (people, not code), Threats and what stops them, What's sensitive

### Community 132 - "experiments"
Cohesion: 0.67
Nodes (3): reactCompiler, typedRoutes, experiments

### Community 133 - "RemitBridge Labs: setting up the nonprofit"
Cohesion: 0.25
Nodes (7): 1. EIN (federal tax ID): put off (Angad, 2026-10-10), 2. Organize the board: this month, 3. Bank account: NOT DOING (D150), 4. Federal tax exemption (501(c)(3)): NOT DOING (D150), 5. Every year, 6. After the EIN, things that open up, RemitBridge Labs: setting up the nonprofit

### Community 139 - "blockedPermissions"
Cohesion: 0.20
Nodes (10): blockedPermissions, android.permission.READ_EXTERNAL_STORAGE, android.permission.READ_MEDIA_AUDIO, android.permission.READ_MEDIA_IMAGES, android.permission.READ_MEDIA_VIDEO, android.permission.READ_MEDIA_VISUAL_USER_SELECTED, android.permission.RECORD_AUDIO, android.permission.SYSTEM_ALERT_WINDOW (+2 more)

### Community 141 - "ios"
Cohesion: 0.22
Nodes (9): usesNonExemptEncryption, ios, associatedDomains, bundleIdentifier, config, icon, supportsTablet, usesAppleSignIn (+1 more)

### Community 142 - "android"
Cohesion: 0.29
Nodes (7): allowBackup, intentFilters, package, permissions, predictiveBackGestureEnabled, android, android.permission.CAMERA

### Community 143 - "module/[id].tsx"
Cohesion: 0.11
Nodes (25): LessonScreen(), MODE_ICONS, ModuleScreen(), styles, Word(), Finish(), Tile(), CLOUDS (+17 more)

### Community 144 - "secure-session.ts"
Cohesion: 0.11
Nodes (14): base64Bytes(), encryptionKey(), fromBase64(), fromUtf8(), open(), seal(), secureSessionStorage, toBase64() (+6 more)

### Community 146 - "learn-progress.ts"
Cohesion: 0.13
Nodes (20): LearnScreen(), MODULES, GameMode, dayBefore(), learned, LearnStats, listeners, localDay() (+12 more)

### Community 148 - "alert.tsx"
Cohesion: 0.53
Nodes (5): AlertScreen(), Step(), styles, startingTarget(), targetStep()

### Community 149 - "api.ts"
Cohesion: 0.07
Nodes (39): page, RESULT, LANG, require, Comparison, ConfirmRequest, ConfirmResponse, isBox() (+31 more)

### Community 150 - "extra"
Cohesion: 0.50
Nodes (4): projectId, extra, eas, router

### Community 152 - "plugins"
Cohesion: 0.50
Nodes (4): plugins, expo-apple-authentication, expo-localization, expo-sqlite

### Community 153 - "pager-tabs.tsx"
Cohesion: 0.40
Nodes (3): BarProps, PagerTabs, styles

### Community 154 - "Scope: an AI model in the WhatsApp bot"
Cohesion: 0.18
Nodes (10): Feature suggestions, How we'd know it works, Questions for Angad, Rules it has to keep, Scope: an AI model in the WhatsApp bot, What changes, What it can link to, What the bot does today (+2 more)

### Community 155 - "send-newsletter/index.ts"
Cohesion: 0.12
Nodes (15): RFC-8058, cors, cors, NAMES, cors, service(), cors, Recipient (+7 more)

### Community 156 - "email.ts"
Cohesion: 0.39
Nodes (7): buildEmail(), Built, escape(), Issue, paragraphHtml(), paragraphs(), Sender

### Community 160 - "cli.py"
Cohesion: 0.38
Nodes (9): _accept_drift(), _backends(), _fx(), _health(), main(), AsyncClient, rb-engine: the command the scheduled workflows run. rb-engine run [--adapter ID…, _run() (+1 more)

### Community 162 - "apple.ts"
Cohesion: 0.31
Nodes (7): cors, appleConfig, b64url(), clientSecret(), revokeApple(), RevokeResult, text()

### Community 165 - "adaptiveIcon"
Cohesion: 0.40
Nodes (5): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon

### Community 167 - "sign-in.ts"
Cohesion: 0.36
Nodes (8): appleAuthorizationCode(), friendly(), providerEnabled(), Result, signInWithApple(), signInWithGoogle(), signInWithGoogleNative(), verifyEmailCode()

### Community 173 - "quotes.ts"
Cohesion: 0.20
Nodes (15): atAmount(), fetchQuote(), fetchQuotes(), fromCache(), HistoryPoint, LatestQuote, nearest(), numeric() (+7 more)

### Community 178 - "computeTransferCost"
Cohesion: 0.16
Nodes (20): computeTransferCost(), REMITTANCE_TAX_FROM, REMITTANCE_TAX_SMALL, roundingTolerance(), Amounts, feeIncluded(), INSIDE, totalPaidBy() (+12 more)

## Knowledge Gaps
- **913 isolated node(s):** `H`, `COUNTRY`, `TEXT`, `whatsapp`, `push` (+908 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useTheme()` connect `useTheme` to `scam-check.tsx`, `metrics.tsx`, `module/[id].tsx`, `learn-progress.ts`, `alert.tsx`, `lesson/[id].tsx`, `useCopy`, `admin.tsx`, `illustrations.tsx`, `track`, `ui.tsx`, `expo-router`, `scan.tsx`, `app/_layout.tsx`, `i18n/index.tsx`, `newsletter.ts`, `languages.ts`, `account.tsx`, `app/remmy.tsx`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `expo-router` connect `expo-router` to `app/_layout.tsx`, `pager-tabs.tsx`, `ui.tsx`, `app/remmy.tsx`, `i18n/index.tsx`, `module/[id].tsx`, `whatsapp-section.tsx`, `remmy.ts`, `alert.tsx`, `lesson/[id].tsx`, `webhook.test.ts`, `useCopy`, `plugins`, `admin.tsx`, `useTheme`, `account.tsx`, `illustrations.tsx`, `track`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `plugins` connect `plugins` to `expo`, `expo-router`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `H`, `COUNTRY`, `TEXT` to the rest of the system?**
  _913 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Handoff` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1054421768707483 - nodes in this community are weakly interconnected._
- **Should `LocalStore` be split into smaller, more focused modules?**
  _Cohesion score 0.07716701902748414 - nodes in this community are weakly interconnected._