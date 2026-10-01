"""Instarem, through the quote endpoint its own website uses (DECISIONS.md D115).

Checked 2026-10-01: Instarem's terms and its US customer agreement have no clause against
automated access, robots.txt disallows only /wp-admin/, and the endpoint answered a
request carrying our honest user agent. The endpoint is the one instarem.com's calculator
calls; nothing behind a login is touched.

Instarem quotes two prices at once. A visitor who isn't signed in is treated as making a
first transfer, so `destination_amount` uses a first-transfer rate (`instarem_fx_rate`),
which is a one-time offer. Its standing price is `regular_instarem_fx_rate` with the
`regular_*` fees. RemitBridge ranks standing prices (PRD 9.7 check 6), so this adapter
publishes the regular one. Instarem doesn't state the regular amount received, so it's
worked out the way Instarem works out the first-transfer one: fees off the amount sent,
then the rate. Before trusting that, the adapter checks that Instarem's own
first-transfer figure matches the same calculation; if it doesn't, the quote is refused.

Instarem's US customers pay from a bank account (ACH, or a transfer to Instarem), and
money arrives in a bank account, so every quote is a bank deposit paid from a bank account.
"""

from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime, timedelta

from ..config import MATH_TOLERANCE_ABS, MATH_TOLERANCE_REL, ROUTES_BY_ID
from ..http import PoliteClient
from ..models import DeliveryMethod, ParsedQuote, QuoteRequest, RawResponse, Source, Strategy
from .base import Adapter, AdapterMeta, RouteSupport, _shape

API = "https://www.instarem.com/api/v1/public/transaction/computed-value"

# Instarem stamps when it last updated its rate. Older than this isn't a live price.
MAX_AGE = timedelta(hours=6)

# Currencies Instarem pays out in whole units.
NO_DECIMALS = {"VND"}

# Every field this adapter reads. The fingerprint covers these and nothing else, so a field
# Instarem adds or drops elsewhere in the response isn't drift.
READ = (
    "source_currency", "destination_currency", "country_code", "gross_source_amount",
    "net_source_amount", "destination_amount", "instarem_fx_rate", "regular_instarem_fx_rate",
    "regular_transaction_fee_amount", "regular_payment_method_fee_amount",
    "regular_payout_method_fee_amount", "net_tax_amount", "coupon_amount", "warning_message",
)


class InstaremAdapter(Adapter):
    meta = AdapterMeta(
        adapter_id="instarem",
        provider_id="instarem",
        provider_name="Instarem",
        provider_type="fintech",
        website="https://www.instarem.com",
        version="1",
        maintainer="angad",
        last_verified="2026-10-01",
        robots_note="robots.txt disallows only /wp-admin/ (checked 2026-10-01)",
        terms_note=(
            "Terms and conditions and the US customer agreement have no automated-access "
            "clause (read 2026-10-01). Only the public quote endpoint is called."
        ),
        min_delay_s=5.0,
    )
    source = Source.SCRAPER
    strategies = (Strategy.JSON_ENDPOINT,)

    def corridors(self) -> list[RouteSupport]:
        return [RouteSupport(route_id, (DeliveryMethod.BANK_DEPOSIT,)) for route_id in ROUTES_BY_ID]

    async def fetch_quote(self, http: PoliteClient, strategy: Strategy, req: QuoteRequest) -> RawResponse:
        r = await http.get(
            API,
            params={
                "source_currency": req.send_currency,
                "destination_currency": req.receive_currency,
                "source_amount": _amount(req.send_amount),
                "country_code": "US",
            },
        )
        return RawResponse(r.content, r.headers.get("content-type", ""), str(r.url), r.status_code, strategy)

    def parse(self, raw: RawResponse, req: QuoteRequest) -> ParsedQuote:
        body = json.loads(raw.body)
        if body.get("success") is not True:
            raise ValueError("Instarem answered without a quote")
        d = body["data"]
        if (d.get("source_currency"), d.get("destination_currency")) != (req.send_currency, req.receive_currency):
            raise ValueError(f"answered {d.get('source_currency')}->{d.get('destination_currency')}, not the pair asked for")
        if d.get("country_code") != "US":
            raise ValueError(f"answered for senders in {d.get('country_code')}, not the US")
        if float(d.get("gross_source_amount", -1)) != req.send_amount:
            raise ValueError("answered for a different amount than the one asked for")
        if d.get("warning_message"):
            raise ValueError(f"Instarem warned: {d['warning_message']}")
        if float(d.get("net_tax_amount") or 0) != 0 or float(d.get("coupon_amount") or 0) != 0:
            raise ValueError("the quote carries a tax or a coupon, which this adapter doesn't read")

        # Check the calculation on Instarem's own figure before using it for the standing price.
        stated = float(d["destination_amount"])
        worked = float(d["net_source_amount"]) * float(d["instarem_fx_rate"])
        if abs(stated - worked) > max(MATH_TOLERANCE_ABS, MATH_TOLERANCE_REL * stated):
            raise ValueError(f"Instarem's own figure {stated} isn't amount x rate ({worked:.2f})")

        rate = float(d["regular_instarem_fx_rate"])
        fee = sum(
            float(d.get(k) or 0)
            for k in (
                "regular_transaction_fee_amount",
                "regular_payment_method_fee_amount",
                "regular_payout_method_fee_amount",
            )
        )
        if rate <= 0 or fee < 0 or fee >= req.send_amount:
            raise ValueError(f"implausible standing rate {rate} or fee {fee}")
        places = 0 if req.receive_currency in NO_DECIMALS else 2
        received = round((req.send_amount - fee) * rate, places)

        updated = datetime.fromisoformat(d["transaction_config"]["fx_rate_last_updated"])
        if datetime.now(UTC) - updated > MAX_AGE:
            raise ValueError(f"Instarem's rate was set at {updated.isoformat()}, too long ago to call it current")

        return ParsedQuote(
            send_amount=req.send_amount,
            fee=fee,
            offered_rate=rate,
            amount_received=received,
            captured_at=updated,
            source_url=raw.url,
        )

    def fingerprint(self, raw: RawResponse) -> str | None:
        try:
            d = json.loads(raw.body)["data"]
            read = {k: d.get(k) for k in READ}
            # Optional fields are null on most quotes; their type isn't the shape.
            read = {k: (0 if v is None and k in ("coupon_amount", "net_tax_amount") else v) for k, v in read.items()}
            read["fx_rate_last_updated"] = d["transaction_config"]["fx_rate_last_updated"]
            return hashlib.sha256(_shape(read).encode()).hexdigest()[:16]
        except (ValueError, KeyError, TypeError):
            return None


def _amount(x: float) -> str:
    return str(int(x)) if x == int(x) else str(x)
