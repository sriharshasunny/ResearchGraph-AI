from __future__ import annotations

import logging
import os

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Path, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field, field_validator

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

logger = logging.getLogger("researchgraph.api")

app = FastAPI(title="ResearchGraph AI Backend", version="2.1.0")
bearer_scheme = HTTPBearer(auto_error=False)


def _clean_text(value: str, field_name: str, *, min_len: int = 1, max_len: int = 500) -> str:
    cleaned = value.strip()
    if len(cleaned) < min_len or len(cleaned) > max_len:
        raise HTTPException(
            status_code=422,
            detail=f"{field_name} must be between {min_len} and {max_len} non-whitespace characters.",
        )
    return cleaned


def _clean_paper_id_list(paper_ids: list[str]) -> list[str]:
    if len(paper_ids) > 50:
        raise HTTPException(status_code=422, detail="A maximum of 50 paper_ids may be provided.")
    cleaned: list[str] = []
    for item in paper_ids:
        cleaned.append(_clean_text(item, "paper_ids entry", min_len=1, max_len=500))
    return cleaned


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(
        "Unhandled exception on %s %s (%s)",
        request.method,
        request.url.path,
        exc.__class__.__name__,
    )
    return JSONResponse(status_code=500, content={"detail": "An internal server error occurred."})


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
        logger.error("Auth configuration error: %s", exc.__class__.__name__)
        raise HTTPException(status_code=503, detail="Backend authentication is not configured.") from exc
    except AuthVerificationUnavailable as exc:
        logger.warning("Auth verification unavailable: %s", exc.__class__.__name__)
        raise HTTPException(status_code=503, detail="Authentication service is temporarily unavailable.") from exc
    except InvalidAccessToken as exc:
        logger.info("Rejected invalid access token: %s", exc.__class__.__name__)
        raise HTTPException(
            status_code=401,
            detail="Your sign-in session is invalid or expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if origin.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


class IngestRequest(BaseModel):
    paper_id: str = Field(min_length=1, max_length=500)

    @field_validator("paper_id")
    @classmethod
    def validate_paper_id(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned or len(cleaned) > 500:
            raise ValueError("paper_id must be between 1 and 500 non-whitespace characters.")
        return cleaned


class RagRequest(BaseModel):
    question: str = Field(min_length=3, max_length=4000)
    paper_ids: list[str] = Field(default_factory=list, max_length=50)

    @field_validator("question")
    @classmethod
    def validate_question(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 3 or len(cleaned) > 4000:
            raise ValueError("question must be between 3 and 4000 non-whitespace characters.")
        return cleaned

    @field_validator("paper_ids")
    @classmethod
    def validate_paper_ids(cls, values: list[str]) -> list[str]:
        cleaned: list[str] = []
        for item in values:
            stripped = item.strip()
            if not stripped or len(stripped) > 500:
                raise ValueError("Each paper_id must be between 1 and 500 non-whitespace characters.")
            cleaned.append(stripped)
        return cleaned


@app.get("/")
def root():
    return {"message": "ResearchGraph AI API", "health": "/api/health"}


@app.get("/api/health")
def health():
    return health_status()


@app.get("/api/paper")
def paper_details_by_id(
    id: str = Query(..., min_length=1, max_length=500),
    _user_id: str = Depends(get_current_user),
):
    cleaned_id = _clean_text(id, "id", min_len=1, max_len=500)
    try:
        return get_paper_metadata(cleaned_id)
    except PaperNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PipelineError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.get("/api/paper-status")
def paper_status_by_id(
    paper_id: str = Query(..., min_length=1, max_length=500),
    user_id: str = Depends(get_current_user),
):
    cleaned_paper_id = _clean_text(paper_id, "paper_id", min_len=1, max_len=500)
    record = get_ingestion_status(user_id, cleaned_paper_id)
    if not record:
        return {"paper_id": cleaned_paper_id, "status": "discovered", "message": "This paper has not been added to the research index."}
    return record


@app.get("/api/search")
def search_papers(
    q: str = Query(..., min_length=1, max_length=500),
    limit: int = Query(10, ge=1, le=50),
):
    cleaned_query = _clean_text(q, "q", min_len=1, max_len=500)
    try:
        return {"papers": search_openalex(cleaned_query, limit)}
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
def paper_status(
    paper_id: str = Path(..., min_length=1, max_length=500),
    user_id: str = Depends(get_current_user),
):
    cleaned_paper_id = _clean_text(paper_id, "paper_id", min_len=1, max_len=500)
    record = get_ingestion_status(user_id, cleaned_paper_id)
    if not record:
        return {"paper_id": cleaned_paper_id, "status": "discovered", "message": "This paper has not been added to the research index."}
    return record


@app.get("/api/papers/{paper_id:path}/chunks")
def paper_chunks(
    paper_id: str = Path(..., min_length=1, max_length=500),
    limit: int = Query(100, ge=1, le=500),
    user_id: str = Depends(get_current_user),
):
    cleaned_paper_id = _clean_text(paper_id, "paper_id", min_len=1, max_len=500)
    try:
        return {"paper_id": cleaned_paper_id, "chunks": get_paper_chunks(user_id, cleaned_paper_id, limit)}
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/graph/paper/{paper_id:path}")
def graph_for_paper(
    paper_id: str = Path(..., min_length=1, max_length=500),
    user_id: str = Depends(get_current_user),
):
    cleaned_paper_id = _clean_text(paper_id, "paper_id", min_len=1, max_len=500)
    try:
        return get_graph_for_paper(user_id, cleaned_paper_id)
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/graph/search")
def graph_search(
    q: str = Query(..., min_length=1, max_length=200),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user),
):
    cleaned_query = _clean_text(q, "q", min_len=1, max_len=200)
    try:
        return {"results": get_graph_search(user_id, cleaned_query, limit)}
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
    cleaned_paper_id = _clean_text(paper_id, "paper_id", min_len=1, max_len=500)
    try:
        return get_graph_for_paper(user_id, cleaned_paper_id)
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
def paper_details(
    paper_id: str = Path(..., min_length=1, max_length=500),
    _user_id: str = Depends(get_current_user),
):
    cleaned_paper_id = _clean_text(paper_id, "paper_id", min_len=1, max_len=500)
    try:
        return get_paper_metadata(cleaned_paper_id)
    except PaperNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PipelineError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# Legacy chat endpoint now delegates to genuine retrieval and never returns a canned answer.
@app.post("/api/chat")
def legacy_chat(
    query: str = Query(..., min_length=3, max_length=4000),
    paper_ids: list[str] = Query(default=[], max_length=50),
    user_id: str = Depends(get_current_user),
):
    cleaned_query = _clean_text(query, "query", min_len=3, max_len=4000)
    cleaned_paper_ids = _clean_paper_id_list(paper_ids)
    try:
        return query_research(user_id, cleaned_query, cleaned_paper_ids)
    except PaperNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/api/literature-review")
def literature_review(_user_id: str = Depends(get_current_user)):
    raise HTTPException(status_code=501, detail="Literature review generation is not yet connected to indexed evidence.")


@app.post("/api/compare")
def compare_papers(_user_id: str = Depends(get_current_user)):
    raise HTTPException(status_code=501, detail="Paper comparison generation is not yet connected to indexed evidence.")
