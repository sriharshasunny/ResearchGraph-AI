"""FastAPI security and contract checks; external services are mocked."""
import pytest
from fastapi.testclient import TestClient

from backend import auth, main, pipeline


TEST_USER_ID = "00000000-0000-4000-8000-000000000001"
SPOOFED_USER_ID = "99999999-9999-4999-8999-999999999999"
client = TestClient(main.app, raise_server_exceptions=False)

PRIVATE_ENDPOINTS = [
    ("GET", "/api/paper?id=fixture:synthetic", None),
    ("GET", "/api/paper-status?paper_id=fixture:synthetic", None),
    ("POST", "/api/papers/ingest", {"paper_id": "fixture:synthetic"}),
    ("GET", "/api/papers/fixture:synthetic/status", None),
    ("GET", "/api/papers/fixture:synthetic/chunks", None),
    ("GET", "/api/graph/paper/fixture:synthetic", None),
    ("GET", "/api/graph/search?q=method", None),
    ("GET", "/api/graph", None),
    ("GET", "/api/graph/paper?paper_id=fixture:synthetic", None),
    ("POST", "/api/rag/query", {"question": "Describe the method", "paper_ids": ["fixture:synthetic"]}),
    ("GET", "/api/papers/fixture:synthetic", None),
    ("POST", "/api/chat?query=Describe%20the%20method", None),
    ("POST", "/api/literature-review", {}),
    ("POST", "/api/compare", {}),
]


@pytest.fixture
def signed_in_user():
    main.app.dependency_overrides[main.get_current_user] = lambda: TEST_USER_ID
    yield TEST_USER_ID
    main.app.dependency_overrides.pop(main.get_current_user, None)


def test_public_endpoints_remain_accessible_without_authentication(monkeypatch):
    root_res = client.get("/")
    assert root_res.status_code == 200
    assert root_res.json()["health"] == "/api/health"

    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    assert health_res.json()["private_uploads"] is False
    assert "chromadb" in health_res.json()["services"]
    assert "neo4j" in health_res.json()["services"]

    monkeypatch.setattr(main, "search_openalex", lambda query, limit: [{"id": "fixture:synthetic"}])
    search_res = client.get("/api/search?q=synthetic")
    assert search_res.status_code == 200
    assert search_res.json()["papers"][0]["id"] == "fixture:synthetic"


def test_every_private_endpoint_rejects_requests_without_bearer_token():
    for method, path, body in PRIVATE_ENDPOINTS:
        response = client.request(method, path, json=body)
        assert response.status_code == 401, (method, path, response.text)
        assert response.headers.get("www-authenticate") == "Bearer"


def test_every_private_endpoint_rejects_invalid_or_malformed_bearer_token(monkeypatch):
    monkeypatch.setattr(
        main,
        "verify_access_token",
        lambda _token: (_ for _ in ()).throw(auth.InvalidAccessToken("expired or invalid")),
    )
    for method, path, body in PRIVATE_ENDPOINTS:
        response = client.request(
            method,
            path,
            json=body,
            headers={"Authorization": "Bearer synthetic-invalid-token"},
        )
        assert response.status_code == 401, (method, path, response.text)
        assert response.headers.get("www-authenticate") == "Bearer"


def test_get_current_user_maps_configuration_and_unavailable_errors_to_503(monkeypatch):
    monkeypatch.setattr(
        main,
        "verify_access_token",
        lambda _token: (_ for _ in ()).throw(auth.AuthConfigurationError("missing supabase url")),
    )
    config_res = client.get("/api/graph", headers={"Authorization": "Bearer synthetic-token"})
    assert config_res.status_code == 503

    monkeypatch.setattr(
        main,
        "verify_access_token",
        lambda _token: (_ for _ in ()).throw(auth.AuthVerificationUnavailable("jwks offline")),
    )
    unavailable_res = client.get("/api/graph", headers={"Authorization": "Bearer synthetic-token"})
    assert unavailable_res.status_code == 503


def test_authenticated_access_reaches_all_private_handlers_and_placeholders(monkeypatch, signed_in_user):
    monkeypatch.setattr(main, "get_paper_metadata", lambda paper_id: {"id": paper_id, "title": "Synthetic Paper"})
    monkeypatch.setattr(main, "get_ingestion_status", lambda owner_id, paper_id: None)
    monkeypatch.setattr(main, "start_ingestion", lambda owner_id, paper_id: {"paper_id": paper_id, "stage": "queued"})
    monkeypatch.setattr(main, "ingest_paper", lambda owner_id, paper_id: None)
    monkeypatch.setattr(main, "get_paper_chunks", lambda owner_id, paper_id, limit: [{"chunk_id": "c1"}])
    monkeypatch.setattr(main, "get_graph_for_paper", lambda owner_id, paper_id: {"paper_id": paper_id, "nodes": [], "edges": [], "indexed": True})
    monkeypatch.setattr(main, "get_graph_search", lambda owner_id, q, limit: [{"id": "n1", "label": q}])
    monkeypatch.setattr(main, "get_graph", lambda owner_id, limit: {"nodes": [], "edges": [], "indexed": True})
    monkeypatch.setattr(main, "query_research", lambda owner_id, question, paper_ids: {"answer": "ok", "answer_type": "insufficient_context", "citations": [], "graph_evidence": []})

    assert client.get("/api/paper?id=https://openalex.org/W2741809807").status_code == 200
    assert client.get("/api/paper-status?paper_id=arXiv:1706.03762").status_code == 200
    assert client.post("/api/papers/ingest", json={"paper_id": "10.48550/arXiv.1706.03762"}).status_code == 202
    assert client.get("/api/papers/fixture:synthetic/status").status_code == 200
    assert client.get("/api/papers/fixture:synthetic/chunks").status_code == 200
    assert client.get("/api/graph/paper/fixture:synthetic").status_code == 200
    assert client.get("/api/graph/search?q=attention").status_code == 200
    assert client.get("/api/graph").status_code == 200
    assert client.get("/api/graph/paper?paper_id=fixture:synthetic").status_code == 200
    assert client.post("/api/rag/query", json={"question": "Summarize attention", "paper_ids": []}).status_code == 200
    assert client.get("/api/papers/https://openalex.org/W2741809807").status_code == 200
    assert client.post("/api/chat?query=Summarize%20attention").status_code == 200

    lit_res = client.post("/api/literature-review", json={})
    assert lit_res.status_code == 501

    compare_res = client.post("/api/compare", json={})
    assert compare_res.status_code == 501


def test_identity_spoofing_in_query_body_and_headers_is_ignored(monkeypatch, signed_in_user):
    recorded_owners: list[tuple[str, str]] = []
    forged_headers = {"X-User-Id": SPOOFED_USER_ID, "X-Owner-Id": SPOOFED_USER_ID}

    monkeypatch.setattr(
        main,
        "get_ingestion_status",
        lambda owner_id, paper_id: recorded_owners.append(("status", owner_id)) or None,
    )
    monkeypatch.setattr(
        main,
        "get_paper_chunks",
        lambda owner_id, paper_id, limit: recorded_owners.append(("chunks", owner_id)) or [],
    )
    monkeypatch.setattr(
        main,
        "get_graph",
        lambda owner_id, limit: recorded_owners.append(("graph", owner_id)) or {"nodes": [], "edges": [], "indexed": False},
    )
    monkeypatch.setattr(
        main,
        "get_graph_for_paper",
        lambda owner_id, paper_id: recorded_owners.append(("graph_paper", owner_id)) or {"nodes": [], "edges": [], "indexed": False},
    )
    monkeypatch.setattr(
        main,
        "get_graph_search",
        lambda owner_id, q, limit: recorded_owners.append(("graph_search", owner_id)) or [],
    )
    monkeypatch.setattr(
        main,
        "query_research",
        lambda owner_id, question, paper_ids: recorded_owners.append(("rag", owner_id)) or {"answer": "", "answer_type": "insufficient_context", "citations": [], "graph_evidence": []},
    )

    assert client.get(f"/api/paper-status?paper_id=p1&user_id={SPOOFED_USER_ID}", headers=forged_headers).status_code == 200
    assert client.get(f"/api/papers/p1/status?user_id={SPOOFED_USER_ID}", headers=forged_headers).status_code == 200
    assert client.get(f"/api/papers/p1/chunks?user_id={SPOOFED_USER_ID}", headers=forged_headers).status_code == 200
    assert client.get(f"/api/graph?user_id={SPOOFED_USER_ID}", headers=forged_headers).status_code == 200
    assert client.get(f"/api/graph/paper?paper_id=p1&user_id={SPOOFED_USER_ID}", headers=forged_headers).status_code == 200
    assert client.get(f"/api/graph/paper/p1?user_id={SPOOFED_USER_ID}", headers=forged_headers).status_code == 200
    assert client.get(f"/api/graph/search?q=graph&user_id={SPOOFED_USER_ID}", headers=forged_headers).status_code == 200
    assert client.post(
        f"/api/rag/query?user_id={SPOOFED_USER_ID}",
        json={"question": "What does it show?", "paper_ids": ["p1"], "owner_id": SPOOFED_USER_ID, "user_id": SPOOFED_USER_ID},
        headers=forged_headers,
    ).status_code == 200
    assert client.post(
        f"/api/chat?query=What%20does%20it%20show&user_id={SPOOFED_USER_ID}",
        headers=forged_headers,
    ).status_code == 200

    assert len(recorded_owners) == 9
    assert all(owner == signed_in_user for _op, owner in recorded_owners)


def test_background_ingestion_uses_verified_user_id_and_ignores_spoofing(monkeypatch, signed_in_user):
    start_calls: list[tuple[str, str]] = []
    bg_calls: list[tuple[str, str]] = []

    monkeypatch.setattr(
        main,
        "start_ingestion",
        lambda owner_id, paper_id: start_calls.append((owner_id, paper_id)) or {"paper_id": paper_id, "stage": "queued"},
    )
    monkeypatch.setattr(
        main,
        "ingest_paper",
        lambda owner_id, paper_id: bg_calls.append((owner_id, paper_id)),
    )

    response = client.post(
        f"/api/papers/ingest?user_id={SPOOFED_USER_ID}",
        json={"paper_id": "fixture:synthetic", "owner_id": SPOOFED_USER_ID, "user_id": SPOOFED_USER_ID},
        headers={"X-User-Id": SPOOFED_USER_ID, "X-Owner-Id": SPOOFED_USER_ID},
    )
    assert response.status_code == 202
    assert start_calls == [(signed_in_user, "fixture:synthetic")]
    assert bg_calls == [(signed_in_user, "fixture:synthetic")]


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


def test_request_validation_rejects_blank_or_oversized_inputs(signed_in_user):
    assert client.post("/api/rag/query", json={"question": "x", "paper_ids": ["fixture:synthetic"]}).status_code == 422
    assert client.post("/api/rag/query", json={"question": "   ", "paper_ids": ["fixture:synthetic"]}).status_code == 422
    assert client.post(
        "/api/rag/query",
        json={"question": "Valid question?", "paper_ids": [f"p{i}" for i in range(51)]},
    ).status_code == 422
    assert client.post("/api/rag/query", json={"question": "Valid question?", "paper_ids": ["   "]}).status_code == 422
    assert client.post("/api/papers/ingest", json={"paper_id": "   "}).status_code == 422
    assert client.post("/api/papers/ingest", json={"paper_id": "p" * 501}).status_code == 422
    assert client.get("/api/paper?id=%20%20").status_code == 422
    assert client.get(f"/api/papers/{'p' * 501}/status").status_code == 422
    assert client.get(f"/api/graph/search?q={'q' * 201}").status_code == 422
    assert client.get("/api/graph?limit=2001").status_code == 422
    assert client.post("/api/chat?query=%20%20%20").status_code == 422
    assert client.post(f"/api/chat?query={'q' * 4001}").status_code == 422


def test_unexpected_internal_errors_do_not_expose_stack_traces_or_details(monkeypatch, signed_in_user):
    monkeypatch.setattr(
        main,
        "get_graph",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(RuntimeError("sensitive-internal-neo4j-trace")),
    )
    response = client.get("/api/graph")
    assert response.status_code == 500
    assert response.json() == {"detail": "An internal server error occurred."}
    assert "sensitive-internal-neo4j-trace" not in response.text


def test_knowledge_graph_api_returns_only_the_current_users_graph(monkeypatch, signed_in_user):
    graph = {"nodes": [{"id": "fixture-paper", "label": "Synthetic fixture", "type": "Paper"}], "edges": [], "indexed": True}
    calls = []
    monkeypatch.setattr(main, "get_graph", lambda owner_id, _limit: calls.append(owner_id) or graph)
    response = client.get("/api/graph")
    assert response.status_code == 200
    assert response.json() == graph
    assert calls == [signed_in_user]
