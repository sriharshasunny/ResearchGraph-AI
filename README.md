# ResearchGraph AI

ResearchGraph AI uses OpenAlex for scholarly metadata and provides an optional FastAPI pipeline for open-access paper ingestion, semantic retrieval, evidence-backed graph data, and grounded answers.

## Run locally

1. Use Python 3.10 or newer and Node.js 20.19+ (or 22.12+).
2. Copy `.env.example` to `.env` and set `EMBEDDING_API_KEY` (or `LLM_API_KEY`), `NEO4J_URI`, `NEO4J_USERNAME`, and `NEO4J_PASSWORD`. Set `LLM_API_KEY` as well to enable generated answers. Chroma can use Cloud (`CHROMA_API_KEY`, `CHROMA_TENANT`, `CHROMA_DATABASE`), a hosted server (`CHROMA_HOST`), or local persistent storage when neither remote option is configured.
3. Create a virtual environment, install `requirements.txt`, then start the API with `python -m uvicorn backend.main:app --reload --port 8000 --env-file .env`.
4. Set the Vite environment variable `VITE_API_BASE_URL=http://localhost:8000` and run `npm install` followed by `npm run dev`.
5. Open `/api/health` to see whether the AI provider, ChromaDB, and Neo4j are configured. A configured flag does not imply a live connection; each operation reports service failures explicitly.

## Ingestion and retrieval behavior

- Search results are metadata from OpenAlex. Nothing is downloaded until the user selects **Add to workspace**.
- OpenAlex and arXiv identifiers are supported by the backend. Full text is downloaded only from the provider's advertised open-access PDF URL. HTTPS redirects, public host resolution, PDF content type, file signature, and file size are checked. Publisher access controls are not bypassed.
- Selectable PDF text is chunked with page/section metadata. Scanned PDFs are reported unsupported because OCR is not included. When no PDF is available but a verified abstract exists, only that abstract is embedded and indexed, and the status remains `abstract_only`.
- Embeddings and answer generation use the configured OpenAI-compatible API. No local/random embeddings or simulated answers are generated.
- Chroma stores real vectors and passage metadata. Neo4j stores paper/author/topic metadata and relationships whose evidence is validated against extracted passages. Citation edges are not inferred from similarity.
- Re-ingestion uses deterministic chunk IDs and Chroma upserts. A Neo4j failure is reported as a partial failure while preserving successful vector indexing for retry.
- The current backend indexes public scholarly records only. Private uploads, private notes, and workspace-specific graph data are intentionally not accepted because this application does not yet send a verifiable authenticated user identity to the backend.

## API surface

- `GET /api/search?q=...` and `GET /api/papers/{OpenAlex ID or DOI}` provide OpenAlex metadata.
- `POST /api/papers/ingest` accepts `{"paper_id":"https://openalex.org/W..."}` or an arXiv ID and queues processing.
- `GET /api/papers/{paper ID}/status` and `/chunks` expose real ingestion state and passages.
- `GET /api/graph`, `/api/graph/paper/{paper ID}`, and `/api/graph/search?q=...` return stored Neo4j data only.
- `POST /api/rag/query` accepts `{"question":"...", "paper_ids":[]}`. With no relevant passages it returns an insufficient-context response; without an LLM key it can return retrieved passages without claiming generated analysis.

## Deployment

The repository's `vercel.json` serves the Vite frontend as a static SPA; it does not run the FastAPI application. Deploy the backend separately to a persistent Python host and set `VITE_API_BASE_URL` to that HTTPS API origin at frontend build time. Configure exact frontend origins in `CORS_ORIGINS`.

Do not use the backend's local filesystem mode on an ephemeral/serverless host. Configure Chroma Cloud with all three `CHROMA_API_KEY`, `CHROMA_TENANT`, and `CHROMA_DATABASE` values, or configure a persistent Chroma server using `CHROMA_HOST`. Attach persistent storage for the SQLite status database at `RESEARCHGRAPH_DATA_DIR`, or replace that local status store with a managed database before running multiple backend instances. Use a managed Neo4j deployment for durable graph storage. Keep all API keys and database credentials server-side; never put them in `VITE_*` variables.

## Checks

- Frontend: `npm run build` and `npm run lint`.
- Backend: install the runtime requirements and `pytest`; run `python -m pytest`.
- Live verification requires reachable OpenAlex, an OpenAI-compatible embeddings/chat endpoint, ChromaDB, and Neo4j. A successful frontend build does not verify these external services.
