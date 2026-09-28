from datetime import UTC, datetime

import pytest

from remitbridge_engine.models import MidMarketRate


def mid(ccy: str = "INR", rate: float = 95.81) -> MidMarketRate:
    return MidMarketRate(
        send_currency="USD", receive_currency=ccy, rate=rate, source="Frankfurter",
        rate_date="2026-09-28", fetched_at=datetime.now(UTC),
        checks=(("Frankfurter", rate), ("open.er-api", rate * 1.001)), disagreement_pct=0.1,
    )


@pytest.fixture
def no_sleep():
    calls = []

    async def sleep(s):
        calls.append(s)

    sleep.calls = calls
    return sleep
