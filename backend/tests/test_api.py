"""FastAPI security and contract checks; external services are mocked."""
import pytest
from fastapi.testclient import TestClient

from backend import main, pipeline


TEST_USER_ID = "00000000-0000-4000-8000-000000000001"
client = TestClient(main.app)


@pytest.fixture
def signed_in_user():
    main.app.dependency_overrides[main.get_current_user] = lambda: TEST_USER_ID
    yield TEST_USER_ID
    main.app.dependency_overrides.pop(main.get_current_user, None)


def test_health_is_public_and_reports_service_configuration():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["private_uploads"] is False
    assert "chromadb" in response.json()["services"]
    assert "neo4j" in response.json()["services"]


def test_user_scoped_routes_reject_requests_without_bearer_token():
    cases = [
        ("GET", "/api/paper?id=fixture:synthetic", None),
        ("GET", "/api/paper-status?paper_id=fixture:synthetic", None),
        ("POST", "/api/papers/ingest", {"paper_id": "fixture:synthetic"}),
        ("GET", "/api/papers/fixture:synthetic/status", None),
        ("GET", "/api/papers/fixture:synthetic/chunks", None),
        ("GET", "/api/graph", None),
        ("GET", "/api/graph/search?q=method", None),
        ("POST", "/api/rag/query", {"question": "Describe the method", "paper_ids": ["fixture:synthetic"]}),
    ]
    for method, path, body in cases:
        response = client.request(method, path, json=body)
        assert response.status_code == 401, (method, path, response.text)


def test_rag_empty_scope_never_runs_an_unfiltered_vector_query(monkeypatch, signed_in_user):
    def forbidden_query(*_args, **_kwargs):
        raise AssertionError("An empty paper selection must not query ChromaDB.")

    monkeypatch.setattr(pipeline, "_query_chunks", forbidden_query)
    response = client.post(
        "/api/rag/query",
        json={"question": "What does the selected research say?", "paper_ids": []},
    )
    assert response.status_code == 200
    assert response.json()["answer_type"] == "insufficient_context"
    assert response.json()["citations"] == []


def test_rag_api_returns_insufficient_context_instead_of_fabricating(monkeypatch, signed_in_user):
    monkeypatch.setattr(pipeline, "_query_chunks", lambda *_args, **_kwargs: [])
    response = client.post(
        "/api/rag/query",
        json={"question": "What does this synthetic fixture say?", "paper_ids": ["fixture:synthetic"]},
    )
    assert response.status_code == 200
    assert response.json()["answer_type"] == "insufficient_context"
    assert response.json()["citations"] == []


def test_rag_api_returns_citations_with_retrieved_passage_when_llm_is_unconfigured(monkeypatch, signed_in_user):
    monkeypatch.delenv("LLM_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setattr(pipeline, "_query_chunks", lambda *_args, **_kwargs: [{
        "chunk_id": "synthetic-chunk-1",
        "text": "Synthetic test passage: the fixture describes a sample method.",
        "metadata": {"owner_id": signed_in_user, "paper_id": "fixture:synthetic", "title": "Synthetic fixture paper", "source_url": "https://example.org/fixture", "page": 1, "section": "Test", "doi": ""},
        "distance": 0.1,
    }])
    monkeypatch.setattr(pipeline, "_query_graph", lambda *_args, **_kwargs: [])
    response = client.post(
        "/api/rag/query",
        json={"question": "Describe the fixture method", "paper_ids": ["fixture:synthetic"]},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["answer_type"] == "retrieval_only"
    assert body["citations"][0]["paper_id"] == "fixture:synthetic"
    assert body["citations"][0]["supporting_passage"].startswith("Synthetic test passage")


def test_rag_api_validates_question_length(signed_in_user):
    response = client.post(
        "/api/rag/query",
        json={"question": "x", "paper_ids": ["fixture:synthetic"]},
    )
    assert response.status_code == 422


def test_knowledge_graph_api_returns_only_the_current_users_graph(monkeypatch, signed_in_user):
    graph = {"nodes": [{"id": "fixture-paper", "label": "Synthetic fixture", "type": "Paper"}], "edges": [], "indexed": True}
    calls = []
    monkeypatch.setattr(main, "get_graph", lambda owner_id, _limit: calls.append(owner_id) or graph)
    response = client.get("/api/graph")
    assert response.status_code == 200
    assert response.json() == graph
    assert calls == [signed_in_user]


def test_public_academic_search_does_not_require_authentication(monkeypatch):
    monkeypatch.setattr(main, "search_openalex", lambda query, limit: [{"id": "fixture:synthetic"}])
    response = client.get("/api/search?q=synthetic")
    assert response.status_code == 200
    assert response.json()["papers"][0]["id"] == "fixture:synthetic"
