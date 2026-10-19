"""Validate reviewed collection CSV rows before feeding the ordinary manual adapter.

Collection outcomes are evidence, not publish outcomes. Missing methods or a payout
currency different from the app's route stay held; neither is filled by guessing.
"""

from __future__ import annotations

import math
from datetime import UTC, datetime
from pathlib import Path

from . import config as C
from .models import DeliveryMethod, PaymentMethod


def prepare_collection(rows: list[dict], now: datetime | None = None) -> tuple[list, list]:
    now = now or datetime.now(UTC)
    observations, held = [], []
    for row in rows:
        reasons = []
        identity = row.get("source_row_sha256") or row.get("import_id")
        if row.get("outcome") != "verified_quote":
            held.append({"id": identity, "reason": "collection outcome is not verified_quote"})
            continue
        route = C.ROUTES_BY_ID.get(row.get("route_id"))
        if not route:
            reasons.append("unknown route")
        elif row.get("receiving_currency") != route.receive_currency:
            reasons.append("payout currency does not match the app route")
        try:
            DeliveryMethod(row.get("delivery_method"))
            PaymentMethod(row.get("payment_method"))
        except ValueError:
            reasons.append("missing or unsupported delivery/payment method")
        try:
            observed = datetime.fromisoformat(row["observed_at_utc"])
            if observed.tzinfo is None or not 0 <= (now - observed).total_seconds() <= C.MANUAL_QUOTE_MAX_AGE_S:
                reasons.append("observation outside seven-day window")
        except (KeyError, ValueError, TypeError):
            reasons.append("invalid observation timestamp")
        numbers = {}
        for key in ("send_amount", "fee", "offered_rate", "amount_received"):
            try:
                value = float(row[key])
                if not math.isfinite(value) or (value < 0 if key == "fee" else value <= 0):
                    raise ValueError(key)
                numbers[key] = value
            except (KeyError, ValueError, TypeError):
                reasons.append(f"missing or invalid {key}")
        evidence = [Path(p.strip()) for p in (row.get("evidence_file") or "").split(";") if p.strip()]
        if not evidence or not all(p.is_file() for p in evidence):
            reasons.append("screenshot evidence is missing")
        if not (row.get("source_url") or "").startswith("https://"):
            reasons.append("missing public source URL")
        # This collection explicitly excludes recipient pickup charges. Preserve the
        # original blank and that scope in collection_evidence instead of asserting a
        # provider-verified zero. The formula here compares payouts before pickup charges.
        if row.get("pickup_charge_status") != "ignored_by_user":
            reasons.append("pickup charge scope requires review")
        if reasons:
            held.append({"id": identity, "provider": row.get("provider_id"),
                         "route": row.get("route_id"), "reason": "; ".join(reasons)})
            continue
        # Promotional page evidence must not turn reconstructed regular terms into a
        # first-transfer offer. Preserve that text in the archived collection evidence.
        promo = row.get("price_basis") in ("promotional", "promo_only")
        observations.append({
            **numbers, "provider_id": row["provider_id"], "route_id": row["route_id"],
            "delivery_method": row["delivery_method"], "payment_method": row["payment_method"],
            "observed_at": row["observed_at_utc"], "observed_by": "Angad reviewed collection",
            "source_url": row["source_url"], "pickup_charge": 0,
            "delivery_time": row.get("delivery_time") or None,
            "promo_text": ("Promotional: " + (row.get("promo_text") or "offer")) if promo else None,
            "collection_evidence": row,
        })
    return observations, held


PROMO_BASES = ("promotional", "promo_only", "first_transfer")

# Providers whose rate is the same whatever the sender pays with (Angad, 2026-10-18: "Xoom
# and Xe show the same rate whatever the payment method"). Their rate screens don't show
# funding, so a blank payment method there is the bank-account rate. Everyone else's blank
# stays held.
SAME_RATE_ANY_FUNDING = {"xoom", "xe"}


def _typed(amount) -> int:
    return int(float(amount))


def _fee_key(provider, route, typed, delivery, payment, basis) -> tuple:
    return (provider, route, _typed(typed), delivery, payment, basis in PROMO_BASES)


def combine_weekly_rates(rate_rows: list[dict], fee_quotes: list[dict],
                         now: datetime | None = None) -> tuple[list, list]:
    """Pair this week's verified rates with the newest monthly fee for the same quote (D193).

    Rates are checked weekly and fees monthly (Angad, 2026-10-18). A rate row is used only
    when it was verified without a hold, names its route, payout currency, receiving and
    payment methods, has screenshot evidence, is under seven days old, and a fee quote for
    the same provider, route, typed amount, methods and promotional-or-regular basis was
    checked within MANUAL_FEE_MAX_AGE_S. Nothing is guessed: a blank payment method stays
    held. The amount received is (send amount minus fee) times the new rate, the same
    arithmetic every earlier full quote satisfied, and both dates stay in the evidence.
    """
    now = now or datetime.now(UTC)
    fees: dict[tuple, dict] = {}
    for q in fee_quotes:
        ev = q.get("collection_evidence") or {}
        if "typed_amount_usd" not in ev:
            continue  # only reviewed full quotes carry a fee we can reuse
        k = _fee_key(q["provider_id"], q["route_id"], ev["typed_amount_usd"], q["delivery_method"],
                     q["payment_method"], ev.get("price_basis"))
        if k not in fees or q["observed_at"] > fees[k]["observed_at"]:
            fees[k] = q
    observations, held = [], []
    for row in rate_rows:
        reasons = []
        if row.get("rate_outcome") != "verified_rate" or row.get("review_status") != "verified_rate_only":
            held.append({"provider": row.get("provider_id"), "route": row.get("route_id"),
                         "reason": f"rate not usable ({row.get('review_status') or row.get('rate_outcome') or 'blank'})"})
            continue
        if not row.get("payment_method") and row.get("provider_id") in SAME_RATE_ANY_FUNDING:
            row = {**row, "payment_method": "bank_account",
                   "payment_basis": "same rate for any funding (Angad, 2026-10-18)"}
        route = C.ROUTES_BY_ID.get(row.get("route_id"))
        if not route:
            reasons.append("unknown route")
        elif row.get("receiving_currency") != route.receive_currency:
            reasons.append("payout currency does not match the app route")
        try:
            DeliveryMethod(row.get("delivery_method"))
            PaymentMethod(row.get("payment_method"))
        except ValueError:
            reasons.append("missing or unsupported delivery/payment method")
        try:
            observed = datetime.fromisoformat(row["observed_at_utc"])
            if not 0 <= (now - observed).total_seconds() <= C.MANUAL_QUOTE_MAX_AGE_S:
                reasons.append("rate outside seven-day window")
        except (KeyError, ValueError, TypeError):
            reasons.append("invalid observation timestamp")
        try:
            rate = float(row["offered_rate"])
            if not math.isfinite(rate) or rate <= 0:
                raise ValueError
        except (KeyError, ValueError, TypeError):
            reasons.append("missing or invalid offered_rate")
        evidence = [Path(p.strip()) for p in (row.get("evidence_file") or "").split(";") if p.strip()]
        if not evidence or not all(p.is_file() for p in evidence):
            reasons.append("screenshot evidence is missing")
        if not (row.get("source_url") or "").startswith("https://"):
            reasons.append("missing public source URL")
        fee = None
        if not reasons:
            fee = fees.get(_fee_key(row["provider_id"], row["route_id"], row["typed_amount_usd"],
                                    row["delivery_method"], row["payment_method"], row.get("price_basis")))
            if fee is None:
                reasons.append("no monthly fee for this provider, route, amount, methods and basis")
            else:
                fee_at = datetime.fromisoformat(fee["observed_at"])
                if not 0 <= (now - fee_at).total_seconds() <= C.MANUAL_FEE_MAX_AGE_S:
                    reasons.append("fee older than the monthly window")
        if reasons:
            held.append({"provider": row.get("provider_id"), "route": row.get("route_id"),
                         "amount": row.get("typed_amount_usd"), "reason": "; ".join(reasons)})
            continue
        send, fee_amount = float(fee["send_amount"]), float(fee["fee"])
        promo = row.get("price_basis") in PROMO_BASES
        observations.append({
            "provider_id": row["provider_id"], "route_id": row["route_id"],
            "send_amount": send, "fee": fee_amount, "offered_rate": rate,
            "amount_received": round((send - fee_amount) * rate, 2),
            "delivery_method": row["delivery_method"], "payment_method": row["payment_method"],
            "observed_at": row["observed_at_utc"], "observed_by": "Angad weekly rate with monthly fee",
            "source_url": row["source_url"], "pickup_charge": 0,
            "delivery_time": fee.get("delivery_time"),
            "promo_text": ("Promotional: " + (row.get("promo_text") or "offer")) if promo else None,
            "collection_evidence": {**row, "fee_observed_at": fee["observed_at"],
                                    "fee_source_url": fee["source_url"],
                                    "fee_evidence": (fee.get("collection_evidence") or {}).get("evidence_file")},
        })
    return observations, held
