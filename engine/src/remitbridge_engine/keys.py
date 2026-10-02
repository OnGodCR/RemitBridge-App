"""The service key's headers (DECISIONS.md D137).

Supabase's legacy service_role key is a token signed with the project's JWT secret, so it is
sent both as the apikey and as a bearer token. Its newer secret key (sb_secret_...) is not a
token: it goes only in the apikey header, and the gateway turns it into service access. The
GitHub secret can hold either, so revoking the old JWT secret needs no code change here.
"""


def key_headers(key: str) -> dict[str, str]:
    if key.startswith("sb_"):
        return {"apikey": key}
    return {"apikey": key, "Authorization": f"Bearer {key}"}
