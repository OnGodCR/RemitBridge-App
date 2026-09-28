import json
import math
from pathlib import Path

import pytest

from remitbridge_formula import compute_transfer_cost

VECTORS = json.loads((Path(__file__).parents[2] / "vectors.json").read_text())["cases"]

# vectors.json uses the TypeScript names; map them to the Python ones.
KEYS = {
    "converted": "converted",
    "amountReceived": "amount_received",
    "benchmarkReceived": "benchmark_received",
    "shortfall": "shortfall",
    "markupPct": "markup_pct",
    "markupCost": "markup_cost",
    "pickupCost": "pickup_cost",
    "feeCost": "fee_cost",
    "totalCost": "total_cost",
    "totalCostPct": "total_cost_pct",
}


def _close(actual: float, expected: float) -> bool:
    return abs(actual - expected) <= 1e-9 * max(1.0, abs(expected))


@pytest.mark.parametrize("case", VECTORS, ids=[c["name"] for c in VECTORS])
def test_matches_truecost_vectors(case):
    i = case["input"]
    got = compute_transfer_cost(
        sent=i["sent"], fee=i["fee"], quoted_rate=i["quotedRate"],
        mid_rate=i["midRate"], pickup_charge=i["pickupCharge"],
    ).as_dict()
    for ts_key, expected in case["expected"].items():
        assert _close(got[KEYS[ts_key]], expected), f"{ts_key}: {got[KEYS[ts_key]]} vs {expected}"


@pytest.mark.parametrize("case", VECTORS, ids=[c["name"] for c in VECTORS])
def test_cost_equals_shortfall_at_mid_market(case):
    i = case["input"]
    r = compute_transfer_cost(
        sent=i["sent"], fee=i["fee"], quoted_rate=i["quotedRate"],
        mid_rate=i["midRate"], pickup_charge=i["pickupCharge"],
    )
    assert math.isclose(r.total_cost * i["midRate"], r.shortfall, rel_tol=1e-9, abs_tol=1e-9)
