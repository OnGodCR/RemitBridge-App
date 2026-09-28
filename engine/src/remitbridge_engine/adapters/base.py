"""The adapter framework (PRD 9.3).

An adapter holds only what is specific to one provider: which routes it serves, how to
ask for a quote, and how to read the answer. Everything shared (retries, backoff, rate
limits, timeouts, archiving, error classification, strategy fallback, the circuit
breaker, drift detection) lives in `http.PoliteClient` and `runner.run_adapter`, so an
adapter stays short and a new contributor can write one in an afternoon.

Before writing an adapter, read the provider's robots.txt and terms. If either forbids
automated access, don't write it: add the provider to docs/MANUAL_RESEARCH.md instead
(DECISIONS.md D4).
"""

from __future__ import annotations

import hashlib
import json
from abc import ABC, abstractmethod
from dataclasses import dataclass

from ..config import AMOUNT_GRID, ROUTES_BY_ID
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


@dataclass(frozen=True)
class AdapterMeta:
    adapter_id: str
    provider_id: str
    provider_name: str
    provider_type: str  # bank | credit_union | mto | fintech
    website: str
    version: str
    maintainer: str
    last_verified: str  # ISO date someone last checked it against the live site
    robots_note: str  # what robots.txt says about the URLs this adapter uses
    terms_note: str  # what the terms say about automated access, quoted
    min_delay_s: float = 3.0  # raise to the site's Crawl-delay if it asks for more


@dataclass(frozen=True)
class RouteSupport:
    route_id: str
    delivery_methods: tuple[DeliveryMethod, ...]
    payment_methods: tuple[PaymentMethod, ...] = (PaymentMethod.BANK_ACCOUNT,)


class Adapter(ABC):
    meta: AdapterMeta
    source: Source = Source.SCRAPER
    strategies: tuple[Strategy, ...] = (Strategy.JSON_ENDPOINT,)

    @abstractmethod
    def corridors(self) -> list[RouteSupport]:
        """Which routes, delivery methods and payment methods this provider serves."""

    def requests(self) -> list[QuoteRequest]:
        """Every quote to ask for this run: supported routes x methods x the amount grid."""
        out = []
        for support in self.corridors():
            route = ROUTES_BY_ID[support.route_id]
            for dm in support.delivery_methods:
                for pm in support.payment_methods:
                    for amount in AMOUNT_GRID:
                        out.append(
                            QuoteRequest(
                                route_id=route.id,
                                send_currency=route.send_currency,
                                receive_currency=route.receive_currency,
                                send_amount=float(amount),
                                delivery_method=dm,
                                payment_method=pm,
                            )
                        )
        return out

    @abstractmethod
    async def fetch_quote(
        self, http: PoliteClient, strategy: Strategy, req: QuoteRequest
    ) -> RawResponse:
        """Ask for one quote with one strategy. Return the raw response untouched."""

    @abstractmethod
    def parse(self, raw: RawResponse, req: QuoteRequest) -> ParsedQuote:
        """Read a raw response into what the provider said. Raise ValueError if it can't."""

    async def health_check(self, http: PoliteClient) -> bool:
        """One cheap known-good request. Default: the first quote this adapter would ask for."""
        req = self.requests()[0]
        raw = await self.fetch_quote(http, self.strategies[0], req)
        self.parse(raw, req)
        return True

    def fingerprint(self, raw: RawResponse) -> str | None:
        """A hash of the response's structure (keys and types, not values), for drift
        detection (PRD 9.6). None means this adapter doesn't fingerprint."""
        if "json" not in raw.content_type:
            return None
        try:
            return hashlib.sha256(_shape(json.loads(raw.body)).encode()).hexdigest()[:16]
        except ValueError:
            return None


def _shape(v) -> str:
    if isinstance(v, dict):
        return "{" + ",".join(f"{k}:{_shape(v[k])}" for k in sorted(v)) + "}"
    if isinstance(v, list):
        # A list's shape is the set of its element shapes, so length changes aren't drift.
        return "[" + "|".join(sorted({_shape(x) for x in v})) + "]"
    if isinstance(v, bool):
        return "bool"
    if isinstance(v, (int, float)):
        return "num"
    if v is None:
        return "null"
    return "str"
