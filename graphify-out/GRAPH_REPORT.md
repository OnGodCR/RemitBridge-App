# Graph Report - RemitBridge-App  (2026-09-30)

## Corpus Check
- 158 files · ~126,157 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1083 nodes · 2819 edges · 80 communities (52 shown, 28 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b65bc3bc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RemitBridge App
- Permission request: pricing data
- true-cost.tsx
- LocalStore
- fetch_mid_market
- Quote
- sign-in.ts
- account.tsx
- test_gate.py
- formula/package.json
- include
- compute_transfer_cost
- compilerOptions
- package.json
- expo
- 9. The scraping engine (core system)
- AGENTS.md
- eslint.config.js
- adapters/__init__.py
- dependencies
- 14. Design system and brand consistency
- expo-glass-effect
- bot/package.json
- expo-image
- metrics.tsx
- expo-router
- compilerOptions
- expo-status-bar
- expo-apple-authentication
- models.py
- @expo/ui
- mobile/package.json
- messages.ts
- useTheme
- RawResponse
- devDependencies
- expo-constants
- react
- @expo-google-fonts/hind
- react-native-worklets
- @supabase/supabase-js
- FakeAdapter
- remitbridge-engine
- runner.py
- process-prices/index.ts
- RemitBridge — Product Requirements Document
- rls_smoke.sh
- react-dom
- 5. MVP features
- 6. Corridors
- react-native
- delete-account/index.ts
- Partner outreach: Seattle-area organizations
- expo-localization
- expo-symbols
- react-native-reanimated
- language-picker.tsx
- 1. Why this exists
- i18n/index.tsx
- track
- webhook.test.ts
- routes.tsx
- vercel.json
- expo-web-browser
- make-icons.py
- cli.py
- admin.tsx
- react-native-gesture-handler
- make-onboarding-art.py
- notify-route-launch/index.ts
- saved-comparisons.tsx
- ui.tsx
- react-native-screens
- expo-system-ui
- expo-crypto
- scam-check.tsx
- local_migrations.sh

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 109 edges
2. `useCopy()` - 78 edges
3. `track()` - 42 edges
4. `AppText()` - 39 edges
5. `Spacing` - 33 edges
6. `money()` - 28 edges
7. `expo-router` - 27 edges
8. `PoliteClient` - 26 edges
9. `RawResponse` - 26 edges
10. `Fonts` - 24 edges

## Surprising Connections (you probably didn't know these)
- `normalize()` --calls--> `compute_transfer_cost()`  [INFERRED]
  engine/src/remitbridge_engine/normalize.py → packages/formula/python/remitbridge_formula/__init__.py
- `arithmeticCheck()` --calls--> `computeTransferCost()`  [EXTRACTED]
  mobile/src/lib/admin.ts → packages/formula/src/index.ts
- `formatCompare()` --calls--> `money()`  [EXTRACTED]
  packages/bot/src/messages.ts → mobile/src/lib/format.ts
- `formatWhy()` --calls--> `money()`  [EXTRACTED]
  packages/bot/src/messages.ts → mobile/src/lib/format.ts
- `usd()` --calls--> `money()`  [EXTRACTED]
  packages/bot/src/messages.ts → mobile/src/lib/format.ts

## Import Cycles
- None detected.

## Communities (80 total, 28 thin omitted)

### Community 0 - "RemitBridge App"
Cohesion: 0.05
Nodes (41): Git, graphify, Keeping the docs current, Open items, Product rules that are also code rules, RemitBridge App, Secrets, Stack (+33 more)

### Community 1 - "Permission request: pricing data"
Cohesion: 0.50
Nodes (3): Permission request: pricing data, What was sent, Where to send

### Community 2 - "true-cost.tsx"
Cohesion: 0.07
Nodes (56): FairRateScreen(), knownCurrency(), styles, fmt(), PERIODS, RateHistoryScreen(), styles, parseDate() (+48 more)

### Community 3 - "LocalStore"
Cohesion: 0.08
Nodes (12): Any, MidMarketRate, LocalStore, mid_market_rows(), AsyncClient, datetime, Path, Protocol (+4 more)

### Community 4 - "fetch_mid_market"
Cohesion: 0.24
Nodes (13): _er_api(), fetch_mid_market(), _frankfurter(), FxUnavailable, AsyncClient, Exception, Mid-market reference rates from two free sources, cross-checked (PRD 9.7 check…, No trustworthy mid-market rate for a pair right now. (+5 more)

### Community 5 - "Quote"
Cohesion: 0.25
Nodes (12): _anomaly(), _is_promotional(), _math_ok(), _range_problems(), The publish gate (PRD 9.7). A quote reaches users only if it passes every…, Sets validation_status, validation_notes and is_promotional on each quote, in…, Index -> problem, for quotes whose markup jumps against their grid neighbour., run_gate() (+4 more)

### Community 6 - "sign-in.ts"
Cohesion: 0.06
Nodes (34): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, reactCompiler (+26 more)

### Community 7 - "account.tsx"
Cohesion: 0.20
Nodes (16): styles, styles, styles, ToolsScreen(), HeroBackdrop(), HeroHeader(), StatusBarShield(), styles (+8 more)

### Community 8 - "test_gate.py"
Cohesion: 0.28
Nodes (14): mid(), no_sleep(), gate(), make(), test_a_clean_quote_publishes(), test_captured_at_defaults_to_now(), test_huge_fee_is_held(), test_markup_over_15_percent_is_held() (+6 more)

### Community 9 - "formula/package.json"
Cohesion: 0.13
Nodes (14): devDependencies, typescript, vitest, typescript, vitest, main, name, private (+6 more)

### Community 10 - "include"
Cohesion: 0.15
Nodes (12): compilerOptions, paths, strict, extends, include, @/assets/*, ./assets/*, expo-env.d.ts (+4 more)

### Community 11 - "compute_transfer_cost"
Cohesion: 0.19
Nodes (12): @remitbridge/formula, compute_transfer_cost(), The one total-cost formula (the TrueCost method, PRD 14.4). Python twin of…, S sent, F fee (sending currency), Q quoted and M mid-market rates (receiving…, Twelve identical transfers. No compounding, no assumption about future rates., TransferCost, yearly_cost(), _close() (+4 more)

### Community 12 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, allowImportingTsExtensions, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck (+6 more)

### Community 13 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, test, typecheck, workspaces, mobile, packages/*

### Community 15 - "9. The scraping engine (core system)"
Cohesion: 0.14
Nodes (14): 9.10 Engine SLOs, 9.11 Schedule, 9.12 Scraper conduct, 9.13 Tech stack, 9.1 Design principles, 9.2 Architecture, 9.3 The adapter framework, 9.4 Multi-strategy extraction (+6 more)

### Community 16 - "AGENTS.md"
Cohesion: 0.33
Nodes (5): Building with EAS, Commands, Expo has changed — do not trust your training data, Navigation & Routing, Rules

### Community 19 - "dependencies"
Cohesion: 0.12
Nodes (17): expo-device, expo-font, @expo-google-fonts/plus-jakarta-sans, expo-linking, expo-splash-screen, expo-sqlite, dependencies, expo-device (+9 more)

### Community 20 - "14. Design system and brand consistency"
Cohesion: 0.17
Nodes (12): 14.10 Accessibility and low-bandwidth use, 14.11 Enforcement, 14.1 Where the app lives, 14.2 Naming, 14.3 Voice and writing rules, 14.4 Shared terminology, 14.5 Visual foundations, 14.6 Core components (+4 more)

### Community 22 - "bot/package.json"
Cohesion: 0.13
Nodes (14): devDependencies, typescript, vitest, typescript, vitest, main, name, private (+6 more)

### Community 24 - "metrics.tsx"
Cohesion: 0.14
Nodes (14): Breakdown(), Group(), MetricsScreen(), PERIODS, styles, TOOL_LABELS, ListFact(), EnglishOnly() (+6 more)

### Community 26 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck, strict (+3 more)

### Community 29 - "models.py"
Cohesion: 0.22
Nodes (14): AdapterMeta, The adapter framework (PRD 9.3). An adapter holds only what is specific to one…, Manual quotes: strategy 5 of PRD 9.4, and the source for any provider whose…, Engine configuration: routes, the amount grid, conduct limits and the publish-…, RouteConfig, DeliveryMethod, PaymentMethod, Data shapes that move through the engine. Mirrors the tables in… (+6 more)

### Community 31 - "mobile/package.json"
Cohesion: 0.18
Nodes (10): main, name, private, scripts, android, ios, lint, start (+2 more)

### Community 32 - "messages.ts"
Cohesion: 0.07
Nodes (64): AMOUNTS, checkedAmountFor(), DELIVERY_LABELS, Route, ROUTES, ago(), countryIn(), EN_THE (+56 more)

### Community 33 - "useTheme"
Cohesion: 0.14
Nodes (31): QuoteDetail(), rate(), styles, AccountScreen(), cleanAmount(), Compare(), Notice(), Results() (+23 more)

### Community 34 - "RawResponse"
Cohesion: 0.09
Nodes (19): ABC, Adapter, A hash of the response's structure (keys and types, not values), for drift…, Which routes, delivery methods and payment methods this provider serves., Every quote to ask for this run: supported routes x methods x the amount grid., Ask for one quote with one strategy. Return the raw response untouched., Read a raw response into what the provider said. Raise ValueError if it can't., One cheap known-good request. Default: the first quote this adapter would ask… (+11 more)

### Community 35 - "devDependencies"
Cohesion: 0.22
Nodes (9): eslint, eslint-config-expo, devDependencies, eslint, eslint-config-expo, @types/react, typescript, typescript (+1 more)

### Community 41 - "FakeAdapter"
Cohesion: 0.31
Nodes (13): RouteSupport, run_adapter(), FakeAdapter, The smallest honest adapter: one JSON endpoint, one route, one method., respond(), setup(), test_a_changed_response_shape_is_held_even_when_parsing_works(), test_blocked_stops_at_once_and_opens_the_breaker() (+5 more)

### Community 45 - "runner.py"
Cohesion: 0.10
Nodes (22): Archive, Protocol, AdapterError, PoliteClient, AsyncClient, Exception, The polite client every adapter fetches through (PRD 9.5 and 9.12). Conduct is…, RemitBridge scraping engine. See engine/README.md. (+14 more)

### Community 47 - "RemitBridge — Product Requirements Document"
Cohesion: 0.20
Nodes (10): 10. Success metrics, 11. Risks, 12. Milestones, 13. Open questions, 2. Positioning and competitors, 3. Users, 4. Goals and non-goals, 7. Roadmap (post-MVP) (+2 more)

### Community 48 - "rls_smoke.sh"
Cohesion: 0.47
Nodes (4): check(), pg(), post(), rls_smoke.sh script

### Community 50 - "5. MVP features"
Cohesion: 0.22
Nodes (9): 5.1 Total-cost comparison, 5.2 "Where your money went" breakdown, 5.3 Provider database, 5.4 Methodology page, 5.5 Multilingual UI, 5.6 Basic analytics, 5.7 Migration of existing RemitBridge tools, 5.8 WhatsApp bot (promoted to MVP) (+1 more)

### Community 51 - "6. Corridors"
Cohesion: 0.25
Nodes (8): 6.1 Tier 1 — Launch (4 corridors), 6.2 Tier 2 — First expansion (10 corridors), 6.3 Tier 3 — Broad coverage (14 corridors), 6.4 Special-handling corridors, 6.5 Future sending countries (Phase 2 of coverage), 6.6 Provider universe (per adapter, not per corridor), 6.7 Corridor request system, 6. Corridors

### Community 54 - "Partner outreach: Seattle-area organizations"
Cohesion: 0.33
Nodes (5): Draft email, Log, Partner outreach: Seattle-area organizations, What to ask for, Who, and why

### Community 58 - "language-picker.tsx"
Cohesion: 0.24
Nodes (11): GlossaryScreen(), LanguageButton(), LanguageSheet(), styles, BackButton(), Dots(), styles, TextLink() (+3 more)

### Community 59 - "1. Why this exists"
Cohesion: 0.67
Nodes (3): 1. Why this exists, The end goal, in one sentence, What "success" looks like in 12 months

### Community 60 - "i18n/index.tsx"
Cohesion: 0.13
Nodes (18): AppTabs(), TERM_TRANSLATIONS, TermTranslation, Copy, en, es, hi, COPY (+10 more)

### Community 61 - "track"
Cohesion: 0.11
Nodes (23): styles, Welcome(), PickRoute(), styles, Stat(), STATS, styles, Why() (+15 more)

### Community 62 - "webhook.test.ts"
Cohesion: 0.21
Nodes (8): clients, createClient(), query(), reset(), Row, tables, env, sent

### Community 63 - "routes.tsx"
Cohesion: 0.09
Nodes (37): RequestRoute(), styles, BoardRow(), LaunchEmails(), RouteBoard(), STAGES, styles, Flag() (+29 more)

### Community 64 - "vercel.json"
Cohesion: 0.40
Nodes (4): cleanUrls, headers, ignoreCommand, rewrites

### Community 66 - "make-icons.py"
Cohesion: 0.40
Nodes (3): mark(), Rebuild the app icons from the website mark: `python3 scripts/make-icons.py`…, Draw the mark so its 64-unit design fits `box` px (the favicon's own 64 grid),…

### Community 67 - "cli.py"
Cohesion: 0.13
Nodes (18): archive_key(), LocalArchive, AsyncClient, Path, The raw archive (PRD 9.1 principle 4): every response, compressed and…, Writes to engine/.archive. For development and tests; gitignored., Uploads to the private `raw-archive` bucket in Supabase Storage., SupabaseArchive (+10 more)

### Community 68 - "admin.tsx"
Cohesion: 0.07
Nodes (39): AddPriceScreen(), cleanNumber(), Field(), RecentRow(), STATUS_LABEL, styles, Navigator(), useSessionEvents() (+31 more)

### Community 70 - "make-onboarding-art.py"
Cohesion: 0.23
Nodes (9): band(), ground(), light(), mark(), Render the website's backdrop art for the app: `python3 scripts/make-…, A round pen along the path: no seams where segments meet., The outlined mark, white on transparent, at `scale` px per viewBox unit., The resting light: color at `alpha` in the middle, nothing at 60% of 38rem. (+1 more)

### Community 72 - "saved-comparisons.tsx"
Cohesion: 0.17
Nodes (17): CodeStep(), styles, EmailStep(), looksLikeEmail(), styles, ListItem(), styles, SavedComparisons() (+9 more)

### Community 73 - "ui.tsx"
Cohesion: 0.11
Nodes (28): styles, RemitBenchScreen(), SETUPS, styles, TESTS, useBoldText(), styles, RouteRequestForm() (+20 more)

### Community 79 - "scam-check.tsx"
Cohesion: 0.33
Nodes (6): Answer, ANSWERS, QUESTIONS, riskLabel(), ScamCheckScreen(), styles

### Community 81 - "local_migrations.sh"
Cohesion: 0.67
Nodes (3): LC_ALL, run(), local_migrations.sh script

## Knowledge Gaps
- **327 isolated node(s):** `remitbridge-engine`, `name`, `slug`, `version`, `orientation` (+322 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `compute_transfer_cost`, `expo`, `expo-glass-effect`, `expo-image`, `expo-router`, `expo-status-bar`, `expo-apple-authentication`, `@expo/ui`, `mobile/package.json`, `expo-constants`, `react`, `@expo-google-fonts/hind`, `react-native-worklets`, `@supabase/supabase-js`, `react-dom`, `react-native`, `expo-localization`, `expo-symbols`, `react-native-reanimated`, `expo-web-browser`, `react-native-gesture-handler`, `react-native-screens`, `expo-system-ui`, `expo-crypto`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `@remitbridge/formula` connect `compute_transfer_cost` to `RawResponse`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `@remitbridge/formula` connect `compute_transfer_cost` to `dependencies`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `remitbridge-engine`, `name`, `slug` to the rest of the system?**
  _327 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `RemitBridge App` be split into smaller, more focused modules?**
  _Cohesion score 0.045068027210884355 - nodes in this community are weakly interconnected._
- **Should `true-cost.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07370600414078675 - nodes in this community are weakly interconnected._
- **Should `LocalStore` be split into smaller, more focused modules?**
  _Cohesion score 0.08181818181818182 - nodes in this community are weakly interconnected._