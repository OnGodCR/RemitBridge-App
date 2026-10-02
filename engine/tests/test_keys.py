"""The service key's headers (D137): a legacy token as apikey and bearer, a newer key as apikey only."""

from remitbridge_engine.keys import key_headers


def test_legacy_key_is_also_a_bearer_token():
    assert key_headers("eyJhbGciOi.legacy") == {"apikey": "eyJhbGciOi.legacy", "Authorization": "Bearer eyJhbGciOi.legacy"}


def test_new_secret_key_goes_only_in_apikey():
    assert key_headers("sb_secret_abc") == {"apikey": "sb_secret_abc"}
