"""Every adapter the engine runs. Add a new adapter here after its robots.txt and terms
check passes (DECISIONS.md D4) and its fixture tests are green."""

from __future__ import annotations

from pathlib import Path

from .adapters.base import Adapter
from .adapters.manual import ManualAdapter

MANUAL_DIR = Path(__file__).resolve().parents[2] / "manual" / "quotes"


def all_adapters() -> list[Adapter]:
    return [
        ManualAdapter(MANUAL_DIR),
        # No scraping adapters yet: see docs/MANUAL_RESEARCH.md and HANDOFF.md.
    ]
