"""Supabase access-token verification for the ResearchGraph API."""
from __future__ import annotations

from functools import lru_cache
import os
from urllib.parse import urlparse
import uuid

import jwt
import requests
from jwt.exceptions import (
    InvalidTokenError,
    PyJWKClientConnectionError,
    PyJWKClientError,
)
from jwt import PyJWKClient


class AuthConfigurationError(RuntimeError):
    """The backend is missing the public Supabase settings required for auth."""


class InvalidAccessToken(RuntimeError):
    """The request did not contain a valid Supabase user access token."""


class AuthVerificationUnavailable(RuntimeError):
    """The Supabase signing-key or Auth endpoint could not be reached."""


def _supabase_url() -> str:
    raw = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
    parsed = urlparse(raw)
    if (
        parsed.scheme != "https"
        or not parsed.netloc
        or not parsed.hostname
        or parsed.username
        or parsed.password
        or parsed.path not in ("", "/")
        or parsed.params
        or parsed.query
        or parsed.fragment
    ):
        raise AuthConfigurationError("SUPABASE_URL must be the HTTPS URL of the Supabase project.")
    return f"{parsed.scheme}://{parsed.netloc}"


@lru_cache(maxsize=4)
def _jwks_client_for_url(jwks_url: str) -> PyJWKClient:
    # Supabase's JWKS discovery endpoint is edge-cached for 10 minutes.
    # A shorter local cache makes key rotation/revocation visible promptly.
    return PyJWKClient(jwks_url, cache_jwk_set=True, lifespan=300, timeout=5)


def _jwks_client() -> PyJWKClient:
    return _jwks_client_for_url(f"{_supabase_url()}/auth/v1/.well-known/jwks.json")


def _verify_legacy_hs256(token: str, project_url: str) -> uuid.UUID:
    publishable_key = os.getenv("SUPABASE_PUBLISHABLE_KEY", "").strip()
    if not publishable_key:
        raise AuthConfigurationError(
            "SUPABASE_PUBLISHABLE_KEY is required when the Supabase project uses HS256 signing."
        )

    try:
        response = requests.get(
            f"{project_url}/auth/v1/user",
            headers={
                "apikey": publishable_key,
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
            },
            timeout=(3, 8),
        )
    except requests.RequestException as exc:
        raise AuthVerificationUnavailable("Supabase Auth could not be reached.") from exc

    if response.status_code in (401, 403):
        raise InvalidAccessToken("The Supabase access token is invalid or expired.")
    if response.status_code != 200:
        raise AuthVerificationUnavailable("Supabase Auth could not verify the access token.")

    try:
        user = response.json()
        if not isinstance(user, dict):
            raise InvalidAccessToken("Supabase Auth returned an invalid user identity.")
        if user.get("is_anonymous") in (True, "true", 1):
            raise InvalidAccessToken("A signed-in user access token is required.")
        if "role" in user and user.get("role") != "authenticated":
            raise InvalidAccessToken("A signed-in user access token is required.")
        user_id = user.get("id")
        if not isinstance(user_id, str) or not user_id.strip():
            raise InvalidAccessToken("Supabase Auth returned an invalid user identity.")
        # The Auth endpoint validates the signature and session. Its returned user
        # ID, not an unverified JWT claim, is the source of the identity.
        return uuid.UUID(user_id)
    except InvalidAccessToken:
        raise
    except (ValueError, KeyError, TypeError) as exc:
        raise InvalidAccessToken("Supabase Auth returned an invalid user identity.") from exc


def verify_access_token(token: str) -> uuid.UUID:
    """Verify a Supabase user access token and return its trusted user UUID.

    Asymmetric ES256/RS256 tokens are verified locally against Supabase JWKS.
    Legacy HS256 tokens are validated by Supabase Auth itself; the JWT secret is
    deliberately never copied into this backend.
    """
    if not isinstance(token, str) or not token or len(token) > 16384:
        raise InvalidAccessToken("A valid Supabase access token is required.")

    project_url = _supabase_url()
    try:
        header = jwt.get_unverified_header(token)
        algorithm = header.get("alg")
    except (InvalidTokenError, ValueError, TypeError, RecursionError) as exc:
        raise InvalidAccessToken("The access token is malformed.") from exc

    if algorithm == "HS256":
        return _verify_legacy_hs256(token, project_url)

    if not isinstance(algorithm, str) or algorithm not in {"ES256", "RS256"}:
        raise InvalidAccessToken("The access token uses an unsupported signing algorithm.")

    try:
        signing_key = _jwks_client().get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=[algorithm],
            audience="authenticated",
            issuer=f"{project_url}/auth/v1",
            leeway=0,
            options={
                "require": ["exp", "iat", "sub", "aud", "iss", "role"],
                "verify_signature": True,
                "verify_exp": True,
                "verify_iat": True,
                "verify_aud": True,
                "verify_iss": True,
            },
        )
    except PyJWKClientConnectionError as exc:
        raise AuthVerificationUnavailable("Supabase signing keys could not be reached.") from exc
    except PyJWKClientError as exc:
        raise InvalidAccessToken("The Supabase access token signing key is unknown or invalid.") from exc
    except InvalidTokenError as exc:
        raise InvalidAccessToken("The Supabase access token is invalid or expired.") from exc
    except (OSError, TimeoutError, requests.RequestException) as exc:
        raise AuthVerificationUnavailable("Supabase signing keys could not be reached.") from exc
    except (ValueError, TypeError, RecursionError) as exc:
        raise InvalidAccessToken("The access token is malformed.") from exc

    if claims.get("role") != "authenticated" or claims.get("is_anonymous") in (True, "true", 1):
        raise InvalidAccessToken("A signed-in user access token is required.")

    subject = claims.get("sub")
    if not isinstance(subject, str) or not subject.strip():
        raise InvalidAccessToken("The access token does not contain a valid user ID.")
    try:
        return uuid.UUID(subject)
    except (ValueError, TypeError, KeyError) as exc:
        raise InvalidAccessToken("The access token does not contain a valid user ID.") from exc
