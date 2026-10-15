"""Manual quotes: strategy 5 of PRD 9.4, and the source for any provider whose terms
forbid automated access (DECISIONS.md D4).

A person opens a provider's public calculator, reads off the numbers, and records them,
either in the app's admin "Add a price" form (a pending row in `manual_observations`,
DECISIONS.md D54) or as a JSON file under `engine/manual/quotes/`. This adapter feeds those observations
through exactly the same normaliser, publish gate and archive as a scraped quote, so a
manual number is held to the same standard and traced the same way. It is labelled
`source: manual` everywhere it appears.

A manual quote must be run within MANUAL_QUOTE_MAX_AGE_S of when it was observed,
seven days from observation (Angad, 2026-10-14). Its original timestamp is preserved.
The cost uses the cross-checked reference fetched at processing time; older observations
remain explicitly dated and Compare keeps its stale and older-price labels.

A row from the database carries its `row_id`; the runner writes the gate's outcome
back to that row so the person who entered it can see what happened.

File format (a list, one object per observation):

    [{
      "provider_id": "remitly",
      "route_id": "us-in",
      "send_amount": 500,
      "delivery_method": "bank_deposit",
      "payment_method": "bank_account",
      "fee": 3.99,
      "offered_rate": 95.12,
      "amount_received": 47181.43,
      "pickup_charge": 0,
      "delivery_time": "minutes",
      "promo_text": null,
      "observed_at": "2026-09-28T21:30:00Z",
      "observed_by": "angad",
      "source_url": "https://www.remitly.com/us/en/india"
    }]
"""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from ..config import ROUTES_BY_ID
from ..http import PoliteClient
from ..models import (
    DeliveryMethod,
    ParsedQuote,
    PaymentMethod,
    QuoteRequest,
    RawResponse,
    Source,
    Strategy,
)
from .base import Adapter, AdapterMeta, RouteSupport

REQUIRED = (
    "provider_id", "route_id", "send_amount", "delivery_method", "fee", "offered_rate",
    "amount_received", "observed_at", "observed_by", "source_url",
)


class ManualAdapter(Adapter):
    meta = AdapterMeta(
        adapter_id="manual",
        provider_id="*",  # each observation names its own provider
        provider_name="Manual observations",
        provider_type="n/a",
        website="",
        version="1",
        maintainer="angad",
        last_verified="2026-09-28",
        robots_note="n/a: no automated access",
        terms_note="n/a: read by a person from the provider's public calculator",
    )
    source = Source.MANUAL
    strategies = (Strategy.MANUAL,)

    def __init__(self, directory: Path | None = None, rows: list[dict] | None = None) -> None:
        self.directory = directory
        self.rows = rows or []
        self._observations: list[tuple[str, QuoteRequest, dict]] | None = None

    def observations(self) -> list[tuple[str, QuoteRequest, dict]]:
        """(provider_id, request, observation) for every recorded observation."""
        if self._observations is not None:
            return self._observations
        sources: list[tuple[str, dict]] = []
        if self.directory is not None:
            for path in sorted(self.directory.glob("*.json")):
                sources += [(f"{path.name}[{i}]", o) for i, o in enumerate(json.loads(path.read_text()))]
        sources += [(f"manual_observations #{r.get('row_id')}", r) for r in self.rows]
        out = []
        for where, obs in sources:
            missing = [k for k in REQUIRED if obs.get(k) in (None, "")]
            if missing:
                raise ValueError(f"{where} is missing {', '.join(missing)}")
            route = ROUTES_BY_ID[obs["route_id"]]
            req = QuoteRequest(
                route_id=route.id,
                send_currency=route.send_currency,
                receive_currency=route.receive_currency,
                send_amount=float(obs["send_amount"]),
                delivery_method=DeliveryMethod(obs["delivery_method"]),
                payment_method=PaymentMethod(obs.get("payment_method") or "bank_account"),
            )
            out.append((obs["provider_id"], req, obs))
        self._observations = out
        return out

    def corridors(self) -> list[RouteSupport]:
        return []  # data-driven: see observations()

    def requests(self) -> list[QuoteRequest]:
        return [req for _, req, _ in self.observations()]

    async def fetch_quote(self, http: PoliteClient, strategy: Strategy, req: QuoteRequest) -> RawResponse:
        raise NotImplementedError("manual observations are read with fetch_observation")

    def fetch_observation(self, obs: dict) -> RawResponse:
        return RawResponse(
            body=json.dumps(obs, sort_keys=True).encode(),
            content_type="application/json",
            url=obs["source_url"],
            strategy=Strategy.MANUAL,
        )

    def parse(self, raw: RawResponse, req: QuoteRequest) -> ParsedQuote:
        obs = json.loads(raw.body)
        observed_at = datetime.fromisoformat(obs["observed_at"])
        if observed_at.tzinfo is None:
            raise ValueError(f"observed_at {obs['observed_at']!r} needs a timezone, e.g. a trailing Z")
        return ParsedQuote(
            send_amount=float(obs["send_amount"]),
            fee=float(obs["fee"]),
            offered_rate=float(obs["offered_rate"]),
            amount_received=float(obs["amount_received"]),
            pickup_charge=float(obs.get("pickup_charge") or 0),
            delivery_time=obs.get("delivery_time"),
            promo_text=obs.get("promo_text"),
            captured_at=observed_at,
            source_url=obs["source_url"],
        )

    async def health_check(self, http: PoliteClient) -> bool:
        self.observations()  # a health check here is just "the files parse"
        return True

    def fingerprint(self, raw: RawResponse) -> str | None:
        return None
