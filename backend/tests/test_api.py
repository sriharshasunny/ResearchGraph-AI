"""FastAPI contract checks; backend responses are mocked where services are external."""
from fastapi.testclient import TestClient

from backend import main, pipeline


client = TestClient(main.app)


def test_health_reports_service_configuration_without_claiming_private_upload_support():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["private_uploads"] is False
    assert "chromadb" in response.json()["services"]
    assert "neo4j" in response.json()["services"]


def test_rag_api_returns_insufficient_context_instead_of_fabricating(monkeypatch):
    monkeypatch.setattr(pipeline, "_query_chunks", lambda *_args, **_kwargs: [])
    response = client.post("/api/rag/query", json={"question": "What does this synthetic fixture say?", "paper_ids": []})
    assert response.status_code == 200
    assert response.json()["answer_type"] == "insufficient_context"
    assert response.json()["citations"] == []


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
    response = client.post("/api/rag/query", json={"question": "Describe the fixture method", "paper_ids": []})
    assert response.status_code == 200
    body = response.json()
    assert body["answer_type"] == "retrieval_only"
    assert body["citations"][0]["paper_id"] == "fixture:synthetic"
    assert body["citations"][0]["supporting_passage"].startswith("Synthetic test passage")


def test_rag_api_validates_question_length():
    response = client.post("/api/rag/query", json={"question": "x", "paper_ids": []})
    assert response.status_code == 422


def test_knowledge_graph_api_returns_only_service_graph_records(monkeypatch):
    graph = {"nodes": [{"id": "fixture-paper", "label": "Synthetic fixture", "type": "Paper"}], "edges": [], "indexed": True}
    monkeypatch.setattr(main, "get_graph", lambda _limit: graph)
    response = client.get("/api/graph")
    assert response.status_code == 200
    assert response.json() == graph
