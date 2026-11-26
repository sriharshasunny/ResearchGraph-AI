# ResearchGraph AI API

This directory is the FastAPI backend. Render runs it as a separate web service from the Vercel frontend using the root-level `render.yaml` Blueprint.

## Authentication & API access

- Public routes: `GET /`, `GET /api/health`, `GET /api/search`.
- Authenticated routes: every paper, ingestion-status, chunk, graph, RAG, chat, literature-review placeholder, and compare placeholder route requires `Authorization: Bearer <supabase_access_token>`.
- `auth.py` verifies `ES256`/`RS256` JWTs against `${SUPABASE_URL}/auth/v1/.well-known/jwks.json` (`leeway=0`) and forwards legacy `HS256` tokens to `${SUPABASE_URL}/auth/v1/user` with `SUPABASE_PUBLISHABLE_KEY`. Never configure `SUPABASE_SERVICE_ROLE_KEY` or a local JWT secret here.
- User identity is derived exclusively from `get_current_user()` in `main.py`; client-supplied `user_id` or `owner_id` inputs are ignored.

## Deploy on Render

1. Push this repository to GitHub.
2. In Render, choose **New + → Blueprint** and connect this repository. Render reads `render.yaml` (`rootDir: backend`, `buildCommand: pip install -r requirements.txt`, `startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT`, `healthCheckPath: /api/health`).
3. Populate the prompted `sync: false` secrets in Render: `SUPABASE_PUBLISHABLE_KEY`, `CHROMA_API_KEY`, `CHROMA_TENANT`, `CHROMA_DATABASE`, `LLM_API_KEY`, `EMBEDDING_API_KEY`, `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`.
4. Confirm `CORS_ORIGINS` matches your exact deployed Vercel frontend origin(s) (never `*`).
5. After deploy, check `https://<your-render-service>.onrender.com/api/health`.
6. In the Vercel frontend project settings, configure:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL=https://<your-render-service>.onrender.com`
   Then redeploy the frontend. Never put backend secrets in `VITE_*` variables or commit `.env` files.

The free Render tier uses an ephemeral filesystem. Chroma Cloud and Neo4j store vectors and graphs externally, while local SQLite ingestion status (`RESEARCHGRAPH_DATA_DIR/status.sqlite3`) is not durable across restarts until migrated to managed storage.

## Local run

From `backend/`, install `requirements.txt` and run with root `.env` (or backend environment variables configured):

```sh
uvicorn main:app --reload --port 8000 --env-file ../.env
```

Alternatively, from the repository root:

```sh
python -m uvicorn backend.main:app --reload --port 8000 --env-file .env
```
