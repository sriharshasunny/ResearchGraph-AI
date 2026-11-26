"""Transactional Supabase paper identity resolution service."""
from __future__ import annotations

from dataclasses import dataclass, field
import os
from typing import Any, Literal, Sequence
from urllib.parse import urlparse
import uuid

import requests

try:
    from .identifiers import (
        InvalidIdentifierError,
        NormalizedIdentifier,
        normalize_identifier,
        normalize_uuid,
    )
except ImportError:  # Supports backend-root execution: uvicorn main:app
    from identifiers import (
        InvalidIdentifierError,
        NormalizedIdentifier,
        normalize_identifier,
        normalize_uuid,
    )

SourceProvider = Literal["openalex", "arxiv", "crossref", "manual_upload", "other"]
AccessType = Literal["open_access_pdf", "abstract_only", "metadata_only", "private_upload", "unknown"]

ALLOWED_SOURCE_PROVIDERS = {"openalex", "arxiv", "crossref", "manual_upload", "other"}
ALLOWED_ACCESS_TYPES = {"open_access_pdf", "abstract_only", "metadata_only", "private_upload", "unknown"}


class PaperIdentityError(RuntimeError):
    """Base error for paper identity resolution failures."""


class IdentityConfigurationError(PaperIdentityError):
    """Supabase URL or publishable key configuration is missing or invalid."""


class IdentityAuthenticationError(PaperIdentityError):
    """Caller access token is missing or rejected by Supabase."""


class IdentityValidationError(PaperIdentityError):
    """Supplied identifiers or paper metadata failed validation."""


class AliasConflictError(PaperIdentityError):
    """Supplied identifiers map to more than one existing paper for the owner."""

    def __init__(self, message: str, conflicting_paper_ids: tuple[str, ...] = ()) -> None:
        super().__init__(message)
        self.conflicting_paper_ids = conflicting_paper_ids


class IdentityServiceUnavailable(PaperIdentityError):
    """Supabase PostgREST RPC endpoint could not be reached or failed transiently."""


@dataclass(frozen=True, slots=True)
class PaperMetadataInput:
    title: str = "Untitled paper"
    abstract: str | None = None
    publication_year: int | None = None
    venue: str | None = None
    source_provider: SourceProvider = "other"
    source_url: str | None = None
    pdf_url: str | None = None
    open_access: bool | None = None
    access_type: AccessType = "metadata_only"
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class PaperResolutionResult:
    paper_id: uuid.UUID
    created: bool
    identifiers: tuple[NormalizedIdentifier, ...]


def _supabase_rpc_config() -> tuple[str, str]:
    raw_url = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
    parsed = urlparse(raw_url)
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
        raise IdentityConfigurationError("SUPABASE_URL must be the HTTPS URL of the Supabase project.")
    publishable_key = os.getenv("SUPABASE_PUBLISHABLE_KEY", "").strip()
    if not publishable_key:
        raise IdentityConfigurationError(
            "SUPABASE_PUBLISHABLE_KEY is required for authenticated Supabase RPC calls."
        )
    return f"{parsed.scheme}://{parsed.netloc}", publishable_key


def _validated_identifiers(
    identifiers: Sequence[NormalizedIdentifier],
) -> tuple[NormalizedIdentifier, ...]:
    if not identifiers or isinstance(identifiers, (str, bytes)):
        raise IdentityValidationError("At least one normalized identifier is required.")
    if len(identifiers) > 50:
        raise IdentityValidationError("At most 50 identifiers can be resolved in one call.")

    deduped: dict[tuple[str, str], NormalizedIdentifier] = {}
    for item in identifiers:
        if not isinstance(item, NormalizedIdentifier):
            raise IdentityValidationError("Each identifier must be a NormalizedIdentifier instance.")
        try:
            # Re-run typed Stage 8A validation on original_value so malformed or forged
            # normalized_value fields cannot reach the database RPC.
            checked = normalize_identifier(item.identifier_type, item.original_value)
        except InvalidIdentifierError as exc:
            raise IdentityValidationError(str(exc)) from exc
        if checked.normalized_value != item.normalized_value:
            raise IdentityValidationError(
                f"Mismatched normalized_value for {item.identifier_type} identifier."
            )
        deduped.setdefault((checked.identifier_type, checked.normalized_value), checked)
    return tuple(deduped.values())


def _infer_identifier_provider(identifier: NormalizedIdentifier, default_provider: str) -> str:
    if identifier.identifier_type in {"openalex", "arxiv"}:
        return identifier.identifier_type
    return default_provider if default_provider in ALLOWED_SOURCE_PROVIDERS else "other"


def _build_paper_payload(paper: PaperMetadataInput | None) -> dict[str, Any]:
    data = paper or PaperMetadataInput()
    if data.source_provider not in ALLOWED_SOURCE_PROVIDERS:
        raise IdentityValidationError("Unsupported source_provider for paper metadata.")
    if data.access_type not in ALLOWED_ACCESS_TYPES:
        raise IdentityValidationError("Unsupported access_type for paper metadata.")
    if data.publication_year is not None and not (
        isinstance(data.publication_year, int)
        and not isinstance(data.publication_year, bool)
        and 1000 <= data.publication_year <= 3000
    ):
        raise IdentityValidationError("publication_year must be an integer between 1000 and 3000.")
    if not isinstance(data.metadata, dict):
        raise IdentityValidationError("paper metadata must be a dictionary.")

    title = (data.title or "").strip()[:2000] or "Untitled paper"
    payload: dict[str, Any] = {
        "title": title,
        "source_provider": data.source_provider,
        "access_type": data.access_type,
        "metadata": dict(data.metadata),
    }
    if data.abstract is not None:
        payload["abstract"] = data.abstract
    if data.publication_year is not None:
        payload["publication_year"] = data.publication_year
    if data.venue is not None:
        payload["venue"] = data.venue
    if data.source_url is not None:
        payload["source_url"] = data.source_url
    if data.pdf_url is not None:
        payload["pdf_url"] = data.pdf_url
    if data.open_access is not None:
        payload["open_access"] = bool(data.open_access)
    return payload


def _parse_conflict_ids(message: str) -> tuple[str, ...]:
    start = message.rfind("(")
    end = message.rfind(")")
    if start == -1 or end <= start + 1:
        return ()
    raw_items = [item.strip() for item in message[start + 1:end].split(",")]
    valid: list[str] = []
    for item in raw_items:
        try:
            valid.append(normalize_uuid(item))
        except InvalidIdentifierError:
            continue
    return tuple(valid)


def _map_rpc_error(status_code: int, body: dict[str, Any]) -> PaperIdentityError:
    code = str(body.get("code") or "")
    msg = str(body.get("message") or "")

    if code == "P0409" or "RG_ALIAS_CONFLICT" in msg or status_code == 409:
        return AliasConflictError(
            "Supplied identifiers resolve to multiple existing papers.",
            conflicting_paper_ids=_parse_conflict_ids(msg),
        )
    if code == "28000" or "RG_UNAUTHENTICATED" in msg or status_code in (401, 403):
        return IdentityAuthenticationError("Authenticated Supabase session is required.")
    if code == "22023" or "RG_INVALID_IDENTIFIER" in msg or "RG_INVALID_PAPER_PAYLOAD" in msg:
        return IdentityValidationError("Paper identifier payload is invalid.")
    if status_code >= 500 or status_code == 429:
        return IdentityServiceUnavailable("Paper identity resolution service is temporarily unavailable.")
    return PaperIdentityError("Paper identity resolution failed.")


def resolve_or_create_paper(
    *,
    access_token: str,
    identifiers: Sequence[NormalizedIdentifier],
    paper: PaperMetadataInput | None = None,
) -> PaperResolutionResult:
    """Resolve external identifiers to one owner-scoped internal paper UUID via Supabase RPC."""
    if not isinstance(access_token, str) or not access_token.strip():
        raise IdentityAuthenticationError("An authenticated Supabase access token is required.")

    project_url, publishable_key = _supabase_rpc_config()
    validated = _validated_identifiers(identifiers)
    paper_payload = _build_paper_payload(paper)
    default_provider = str(paper_payload["source_provider"])

    rpc_identifiers = [
        {
            "identifier_type": item.identifier_type,
            "original_value": item.original_value,
            "normalized_value": item.normalized_value,
            "source_provider": _infer_identifier_provider(item, default_provider),
            "is_primary": idx == 0,
        }
        for idx, item in enumerate(validated)
    ]

    try:
        response = requests.post(
            f"{project_url}/rest/v1/rpc/resolve_or_create_paper",
            json={"p_identifiers": rpc_identifiers, "p_paper": paper_payload},
            headers={
                "apikey": publishable_key,
                "Authorization": f"Bearer {access_token.strip()}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout=(3, 10),
        )
    except requests.RequestException as exc:
        raise IdentityServiceUnavailable("Could not reach Supabase identity service.") from exc

    if response.status_code >= 400:
        try:
            err_body = response.json()
            if not isinstance(err_body, dict):
                err_body = {}
        except ValueError:
            err_body = {}
        raise _map_rpc_error(response.status_code, err_body)

    try:
        data = response.json()
    except ValueError as exc:
        raise PaperIdentityError("Supabase RPC returned malformed JSON.") from exc

    if not isinstance(data, dict):
        raise PaperIdentityError("Supabase RPC returned an unexpected response structure.")

    raw_paper_id = data.get("paper_id")
    created = data.get("created")
    if not isinstance(raw_paper_id, str) or not isinstance(created, bool):
        raise PaperIdentityError("Supabase RPC response missed required paper_id or created fields.")

    try:
        canonical_uuid = uuid.UUID(normalize_uuid(raw_paper_id))
    except InvalidIdentifierError as exc:
        raise PaperIdentityError("Supabase RPC returned an invalid paper_id UUID.") from exc

    return PaperResolutionResult(
        paper_id=canonical_uuid,
        created=created,
        identifiers=validated,
    )
