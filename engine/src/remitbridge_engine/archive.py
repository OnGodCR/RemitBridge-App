"""The raw archive (PRD 9.1 principle 4): every response, compressed and timestamped, so any
published number can be traced back to exactly what the provider sent and re-parsed.
"""

from __future__ import annotations

import gzip
import os
from datetime import UTC, datetime
from pathlib import Path
from typing import Protocol

import httpx

from .keys import key_headers
from .models import RawResponse


def archive_key(run_id: str, adapter_id: str, label: str, content_type: str) -> str:
    now = datetime.now(UTC)
    ext = "json" if "json" in content_type else "html" if "html" in content_type else "txt"
    safe = "".join(c if c.isalnum() or c in "-_." else "_" for c in label)
    return f"{now:%Y/%m/%d}/{run_id}/{adapter_id}/{now:%H%M%S%f}_{safe}.{ext}.gz"


class Archive(Protocol):
    async def save(self, run_id: str, adapter_id: str, label: str, raw: RawResponse) -> str: ...


class LocalArchive:
    """Writes to engine/.archive. For development and tests; gitignored."""

    def __init__(self, root: Path) -> None:
        self.root = root

    async def save(self, run_id: str, adapter_id: str, label: str, raw: RawResponse) -> str:
        key = archive_key(run_id, adapter_id, label, raw.content_type)
        path = self.root / key
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(gzip.compress(raw.body))
        return f"local:{key}"


class SupabaseArchive:
    """Uploads to the private `raw-archive` bucket in Supabase Storage."""

    BUCKET = "raw-archive"

    def __init__(self, url: str, service_key: str, client: httpx.AsyncClient) -> None:
        self.base = f"{url.rstrip('/')}/storage/v1/object/{self.BUCKET}"
        self.headers = key_headers(service_key)
        self.client = client

    @classmethod
    def from_env(cls, client: httpx.AsyncClient) -> SupabaseArchive:
        return cls(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"], client)

    async def save(self, run_id: str, adapter_id: str, label: str, raw: RawResponse) -> str:
        key = archive_key(run_id, adapter_id, label, raw.content_type)
        r = await self.client.post(
            f"{self.base}/{key}",
            content=gzip.compress(raw.body),
            headers={**self.headers, "Content-Type": "application/gzip", "x-upsert": "false"},
        )
        r.raise_for_status()
        return f"storage:{self.BUCKET}/{key}"
