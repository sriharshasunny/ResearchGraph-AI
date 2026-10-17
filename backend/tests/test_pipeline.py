"""Unit tests use synthetic snippets; they are not real academic records."""
from pathlib import Path

import pytest

from backend import pipeline


def test_openalex_abstract_index_is_restored_by_word_position():
    abstract = pipeline._abstract_from_inverted({"evidence": [2], "Synthetic": [0], "text.": [1]})
    assert abstract == "Synthetic text. evidence"


def test_openalex_metadata_normalizes_authors_and_access_urls():
    work = {
        "id": "https://openalex.org/W123",
        "title": "Synthetic fixture title",
        "authorships": [{"author": {"id": "https://openalex.org/A42", "display_name": "Fixture Author"}}],
        "abstract_inverted_index": {"Fixture": [0], "abstract.": [1]},
        "publication_year": 2024,
        "best_oa_location": {"pdf_url": "https://example.org/paper.pdf"},
        "primary_location": {"source": {"display_name": "Synthetic Venue"}},
        "open_access": {"is_oa": True},
    }
    paper = pipeline._normalize_openalex(work)
    assert paper["id"] == "https://openalex.org/W123"
    assert paper["authors"] == [{"name": "Fixture Author", "id": "https://openalex.org/A42"}]
    assert paper["abstract"] == "Fixture abstract."
    assert paper["pdf_url"] == "https://example.org/paper.pdf"
    assert paper["open_access"] is True


def test_chunk_ids_are_stable_and_keep_page_and_section():
    metadata = {"id": "fixture:synthetic", "title": "Synthetic test paper", "source": "Test Fixture", "source_url": "https://example.org/fixture", "doi": None}
    page = {"page": 3, "section": "Methods", "text": ("Synthetic evidence sentence about a test-only research method. " * 100)}
    first = pipeline._chunks(metadata, [page])
    second = pipeline._chunks(metadata, [page])
    assert [item["id"] for item in first] == [item["id"] for item in second]
    assert first and all(item["metadata"]["page"] == 3 for item in first)
    assert all(item["metadata"]["section"] == "Methods" for item in first)


def test_embedding_provider_uses_configured_real_vectors(monkeypatch):
    monkeypatch.setenv("EMBEDDING_API_KEY", "test-key")
    provider = pipeline.EmbeddingProvider()
    provider._post = lambda *_args, **_kwargs: {"data": [{"index": 1, "embedding": [0.2, 0.8]}, {"index": 0, "embedding": [0.1, 0.9]}]}
    assert provider.embed(["first synthetic text", "second synthetic text"]) == [[0.1, 0.9], [0.2, 0.8]]


def test_embedding_provider_rejects_non_vector_response(monkeypatch):
    monkeypatch.setenv("EMBEDDING_API_KEY", "test-key")
    provider = pipeline.EmbeddingProvider()
    provider._post = lambda *_args, **_kwargs: {"data": [{"index": 0, "embedding": []}]}
    with pytest.raises(pipeline.PipelineError, match="invalid vector"):
        provider.embed(["synthetic"])


def test_chroma_index_uses_upsert_with_stable_ids(monkeypatch):
    calls = []

    class FakeProvider:
        def embed(self, texts):
            return [[0.25, 0.75] for _ in texts]

    class FakeCollection:
        def upsert(self, **kwargs):
            calls.append(kwargs)

    monkeypatch.setattr(pipeline, "EmbeddingProvider", FakeProvider)
    monkeypatch.setattr(pipeline, "_chroma_collection", lambda: FakeCollection())
    chunk = {"id": "stable-fixture-id", "text": "Synthetic fixture passage", "metadata": {"paper_id": "fixture:synthetic"}}
    pipeline._index_chunks([chunk])
    pipeline._index_chunks([chunk])
    assert [call["ids"] for call in calls] == [["stable-fixture-id"], ["stable-fixture-id"]]
    assert calls[0]["embeddings"] == [[0.25, 0.75]]


def test_chroma_cloud_client_uses_server_environment(monkeypatch):
    from types import SimpleNamespace

    calls = []
    collection = object()

    class FakeClient:
        def get_or_create_collection(self, **kwargs):
            calls.append(("collection", kwargs))
            return collection

    def cloud_client(**kwargs):
        calls.append(("client", kwargs))
        return FakeClient()

    import sys
    monkeypatch.setitem(sys.modules, "chromadb", SimpleNamespace(CloudClient=cloud_client))
    monkeypatch.setenv("CHROMA_API_KEY", "test-cloud-key")
    monkeypatch.setenv("CHROMA_TENANT", "test-tenant")
    monkeypatch.setenv("CHROMA_DATABASE", "test-database")
    monkeypatch.delenv("CHROMA_HOST", raising=False)

    assert pipeline._chroma_collection() is collection
    assert calls == [
        ("client", {"api_key": "test-cloud-key", "tenant": "test-tenant", "database": "test-database"}),
        ("collection", {"name": "researchgraph_public", "metadata": {"hnsw:space": "cosine"}}),
    ]


def test_chroma_cloud_requires_all_settings(monkeypatch):
    from types import SimpleNamespace
    import sys

    monkeypatch.setitem(sys.modules, "chromadb", SimpleNamespace())
    monkeypatch.setenv("CHROMA_API_KEY", "test-cloud-key")
    monkeypatch.delenv("CHROMA_TENANT", raising=False)
    monkeypatch.delenv("CHROMA_DATABASE", raising=False)
    with pytest.raises(pipeline.PipelineError, match="requires CHROMA_API_KEY"):
        pipeline._chroma_collection()


def test_invalid_pdf_is_rejected(tmp_path):
    invalid_pdf = tmp_path / "not-a-pdf.pdf"
    invalid_pdf.write_bytes(b"synthetic test content")
    with pytest.raises(pipeline.PipelineError, match="PDF"):
        pipeline._extract_pdf(invalid_pdf)


def test_private_network_pdf_hosts_are_rejected_without_download():
    with pytest.raises(pipeline.PipelineError, match="publicly accessible"):
        pipeline._validate_download_url("https://localhost/test.pdf")


def test_graph_extraction_requires_exact_supporting_evidence(monkeypatch):
    monkeypatch.setenv("LLM_API_KEY", "test-key")
    metadata = {"id": "fixture:synthetic", "title": "Synthetic test paper", "authors": [], "topics": []}
    chunk = {"id": "chunk-1", "text": "The authors evaluate the synthetic method on SampleSet.", "metadata": {"page": 2}}

    class FakeProvider:
        def complete(self, *_args, **_kwargs):
            return '{"entities":[{"type":"Dataset","name":"SampleSet"}],"relationships":[{"source_type":"Paper","source_name":"Synthetic test paper","target_type":"Dataset","target_name":"SampleSet","type":"USES_DATASET","evidence":"evaluate the synthetic method on SampleSet","chunk_id":"chunk-1","page":2},{"source_type":"Paper","source_name":"Synthetic test paper","target_type":"Dataset","target_name":"InventedSet","type":"USES_DATASET","evidence":"This quote is not in the document.","chunk_id":"chunk-1","page":2}]}'

    monkeypatch.setattr(pipeline, "EmbeddingProvider", FakeProvider)
    entities, relations = pipeline._extract_graph(metadata, [chunk])
    assert any(entity["name"] == "SampleSet" for entity in entities)
    assert len(relations) == 1
    assert relations[0]["evidence"] in chunk["text"]


def test_same_name_arxiv_authors_are_not_merged_across_records(monkeypatch):
    monkeypatch.delenv("LLM_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    first, second = [], []
    for paper_id, output in (("arxiv:2301.00001", first), ("arxiv:2302.00002", second)):
        entities, _relations = pipeline._extract_graph({"id": paper_id, "source": "arXiv", "authors": [{"name": "Alex Kim", "id": None}], "topics": []}, [])
        output.extend(entities)
    assert first[0]["key"] != second[0]["key"]


def test_status_record_persists_without_credentials(monkeypatch, tmp_path):
    monkeypatch.setenv("RESEARCHGRAPH_DATA_DIR", str(tmp_path))
    saved = pipeline._save_status("fixture:synthetic", status="extracting", stage="extract")
    loaded = pipeline.get_ingestion_status("fixture:synthetic")
    assert loaded == saved
    assert Path(tmp_path, "status.sqlite3").exists()


def test_graph_failure_keeps_vector_stage_as_a_reported_partial_result(monkeypatch, tmp_path):
    monkeypatch.setenv("RESEARCHGRAPH_DATA_DIR", str(tmp_path))
    metadata = {"id": "fixture:partial", "title": "Synthetic test paper", "authors": [], "abstract": "Synthetic test abstract.", "year": 2024, "doi": None, "venue": None, "source": "Test Fixture", "source_url": "https://example.org/fixture", "pdf_url": "https://example.org/fixture.pdf", "open_access": True, "topics": []}
    monkeypatch.setattr(pipeline, "get_paper_metadata", lambda _paper_id: metadata)
    monkeypatch.setattr(pipeline, "_download_pdf", lambda _url: tmp_path / "temporary.pdf")
    monkeypatch.setattr(pipeline, "_extract_pdf", lambda _path: [{"page": 1, "section": "Test", "text": "Synthetic test passage about a supported method. " * 3}])
    monkeypatch.setattr(pipeline, "_chunks", lambda *_args: [{"id": "synthetic-chunk", "text": "Synthetic test passage about a supported method.", "metadata": {"paper_id": metadata["id"]}}])
    monkeypatch.setattr(pipeline, "_index_chunks", lambda _chunks: None)
    monkeypatch.setattr(pipeline, "_extract_graph", lambda *_args: ([], []))
    monkeypatch.setattr(pipeline, "_write_graph", lambda *_args: (_ for _ in ()).throw(pipeline.PipelineError("synthetic graph failure")))

    pipeline.ingest_paper(metadata["id"])
    status = pipeline.get_ingestion_status(metadata["id"])
    assert status["status"] == "failed"
    assert status["stage"] == "knowledge_graph"
    assert status["vector_ready"] is True
    assert status["graph_ready"] is False
