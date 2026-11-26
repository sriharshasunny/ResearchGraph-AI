"""Unit tests and env-gated DB integration tests for Stage 8B paper identity resolution."""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
import importlib
import os
import threading
import time
import uuid

import pytest
import requests

from backend import paper_identity
from backend.identifiers import (
    InvalidIdentifierError,
    NormalizedIdentifier,
    normalize_arxiv,
    normalize_doi,
    normalize_openalex,
    normalize_uuid,
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


def _live_supabase_env() -> tuple[str, str, str, str] | None:
    url = os.getenv("TEST_SUPABASE_URL", "").strip().rstrip("/")
    key = os.getenv("TEST_SUPABASE_PUBLISHABLE_KEY", "").strip()
    jwt_a = os.getenv("TEST_SUPABASE_USER_A_JWT", "").strip()
    jwt_b = os.getenv("TEST_SUPABASE_USER_B_JWT", "").strip()
    if url and key and jwt_a and jwt_b:
        return url, key, jwt_a, jwt_b
    return None


def _strict_live_mode_enabled() -> bool:
    return os.getenv("REQUIRE_LIVE_IDENTITY_TESTS", "").strip() == "1"


def _require_live_supabase_env() -> tuple[str, str, str, str]:
    env = _live_supabase_env()
    if env is None:
        raise AssertionError(
            "REQUIRE_LIVE_IDENTITY_TESTS=1 is set, but TEST_SUPABASE_URL, "
            "TEST_SUPABASE_PUBLISHABLE_KEY, TEST_SUPABASE_USER_A_JWT, and TEST_SUPABASE_USER_B_JWT "
            "are not all configured."
        )
    return env


def _require_live_postgres_env() -> tuple[str, str, str, str, str]:
    url, key, jwt_a, jwt_b = _require_live_supabase_env()
    dsn = os.getenv("TEST_POSTGRES_DSN", "").strip()
    if not dsn:
        raise AssertionError("TEST_POSTGRES_DSN must be configured for direct PostgreSQL 23505 tests.")
    return url, key, jwt_a, jwt_b, dsn


_LIVE_ENV_MISSING = _live_supabase_env() is None and not _strict_live_mode_enabled()
_DIRECT_PG_ENV_MISSING = (
    (_live_supabase_env() is None or not os.getenv("TEST_POSTGRES_DSN", "").strip())
    and not _strict_live_mode_enabled()
)
_LIVE_SKIP_REASON = (
    "[SKIPPED - NOT LIVE VERIFIED] Requires TEST_SUPABASE_URL, TEST_SUPABASE_PUBLISHABLE_KEY, "
    "TEST_SUPABASE_USER_A_JWT, and TEST_SUPABASE_USER_B_JWT (set REQUIRE_LIVE_IDENTITY_TESTS=1 to fail instead of skip)."
)
_DIRECT_PG_SKIP_REASON = (
    "[SKIPPED - NOT LIVE VERIFIED] Requires TEST_POSTGRES_DSN and TEST_SUPABASE_* test user env vars "
    "(set REQUIRE_LIVE_IDENTITY_TESTS=1 to fail instead of skip)."
)


def _live_rest_headers(publishable_key: str, jwt_token: str) -> dict[str, str]:
    return {
        "apikey": publishable_key,
        "Authorization": f"Bearer {jwt_token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }


def _verify_test_user_identity(url: str, publishable_key: str, jwt_token: str, label: str) -> str:
    """Resolve and verify a real authenticated Supabase user UUID without logging tokens."""
    res = requests.get(
        f"{url}/auth/v1/user",
        headers={
            "apikey": publishable_key,
            "Authorization": f"Bearer {jwt_token}",
            "Accept": "application/json",
        },
        timeout=10,
    )
    if res.status_code != 200:
        raise AssertionError(f"{label} JWT could not be verified via /auth/v1/user (HTTP {res.status_code}).")
    payload = res.json()
    if not isinstance(payload, dict) or payload.get("is_anonymous") is True:
        raise AssertionError(f"{label} must be a non-anonymous authenticated user.")
    try:
        return normalize_uuid(str(payload.get("id") or ""))
    except InvalidIdentifierError as exc:
        raise AssertionError(f"{label} returned an invalid user UUID from /auth/v1/user.") from exc


def _live_rest_get(url: str, publishable_key: str, jwt_token: str, table: str, params: dict[str, str]) -> list[dict]:
    res = requests.get(
        f"{url}/rest/v1/{table}",
        params=params,
        headers=_live_rest_headers(publishable_key, jwt_token),
        timeout=10,
    )
    res.raise_for_status()
    return res.json()


def _live_cleanup_papers(url: str, publishable_key: str, jwt_token: str, paper_ids: set[str]) -> None:
    if not paper_ids:
        return
    ids_filter = f"in.({','.join(sorted(paper_ids))})"
    res = requests.delete(
        f"{url}/rest/v1/papers",
        params={"id": ids_filter},
        headers=_live_rest_headers(publishable_key, jwt_token),
        timeout=10,
    )
    if res.status_code not in (200, 204):
        raise AssertionError(f"Test cleanup DELETE /rest/v1/papers failed with HTTP {res.status_code}.")


def _import_psycopg_for_dsn_test():
    try:
        return importlib.import_module("psycopg")
    except ImportError as exc:
        raise RuntimeError(
            "TEST_POSTGRES_DSN is configured, so psycopg must be installed (see requirements-dev.txt)."
        ) from exc


def _wait_until_racer_blocked(check_fn, *, timeout_seconds: float = 5.0, poll_interval: float = 0.05) -> None:
    deadline = time.monotonic() + timeout_seconds
    while time.monotonic() < deadline:
        if check_fn():
            return
        time.sleep(poll_interval)
    raise TimeoutError("Timed out waiting for competing transaction to block on expected unique-index lock.")


@pytest.mark.skipif(_LIVE_ENV_MISSING, reason=_LIVE_SKIP_REASON)
def test_live_supabase_paper_creation_aliases_and_idempotency(monkeypatch):
    url, key, jwt_a, _jwt_b = _require_live_supabase_env()
    monkeypatch.setenv("SUPABASE_URL", url)
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", key)

    run_tag = uuid.uuid4().hex[:12]
    created_ids: set[str] = set()
    try:
        doi = normalize_doi(f"10.99999/rg-live-{run_tag}")
        res_1 = resolve_or_create_paper(
            access_token=jwt_a,
            identifiers=[doi],
            paper=PaperMetadataInput(title=f"Live Test Paper {run_tag}", source_provider="openalex"),
        )
        created_ids.add(str(res_1.paper_id))
        assert res_1.created is True

        res_2 = resolve_or_create_paper(
            access_token=jwt_a,
            identifiers=[normalize_doi(f"https://doi.org/10.99999/RG-LIVE-{run_tag}")],
        )
        assert res_2.created is False
        assert res_2.paper_id == res_1.paper_id

        arxiv = normalize_arxiv(f"2501.{int(uuid.uuid4().int % 89999) + 10000:05d}v2")
        res_3 = resolve_or_create_paper(access_token=jwt_a, identifiers=[doi, arxiv])
        assert res_3.created is False and res_3.paper_id == res_1.paper_id

        openalex = normalize_openalex(f"W{9000000000 + (uuid.uuid4().int % 900000000)}")
        res_4 = resolve_or_create_paper(access_token=jwt_a, identifiers=[arxiv, openalex])
        assert res_4.created is False and res_4.paper_id == res_1.paper_id

        aliases = _live_rest_get(url, key, jwt_a, "paper_identifiers", {"paper_id": f"eq.{res_1.paper_id}"})
        assert len(aliases) == 3

        # Multiple previously unknown aliases create one paper row
        doi_multi = normalize_doi(f"10.99999/rg-multi-{run_tag}")
        arxiv_multi = normalize_arxiv(f"2502.{int(uuid.uuid4().int % 89999) + 10000:05d}")
        res_multi = resolve_or_create_paper(access_token=jwt_a, identifiers=[doi_multi, arxiv_multi])
        created_ids.add(str(res_multi.paper_id))
        assert res_multi.created is True
        multi_aliases = _live_rest_get(url, key, jwt_a, "paper_identifiers", {"paper_id": f"eq.{res_multi.paper_id}"})
        assert len(multi_aliases) == 2
    finally:
        _live_cleanup_papers(url, key, jwt_a, created_ids)


@pytest.mark.skipif(_LIVE_ENV_MISSING, reason=_LIVE_SKIP_REASON)
def test_live_supabase_alias_conflict_and_transaction_rollback(monkeypatch):
    url, key, jwt_a, _jwt_b = _require_live_supabase_env()
    monkeypatch.setenv("SUPABASE_URL", url)
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", key)

    run_tag = uuid.uuid4().hex[:12]
    created_ids: set[str] = set()
    try:
        doi_a = normalize_doi(f"10.99999/rg-conflict-a-{run_tag}")
        arxiv_b = normalize_arxiv(f"2503.{int(uuid.uuid4().int % 89999) + 10000:05d}")
        oa_unregistered = normalize_openalex(f"W{8000000000 + (uuid.uuid4().int % 900000000)}")

        res_a = resolve_or_create_paper(access_token=jwt_a, identifiers=[doi_a])
        res_b = resolve_or_create_paper(access_token=jwt_a, identifiers=[arxiv_b])
        created_ids.update({str(res_a.paper_id), str(res_b.paper_id)})
        assert res_a.paper_id != res_b.paper_id

        with pytest.raises(AliasConflictError) as exc_info:
            resolve_or_create_paper(access_token=jwt_a, identifiers=[doi_a, arxiv_b, oa_unregistered])

        assert set(exc_info.value.conflicting_paper_ids) == {str(res_a.paper_id), str(res_b.paper_id)}

        # Ensure conflict rolled back completely and left no extra alias
        oa_rows = _live_rest_get(
            url,
            key,
            jwt_a,
            "paper_identifiers",
            {"identifier_type": "eq.openalex", "normalized_value": f"eq.{oa_unregistered.normalized_value}"},
        )
        assert oa_rows == []
        doi_rows = _live_rest_get(
            url, key, jwt_a, "paper_identifiers", {"normalized_value": f"eq.{doi_a.normalized_value}"}
        )
        arxiv_rows = _live_rest_get(
            url, key, jwt_a, "paper_identifiers", {"normalized_value": f"eq.{arxiv_b.normalized_value}"}
        )
        assert doi_rows[0]["paper_id"] == str(res_a.paper_id)
        assert arxiv_rows[0]["paper_id"] == str(res_b.paper_id)
    finally:
        _live_cleanup_papers(url, key, jwt_a, created_ids)


@pytest.mark.skipif(_LIVE_ENV_MISSING, reason=_LIVE_SKIP_REASON)
def test_live_supabase_concurrent_resolution_advisory_locks_and_conflicts(monkeypatch):
    url, key, jwt_a, _jwt_b = _require_live_supabase_env()
    monkeypatch.setenv("SUPABASE_URL", url)
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", key)

    run_tag = uuid.uuid4().hex[:12]
    created_ids: set[str] = set()
    try:
        doi = normalize_doi(f"10.99999/rg-concurrent-{run_tag}")
        arxiv = normalize_arxiv(f"2504.{int(uuid.uuid4().int % 89999) + 10000:05d}")

        with ThreadPoolExecutor(max_workers=8) as pool:
            futures = [
                pool.submit(
                    resolve_or_create_paper,
                    access_token=jwt_a,
                    identifiers=[doi] if i % 2 == 0 else [doi, arxiv],
                )
                for i in range(8)
            ]
            results = [f.result() for f in futures]

        winning_ids = {str(r.paper_id) for r in results}
        created_ids.update(winning_ids)
        assert len(winning_ids) == 1
        assert sum(1 for r in results if r.created) == 1

        alias_rows = _live_rest_get(
            url, key, jwt_a, "paper_identifiers", {"normalized_value": f"in.({doi.normalized_value},{arxiv.normalized_value})"}
        )
        assert {row["paper_id"] for row in alias_rows} == winning_ids
        assert len(alias_rows) == 2
    finally:
        _live_cleanup_papers(url, key, jwt_a, created_ids)


@pytest.mark.skipif(_LIVE_ENV_MISSING, reason=_LIVE_SKIP_REASON)
def test_live_supabase_rls_user_isolation_and_unauthenticated_rejection(monkeypatch):
    url, key, jwt_a, jwt_b = _require_live_supabase_env()
    monkeypatch.setenv("SUPABASE_URL", url)
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", key)

    user_a_id = _verify_test_user_identity(url, key, jwt_a, "TEST_SUPABASE_USER_A_JWT")
    user_b_id = _verify_test_user_identity(url, key, jwt_b, "TEST_SUPABASE_USER_B_JWT")
    assert user_a_id != user_b_id

    run_tag = uuid.uuid4().hex[:12]
    ids_a: set[str] = set()
    ids_b: set[str] = set()
    try:
        shared_doi = normalize_doi(f"10.99999/rg-rls-{run_tag}")
        res_a = resolve_or_create_paper(access_token=jwt_a, identifiers=[shared_doi])
        res_b = resolve_or_create_paper(access_token=jwt_b, identifiers=[shared_doi])
        ids_a.add(str(res_a.paper_id))
        ids_b.add(str(res_b.paper_id))

        assert res_a.paper_id != res_b.paper_id
        assert _live_rest_get(url, key, jwt_a, "papers", {"id": f"eq.{res_b.paper_id}"}) == []
        assert _live_rest_get(url, key, jwt_b, "papers", {"id": f"eq.{res_a.paper_id}"}) == []
        assert _live_rest_get(url, key, jwt_a, "paper_identifiers", {"paper_id": f"eq.{res_b.paper_id}"}) == []
        assert _live_rest_get(url, key, jwt_b, "paper_identifiers", {"paper_id": f"eq.{res_a.paper_id}"}) == []

        # Attempt to spoof owner_id in raw RPC p_paper JSON payload using verified User B UUID
        spoof_doi = normalize_doi(f"10.99999/rg-spoof-{run_tag}")
        spoof_res = requests.post(
            f"{url}/rest/v1/rpc/resolve_or_create_paper",
            json={
                "p_identifiers": [
                    {
                        "identifier_type": "doi",
                        "original_value": spoof_doi.original_value,
                        "normalized_value": spoof_doi.normalized_value,
                    }
                ],
                "p_paper": {"owner_id": user_b_id, "title": "Owner Spoof Attempt"},
            },
            headers=_live_rest_headers(key, jwt_a),
            timeout=10,
        )
        spoof_res.raise_for_status()
        spoof_paper_id = spoof_res.json()["paper_id"]
        ids_a.add(spoof_paper_id)
        assert _live_rest_get(url, key, jwt_b, "papers", {"id": f"eq.{spoof_paper_id}"}) == []
        assert len(_live_rest_get(url, key, jwt_a, "papers", {"id": f"eq.{spoof_paper_id}"})) == 1

        # Unauthenticated RPC call (anon key only, no Bearer JWT) must be rejected
        unauth_res = requests.post(
            f"{url}/rest/v1/rpc/resolve_or_create_paper",
            json={
                "p_identifiers": [
                    {
                        "identifier_type": "doi",
                        "original_value": shared_doi.original_value,
                        "normalized_value": shared_doi.normalized_value,
                    }
                ],
                "p_paper": {"title": "Unauthenticated Attempt"},
            },
            headers={"apikey": key, "Content-Type": "application/json"},
            timeout=10,
        )
        assert unauth_res.status_code in (401, 403)
    finally:
        _live_cleanup_papers(url, key, jwt_a, ids_a)
        _live_cleanup_papers(url, key, jwt_b, ids_b)


@pytest.mark.skipif(_DIRECT_PG_ENV_MISSING, reason=_DIRECT_PG_SKIP_REASON)
def test_live_postgres_direct_23505_unique_violation_recovery():  # pragma: no cover
    url, key, jwt_a, _jwt_b, dsn = _require_live_postgres_env()
    psycopg = _import_psycopg_for_dsn_test()
    user_a_id = _verify_test_user_identity(url, key, jwt_a, "TEST_SUPABASE_USER_A_JWT")
    test_doi = f"10.99999/rg-23505-{uuid.uuid4().hex[:12]}"

    with psycopg.connect(dsn, autocommit=False) as conn_winner:
        with conn_winner.cursor() as cur_w:
            cur_w.execute("select exists(select 1 from auth.users where id = %s)", (user_a_id,))
            assert cur_w.fetchone()[0] is True, "Verified test user must exist in auth.users."

            cur_w.execute("select pg_backend_pid()")
            winner_pid = cur_w.fetchone()[0]

            winner_paper_id = str(uuid.uuid4())
            cur_w.execute(
                "insert into public.papers (id, owner_id, title) values (%s, %s, 'Winner')",
                (winner_paper_id, user_a_id),
            )
            cur_w.execute(
                "insert into public.paper_identifiers (owner_id, paper_id, identifier_type, original_value, normalized_value) "
                "values (%s, %s, 'doi', %s, %s)",
                (user_a_id, winner_paper_id, test_doi, test_doi),
            )

        racer_pid_lock = threading.Lock()
        racer_pid_holder: dict[str, int | None] = {"pid": None}

        def run_racer():
            with psycopg.connect(dsn, autocommit=False) as conn_racer:
                with conn_racer.cursor() as cur_r:
                    cur_r.execute("select pg_backend_pid()")
                    racer_pid = cur_r.fetchone()[0]
                    with racer_pid_lock:
                        racer_pid_holder["pid"] = racer_pid
                    cur_r.execute("set local role authenticated")
                    cur_r.execute("select set_config('request.jwt.claim.sub', %s, true)", (user_a_id,))
                    cur_r.execute(
                        "select public.resolve_or_create_paper(%s::jsonb, %s::jsonb)",
                        (
                            f'[{{"identifier_type":"doi","original_value":"{test_doi}","normalized_value":"{test_doi}"}}]',
                            '{"title":"Racer"}',
                        ),
                    )
                    res = cur_r.fetchone()[0]
                conn_racer.commit()
                return res

        def racer_is_blocked_on_winner() -> bool:
            with racer_pid_lock:
                racer_pid = racer_pid_holder["pid"]
            if racer_pid is None:
                return False
            with psycopg.connect(dsn, autocommit=True) as conn_obs:
                with conn_obs.cursor() as cur_obs:
                    cur_obs.execute(
                        "select state = 'active' and wait_event_type = 'Lock' "
                        "and %s = any(pg_blocking_pids(pid)) "
                        "from pg_stat_activity where pid = %s",
                        (winner_pid, racer_pid),
                    )
                    row = cur_obs.fetchone()
                    return bool(row and row[0])

        try:
            with ThreadPoolExecutor(max_workers=1) as pool:
                future = pool.submit(run_racer)
                _wait_until_racer_blocked(racer_is_blocked_on_winner, timeout_seconds=5.0)
                conn_winner.commit()
                rpc_result = future.result(timeout=10)

            assert rpc_result["paper_id"] == winner_paper_id
            assert rpc_result["created"] is False

            with conn_winner.cursor() as cur_chk:
                cur_chk.execute(
                    "select count(*) from public.papers where owner_id = %s and title in ('Winner', 'Racer')",
                    (user_a_id,),
                )
                assert cur_chk.fetchone()[0] == 1
        finally:
            with conn_winner.cursor() as cur_del:
                cur_del.execute("delete from public.papers where id = %s", (winner_paper_id,))
                assert cur_del.rowcount == 1
            conn_winner.commit()


def test_integration_helpers_validate_cleanup_identity_sync_and_strict_mode(monkeypatch):
    # 1. Cleanup verifies HTTP status loudly instead of silently ignoring failures
    class FakeDeleteResp:
        def __init__(self, status_code: int):
            self.status_code = status_code

    monkeypatch.setattr(requests, "delete", lambda *_args, **_kwargs: FakeDeleteResp(204))
    _live_cleanup_papers(PROJECT_URL, "sb_pub", "jwt", {USER_A})

    monkeypatch.setattr(requests, "delete", lambda *_args, **_kwargs: FakeDeleteResp(403))
    with pytest.raises(AssertionError, match="HTTP 403"):
        _live_cleanup_papers(PROJECT_URL, "sb_pub", "jwt", {USER_A})

    # 2. Test-user verifier fetches real UUID from /auth/v1/user without exposing tokens
    class FakeAuthResp:
        def __init__(self, status_code: int, body: dict):
            self.status_code = status_code
            self._body = body

        def json(self):
            return self._body

    monkeypatch.setattr(
        requests,
        "get",
        lambda *_args, **_kwargs: FakeAuthResp(200, {"id": USER_A.upper(), "is_anonymous": False}),
    )
    assert _verify_test_user_identity(PROJECT_URL, "sb_pub", "secret-jwt-value", "USER_A") == USER_A

    monkeypatch.setattr(requests, "get", lambda *_args, **_kwargs: FakeAuthResp(401, {}))
    with pytest.raises(AssertionError) as auth_exc:
        _verify_test_user_identity(PROJECT_URL, "sb_pub", "secret-jwt-value", "USER_A")
    assert "secret-jwt-value" not in str(auth_exc.value)

    monkeypatch.setattr(
        requests,
        "get",
        lambda *_args, **_kwargs: FakeAuthResp(200, {"id": USER_A, "is_anonymous": True}),
    )
    with pytest.raises(AssertionError, match="non-anonymous"):
        _verify_test_user_identity(PROJECT_URL, "sb_pub", "secret-jwt-value", "USER_A")

    # 3. Deterministic lock wait helper succeeds once condition turns true and fails on timeout
    attempts = 0

    def becomes_blocked() -> bool:
        nonlocal attempts
        attempts += 1
        return attempts >= 3

    _wait_until_racer_blocked(becomes_blocked, timeout_seconds=1.0, poll_interval=0.001)
    assert attempts == 3

    with pytest.raises(TimeoutError):
        _wait_until_racer_blocked(lambda: False, timeout_seconds=0.02, poll_interval=0.005)

    # 4. Missing psycopg fails loudly when invoked under TEST_POSTGRES_DSN
    monkeypatch.setattr(importlib, "import_module", lambda _name: (_ for _ in ()).throw(ImportError("no psycopg")))
    with pytest.raises(RuntimeError, match="psycopg must be installed"):
        _import_psycopg_for_dsn_test()

    # 5. Strict live acceptance mode cannot mistake missing credentials for passing tests
    for var in (
        "TEST_SUPABASE_URL",
        "TEST_SUPABASE_PUBLISHABLE_KEY",
        "TEST_SUPABASE_USER_A_JWT",
        "TEST_SUPABASE_USER_B_JWT",
        "TEST_POSTGRES_DSN",
    ):
        monkeypatch.delenv(var, raising=False)
    with pytest.raises(AssertionError, match="REQUIRE_LIVE_IDENTITY_TESTS=1"):
        _require_live_supabase_env()
