"""The publish gate (PRD 9.7). A quote reaches users only if it passes every check.

Principle 1 of the engine: a missing quote is better than a wrong one. So the gate has
three outcomes, not two:

- REJECTED: provably wrong (the arithmetic does not add up). Almost always a parser that
  grabbed the wrong number. Never shown.
- QUARANTINED: plausible but unproven (out of range, a sudden jump, a tier pattern that
  makes no sense). Held for a human to look at. Never shown until released.
- PUBLISHED: passed everything. Promotional quotes publish too, but labelled, and they
  are ranked apart from standing rates.

Checks 1, 2, 5 and 6 look at one quote. Check 4 (tier consistency) looks at a provider's
whole grid for one route and method, so it runs over the batch. Check 3 (cross-source
mid-market) happens before a quote exists: a pair whose sources disagree never gets a
MidMarketRate, so nothing in it can be normalised at all.
"""

from __future__ import annotations

import statistics
from collections import defaultdict
from collections.abc import Iterable
from itertools import pairwise

from . import config as C
from .models import Quote, ValidationStatus


def _math_ok(q: Quote) -> tuple[bool, str]:
    stated, computed = q.amount_received, q.computed_amount_received
    tol = max(C.MATH_TOLERANCE_ABS, abs(computed) * C.MATH_TOLERANCE_REL)
    diff = abs(stated - computed)
    return diff <= tol, (
        f"math: stated {stated:,.2f} vs (S-F)*Q-R {computed:,.2f} "
        f"(diff {diff:,.2f}, tolerance {tol:,.2f})"
    )


def _range_problems(q: Quote) -> list[str]:
    out = []
    if q.fee < 0:
        out.append(f"range: negative fee {q.fee}")
    if q.send_amount > 0 and q.fee / q.send_amount > C.FEE_MAX_SHARE:
        out.append(f"range: fee {q.fee} is over {C.FEE_MAX_SHARE:.0%} of {q.send_amount}")
    if q.offered_rate <= 0:
        out.append(f"range: non-positive rate {q.offered_rate}")
    if q.markup_pct > C.MARKUP_MAX_PCT:
        out.append(f"range: markup {q.markup_pct:.2f}% above {C.MARKUP_MAX_PCT}%")
    if q.markup_pct < C.MARKUP_MIN_PCT and not q.is_promotional:
        out.append(
            f"range: rate beats mid-market by {-q.markup_pct:.2f}% and isn't labelled a promotion"
        )
    return out


def _is_promotional(promo_text: str | None) -> bool:
    text = (promo_text or "").lower()
    return any(k in text for k in C.PROMO_KEYWORDS)


def _anomaly(q: Quote, history_total_cost_pct: list[float]) -> str | None:
    if not history_total_cost_pct:
        return None  # nothing to compare against yet; first quotes are covered by checks 1-2
    median = statistics.median(history_total_cost_pct)
    move = abs(q.total_cost_pct - median)
    if move > C.ANOMALY_MAX_TOTAL_COST_MOVE_PCT:
        return (
            f"anomaly: total cost {q.total_cost_pct:.2f}% vs recent median {median:.2f}% "
            f"(moved {move:.2f} points)"
        )
    return None


def _tier_problems(quotes: list[Quote]) -> dict[int, str]:
    """Index -> problem, for quotes whose markup jumps against their grid neighbour."""
    problems: dict[int, str] = {}
    groups: dict[tuple, list[int]] = defaultdict(list)
    for i, q in enumerate(quotes):
        groups[(q.provider_id, q.route_id, q.delivery_method, q.payment_method)].append(i)
    for idxs in groups.values():
        idxs.sort(key=lambda i: quotes[i].send_amount)
        for a, b in pairwise(idxs):
            jump = abs(quotes[a].markup_pct - quotes[b].markup_pct)
            if jump > C.TIER_MAX_MARKUP_JUMP_PCT:
                msg = (
                    f"tier: markup jumps {jump:.2f} points between "
                    f"{quotes[a].send_amount:g} and {quotes[b].send_amount:g}"
                )
                problems.setdefault(a, msg)
                problems.setdefault(b, msg)
    return problems


def run_gate(
    quotes: list[Quote],
    promo_texts: list[str | None],
    history: Iterable[list[float]],
) -> list[Quote]:
    """Sets validation_status, validation_notes and is_promotional on each quote, in place.

    `promo_texts[i]` is the wording the adapter found near quote i's rate.
    `history[i]` is the total_cost_pct of this provider's recent published quotes for the
    same route, amount and method (check 5).
    """
    tier = _tier_problems(quotes)
    for i, (q, promo, hist) in enumerate(zip(quotes, promo_texts, history, strict=True)):
        q.is_promotional = _is_promotional(promo)
        notes: list[str] = []

        ok, math_note = _math_ok(q)
        if not ok:
            q.validation_status = ValidationStatus.REJECTED
            q.validation_notes = [math_note]
            continue

        notes += _range_problems(q)
        if i in tier:
            notes.append(tier[i])
        if (a := _anomaly(q, hist)) is not None:
            notes.append(a)

        q.validation_status = ValidationStatus.QUARANTINED if notes else ValidationStatus.PUBLISHED
        if q.is_promotional:
            notes.append("promo: labelled promotional, ranked apart from standing rates")
        q.validation_notes = notes
    return quotes
