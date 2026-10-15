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
