"""Every adapter the engine runs. Add a new adapter here after its robots.txt and terms
check passes (DECISIONS.md D4) and its fixture tests are green."""

from __future__ import annotations

from pathlib import Path

from .adapters.base import Adapter
from .adapters.instarem import InstaremAdapter
from .adapters.manual import ManualAdapter
from .adapters.wise import WiseAdapter

MANUAL_DIR = Path(__file__).resolve().parents[2] / "manual" / "quotes"


def all_adapters() -> list[Adapter]:
    return [
        ManualAdapter(MANUAL_DIR),
        # Wise's own Comparison API, with Wise's written permission (DECISIONS.md D91).
        # The other Tier 1 providers stay manual: see docs/MANUAL_RESEARCH.md.
        WiseAdapter(),
        # Instarem's public quote endpoint; its terms and robots.txt allow it (D115).
        InstaremAdapter(),
    ]
