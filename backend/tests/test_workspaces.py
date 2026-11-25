"""Workspace persistence uses mocked Supabase PostgREST responses."""
from types import SimpleNamespace

import pytest

from backend import workspaces


def test_create_workspace_uses_verified_user_token_and_rls_headers(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_ANON_KEY", "anon-test")
    calls = []

    def fake_request(method, url, **kwargs):
        calls.append((method, url, kwargs))
        return SimpleNamespace(status_code=201, content=b'[{"id":"workspace-1","name":"LLM Research"}]', json=lambda: [{"id": "workspace-1", "name": "LLM Research"}])

    monkeypatch.setattr(workspaces.requests, "request", fake_request)
    created = workspaces.create_workspace("user-1", "signed-token", "  LLM Research  ", "")

    assert created["id"] == "workspace-1"
    method, url, kwargs = calls[0]
    assert method == "POST"
    assert url.endswith("/rest/v1/research_workspaces")
    assert kwargs["headers"]["Authorization"] == "Bearer signed-token"
    assert kwargs["headers"]["apikey"] == "anon-test"
    assert kwargs["json"]["user_id"] == "user-1"
    assert kwargs["json"]["name"] == "LLM Research"


def test_add_paper_stores_library_record_and_separate_workspace_membership(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_ANON_KEY", "anon-test")
    calls = []

    def fake_request(method, url, **kwargs):
        calls.append((method, url, kwargs))
        return SimpleNamespace(status_code=201, content=b'[{"paper_id":"P101"}]', json=lambda: [{"paper_id": "P101"}])

    monkeypatch.setattr(workspaces.requests, "request", fake_request)
    membership = workspaces.add_paper_to_workspace(
        "user-1", "signed-token", "workspace-1", "P101", {"title": "Synthetic paper"}
    )

    assert membership["paper_id"] == "P101"
    assert len(calls) == 2
    assert calls[0][1].endswith("/rest/v1/research_papers")
    assert calls[0][2]["json"]["user_id"] == "user-1"
    assert calls[1][1].endswith("/rest/v1/workspace_papers")
    assert calls[1][2]["json"]["workspace_id"] == "workspace-1"
    assert calls[1][2]["json"]["paper_id"] == "P101"


def test_resolve_workspace_paper_ids_deduplicates_papers_across_selected_workspaces(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_ANON_KEY", "anon-test")
    seen = {}

    def fake_request(method, resource, access_token, *, params=None, **_kwargs):
        seen.update(method=method, resource=resource, access_token=access_token, params=params)
        return [{"paper_id": "P101"}, {"paper_id": "P102"}, {"paper_id": "P101"}]

    monkeypatch.setattr(workspaces, "_request", fake_request)
    papers = workspaces.resolve_workspace_paper_ids(
        "user-1", "signed-token", ["workspace-a", "workspace-b"]
    )

    assert papers == ["P101", "P102"]
    assert seen["resource"] == "workspace_papers"
    assert seen["params"]["user_id"] == "eq.user-1"
    assert seen["params"]["workspace_id"].startswith("in.(")


def test_resolve_workspace_paper_ids_returns_empty_for_empty_scope():
    assert workspaces.resolve_workspace_paper_ids("user-1", "token", []) == []


def test_resolve_workspace_paper_ids_caps_selected_workspaces():
    with pytest.raises(workspaces.WorkspaceError, match="maximum of 20"):
        workspaces.resolve_workspace_paper_ids("user-1", "token", [f"w{i}" for i in range(21)])


def test_postgrest_error_does_not_turn_into_an_empty_success(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_ANON_KEY", "anon-test")
    monkeypatch.setattr(workspaces.requests, "request", lambda *_args, **_kwargs: SimpleNamespace(status_code=403, content=b"denied", json=lambda: {}))
    with pytest.raises(workspaces.WorkspaceError, match="denied access"):
        workspaces._request("GET", "research_workspaces", "invalid-token")
