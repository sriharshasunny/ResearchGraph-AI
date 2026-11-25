# ResearchGraph AI API

This directory is the FastAPI backend. Render runs it as a web service separately from the Vercel frontend, using the root-level `render.yaml` Blueprint.

## Deploy on Render

1. Push this repository to GitHub.
2. In Render, choose **New + → Blueprint** and connect this repository. Render reads `render.yaml` and creates the `researchgraph-ai-api` web service.
3. Enter the Chroma Cloud API key, tenant, and database when prompted. Add an embedding/LLM API key to enable ingestion and generated answers. Neo4j values are needed for graph persistence.
4. Deploy and check `https://<your-render-service>.onrender.com/api/health`.
5. In the Vercel frontend project, set `VITE_API_BASE_URL` to `https://<your-render-service>.onrender.com`, then redeploy the frontend.

The Blueprint sets `CORS_ORIGINS` to the production Vercel origin. Update it in Render if the frontend uses a different or custom domain. Do not put backend credentials in `VITE_*` variables or commit them to GitHub.

The free Render service uses an ephemeral filesystem. Chroma Cloud keeps vector data in the cloud, but local ingestion status data can be lost when the service restarts. Add persistent storage or move status storage to a managed database for durable ingestion status.

## Local run

From this directory, install `requirements.txt` and run:

```sh
uvicorn main:app --reload --port 8000
```

Alternatively, from the repository root, run `uvicorn backend.main:app --reload --port 8000`.

## Authentication and workspace setup

Set these backend-only variables in your local backend environment and in Render:

- `SUPABASE_URL`: your Supabase project URL.
- `SUPABASE_ANON_KEY`: the project's anon/public key. Do not prefix it with `VITE_`; the backend uses it with each user's bearer token and Supabase RLS.

The frontend sends the signed-in Supabase access token to protected FastAPI routes. FastAPI verifies it with Supabase Auth and derives the user ID from that verified response. It never trusts a user ID supplied by the browser.

Run `supabase/migrations/20261125_create_research_workspaces.sql` in the Supabase SQL editor (or apply it with the Supabase CLI). It creates:
- `research_workspaces`: a user's named workspaces.
- `research_papers`: one reusable paper record per user.
- `workspace_papers`: many-to-many links, so a paper can belong to several workspaces.

Row Level Security is enabled on all three tables. Removing a membership only deletes the workspace-to-paper link; it does not delete the reusable paper record or its indexed chunks/graph evidence.

## Paper-scoped retrieval and verified graph claims

The RAG API accepts either an explicit non-empty `paper_ids` scope or selected `workspace_ids`. Workspace scopes are resolved server-side through the RLS-protected membership table. An empty scope never searches the entire Chroma collection.

Knowledge-graph extraction uses two LLM passes:
1. An extractor proposes typed entities and relationships with a verbatim evidence excerpt and chunk ID.
2. A separate verifier checks whether the excerpt entails the exact subject–predicate–object claim, and records attribution and polarity.

The backend also validates evidence against the original chunk, checks allowed relationship/type combinations, and stores accepted relationship provenance (`paper_id`, `chunk_id`, page, section, validation status, attribution, and polarity). Canonical entity keys are scoped by user, entity type and normalized name, so each user reuses the same typed entity across their papers without sharing nodes with other users.

Chroma chunks, Neo4j paper/entity nodes, graph relationships and ingestion status are scoped by the authenticated user ID. Retrieval checks both the paper scope and user ID. Papers indexed by the previous unscoped version must be re-added/reprocessed under the signed-in account; old unscoped graph records are not returned by the new user-scoped graph queries.

