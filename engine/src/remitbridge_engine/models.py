"""Data shapes that move through the engine. Mirrors the tables in supabase/migrations."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import StrEnum


class DeliveryMethod(StrEnum):
    BANK_DEPOSIT = "bank_deposit"
    CASH_PICKUP = "cash_pickup"
    MOBILE_WALLET = "mobile_wallet"
    UPI = "upi"
    DEBIT_CARD = "debit_card"
    HOME_DELIVERY = "home_delivery"


class PaymentMethod(StrEnum):
    BANK_ACCOUNT = "bank_account"
    DEBIT_CARD = "debit_card"
    CREDIT_CARD = "credit_card"
    CASH = "cash"
    # D83: the two other physical instruments the US remittance tax names.
    MONEY_ORDER = "money_order"
    CASHIERS_CHECK = "cashiers_check"


class Source(StrEnum):
    SCRAPER = "scraper"
    API = "api"
    MANUAL = "manual"
    PARTNER = "partner"


class Strategy(StrEnum):
    """PRD 9.4, in fallback order."""

    JSON_ENDPOINT = "json_endpoint"
    HEADLESS_BROWSER = "headless_browser"
    ALTERNATE_PAGE = "alternate_page"
    AI_EXTRACTION = "ai_extraction"
    MANUAL = "manual"


class ValidationStatus(StrEnum):
    PUBLISHED = "published"
    QUARANTINED = "quarantined"  # plausible but unproven: held for a human
    REJECTED = "rejected"  # provably wrong, e.g. the math does not add up


class RunStatus(StrEnum):
    SUCCESS = "success"
    PARTIAL = "partial"
    FAILED = "failed"
    BLOCKED = "blocked"
    SKIPPED = "skipped"  # circuit breaker open


class ErrorClass(StrEnum):
    """PRD 9.5: every failure is tagged so the dashboard shows why, not just that."""

    NETWORK = "network"
    TIMEOUT = "timeout"
    PARSE_ERROR = "parse_error"
    SCHEMA_DRIFT = "schema_drift"
    BLOCKED = "blocked"
    VALIDATION_REJECT = "validation_reject"
    FX_UNAVAILABLE = "fx_unavailable"


@dataclass(frozen=True)
class QuoteRequest:
    route_id: str
    send_currency: str
    receive_currency: str
    send_amount: float
    delivery_method: DeliveryMethod
    payment_method: PaymentMethod = PaymentMethod.BANK_ACCOUNT


@dataclass
class RawResponse:
    """Exactly what came back, before any interpretation. Always archived."""

    body: bytes
    content_type: str
    url: str
    status_code: int = 200
    strategy: Strategy = Strategy.JSON_ENDPOINT
    archive_path: str | None = None


@dataclass
class ParsedQuote:
    """What the provider said, in its own terms. The adapter's `parse` returns this."""

    send_amount: float
    fee: float
    offered_rate: float
    amount_received: float
    pickup_charge: float = 0.0
    delivery_time: str | None = None
    promo_text: str | None = None  # any wording near the rate, for promo detection
    captured_at: datetime | None = None  # manual quotes carry the time they were observed
    source_url: str | None = None


@dataclass(frozen=True)
class MidMarketRate:
    send_currency: str
    receive_currency: str
    rate: float  # the reference rate markup is calculated against
    source: str  # which source that reference came from, named on screen
    rate_date: str  # the date the source says the rate is for
    fetched_at: datetime
    checks: tuple[tuple[str, float], ...] = ()  # (source, rate) from every source asked
    disagreement_pct: float = 0.0


@dataclass
class Quote:
    """A normalised quote, with the cost computed by the one formula. One row in `quotes`."""

    provider_id: str
    route_id: str
    send_currency: str
    receive_currency: str
    send_amount: float
    delivery_method: DeliveryMethod
    payment_method: PaymentMethod
    fee: float
    offered_rate: float
    mid_market_rate: float
    mid_market_source: str
    pickup_charge: float
    amount_received: float  # as the provider stated it
    computed_amount_received: float  # (S - F) * Q - R
    markup_pct: float
    total_cost: float
    total_cost_pct: float
    delivery_time: str | None
    is_promotional: bool
    source: Source
    strategy: Strategy
    scrape_run_id: str
    captured_at: datetime
    raw_archive_path: str | None
    validation_status: ValidationStatus = ValidationStatus.QUARANTINED
    validation_notes: list[str] = field(default_factory=list)

    @property
    def dedupe_key(self) -> str:
        """Re-running a job never creates duplicate quotes (PRD 9.5)."""
        return "|".join(
            [
                self.provider_id,
                self.route_id,
                f"{self.send_amount:g}",
                self.delivery_method,
                self.payment_method,
                self.captured_at.isoformat(timespec="minutes"),
            ]
        )
