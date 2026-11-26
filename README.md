# ResearchGraph AI

ResearchGraph AI combines OpenAlex scholarly discovery with a Supabase-authenticated FastAPI backend for open-access paper ingestion, owner-scoped semantic retrieval (ChromaDB), evidence-backed knowledge graphs (Neo4j), and grounded answers.

## Run locally

1. Use Python 3.10+ (tested on 3.12) and Node.js 20.19+ (or 22.12+).
2. Copy `.env.example` to `.env` (`.env` is gitignored — never commit it) and fill in:
   - Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL=http://localhost:8000`
   - Backend: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`
   - Services: `EMBEDDING_API_KEY` (or `LLM_API_KEY`), `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, and Chroma Cloud (`CHROMA_API_KEY`, `CHROMA_TENANT`, `CHROMA_DATABASE`) or `CHROMA_HOST` (falls back to local storage under `RESEARCHGRAPH_DATA_DIR` if unset).
3. Create a virtual environment and install dependencies (`pip install -r backend/requirements.txt`, or `pip install -r requirements-dev.txt` for tests), then start FastAPI:
   ```sh
   python -m uvicorn backend.main:app --reload --port 8000 --env-file .env
   ```
4. Install frontend packages and start Vite:
   ```sh
   npm install
   npm run dev
   ```
5. Open `/api/health` to verify service configuration flags. A `configured: true` flag does not prove live reachability; ingestion and retrieval report service connection errors explicitly.

## Authentication and security model

- **Frontend Auth**: Managed via Supabase (`src/context/AuthContext.tsx`). Protected routes (`/launch`, `/app/*`) require an active authenticated session, and browser workspace state (`saved_papers`, `scratchpad`, `reading_status`, `paper_notes`, `literature_review_draft`) is isolated per authenticated user UUID.
- **API Authorization**: `src/services/api.ts` attaches the current Supabase session access token as `Authorization: Bearer <access_token>` on all private backend calls.
- **Backend Verification**: `backend/auth.py` verifies `ES256`/`RS256` tokens locally against Supabase JWKS (`leeway=0`, strict issuer/audience/role/UUID-subject checks) and validates legacy `HS256` tokens remotely via Supabase Auth (`/auth/v1/user`) using `SUPABASE_PUBLISHABLE_KEY`. No `SUPABASE_SERVICE_ROLE_KEY` or local JWT secret is stored or required.
- **Identity Handling**: Authenticated routes derive `user_id` exclusively from `get_current_user()` in `backend/main.py` and never trust client-supplied `user_id`, `owner_id`, or identity headers.

## API surface

### Public endpoints (no authentication required)
- `GET /` — API root metadata.
- `GET /api/health` — Public service & configuration health check (used by Render health checks).
- `GET /api/search?q=...&limit=...` — Public OpenAlex scholarly metadata search.

### Authenticated endpoints (`Authorization: Bearer <access_token>` required)
Missing, malformed, or expired tokens return HTTP `401`; missing auth config or unreachable Supabase verification returns HTTP `503`.
- `GET /api/paper?id=...` and `GET /api/papers/{paper_id}` — Paper metadata lookup.
- `POST /api/papers/ingest` — Accepts `{"paper_id": "..."}` and queues background PDF/abstract ingestion under the verified user ID.
- `GET /api/paper-status?paper_id=...` and `GET /api/papers/{paper_id}/status` — Owner-scoped ingestion status.
- `GET /api/papers/{paper_id}/chunks` — Owner-scoped indexed passages for a paper.
- `GET /api/graph`, `GET /api/graph/paper`, `GET /api/graph/paper/{paper_id}`, and `GET /api/graph/search?q=...` — Owner-scoped Neo4j graph nodes, evidence relationships, and entity search.
- `POST /api/rag/query` and `POST /api/chat` — Owner-scoped retrieval-augmented generation constrained to selected `paper_ids`.
- `POST /api/literature-review` and `POST /api/compare` — Protected endpoints currently returning HTTP `501` until indexed multi-paper synthesis is connected.

## Ingestion behavior and current limitations

- Search results come from OpenAlex (`searchPapers` in `src/services/api.ts` calls OpenAlex directly without backend secrets). Nothing is downloaded until the user triggers ingestion.
- OpenAlex IDs, DOIs, and arXiv identifiers are supported. Selectable PDFs are downloaded only from advertised open-access HTTPS URLs with SSRF/redirect/content-type/size checks. If no open-access PDF is available, verified abstracts are indexed as `abstract_only`.
- **Owner isolation & current boundaries**:
  - Authenticated owner isolation (`owner_id`) is implemented in SQLite `paper_statuses`, ChromaDB chunk metadata/queries, and Neo4j scoped keys/nodes/relationships; ownerless legacy records are never returned to authenticated users.
  - Active paper IDs remain external provider identifiers (OpenAlex/DOI/arXiv) rather than internal UUIDs.
  - Ingestion status still uses local SQLite (`RESEARCHGRAPH_DATA_DIR/status.sqlite3`), which is not durable on ephemeral Render filesystems across restarts.
  - Workspace CRUD, workspace membership validation, private PDF uploads, and workspace-aware RAG/KG are not yet implemented. Supabase workspace/paper schema migrations exist in `supabase/`, but active ingestion and retrieval have not yet migrated to them.

## Deployment (Vercel + Render)

- **Vercel (Frontend SPA)**: `vercel.json` serves the Vite SPA via rewrite rules and does not host FastAPI. Configure these environment variables in Vercel Project Settings:
  - `VITE_SUPABASE_URL` — Supabase project HTTPS URL
  - `VITE_SUPABASE_ANON_KEY` — Public browser anon/publishable key
  - `VITE_API_BASE_URL` — HTTPS origin of the deployed FastAPI service
  - Never place backend API keys, Neo4j credentials, Chroma secrets, or Supabase service-role keys in `VITE_*` variables.
- **Render (FastAPI Backend)**: `render.yaml` deploys the `researchgraph-ai-api` service from `rootDir: backend` (`pip install -r requirements.txt` and `uvicorn main:app --host 0.0.0.0 --port $PORT`). Configure exact approved frontend origin(s) in `CORS_ORIGINS` (never `*`) and provide all private credentials via Render's `sync: false` environment prompts. Use managed Chroma Cloud and Neo4j instances rather than local ephemeral storage in production.

## Checks

- Frontend: `npm run build` and `npm run lint`
- Unit isolation & auth lifecycle checks: `node --test tests/authLifecycle.test.ts tests/phase2Isolation.test.ts`
- Backend tests (with mocked external services / temporary SQLite): `python -m pytest -q backend/tests`
- Live verification requires reachable Supabase Auth/JWKS, OpenAlex, an OpenAI-compatible embeddings/chat endpoint, ChromaDB, and Neo4j; mocked unit/API tests and builds do not verify live hosted services.
