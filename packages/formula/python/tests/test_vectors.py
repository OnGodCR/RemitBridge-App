import json
import math
from pathlib import Path

import pytest

from remitbridge_formula import TAXED_FUNDING, compute_transfer_cost, remittance_tax

VECTORS = json.loads((Path(__file__).parents[2] / "vectors.json").read_text())["cases"]
TAX = json.loads((Path(__file__).parents[2] / "vectors.tax.json").read_text())

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
    "taxCost": "tax_cost",
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


@pytest.mark.parametrize("case", TAX["cases"], ids=[c["name"] for c in TAX["cases"]])
def test_matches_tax_vectors(case):
    i = case["input"]
    got = compute_transfer_cost(
        sent=i["sent"], fee=i["fee"], quoted_rate=i["quotedRate"], mid_rate=i["midRate"],
        pickup_charge=i["pickupCharge"], transfer_tax=i["transferTax"],
    )
    for ts_key, expected in case["expected"].items():
        actual = got.as_dict()[KEYS[ts_key]]
        assert _close(actual, expected), f"{ts_key}: {actual} vs {expected}"
    assert _close(got.total_cost * i["midRate"], got.shortfall)


@pytest.mark.parametrize("case", TAX["tax"], ids=[c["name"] for c in TAX["tax"]])
def test_remittance_tax(case):
    i = case["input"]
    assert remittance_tax(i["transferAmount"], i["funding"], i.get("date")) == case["expected"]


def test_taxed_funding_is_the_physical_instruments():
    assert TAXED_FUNDING == {"cash", "money_order", "cashiers_check"}


def test_funding_methods_match_the_engine():
    """The engine's payment methods and the formula's funding methods are one list (D83)."""
    from remitbridge_engine.models import PaymentMethod

    from remitbridge_formula import FUNDING_METHODS

    assert {m.value for m in PaymentMethod} == set(FUNDING_METHODS)
