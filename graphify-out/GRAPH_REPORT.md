# Graph Report - RemitBridge-App  (2026-09-28)

## Corpus Check
- 88 files · ~70,205 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 610 nodes · 1190 edges · 58 communities (26 shown, 32 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.54)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `acac6e0c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RemitBridge App
- models.py
- (tabs)/index.tsx
- Quote
- fetch_mid_market
- RawResponse
- expo
- mobile/package.json
- test_gate.py
- formula/package.json
- include
- compute_transfer_cost
- compilerOptions
- package.json
- dependencies
- @remitbridge/formula
- AGENTS.md
- eslint.config.js
- adapters/__init__.py
- expo-device
- expo-font
- expo-glass-effect
- @expo-google-fonts/plus-jakarta-sans
- expo-image
- quote-card.tsx
- expo-router
- expo-splash-screen
- expo-status-bar
- expo-symbols
- expo-system-ui
- @expo/ui
- QuoteRequest
- react
- react-dom
- react-native
- react-native-gesture-handler
- react-native-safe-area-context
- react-native-screens
- react-native-web
- react-native-worklets
- @supabase/supabase-js
- run_adapter
- remitbridge-engine
- PoliteClient
- AsyncClient
- datetime
- rls_smoke.sh
- cli.py
- ManualAdapter
- app-tabs.tsx
- base.py
- delete-account/index.ts
- expo-apple-authentication
- expo-constants
- expo-sqlite
- react-native-reanimated

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 39 edges
2. `RawResponse` - 21 edges
3. `run_adapter()` - 21 edges
4. `Quote` - 19 edges
5. `PoliteClient` - 19 edges
6. `track()` - 17 edges
7. `ManualAdapter` - 16 edges
8. `AppText()` - 15 edges
9. `MidMarketRate` - 15 edges
10. `LocalStore` - 15 edges

## Surprising Connections (you probably didn't know these)
- `normalize()` --calls--> `compute_transfer_cost()`  [EXTRACTED]
  engine/src/remitbridge_engine/normalize.py → packages/formula/python/remitbridge_formula/__init__.py
- `ManualAdapter` --uses--> `AdapterMeta`  [INFERRED]
  engine/src/remitbridge_engine/adapters/manual.py → engine/src/remitbridge_engine/adapters/base.py
- `PoliteClient` --uses--> `ErrorClass`  [INFERRED]
  engine/src/remitbridge_engine/http.py → engine/src/remitbridge_engine/models.py
- `FxUnavailable` --uses--> `MidMarketRate`  [INFERRED]
  engine/src/remitbridge_engine/fx.py → engine/src/remitbridge_engine/models.py
- `setup()` --calls--> `LocalStore`  [INFERRED]
  engine/tests/test_runner.py → engine/src/remitbridge_engine/store.py

## Import Cycles
- None detected.

## Communities (58 total, 32 thin omitted)

### Community 0 - "RemitBridge App"
Cohesion: 0.05
Nodes (37): Git, graphify, Keeping the docs current, Open items, Product rules that are also code rules, RemitBridge App, Secrets, Stack (+29 more)

### Community 1 - "models.py"
Cohesion: 0.14
Nodes (14): Engine configuration: routes, the amount grid, conduct limits and the publish-…, RouteConfig, AdapterError, AsyncClient, Exception, The polite client every adapter fetches through (PRD 9.5 and 9.12). Conduct is…, RemitBridge scraping engine. See engine/README.md., DeliveryMethod (+6 more)

### Community 2 - "(tabs)/index.tsx"
Cohesion: 0.06
Nodes (74): Navigator(), styles, Welcome(), PickRoute(), styles, CodeStep(), styles, EmailStep() (+66 more)

### Community 3 - "Quote"
Cohesion: 0.07
Nodes (25): Any, _anomaly(), _is_promotional(), _math_ok(), _range_problems(), The publish gate (PRD 9.7). A quote reaches users only if it passes every…, Sets validation_status, validation_notes and is_promotional on each quote, in…, Index -> problem, for quotes whose markup jumps against their grid neighbour. (+17 more)

### Community 4 - "fetch_mid_market"
Cohesion: 0.16
Nodes (18): _er_api(), fetch_mid_market(), _frankfurter(), FxUnavailable, AsyncClient, Exception, Mid-market reference rates from two free sources, cross-checked (PRD 9.7 check…, No trustworthy mid-market rate for a pair right now. (+10 more)

### Community 5 - "RawResponse"
Cohesion: 0.16
Nodes (12): Archive, archive_key(), LocalArchive, AsyncClient, Path, Protocol, The raw archive (PRD 9.1 principle 4): every response, compressed and…, Writes to engine/.archive. For development and tests; gitignored. (+4 more)

### Community 6 - "expo"
Cohesion: 0.07
Nodes (27): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, reactCompiler (+19 more)

### Community 7 - "mobile/package.json"
Cohesion: 0.10
Nodes (19): eslint, eslint-config-expo, devDependencies, eslint, eslint-config-expo, @types/react, typescript, main (+11 more)

### Community 8 - "test_gate.py"
Cohesion: 0.28
Nodes (14): mid(), no_sleep(), gate(), make(), test_a_clean_quote_publishes(), test_captured_at_defaults_to_now(), test_huge_fee_is_held(), test_markup_over_15_percent_is_held() (+6 more)

### Community 9 - "formula/package.json"
Cohesion: 0.13
Nodes (14): devDependencies, typescript, vitest, typescript, main, name, private, scripts (+6 more)

### Community 10 - "include"
Cohesion: 0.15
Nodes (12): compilerOptions, paths, strict, extends, include, @/assets/*, ./assets/*, expo-env.d.ts (+4 more)

### Community 11 - "compute_transfer_cost"
Cohesion: 0.24
Nodes (10): compute_transfer_cost(), The one total-cost formula (the TrueCost method, PRD 14.4). Python twin of…, S sent, F fee (sending currency), Q quoted and M mid-market rates (receiving…, Twelve identical transfers. No compounding, no assumption about future rates., TransferCost, yearly_cost(), _close(), parametrize (+2 more)

### Community 12 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck, strict (+3 more)

### Community 13 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, test, typecheck, workspaces, mobile, packages/*

### Community 14 - "dependencies"
Cohesion: 0.22
Nodes (9): expo, expo-crypto, expo-linking, expo-web-browser, dependencies, expo, expo-crypto, expo-linking (+1 more)

### Community 16 - "AGENTS.md"
Cohesion: 0.33
Nodes (5): Building with EAS, Commands, Expo has changed — do not trust your training data, Navigation & Routing, Rules

### Community 24 - "quote-card.tsx"
Cohesion: 0.11
Nodes (25): Results(), CostBreakdownBar(), FreshnessBadge(), QuoteCard(), SOURCE_LABEL, styles, checkedAgo(), money() (+17 more)

### Community 31 - "QuoteRequest"
Cohesion: 0.31
Nodes (7): Read a raw response into what the provider said. Raise ValueError if it can't., ParsedQuote, QuoteRequest, What the provider said, in its own terms. The adapter's `parse` returns this., Source, normalize(), ParsedQuote -> Quote. The cost figures come from the one formula and nowhere…

### Community 41 - "run_adapter"
Cohesion: 0.12
Nodes (27): Archive, datetime, _breaker_open(), _fetch_and_parse(), Adapter, Try each strategy in order; archive every response, including ones that fail to…, run_adapter(), RunReport (+19 more)

### Community 45 - "PoliteClient"
Cohesion: 0.21
Nodes (6): Ask for one quote with one strategy. Return the raw response untouched., One cheap known-good request. Default: the first quote this adapter would ask…, PoliteClient, PRD 9.4, in fallback order., Strategy, Response

### Community 48 - "rls_smoke.sh"
Cohesion: 0.47
Nodes (4): check(), pg(), post(), rls_smoke.sh script

### Community 49 - "cli.py"
Cohesion: 0.36
Nodes (9): AsyncClient, _accept_drift(), _backends(), _fx(), _health(), main(), rb-engine: the command the scheduled workflows run. rb-engine run [--adapter ID…, _run() (+1 more)

### Community 50 - "ManualAdapter"
Cohesion: 0.24
Nodes (3): ManualAdapter, Path, (provider_id, request, observation) for every recorded observation.

### Community 52 - "base.py"
Cohesion: 0.18
Nodes (12): ABC, Adapter, AdapterMeta, The adapter framework (PRD 9.3). An adapter holds only what is specific to one…, A hash of the response's structure (keys and types, not values), for drift…, Which routes, delivery methods and payment methods this provider serves., Every quote to ask for this run: supported routes x methods x the amount grid., RouteSupport (+4 more)

## Knowledge Gaps
- **163 isolated node(s):** `Talking to Angad`, `Keeping the docs current`, `Open items`, `Product rules that are also code rules`, `Words and voice` (+158 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `expo-router` connect `(tabs)/index.tsx` to `expo`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `plugins` connect `expo` to `(tabs)/index.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `RawResponse` (e.g. with `Archive` and `LocalArchive`) actually correct?**
  _`RawResponse` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Quote` (e.g. with `LocalStore` and `Store`) actually correct?**
  _`Quote` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Talking to Angad`, `Keeping the docs current`, `Open items` to the rest of the system?**
  _163 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `RemitBridge App` be split into smaller, more focused modules?**
  _Cohesion score 0.048625792811839326 - nodes in this community are weakly interconnected._
- **Should `models.py` be split into smaller, more focused modules?**
  _Cohesion score 0.13852813852813853 - nodes in this community are weakly interconnected._