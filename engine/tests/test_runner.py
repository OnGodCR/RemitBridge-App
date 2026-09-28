import json
from datetime import UTC, datetime, timedelta

import httpx
import respx

from remitbridge_engine.adapters.base import Adapter, AdapterMeta, RouteSupport
from remitbridge_engine.adapters.manual import ManualAdapter
from remitbridge_engine.archive import LocalArchive
from remitbridge_engine.http import PoliteClient
from remitbridge_engine.models import (
    DeliveryMethod,
    ParsedQuote,
    RawResponse,
    RunStatus,
    Strategy,
    ValidationStatus,
)
from remitbridge_engine.runner import run_adapter
from remitbridge_engine.store import LocalStore

from .conftest import mid

URL = "https://provider.example/api/quote"


class FakeAdapter(Adapter):
    """The smallest honest adapter: one JSON endpoint, one route, one method."""

    meta = AdapterMeta(
        adapter_id="fake", provider_id="fake", provider_name="Fake", provider_type="mto",
        website="https://provider.example", version="1", maintainer="tests",
        last_verified="2026-09-28", robots_note="test", terms_note="test",
    )
    strategies = (Strategy.JSON_ENDPOINT,)

    def corridors(self):
        return [RouteSupport("us-in", (DeliveryMethod.BANK_DEPOSIT,))]

    async def fetch_quote(self, http, strategy, req):
        r = await http.get(URL, params={"amount": req.send_amount})
        return RawResponse(r.content, r.headers.get("content-type", ""), str(r.url), r.status_code)

    def parse(self, raw, req):
        d = json.loads(raw.body)
        return ParsedQuote(send_amount=d["send"], fee=d["fee"], offered_rate=d["rate"],
                           amount_received=d["receive"])


def respond(request, *, shape="v1"):
    amount = float(request.url.params["amount"])
    fee, rate = 3.99, 95.1
    body = {"send": amount, "fee": fee, "rate": rate, "receive": round((amount - fee) * rate, 2)}
    if shape == "v2":
        body["newField"] = "x"
    return httpx.Response(200, json=body)


def setup(tmp_path, no_sleep):
    return {
        "store": LocalStore(tmp_path / "store.json"),
        "archive": LocalArchive(tmp_path / "archive"),
        "http": PoliteClient(sleep=no_sleep),
        "mid_rates": {"INR": mid()},
    }


@respx.mock
async def test_full_run_publishes_the_grid_and_archives_every_response(tmp_path, no_sleep):
    respx.get(URL).mock(side_effect=respond)
    env = setup(tmp_path, no_sleep)
    report = await run_adapter(FakeAdapter(), **env)
    assert report.status == RunStatus.SUCCESS and report.published == 5
    quotes = list(env["store"].data["quotes"].values())
    assert all(q["raw_archive_path"].startswith("local:") for q in quotes)
    assert len(list((tmp_path / "archive").rglob("*.gz"))) == 5
    assert {q["mid_market_source"] for q in quotes} == {"Frankfurter"}


@respx.mock
async def test_rerunning_never_duplicates_quotes(tmp_path, no_sleep):
    respx.get(URL).mock(side_effect=respond)
    env = setup(tmp_path, no_sleep)
    await run_adapter(FakeAdapter(), **env)
    await run_adapter(FakeAdapter(), **env)
    assert len(env["store"].data["quotes"]) == 5


@respx.mock
async def test_a_changed_response_shape_is_held_even_when_parsing_works(tmp_path, no_sleep):
    env = setup(tmp_path, no_sleep)
    respx.get(URL).mock(side_effect=respond)
    await run_adapter(FakeAdapter(), **env)
    env["store"].data["quotes"].clear()
    respx.get(URL).mock(side_effect=lambda r: respond(r, shape="v2"))
    report = await run_adapter(FakeAdapter(), **env)
    assert report.error_class == "schema_drift" and report.published == 0
    assert report.quarantined == 5


@respx.mock
async def test_blocked_stops_at_once_and_opens_the_breaker(tmp_path, no_sleep):
    route = respx.get(URL).mock(return_value=httpx.Response(403))
    env = setup(tmp_path, no_sleep)
    report = await run_adapter(FakeAdapter(), **env)
    assert report.status == RunStatus.BLOCKED and route.call_count == 1
    again = await run_adapter(FakeAdapter(), **env)
    assert again.status == RunStatus.SKIPPED and route.call_count == 1


@respx.mock
async def test_breaker_opens_after_repeated_failures(tmp_path, no_sleep):
    respx.get(URL).mock(return_value=httpx.Response(200, json={"unexpected": True}))
    env = setup(tmp_path, no_sleep)
    for _ in range(3):
        assert (await run_adapter(FakeAdapter(), **env)).status == RunStatus.FAILED
    assert (await run_adapter(FakeAdapter(), **env)).status == RunStatus.SKIPPED


async def test_manual_quotes_go_through_the_same_gate(tmp_path, no_sleep):
    now = datetime.now(UTC)
    obs = {
        "provider_id": "remitly", "route_id": "us-in", "send_amount": 500,
        "delivery_method": "bank_deposit", "fee": 3.99, "offered_rate": 95.1,
        "amount_received": round((500 - 3.99) * 95.1, 2), "observed_at": now.isoformat(),
        "observed_by": "tests", "source_url": "https://www.remitly.com/us/en/india",
    }
    stale = {**obs, "send_amount": 1000, "amount_received": round((1000 - 3.99) * 95.1, 2),
             "observed_at": (now - timedelta(hours=8)).isoformat()}
    wrong = {**obs, "send_amount": 200, "amount_received": 99999}
    d = tmp_path / "manual"
    d.mkdir()
    (d / "2026-09-28.json").write_text(json.dumps([obs, stale, wrong]))
    env = setup(tmp_path, no_sleep)
    report = await run_adapter(ManualAdapter(d), **env)
    assert report.published == 1 and report.rejected == 1 and report.failed_requests == 1
    [published] = [q for q in env["store"].data["quotes"].values()
                   if q["validation_status"] == ValidationStatus.PUBLISHED]
    assert published["provider_id"] == "remitly" and published["source"] == "manual"
