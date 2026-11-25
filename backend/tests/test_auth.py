"""Supabase JWT verification tests using synthetic tokens and mocked Auth."""
from __future__ import annotations

from types import SimpleNamespace
import time
import uuid

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec

from backend import auth


PROJECT_URL = "https://researchgraph-fixture.supabase.co"
USER_ID = "00000000-0000-4000-8000-000000000001"


def _signed_es256_token(private_key, *, audience="authenticated", issuer=None, subject=USER_ID, expires_in=120):
    now = int(time.time())
    claims = {
        "iss": issuer or f"{PROJECT_URL}/auth/v1",
        "sub": subject,
        "aud": audience,
        "role": "authenticated",
        "iat": now,
        "exp": now + expires_in,
    }
    return jwt.encode(claims, private_key, algorithm="ES256", headers={"kid": "fixture-signing-key"})


def test_verifies_es256_access_token_against_project_jwks(monkeypatch):
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()

    class FakeJwksClient:
        def get_signing_key_from_jwt(self, _token):
            return SimpleNamespace(key=public_key)

    monkeypatch.setenv("SUPABASE_URL", PROJECT_URL)
    monkeypatch.setattr(auth, "_jwks_client", lambda: FakeJwksClient())
    token = _signed_es256_token(private_key)

    assert auth.verify_access_token(token) == uuid.UUID(USER_ID)


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
    public_key = private_key.public_key()

    class FakeJwksClient:
        def get_signing_key_from_jwt(self, _token):
            return SimpleNamespace(key=public_key)

    monkeypatch.setenv("SUPABASE_URL", PROJECT_URL)
    monkeypatch.setattr(auth, "_jwks_client", lambda: FakeJwksClient())
    token = _signed_es256_token(private_key, **claims)

    with pytest.raises(auth.InvalidAccessToken):
        auth.verify_access_token(token)


def test_legacy_hs256_token_is_verified_by_supabase_auth_not_a_local_secret(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", PROJECT_URL)
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_fixture")
    token = jwt.encode({"sub": USER_ID}, "synthetic-test-secret", algorithm="HS256")
    calls = []

    class FakeResponse:
        status_code = 200

        def json(self):
            return {"id": USER_ID}

    def fake_get(url, *, headers, timeout):
        calls.append((url, headers, timeout))
        return FakeResponse()

    monkeypatch.setattr(auth.requests, "get", fake_get)
    assert auth.verify_access_token(token) == uuid.UUID(USER_ID)
    assert calls[0][0] == f"{PROJECT_URL}/auth/v1/user"
    assert calls[0][1]["Authorization"] == f"Bearer {token}"
    assert calls[0][1]["apikey"] == "sb_publishable_fixture"


def test_legacy_hs256_rejects_token_when_supabase_auth_rejects_it(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", PROJECT_URL)
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_fixture")

    class FakeResponse:
        status_code = 401

        def json(self):
            return {}

    monkeypatch.setattr(auth.requests, "get", lambda *_args, **_kwargs: FakeResponse())
    token = jwt.encode({"sub": USER_ID}, "synthetic-test-secret", algorithm="HS256")
    with pytest.raises(auth.InvalidAccessToken):
        auth.verify_access_token(token)


def test_rejects_unsupported_jwt_algorithm(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", PROJECT_URL)
    token = jwt.encode({"sub": USER_ID}, key="", algorithm="none")
    with pytest.raises(auth.InvalidAccessToken):
        auth.verify_access_token(token)


def test_requires_supabase_project_url(monkeypatch):
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    with pytest.raises(auth.AuthConfigurationError):
        auth.verify_access_token("not-a-jwt")
