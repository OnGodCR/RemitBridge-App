"""The polite client every adapter fetches through (PRD 9.5 and 9.12).

Conduct is enforced here, not left to each adapter: an honest user agent, one request
at a time per domain, a minimum delay between requests to the same site, retries with
exponential backoff and jitter for transient errors only, and no retries at all on 403
or 429, which go straight to the blocked path.
"""

from __future__ import annotations

import asyncio
import random
import time
from collections import defaultdict
from urllib.parse import urlsplit

import httpx

from . import config as C
from .models import ErrorClass


class AdapterError(Exception):
    def __init__(self, error_class: ErrorClass, message: str) -> None:
        super().__init__(message)
        self.error_class = error_class


class PoliteClient:
    def __init__(self, client: httpx.AsyncClient | None = None, *, sleep=asyncio.sleep) -> None:
        self._client = client or httpx.AsyncClient(
            timeout=C.REQUEST_TIMEOUT_S,
            headers={"User-Agent": C.USER_AGENT, "Accept": "application/json, text/html;q=0.9"},
            follow_redirects=True,
        )
        self._locks: dict[str, asyncio.Lock] = defaultdict(asyncio.Lock)
        self._last: dict[str, float] = {}
        self._delay: dict[str, float] = {}
        self._sleep = sleep

    def set_min_delay(self, domain: str, seconds: float) -> None:
        self._delay[domain] = max(seconds, C.MIN_DELAY_PER_DOMAIN_S)

    async def aclose(self) -> None:
        await self._client.aclose()

    async def request(self, method: str, url: str, **kwargs) -> httpx.Response:
        domain = urlsplit(url).hostname or url
        async with self._locks[domain]:  # per-domain concurrency of 1
            for attempt in range(1, C.MAX_ATTEMPTS + 1):
                wait = self._last.get(domain, 0) + self._delay.get(domain, C.MIN_DELAY_PER_DOMAIN_S)
                if (gap := wait - time.monotonic()) > 0:
                    await self._sleep(gap)
                try:
                    resp = await self._client.request(method, url, **kwargs)
                except httpx.TimeoutException as e:
                    err = AdapterError(ErrorClass.TIMEOUT, f"{method} {url}: timeout ({e})")
                except httpx.TransportError as e:
                    err = AdapterError(ErrorClass.NETWORK, f"{method} {url}: {e!r}")
                else:
                    if resp.status_code in (401, 403, 429):
                        # Never retried: the site is telling us to stop.
                        raise AdapterError(
                            ErrorClass.BLOCKED, f"{method} {url}: HTTP {resp.status_code}"
                        )
                    if resp.status_code < 500:
                        return resp
                    err = AdapterError(ErrorClass.NETWORK, f"{method} {url}: HTTP {resp.status_code}")
                finally:
                    self._last[domain] = time.monotonic()
                if attempt == C.MAX_ATTEMPTS:
                    raise err
                backoff = C.BACKOFF_BASE_S * 2 ** (attempt - 1)
                await self._sleep(backoff + random.uniform(0, backoff / 2))
        raise AssertionError("unreachable")

    async def get(self, url: str, **kwargs) -> httpx.Response:
        return await self.request("GET", url, **kwargs)
