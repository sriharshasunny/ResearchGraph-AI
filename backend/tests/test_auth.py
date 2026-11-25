"""Supabase Auth verification tests use a mocked Auth endpoint."""
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from backend import auth


def test_require_current_user_verifies_token_with_supabase(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co/")
    monkeypatch.setenv("SUPABASE_ANON_KEY", "test-anon-key")
    calls = []

    def fake_get(url, *, headers, timeout):
        calls.append((url, headers, timeout))
        return SimpleNamespace(status_code=200, json=lambda: {"id": "user-123", "email": "student@example.test"})

    monkeypatch.setattr(auth.requests, "get", fake_get)
    result = auth.require_current_user("Bearer test-access-token")

    assert result["id"] == "user-123"
    assert result["access_token"] == "test-access-token"
    assert calls[0][0] == "https://example.supabase.co/auth/v1/user"
    assert calls[0][1]["apikey"] == "test-anon-key"
    assert calls[0][1]["Authorization"] == "Bearer test-access-token"
    assert calls[0][2] == (4, 10)


@pytest.mark.parametrize("authorization", [None, "", "Basic abc", "Bearer "])
def test_require_current_user_rejects_missing_or_invalid_authorization(authorization):
    with pytest.raises(HTTPException) as error:
        auth.require_current_user(authorization)
    assert error.value.status_code == 401


def test_require_current_user_rejects_expired_token(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_ANON_KEY", "test-anon-key")
    monkeypatch.setattr(auth.requests, "get", lambda *_args, **_kwargs: SimpleNamespace(status_code=401, json=lambda: {}))
    with pytest.raises(HTTPException) as error:
        auth.require_current_user("Bearer expired-token")
    assert error.value.status_code == 401


def test_require_current_user_requires_supabase_configuration(monkeypatch):
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_ANON_KEY", raising=False)
    with pytest.raises(HTTPException) as error:
        auth.require_current_user("Bearer valid-looking-token")
    assert error.value.status_code == 503


def test_require_current_user_rejects_response_without_user_id(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_ANON_KEY", "test-anon-key")
    monkeypatch.setattr(auth.requests, "get", lambda *_args, **_kwargs: SimpleNamespace(status_code=200, json=lambda: {"email": "x@example.test"}))
    with pytest.raises(HTTPException) as error:
        auth.require_current_user("Bearer token")
    assert error.value.status_code == 401
