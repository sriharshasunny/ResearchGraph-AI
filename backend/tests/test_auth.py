"""Supabase JWT verification tests using synthetic tokens and mocked Auth."""
from __future__ import annotations

from types import SimpleNamespace
import time
import uuid

from cryptography.hazmat.primitives.asymmetric import ec, rsa
from fastapi.testclient import TestClient
import jwt
from jwt.exceptions import PyJWKClientConnectionError, PyJWKClientError
import pytest
import requests

from backend import auth, main


PROJECT_URL = "https://researchgraph-fixture.supabase.co"
USER_ID = "00000000-0000-4000-8000-000000000001"


def _signed_token(
    private_key,
    *,
    algorithm: str = "ES256",
    audience="authenticated",
    issuer=None,
    subject=USER_ID,
    role="authenticated",
    expires_in=120,
    issued_at_offset=0,
    extra_claims: dict | None = None,
    omit_claims: tuple[str, ...] = (),
    kid: str = "fixture-signing-key",
):
    now = int(time.time())
    claims: dict = {
        "iss": issuer if issuer is not None else f"{PROJECT_URL}/auth/v1",
        "sub": subject,
        "aud": audience,
        "role": role,
        "iat": now + issued_at_offset,
        "exp": now + expires_in,
    }
    if extra_claims:
        claims.update(extra_claims)
    for claim_name in omit_claims:
        claims.pop(claim_name, None)
    return jwt.encode(claims, private_key, algorithm=algorithm, headers={"kid": kid})


def _signed_es256_token(private_key, **kwargs):
    return _signed_token(private_key, algorithm="ES256", **kwargs)


def _mock_jwks(monkeypatch, public_key):
    class FakeJwksClient:
        def get_signing_key_from_jwt(self, _token):
            return SimpleNamespace(key=public_key)

    monkeypatch.setenv("SUPABASE_URL", PROJECT_URL)
    monkeypatch.setattr(auth, "_jwks_client", lambda: FakeJwksClient())


def test_verifies_es256_access_token_against_project_jwks(monkeypatch):
    private_key = ec.generate_private_key(ec.SECP256R1())
    _mock_jwks(monkeypatch, private_key.public_key())
    token = _signed_es256_token(private_key)

    assert auth.verify_access_token(token) == uuid.UUID(USER_ID)


def test_verifies_rs256_access_token_against_project_jwks(monkeypatch):
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    _mock_jwks(monkeypatch, private_key.public_key())
    token = _signed_token(private_key, algorithm="RS256")

    assert auth.verify_access_token(token) == uuid.UUID(USER_ID)


def test_rejects_es256_token_with_invalid_signature(monkeypatch):
    signing_key = ec.generate_private_key(ec.SECP256R1())
    other_key = ec.generate_private_key(ec.SECP256R1())
    _mock_jwks(monkeypatch, other_key.public_key())
    token = _signed_es256_token(signing_key)

    with pytest.raises(auth.InvalidAccessToken):
        auth.verify_access_token(token)


@pytest.mark.parametrize(
    "claims",
    [
        {"audience": "anon"},
        {"issuer": "https://another-project.supabase.co/auth/v1"},
        {"subject": "not-a-uuid"},
        {"expires_in": -10},
    ],
)
def test_rejects_es256_tokens_with_invalid_claims(monkeypatch, claims):
    private_key = ec.generate_private_key(ec.SECP256R1())
    _mock_jwks(monkeypatch, private_key.public_key())
    token = _signed_es256_token(private_key, **claims)

    with pytest.raises(auth.InvalidAccessToken):
        auth.verify_access_token(token)


@pytest.mark.parametrize("expires_in", [-1, -10, -300])
def test_rejects_expired_tokens_with_strict_leeway(monkeypatch, expires_in):
    private_key = ec.generate_private_key(ec.SECP256R1())
    _mock_jwks(monkeypatch, private_key.public_key())
    token = _signed_es256_token(private_key, expires_in=expires_in, issued_at_offset=-600)

    with pytest.raises(auth.InvalidAccessToken):
        auth.verify_access_token(token)


@pytest.mark.parametrize("missing_claim", ["exp", "iat", "sub", "aud", "iss", "role"])
def test_rejects_tokens_missing_required_claims(monkeypatch, missing_claim):
    private_key = ec.generate_private_key(ec.SECP256R1())
    _mock_jwks(monkeypatch, private_key.public_key())
    token = _signed_es256_token(private_key, omit_claims=(missing_claim,))

    with pytest.raises(auth.InvalidAccessToken):
        auth.verify_access_token(token)


@pytest.mark.parametrize(
    "kwargs",
    [
        {"role": "anon"},
        {"role": "service_role"},
        {"extra_claims": {"is_anonymous": True}},
        {"extra_claims": {"is_anonymous": "true"}},
    ],
)
def test_rejects_anonymous_or_non_authenticated_role_tokens(monkeypatch, kwargs):
    private_key = ec.generate_private_key(ec.SECP256R1())
    _mock_jwks(monkeypatch, private_key.public_key())
    token = _signed_es256_token(private_key, **kwargs)

    with pytest.raises(auth.InvalidAccessToken):
        auth.verify_access_token(token)


def test_rejects_unknown_kid_from_jwks_client_as_invalid_access_token(monkeypatch):
    private_key = ec.generate_private_key(ec.SECP256R1())

    class UnknownKidJwksClient:
        def get_signing_key_from_jwt(self, _token):
            raise PyJWKClientError('Unable to find a signing key that matches: "unknown-kid"')

    monkeypatch.setenv("SUPABASE_URL", PROJECT_URL)
    monkeypatch.setattr(auth, "_jwks_client", lambda: UnknownKidJwksClient())
    token = _signed_es256_token(private_key, kid="unknown-kid")

    with pytest.raises(auth.InvalidAccessToken):
        auth.verify_access_token(token)


def test_maps_jwks_connection_failure_to_auth_verification_unavailable(monkeypatch):
    private_key = ec.generate_private_key(ec.SECP256R1())

    class OfflineJwksClient:
        def get_signing_key_from_jwt(self, _token):
            raise PyJWKClientConnectionError("Fail to fetch data from the url")

    monkeypatch.setenv("SUPABASE_URL", PROJECT_URL)
    monkeypatch.setattr(auth, "_jwks_client", lambda: OfflineJwksClient())
    token = _signed_es256_token(private_key)

    with pytest.raises(auth.AuthVerificationUnavailable):
        auth.verify_access_token(token)


@pytest.mark.parametrize("malformed_token", ["", "not-a-jwt", "abc.def", "header.payload.sig"])
def test_rejects_malformed_tokens(monkeypatch, malformed_token):
    monkeypatch.setenv("SUPABASE_URL", PROJECT_URL)
    with pytest.raises(auth.InvalidAccessToken):
        auth.verify_access_token(malformed_token)


def test_legacy_hs256_token_is_verified_by_supabase_auth_not_a_local_secret(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", PROJECT_URL)
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_fixture")
    token = jwt.encode(
        {"sub": "00000000-0000-4000-8000-999999999999"},
        "synthetic-test-secret",
        algorithm="HS256",
    )
    calls = []

    class FakeResponse:
        status_code = 200

        def json(self):
            return {"id": USER_ID}

    def fake_get(url, *, headers, timeout):
        calls.append((url, headers, timeout))
        return FakeResponse()

    monkeypatch.setattr(auth.requests, "get", fake_get)
    # Identity comes from validated Supabase Auth response, never unverified JWT sub
    assert auth.verify_access_token(token) == uuid.UUID(USER_ID)
    assert calls[0][0] == f"{PROJECT_URL}/auth/v1/user"
    assert calls[0][1]["Authorization"] == f"Bearer {token}"
    assert calls[0][1]["apikey"] == "sb_publishable_fixture"


@pytest.mark.parametrize("status_code", [401, 403])
def test_legacy_hs256_rejects_token_when_supabase_auth_rejects_it(monkeypatch, status_code):
    monkeypatch.setenv("SUPABASE_URL", PROJECT_URL)
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_fixture")

    class FakeResponse:
        def __init__(self, code):
            self.status_code = code

        def json(self):
            return {}

    monkeypatch.setattr(auth.requests, "get", lambda *_args, **_kwargs: FakeResponse(status_code))
    token = jwt.encode({"sub": USER_ID}, "synthetic-test-secret", algorithm="HS256")
    with pytest.raises(auth.InvalidAccessToken):
        auth.verify_access_token(token)


def test_legacy_hs256_rejects_anonymous_supabase_user(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", PROJECT_URL)
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_fixture")

    class FakeResponse:
        status_code = 200

        def json(self):
            return {"id": USER_ID, "is_anonymous": True}

    monkeypatch.setattr(auth.requests, "get", lambda *_args, **_kwargs: FakeResponse())
    token = jwt.encode({"sub": USER_ID}, "synthetic-test-secret", algorithm="HS256")
    with pytest.raises(auth.InvalidAccessToken):
        auth.verify_access_token(token)


def test_legacy_hs256_requires_publishable_key_configuration(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", PROJECT_URL)
    monkeypatch.delenv("SUPABASE_PUBLISHABLE_KEY", raising=False)
    token = jwt.encode({"sub": USER_ID}, "synthetic-test-secret", algorithm="HS256")

    with pytest.raises(auth.AuthConfigurationError):
        auth.verify_access_token(token)


def test_legacy_hs256_maps_supabase_auth_network_and_5xx_failures_to_unavailable(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", PROJECT_URL)
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_fixture")
    token = jwt.encode({"sub": USER_ID}, "synthetic-test-secret", algorithm="HS256")

    def raise_network_error(*_args, **_kwargs):
        raise requests.ConnectTimeout("timed out")

    monkeypatch.setattr(auth.requests, "get", raise_network_error)
    with pytest.raises(auth.AuthVerificationUnavailable):
        auth.verify_access_token(token)

    class UnavailableResponse:
        status_code = 503

        def json(self):
            return {}

    monkeypatch.setattr(auth.requests, "get", lambda *_args, **_kwargs: UnavailableResponse())
    with pytest.raises(auth.AuthVerificationUnavailable):
        auth.verify_access_token(token)


@pytest.mark.parametrize(
    ("alg", "key"),
    [
        ("none", ""),
        ("HS384", "synthetic-test-secret-384-bit-padding-bytes"),
        ("HS512", "synthetic-test-secret-512-bit-padding-bytes-00000000"),
    ],
)
def test_rejects_unsupported_jwt_algorithm(monkeypatch, alg, key):
    monkeypatch.setenv("SUPABASE_URL", PROJECT_URL)
    token = jwt.encode({"sub": USER_ID}, key=key, algorithm=alg)
    with pytest.raises(auth.InvalidAccessToken):
        auth.verify_access_token(token)


@pytest.mark.parametrize(
    "invalid_url",
    [
        None,
        "",
        "http://researchgraph-fixture.supabase.co",
        "https://user:pass@researchgraph-fixture.supabase.co",
        "https://researchgraph-fixture.supabase.co/unexpected/path",
        "https://researchgraph-fixture.supabase.co?foo=bar",
    ],
)
def test_requires_valid_https_supabase_project_url(monkeypatch, invalid_url):
    if invalid_url is None:
        monkeypatch.delenv("SUPABASE_URL", raising=False)
    else:
        monkeypatch.setenv("SUPABASE_URL", invalid_url)
    with pytest.raises(auth.AuthConfigurationError):
        auth.verify_access_token("not-a-jwt")


def test_fastapi_get_current_user_maps_auth_exceptions_to_expected_http_statuses(monkeypatch):
    client = TestClient(main.app)

    monkeypatch.setattr(
        main,
        "verify_access_token",
        lambda _token: (_ for _ in ()).throw(auth.InvalidAccessToken("bad token")),
    )
    res_401 = client.get("/api/graph", headers={"Authorization": "Bearer synthetic-token"})
    assert res_401.status_code == 401
    assert res_401.headers.get("www-authenticate") == "Bearer"

    monkeypatch.setattr(
        main,
        "verify_access_token",
        lambda _token: (_ for _ in ()).throw(auth.AuthConfigurationError("missing config")),
    )
    res_config_503 = client.get("/api/graph", headers={"Authorization": "Bearer synthetic-token"})
    assert res_config_503.status_code == 503

    monkeypatch.setattr(
        main,
        "verify_access_token",
        lambda _token: (_ for _ in ()).throw(auth.AuthVerificationUnavailable("jwks offline")),
    )
    res_unavail_503 = client.get("/api/graph", headers={"Authorization": "Bearer synthetic-token"})
    assert res_unavail_503.status_code == 503
