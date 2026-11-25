"""FastAPI contract checks; backend responses are mocked where services are external."""
import pytest
from fastapi.testclient import TestClient

from backend import auth, main, pipeline

main.app.dependency_overrides[auth.require_current_user] = lambda: {"id": "test-user", "access_token": "test-supabase-token"}


client = TestClient(main.app)


def test_health_reports_service_configuration_without_claiming_private_upload_support():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["private_uploads"] is False
    assert "chromadb" in response.json()["services"]
    assert "neo4j" in response.json()["services"]


def test_rag_api_rejects_an_empty_paper_scope():
    response = client.post("/api/rag/query", json={"question": "What does this synthetic fixture say?", "paper_ids": []})
    assert response.status_code == 422


def test_rag_api_returns_citations_with_retrieved_passage_when_llm_is_unconfigured(monkeypatch):
    monkeypatch.delenv("LLM_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setattr(pipeline, "_query_chunks", lambda *_args, **_kwargs: [{
        "chunk_id": "synthetic-chunk-1",
        "text": "Synthetic test passage: the fixture describes a sample method.",
        "metadata": {"paper_id": "fixture:synthetic", "title": "Synthetic fixture paper", "source_url": "https://example.org/fixture", "page": 1, "section": "Test", "doi": ""},
        "distance": 0.1,
    }])
    monkeypatch.setattr(pipeline, "_query_graph", lambda *_args, **_kwargs: [])
    response = client.post("/api/rag/query", json={"question": "Describe the fixture method", "paper_ids": ["fixture:synthetic"]})
    assert response.status_code == 200
    body = response.json()
    assert body["answer_type"] == "retrieval_only"
    assert body["citations"][0]["paper_id"] == "fixture:synthetic"
    assert body["citations"][0]["supporting_passage"].startswith("Synthetic test passage")


def test_rag_api_validates_question_length():
    response = client.post("/api/rag/query", json={"question": "x", "paper_ids": ["fixture:synthetic"]})
    assert response.status_code == 422


def test_knowledge_graph_api_resolves_selected_workspace_scope(monkeypatch):
    graph = {"nodes": [{"id": "fixture-paper", "label": "Synthetic fixture", "type": "Paper"}], "edges": [], "indexed": True}
    workspace_id = "4dc3f7a3-4ccf-4dbd-b44c-c011edc7c319"
    captured = {}
    monkeypatch.setattr(main, "resolve_workspace_paper_ids", lambda user_id, token, ids: ["P101", "P201"])
    monkeypatch.setattr(main, "get_graph", lambda limit, user_id, paper_ids: captured.update(limit=limit, user_id=user_id, paper_ids=paper_ids) or graph)
    response = client.get(f"/api/graph?workspace_ids={workspace_id}")
    assert response.status_code == 200
    assert response.json() == graph
    assert captured["user_id"] == "test-user"
    assert captured["paper_ids"] == ["P101", "P201"]


def test_knowledge_graph_api_returns_empty_graph_for_empty_workspace_scope(monkeypatch):
    workspace_id = "4dc3f7a3-4ccf-4dbd-b44c-c011edc7c319"
    monkeypatch.setattr(main, "resolve_workspace_paper_ids", lambda *_args: [])
    monkeypatch.setattr(main, "get_graph", lambda *_args: pytest.fail("Graph retrieval must not run for an empty workspace"))
    response = client.get(f"/api/graph?workspace_ids={workspace_id}")
    assert response.status_code == 200
    assert response.json() == {"nodes": [], "edges": [], "indexed": False}

def test_workspace_list_uses_authenticated_supabase_session(monkeypatch):
    captured = {}

    def fake_list_workspaces(access_token):
        captured["access_token"] = access_token
        return [{"id": "workspace-1", "name": "LLM Research"}]

    monkeypatch.setattr(main, "list_workspaces", fake_list_workspaces)
    response = client.get("/api/workspaces")

    assert response.status_code == 200
    assert response.json()["workspaces"][0]["id"] == "workspace-1"
    assert captured["access_token"] == "test-supabase-token"


def test_workspace_create_uses_authenticated_user_id(monkeypatch):
    captured = {}

    def fake_create_workspace(user_id, access_token, name, description):
        captured.update(user_id=user_id, access_token=access_token, name=name, description=description)
        return {"id": "workspace-1", "name": name, "description": description}

    monkeypatch.setattr(main, "create_workspace", fake_create_workspace)
    response = client.post("/api/workspaces", json={"name": "LLM Research", "description": "LLM papers"})

    assert response.status_code == 201
    assert captured == {
        "user_id": "test-user",
        "access_token": "test-supabase-token",
        "name": "LLM Research",
        "description": "LLM papers",
    }


def test_add_paper_route_saves_membership_and_starts_user_scoped_ingestion(monkeypatch):
    captured = {}
    paper_metadata = {"id": "P101", "title": "Synthetic paper", "authors": [], "source": "Test Fixture"}

    monkeypatch.setattr(main, "get_paper_metadata", lambda _paper_id: paper_metadata)

    def fake_add(user_id, token, workspace_id, paper_id, metadata):
        captured.update(user_id=user_id, token=token, workspace_id=workspace_id, paper_id=paper_id, metadata=metadata)
        return {"workspace_id": workspace_id, "paper_id": paper_id}

    def fake_start(paper_id, user_id):
        captured["ingestion"] = (paper_id, user_id)
        return {"status": "ready", "stage": "complete"}

    monkeypatch.setattr(main, "add_paper_to_workspace", fake_add)
    monkeypatch.setattr(main, "start_ingestion", fake_start)

    response = client.post(
        "/api/workspaces/4dc3f7a3-4ccf-4dbd-b44c-c011edc7c319/papers",
        json={"paper_id": "P101"},
    )

    assert response.status_code == 202
    assert captured["user_id"] == "test-user"
    assert captured["token"] == "test-supabase-token"
    assert captured["paper_id"] == "P101"
    assert captured["ingestion"] == ("P101", "test-user")


def test_rag_workspace_scope_is_resolved_server_side(monkeypatch):
    captured = {}

    def fake_resolve(user_id, token, workspace_ids):
        captured.update(user_id=user_id, token=token, workspace_ids=workspace_ids)
        return ["P101", "P201"]

    def fake_query(question, paper_ids, user_id):
        captured.update(question=question, paper_ids=paper_ids, query_user_id=user_id)
        return {"answer": "Synthetic scoped answer", "answer_type": "retrieval_only", "citations": [], "graph_evidence": []}

    monkeypatch.setattr(main, "resolve_workspace_paper_ids", fake_resolve)
    monkeypatch.setattr(main, "query_research", fake_query)
    workspace_id = "4dc3f7a3-4ccf-4dbd-b44c-c011edc7c319"

    response = client.post(
        "/api/rag/query",
        json={"question": "Compare the selected research", "workspace_ids": [workspace_id]},
    )

    assert response.status_code == 200
    assert captured["user_id"] == "test-user"
    assert captured["token"] == "test-supabase-token"
    assert captured["workspace_ids"] == [workspace_id]
    assert captured["paper_ids"] == ["P101", "P201"]
    assert captured["query_user_id"] == "test-user"


def test_rag_workspace_scope_with_no_papers_returns_insufficient_context(monkeypatch):
    monkeypatch.setattr(main, "resolve_workspace_paper_ids", lambda *_args: [])
    monkeypatch.setattr(main, "query_research", lambda *_args: pytest.fail("RAG must not run for an empty workspace scope"))

    response = client.post(
        "/api/rag/query",
        json={"question": "What do the selected papers say?", "workspace_ids": ["4dc3f7a3-4ccf-4dbd-b44c-c011edc7c319"]},
    )

    assert response.status_code == 200
    assert response.json()["answer_type"] == "insufficient_context"


def test_rag_api_rejects_missing_or_conflicting_scopes():
    missing = client.post("/api/rag/query", json={"question": "What do the papers say?"})
    conflicting = client.post(
        "/api/rag/query",
        json={
            "question": "What do the papers say?",
            "paper_ids": ["P101"],
            "workspace_ids": ["4dc3f7a3-4ccf-4dbd-b44c-c011edc7c319"],
        },
    )
    assert missing.status_code == 422
    assert conflicting.status_code == 422

