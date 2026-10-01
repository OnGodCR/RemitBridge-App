"""The Instarem adapter against real responses from its quote endpoint
(tests/fixtures/instarem), captured 2026-10-01 for $500 on each route."""

import json
from datetime import UTC, datetime, timedelta
from pathlib import Path

import httpx
import pytest
import respx

from remitbridge_engine.adapters.instarem import API, InstaremAdapter
from remitbridge_engine.archive import LocalArchive
from remitbridge_engine.http import PoliteClient
from remitbridge_engine.models import (
    DeliveryMethod,
    PaymentMethod,
    QuoteRequest,
    RawResponse,
    RunStatus,
)
from remitbridge_engine.runner import run_adapter
from remitbridge_engine.store import LocalStore

from .conftest import mid

FIXTURES = Path(__file__).parent / "fixtures" / "instarem"
PAIRS = {"us-in": "INR", "us-mx": "MXN", "us-ph": "PHP", "us-vn": "VND"}


def fixture(ccy: str, *, fresh: bool = True) -> dict:
    d = json.loads((FIXTURES / f"usd-{ccy.lower()}-500.json").read_text())
    if fresh:  # the captured time would age past MAX_AGE; the prices themselves don't change
        d["data"]["transaction_config"]["fx_rate_last_updated"] = datetime.now(UTC).isoformat()
    return d


def raw(body: dict) -> RawResponse:
    return RawResponse(json.dumps(body).encode(), "application/json", API)


def req(route: str = "us-in", amount: float = 500.0) -> QuoteRequest:
    return QuoteRequest(route, "USD", PAIRS[route], amount, DeliveryMethod.BANK_DEPOSIT)


@pytest.mark.parametrize("route,rate,received", [
    ("us-in", 95.3206, 47660.30),
    ("us-mx", 17.9833, 8991.65),
    ("us-ph", 62.0905, 31045.25),
    ("us-vn", 25785.231, 12892616.0),
])
def test_publishes_the_standing_price_not_the_first_transfer_offer(route, rate, received):
    body = fixture(PAIRS[route])
    q = InstaremAdapter().parse(raw(body), req(route))
    assert (q.fee, q.offered_rate, q.amount_received) == (0.0, rate, received)
    # The first-transfer figure Instarem shows a signed-out visitor is higher, and unused.
    assert body["data"]["destination_amount"] > q.amount_received
    assert q.captured_at is not None and q.source_url == API


def test_standing_fees_come_off_the_amount_sent_before_the_rate():
    body = fixture("INR")
    body["data"]["regular_transaction_fee_amount"] = 3.99
    body["data"]["regular_payment_method_fee_amount"] = 1.0
    q = InstaremAdapter().parse(raw(body), req())
    assert q.fee == pytest.approx(4.99)
    assert q.amount_received == round((500 - 4.99) * 95.3206, 2)


def test_every_route_is_a_bank_deposit_paid_from_a_bank_account():
    reqs = InstaremAdapter().requests()
    assert {r.route_id for r in reqs} == set(PAIRS)
    assert {(r.delivery_method, r.payment_method) for r in reqs} == {
        (DeliveryMethod.BANK_DEPOSIT, PaymentMethod.BANK_ACCOUNT)
    }
    assert len(reqs) == 20


def test_an_answer_for_another_pair_amount_or_country_is_refused():
    with pytest.raises(ValueError, match="pair"):
        InstaremAdapter().parse(raw(fixture("INR")), req("us-mx"))
    with pytest.raises(ValueError, match="amount"):
        InstaremAdapter().parse(raw(fixture("INR")), req("us-in", 1000))
    body = fixture("INR")
    body["data"]["country_code"] = "SG"
    with pytest.raises(ValueError, match="SG"):
        InstaremAdapter().parse(raw(body), req())


def test_a_failed_answer_a_warning_a_tax_or_a_coupon_is_refused():
    with pytest.raises(ValueError, match="without a quote"):
        InstaremAdapter().parse(raw({"success": False, "data": {}}), req())
    for field, value, words in [
        ("warning_message", "Amount exceeds limit", "warned"),
        ("net_tax_amount", 2.5, "tax"),
        ("coupon_amount", 10, "coupon"),
    ]:
        body = fixture("INR")
        body["data"][field] = value
        with pytest.raises(ValueError, match=words):
            InstaremAdapter().parse(raw(body), req())


def test_if_instarem_stops_computing_the_way_we_assume_nothing_is_published():
    body = fixture("INR")
    body["data"]["destination_amount"] = 47000.0  # no longer amount x first-transfer rate
    with pytest.raises(ValueError, match="isn't amount x rate"):
        InstaremAdapter().parse(raw(body), req())


def test_a_stale_rate_is_refused():
    body = fixture("INR", fresh=False)
    body["data"]["transaction_config"]["fx_rate_last_updated"] = (
        datetime.now(UTC) - timedelta(hours=7)
    ).isoformat()
    with pytest.raises(ValueError, match="too long ago"):
        InstaremAdapter().parse(raw(body), req())


def test_the_fingerprint_ignores_values_and_unread_fields():
    a, b = fixture("INR"), fixture("MXN")
    b["data"]["something_new"] = {"x": 1}
    b["data"]["coupon_amount"] = 5  # null on most quotes; its type isn't the shape
    adapter = InstaremAdapter()
    assert adapter.fingerprint(raw(a)) == adapter.fingerprint(raw(b))
    b["data"]["destination_amount"] = "47,924.25"
    assert adapter.fingerprint(raw(a)) != adapter.fingerprint(raw(b))


@respx.mock
async def test_a_full_run_publishes_all_four_routes_through_the_gate(tmp_path, no_sleep):
    def answer(request):
        ccy = request.url.params["destination_currency"]
        amount = float(request.url.params["source_amount"])
        body = fixture(ccy)
        d = body["data"]
        d["gross_source_amount"] = d["net_source_amount"] = amount
        d["destination_amount"] = round(amount * d["instarem_fx_rate"], 2)
        return httpx.Response(200, json=body)

    route = respx.get(API).mock(side_effect=answer)
    store = LocalStore(tmp_path / "store.json")
    report = await run_adapter(
        InstaremAdapter(),
        store=store,
        archive=LocalArchive(tmp_path / "archive"),
        http=PoliteClient(sleep=no_sleep),
        mid_rates={
            "INR": mid("INR", 95.99), "MXN": mid("MXN", 18.11),
            "PHP": mid("PHP", 62.69), "VND": mid("VND", 25967.0),
        },
    )
    assert report.status == RunStatus.SUCCESS and report.published == 20
    assert route.call_count == 20
    quotes = list(store.data["quotes"].values())
    assert {q["provider_id"] for q in quotes} == {"instarem"}
    assert not any(q["is_promotional"] for q in quotes)
    assert len(list((tmp_path / "archive").rglob("*.gz"))) == 20
    assert len(no_sleep.calls) >= 19 and min(no_sleep.calls) > InstaremAdapter.meta.min_delay_s - 0.5
