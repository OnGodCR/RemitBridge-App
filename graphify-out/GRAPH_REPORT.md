# Graph Report - RemitBridge-App  (2026-10-14)

## Corpus Check
- 450 files · ~1,166,569 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2848 nodes · 7569 edges · 176 communities (135 shown, 41 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 122 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e780971a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Handoff
- Permission request: pricing data
- types.ts
- LocalStore
- metrics.tsx
- FieldName
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
- sign-in/index.tsx
- admin.tsx
- review-sheet.ts
- compilerOptions
- Google Play
- illustrations.tsx
- model.ts
- true-cost.tsx
- devDependencies
- runner.py
- lesson.ts
- RawResponse
- synth.ts
- Appendix B: the to-do list (copied from `docs/todo.md` at handoff)
- useTheme
- receipt/package.json
- routes.tsx
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
- bot/src/test/fake-supabase.ts
- Partner outreach: Seattle-area organizations
- test_instarem.py
- useCopy
- send-rate-alerts.mjs
- extract.py
- 1. Why this exists
- receipt.ts
- scan.tsx
- To do
- scripts/benchmark.ts
- vercel.json
- quotes.ts
- make-icons.py
- cli.py
- learn-path.tsx
- The four Tier 1 routes, Q1 2025
- make-onboarding-art.py
- src/agent.ts
- harness.ts
- Providers for manual research
- @expo-google-fonts/plus-jakarta-sans
- routes.ts
- synthesize.ts
- expo-font
- remmy.ts
- mock
- local_migrations.sh
- expo-sqlite
- AI usage log
- PoliteClient
- README.md
- RemitBridge App
- Decisions
- i18n/index.tsx
- RemitBridge
- Engine
- test_gate.py
- expo-localization
- extract/fields.ts
- receipt-result.tsx
- Congressional App Challenge 2026: draft entry
- @infinitered/react-native-mlkit-core
- webhook.test.ts
- CAC gap report: the receipt scanner and what goes with it
- port-blog.mjs
- website-legal-entity.md
- react-native-safe-area-context
- Receipt reading benchmark
- ui.tsx
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
- ai.ts
- remmy-actions.ts
- knowledge.ts
- expo-splash-screen
- collection.py
- rate-alerts.ts
- account.tsx
- expo-router
- Security review (for Angad)
- @expo/ui
- expo-crypto
- react-native-screens
- eval-ai.ts
- Security and data protection
- blog.ts
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
- lesson/[id].tsx
- secure-session.ts
- react-dom
- learn-progress.ts
- pager-tabs.tsx
- experiments
- extra
- expo-constants
- plugins
- (tabs)/_layout.tsx
- Scope: an AI model in the WhatsApp bot
- send-newsletter/index.ts
- reading.ts
- expo-image-picker
- newsletter.ts
- expo-system-ui
- WhatsAppSection
- chatgpt-essay-prompt.md
- apple.ts
- supabase.ts
- react-native-pager-view
- adaptiveIcon
- src/newsletter.test.ts
- sign-in.ts
- chatgpt-learn-games.md
- expo
- @remitbridge/receipt
- chatgpt-research-task.md
- chatgpt-price-checks.md
- scan-receipt/index.ts

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 200 edges
2. `useCopy()` - 137 edges
3. `track()` - 66 edges
4. `AppText()` - 62 edges
5. `Spacing` - 55 edges
6. `money()` - 55 edges
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
- `termsIn()` --indirect_call--> `TOKEN()`  [INFERRED]
  mobile/src/lib/reading.ts → packages/bot/src/newsletter.test.ts
- `Pending` --references--> `FieldName`  [EXTRACTED]
  supabase/functions/whatsapp/index.ts → packages/receipt/src/types.ts

## Import Cycles
- None detected.

## Communities (176 total, 41 thin omitted)

### Community 0 - "Handoff"
Cohesion: 0.08
Nodes (25): 2026-09-30 evening (local session, the go-live list), 2026-10-01 (cloud session), 2026-10-10: where things stand, 2026-10-11: Android feedback, 2026-10-12: Android sign-ins fixed, WhatsApp linking confirmed, the newsletter (D169), 2026-10-12: legal audit (D164), 2026-10-12: screenshots, Mexico's prices, the code email, WhatsApp replies, store prep, 2026-10-12: the WhatsApp agent's fallbacks (D163) (+17 more)

### Community 1 - "Permission request: pricing data"
Cohesion: 0.29
Nodes (6): 2026-10-12: inbox check, From 2026-10-08: signing as an incorporated nonprofit, Permission request: pricing data, Round 2: shorter ask to more providers (2026-10-04), What was sent, Where to send

### Community 2 - "types.ts"
Cohesion: 0.09
Nodes (37): read(), ExtractionContext, Extractors, Checked, checkValue(), DELIVERY_METHODS, deserializeValue(), FIELD_SPECS (+29 more)

### Community 3 - "LocalStore"
Cohesion: 0.08
Nodes (10): Any, MidMarketRate, LocalStore, mid_market_rows(), AsyncClient, datetime, Path, Protocol (+2 more)

### Community 4 - "metrics.tsx"
Cohesion: 0.16
Nodes (12): Breakdown(), Group(), MetricsScreen(), PERIODS, styles, TOOL_LABELS, csvCell(), DEFINITIONS (+4 more)

### Community 5 - "FieldName"
Cohesion: 0.09
Nodes (37): page, RESULT, Comparison, ConfirmRequest, ConfirmResponse, ForgetRequest, isBox(), isNum() (+29 more)

### Community 6 - "expo"
Cohesion: 0.20
Nodes (9): expo, icon, name, orientation, owner, scheme, slug, userInterfaceStyle (+1 more)

### Community 7 - "ocr.ts"
Cohesion: 0.10
Nodes (42): pages, clean(), count, misses, offenders, score(), showsWord(), checkDisclosures() (+34 more)

### Community 8 - "test_wise.py"
Cohesion: 0.20
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
Cohesion: 0.17
Nodes (20): LocalArchive, Path, Writes to engine/.archive. For development and tests; gitignored., run_adapter(), mid(), no_sleep(), test_a_full_run_publishes_all_four_routes_through_the_gate(), FakeAdapter (+12 more)

### Community 15 - "9. The scraping engine (core system)"
Cohesion: 0.14
Nodes (14): 9.10 Engine SLOs, 9.11 Schedule, 9.12 Scraper conduct, 9.13 Tech stack, 9.1 Design principles, 9.2 Architecture, 9.3 The adapter framework, 9.4 Multi-strategy extraction (+6 more)

### Community 16 - "AGENTS.md"
Cohesion: 0.33
Nodes (5): Building with EAS, Commands, Expo has changed — do not trust your training data, Navigation & Routing, Rules

### Community 19 - "dependencies"
Cohesion: 0.07
Nodes (27): expo-apple-authentication, expo-device, expo-haptics, expo-image, expo-notifications, expo-secure-store, expo-symbols, expo-web-browser (+19 more)

### Community 20 - "14. Design system and brand consistency"
Cohesion: 0.17
Nodes (12): 14.10 Accessibility and low-bandwidth use, 14.11 Enforcement, 14.1 Where the app lives, 14.2 Naming, 14.3 Voice and writing rules, 14.4 Shared terminology, 14.5 Visual foundations, 14.6 Core components (+4 more)

### Community 21 - "learn-games.ts"
Cohesion: 0.10
Nodes (36): Lesson(), resultFor(), boardDone(), buildGame(), ChoiceQuestion, CHOICES, comparison(), costAnswer() (+28 more)

### Community 22 - "bot/package.json"
Cohesion: 0.13
Nodes (14): devDependencies, typescript, vitest, typescript, vitest, main, name, private (+6 more)

### Community 23 - "sign-in/index.tsx"
Cohesion: 0.24
Nodes (14): CodeStep(), styles, EmailStep(), looksLikeEmail(), styles, SignInOptions(), styles, Step() (+6 more)

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
Cohesion: 0.17
Nodes (30): ArrivalArt, Art, BankArt, BasicsArt, ChainArt, CheckedArt, depth(), FairRateArt (+22 more)

### Community 29 - "model.ts"
Cohesion: 0.06
Nodes (45): answerSchema(), askModel(), buildRequest(), ChatRequest, ChatResponse, DEFAULT_MODEL, DEFAULT_REASONING, GROQ_URL (+37 more)

### Community 30 - "true-cost.tsx"
Cohesion: 0.08
Nodes (40): knownCurrency(), styles, styles, fmt(), PERIODS, styles, SETUPS, styles (+32 more)

### Community 31 - "devDependencies"
Cohesion: 0.04
Nodes (44): eslint, eslint-config-expo, jest, jest-expo, devDependencies, eslint, eslint-config-expo, jest (+36 more)

### Community 32 - "runner.py"
Cohesion: 0.10
Nodes (28): Archive, Protocol, _anomaly(), _is_promotional(), _math_ok(), _range_problems(), The publish gate (PRD 9.7). A quote reaches users only if it passes every…, Sets validation_status, validation_notes and is_promotional on each quote, in… (+20 more)

### Community 33 - "lesson.ts"
Cohesion: 0.16
Nodes (20): Term, TERMS, BY_ID, Module, moduleTerms(), accuracy(), buildLesson(), distractors() (+12 more)

### Community 34 - "RawResponse"
Cohesion: 0.07
Nodes (40): ABC, Adapter, AdapterMeta, The adapter framework (PRD 9.3). An adapter holds only what is specific to one…, A hash of the response's structure (keys and types, not values), for drift…, Which routes, delivery methods and payment methods this provider serves., Every quote to ask for this run: supported routes x methods x the amount grid., Ask for one quote with one strategy. Return the raw response untouched. (+32 more)

### Community 35 - "synth.ts"
Cohesion: 0.08
Nodes (32): Fixture, addDays(), CITIES, Corridor, CORRIDORS, DELIVERY_WORDS, escapeHtml(), FINE_PRINT (+24 more)

### Community 36 - "Appendix B: the to-do list (copied from `docs/todo.md` at handoff)"
Cohesion: 0.05
Nodes (38): 1. How to work with Angad, 2. The project in a paragraph, 3. Rules that are code rules (breaking one is a bug), 4. Git workflow, 5. Running the app in Expo Go (and when you need a development build), 6. What happened in the last sessions (newest first), 7. What to do next, in order, Appendix A: open items (the MOD, copied from `CLAUDE.md` at handoff) (+30 more)

### Community 37 - "useTheme"
Cohesion: 0.08
Nodes (39): Step(), BlogPostScreen(), styles, styles, ActionCard(), Dot(), HeaderButton(), RemmyBubble() (+31 more)

### Community 38 - "receipt/package.json"
Cohesion: 0.08
Nodes (23): devDependencies, playwright-core, tesseract.js, @tesseract.js-data/eng, typescript, vitest, typescript, vitest (+15 more)

### Community 39 - "routes.tsx"
Cohesion: 0.11
Nodes (29): RequestRoute(), styles, BoardRow(), LaunchEmails(), RouteBoard(), STAGES, styles, RouteNotCovered() (+21 more)

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, paths, skipLibCheck (+11 more)

### Community 45 - "bot/src/index.ts"
Cohesion: 0.08
Nodes (62): DeliveryMethod, AgentContext, ago(), countryIn(), EN_THE, formatAnswer(), formatCompare(), formatDailyLimit() (+54 more)

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

### Community 53 - "bot/src/test/fake-supabase.ts"
Cohesion: 0.16
Nodes (13): env, PLAIN_REQUESTS, prompts, turns, caller, clients, createClient(), query() (+5 more)

### Community 54 - "Partner outreach: Seattle-area organizations"
Cohesion: 0.33
Nodes (5): Draft email, Log, Partner outreach: Seattle-area organizations, What to ask for, Who, and why

### Community 55 - "test_instarem.py"
Cohesion: 0.29
Nodes (16): InstaremAdapter, fixture(), _FourRoutes, parametrize, The Instarem adapter against real responses from its quote endpoint…, The adapter on the four routes the saved answers cover., raw(), req() (+8 more)

### Community 56 - "useCopy"
Cohesion: 0.07
Nodes (71): NewsletterSwitch(), AlertScreen(), BlogIndex(), FairRateScreen(), GlossaryScreen(), Word(), ObservatoryScreen(), Welcome() (+63 more)

### Community 57 - "send-rate-alerts.mjs"
Cohesion: 0.17
Nodes (10): COUNTRY, gone, H, messages, money(), push, sent, sentWhatsApp (+2 more)

### Community 58 - "extract.py"
Cohesion: 0.38
Nodes (9): _clean(), extract(), main(), _median(), _num(), _pct(), _period_label(), Path (+1 more)

### Community 59 - "1. Why this exists"
Cohesion: 0.67
Nodes (3): 1. Why this exists, The end goal, in one sentence, What "success" looks like in 12 months

### Community 60 - "receipt.ts"
Cohesion: 0.17
Nodes (16): LINK, DELIVERY_WORDS, DISCLOSURE_WORDS, formatReceiptQuestion(), formatReceiptResult(), formatReceiptUnreadable(), FUNDING_WORDS, LABELS (+8 more)

### Community 61 - "scan.tsx"
Cohesion: 0.07
Nodes (49): RedactedPhoto(), ScanScreen(), Step, styles, Answers, canScan(), discardPhotoFiles(), measureSharpness() (+41 more)

### Community 62 - "To do"
Cohesion: 0.13
Nodes (14): Claude, waiting on something, Content (Angad), Later, Legal, accounts and money (Angad), Newsletter (Angad, D169), Outreach, Phone feedback fixes (2026-10-14), Receipt scanner (Angad, D173) (+6 more)

### Community 63 - "scripts/benchmark.ts"
Cohesion: 0.06
Nodes (36): roundingTolerance(), byItem, imageFor(), leaks, lost, md, modes, readAll() (+28 more)

### Community 64 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, cleanUrls, headers, ignoreCommand, outputDirectory, rewrites

### Community 65 - "quotes.ts"
Cohesion: 0.12
Nodes (23): daysAgo(), fetchMidRate(), fetchRateSeries(), FX_SOURCE, get(), isoDay(), MidRate, MidRateState (+15 more)

### Community 66 - "make-icons.py"
Cohesion: 0.40
Nodes (3): mark(), Rebuild the app icons from the website mark: `python3 scripts/make-icons.py`…, Draw the mark so its 64-unit design fits `box` px (the favicon's own 64 grid),…

### Community 67 - "cli.py"
Cohesion: 0.12
Nodes (19): archive_key(), AsyncClient, The raw archive (PRD 9.1 principle 4): every response, compressed and…, Uploads to the private `raw-archive` bucket in Supabase Storage., SupabaseArchive, _accept_drift(), _backends(), _fx() (+11 more)

### Community 68 - "learn-path.tsx"
Cohesion: 0.20
Nodes (10): CLOUDS, Halo(), LearnBackdrop(), LearnPath(), Node(), Ring(), styles, MODULE_ART (+2 more)

### Community 69 - "The four Tier 1 routes, Q1 2025"
Cohesion: 0.25
Nodes (7): India (47 services surveyed), Median total cost of a $200 transfer, by year, Mexico (46 services surveyed), Philippines (57 services surveyed), The four Tier 1 routes, Q1 2025, Vietnam (31 services surveyed), World Bank remittance prices: sending from the US

### Community 70 - "make-onboarding-art.py"
Cohesion: 0.23
Nodes (9): band(), ground(), light(), mark(), Render the website's backdrop art for the app: `python3 scripts/make-…, A round pen along the path: no seams where segments meet., The outlined mark, white on transparent, at `scale` px per viewBox unit., The resting light: color at `alpha` in the middle, nothing at 60% of 38rem. (+1 more)

### Community 71 - "src/agent.ts"
Cohesion: 0.20
Nodes (17): AgentResult, appPrompt(), humanize(), norm(), objectsIn(), readTurn(), runAgent(), strayLinks() (+9 more)

### Community 72 - "harness.ts"
Cohesion: 0.12
Nodes (29): problems, rows, today, formatResults(), Mode, MODES, ModeSummary, pct() (+21 more)

### Community 73 - "Providers for manual research"
Cohesion: 0.40
Nodes (5): Checked 2026-10-01, nothing to automate, Neither forbidden nor automated, Not yet checked, Providers for manual research, Public datasets

### Community 75 - "routes.ts"
Cohesion: 0.12
Nodes (28): AMOUNTS, checkedAmountFor(), DELIVERY_LABELS, Route, routeFor(), ROUTES, chainClient(), cloudflareClient() (+20 more)

### Community 76 - "synthesize.ts"
Cohesion: 0.12
Nodes (16): f(), LANG, require, count, first, IMAGES, LANG, OUT (+8 more)

### Community 79 - "remmy.ts"
Cohesion: 0.12
Nodes (21): saveComparison(), boldParts(), emit(), executedActions, listeners, messages, newChat(), RemmyMessage (+13 more)

### Community 80 - "mock"
Cohesion: 0.18
Nodes (23): _cross_check(), _er_api(), fetch_mid_market(), _frankfurter(), FxUnavailable, _pct(), AsyncClient, Exception (+15 more)

### Community 81 - "local_migrations.sh"
Cohesion: 0.67
Nodes (3): LC_ALL, run(), local_migrations.sh script

### Community 83 - "AI usage log"
Cohesion: 0.07
Nodes (27): 2026-09-30: merging `main` (the other session's languages and accessibility work), 2026-09-30: Phase 1, the gap report, 2026-09-30: Phase 2, data model, redaction, parser harness, model fallback, validation, 2026-09-30: Phase 3, confirmation screen, result screen, funding method, 2026-09-30: Phase 4, the accuracy benchmark and synthetic receipts, 2026-09-30: Phase 5, receipt photos on WhatsApp, 2026-09-30: Phase 6, the disclosure check and the receipt observatory, 2026-09-30: switching the model fallback to Groq's free tier (+19 more)

### Community 84 - "PoliteClient"
Cohesion: 0.20
Nodes (8): PoliteClient, AsyncClient, parametrize, test_gives_up_after_max_attempts(), test_never_retries_when_told_to_stop(), test_retries_transient_errors_then_succeeds(), test_waits_between_requests_to_the_same_domain(), Response

### Community 85 - "README.md"
Cohesion: 0.18
Nodes (5): Commits, Contributing, Sign off every commit (Developer Certificate of Origin), RemitBridge mobile app, Ownership

### Community 86 - "RemitBridge App"
Cohesion: 0.12
Nodes (17): Before launch, CAC submission (internal deadline Oct 23, official Oct 26), Done, Features to set up, Git, graphify, Keeping the docs current, Open items (+9 more)

### Community 87 - "Decisions"
Cohesion: 0.11
Nodes (19): 2026-09-28: Angad's answers on partners, structure, and prices, 2026-09-28: during the first build slice, 2026-09-28: first round, after reading PRD v0.4, 2026-09-28: onboarding and the Compare controls, 2026-09-28: second round, 2026-09-28: third round, 2026-09-30: accessibility and languages, 2026-09-30: Phase 3 defaults (+11 more)

### Community 88 - "i18n/index.tsx"
Cohesion: 0.10
Nodes (27): Flag(), FLAG_SLOT, FLAGS, FlagSlot(), styles, LanguageButton(), LanguageSheet(), styles (+19 more)

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
Nodes (42): deliveryIn(), extractAmountReceived(), extractAmountSent(), extractDeliveryMethod(), extractExchangeRate(), extractFee(), extractFundingMethod(), extractPickupCharge() (+34 more)

### Community 94 - "receipt-result.tsx"
Cohesion: 0.10
Nodes (29): Stat(), STATS, styles, Why(), EASE_OUT, GENTLE, RISE_DELAYS, RISE_DISTANCE (+21 more)

### Community 95 - "Congressional App Challenge 2026: draft entry"
Cohesion: 0.17
Nodes (11): App name, Congressional App Challenge 2026: draft entry, Demo video script (about 2 minutes 45 seconds), How does it work?, One-line description, Technologies, Use of AI tools (disclose this), What did you learn? / What would you do next? (+3 more)

### Community 97 - "webhook.test.ts"
Cohesion: 0.15
Nodes (10): confirms, delivery(), dispatched, env, field(), FIELDS, photo(), sent (+2 more)

### Community 98 - "CAC gap report: the receipt scanner and what goes with it"
Cohesion: 0.33
Nodes (5): CAC gap report: the receipt scanner and what goes with it, Decisions I need before Phase 2, Item by item, Rough fit against Oct 23, What the new work sits on

### Community 99 - "port-blog.mjs"
Cohesion: 0.17
Nodes (9): app, appCovers, assets, blogJs, { bodies }, coverFiles, images, out (+1 more)

### Community 102 - "Receipt reading benchmark"
Cohesion: 0.14
Nodes (12): Real receipts (`receipts/`), Receipt reading benchmark, Running it, Synthetic receipts (`synthetic/`), What this does not tell you, By field (accuracy), Disclosure check, Receipt reading benchmark (+4 more)

### Community 103 - "ui.tsx"
Cohesion: 0.07
Nodes (56): styles, styles, MODE_ICONS, styles, styles, styles, styles, styles (+48 more)

### Community 104 - "Launch checklist: App Store and Google Play"
Cohesion: 0.18
Nodes (10): Android (Google Play), Blocking, Blocking, iPhone (App Store), Launch checklist: App Store and Google Play, Not needed for launch, Should do first, Should do first (+2 more)

### Community 111 - "Hindi review sheet"
Cohesion: 0.40
Nodes (4): For the reviewer, Hindi review sheet, Learn game modes (2026-10-12), Remmy (2026-10-13)

### Community 113 - "RemitBridge 2.0: what comes after launch"
Cohesion: 0.14
Nodes (13): 1. Your money, over a year: a personal remittance record, 2. A rights checker: "was this transfer done right?", 3. Scam shield on WhatsApp, 4. Community prices: receipts that help everyone, 5. Reaching people without smartphones or data, 6. Smarter alerts that state facts, not forecasts, 7. Tools for the organizations that serve senders, 8. Open data and a public price index (+5 more)

### Community 116 - "ai.ts"
Cohesion: 0.07
Nodes (41): Country, RECEIVING, SENDING, answer, ANSWER_PROMPT(), ChatMessage, checkAnswer(), COUNTRIES (+33 more)

### Community 117 - "remmy-actions.ts"
Cohesion: 0.16
Nodes (17): ALIAS_LIST, ALIASES, bare(), DeliveryMethod, fold(), isScreen(), matchIntent(), REMMY_MODES (+9 more)

### Community 119 - "knowledge.ts"
Cohesion: 0.15
Nodes (13): ALL, APP, CORE, Entry, FAQ, FEATURES, GLOSSARY, Post (+5 more)

### Community 121 - "collection.py"
Cohesion: 0.31
Nodes (8): Prepare a reviewed CSV for the manual adapter; never writes to Supabase., prepare_collection(), datetime, Validate reviewed collection CSV rows before feeding the ordinary manual…, row(), test_missing_methods_currency_mismatch_and_old_quotes_stay_held(), test_promotional_quote_stays_labelled(), test_regular_terms_keep_original_date_and_promotional_evidence()

### Community 123 - "rate-alerts.ts"
Cohesion: 0.19
Nodes (11): AlertChannel, createAlert(), CreateResult, pushToken(), RateAlert, startingTarget(), targetStep(), TokenResult (+3 more)

### Community 124 - "account.tsx"
Cohesion: 0.06
Nodes (46): AccountScreen(), NameField(), styles, Navigator(), useAlertTaps(), useSessionEvents(), SavedScreen(), LearnScreen() (+38 more)

### Community 126 - "Security review (for Angad)"
Cohesion: 0.22
Nodes (8): 1. Changes already live (please review), 2. Changes waiting on your `supabase db push` (please review, then push), 3. Changes in the app (ship with the next build; please review), 4. Things only you can do, 4b. WhatsApp numbers (your yes, 2026-10-02), 4c. Limits on AI spending (your ask, 2026-10-02; D140), 5. Checked and fine (nothing to do, for your information), Security review (for Angad)

### Community 130 - "eval-ai.ts"
Cohesion: 0.15
Nodes (8): all, Labelled, messages, misses, out, report, samples, Understood

### Community 131 - "Security and data protection"
Cohesion: 0.40
Nodes (4): Security and data protection, Still to do (people, not code), Threats and what stops them, What's sensitive

### Community 132 - "blog.ts"
Cohesion: 0.20
Nodes (10): BlogBlock, BLOG_IMAGES, linkTarget(), POSTS, relatedTo(), SERIES, SeriesId, LanguageProvider() (+2 more)

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

### Community 143 - "lesson/[id].tsx"
Cohesion: 0.13
Nodes (25): LessonScreen(), MatchBoard(), PriceCard(), Question(), rate(), receiptValue(), SAFETY_ICONS, styles (+17 more)

### Community 144 - "secure-session.ts"
Cohesion: 0.11
Nodes (14): base64Bytes(), encryptionKey(), fromBase64(), fromUtf8(), open(), seal(), secureSessionStorage, toBase64() (+6 more)

### Community 146 - "learn-progress.ts"
Cohesion: 0.14
Nodes (17): MODULES, GameMode, dayBefore(), learned, listeners, localDay(), markLearned(), nextStep() (+9 more)

### Community 148 - "pager-tabs.tsx"
Cohesion: 0.40
Nodes (3): BarProps, PagerTabs, styles

### Community 149 - "experiments"
Cohesion: 0.67
Nodes (3): reactCompiler, typedRoutes, experiments

### Community 150 - "extra"
Cohesion: 0.50
Nodes (4): projectId, extra, eas, router

### Community 152 - "plugins"
Cohesion: 0.50
Nodes (4): plugins, expo-apple-authentication, expo-localization, expo-sqlite

### Community 153 - "(tabs)/_layout.tsx"
Cohesion: 0.32
Nodes (6): ORDER, styles, swipe, AppTabs(), currentTab(), setSwipeDirection()

### Community 154 - "Scope: an AI model in the WhatsApp bot"
Cohesion: 0.18
Nodes (10): Feature suggestions, How we'd know it works, Questions for Angad, Rules it has to keep, Scope: an AI model in the WhatsApp bot, What changes, What it can link to, What the bot does today (+2 more)

### Community 155 - "send-newsletter/index.ts"
Cohesion: 0.09
Nodes (22): RFC-8058, cors, cors, NAMES, cors, service(), buildEmail(), Built (+14 more)

### Community 156 - "reading.ts"
Cohesion: 0.43
Nodes (6): BlogPost, Assignment, readingFor(), TERMS_BY_POST, termsIn(), textOf()

### Community 158 - "newsletter.ts"
Cohesion: 0.24
Nodes (10): NewsletterScreen(), newsletterStatus(), sendIssue(), SendResult, SentIssue, sentIssues(), setNewsletter(), subscriberCount() (+2 more)

### Community 160 - "WhatsAppSection"
Cohesion: 0.38
Nodes (9): WhatsAppSection(), formatNumber(), linkStatus, newLinkCode(), openChat(), signedInCall(), unlinkWhatsApp(), whatsAppSettings (+1 more)

### Community 162 - "apple.ts"
Cohesion: 0.31
Nodes (7): cors, appleConfig, b64url(), clientSecret(), revokeApple(), RevokeResult, text()

### Community 163 - "supabase.ts"
Cohesion: 0.23
Nodes (8): SavedComparison, SaveResult, fetchObservatory(), Observatory, ObservatoryGroup, supabase, DATA, fetchMock

### Community 165 - "adaptiveIcon"
Cohesion: 0.40
Nodes (5): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon

### Community 166 - "src/newsletter.test.ts"
Cohesion: 0.22
Nodes (7): env, handlers, issue, mail, people(), site, TOKEN()

### Community 167 - "sign-in.ts"
Cohesion: 0.42
Nodes (7): friendly(), providerEnabled(), Result, signInWithApple(), signInWithGoogle(), signInWithGoogleNative(), verifyEmailCode()

### Community 178 - "scan-receipt/index.ts"
Cohesion: 0.08
Nodes (49): costOf(), NewCheck, SaveCheckError, SavedCheck, computeTransferCost(), FUNDING_METHODS, FundingMethod, MATH_TOLERANCE_ABS (+41 more)

## Knowledge Gaps
- **960 isolated node(s):** `H`, `COUNTRY`, `TEXT`, `whatsapp`, `push` (+955 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useTheme()` connect `useTheme` to `metrics.tsx`, `learn-path.tsx`, `ui.tsx`, `routes.tsx`, `i18n/index.tsx`, `illustrations.tsx`, `lesson/[id].tsx`, `sign-in/index.tsx`, `learn-games.ts`, `receipt-result.tsx`, `useCopy`, `admin.tsx`, `newsletter.ts`, `account.tsx`, `scan.tsx`, `true-cost.tsx`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `expo-router` connect `account.tsx` to `lesson.ts`, `(tabs)/_layout.tsx`, `blog.ts`, `useTheme`, `ui.tsx`, `routes.tsx`, `lesson/[id].tsx`, `remmy.ts`, `sign-in/index.tsx`, `pager-tabs.tsx`, `receipt-result.tsx`, `plugins`, `admin.tsx`, `useCopy`, `true-cost.tsx`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `plugins` connect `plugins` to `account.tsx`, `expo`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `H`, `COUNTRY`, `TEXT` to the rest of the system?**
  _960 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Handoff` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0946938775510204 - nodes in this community are weakly interconnected._
- **Should `LocalStore` be split into smaller, more focused modules?**
  _Cohesion score 0.08292682926829269 - nodes in this community are weakly interconnected._