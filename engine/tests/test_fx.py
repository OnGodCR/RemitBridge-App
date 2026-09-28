import httpx
import respx

from remitbridge_engine.fx import ER_API, FRANKFURTER, FxUnavailable, fetch_mid_market
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
    r = (await fetch_mid_market("USD", ["MXN"]))["MXN"]
    assert isinstance(r, FxUnavailable) and "disagree" in str(r)


@respx.mock
async def test_one_source_alone_is_not_enough():
    mock({"VND": 25918}, {})
    assert isinstance((await fetch_mid_market("USD", ["VND"]))["VND"], FxUnavailable)
