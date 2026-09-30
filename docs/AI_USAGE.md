# AI usage log

For the Congressional App Challenge's AI-use disclosure. Each working session with Claude
(Anthropic's AI assistant, running as Claude Code) gets an entry. Each entry lists every file
Claude created or changed and what that file does or what changed in it. It also says what
Angad wrote himself and what Claude didn't do.

The log starts with the CAC work (D69, 2026-09-30). Earlier work on this repo was also done
with Claude. `git log` shows every commit, and commits Claude wrote carry a
`Co-Authored-By: Claude` line.

---

## 2026-09-30: Phase 1, the gap report

**What Claude did:** read the repo (formula package, schema and migrations, quote storage,
TrueCost and Compare screens, breakdown components, WhatsApp bot and webhook, design tokens,
CI, docs) and wrote a report on what exists and what's missing for each CAC feature. No
feature code was written.

**Files created**

- `docs/cac-gap-report.md`: says, for each of the eight CAC features, whether it already
  exists, partly exists (and what's missing) or hasn't been started. It also lists 15
  decisions needed before Phase 2, each with a recommendation. The main ones: on-device OCR
  instead of in-browser OCR, redaction style, a string catalogue for English and Hindi, adding
  the 1% tax to the one formula, what "amount sent" means on a receipt, where the LLM runs,
  server-side redaction for WhatsApp, where the result page lives, and quote matching.
- `docs/AI_USAGE.md`: this log.

**Files changed**

- `DECISIONS.md`: added D69 (receipt scanning is in scope for the CAC, replacing D30's "no
  receipt scanning for now"; Angad writes the parser's extraction heuristics himself).
- `CLAUDE.md`: added the open item "CAC receipt scanner (D69), Phases 2–6".
- `HANDOFF.md`: added a "What changed on 2026-09-30" section and updated the "Last updated"
  date.
- `README.md`: added the gap report and this log to the Docs table.

**Written by Angad, not Claude:** the feature brief and phase plan the report is checked
against.

**Not done by Claude:** Claude couldn't open the IRS proposed regulations on the remittance
tax from its sandbox (network blocked). The tax base in the report is marked unverified.
