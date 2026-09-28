"""ParsedQuote -> Quote. The cost figures come from the one formula and nowhere else."""

from __future__ import annotations

from datetime import UTC, datetime

from remitbridge_formula import compute_transfer_cost

from .models import MidMarketRate, ParsedQuote, Quote, QuoteRequest, RawResponse, Source


def normalize(
    parsed: ParsedQuote,
    req: QuoteRequest,
    mid: MidMarketRate,
    *,
    provider_id: str,
    source: Source,
    raw: RawResponse,
    run_id: str,
) -> Quote:
    cost = compute_transfer_cost(
        sent=parsed.send_amount,
        fee=parsed.fee,
        quoted_rate=parsed.offered_rate,
        mid_rate=mid.rate,
        pickup_charge=parsed.pickup_charge,
    )
    return Quote(
        provider_id=provider_id,
        route_id=req.route_id,
        send_currency=req.send_currency,
        receive_currency=req.receive_currency,
        send_amount=parsed.send_amount,
        delivery_method=req.delivery_method,
        payment_method=req.payment_method,
        fee=parsed.fee,
        offered_rate=parsed.offered_rate,
        mid_market_rate=mid.rate,
        mid_market_source=mid.source,
        pickup_charge=parsed.pickup_charge,
        amount_received=parsed.amount_received,
        computed_amount_received=cost.amount_received,
        markup_pct=cost.markup_pct,
        total_cost=cost.total_cost,
        total_cost_pct=cost.total_cost_pct,
        delivery_time=parsed.delivery_time,
        is_promotional=False,  # decided by the gate's promo check
        source=source,
        strategy=raw.strategy,
        scrape_run_id=run_id,
        captured_at=parsed.captured_at or datetime.now(UTC),
        raw_archive_path=raw.archive_path,
    )
