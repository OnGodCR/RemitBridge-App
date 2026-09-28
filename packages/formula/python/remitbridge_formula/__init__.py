"""The one total-cost formula (the TrueCost method, PRD 14.4).

Python twin of ``packages/formula/src/index.ts``. Both are pinned to
``packages/formula/vectors.json``, generated from the website's TrueCost code,
so the engine, the app and the bot can never disagree about the same transfer.

The fee comes off first and never reaches the exchange, so the markup applies
to S - F, not to S.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass

__all__ = ["TransferCost", "compute_transfer_cost", "yearly_cost"]


@dataclass(frozen=True)
class TransferCost:
    converted: float
    amount_received: float
    benchmark_received: float
    shortfall: float
    markup_pct: float
    markup_cost: float
    pickup_cost: float
    fee_cost: float
    total_cost: float
    total_cost_pct: float

    def as_dict(self) -> dict[str, float]:
        return asdict(self)


def compute_transfer_cost(
    sent: float,
    quoted_rate: float,
    mid_rate: float,
    fee: float = 0.0,
    pickup_charge: float = 0.0,
) -> TransferCost:
    """S sent, F fee (sending currency), Q quoted and M mid-market rates
    (receiving per 1 sending), R pickup charge (receiving currency)."""
    S, F, Q, M, R = sent, fee, quoted_rate, mid_rate, pickup_charge

    converted = S - F
    amount_received = converted * Q - R
    benchmark_received = S * M
    markup_pct = ((M - Q) / M) * 100
    markup_cost = converted * ((M - Q) / M)
    pickup_cost = R / M
    total_cost = F + markup_cost + pickup_cost

    return TransferCost(
        converted=converted,
        amount_received=amount_received,
        benchmark_received=benchmark_received,
        shortfall=benchmark_received - amount_received,
        markup_pct=markup_pct,
        markup_cost=markup_cost,
        pickup_cost=pickup_cost,
        fee_cost=F,
        total_cost=total_cost,
        total_cost_pct=(total_cost / S) * 100,
    )


def yearly_cost(cost: TransferCost) -> dict[str, float]:
    """Twelve identical transfers. No compounding, no assumption about future rates."""
    return {"total_cost": cost.total_cost * 12, "shortfall": cost.shortfall * 12}
