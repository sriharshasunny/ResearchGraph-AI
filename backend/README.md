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

## Paper-scoped retrieval and verified graph claims

The RAG endpoint now requires an explicit, non-empty `paper_ids` list. An empty selection returns an insufficient-context response; it never searches the entire Chroma collection.

Knowledge-graph extraction uses two LLM passes:
1. An extractor proposes typed entities and relationships with a verbatim evidence excerpt and chunk ID.
2. A separate verifier checks whether the excerpt entails the exact subject–predicate–object claim, and records attribution and polarity.

The backend also validates evidence against the original chunk, checks allowed relationship/type combinations, and stores accepted relationship provenance (`paper_id`, `chunk_id`, page, section, validation status, attribution, and polarity). Canonical entity keys are deterministic by entity type and normalized name, so repeated mentions of the same typed name reuse one node.

Existing papers indexed before graph schema version 2 are queued for reprocessing the next time the ingestion action is requested. Their old graph edges are not treated as verified evidence. Reprocessing refreshes the evidence-backed graph records.

**Current scope of this change:** paper-level filtering and graph evidence provenance are implemented. Persistent workspace membership and server-verified per-user authorization are separate follow-up work; do not expose the current shared Chroma/Neo4j infrastructure as a multi-user isolated service until those controls are added.

