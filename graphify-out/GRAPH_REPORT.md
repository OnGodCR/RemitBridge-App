# Graph Report - RemitBridge-App  (2026-09-28)

## Corpus Check
- 64 files · ~61,210 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 491 nodes · 933 edges · 45 communities (19 shown, 26 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1f5d7dfa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RemitBridge App
- runner.py
- index.tsx
- Quote
- FakeAdapter
- cli.py
- expo
- mobile/package.json
- test_gate.py
- formula/package.json
- include
- compute_transfer_cost
- compilerOptions
- package.json
- dependencies
- index.ts
- AGENTS.md
- eslint.config.js
- adapters/__init__.py
- expo-device
- expo-font
- expo-glass-effect
- @expo-google-fonts/plus-jakarta-sans
- expo-image
- expo-linking
- expo-router
- expo-splash-screen
- expo-status-bar
- expo-symbols
- expo-system-ui
- @expo/ui
- expo-web-browser
- react
- react-dom
- react-native
- react-native-gesture-handler
- react-native-safe-area-context
- react-native-screens
- react-native-web
- react-native-worklets
- @supabase/supabase-js
- mobile/README.md
- remitbridge-engine

## God Nodes (most connected - your core abstractions)
1. `PoliteClient` - 26 edges
2. `RawResponse` - 26 edges
3. `FakeAdapter` - 23 edges
4. `Quote` - 21 edges
5. `run_adapter()` - 21 edges
6. `ManualAdapter` - 18 edges
7. `MidMarketRate` - 18 edges
8. `LocalStore` - 17 edges
9. `Adapter` - 16 edges
10. `QuoteRequest` - 16 edges

## Surprising Connections (you probably didn't know these)
- `normalize()` --calls--> `compute_transfer_cost()`  [EXTRACTED]
  engine/src/remitbridge_engine/normalize.py → packages/formula/python/remitbridge_formula/__init__.py
- `remitbridge-engine` --depends_on--> `remitbridge-formula`  [EXTRACTED]
  engine/pyproject.toml → packages/formula/python/pyproject.toml
- `FakeAdapter` --uses--> `AdapterMeta`  [INFERRED]
  engine/tests/test_runner.py → engine/src/remitbridge_engine/adapters/base.py
- `FakeAdapter` --uses--> `RouteSupport`  [INFERRED]
  engine/tests/test_runner.py → engine/src/remitbridge_engine/adapters/base.py
- `FakeAdapter` --uses--> `Adapter`  [INFERRED]
  engine/tests/test_runner.py → engine/src/remitbridge_engine/adapters/base.py

## Import Cycles
- None detected.

## Communities (45 total, 26 thin omitted)

### Community 0 - "RemitBridge App"
Cohesion: 0.07
Nodes (28): Git, graphify, Keeping the docs current, Open items, Product rules that are also code rules, RemitBridge App, Secrets, Stack (+20 more)

### Community 1 - "runner.py"
Cohesion: 0.06
Nodes (56): ABC, Adapter, AdapterMeta, The adapter framework (PRD 9.3). An adapter holds only what is specific to one…, A hash of the response's structure (keys and types, not values), for drift…, Which routes, delivery methods and payment methods this provider serves., Every quote to ask for this run: supported routes x methods x the amount grid., Ask for one quote with one strategy. Return the raw response untouched. (+48 more)

### Community 2 - "index.tsx"
Cohesion: 0.07
Nodes (45): CompareScreen(), LIMITS, Results(), styles, MethodologyScreen(), styles, AppTabs(), DoesNotTellYou() (+37 more)

### Community 3 - "Quote"
Cohesion: 0.07
Nodes (24): Any, _anomaly(), _is_promotional(), _math_ok(), _range_problems(), The publish gate (PRD 9.7). A quote reaches users only if it passes every…, Sets validation_status, validation_notes and is_promotional on each quote, in…, Index -> problem, for quotes whose markup jumps against their grid neighbour. (+16 more)

### Community 4 - "FakeAdapter"
Cohesion: 0.15
Nodes (24): _er_api(), fetch_mid_market(), _frankfurter(), FxUnavailable, AsyncClient, Exception, Mid-market reference rates from two free sources, cross-checked (PRD 9.7 check…, No trustworthy mid-market rate for a pair right now. (+16 more)

### Community 5 - "cli.py"
Cohesion: 0.12
Nodes (18): archive_key(), LocalArchive, AsyncClient, Path, The raw archive (PRD 9.1 principle 4): every response, compressed and…, Writes to engine/.archive. For development and tests; gitignored., Uploads to the private `raw-archive` bucket in Supabase Storage., SupabaseArchive (+10 more)

### Community 6 - "expo"
Cohesion: 0.08
Nodes (25): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, reactCompiler (+17 more)

### Community 7 - "mobile/package.json"
Cohesion: 0.10
Nodes (19): eslint, eslint-config-expo, devDependencies, eslint, eslint-config-expo, @types/react, typescript, typescript (+11 more)

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
Cohesion: 0.29
Nodes (7): expo, expo-constants, dependencies, expo, expo-constants, react-native-reanimated, react-native-reanimated

### Community 15 - "index.ts"
Cohesion: 0.43
Nodes (4): computeTransferCost(), TransferCost, TransferInput, yearlyCost()

### Community 16 - "AGENTS.md"
Cohesion: 0.33
Nodes (5): Building with EAS, Commands, Expo has changed — do not trust your training data, Navigation & Routing, Rules

## Knowledge Gaps
- **136 isolated node(s):** `remitbridge-engine`, `Expo has changed — do not trust your training data`, `Commands`, `Navigation & Routing`, `Building with EAS` (+131 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PoliteClient` connect `runner.py` to `FakeAdapter`, `cli.py`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `RawResponse` connect `runner.py` to `test_gate.py`, `FakeAdapter`, `cli.py`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `Quote` connect `Quote` to `runner.py`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `PoliteClient` (e.g. with `ErrorClass` and `RunReport`) actually correct?**
  _`PoliteClient` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `RawResponse` (e.g. with `Archive` and `LocalArchive`) actually correct?**
  _`RawResponse` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `FakeAdapter` (e.g. with `Adapter` and `AdapterMeta`) actually correct?**
  _`FakeAdapter` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `Quote` (e.g. with `RunReport` and `LocalStore`) actually correct?**
  _`Quote` has 4 INFERRED edges - model-reasoned connections that need verification._