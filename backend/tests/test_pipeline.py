"""Unit tests use synthetic snippets; they are not real academic records."""
import sqlite3
from pathlib import Path

import pytest

from backend import pipeline

USER_A = "00000000-0000-4000-8000-000000000001"
USER_B = "00000000-0000-4000-8000-000000000002"


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
    first = pipeline._chunks(metadata, [page], USER_A)
    second = pipeline._chunks(metadata, [page], USER_A)
    another_users_chunks = pipeline._chunks(metadata, [page], USER_B)
    assert [item["id"] for item in first] == [item["id"] for item in second]
    assert [item["id"] for item in first] != [item["id"] for item in another_users_chunks]
    assert first and all(item["metadata"]["page"] == 3 for item in first)
    assert all(item["metadata"]["owner_id"] == USER_A for item in first)
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


def test_chroma_index_uses_upsert_with_stable_ids_and_prevents_owner_spoofing(monkeypatch):
    calls = []

    class FakeProvider:
        def embed(self, texts):
            return [[0.25, 0.75] for _ in texts]

    class FakeCollection:
        def upsert(self, **kwargs):
            calls.append(kwargs)

    monkeypatch.setattr(pipeline, "EmbeddingProvider", FakeProvider)
    monkeypatch.setattr(pipeline, "_chroma_collection", lambda: FakeCollection())
    chunk = {
        "id": "stable-fixture-id",
        "text": "Synthetic fixture passage",
        "metadata": {"paper_id": "fixture:synthetic", "owner_id": USER_B, "page": 1, "section": None},
    }
    pipeline._index_chunks(USER_A, [chunk])
    pipeline._index_chunks(USER_A, [chunk])
    assert [call["ids"] for call in calls] == [["stable-fixture-id"], ["stable-fixture-id"]]
    assert calls[0]["embeddings"] == [[0.25, 0.75]]
    assert calls[0]["metadatas"][0]["owner_id"] == USER_A
    assert "section" not in calls[0]["metadatas"][0]


def test_chroma_query_enforces_owner_and_paper_filters_and_rejects_foreign_rows(monkeypatch):
    query_calls = []

    class FakeProvider:
        def embed(self, texts):
            return [[0.5, 0.5] for _ in texts]

    class FakeCollection:
        def query(self, **kwargs):
            query_calls.append(kwargs)
            return {
                "ids": [["c-own", "c-foreign", "c-ownerless", "c-other-paper"]],
                "documents": [["Owner text", "Foreign text", "Legacy text", "Unrequested paper text"]],
                "metadatas": [[
                    {"owner_id": USER_A, "paper_id": "p1"},
                    {"owner_id": USER_B, "paper_id": "p1"},
                    {"paper_id": "p1"},
                    {"owner_id": USER_A, "paper_id": "p2"},
                ]],
                "distances": [[0.1, 0.1, 0.1, 0.1]],
            }

    monkeypatch.setattr(pipeline, "EmbeddingProvider", FakeProvider)
    monkeypatch.setattr(pipeline, "_chroma_collection", lambda: FakeCollection())

    results = pipeline._query_chunks(USER_A, "What does p1 show?", ["p1"])
    assert len(query_calls) == 1
    assert query_calls[0]["where"] == {"$and": [{"owner_id": USER_A}, {"paper_id": {"$in": ["p1"]}}]}
    assert [row["chunk_id"] for row in results] == ["c-own"]
    assert results[0]["metadata"]["owner_id"] == USER_A


def test_chroma_two_users_with_identical_external_paper_id_stay_isolated(monkeypatch):
    store: dict[str, dict] = {}

    class FakeProvider:
        def embed(self, texts):
            return [[0.25, 0.75] for _ in texts]

    class InMemoryCollection:
        def upsert(self, *, ids, documents, metadatas, embeddings):
            for idx, item_id in enumerate(ids):
                store[item_id] = {"id": item_id, "document": documents[idx], "metadata": metadatas[idx], "embedding": embeddings[idx]}

        def _matches(self, meta, where):
            clauses = where.get("$and", [])
            for clause in clauses:
                for key, expected in clause.items():
                    if isinstance(expected, dict) and "$in" in expected:
                        if meta.get(key) not in expected["$in"]:
                            return False
                    elif meta.get(key) != expected:
                        return False
            return True

        def query(self, *, query_embeddings, n_results, where, include):
            matched = [row for row in store.values() if self._matches(row["metadata"], where)][:n_results]
            return {
                "ids": [[row["id"] for row in matched]],
                "documents": [[row["document"] for row in matched]],
                "metadatas": [[row["metadata"] for row in matched]],
                "distances": [[0.05 for _ in matched]],
            }

        def get(self, *, where, limit, include):
            matched = [row for row in store.values() if self._matches(row["metadata"], where)][:limit]
            return {
                "ids": [row["id"] for row in matched],
                "documents": [row["document"] for row in matched],
                "metadatas": [row["metadata"] for row in matched],
            }

    # Add an ownerless legacy vector for the exact same external paper_id
    store["legacy-ownerless-id"] = {"id": "legacy-ownerless-id", "document": "Legacy public passage", "metadata": {"paper_id": "fixture:shared"}, "embedding": [0.25, 0.75]}

    monkeypatch.setattr(pipeline, "EmbeddingProvider", FakeProvider)
    monkeypatch.setattr(pipeline, "_chroma_collection", lambda: InMemoryCollection())

    meta = {"id": "fixture:shared", "title": "Shared External Paper", "source": "Test", "source_url": "https://example.org/shared", "doi": None}
    page = {"page": 1, "section": "Results", "text": ("Synthetic empirical sentence about shared paper evaluation. " * 10)}
    chunks_a = pipeline._chunks(meta, [page], USER_A)
    chunks_b = pipeline._chunks(meta, [page], USER_B)

    pipeline._index_chunks(USER_A, chunks_a)
    pipeline._index_chunks(USER_B, chunks_b)

    res_a = pipeline._query_chunks(USER_A, "shared paper evaluation", ["fixture:shared"])
    res_b = pipeline._query_chunks(USER_B, "shared paper evaluation", ["fixture:shared"])
    assert res_a and all(row["metadata"]["owner_id"] == USER_A for row in res_a)
    assert res_b and all(row["metadata"]["owner_id"] == USER_B for row in res_b)
    assert {row["chunk_id"] for row in res_a}.isdisjoint({row["chunk_id"] for row in res_b})
    assert "legacy-ownerless-id" not in {row["chunk_id"] for row in res_a}

    get_a = pipeline.get_paper_chunks(USER_A, "fixture:shared")
    get_b = pipeline.get_paper_chunks(USER_B, "fixture:shared")
    assert all(row["metadata"]["owner_id"] == USER_A for row in get_a)
    assert all(row["metadata"]["owner_id"] == USER_B for row in get_b)


def test_chroma_get_paper_chunks_rejects_foreign_and_ownerless_rows(monkeypatch):
    get_calls = []

    class FakeCollection:
        def get(self, **kwargs):
            get_calls.append(kwargs)
            return {
                "ids": ["c-own", "c-foreign", "c-legacy", "c-wrong-paper"],
                "documents": ["Own", "Foreign", "Legacy", "Other"],
                "metadatas": [
                    {"owner_id": USER_A, "paper_id": "p1"},
                    {"owner_id": USER_B, "paper_id": "p1"},
                    {"paper_id": "p1"},
                    {"owner_id": USER_A, "paper_id": "p2"},
                ],
            }

    monkeypatch.setattr(pipeline, "_chroma_collection", lambda: FakeCollection())
    rows = pipeline.get_paper_chunks(USER_A, "p1", limit=25)
    assert get_calls[0]["where"] == {"$and": [{"owner_id": USER_A}, {"paper_id": "p1"}]}
    assert [row["chunk_id"] for row in rows] == ["c-own"]


def test_chroma_empty_selection_never_calls_embeddings_or_chroma(monkeypatch):
    class ForbiddenProvider:
        def embed(self, _texts):
            raise AssertionError("EmbeddingProvider must not run on empty paper_ids.")

    def forbidden_chroma():
        raise AssertionError("_chroma_collection must not be initialized on empty paper_ids.")

    monkeypatch.setattr(pipeline, "EmbeddingProvider", ForbiddenProvider)
    monkeypatch.setattr(pipeline, "_chroma_collection", forbidden_chroma)

    assert pipeline._query_chunks(USER_A, "What does it say?", []) == []
    assert pipeline._query_chunks(USER_A, "What does it say?", ["   "]) == []


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


def test_neo4j_scoped_keys_and_write_provenance(monkeypatch):
    assert pipeline._scoped_graph_key(USER_A, "Author", "author-123") != pipeline._scoped_graph_key(USER_B, "Author", "author-123")

    statements = []

    class FakeResult:
        def consume(self):
            return None

    class FakeSession:
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

        def run(self, query, **params):
            statements.append((query, params))
            return FakeResult()

    class FakeDriver:
        def session(self, **_kwargs):
            return FakeSession()

        def close(self):
            return None

    monkeypatch.setattr(pipeline, "_neo4j_driver", lambda: FakeDriver())
    metadata = {"id": "p1", "title": "Paper One", "source_url": "https://example.org/p1", "doi": "10.1000/test"}
    entities = [
        {"type": "Method", "key": "m1", "name": "GraphRAG"},
        {"type": "InjectedLabel`", "key": "bad", "name": "Ignored"},
    ]
    relations = [
        {"source_type": "Paper", "source_key": "p1", "target_type": "Method", "target_key": "m1", "type": "USES_METHOD", "evidence": "Uses GraphRAG", "page": 2, "method": "llm_evidence_validated"},
        {"source_type": "Paper", "source_key": "p1", "target_type": "Method", "target_key": "m1", "type": "FORBIDDEN_REL", "evidence": "bad", "page": 1, "method": "llm_evidence_validated"},
    ]

    pipeline._write_graph(USER_A, metadata, entities, relations)

    paper_writes = [p for q, p in statements if "MERGE (p:ResearchEntity:Paper" in q]
    entity_writes = [p for q, p in statements if "MERGE (e:ResearchEntity {key:$key})" in q]
    rel_writes = [p for q, p in statements if "MERGE (s)-[r:USES_METHOD" in q]

    assert paper_writes[0]["owner_id"] == USER_A
    assert paper_writes[0]["paper_id"] == "p1"
    assert paper_writes[0]["key"] == pipeline._scoped_graph_key(USER_A, "Paper", "p1")
    assert len(entity_writes) == 1
    assert entity_writes[0]["owner_id"] == USER_A
    assert entity_writes[0]["key"] == pipeline._scoped_graph_key(USER_A, "Method", "m1")
    assert len(rel_writes) == 1
    assert rel_writes[0]["owner_id"] == USER_A
    assert rel_writes[0]["paper_id"] == "p1"
    assert rel_writes[0]["evidence"] == "Uses GraphRAG"
    assert rel_writes[0]["page"] == 2
    assert rel_writes[0]["method"] == "llm_evidence_validated"
    assert all("FORBIDDEN_REL" not in q and "InjectedLabel" not in q for q, _p in statements)


def test_neo4j_reads_enforce_owner_filters_and_reject_foreign_or_ownerless_records(monkeypatch):
    executed_queries = []

    class FakeRecord:
        def __init__(self, mapping):
            self._mapping = mapping

        def data(self):
            return dict(self._mapping)

        def get(self, key, default=None):
            return self._mapping.get(key, default)

        def __getitem__(self, key):
            return self._mapping[key]

    class FakeRel(dict):
        def __init__(self, rel_type, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self.type = rel_type

    class FakeSession:
        def __init__(self, rows):
            self._rows = rows

        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

        def run(self, cypher, **params):
            executed_queries.append((cypher, params))
            return self._rows

    class FakeDriver:
        def __init__(self, rows):
            self._rows = rows

        def session(self, **_kwargs):
            return FakeSession(self._rows)

        def close(self):
            return None

    # 1. _query_graph filters & post-validation
    query_rows = [
        FakeRecord({"paper_id": "p1", "paper_title": "Owned", "relation": "USES_METHOD", "entity": "GraphRAG", "entity_type": "Method", "evidence": "ok", "page": 1, "p_owner_id": USER_A, "n_owner_id": USER_A, "r_owner_id": USER_A}),
        FakeRecord({"paper_id": "p1", "paper_title": "ForeignNode", "relation": "USES_METHOD", "entity": "Leak", "entity_type": "Method", "evidence": "no", "page": 1, "p_owner_id": USER_A, "n_owner_id": USER_B, "r_owner_id": USER_A}),
        FakeRecord({"paper_id": "p1", "paper_title": "Legacy", "relation": "USES_METHOD", "entity": "LegacyEntity", "entity_type": "Method", "evidence": "no", "page": 1, "p_owner_id": None, "n_owner_id": USER_A, "r_owner_id": USER_A}),
    ]
    monkeypatch.setattr(pipeline, "_neo4j_driver", lambda: FakeDriver(query_rows))
    q_res = pipeline._query_graph(USER_A, ["p1"], ["GraphRAG"])
    assert len(q_res) == 1 and q_res[0]["entity"] == "GraphRAG"
    assert "p.owner_id=$owner_id" in executed_queries[-1][0]
    assert "r.owner_id=$owner_id" in executed_queries[-1][0]
    assert executed_queries[-1][1]["owner_id"] == USER_A

    # 2. get_graph_for_paper filters & post-validation
    paper_rows = [
        FakeRecord({"p": {"key": "pk-a", "name": "Owned Paper", "paper_id": "p1", "source_url": "https://example.org/p1", "owner_id": USER_A}, "n": {"key": "ek-a", "name": "GraphRAG", "type": "Method", "owner_id": USER_A}, "relation": "USES_METHOD", "evidence": "e1", "page": 2, "r_owner_id": USER_A}),
        FakeRecord({"p": {"key": "pk-a", "name": "Owned Paper", "paper_id": "p1", "source_url": "https://example.org/p1", "owner_id": USER_A}, "n": {"key": "ek-b", "name": "Foreign Entity", "type": "Method", "owner_id": USER_B}, "relation": "USES_METHOD", "evidence": "e2", "page": 2, "r_owner_id": USER_B}),
    ]
    monkeypatch.setattr(pipeline, "_neo4j_driver", lambda: FakeDriver(paper_rows))
    paper_graph = pipeline.get_graph_for_paper(USER_A, "p1")
    assert [node["id"] for node in paper_graph["nodes"]] == ["pk-a", "ek-a"]
    assert len(paper_graph["edges"]) == 1

    # 3. get_graph filters & post-validation
    full_rows = [
        FakeRecord({"a": {"key": "pk-a", "name": "Owned", "type": "Paper", "paper_id": "p1", "owner_id": USER_A}, "r": FakeRel("USES_METHOD", owner_id=USER_A, evidence="ev1", page=1, evidence_id="evid1"), "b": {"key": "ek-a", "name": "GraphRAG", "type": "Method", "owner_id": USER_A}}),
        FakeRecord({"a": {"key": "pk-a", "name": "Owned", "type": "Paper", "paper_id": "p1", "owner_id": USER_A}, "r": FakeRel("USES_METHOD", owner_id=None, evidence="legacy", page=1, evidence_id="evid2"), "b": {"key": "ek-legacy", "name": "Legacy", "type": "Method"}}),
    ]
    monkeypatch.setattr(pipeline, "_neo4j_driver", lambda: FakeDriver(full_rows))
    full_graph = pipeline.get_graph(USER_A)
    assert [node["id"] for node in full_graph["nodes"]] == ["pk-a", "ek-a"]
    assert len(full_graph["edges"]) == 1

    # 4. get_graph_search filters & post-validation
    search_rows = [
        FakeRecord({"id": "ek-a", "label": "GraphRAG", "type": "Method", "paperId": None, "sourceUrl": None, "owner_id": USER_A}),
        FakeRecord({"id": "ek-b", "label": "ForeignRAG", "type": "Method", "paperId": None, "sourceUrl": None, "owner_id": USER_B}),
        FakeRecord({"id": "ek-legacy", "label": "LegacyRAG", "type": "Method", "paperId": None, "sourceUrl": None, "owner_id": None}),
    ]
    monkeypatch.setattr(pipeline, "_neo4j_driver", lambda: FakeDriver(search_rows))
    search_res = pipeline.get_graph_search(USER_A, "RAG")
    assert search_res == [{"id": "ek-a", "label": "GraphRAG", "type": "Method", "paperId": None, "sourceUrl": None}]


def test_neo4j_empty_selection_never_opens_driver(monkeypatch):
    def forbidden_driver():
        raise AssertionError("_neo4j_driver must not be opened for empty paper_ids.")

    monkeypatch.setattr(pipeline, "_neo4j_driver", forbidden_driver)
    assert pipeline._query_graph(USER_A, [], ["attention", "graph"]) == []
    assert pipeline._query_graph(USER_A, ["  "], ["attention", "graph"]) == []


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


def test_status_record_is_scoped_by_owner_and_ignores_legacy_table(monkeypatch, tmp_path):
    monkeypatch.setenv("RESEARCHGRAPH_DATA_DIR", str(tmp_path))

    # Populate an older ownerless `papers` table in the same SQLite DB
    db_path = Path(tmp_path, "status.sqlite3")
    with sqlite3.connect(db_path) as conn:
        conn.execute("CREATE TABLE papers (paper_id TEXT PRIMARY KEY, data TEXT NOT NULL)")
        conn.execute(
            "INSERT INTO papers(paper_id, data) VALUES (?, ?)",
            ("fixture:legacy-only", '{"paper_id":"fixture:legacy-only","status":"ready"}'),
        )
        conn.execute(
            "INSERT INTO papers(paper_id, data) VALUES (?, ?)",
            ("fixture:synthetic", '{"paper_id":"fixture:synthetic","status":"ready"}'),
        )

    assert pipeline.get_ingestion_status(USER_A, "fixture:legacy-only") is None
    assert pipeline.get_ingestion_status(USER_A, "fixture:synthetic") is None

    saved_a = pipeline._save_status(USER_A, "fixture:synthetic", status="extracting", stage="extract")
    pipeline._save_status(USER_B, "fixture:synthetic", status="queued", stage="queued")
    saved_a_updated = pipeline._save_status(USER_A, "fixture:synthetic", status="ready", stage="complete")

    assert pipeline.get_ingestion_status(USER_A, "fixture:synthetic") == saved_a_updated
    assert saved_a["status"] == "extracting"
    assert pipeline.get_ingestion_status(USER_B, "fixture:synthetic")["status"] == "queued"

    # Legacy `papers` rows remain completely untouched
    with sqlite3.connect(db_path) as conn:
        legacy_rows = conn.execute("SELECT paper_id, data FROM papers ORDER BY paper_id").fetchall()
        assert legacy_rows == [
            ("fixture:legacy-only", '{"paper_id":"fixture:legacy-only","status":"ready"}'),
            ("fixture:synthetic", '{"paper_id":"fixture:synthetic","status":"ready"}'),
        ]


def test_end_to_end_ingestion_preserves_verified_owner_and_isolates_user_b(monkeypatch, tmp_path):
    monkeypatch.setenv("RESEARCHGRAPH_DATA_DIR", str(tmp_path))
    observed_owners = []

    metadata = {
        "id": "fixture:e2e", "title": "End-to-End Paper", "authors": [{"name": "Ada Lovelace", "id": None}],
        "abstract": "Synthetic abstract.", "year": 2025, "doi": None, "venue": None,
        "source": "Test Fixture", "source_url": "https://example.org/e2e",
        "pdf_url": "https://example.org/e2e.pdf", "open_access": True, "topics": ["Graph RAG"],
    }
    monkeypatch.setattr(pipeline, "get_paper_metadata", lambda _paper_id: metadata)
    monkeypatch.setattr(pipeline, "_download_pdf", lambda _url: tmp_path / "temp.pdf")
    monkeypatch.setattr(pipeline, "_extract_pdf", lambda _path: [{"page": 1, "section": "Methods", "text": "Synthetic test passage " * 25}])

    orig_chunks = pipeline._chunks
    monkeypatch.setattr(
        pipeline,
        "_chunks",
        lambda m, p, owner: observed_owners.append(("chunks", owner)) or orig_chunks(m, p, owner),
    )
    monkeypatch.setattr(
        pipeline,
        "_index_chunks",
        lambda owner, chunks: observed_owners.append(("index_chunks", owner, chunks[0]["metadata"]["owner_id"])),
    )
    monkeypatch.setattr(
        pipeline,
        "_write_graph",
        lambda owner, m, e, r: observed_owners.append(("write_graph", owner)),
    )

    pipeline._save_status(USER_B, metadata["id"], status="queued", stage="queued")
    start_rec = pipeline.start_ingestion(USER_A, metadata["id"])
    assert start_rec["stage"] == "queued"

    pipeline.ingest_paper(USER_A, metadata["id"])

    status_a = pipeline.get_ingestion_status(USER_A, metadata["id"])
    status_b = pipeline.get_ingestion_status(USER_B, metadata["id"])
    assert status_a["status"] == "ready"
    assert status_b["status"] == "queued"
    assert observed_owners == [
        ("chunks", USER_A),
        ("index_chunks", USER_A, USER_A),
        ("write_graph", USER_A),
    ]


def test_graph_failure_keeps_vector_stage_as_a_reported_partial_result(monkeypatch, tmp_path):
    monkeypatch.setenv("RESEARCHGRAPH_DATA_DIR", str(tmp_path))
    metadata = {"id": "fixture:partial", "title": "Synthetic test paper", "authors": [], "abstract": "Synthetic test abstract.", "year": 2024, "doi": None, "venue": None, "source": "Test Fixture", "source_url": "https://example.org/fixture", "pdf_url": "https://example.org/fixture.pdf", "open_access": True, "topics": []}
    monkeypatch.setattr(pipeline, "get_paper_metadata", lambda _paper_id: metadata)
    monkeypatch.setattr(pipeline, "_download_pdf", lambda _url: tmp_path / "temporary.pdf")
    monkeypatch.setattr(pipeline, "_extract_pdf", lambda _path: [{"page": 1, "section": "Test", "text": "Synthetic test passage about a supported method. " * 3}])
    monkeypatch.setattr(pipeline, "_chunks", lambda *_args: [{"id": "synthetic-chunk", "text": "Synthetic test passage about a supported method.", "metadata": {"paper_id": metadata["id"]}}])
    monkeypatch.setattr(pipeline, "_index_chunks", lambda *_args: None)
    monkeypatch.setattr(pipeline, "_extract_graph", lambda *_args: ([], []))
    monkeypatch.setattr(pipeline, "_write_graph", lambda *_args: (_ for _ in ()).throw(pipeline.PipelineError("synthetic graph failure")))

    pipeline.ingest_paper(USER_A, metadata["id"])
    status = pipeline.get_ingestion_status(USER_A, metadata["id"])
    assert status["status"] == "failed"
    assert status["stage"] == "knowledge_graph"
    assert status["vector_ready"] is True
    assert status["graph_ready"] is False
