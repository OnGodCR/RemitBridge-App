# Graph Report - RemitBridge-App  (2026-09-28)

## Corpus Check
- 7 files · ~11,397 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 30 nodes · 31 edges · 5 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `11a33005`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RemitBridge App
- Handoff
- RemitBridge
- Decisions

## God Nodes (most connected - your core abstractions)
1. `RemitBridge App` - 10 edges
2. `Handoff` - 7 edges
3. `RemitBridge` - 6 edges
4. `Decisions` - 3 edges
5. `Talking to Angad` - 1 edges
6. `Keeping the docs current` - 1 edges
7. `Open items` - 1 edges
8. `Product rules that are also code rules` - 1 edges
9. `Words and voice` - 1 edges
10. `Stack` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities (5 total, 0 thin omitted)

### Community 0 - "RemitBridge App"
Cohesion: 0.20
Nodes (10): Git, graphify, Keeping the docs current, Open items, Product rules that are also code rules, RemitBridge App, Secrets, Stack (+2 more)

### Community 1 - "Handoff"
Cohesion: 0.29
Nodes (7): Handoff, Known gaps between the PRD and the decisions, Status: pre-build, The shape of the product (as of D25), Third round of questions (asked 2026-09-28, not yet answered), What exists, What's next

### Community 2 - "RemitBridge"
Cohesion: 0.33
Nodes (6): Docs, Launch routes, Planned layout, RemitBridge, Setup, Status

### Community 4 - "Decisions"
Cohesion: 0.67
Nodes (3): 2026-09-28: first round, after reading PRD v0.4, 2026-09-28: second round, Decisions

## Knowledge Gaps
- **22 isolated node(s):** `Talking to Angad`, `Keeping the docs current`, `Open items`, `Product rules that are also code rules`, `Words and voice` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemitBridge App` connect `RemitBridge App` to `CLAUDE.md`?**
  _High betweenness centrality (0.532) - this node is a cross-community bridge._
- **Why does `Handoff` connect `Handoff` to `CLAUDE.md`?**
  _High betweenness centrality (0.377) - this node is a cross-community bridge._
- **Why does `RemitBridge` connect `RemitBridge` to `CLAUDE.md`?**
  _High betweenness centrality (0.320) - this node is a cross-community bridge._
- **What connects `Talking to Angad`, `Keeping the docs current`, `Open items` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._