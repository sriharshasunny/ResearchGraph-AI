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
