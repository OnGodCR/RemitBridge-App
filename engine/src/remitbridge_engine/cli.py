"""rb-engine: the command the scheduled workflows run.

    rb-engine run [--adapter ID ...] [--store local|supabase] [--skip-manual]
    rb-engine health [--store local|supabase]
    rb-engine fx
    rb-engine accept-drift ADAPTER_ID [--store local|supabase]

`--store local` (the default) writes to engine/.local and engine/.archive, so the whole
pipeline can run on a laptop with no Supabase project and no keys.
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import sys
from pathlib import Path

import httpx

from . import config as C
from .archive import LocalArchive, SupabaseArchive
from .fx import FxUnavailable, fetch_mid_market
from .http import PoliteClient
from .models import RunStatus
from .registry import all_adapters
from .runner import run_adapter
from .store import LocalStore, SupabaseStore

ENGINE_DIR = Path(__file__).resolve().parents[2]


def _backends(kind: str, client: httpx.AsyncClient):
    if kind == "supabase":
        return SupabaseStore.from_env(client), SupabaseArchive.from_env(client)
    return LocalStore(ENGINE_DIR / ".local" / "store.json"), LocalArchive(ENGINE_DIR / ".archive")


async def _run(args) -> int:
    adapters = [a for a in all_adapters() if not args.adapter or a.meta.adapter_id in args.adapter]
    if args.skip_manual:
        # Scheduled runs: manual quotes run when a file is added, not every six hours.
        adapters = [a for a in adapters if a.meta.adapter_id != "manual"]
        if not adapters:
            print("no scraping adapters registered yet; nothing to run")
            return 0
    if not adapters:
        print(f"no adapters match {args.adapter}", file=sys.stderr)
        return 2
    async with httpx.AsyncClient(timeout=C.REQUEST_TIMEOUT_S) as backend_client:
        store, archive = _backends(args.store, backend_client)
        http = PoliteClient()
        try:
            reports = []
            for adapter in adapters:  # isolated: one adapter's failure never stops another
                try:
                    reports.append(await run_adapter(adapter, store=store, archive=archive, http=http))
                except Exception as e:  # noqa: BLE001
                    print(f"{adapter.meta.adapter_id}: crashed: {e!r}", file=sys.stderr)
                    reports.append(None)
        finally:
            await http.aclose()
    for r in reports:
        if r:
            print(r.line())
    bad = [r for r in reports if r is None or r.status in (RunStatus.FAILED, RunStatus.BLOCKED)]
    return 1 if bad else 0


async def _health(args) -> int:
    http = PoliteClient()
    failed = 0
    try:
        for adapter in all_adapters():
            try:
                await adapter.health_check(http)
                print(f"{adapter.meta.adapter_id}: ok")
            except Exception as e:  # noqa: BLE001
                failed += 1
                print(f"{adapter.meta.adapter_id}: FAILED {e!r}")
    finally:
        await http.aclose()
    return 1 if failed else 0


async def _fx(args) -> int:
    rates = await fetch_mid_market("USD", sorted({r.receive_currency for r in C.TIER1_ROUTES}))
    for ccy, r in rates.items():
        if isinstance(r, FxUnavailable):
            print(f"USD/{ccy}: HELD  {r}")
        else:
            checks = ", ".join(f"{s} {v}" for s, v in r.checks)
            print(f"USD/{ccy}: {r.rate} ({r.source}, {r.rate_date}) | {checks} | "
                  f"disagree {r.disagreement_pct:.3f}%")
    return 0


async def _accept_drift(args) -> int:
    async with httpx.AsyncClient(timeout=C.REQUEST_TIMEOUT_S) as client:
        store, _ = _backends(args.store, client)
        await store.set_adapter_state(args.adapter_id, fingerprints={})
    print(f"{args.adapter_id}: fingerprints cleared; the next run records the new shape")
    return 0


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="rb-engine")
    sub = p.add_subparsers(dest="cmd", required=True)
    run = sub.add_parser("run", help="run adapters and publish what passes the gate")
    run.add_argument("--adapter", action="append", help="adapter id; repeat for several")
    run.add_argument("--store", choices=["local", "supabase"], default="local")
    run.add_argument("--skip-manual", action="store_true", help="for scheduled runs")
    health = sub.add_parser("health", help="one cheap known-good request per adapter")
    health.add_argument("--store", choices=["local", "supabase"], default="local")
    sub.add_parser("fx", help="show today's cross-checked mid-market rates")
    acc = sub.add_parser("accept-drift", help="accept a changed response shape after review")
    acc.add_argument("adapter_id")
    acc.add_argument("--store", choices=["local", "supabase"], default="local")
    args = p.parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    handler = {"run": _run, "health": _health, "fx": _fx, "accept-drift": _accept_drift}[args.cmd]
    return asyncio.run(handler(args))


if __name__ == "__main__":
    sys.exit(main())
