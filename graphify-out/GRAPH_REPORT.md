# Graph Report - RemitBridge-App  (2026-09-29)

## Corpus Check
- 143 files · ~100,877 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1018 nodes · 2458 edges · 75 communities (48 shown, 27 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 57 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2a99de8b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RemitBridge App
- Permission request: pricing data
- true-cost.tsx
- Quote
- MidMarketRate
- Adapter
- expo
- mobile/package.json
- test_gate.py
- bot/package.json
- include
- compute_transfer_cost
- compilerOptions
- package.json
- dependencies
- 9. The scraping engine (core system)
- AGENTS.md
- eslint.config.js
- adapters/__init__.py
- expo-device
- 14. Design system and brand consistency
- expo-glass-effect
- @expo-google-fonts/plus-jakarta-sans
- expo-image
- metrics.tsx
- expo-router
- expo-splash-screen
- expo-status-bar
- expo-symbols
- models.py
- @expo/ui
- (tabs)/index.tsx
- messages.ts
- select-field.tsx
- runner.py
- react-native-gesture-handler
- react-native-safe-area-context
- react-native-screens
- react-native-web
- react-native-worklets
- @supabase/supabase-js
- FakeAdapter
- remitbridge-engine
- PoliteClient
- process-prices/index.ts
- RemitBridge — Product Requirements Document
- rls_smoke.sh
- ui.tsx
- 5. MVP features
- 6. Corridors
- ManualAdapter
- delete-account/index.ts
- Partner outreach: Seattle-area organizations
- expo-constants
- expo-sqlite
- react-native-reanimated
- useTheme
- 1. Why this exists
- routes.tsx
- AppText
- webhook.test.ts
- sign-in/index.tsx
- vercel.json
- make-icons.py
- cli.py
- make-onboarding-art.py
- notify-route-launch/index.ts
- app-tabs.tsx
- track
- devDependencies
- expo-system-ui
- expo-crypto

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 105 edges
2. `track()` - 40 edges
3. `AppText()` - 35 edges
4. `Spacing` - 31 edges
5. `money()` - 28 edges
6. `RawResponse` - 26 edges
7. `PoliteClient` - 26 edges
8. `expo-router` - 26 edges
9. `FakeAdapter` - 23 edges
10. `Fonts` - 23 edges

## Surprising Connections (you probably didn't know these)
- `normalize()` --calls--> `compute_transfer_cost()`  [INFERRED]
  engine/src/remitbridge_engine/normalize.py → packages/formula/python/remitbridge_formula/__init__.py
- `State` --references--> `DeliveryMethod`  [EXTRACTED]
  packages/bot/src/plan.ts → mobile/src/lib/routes.ts
- `formatCompare()` --calls--> `money()`  [EXTRACTED]
  packages/bot/src/messages.ts → mobile/src/lib/format.ts
- `formatWhy()` --calls--> `money()`  [EXTRACTED]
  packages/bot/src/messages.ts → mobile/src/lib/format.ts
- `usd()` --calls--> `money()`  [EXTRACTED]
  packages/bot/src/messages.ts → mobile/src/lib/format.ts

## Import Cycles
- None detected.

## Communities (75 total, 27 thin omitted)

### Community 0 - "RemitBridge App"
Cohesion: 0.05
Nodes (39): Git, graphify, Keeping the docs current, Open items, Product rules that are also code rules, RemitBridge App, Secrets, Stack (+31 more)

### Community 1 - "Permission request: pricing data"
Cohesion: 0.50
Nodes (3): Permission request: pricing data, What was sent, Where to send

### Community 2 - "true-cost.tsx"
Cohesion: 0.06
Nodes (64): FairRateScreen(), knownCurrency(), styles, QuoteDetail(), rate(), fmt(), PERIODS, RateHistoryScreen() (+56 more)

### Community 3 - "Quote"
Cohesion: 0.06
Nodes (21): Any, _anomaly(), _is_promotional(), _math_ok(), _range_problems(), The publish gate (PRD 9.7). A quote reaches users only if it passes every…, Sets validation_status, validation_notes and is_promotional on each quote, in…, Index -> problem, for quotes whose markup jumps against their grid neighbour. (+13 more)

### Community 4 - "MidMarketRate"
Cohesion: 0.22
Nodes (12): _er_api(), fetch_mid_market(), _frankfurter(), FxUnavailable, AsyncClient, Exception, Mid-market reference rates from two free sources, cross-checked (PRD 9.7 check…, No trustworthy mid-market rate for a pair right now. (+4 more)

### Community 5 - "Adapter"
Cohesion: 0.19
Nodes (8): ABC, Adapter, A hash of the response's structure (keys and types, not values), for drift…, Which routes, delivery methods and payment methods this provider serves., Every quote to ask for this run: supported routes x methods x the amount grid., Ask for one quote with one strategy. Return the raw response untouched., One cheap known-good request. Default: the first quote this adapter would ask…, _shape()

### Community 6 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, reactCompiler (+18 more)

### Community 7 - "mobile/package.json"
Cohesion: 0.18
Nodes (10): main, name, private, scripts, android, ios, lint, start (+2 more)

### Community 8 - "test_gate.py"
Cohesion: 0.42
Nodes (11): gate(), make(), test_a_clean_quote_publishes(), test_captured_at_defaults_to_now(), test_huge_fee_is_held(), test_markup_over_15_percent_is_held(), test_provider_rounding_is_tolerated(), test_rate_well_above_mid_market_needs_a_promo_label() (+3 more)

### Community 9 - "bot/package.json"
Cohesion: 0.07
Nodes (27): devDependencies, typescript, vitest, main, name, private, scripts, test (+19 more)

### Community 10 - "include"
Cohesion: 0.15
Nodes (12): compilerOptions, paths, strict, extends, include, @/assets/*, ./assets/*, expo-env.d.ts (+4 more)

### Community 11 - "compute_transfer_cost"
Cohesion: 0.19
Nodes (12): @remitbridge/formula, compute_transfer_cost(), The one total-cost formula (the TrueCost method, PRD 14.4). Python twin of…, S sent, F fee (sending currency), Q quoted and M mid-market rates (receiving…, Twelve identical transfers. No compounding, no assumption about future rates., TransferCost, yearly_cost(), _close() (+4 more)

### Community 12 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowImportingTsExtensions, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck (+16 more)

### Community 13 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, test, typecheck, workspaces, mobile, packages/*

### Community 14 - "dependencies"
Cohesion: 0.12
Nodes (17): expo, expo-apple-authentication, expo-font, expo-linking, expo-web-browser, dependencies, expo, expo-apple-authentication (+9 more)

### Community 15 - "9. The scraping engine (core system)"
Cohesion: 0.14
Nodes (14): 9.10 Engine SLOs, 9.11 Schedule, 9.12 Scraper conduct, 9.13 Tech stack, 9.1 Design principles, 9.2 Architecture, 9.3 The adapter framework, 9.4 Multi-strategy extraction (+6 more)

### Community 16 - "AGENTS.md"
Cohesion: 0.33
Nodes (5): Building with EAS, Commands, Expo has changed — do not trust your training data, Navigation & Routing, Rules

### Community 20 - "14. Design system and brand consistency"
Cohesion: 0.17
Nodes (12): 14.10 Accessibility and low-bandwidth use, 14.11 Enforcement, 14.1 Where the app lives, 14.2 Naming, 14.3 Voice and writing rules, 14.4 Shared terminology, 14.5 Visual foundations, 14.6 Core components (+4 more)

### Community 24 - "metrics.tsx"
Cohesion: 0.16
Nodes (13): Breakdown(), Group(), MetricsScreen(), PERIODS, styles, TOOL_LABELS, Segmented(), csvCell() (+5 more)

### Community 29 - "models.py"
Cohesion: 0.18
Nodes (17): AdapterMeta, The adapter framework (PRD 9.3). An adapter holds only what is specific to one…, Manual quotes: strategy 5 of PRD 9.4, and the source for any provider whose…, Engine configuration: routes, the amount grid, conduct limits and the publish-…, RouteConfig, The polite client every adapter fetches through (PRD 9.5 and 9.12). Conduct is…, DeliveryMethod, ErrorClass (+9 more)

### Community 31 - "(tabs)/index.tsx"
Cohesion: 0.06
Nodes (51): AddPriceScreen(), cleanNumber(), Field(), RecentRow(), STATUS_LABEL, styles, cleanAmount(), Compare() (+43 more)

### Community 32 - "messages.ts"
Cohesion: 0.07
Nodes (63): Country, RECEIVING, SENDING, ROUTES, ago(), countryIn(), EN_THE, formatCompare() (+55 more)

### Community 33 - "select-field.tsx"
Cohesion: 0.20
Nodes (11): Flag(), FLAG_SLOT, FLAGS, FlagSlot(), styles, CURRENCY_OPTIONS, normalize(), SelectField() (+3 more)

### Community 34 - "runner.py"
Cohesion: 0.13
Nodes (18): Read a raw response into what the provider said. Raise ValueError if it can't., Archive, Protocol, AdapterError, Exception, ParsedQuote, QuoteRequest, Exactly what came back, before any interpretation. Always archived. (+10 more)

### Community 41 - "FakeAdapter"
Cohesion: 0.29
Nodes (15): run_adapter(), mid(), no_sleep(), FakeAdapter, The smallest honest adapter: one JSON endpoint, one route, one method., respond(), setup(), test_a_changed_response_shape_is_held_even_when_parsing_works() (+7 more)

### Community 45 - "PoliteClient"
Cohesion: 0.16
Nodes (12): PoliteClient, AsyncClient, mock(), test_agreeing_sources_give_a_named_reference_rate(), test_disagreeing_sources_hold_the_pair(), test_one_source_alone_is_not_enough(), parametrize, test_gives_up_after_max_attempts() (+4 more)

### Community 47 - "RemitBridge — Product Requirements Document"
Cohesion: 0.20
Nodes (10): 10. Success metrics, 11. Risks, 12. Milestones, 13. Open questions, 2. Positioning and competitors, 3. Users, 4. Goals and non-goals, 7. Roadmap (post-MVP) (+2 more)

### Community 48 - "rls_smoke.sh"
Cohesion: 0.47
Nodes (4): check(), pg(), post(), rls_smoke.sh script

### Community 49 - "ui.tsx"
Cohesion: 0.15
Nodes (17): styles, EmailStep(), looksLikeEmail(), styles, ChartPoint, styles, CountrySelect(), Button() (+9 more)

### Community 50 - "5. MVP features"
Cohesion: 0.22
Nodes (9): 5.1 Total-cost comparison, 5.2 "Where your money went" breakdown, 5.3 Provider database, 5.4 Methodology page, 5.5 Multilingual UI, 5.6 Basic analytics, 5.7 Migration of existing RemitBridge tools, 5.8 WhatsApp bot (promoted to MVP) (+1 more)

### Community 51 - "6. Corridors"
Cohesion: 0.25
Nodes (8): 6.1 Tier 1 — Launch (4 corridors), 6.2 Tier 2 — First expansion (10 corridors), 6.3 Tier 3 — Broad coverage (14 corridors), 6.4 Special-handling corridors, 6.5 Future sending countries (Phase 2 of coverage), 6.6 Provider universe (per adapter, not per corridor), 6.7 Corridor request system, 6. Corridors

### Community 52 - "ManualAdapter"
Cohesion: 0.27
Nodes (4): RouteSupport, ManualAdapter, Path, (provider_id, request, observation) for every recorded observation.

### Community 54 - "Partner outreach: Seattle-area organizations"
Cohesion: 0.33
Nodes (5): Draft email, Log, Partner outreach: Seattle-area organizations, What to ask for, Who, and why

### Community 58 - "useTheme"
Cohesion: 0.11
Nodes (35): LIMITS, PAYMENT_LABELS, styles, styles, LearnScreen(), styles, GROUPS, styles (+27 more)

### Community 59 - "1. Why this exists"
Cohesion: 0.67
Nodes (3): 1. Why this exists, The end goal, in one sentence, What "success" looks like in 12 months

### Community 60 - "routes.tsx"
Cohesion: 0.18
Nodes (21): BoardRow(), LaunchEmails(), RouteBoard(), STAGES, styles, METHODS, RouteNotCovered(), RouteRequestForm() (+13 more)

### Community 61 - "AppText"
Cohesion: 0.15
Nodes (21): styles, Welcome(), PickRoute(), styles, Stat(), STATS, styles, Why() (+13 more)

### Community 62 - "webhook.test.ts"
Cohesion: 0.21
Nodes (8): clients, createClient(), query(), reset(), Row, tables, env, sent

### Community 63 - "sign-in/index.tsx"
Cohesion: 0.15
Nodes (15): CodeStep(), styles, BENEFITS, SignInOptions(), styles, leaveSignIn(), friendly(), providerEnabled() (+7 more)

### Community 64 - "vercel.json"
Cohesion: 0.40
Nodes (4): cleanUrls, headers, ignoreCommand, rewrites

### Community 66 - "make-icons.py"
Cohesion: 0.40
Nodes (3): mark(), Rebuild the app icons from the website mark: `python3 scripts/make-icons.py`…, Draw the mark so its 64-unit design fits `box` px (the favicon's own 64 grid),…

### Community 67 - "cli.py"
Cohesion: 0.11
Nodes (19): archive_key(), LocalArchive, AsyncClient, Path, The raw archive (PRD 9.1 principle 4): every response, compressed and…, Writes to engine/.archive. For development and tests; gitignored., Uploads to the private `raw-archive` bucket in Supabase Storage., SupabaseArchive (+11 more)

### Community 70 - "make-onboarding-art.py"
Cohesion: 0.23
Nodes (9): band(), ground(), light(), mark(), Render the website's backdrop art for the app: `python3 scripts/make-…, A round pen along the path: no seams where segments meet., The outlined mark, white on transparent, at `scale` px per viewBox unit., The resting light: color at `alpha` in the middle, nothing at 60% of 38rem. (+1 more)

### Community 73 - "track"
Cohesion: 0.14
Nodes (18): GlossaryScreen(), styles, Navigator(), useSessionEvents(), RemitBenchScreen(), Answer, ANSWERS, QUESTIONS (+10 more)

### Community 74 - "devDependencies"
Cohesion: 0.22
Nodes (9): eslint, eslint-config-expo, devDependencies, eslint, eslint-config-expo, @types/react, typescript, typescript (+1 more)

## Knowledge Gaps
- **317 isolated node(s):** `Status: every MVP screen is built; the database needs one push, and there are no prices yet`, `What changed on 2026-09-29`, `What's next (Angad)`, `The shape of the product`, `How to run things` (+312 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `mobile/package.json`, `compute_transfer_cost`, `expo-device`, `expo-glass-effect`, `@expo-google-fonts/plus-jakarta-sans`, `expo-image`, `expo-router`, `expo-splash-screen`, `expo-status-bar`, `expo-symbols`, `@expo/ui`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens`, `react-native-web`, `react-native-worklets`, `@supabase/supabase-js`, `expo-constants`, `expo-sqlite`, `react-native-reanimated`, `expo-system-ui`, `expo-crypto`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `expo-router` connect `sign-in/index.tsx` to `true-cost.tsx`, `expo`, `track`, `ui.tsx`, `useTheme`, `routes.tsx`, `AppText`, `(tabs)/index.tsx`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `useTheme()` connect `useTheme` to `select-field.tsx`, `true-cost.tsx`, `app-tabs.tsx`, `track`, `ui.tsx`, `sign-in/index.tsx`, `metrics.tsx`, `routes.tsx`, `AppText`, `(tabs)/index.tsx`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `Status: every MVP screen is built; the database needs one push, and there are no prices yet`, `What changed on 2026-09-29`, `What's next (Angad)` to the rest of the system?**
  _317 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `RemitBridge App` be split into smaller, more focused modules?**
  _Cohesion score 0.04717853839037928 - nodes in this community are weakly interconnected._
- **Should `true-cost.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06458941901979877 - nodes in this community are weakly interconnected._
- **Should `Quote` be split into smaller, more focused modules?**
  _Cohesion score 0.06359189378057302 - nodes in this community are weakly interconnected._