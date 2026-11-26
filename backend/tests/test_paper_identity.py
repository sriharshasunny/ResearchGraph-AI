"""Unit tests and env-gated DB integration tests for Stage 8B paper identity resolution."""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
import os
import threading
import uuid

import pytest
import requests

from backend import paper_identity
from backend.identifiers import (
    NormalizedIdentifier,
    normalize_arxiv,
    normalize_doi,
    normalize_openalex,
)
from backend.paper_identity import (
    AliasConflictError,
    IdentityAuthenticationError,
    IdentityConfigurationError,
    IdentityServiceUnavailable,
    IdentityValidationError,
    PaperIdentityError,
    PaperMetadataInput,
    PaperResolutionResult,
    resolve_or_create_paper,
)

PROJECT_URL = "https://researchgraph-fixture.supabase.co"
USER_A = "00000000-0000-4000-8000-000000000001"
USER_B = "00000000-0000-4000-8000-000000000002"
TOKEN_A = "Bearer-subject-A-jwt-fixture"
TOKEN_B = "Bearer-subject-B-jwt-fixture"


class StatefulFakePostgrest:
    """In-memory transactional mirror of resolve_or_create_paper for isolated service tests."""

    def __init__(self, token_to_uid: dict[str, str] | None = None) -> None:
        self._lock = threading.Lock()
        self.token_to_uid = token_to_uid or {TOKEN_A: USER_A, TOKEN_B: USER_B}
        self.papers: dict[str, dict] = {}
        self.identifiers: dict[tuple[str, str, str], dict] = {}
        self.requests_seen: list[dict] = []
        self.inject_failure: tuple[int, dict] | None = None

    def post(self, url, *, json, headers, timeout):
        class FakeResponse:
            def __init__(self, status_code: int, payload: dict):
                self.status_code = status_code
                self._payload = payload

            def json(self):
                return self._payload

        with self._lock:
            self.requests_seen.append({"url": url, "json": json, "headers": headers, "timeout": timeout})
            if self.inject_failure is not None:
                code, body = self.inject_failure
                return FakeResponse(code, body)

            auth_header = headers.get("Authorization", "")
            token = auth_header.removeprefix("Bearer ").strip()
            owner_id = self.token_to_uid.get(token)
            if not owner_id:
                return FakeResponse(401, {"code": "28000", "message": "RG_UNAUTHENTICATED"})

            items = json.get("p_identifiers")
            if not isinstance(items, list) or not items:
                return FakeResponse(400, {"code": "22023", "message": "RG_INVALID_IDENTIFIER"})

            matched: set[str] = set()
            for item in items:
                key = (owner_id, item["identifier_type"], item["normalized_value"])
                if key in self.identifiers:
                    matched.add(self.identifiers[key]["paper_id"])

            if len(matched) > 1:
                ordered = ",".join(sorted(matched))
                return FakeResponse(
                    409,
                    {"code": "P0409", "message": f"RG_ALIAS_CONFLICT: identifiers resolve to multiple papers ({ordered})"},
                )

            if len(matched) == 1:
                paper_id = next(iter(matched))
                created = False
            else:
                paper_id = str(uuid.uuid4())
                self.papers[paper_id] = {"id": paper_id, "owner_id": owner_id, "paper": json.get("p_paper", {})}
                created = True

            for item in items:
                key = (owner_id, item["identifier_type"], item["normalized_value"])
                self.identifiers.setdefault(
                    key,
                    {
                        "owner_id": owner_id,
                        "paper_id": paper_id,
                        "identifier_type": item["identifier_type"],
                        "normalized_value": item["normalized_value"],
                        "original_value": item["original_value"],
                    },
                )

            return FakeResponse(200, {"paper_id": paper_id, "created": created})


def _configure_env(monkeypatch, fake_store: StatefulFakePostgrest | None = None):
    monkeypatch.setenv("SUPABASE_URL", PROJECT_URL)
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_fixture")
    store = fake_store or StatefulFakePostgrest()
    monkeypatch.setattr(paper_identity.requests, "post", store.post)
    return store


def test_creates_new_paper_and_resolves_idempotently(monkeypatch):
    store = _configure_env(monkeypatch)
    doi = normalize_doi("https://doi.org/10.48550/arXiv.1706.03762")

    first = resolve_or_create_paper(
        access_token=TOKEN_A,
        identifiers=[doi],
        paper=PaperMetadataInput(title="Attention Is All You Need", source_provider="openalex"),
    )
    second = resolve_or_create_paper(
        access_token=TOKEN_A,
        identifiers=[normalize_doi("10.48550/ARXIV.1706.03762")],
    )

    assert first.created is True
    assert second.created is False
    assert first.paper_id == second.paper_id
    assert len(store.papers) == 1
    # Verify caller JWT & publishable key are sent (never service-role)
    req = store.requests_seen[0]
    assert req["url"] == f"{PROJECT_URL}/rest/v1/rpc/resolve_or_create_paper"
    assert req["headers"]["Authorization"] == f"Bearer {TOKEN_A}"
    assert req["headers"]["apikey"] == "sb_publishable_fixture"


def test_adds_arxiv_and_openalex_aliases_to_existing_paper(monkeypatch):
    store = _configure_env(monkeypatch)
    doi = normalize_doi("10.48550/arXiv.1706.03762")
    arxiv = normalize_arxiv("arXiv:1706.03762v7")
    openalex = normalize_openalex("https://openalex.org/W2626778328")

    initial = resolve_or_create_paper(access_token=TOKEN_A, identifiers=[doi])
    added_arxiv = resolve_or_create_paper(access_token=TOKEN_A, identifiers=[doi, arxiv])
    added_oa = resolve_or_create_paper(access_token=TOKEN_A, identifiers=[arxiv, openalex])

    assert initial.created is True
    assert added_arxiv.created is False and added_arxiv.paper_id == initial.paper_id
    assert added_oa.created is False and added_oa.paper_id == initial.paper_id
    assert len(store.papers) == 1
    assert len(store.identifiers) == 3


def test_multiple_new_identifiers_create_single_paper_and_deduplicate_request(monkeypatch):
    store = _configure_env(monkeypatch)
    doi_1 = normalize_doi("10.1234/abc")
    doi_2 = normalize_doi("https://doi.org/10.1234/ABC")
    arxiv = normalize_arxiv("1706.03762v5")

    res = resolve_or_create_paper(access_token=TOKEN_A, identifiers=[doi_1, doi_2, arxiv])
    assert res.created is True
    assert len(res.identifiers) == 2
    assert len(store.requests_seen[0]["json"]["p_identifiers"]) == 2
    assert len(store.papers) == 1


def test_alias_conflict_raises_conflict_error_with_paper_ids(monkeypatch):
    store = _configure_env(monkeypatch)
    doi_a = normalize_doi("10.1000/paper-a")
    arxiv_b = normalize_arxiv("2301.00002v1")

    res_a = resolve_or_create_paper(access_token=TOKEN_A, identifiers=[doi_a])
    res_b = resolve_or_create_paper(access_token=TOKEN_A, identifiers=[arxiv_b])
    assert res_a.paper_id != res_b.paper_id

    with pytest.raises(AliasConflictError) as exc_info:
        resolve_or_create_paper(access_token=TOKEN_A, identifiers=[doi_a, arxiv_b])

    assert set(exc_info.value.conflicting_paper_ids) == {str(res_a.paper_id), str(res_b.paper_id)}
    assert len(store.papers) == 2


def test_concurrent_requests_for_same_doi_and_overlapping_aliases_converge(monkeypatch):
    store = _configure_env(monkeypatch)
    doi = normalize_doi("10.1000/race")
    arxiv = normalize_arxiv("2401.00001")

    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = [
            pool.submit(
                resolve_or_create_paper,
                access_token=TOKEN_A,
                identifiers=[doi] if idx % 2 == 0 else [doi, arxiv],
            )
            for idx in range(6)
        ]
        results: list[PaperResolutionResult] = [f.result() for f in futures]

    distinct_uuids = {r.paper_id for r in results}
    assert len(distinct_uuids) == 1
    assert sum(1 for r in results if r.created) == 1
    assert len(store.papers) == 1


def test_cross_user_isolation_creates_distinct_uuids_for_same_doi(monkeypatch):
    store = _configure_env(monkeypatch)
    doi = normalize_doi("10.1000/shared-doi")

    res_a = resolve_or_create_paper(access_token=TOKEN_A, identifiers=[doi])
    res_b = resolve_or_create_paper(access_token=TOKEN_B, identifiers=[doi])

    assert res_a.created is True and res_b.created is True
    assert res_a.paper_id != res_b.paper_id
    assert len(store.papers) == 2


def test_payload_never_transmits_owner_id_and_preserves_arxiv_original_version(monkeypatch):
    store = _configure_env(monkeypatch)
    arxiv = normalize_arxiv("arXiv:1706.03762v7")
    resolve_or_create_paper(
        access_token=TOKEN_A,
        identifiers=[arxiv],
        paper=PaperMetadataInput(
            title="Attention Is All You Need",
            source_provider="arxiv",
            metadata={"extra": "ok"},
        ),
    )

    payload = store.requests_seen[0]["json"]
    assert "owner_id" not in payload["p_paper"]
    assert all("owner_id" not in item for item in payload["p_identifiers"])
    assert payload["p_identifiers"][0]["original_value"] == "arXiv:1706.03762v7"
    assert payload["p_identifiers"][0]["normalized_value"] == "1706.03762"


def test_migration_enforces_security_invoker_advisory_lock_and_23505_recovery():
    from pathlib import Path

    sql = Path("supabase/migrations/20261126000001_resolve_or_create_paper_rpc.sql").read_text(encoding="utf-8").lower()
    assert "security invoker" in sql
    assert "security definer" not in sql
    assert "auth.uid()" in sql
    assert "pg_advisory_xact_lock" in sql
    assert "when unique_violation then" in sql
    assert "errcode = 'p0409'" in sql
    assert "revoke all on function public.resolve_or_create_paper(jsonb, jsonb) from public, anon;" in sql
    assert "grant execute on function public.resolve_or_create_paper(jsonb, jsonb) to authenticated;" in sql


def test_unauthenticated_and_invalid_inputs_are_rejected_before_or_by_rpc(monkeypatch):
    store = _configure_env(monkeypatch)
    doi = normalize_doi("10.1000/valid")

    with pytest.raises(IdentityAuthenticationError):
        resolve_or_create_paper(access_token="   ", identifiers=[doi])

    with pytest.raises(IdentityAuthenticationError):
        resolve_or_create_paper(access_token="invalid-token", identifiers=[doi])

    with pytest.raises(IdentityValidationError):
        resolve_or_create_paper(access_token=TOKEN_A, identifiers=[])

    with pytest.raises(IdentityValidationError):
        resolve_or_create_paper(
            access_token=TOKEN_A,
            identifiers=[NormalizedIdentifier("doi", "10.1000/abc", "FORGED-NORM")],
        )

    with pytest.raises(IdentityValidationError):
        resolve_or_create_paper(
            access_token=TOKEN_A,
            identifiers=[NormalizedIdentifier("bad_type", "x", "x")],  # type: ignore[arg-type]
        )

    with pytest.raises(IdentityValidationError):
        resolve_or_create_paper(
            access_token=TOKEN_A,
            identifiers=[doi],
            paper=PaperMetadataInput(publication_year=999),
        )

    # No papers created on any invalid call
    assert len(store.papers) == 0


def test_error_mappings_for_config_network_5xx_and_malformed_response(monkeypatch):
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_PUBLISHABLE_KEY", raising=False)
    doi = normalize_doi("10.1000/valid")

    with pytest.raises(IdentityConfigurationError):
        resolve_or_create_paper(access_token=TOKEN_A, identifiers=[doi])

    monkeypatch.setenv("SUPABASE_URL", PROJECT_URL)
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_fixture")

    def raise_network(*_args, **_kwargs):
        raise requests.ConnectTimeout("timed out")

    monkeypatch.setattr(paper_identity.requests, "post", raise_network)
    with pytest.raises(IdentityServiceUnavailable):
        resolve_or_create_paper(access_token=TOKEN_A, identifiers=[doi])

    store = _configure_env(monkeypatch)
    store.inject_failure = (503, {"message": "service down"})
    with pytest.raises(IdentityServiceUnavailable):
        resolve_or_create_paper(access_token=TOKEN_A, identifiers=[doi])

    store.inject_failure = (400, {"code": "22023", "message": "RG_INVALID_IDENTIFIER: bad"})
    with pytest.raises(IdentityValidationError):
        resolve_or_create_paper(access_token=TOKEN_A, identifiers=[doi])

    store.inject_failure = (200, {"paper_id": "not-a-uuid", "created": True})
    with pytest.raises(PaperIdentityError):
        resolve_or_create_paper(access_token=TOKEN_A, identifiers=[doi])


@pytest.mark.skipif(
    not (os.getenv("TEST_SUPABASE_URL") and os.getenv("TEST_SUPABASE_USER_A_JWT") and os.getenv("TEST_SUPABASE_USER_B_JWT")),
    reason="Real PostgreSQL/Supabase RLS and 23505 concurrency integration tests require controlled test project env vars; local Postgres/Docker is unavailable.",
)
def test_live_supabase_rpc_rls_and_concurrency_integration():  # pragma: no cover
    """Live two-user integration test executed only against an explicit non-production test DB."""
    raise AssertionError("Configure isolated test helper if running live Supabase integration.")
