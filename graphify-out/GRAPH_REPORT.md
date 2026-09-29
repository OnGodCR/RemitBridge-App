# Graph Report - RemitBridge-App  (2026-09-28)

## Corpus Check
- 86 files · ~69,152 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 602 nodes · 1153 edges · 57 communities (26 shown, 31 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.54)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e5843ccf`
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
- normalize.py
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
- Adapter
- delete-account/index.ts
- expo-apple-authentication
- expo-constants
- expo-sqlite
- react-native-reanimated

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 34 edges
2. `RawResponse` - 21 edges
3. `run_adapter()` - 21 edges
4. `Quote` - 19 edges
5. `PoliteClient` - 19 edges
6. `ManualAdapter` - 16 edges
7. `MidMarketRate` - 15 edges
8. `LocalStore` - 15 edges
9. `track()` - 15 edges
10. `make()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `normalize()` --calls--> `compute_transfer_cost()`  [EXTRACTED]
  engine/src/remitbridge_engine/normalize.py → packages/formula/python/remitbridge_formula/__init__.py
- `atAmount()` --calls--> `computeTransferCost()`  [EXTRACTED]
  mobile/src/lib/quotes.ts → packages/formula/src/index.ts
- `ManualAdapter` --uses--> `Adapter`  [INFERRED]
  engine/src/remitbridge_engine/adapters/manual.py → engine/src/remitbridge_engine/adapters/base.py
- `ManualAdapter` --uses--> `AdapterMeta`  [INFERRED]
  engine/src/remitbridge_engine/adapters/manual.py → engine/src/remitbridge_engine/adapters/base.py
- `FxUnavailable` --uses--> `MidMarketRate`  [INFERRED]
  engine/src/remitbridge_engine/fx.py → engine/src/remitbridge_engine/models.py

## Import Cycles
- None detected.

## Communities (57 total, 31 thin omitted)

### Community 0 - "RemitBridge App"
Cohesion: 0.05
Nodes (37): Git, graphify, Keeping the docs current, Open items, Product rules that are also code rules, RemitBridge App, Secrets, Stack (+29 more)

### Community 1 - "models.py"
Cohesion: 0.16
Nodes (18): AdapterMeta, The adapter framework (PRD 9.3). An adapter holds only what is specific to one…, Manual quotes: strategy 5 of PRD 9.4, and the source for any provider whose…, Engine configuration: routes, the amount grid, conduct limits and the publish-…, RouteConfig, The polite client every adapter fetches through (PRD 9.5 and 9.12). Conduct is…, RemitBridge scraping engine. See engine/README.md., DeliveryMethod (+10 more)

### Community 2 - "(tabs)/index.tsx"
Cohesion: 0.06
Nodes (68): plugins, Navigator(), styles, Welcome(), PickRoute(), styles, CodeStep(), styles (+60 more)

### Community 3 - "Quote"
Cohesion: 0.07
Nodes (25): Any, _anomaly(), _is_promotional(), _math_ok(), _range_problems(), The publish gate (PRD 9.7). A quote reaches users only if it passes every…, Sets validation_status, validation_notes and is_promotional on each quote, in…, Index -> problem, for quotes whose markup jumps against their grid neighbour. (+17 more)

### Community 4 - "fetch_mid_market"
Cohesion: 0.24
Nodes (13): _er_api(), fetch_mid_market(), _frankfurter(), FxUnavailable, AsyncClient, Exception, Mid-market reference rates from two free sources, cross-checked (PRD 9.7 check…, No trustworthy mid-market rate for a pair right now. (+5 more)

### Community 5 - "RawResponse"
Cohesion: 0.16
Nodes (12): Archive, archive_key(), LocalArchive, AsyncClient, Path, Protocol, The raw archive (PRD 9.1 principle 4): every response, compressed and…, Writes to engine/.archive. For development and tests; gitignored. (+4 more)

### Community 6 - "expo"
Cohesion: 0.08
Nodes (24): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, reactCompiler (+16 more)

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
Cohesion: 0.10
Nodes (29): cleanAmount(), CompareScreen(), Results(), CostBreakdownBar(), FreshnessBadge(), QuoteCard(), SOURCE_LABEL, styles (+21 more)

### Community 31 - "normalize.py"
Cohesion: 0.50
Nodes (4): ParsedQuote, What the provider said, in its own terms. The adapter's `parse` returns this., normalize(), ParsedQuote -> Quote. The cost figures come from the one formula and nowhere…

### Community 41 - "run_adapter"
Cohesion: 0.12
Nodes (27): Archive, datetime, _breaker_open(), _fetch_and_parse(), Adapter, Try each strategy in order; archive every response, including ones that fail to…, run_adapter(), RunReport (+19 more)

### Community 45 - "PoliteClient"
Cohesion: 0.16
Nodes (10): AdapterError, PoliteClient, AsyncClient, Exception, parametrize, test_gives_up_after_max_attempts(), test_never_retries_when_told_to_stop(), test_retries_transient_errors_then_succeeds() (+2 more)

### Community 48 - "rls_smoke.sh"
Cohesion: 0.47
Nodes (4): check(), pg(), post(), rls_smoke.sh script

### Community 49 - "cli.py"
Cohesion: 0.29
Nodes (10): AsyncClient, _accept_drift(), _backends(), _fx(), _health(), main(), rb-engine: the command the scheduled workflows run. rb-engine run [--adapter ID…, _run() (+2 more)

### Community 50 - "ManualAdapter"
Cohesion: 0.21
Nodes (5): RouteSupport, ManualAdapter, Path, (provider_id, request, observation) for every recorded observation., QuoteRequest

### Community 52 - "Adapter"
Cohesion: 0.17
Nodes (9): ABC, Adapter, A hash of the response's structure (keys and types, not values), for drift…, Which routes, delivery methods and payment methods this provider serves., Every quote to ask for this run: supported routes x methods x the amount grid., Ask for one quote with one strategy. Return the raw response untouched., Read a raw response into what the provider said. Raise ValueError if it can't., One cheap known-good request. Default: the first quote this adapter would ask… (+1 more)

## Knowledge Gaps
- **161 isolated node(s):** `Talking to Angad`, `Keeping the docs current`, `Open items`, `Product rules that are also code rules`, `Words and voice` (+156 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `plugins` connect `(tabs)/index.tsx` to `expo`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `RawResponse` connect `RawResponse` to `models.py`, `test_gate.py`, `ManualAdapter`, `Adapter`, `normalize.py`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `RawResponse` (e.g. with `Archive` and `LocalArchive`) actually correct?**
  _`RawResponse` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Quote` (e.g. with `LocalStore` and `Store`) actually correct?**
  _`Quote` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Talking to Angad`, `Keeping the docs current`, `Open items` to the rest of the system?**
  _161 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `RemitBridge App` be split into smaller, more focused modules?**
  _Cohesion score 0.048625792811839326 - nodes in this community are weakly interconnected._
- **Should `(tabs)/index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.055860805860805864 - nodes in this community are weakly interconnected._