"""Mid-market reference rates from two free sources, cross-checked (PRD 9.7 check 3).

Frankfurter is the reference, as on the website: it aggregates central-bank reference
rates, needs no key, and returns the date each rate is for. open.er-api.com is the
cross-check. Both are daily references, not live rates; the methodology screen says so.
Verified against the live APIs on 2026-09-28 (INR, MXN, PHP, VND agreed within 0.12%).
Coinbase was tried and dropped: its MXN was 1.4% off both.

If the two disagree by more than FX_MAX_DISAGREEMENT_PCT, Wise is asked as a third source
(D165, 2026-10-12): its comparison API marks its own quote as the mid-market rate, priced
live. Frankfurter's central-bank rate is set once a weekday, so a currency that moves more
than 0.5% after the fixing, or over a weekend, used to hold the whole route for days (Mexico
from Oct 9, India from Oct 12). If Wise agrees with one of the two within the same limit,
that one is used and both checks are kept; if it agrees with neither, or isn't available,
or no longer calls its rate mid-market, the pair is held as before: no quote in it can be
published, because its markup would be measured against a number we can't vouch for.
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime

import httpx

from .config import FX_MAX_DISAGREEMENT_PCT, REQUEST_TIMEOUT_S, USER_AGENT
from .models import MidMarketRate

FRANKFURTER = "https://api.frankfurter.dev/v2/rates"
ER_API = "https://open.er-api.com/v6/latest/{base}"
WISE_COMPARISONS = "https://api.wise.com/v4/comparisons/"


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


async def _wise_mid(client: httpx.AsyncClient, base: str, quote: str) -> float | None:
    """Wise's own rate, only while Wise calls it the mid-market rate with no markup."""
    try:
        r = await client.get(
            WISE_COMPARISONS, params={"sourceCurrency": base, "targetCurrency": quote, "sendAmount": "1000"}
        )
        r.raise_for_status()
        wise = [p for p in r.json().get("providers", []) if p.get("alias") == "wise"]
        rates = {
            float(q["rate"])
            for p in wise
            for q in p.get("quotes", [])
            if q.get("isConsideredMidMarketRate") is True and float(q.get("markup") or 0) == 0
        }
    except (httpx.HTTPError, ValueError, KeyError, TypeError):  # no third opinion: the pair is held
        return None
    return rates.pop() if len(rates) == 1 else None


def _pct(a: float, b: float) -> float:
    return abs(a - b) / a * 100


async def fetch_mid_market(
    base: str, quotes: list[str], client: httpx.AsyncClient | None = None
) -> dict[str, MidMarketRate | FxUnavailable]:
    """One entry per quote currency: a cross-checked rate, or the reason there isn't one."""
    own = client is None
    client = client or httpx.AsyncClient(
        timeout=REQUEST_TIMEOUT_S, headers={"User-Agent": USER_AGENT}
    )
    try:
        return await _cross_check(client, base, quotes)
    finally:
        if own:
            await client.aclose()


async def _cross_check(
    client: httpx.AsyncClient, base: str, quotes: list[str]
) -> dict[str, MidMarketRate | FxUnavailable]:
    ref, chk = await asyncio.gather(
        _frankfurter(client, base, quotes), _er_api(client, base, quotes),
        return_exceptions=True,
    )
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
        chk_rate, chk_date = chk[q]
        disagreement = _pct(ref_rate, chk_rate)
        if disagreement > FX_MAX_DISAGREEMENT_PCT:
            # Asked one pair at a time, and only for pairs in dispute, so Wise sees a handful
            # of requests a run at most.
            wise_rate = await _wise_mid(client, base, q)
            sides = [("Frankfurter", ref_rate, ref_date), ("open.er-api", chk_rate, chk_date)]
            agree = [s for s in sides if wise_rate is not None and _pct(s[1], wise_rate) <= FX_MAX_DISAGREEMENT_PCT]
            if len(agree) != 1:
                out[q] = FxUnavailable(
                    f"{base}/{q} sources disagree by {disagreement:.2f}% "
                    f"(Frankfurter {ref_rate}, open.er-api {chk_rate}, Wise {wise_rate if wise_rate is not None else 'unavailable'})"
                )
                continue
            name, rate, date = agree[0]
            out[q] = MidMarketRate(
                send_currency=base,
                receive_currency=q,
                rate=rate,
                source=name,
                rate_date=date,
                fetched_at=fetched_at,
                checks=(("Frankfurter", ref_rate), ("open.er-api", chk_rate), ("Wise", wise_rate)),
                disagreement_pct=_pct(rate, wise_rate),
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
