"""Wise, through its public Comparison API (DECISIONS.md D91).

Wise's website terms forbid automated access to wise.com, so Wise stayed manual (D52)
until we asked. On 2026-09-30 Simon Bruins (simon.bruins@wise.com) answered our permission
request: the Comparison API's current documentation "is correct and you can use it. If you
are a considerate user it shouldn't be a problem." This adapter uses that API and nothing
else, never wise.com's pages.

The API returns a list of providers. Only Wise's own entry is used. The other providers'
figures are Wise's estimates of its competitors (their docs say so), not prices those
providers published, so they are never read, stored or shown. The whole response is still
archived, as every response is (PRD 9.9).

Wise's comparison quotes are for a bank-transfer pay-in and a bank payout only, so every
quote here is a bank deposit paid from a bank account. Card pay-in costs more and would
need a different source.
"""

from __future__ import annotations

import hashlib
import json
import math
import re
from datetime import UTC, datetime, timedelta

from ..config import ROUTES_BY_ID
from ..http import PoliteClient
from ..models import DeliveryMethod, ParsedQuote, QuoteRequest, RawResponse, Source, Strategy
from .base import Adapter, AdapterMeta, RouteSupport, _shape

API = "https://api.wise.com/v4/comparisons/"

# Wise's own quote carries the time it was priced. Anything older than this isn't a live
# price, so it's refused rather than published under a misleading "checked" time.
MAX_AGE = timedelta(hours=6)


class WiseAdapter(Adapter):
    meta = AdapterMeta(
        adapter_id="wise",
        provider_id="wise",
        provider_name="Wise",
        provider_type="fintech",
        # The host actually called: the runner applies the per-domain delay to this one.
        website="https://api.wise.com",
        version="1",
        maintainer="angad",
        last_verified="2026-09-30",
        robots_note="api.wise.com has no robots.txt (404, checked 2026-09-30); wise.com is never fetched",
        terms_note=(
            "Written permission for the Comparison API, Simon Bruins (Wise), 2026-09-30: "
            "\"The current documentation is correct and you can use it. If you are a "
            "considerate user it shouldn't be a problem.\""
        ),
        # Considerate: one request at a time, well spaced. 130 requests a run (26 routes, 5
        # amounts), about 11 minutes at this spacing, 4 runs a day (D158; it was 20 a run).
        min_delay_s=5.0,
    )
    source = Source.API
    strategies = (Strategy.JSON_ENDPOINT,)

    def corridors(self) -> list[RouteSupport]:
        return [RouteSupport(route_id, (DeliveryMethod.BANK_DEPOSIT,)) for route_id in ROUTES_BY_ID]

    async def fetch_quote(self, http: PoliteClient, strategy: Strategy, req: QuoteRequest) -> RawResponse:
        r = await http.get(
            API,
            params={
                "sourceCurrency": req.send_currency,
                "targetCurrency": req.receive_currency,
                "sendAmount": _amount(req.send_amount),
            },
        )
        return RawResponse(r.content, r.headers.get("content-type", ""), str(r.url), r.status_code, strategy)

    def parse(self, raw: RawResponse, req: QuoteRequest) -> ParsedQuote:
        d = json.loads(raw.body)
        if (d.get("sourceCurrency"), d.get("targetCurrency")) != (req.send_currency, req.receive_currency):
            raise ValueError(f"answered {d.get('sourceCurrency')}->{d.get('targetCurrency')}, not the pair asked for")
        if float(d.get("amount", -1)) != req.send_amount or d.get("amountType") != "SEND":
            raise ValueError("answered for a different amount than the one asked for")

        wise = [p for p in d.get("providers", []) if p.get("alias") == "wise"]
        if len(wise) != 1:
            raise ValueError(f"expected Wise once in the providers, found it {len(wise)} times")
        country = ROUTES_BY_ID[req.route_id].receive_country
        # A quote names its target country when Wise prices countries sharing a currency
        # differently; otherwise it's null. Never guess between two.
        quotes = [q for q in wise[0].get("quotes", []) if q.get("targetCountry") in (None, country)]
        if len(quotes) != 1:
            raise ValueError(f"expected one Wise quote for {country}, found {len(quotes)}")
        q = quotes[0]

        collected = datetime.fromisoformat(q["dateCollected"])
        if datetime.now(UTC) - collected > MAX_AGE:
            raise ValueError(f"Wise's quote was priced at {q['dateCollected']}, too long ago to call it current")

        return ParsedQuote(
            send_amount=req.send_amount,
            fee=float(q["fee"]),
            offered_rate=float(q["rate"]),
            amount_received=float(q["receivedAmount"]),
            delivery_time=_delivery(q.get("deliveryEstimation") or {}),
            captured_at=collected,
            source_url=raw.url,
        )

    def fingerprint(self, raw: RawResponse) -> str | None:
        """The shape of what this adapter reads: the envelope and Wise's own quotes.

        The default hashes the whole response, but the other providers Wise lists change
        from route to route and hour to hour, so every run would look like drift (PRD 9.6)
        and hold good quotes. Their shape doesn't matter here; Wise's does.
        """
        try:
            d = json.loads(raw.body)
            envelope = {k: v for k, v in d.items() if k != "providers"}
            wise = [p.get("quotes") for p in d.get("providers", []) if p.get("alias") == "wise"]
            return hashlib.sha256(_shape({"envelope": envelope, "wise": wise}).encode()).hexdigest()[:16]
        except (ValueError, AttributeError):
            return None


def _amount(x: float) -> str:
    return str(int(x)) if x == int(x) else str(x)


_DURATION = re.compile(r"^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$")


def _seconds(iso: str | None) -> float | None:
    """An ISO 8601 duration such as PT44M27S or P2DT3H, in seconds."""
    if not iso:
        return None
    m = _DURATION.match(iso)
    if not m:
        return None
    d, h, mi, s = (float(g) if g else 0.0 for g in m.groups())
    return d * 86400 + h * 3600 + mi * 60 + s


def _delivery(est: dict) -> str | None:
    """Wise's own estimate in plain words. Nothing when Wise gives none."""
    if not est.get("providerGivesEstimate"):
        return None
    duration = est.get("duration") or {}
    secs = _seconds(duration.get("max")) or _seconds(duration.get("min"))
    if secs is None:
        return None
    if secs < 3600:
        return "under an hour"
    if secs < 86400:
        hours = math.ceil(secs / 3600)
        return f"about {hours} hour{'s' if hours != 1 else ''}"
    days = math.ceil(secs / 86400)
    return f"about {days} day{'s' if days != 1 else ''}"
