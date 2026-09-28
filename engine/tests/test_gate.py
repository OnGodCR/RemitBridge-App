from datetime import UTC, datetime

from remitbridge_engine.gate import run_gate
from remitbridge_engine.models import (
    DeliveryMethod,
    ParsedQuote,
    QuoteRequest,
    RawResponse,
    Source,
    ValidationStatus,
)
from remitbridge_engine.normalize import normalize

from .conftest import mid

M = 95.81


def make(amount=500.0, fee=3.99, rate=95.1, received=None, provider="p"):
    req = QuoteRequest("us-in", "USD", "INR", amount, DeliveryMethod.BANK_DEPOSIT)
    received = (amount - fee) * rate if received is None else received
    parsed = ParsedQuote(send_amount=amount, fee=fee, offered_rate=rate, amount_received=received)
    return normalize(parsed, req, mid(rate=M), provider_id=provider, source=Source.SCRAPER,
                     raw=RawResponse(b"{}", "application/json", "u"), run_id="r")


def gate(*quotes, promos=None, history=None):
    n = len(quotes)
    return run_gate(list(quotes), promos or [None] * n, history or [[] for _ in range(n)])


def test_a_clean_quote_publishes():
    [q] = gate(make())
    assert q.validation_status == ValidationStatus.PUBLISHED, q.validation_notes
    assert q.validation_notes == []


def test_wrong_arithmetic_is_rejected_not_quarantined():
    # A parser that grabbed the wrong number: stated amount is 5% off (S-F)*Q.
    [q] = gate(make(received=(500 - 3.99) * 95.1 * 0.95))
    assert q.validation_status == ValidationStatus.REJECTED
    assert q.validation_notes[0].startswith("math:")


def test_provider_rounding_is_tolerated():
    [q] = gate(make(received=round((500 - 3.99) * 95.1)))
    assert q.validation_status == ValidationStatus.PUBLISHED


def test_markup_over_15_percent_is_held():
    [q] = gate(make(rate=M * 0.80))
    assert q.validation_status == ValidationStatus.QUARANTINED
    assert any("markup" in n for n in q.validation_notes)


def test_huge_fee_is_held():
    [q] = gate(make(fee=100))
    assert q.validation_status == ValidationStatus.QUARANTINED


def test_rate_well_above_mid_market_needs_a_promo_label():
    unlabelled, labelled = gate(
        make(rate=M * 1.02), make(rate=M * 1.02, provider="q"),
        promos=[None, "Special rate for your first transfer"],
    )
    assert unlabelled.validation_status == ValidationStatus.QUARANTINED
    assert labelled.validation_status == ValidationStatus.PUBLISHED
    assert labelled.is_promotional and not unlabelled.is_promotional


def test_tier_jump_holds_both_neighbours():
    a, b, c = gate(make(amount=200, rate=95.3), make(amount=500, rate=90.0), make(amount=1000, rate=90.1))
    assert a.validation_status == ValidationStatus.QUARANTINED
    assert b.validation_status == ValidationStatus.QUARANTINED
    assert c.validation_status == ValidationStatus.PUBLISHED


def test_sudden_move_against_history_is_held():
    [q] = gate(make(rate=92.0), history=[[1.0, 1.1, 0.9]])
    assert q.validation_status == ValidationStatus.QUARANTINED
    assert any(n.startswith("anomaly") for n in q.validation_notes)


def test_captured_at_defaults_to_now():
    assert (datetime.now(UTC) - make().captured_at).total_seconds() < 5
