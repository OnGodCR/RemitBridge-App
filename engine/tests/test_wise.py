"""The Wise adapter against real Comparison API responses (tests/fixtures/wise), captured
2026-09-30 and trimmed to Wise plus one other provider, which must be ignored."""

import json
from datetime import UTC, datetime, timedelta
from pathlib import Path

import httpx
import pytest
import respx

from remitbridge_engine.adapters.wise import API, WiseAdapter, _delivery
from remitbridge_engine.archive import LocalArchive
from remitbridge_engine.config import ROUTES_BY_ID
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

FIXTURES = Path(__file__).parent / "fixtures" / "wise"
PAIRS = {"us-in": "INR", "us-mx": "MXN", "us-ph": "PHP", "us-vn": "VND"}


def fixture(ccy: str, *, fresh: bool = True) -> dict:
    d = json.loads((FIXTURES / f"usd-{ccy.lower()}-500.json").read_text())
    if fresh:  # the captured time would age past MAX_AGE; the prices themselves don't change
        for p in d["providers"]:
            for q in p["quotes"]:
                q["dateCollected"] = datetime.now(UTC).isoformat().replace("+00:00", "Z")
    return d


def raw(body: dict) -> RawResponse:
    return RawResponse(json.dumps(body).encode(), "application/json", API)


def req(route: str = "us-in", amount: float = 500.0) -> QuoteRequest:
    return QuoteRequest(route, "USD", PAIRS[route], amount, DeliveryMethod.BANK_DEPOSIT)


@pytest.mark.parametrize("route,fee,rate,received", [
    ("us-in", 9.17, 95.9588, 47099.46),
    ("us-mx", 9.59, 18.0757, 8864.5),
    ("us-ph", 9.43, 62.8032, 30809.37),
    ("us-vn", 10.56, 25962.0, 12706841.0),
])
def test_reads_wise_own_quote_and_nothing_else(route, fee, rate, received):
    q = WiseAdapter().parse(raw(fixture(PAIRS[route])), req(route))
    assert (q.fee, q.offered_rate, q.amount_received) == (fee, rate, received)
    assert q.send_amount == 500 and q.delivery_time == "under an hour"
    assert q.captured_at is not None and q.source_url == API


def test_every_route_is_a_bank_deposit_paid_from_a_bank_account():
    reqs = WiseAdapter().requests()
    assert {r.route_id for r in reqs} == set(ROUTES_BY_ID)
    assert {(r.delivery_method, r.payment_method) for r in reqs} == {
        (DeliveryMethod.BANK_DEPOSIT, PaymentMethod.BANK_ACCOUNT)
    }
    assert len(reqs) == 26 * 5  # every route (D158) x the 5-amount grid


def test_an_answer_for_another_pair_or_amount_is_refused():
    body = fixture("INR")
    with pytest.raises(ValueError, match="pair"):
        WiseAdapter().parse(raw(body), req("us-mx"))
    with pytest.raises(ValueError, match="amount"):
        WiseAdapter().parse(raw(body), req("us-in", 1000))


def test_no_wise_or_two_wise_quotes_is_refused_not_guessed():
    body = fixture("INR")
    others = {**body, "providers": [p for p in body["providers"] if p["alias"] != "wise"]}
    with pytest.raises(ValueError, match="0 times"):
        WiseAdapter().parse(raw(others), req())
    doubled = fixture("INR")
    [wise] = [p for p in doubled["providers"] if p["alias"] == "wise"]
    wise["quotes"] = wise["quotes"] * 2
    with pytest.raises(ValueError, match="found 2"):
        WiseAdapter().parse(raw(doubled), req())


def test_a_quote_for_another_country_is_not_used():
    body = fixture("INR")
    [wise] = [p for p in body["providers"] if p["alias"] == "wise"]
    wise["quotes"][0]["targetCountry"] = "NP"
    with pytest.raises(ValueError, match="found 0"):
        WiseAdapter().parse(raw(body), req())


def test_a_stale_price_is_refused():
    body = fixture("INR", fresh=False)
    [wise] = [p for p in body["providers"] if p["alias"] == "wise"]
    wise["quotes"][0]["dateCollected"] = (datetime.now(UTC) - timedelta(hours=7)).isoformat()
    with pytest.raises(ValueError, match="too long ago"):
        WiseAdapter().parse(raw(body), req())


@pytest.mark.parametrize("est,words", [
    ({"providerGivesEstimate": True, "duration": {"min": "PT44M27S", "max": "PT44M27S"}}, "under an hour"),
    ({"providerGivesEstimate": True, "duration": {"min": None, "max": "PT3H10M"}}, "about 4 hours"),
    ({"providerGivesEstimate": True, "duration": {"min": "P2D", "max": None}}, "about 2 days"),
    ({"providerGivesEstimate": True, "duration": {"min": "PT1H", "max": "PT1H"}}, "about 1 hour"),
    ({"providerGivesEstimate": False, "duration": {"min": "PT1H", "max": "PT1H"}}, None),
    ({}, None),
])
def test_delivery_estimate_in_plain_words(est, words):
    assert _delivery(est) == words


@respx.mock
async def test_a_full_run_publishes_all_four_routes_through_the_gate(tmp_path, no_sleep):
    def answer(request):
        ccy = request.url.params["targetCurrency"]
        amount = float(request.url.params["sendAmount"])
        body = fixture(ccy)
        body["amount"] = amount
        [wise] = [p for p in body["providers"] if p["alias"] == "wise"]
        q = wise["quotes"][0]
        q["receivedAmount"] = round((amount - q["fee"]) * q["rate"], 2)
        return httpx.Response(200, json=body)

    route = respx.get(API).mock(side_effect=answer)
    store = LocalStore(tmp_path / "store.json")
    report = await run_adapter(
        _FourRoutes(),
        store=store,
        archive=LocalArchive(tmp_path / "archive"),
        http=PoliteClient(sleep=no_sleep),
        mid_rates={
            "INR": mid("INR", 95.95), "MXN": mid("MXN", 18.07),
            "PHP": mid("PHP", 62.80), "VND": mid("VND", 25960.0),
        },
    )
    assert report.status == RunStatus.SUCCESS and report.published == 20
    assert route.call_count == 20
    quotes = list(store.data["quotes"].values())
    assert {q["provider_id"] for q in quotes} == {"wise"}  # never the competitors in the response
    assert {q["source"] for q in quotes} == {"api"}
    assert len(list((tmp_path / "archive").rglob("*.gz"))) == 20
    # Considerate: requests are spaced by the adapter's delay. The client sleeps for what's
    # left of it since the previous request, so each sleep is a hair under 5 seconds.
    assert len(no_sleep.calls) >= 19 and min(no_sleep.calls) > WiseAdapter.meta.min_delay_s - 0.5


class _FourRoutes(WiseAdapter):
    """The adapter on the four routes the saved answers cover."""

    def corridors(self):
        return [c for c in super().corridors() if c.route_id in PAIRS]

