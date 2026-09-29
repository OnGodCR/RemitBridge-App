"""One adapter, one run: the shared machinery every adapter gets for free (PRD 9.3-9.6).

    circuit breaker -> mid-market rates -> for each request: strategies in order ->
    archive -> drift check -> parse -> normalise -> publish gate (whole batch) ->
    save -> update breaker and fingerprints

Failures are isolated: an exception in one adapter ends that adapter's run and nothing
else (PRD 9.1 principle 3).
"""

from __future__ import annotations

import logging
import traceback
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from urllib.parse import urlsplit

from . import config as C
from .adapters.base import Adapter
from .adapters.manual import ManualAdapter
from .archive import Archive
from .fx import FxUnavailable, fetch_mid_market
from .gate import run_gate
from .http import AdapterError, PoliteClient
from .models import (
    ErrorClass,
    MidMarketRate,
    ParsedQuote,
    Quote,
    QuoteRequest,
    RawResponse,
    RunStatus,
    ValidationStatus,
)
from .normalize import normalize
from .store import Store

log = logging.getLogger(__name__)


@dataclass
class RunReport:
    adapter_id: str
    status: RunStatus
    run_id: str | None = None
    published: int = 0
    quarantined: int = 0
    rejected: int = 0
    failed_requests: int = 0
    skipped: int = 0  # manual observations too old to match a mid-market rate
    error_class: ErrorClass | None = None
    errors: list[str] = field(default_factory=list)

    def line(self) -> str:
        s = (
            f"{self.adapter_id}: {self.status} | published {self.published}, "
            f"quarantined {self.quarantined}, rejected {self.rejected}, "
            f"failed requests {self.failed_requests}"
        )
        if self.skipped:
            s += f", skipped {self.skipped} (observed too long ago)"
        if self.error_class:
            s += f" | {self.error_class}: {self.errors[0] if self.errors else ''}"
        return s


def _breaker_open(state: dict, now: datetime) -> bool:
    until = state.get("breaker_open_until")
    return bool(until) and datetime.fromisoformat(until) > now


async def run_adapter(
    adapter: Adapter,
    *,
    store: Store,
    archive: Archive,
    http: PoliteClient,
    mid_rates: dict[str, MidMarketRate | FxUnavailable] | None = None,
) -> RunReport:
    meta = adapter.meta
    now = datetime.now(UTC)
    state = await store.get_adapter_state(meta.adapter_id)

    # --- Circuit breaker: paused adapters send nothing until a cooldown health check passes.
    if state.get("breaker_open_until"):
        if _breaker_open(state, now):
            return RunReport(meta.adapter_id, RunStatus.SKIPPED, errors=["circuit breaker open"])
        try:
            await adapter.health_check(http)
        except Exception as e:  # noqa: BLE001 - any failure keeps the breaker shut
            await store.set_adapter_state(
                meta.adapter_id,
                breaker_open_until=(now + timedelta(seconds=C.BREAKER_COOLDOWN_S)).isoformat(),
            )
            return RunReport(meta.adapter_id, RunStatus.SKIPPED, errors=[f"health check failed: {e}"])
        await store.set_adapter_state(meta.adapter_id, breaker_open_until=None, consecutive_failures=0)

    if meta.website:
        http.set_min_delay(urlsplit(meta.website).hostname or meta.website, meta.min_delay_s)

    run_id = await store.create_run(meta.adapter_id, meta.version, adapter.strategies[0])
    report = RunReport(meta.adapter_id, RunStatus.SUCCESS, run_id=run_id)

    # --- Mid-market rates for every pair this run needs, fetched now so markup uses a
    # matching timestamp (PRD 9.11).
    if isinstance(adapter, ManualAdapter):
        work = [(pid, req, obs) for pid, req, obs in adapter.observations()]
    else:
        work = [(meta.provider_id, req, None) for req in adapter.requests()]
    pairs = sorted({(req.send_currency, req.receive_currency) for _, req, _ in work})
    if mid_rates is None:
        mid_rates = {}
        for base in sorted({b for b, _ in pairs}):
            mid_rates.update(await fetch_mid_market(base, [q for b, q in pairs if b == base]))
        await store.save_mid_market([m for m in mid_rates.values() if isinstance(m, MidMarketRate)])

    quotes: list[Quote] = []
    quote_obs: list[dict | None] = []  # the observation behind each quote (manual only)
    promo_texts: list[str | None] = []
    # Outcomes for observations entered in the app, written back to their rows after the
    # quotes are saved. An observation that couldn't be checked yet (no mid-market rate)
    # gets no outcome and stays pending for the next run.
    outcomes: list[tuple[int, str, list[str]]] = []

    def outcome(obs: dict | None, status: str, notes: list[str]) -> None:
        if obs and obs.get("row_id") is not None:
            outcomes.append((int(obs["row_id"]), status, notes))

    drifted: set[int] = set()
    fingerprints = dict(state.get("fingerprints") or {})
    blocked = False

    for provider_id, req, obs in work:
        mid = mid_rates.get(req.receive_currency)
        if not isinstance(mid, MidMarketRate):
            report.failed_requests += 1
            report.error_class = report.error_class or ErrorClass.FX_UNAVAILABLE
            report.errors.append(str(mid) if mid else f"no mid-market rate for {req.receive_currency}")
            continue
        try:
            raw, parsed = await _fetch_and_parse(adapter, http, req, obs, run_id, archive)
        except AdapterError as e:
            report.failed_requests += 1
            report.error_class = e.error_class
            report.errors.append(str(e))
            if e.error_class == ErrorClass.BLOCKED:
                blocked = True
                break  # stop asking a site that told us to stop
            continue
        except Exception as e:  # noqa: BLE001 - one bad request never ends the run
            report.failed_requests += 1
            report.error_class = ErrorClass.PARSE_ERROR
            report.errors.append(f"{req}: {e!r}")
            log.debug(traceback.format_exc())
            outcome(obs, ValidationStatus.REJECTED, [f"could not read the entry: {e}"])
            continue

        if isinstance(adapter, ManualAdapter):
            age = (mid.fetched_at - parsed.captured_at).total_seconds()
            if age > C.MANUAL_QUOTE_MAX_AGE_S:
                # Not a failure: an old file in the folder. Skipped, and said so.
                report.skipped += 1
                msg = (
                    f"manual quote {provider_id} {req.route_id} {req.send_amount:g} observed "
                    f"{age / 3600:.1f}h before the mid-market fetch; re-observe it"
                )
                report.errors.append(msg)
                outcome(obs, "skipped", [msg])
                continue

        q = normalize(parsed, req, mid, provider_id=provider_id, source=adapter.source,
                      raw=raw, run_id=run_id)

        fp = adapter.fingerprint(raw)
        if fp is not None:
            known = fingerprints.get(raw.strategy)
            if known is None:
                fingerprints[raw.strategy] = fp  # first sight: this becomes the baseline
            elif fp != known:
                drifted.add(len(quotes))
                report.error_class = ErrorClass.SCHEMA_DRIFT
                report.errors.append(f"response shape changed for {raw.strategy}: {known} -> {fp}")

        quotes.append(q)
        quote_obs.append(obs)
        promo_texts.append(parsed.promo_text)

    # --- Publish gate over the whole batch (tier consistency needs the full grid).
    since = now - timedelta(seconds=C.ANOMALY_LOOKBACK_S)
    history = [
        await store.recent_total_cost_pct(q.provider_id, q.route_id, q.send_amount,
                                          q.delivery_method, since)
        for q in quotes
    ]
    run_gate(quotes, promo_texts, history)
    for i in drifted:
        # A silent change is the most dangerous kind of break (PRD 9.6): hold even if
        # parsing "succeeded", until a person accepts the new shape.
        if quotes[i].validation_status == ValidationStatus.PUBLISHED:
            quotes[i].validation_status = ValidationStatus.QUARANTINED
        quotes[i].validation_notes.append("drift: response shape changed; held until accepted")

    await store.save_quotes(quotes)
    for q, obs in zip(quotes, quote_obs, strict=True):
        outcome(obs, q.validation_status, list(q.validation_notes))
    if outcomes:
        await store.record_manual_outcomes(outcomes)

    report.published = sum(q.validation_status == ValidationStatus.PUBLISHED for q in quotes)
    report.quarantined = sum(q.validation_status == ValidationStatus.QUARANTINED for q in quotes)
    report.rejected = sum(q.validation_status == ValidationStatus.REJECTED for q in quotes)
    if blocked:
        report.status = RunStatus.BLOCKED
    elif not quotes and work:
        report.status = RunStatus.FAILED
    elif report.failed_requests or report.rejected:
        report.status = RunStatus.PARTIAL

    # --- Breaker bookkeeping. Blocked opens it at once: stop, log, reach out (PRD 9.12).
    failures = 0 if report.status in (RunStatus.SUCCESS, RunStatus.PARTIAL) else (
        int(state.get("consecutive_failures") or 0) + 1
    )
    new_state: dict = {"consecutive_failures": failures, "last_run_at": now.isoformat()}
    if report.status in (RunStatus.SUCCESS, RunStatus.PARTIAL):
        new_state["last_success_at"] = now.isoformat()
    if blocked or failures >= C.BREAKER_FAILURE_THRESHOLD:
        new_state["breaker_open_until"] = (now + timedelta(seconds=C.BREAKER_COOLDOWN_S)).isoformat()
    # Only a first-sight baseline is stored automatically; a changed shape keeps the old
    # fingerprint until a person accepts it (`rb-engine accept-drift`).
    new_state["fingerprints"] = fingerprints
    await store.set_adapter_state(meta.adapter_id, **new_state)

    await store.finish_run(
        run_id,
        status=report.status,
        quotes_captured=len(quotes),
        quotes_published=report.published,
        quotes_rejected=report.rejected + report.quarantined,
        failed_requests=report.failed_requests,
        error_class=report.error_class,
        error_message="; ".join(report.errors[:5]) or None,
    )
    return report


async def _fetch_and_parse(
    adapter: Adapter, http: PoliteClient, req: QuoteRequest, obs: dict | None,
    run_id: str, archive: Archive,
) -> tuple[RawResponse, ParsedQuote]:
    """Try each strategy in order; archive every response, including ones that fail to parse."""
    if isinstance(adapter, ManualAdapter):
        raw = adapter.fetch_observation(obs or {})
        raw.archive_path = await archive.save(run_id, adapter.meta.adapter_id, "manual", raw)
        return raw, adapter.parse(raw, req)

    last: Exception | None = None
    for strategy in adapter.strategies:
        try:
            raw = await adapter.fetch_quote(http, strategy, req)
            raw.strategy = strategy
            label = f"{req.route_id}_{req.send_amount:g}_{req.delivery_method}"
            raw.archive_path = await archive.save(run_id, adapter.meta.adapter_id, label, raw)
            return raw, adapter.parse(raw, req)
        except AdapterError as e:
            if e.error_class == ErrorClass.BLOCKED:
                raise
            last = e
        except (ValueError, KeyError, TypeError) as e:
            last = AdapterError(ErrorClass.PARSE_ERROR, f"{strategy}: {e!r}")
    assert last is not None
    raise last
