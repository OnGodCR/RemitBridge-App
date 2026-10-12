import httpx
import respx

from remitbridge_engine.fx import (
    ER_API,
    FRANKFURTER,
    WISE_COMPARISONS,
    FxUnavailable,
    fetch_mid_market,
)
from remitbridge_engine.models import MidMarketRate


def mock(frank: dict, er: dict):
    respx.get(FRANKFURTER).mock(return_value=httpx.Response(
        200, json=[{"date": "2026-09-28", "base": "USD", "quote": k, "rate": v} for k, v in frank.items()]))
    respx.get(ER_API.format(base="USD")).mock(return_value=httpx.Response(
        200, json={"result": "success", "time_last_update_unix": 1790553751, "rates": er}))


@respx.mock
async def test_agreeing_sources_give_a_named_reference_rate():
    mock({"INR": 95.81}, {"INR": 95.93})
    r = (await fetch_mid_market("USD", ["INR"]))["INR"]
    assert isinstance(r, MidMarketRate)
    assert r.rate == 95.81 and r.source == "Frankfurter" and len(r.checks) == 2


@respx.mock
async def test_disagreeing_sources_hold_the_pair():
    mock({"MXN": 17.74}, {"MXN": 17.98})  # 1.35% apart, like Coinbase was
    respx.get(WISE_COMPARISONS).mock(return_value=httpx.Response(503))  # no tie-breaker either
    r = (await fetch_mid_market("USD", ["MXN"]))["MXN"]
    assert isinstance(r, FxUnavailable) and "disagree" in str(r)


@respx.mock
async def test_one_source_alone_is_not_enough():
    mock({"VND": 25918}, {})
    assert isinstance((await fetch_mid_market("USD", ["VND"]))["VND"], FxUnavailable)


def wise(rate: float, mid: bool = True):
    respx.get(WISE_COMPARISONS).mock(return_value=httpx.Response(200, json={"providers": [
        {"alias": "ofx", "quotes": [{"rate": rate * 0.97, "markup": 3.0, "isConsideredMidMarketRate": False}]},
        {"alias": "wise", "quotes": [{"rate": rate, "markup": 0.0 if mid else 0.4, "isConsideredMidMarketRate": mid}]},
    ]}))


@respx.mock
async def test_wise_settles_a_disagreement_for_the_source_it_agrees_with():
    # Mexico on 2026-10-12: Frankfurter's fixing had gone stale, open.er-api had moved on.
    mock({"MXN": 18.2086}, {"MXN": 18.406744})
    wise(18.39)
    r = (await fetch_mid_market("USD", ["MXN"]))["MXN"]
    assert isinstance(r, MidMarketRate)
    assert r.source == "open.er-api" and r.rate == 18.406744
    assert [name for name, _ in r.checks] == ["Frankfurter", "open.er-api", "Wise"]


@respx.mock
async def test_wise_can_side_with_frankfurter_too():
    mock({"INR": 96.29}, {"INR": 96.964336})
    wise(96.31)
    r = (await fetch_mid_market("USD", ["INR"]))["INR"]
    assert isinstance(r, MidMarketRate) and r.source == "Frankfurter" and r.rate == 96.29


@respx.mock
async def test_the_pair_is_held_if_wise_agrees_with_neither_or_stops_calling_it_mid_market():
    mock({"MXN": 17.74}, {"MXN": 17.98})
    wise(18.5)
    assert isinstance((await fetch_mid_market("USD", ["MXN"]))["MXN"], FxUnavailable)


@respx.mock
async def test_a_wise_rate_with_a_markup_is_not_a_reference():
    mock({"MXN": 18.2086}, {"MXN": 18.406744})
    wise(18.39, mid=False)
    r = (await fetch_mid_market("USD", ["MXN"]))["MXN"]
    assert isinstance(r, FxUnavailable) and "Wise unavailable" in str(r)


@respx.mock
async def test_wise_is_only_asked_about_pairs_in_dispute():
    mock({"INR": 95.81}, {"INR": 95.93})
    route = respx.get(WISE_COMPARISONS)
    await fetch_mid_market("USD", ["INR"])
    assert not route.called
