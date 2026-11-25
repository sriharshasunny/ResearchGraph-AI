from __future__ import annotations

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

try:
    from .auth import AuthConfigurationError, AuthVerificationUnavailable, InvalidAccessToken, verify_access_token
except ImportError:  # Supports Render's backend-root command: uvicorn main:app
    from auth import AuthConfigurationError, AuthVerificationUnavailable, InvalidAccessToken, verify_access_token

try:
    from .pipeline import (
        PaperNotFound,
        PipelineError,
        get_graph_for_paper,
        get_graph,
        get_graph_search,
        get_ingestion_status,
        get_paper_chunks,
        get_paper_metadata,
        health_status,
        ingest_paper,
        query_research,
        search_openalex,
        start_ingestion,
    )
except ImportError:  # Supports Render's backend-root command: uvicorn main:app
    from pipeline import (
        PaperNotFound,
        PipelineError,
        get_graph_for_paper,
        get_graph,
        get_graph_search,
        get_ingestion_status,
        get_paper_chunks,
        get_paper_metadata,
        health_status,
        ingest_paper,
        query_research,
        search_openalex,
        start_ingestion,
    )

app = FastAPI(title="ResearchGraph AI Backend", version="2.1.0")
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="A valid Supabase sign-in is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        return str(verify_access_token(credentials.credentials))
    except AuthConfigurationError as exc:
        raise HTTPException(status_code=503, detail="Backend authentication is not configured.") from exc
    except AuthVerificationUnavailable as exc:
        raise HTTPException(status_code=503, detail="Authentication service is temporarily unavailable.") from exc
    except InvalidAccessToken as exc:
        raise HTTPException(
            status_code=401,
            detail="Your sign-in session is invalid or expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in __import__("os").getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if origin.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


class IngestRequest(BaseModel):
    paper_id: str = Field(min_length=1, max_length=500)


class RagRequest(BaseModel):
    question: str = Field(min_length=3, max_length=4000)
    paper_ids: list[str] = Field(default_factory=list, max_length=50)


@app.get("/")
def root():
    return {"message": "ResearchGraph AI API", "health": "/api/health"}


@app.get("/api/health")
def health():
    return health_status()


@app.get("/api/paper")
def paper_details_by_id(
    id: str = Query(..., min_length=1, max_length=500),
    user_id: str = Depends(get_current_user),
):
    try:
        return get_paper_metadata(id)
    except PaperNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PipelineError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.get("/api/paper-status")
def paper_status_by_id(
    paper_id: str = Query(..., min_length=1, max_length=500),
    user_id: str = Depends(get_current_user),
):
    record = get_ingestion_status(user_id, paper_id)
    if not record:
        return {"paper_id": paper_id, "status": "discovered", "message": "This paper has not been added to the research index."}
    return record


@app.get("/api/search")
def search_papers(q: str = Query(..., min_length=1), limit: int = Query(10, ge=1, le=50)):
    try:
        return {"papers": search_openalex(q, limit)}
    except PipelineError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post("/api/papers/ingest", status_code=202)
def ingest(
    request: IngestRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user),
):
    try:
        record = start_ingestion(user_id, request.paper_id)
        if record.get("stage") == "queued":
            background_tasks.add_task(ingest_paper, user_id, request.paper_id)
        return record
    except PaperNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/papers/{paper_id:path}/status")
def paper_status(paper_id: str, user_id: str = Depends(get_current_user)):
    record = get_ingestion_status(user_id, paper_id)
    if not record:
        return {"paper_id": paper_id, "status": "discovered", "message": "This paper has not been added to the research index."}
    return record


@app.get("/api/papers/{paper_id:path}/chunks")
def paper_chunks(
    paper_id: str,
    limit: int = Query(100, ge=1, le=500),
    user_id: str = Depends(get_current_user),
):
    try:
        return {"paper_id": paper_id, "chunks": get_paper_chunks(user_id, paper_id, limit)}
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/graph/paper/{paper_id:path}")
def graph_for_paper(paper_id: str, user_id: str = Depends(get_current_user)):
    try:
        return get_graph_for_paper(user_id, paper_id)
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/graph/search")
def graph_search(
    q: str = Query(..., min_length=1, max_length=200),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user),
):
    try:
        return {"results": get_graph_search(user_id, q, limit)}
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/graph")
def graph_all(
    limit: int = Query(500, ge=1, le=2000),
    user_id: str = Depends(get_current_user),
):
    try:
        return get_graph(user_id, limit)
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/graph/paper")
def graph_for_paper_by_id(
    paper_id: str = Query(..., min_length=1, max_length=500),
    user_id: str = Depends(get_current_user),
):
    try:
        return get_graph_for_paper(user_id, paper_id)
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/api/rag/query")
def rag(request: RagRequest, user_id: str = Depends(get_current_user)):
    try:
        return query_research(user_id, request.question, request.paper_ids)
    except PaperNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


# Keep the established paper-detail route compatible with existing clients.
@app.get("/api/papers/{paper_id:path}")
def paper_details(paper_id: str, user_id: str = Depends(get_current_user)):
    try:
        return get_paper_metadata(paper_id)
    except PaperNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PipelineError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# Legacy chat endpoint now delegates to genuine retrieval and never returns a canned answer.
@app.post("/api/chat")
def legacy_chat(
    query: str = Query(..., min_length=3),
    paper_ids: list[str] = Query(default=[]),
    user_id: str = Depends(get_current_user),
):
    try:
        return query_research(user_id, query, paper_ids)
    except PaperNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/api/literature-review")
def literature_review():
    raise HTTPException(status_code=501, detail="Literature review generation is not yet connected to indexed evidence.")


@app.post("/api/compare")
def compare_papers():
    raise HTTPException(status_code=501, detail="Paper comparison generation is not yet connected to indexed evidence.")
