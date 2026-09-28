"""Mid-market reference rates from two free sources, cross-checked (PRD 9.7 check 3).

Frankfurter is the reference, as on the website: it aggregates central-bank reference
rates, needs no key, and returns the date each rate is for. open.er-api.com is the
cross-check. Both are daily references, not live rates; the methodology screen says so.
Verified against the live APIs on 2026-09-28 (INR, MXN, PHP, VND agreed within 0.12%).
Coinbase was tried and dropped: its MXN was 1.4% off both.

If the two disagree by more than FX_MAX_DISAGREEMENT_PCT, the pair is held: no quote in
it can be published, because its markup would be measured against a number we can't
vouch for.
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime

import httpx

from .config import FX_MAX_DISAGREEMENT_PCT, REQUEST_TIMEOUT_S, USER_AGENT
from .models import MidMarketRate

FRANKFURTER = "https://api.frankfurter.dev/v2/rates"
ER_API = "https://open.er-api.com/v6/latest/{base}"


class FxUnavailable(Exception):
    """No trustworthy mid-market rate for a pair right now."""


async def _frankfurter(client: httpx.AsyncClient, base: str, quotes: list[str]) -> dict:
    r = await client.get(FRANKFURTER, params={"base": base, "quotes": ",".join(quotes)})
    r.raise_for_status()
    return {row["quote"]: (float(row["rate"]), row["date"]) for row in r.json()}


async def _er_api(client: httpx.AsyncClient, base: str, quotes: list[str]) -> dict:
    r = await client.get(ER_API.format(base=base))
    r.raise_for_status()
    body = r.json()
    if body.get("result") != "success":
        raise httpx.HTTPError(f"open.er-api returned {body.get('result')}")
    date = datetime.fromtimestamp(body["time_last_update_unix"], UTC).date().isoformat()
    return {q: (float(body["rates"][q]), date) for q in quotes if q in body["rates"]}


async def fetch_mid_market(
    base: str, quotes: list[str], client: httpx.AsyncClient | None = None
) -> dict[str, MidMarketRate | FxUnavailable]:
    """One entry per quote currency: a cross-checked rate, or the reason there isn't one."""
    own = client is None
    client = client or httpx.AsyncClient(
        timeout=REQUEST_TIMEOUT_S, headers={"User-Agent": USER_AGENT}
    )
    try:
        ref, chk = await asyncio.gather(
            _frankfurter(client, base, quotes), _er_api(client, base, quotes),
            return_exceptions=True,
        )
    finally:
        if own:
            await client.aclose()

    fetched_at = datetime.now(UTC)
    out: dict[str, MidMarketRate | FxUnavailable] = {}
    for q in quotes:
        if isinstance(ref, BaseException) or q not in ref:
            out[q] = FxUnavailable(f"Frankfurter has no {base}/{q}: {ref if isinstance(ref, BaseException) else 'missing'}")
            continue
        if isinstance(chk, BaseException) or q not in chk:
            # One source is not a cross-check. Hold rather than trust it alone.
            out[q] = FxUnavailable(f"open.er-api has no {base}/{q}, so Frankfurter can't be cross-checked")
            continue
        ref_rate, ref_date = ref[q]
        chk_rate, _ = chk[q]
        disagreement = abs(ref_rate - chk_rate) / ref_rate * 100
        if disagreement > FX_MAX_DISAGREEMENT_PCT:
            out[q] = FxUnavailable(
                f"{base}/{q} sources disagree by {disagreement:.2f}% "
                f"(Frankfurter {ref_rate}, open.er-api {chk_rate})"
            )
            continue
        out[q] = MidMarketRate(
            send_currency=base,
            receive_currency=q,
            rate=ref_rate,
            source="Frankfurter",
            rate_date=ref_date,
            fetched_at=fetched_at,
            checks=(("Frankfurter", ref_rate), ("open.er-api", chk_rate)),
            disagreement_pct=disagreement,
        )
    return out
