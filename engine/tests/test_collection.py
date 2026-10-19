from datetime import UTC, datetime, timedelta

from remitbridge_engine.collection import prepare_collection


def row(tmp_path):
    evidence = tmp_path / 'quote.jpg'
    evidence.write_bytes(b'evidence')
    return {
        'outcome': 'verified_quote', 'provider_id': 'moneygram', 'route_id': 'us-in',
        'receiving_currency': 'INR', 'delivery_method': 'bank_deposit',
        'payment_method': 'bank_account', 'send_amount': '500', 'fee': '1.99',
        'offered_rate': '95', 'amount_received': '47310.95',
        'observed_at_utc': (datetime.now(UTC) - timedelta(days=2)).isoformat(),
        'evidence_file': str(evidence), 'source_url': 'https://example.com/quote',
        'pickup_charge_status': 'ignored_by_user', 'pickup_charge': '',
        'price_basis': 'regular_terms', 'promo_text': 'First transfer: fee waived',
    }


def test_regular_terms_keep_original_date_and_promotional_evidence(tmp_path):
    original = row(tmp_path)
    [obs], held = prepare_collection([original])
    assert not held
    assert obs['observed_at'] == original['observed_at_utc']
    assert obs['promo_text'] is None
    assert obs['collection_evidence']['promo_text'] == original['promo_text']
    assert obs['collection_evidence']['pickup_charge'] == ''


def test_missing_methods_currency_mismatch_and_old_quotes_stay_held(tmp_path):
    original = row(tmp_path)
    samples = [dict(original, payment_method=''), dict(original, receiving_currency='USD'),
               dict(original, observed_at_utc=(datetime.now(UTC) - timedelta(days=8)).isoformat()),
               dict(original, outcome='incomplete_quote'), dict(original, offered_rate='nan')]
    observations, held = prepare_collection(samples)
    assert observations == []
    assert len(held) == len(samples)


def test_promotional_quote_stays_labelled(tmp_path):
    [obs], held = prepare_collection([dict(row(tmp_path), price_basis='promotional')])
    assert not held
    assert obs['promo_text'].startswith('Promotional:')


def weekly(tmp_path, **over):
    evidence = tmp_path / 'rate.png'
    evidence.write_bytes(b'rate')
    base = {
        'provider_id': 'moneygram', 'route_id': 'us-in', 'typed_amount_usd': '500',
        'delivery_method': 'bank_deposit', 'payment_method': 'bank_account', 'offered_rate': '96',
        'receiving_currency': 'INR', 'rate_outcome': 'verified_rate', 'review_status': 'verified_rate_only',
        'price_basis': 'regular_terms', 'observed_at_utc': (datetime.now(UTC) - timedelta(days=1)).isoformat(),
        'evidence_file': str(evidence), 'source_url': 'https://example.com/rate', 'promo_text': '',
    }
    return {**base, **over}


def fee_quote(days_old=5, **over):
    base = {
        'provider_id': 'moneygram', 'route_id': 'us-in', 'send_amount': 501.99, 'fee': 1.99,
        'delivery_method': 'bank_deposit', 'payment_method': 'bank_account', 'source_url': 'https://example.com/fee',
        'observed_at': (datetime.now(UTC) - timedelta(days=days_old)).isoformat(), 'delivery_time': 'minutes',
        'collection_evidence': {'typed_amount_usd': '500', 'price_basis': 'regular', 'evidence_file': 'fee.png'},
    }
    return {**base, **over}


def test_weekly_rate_takes_the_monthly_fee_and_keeps_both_dates(tmp_path):
    from remitbridge_engine.collection import combine_weekly_rates
    rate = weekly(tmp_path)
    [obs], held = combine_weekly_rates([rate], [fee_quote(days_old=9), fee_quote(days_old=5, fee=2.99)])
    assert not held
    assert obs['fee'] == 2.99  # the newest fee wins
    assert obs['offered_rate'] == 96
    assert obs['amount_received'] == round((501.99 - 2.99) * 96, 2)
    assert obs['observed_at'] == rate['observed_at_utc']
    assert obs['collection_evidence']['fee_observed_at'] != obs['observed_at']


def test_weekly_rate_is_held_without_a_fresh_matching_fee(tmp_path):
    from remitbridge_engine.collection import combine_weekly_rates
    samples = [
        (weekly(tmp_path), [fee_quote(days_old=40)]),                       # fee past the month
        (weekly(tmp_path, payment_method=''), [fee_quote()]),               # funding not shown: no guess
        (weekly(tmp_path, price_basis='first_transfer'), [fee_quote()]),    # promo rate, regular fee
        (weekly(tmp_path, review_status='held_change_confirmation'), [fee_quote()]),
        (weekly(tmp_path, typed_amount_usd='200'), [fee_quote()]),
        (weekly(tmp_path, observed_at_utc=(datetime.now(UTC) - timedelta(days=8)).isoformat()), [fee_quote()]),
    ]
    for rate, fees in samples:
        observations, held = combine_weekly_rates([rate], fees)
        assert observations == [] and len(held) == 1
