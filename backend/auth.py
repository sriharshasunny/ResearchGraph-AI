"""Supabase access-token verification for the ResearchGraph API."""
from __future__ import annotations

from functools import lru_cache
import os
from urllib.parse import urlparse
import uuid

import jwt
import requests
from jwt.exceptions import InvalidTokenError, PyJWKClientConnectionError
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
    if parsed.scheme != "https" or not parsed.netloc or parsed.username or parsed.password:
        raise AuthConfigurationError("SUPABASE_URL must be the HTTPS URL of the Supabase project.")
    return raw


@lru_cache(maxsize=1)
def _jwks_client() -> PyJWKClient:
    url = f"{_supabase_url()}/auth/v1/.well-known/jwks.json"
    # Supabase's JWKS discovery endpoint is edge-cached for 10 minutes.
    # A shorter local cache makes key rotation/revocation visible promptly.
    return PyJWKClient(url, cache_jwk_set=True, lifespan=300, timeout=5)


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
        # The Auth endpoint validates the signature and session. Its returned user
        # ID, not an unverified JWT claim, is the source of the identity.
        return uuid.UUID(str(user["id"]))
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

    if algorithm not in {"ES256", "RS256"}:
        raise InvalidAccessToken("The access token uses an unsupported signing algorithm.")

    try:
        signing_key = _jwks_client().get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=[algorithm],
            audience="authenticated",
            issuer=f"{project_url}/auth/v1",
            leeway=30,
            options={"require": ["exp", "iat", "sub", "aud", "iss", "role"]},
        )
    except PyJWKClientConnectionError as exc:
        raise AuthVerificationUnavailable("Supabase signing keys could not be reached.") from exc
    except InvalidTokenError as exc:
        raise InvalidAccessToken("The Supabase access token is invalid or expired.") from exc
    except (OSError, TimeoutError, requests.RequestException) as exc:
        raise AuthVerificationUnavailable("Supabase signing keys could not be reached.") from exc
    except (ValueError, TypeError, RecursionError) as exc:
        raise InvalidAccessToken("The access token is malformed.") from exc

    if claims.get("role") != "authenticated" or claims.get("is_anonymous") is True:
        raise InvalidAccessToken("A signed-in user access token is required.")

    try:
        return uuid.UUID(str(claims["sub"]))
    except (ValueError, TypeError, KeyError) as exc:
        raise InvalidAccessToken("The access token does not contain a valid user ID.") from exc
