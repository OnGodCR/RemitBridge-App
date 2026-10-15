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
