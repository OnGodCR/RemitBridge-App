# Engine

Collects provider quotes, checks them, and publishes what passes. Python 3.12, managed
with [uv](https://docs.astral.sh/uv/).

```bash
uv sync                          # install
uv run pytest -q                 # engine tests + the Python formula's shared vectors
uv run ruff check .
uv run rb-engine fx              # today's cross-checked mid-market rates
uv run rb-engine run             # run every adapter against a local JSON store
uv run rb-engine run --adapter manual --store supabase   # needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
uv run rb-engine health
uv run rb-engine accept-drift ADAPTER_ID                 # after a person has reviewed a changed response shape
```

`--store local` (the default) writes to `.local/store.json` and `.archive/`, both
gitignored, so the whole pipeline runs with no database and no keys.

## How a run works

`runner.run_adapter` does everything shared, so adapters stay short:

1. Circuit breaker: a paused adapter sends nothing until a cooldown health check passes.
2. Mid-market rates for every currency the run needs (`fx.py`: Frankfurter,
   cross-checked with open.er-api). A currency whose sources disagree is held.
3. For each request, try the adapter's strategies in order through `PoliteClient`
   (per-domain concurrency 1, delays, backoff, no retry on 403/429). Every response is
   archived before it's parsed.
4. Drift check: a changed response shape holds the quote even if parsing worked.
5. Normalize with the one formula (`packages/formula/python`).
6. Publish gate over the batch (`gate.py`): math, ranges, tier consistency, anomaly,
   promo. Outcomes: published, quarantined (held for a person) or rejected (provably wrong).
7. Save the quotes (idempotent on `dedupe_key`), then update the breaker and fingerprints.

Thresholds are in `config.py` and recorded in DECISIONS.md D36.

## Adapters

- `manual`: prices a person read from a provider's public calculator (below).
- `wise`: Wise's own quote from its Comparison API, with Wise's written permission
  (DECISIONS.md D91). Bank transfer in, bank deposit out. The Scrape workflow runs it every
  6 hours; `uv run rb-engine run --adapter wise` runs it into the local store.

Every other Tier 1 provider's terms forbid automated access: see `docs/MANUAL_RESEARCH.md`.

## Adding an adapter

1. Read the provider's robots.txt **and** terms. If either forbids automated access,
   stop: add the provider to `docs/MANUAL_RESEARCH.md` (D4).
2. Subclass `adapters.base.Adapter`: `meta`, `corridors()`, `fetch_quote()`, `parse()`.
   Keep it to provider-specific logic.
3. Save real responses as fixtures under `tests/fixtures/<adapter>/` and test `parse`
   against them.
4. Register it in `registry.py`.

## Manual quotes

Two ways in, one gate:

- **The app** (the usual way): Account → Add a price, for admins. The entry is saved to
  `manual_observations` as pending, and the Manual prices workflow checks it (started by the
  `process-prices` Edge Function, or by its three-hourly schedule). The outcome is written
  back to the row and shows on the same screen (DECISIONS.md D54).
- **A JSON file** in `manual/quotes/`, in the format documented in `adapters/manual.py`,
  then push. The Scrape workflow runs the manual adapter on that push.

Either way, observations must be checked within 6 hours of being made.
