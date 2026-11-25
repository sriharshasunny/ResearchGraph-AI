"""Supabase access-token verification for protected ResearchGraph API routes."""
from __future__ import annotations

import os
from typing import Any

import requests
from fastapi import Header, HTTPException


def require_current_user(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    """Verify a Supabase access token against the Auth server and return its user record.

    This intentionally calls Supabase Auth rather than trusting decoded JWT claims.
    It works with both legacy HS256 and current asymmetric signing keys.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Sign in to access your research data.")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise HTTPException(status_code=401, detail="A valid Supabase bearer token is required.")

    supabase_url = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
    anon_key = os.getenv("SUPABASE_ANON_KEY", "").strip()
    if not supabase_url or not anon_key:
        raise HTTPException(status_code=503, detail="Supabase Auth is not configured on the research backend.")

    try:
        response = requests.get(
            f"{supabase_url}/auth/v1/user",
            headers={
                "apikey": anon_key,
                "Authorization": f"Bearer {token.strip()}",
                "Accept": "application/json",
            },
            timeout=(4, 10),
        )
    except requests.RequestException as exc:
        raise HTTPException(status_code=503, detail="Supabase Auth could not be reached.") from exc

    if response.status_code in {401, 403}:
        raise HTTPException(status_code=401, detail="Your session is invalid or expired. Sign in again.")
    if response.status_code != 200:
        raise HTTPException(status_code=503, detail="Supabase Auth could not verify this session.")

    try:
        user = response.json()
    except ValueError as exc:
        raise HTTPException(status_code=503, detail="Supabase Auth returned an invalid user response.") from exc

    user_id = user.get("id") if isinstance(user, dict) else None
    if not isinstance(user_id, str) or not user_id.strip():
        raise HTTPException(status_code=401, detail="The verified session did not contain a user identity.")

    return {"id": user_id, "email": user.get("email") if isinstance(user, dict) else None}
