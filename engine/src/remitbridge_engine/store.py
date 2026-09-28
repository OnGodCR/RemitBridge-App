"""Where runs, quotes and engine state are kept.

Engine state (circuit breakers, response fingerprints) lives in the database, not in
memory, because every scheduled GitHub Actions run starts from nothing (DECISIONS.md D13).

LocalStore is a JSON file for development and tests. SupabaseStore talks to PostgREST
with the service-role key, which only ever exists in GitHub Actions secrets and the
engine's own environment, never in the app.
"""

from __future__ import annotations

import json
import os
import uuid
from dataclasses import asdict
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Protocol

import httpx

from .models import MidMarketRate, Quote, ValidationStatus


def quote_row(q: Quote) -> dict[str, Any]:
    row = asdict(q)
    row["captured_at"] = q.captured_at.isoformat()
    row["dedupe_key"] = q.dedupe_key
    return row


def mid_market_rows(rate: MidMarketRate) -> list[dict[str, Any]]:
    return [
        {
            "send_currency": rate.send_currency,
            "receive_currency": rate.receive_currency,
            "rate": value,
            "source": source,
            "is_reference": source == rate.source,
            "rate_date": rate.rate_date,
            "fetched_at": rate.fetched_at.isoformat(),
        }
        for source, value in rate.checks
    ]


class Store(Protocol):
    async def create_run(self, adapter_id: str, adapter_version: str, strategy: str) -> str: ...
    async def finish_run(self, run_id: str, **fields: Any) -> None: ...
    async def save_quotes(self, quotes: list[Quote]) -> None: ...
    async def save_mid_market(self, rates: list[MidMarketRate]) -> None: ...
    async def recent_total_cost_pct(
        self, provider_id: str, route_id: str, send_amount: float,
        delivery_method: str, since: datetime,
    ) -> list[float]: ...
    async def get_adapter_state(self, adapter_id: str) -> dict[str, Any]: ...
    async def set_adapter_state(self, adapter_id: str, **fields: Any) -> None: ...


class LocalStore:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.data: dict[str, Any] = (
            json.loads(path.read_text()) if path.exists()
            else {"runs": {}, "quotes": {}, "mid_market": [], "adapter_state": {}}
        )

    def _flush(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(self.data, indent=1, default=str))

    async def create_run(self, adapter_id: str, adapter_version: str, strategy: str) -> str:
        run_id = str(uuid.uuid4())
        self.data["runs"][run_id] = {
            "adapter_id": adapter_id, "adapter_version": adapter_version,
            "strategy": strategy, "started_at": datetime.now(UTC).isoformat(),
        }
        self._flush()
        return run_id

    async def finish_run(self, run_id: str, **fields: Any) -> None:
        self.data["runs"][run_id].update(fields, finished_at=datetime.now(UTC).isoformat())
        self._flush()

    async def save_quotes(self, quotes: list[Quote]) -> None:
        for q in quotes:
            self.data["quotes"][q.dedupe_key] = quote_row(q)  # upsert: idempotent re-runs
        self._flush()

    async def save_mid_market(self, rates: list[MidMarketRate]) -> None:
        for r in rates:
            self.data["mid_market"].extend(mid_market_rows(r))
        self._flush()

    async def recent_total_cost_pct(self, provider_id, route_id, send_amount, delivery_method, since):
        return [
            q["total_cost_pct"] for q in self.data["quotes"].values()
            if q["provider_id"] == provider_id and q["route_id"] == route_id
            and q["send_amount"] == send_amount and q["delivery_method"] == delivery_method
            and q["validation_status"] == ValidationStatus.PUBLISHED
            and datetime.fromisoformat(q["captured_at"]) >= since
        ]

    async def get_adapter_state(self, adapter_id: str) -> dict[str, Any]:
        return dict(self.data["adapter_state"].get(adapter_id, {}))

    async def set_adapter_state(self, adapter_id: str, **fields: Any) -> None:
        self.data["adapter_state"].setdefault(adapter_id, {}).update(fields)
        self._flush()


class SupabaseStore:
    def __init__(self, url: str, service_key: str, client: httpx.AsyncClient) -> None:
        self.rest = f"{url.rstrip('/')}/rest/v1"
        self.headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
        }
        self.client = client

    @classmethod
    def from_env(cls, client: httpx.AsyncClient) -> SupabaseStore:
        return cls(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"], client)

    async def _post(self, table: str, rows: Any, *, upsert_on: str | None = None, ret=False):
        prefer = ["return=representation" if ret else "return=minimal"]
        params = {}
        if upsert_on:
            prefer.append("resolution=merge-duplicates")
            params["on_conflict"] = upsert_on
        r = await self.client.post(
            f"{self.rest}/{table}", json=rows, params=params,
            headers={**self.headers, "Prefer": ",".join(prefer)},
        )
        r.raise_for_status()
        return r.json() if ret else None

    async def create_run(self, adapter_id: str, adapter_version: str, strategy: str) -> str:
        rows = await self._post(
            "scrape_runs",
            {"adapter_id": adapter_id, "adapter_version": adapter_version, "strategy": strategy},
            ret=True,
        )
        return rows[0]["id"]

    async def finish_run(self, run_id: str, **fields: Any) -> None:
        r = await self.client.patch(
            f"{self.rest}/scrape_runs", params={"id": f"eq.{run_id}"},
            json={**fields, "finished_at": datetime.now(UTC).isoformat()}, headers=self.headers,
        )
        r.raise_for_status()

    async def save_quotes(self, quotes: list[Quote]) -> None:
        if quotes:
            await self._post("quotes", [quote_row(q) for q in quotes], upsert_on="dedupe_key")

    async def save_mid_market(self, rates: list[MidMarketRate]) -> None:
        rows = [row for r in rates for row in mid_market_rows(r)]
        if rows:
            await self._post("mid_market_rates", rows)

    async def recent_total_cost_pct(self, provider_id, route_id, send_amount, delivery_method, since):
        r = await self.client.get(
            f"{self.rest}/quotes",
            params={
                "select": "total_cost_pct",
                "provider_id": f"eq.{provider_id}", "route_id": f"eq.{route_id}",
                "send_amount": f"eq.{send_amount}", "delivery_method": f"eq.{delivery_method}",
                "validation_status": "eq.published", "captured_at": f"gte.{since.isoformat()}",
            },
            headers=self.headers,
        )
        r.raise_for_status()
        return [row["total_cost_pct"] for row in r.json()]

    async def get_adapter_state(self, adapter_id: str) -> dict[str, Any]:
        r = await self.client.get(
            f"{self.rest}/adapter_state", params={"adapter_id": f"eq.{adapter_id}"},
            headers=self.headers,
        )
        r.raise_for_status()
        rows = r.json()
        return rows[0] if rows else {}

    async def set_adapter_state(self, adapter_id: str, **fields: Any) -> None:
        await self._post("adapter_state", {"adapter_id": adapter_id, **fields}, upsert_on="adapter_id")
