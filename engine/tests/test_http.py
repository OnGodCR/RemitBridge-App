import httpx
import pytest
import respx

from remitbridge_engine.http import AdapterError, PoliteClient
from remitbridge_engine.models import ErrorClass

URL = "https://provider.example/quote"


@respx.mock
async def test_retries_transient_errors_then_succeeds(no_sleep):
    route = respx.get(URL).mock(side_effect=[httpx.Response(503), httpx.Response(200, json={})])
    http = PoliteClient(sleep=no_sleep)
    r = await http.get(URL)
    assert r.status_code == 200 and route.call_count == 2
    await http.aclose()


@respx.mock
@pytest.mark.parametrize("status", [403, 429])
async def test_never_retries_when_told_to_stop(no_sleep, status):
    route = respx.get(URL).mock(return_value=httpx.Response(status))
    http = PoliteClient(sleep=no_sleep)
    with pytest.raises(AdapterError) as e:
        await http.get(URL)
    assert e.value.error_class == ErrorClass.BLOCKED
    assert route.call_count == 1
    await http.aclose()


@respx.mock
async def test_gives_up_after_max_attempts(no_sleep):
    route = respx.get(URL).mock(return_value=httpx.Response(500))
    http = PoliteClient(sleep=no_sleep)
    with pytest.raises(AdapterError) as e:
        await http.get(URL)
    assert e.value.error_class == ErrorClass.NETWORK and route.call_count == 3
    await http.aclose()


@respx.mock
async def test_waits_between_requests_to_the_same_domain(no_sleep):
    respx.get(URL).mock(return_value=httpx.Response(200, json={}))
    http = PoliteClient(sleep=no_sleep)
    await http.get(URL)
    await http.get(URL)
    assert no_sleep.calls and no_sleep.calls[-1] > 2.5  # ~MIN_DELAY_PER_DOMAIN_S
    await http.aclose()
