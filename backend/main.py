from __future__ import annotations

from fastapi import BackgroundTasks, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

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

app = FastAPI(title="ResearchGraph AI Backend", version="2.0.0")
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
def paper_details_by_id(id: str = Query(..., min_length=1, max_length=500)):
    try:
        return get_paper_metadata(id)
    except PaperNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PipelineError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.get("/api/paper-status")
def paper_status_by_id(paper_id: str = Query(..., min_length=1, max_length=500)):
    record = get_ingestion_status(paper_id)
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
def ingest(request: IngestRequest, background_tasks: BackgroundTasks):
    try:
        record = start_ingestion(request.paper_id)
        if record.get("stage") == "queued":
            background_tasks.add_task(ingest_paper, request.paper_id)
        return record
    except PaperNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/papers/{paper_id:path}/status")
def paper_status(paper_id: str):
    record = get_ingestion_status(paper_id)
    if not record:
        return {"paper_id": paper_id, "status": "discovered", "message": "This paper has not been added to the research index."}
    return record


@app.get("/api/papers/{paper_id:path}/chunks")
def paper_chunks(paper_id: str, limit: int = Query(100, ge=1, le=500)):
    try:
        return {"paper_id": paper_id, "chunks": get_paper_chunks(paper_id, limit)}
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/graph/paper/{paper_id:path}")
def graph_for_paper(paper_id: str):
    try:
        return get_graph_for_paper(paper_id)
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/graph/search")
def graph_search(q: str = Query(..., min_length=1, max_length=200), limit: int = Query(20, ge=1, le=100)):
    try:
        return {"results": get_graph_search(q, limit)}
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/graph")
def graph_all(limit: int = Query(500, ge=1, le=2000)):
    try:
        return get_graph(limit)
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/graph/paper")
def graph_for_paper_by_id(paper_id: str = Query(..., min_length=1, max_length=500)):
    try:
        return get_graph_for_paper(paper_id)
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/api/rag/query")
def rag(request: RagRequest):
    try:
        return query_research(request.question, request.paper_ids)
    except PaperNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


# Keep the established paper-detail route compatible with existing clients.
@app.get("/api/papers/{paper_id:path}")
def paper_details(paper_id: str):
    try:
        return get_paper_metadata(paper_id)
    except PaperNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PipelineError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# Legacy chat endpoint now delegates to genuine retrieval and never returns a canned answer.
@app.post("/api/chat")
def legacy_chat(query: str = Query(..., min_length=3), paper_ids: list[str] = Query(default=[])):
    try:
        return query_research(query, paper_ids)
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

