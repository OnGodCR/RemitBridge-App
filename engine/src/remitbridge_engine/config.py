"""Engine configuration: routes, the amount grid, conduct limits and the publish-gate thresholds.

Every threshold here is a default chosen under DECISIONS.md D10 and recorded there with
its reasoning. Change a number here and its entry there together.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from .models import DeliveryMethod

# The contact address is set once, with the operator's other public details, in
# site/site.config.json (DECISIONS.md D141); the site, the app and the functions read it too.
_SITE_CONFIG = Path(__file__).resolve().parents[3] / "site" / "site.config.json"
CONTACT_EMAIL: str = json.loads(_SITE_CONFIG.read_text(encoding="utf-8"))["CONTACT_EMAIL"]
USER_AGENT = f"RemitBridgeResearch/0.1 (+mailto:{CONTACT_EMAIL}; non-commercial price research)"


@dataclass(frozen=True)
class RouteConfig:
    send_country: str
    send_currency: str
    receive_country: str
    receive_currency: str
    tier: int
    delivery_methods: tuple[DeliveryMethod, ...]

    @property
    def id(self) -> str:
        return f"{self.send_country}-{self.receive_country}".lower()


# PRD 6.1, Tier 1. All send from the United States.
TIER1_ROUTES: tuple[RouteConfig, ...] = (
    RouteConfig("US", "USD", "IN", "INR", 1, (DeliveryMethod.BANK_DEPOSIT, DeliveryMethod.UPI)),
    RouteConfig(
        "US", "USD", "MX", "MXN", 1,
        (DeliveryMethod.BANK_DEPOSIT, DeliveryMethod.CASH_PICKUP, DeliveryMethod.DEBIT_CARD),
    ),
    RouteConfig(
        "US", "USD", "PH", "PHP", 1,
        (DeliveryMethod.BANK_DEPOSIT, DeliveryMethod.CASH_PICKUP, DeliveryMethod.MOBILE_WALLET),
    ),
    RouteConfig(
        "US", "USD", "VN", "VND", 1,
        (DeliveryMethod.BANK_DEPOSIT, DeliveryMethod.CASH_PICKUP, DeliveryMethod.HOME_DELIVERY),
    ),
)

# Tier 2 (D158, 2026-10-11): every other country Wise or Instarem prices from the US, checked
# that day with one request per currency to each. Bank deposit only: that's all either quotes.
# Mirrors mobile/src/lib/routes.ts and supabase/migrations/20261011000000_wise_instarem_routes.sql.
_TIER2 = (
    ("CN", "CNY"), ("GT", "GTQ"), ("HN", "HNL"), ("DO", "DOP"), ("ET", "ETB"), ("KE", "KES"),
    ("NG", "NGN"), ("PK", "PKR"), ("BD", "BDT"), ("KR", "KRW"), ("UA", "UAH"), ("CO", "COP"),
    ("PE", "PEN"), ("NI", "NIO"), ("JM", "JMD"), ("HT", "HTG"), ("BR", "BRL"), ("GH", "GHS"),
    ("NP", "NPR"), ("LK", "LKR"), ("EG", "EGP"), ("UG", "UGX"),
)
TIER2_ROUTES: tuple[RouteConfig, ...] = tuple(
    RouteConfig("US", "USD", country, currency, 2, (DeliveryMethod.BANK_DEPOSIT,))
    for country, currency in _TIER2
)
ALL_ROUTES: tuple[RouteConfig, ...] = TIER1_ROUTES + TIER2_ROUTES
ROUTES_BY_ID = {r.id: r for r in ALL_ROUTES}

# PRD 9.11. Kept small on purpose: every amount multiplies request volume.
AMOUNT_GRID: tuple[int, ...] = (100, 200, 500, 1000, 2000)

# --- Conduct (PRD 9.12) --------------------------------------------------------------
MIN_DELAY_PER_DOMAIN_S = 3.0  # raised per adapter when robots.txt asks for more
REQUEST_TIMEOUT_S = 20.0
MAX_ATTEMPTS = 3  # transient errors only; 403/429 are never retried
BACKOFF_BASE_S = 2.0

# --- Circuit breaker (PRD 9.5) --------------------------------------------------------
BREAKER_FAILURE_THRESHOLD = 3  # consecutive failed runs before the adapter pauses
BREAKER_COOLDOWN_S = 6 * 60 * 60  # then one health check per cooldown

# --- Mid-market rates (PRD 9.7 check 3) -----------------------------------------------
FX_MAX_DISAGREEMENT_PCT = 0.5  # sources further apart than this hold the run
# A manual quote is only matched to a mid-market rate fetched within this window.
MANUAL_QUOTE_MAX_AGE_S = 6 * 60 * 60

# --- Publish gate (PRD 9.7) ------------------------------------------------------------
# 1. Math: amount received vs (S - F) * Q - R. Providers round, so allow the larger of a
#    relative and an absolute tolerance in the receiving currency.
MATH_TOLERANCE_REL = 0.002
MATH_TOLERANCE_ABS = 1.0
# 2. Ranges. Markup may dip slightly below zero because the reference rate is a daily
#    one and the provider's is live; beyond that it has to be a labelled promotion.
MARKUP_MIN_PCT = -FX_MAX_DISAGREEMENT_PCT
MARKUP_MAX_PCT = 15.0
FEE_MAX_SHARE = 0.15  # a fee above 15% of the amount sent is held for review
# 4. Tier consistency: markup between neighbouring grid amounts.
TIER_MAX_MARKUP_JUMP_PCT = 3.0
# 5. Anomaly: against the median of this provider's recent published quotes.
ANOMALY_LOOKBACK_S = 7 * 24 * 60 * 60
ANOMALY_MAX_TOTAL_COST_MOVE_PCT = 2.0  # percentage points
# 6. Promo detection.
PROMO_KEYWORDS = (
    "first transfer",
    "first-transfer",
    "new customer",
    "promo",
    "promotional",
    "introductory",
    "special rate",
    "bonus rate",
    "welcome offer",
)

# --- Freshness (PRD 9.5) --------------------------------------------------------------
STALE_AFTER_S = 24 * 60 * 60
DROP_FROM_RANKINGS_AFTER_S = 48 * 60 * 60
