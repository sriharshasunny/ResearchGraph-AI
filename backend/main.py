from __future__ import annotations

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator
from uuid import UUID

try:
    from .auth import require_current_user
    from .workspaces import WorkspaceError, add_paper_to_workspace, create_workspace, delete_workspace, list_workspace_papers, list_workspaces, remove_paper_from_workspace, resolve_workspace_paper_ids
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
    from auth import require_current_user
    from workspaces import WorkspaceError, add_paper_to_workspace, create_workspace, delete_workspace, list_workspace_papers, list_workspaces, remove_paper_from_workspace, resolve_workspace_paper_ids
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
    paper_ids: list[str] | None = Field(default=None, min_length=1, max_length=50)
    workspace_ids: list[str] | None = Field(default=None, min_length=1, max_length=20)

    @model_validator(mode="after")
    def require_one_explicit_scope(self):
        if bool(self.paper_ids) == bool(self.workspace_ids):
            raise ValueError("Provide either paper_ids or workspace_ids, but not both.")
        return self


class WorkspaceCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=1000)


class WorkspaceAddPaperRequest(BaseModel):
    paper_id: str = Field(min_length=1, max_length=500)


@app.get("/")
def root():
    return {"message": "ResearchGraph AI API", "health": "/api/health"}


@app.get("/api/health")
def health():
    return health_status()


@app.get("/api/workspaces")
def workspaces_list(user: dict = Depends(require_current_user)):
    try:
        return {"workspaces": list_workspaces(user["access_token"])}
    except WorkspaceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post("/api/workspaces", status_code=201)
def workspaces_create(request: WorkspaceCreateRequest, user: dict = Depends(require_current_user)):
    try:
        workspace = create_workspace(user["id"], user["access_token"], request.name, request.description)
        return {"workspace": workspace}
    except WorkspaceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.delete("/api/workspaces/{workspace_id}")
def workspaces_delete(workspace_id: UUID, user: dict = Depends(require_current_user)):
    try:
        delete_workspace(user["id"], user["access_token"], str(workspace_id))
        return {"deleted": True, "workspace_id": str(workspace_id)}
    except WorkspaceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.get("/api/workspaces/{workspace_id}/papers")
def workspace_papers_list(workspace_id: UUID, user: dict = Depends(require_current_user)):
    try:
        papers = list_workspace_papers(user["id"], user["access_token"], str(workspace_id))
        return {"workspace_id": str(workspace_id), "papers": papers}
    except WorkspaceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post("/api/workspaces/{workspace_id}/papers", status_code=202)
def workspace_papers_add(
    workspace_id: UUID,
    request: WorkspaceAddPaperRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(require_current_user),
):
    try:
        metadata = get_paper_metadata(request.paper_id)
        canonical_paper_id = metadata["id"]
        membership = add_paper_to_workspace(
            user["id"], user["access_token"], str(workspace_id), canonical_paper_id, metadata
        )
        status = start_ingestion(canonical_paper_id, user["id"])
        if status.get("stage") == "queued":
            background_tasks.add_task(ingest_paper, canonical_paper_id, user["id"])
        return {"workspace_id": str(workspace_id), "paper": membership, "ingestion": status}
    except PaperNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except WorkspaceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.delete("/api/workspaces/{workspace_id}/papers")
def workspace_papers_remove(
    workspace_id: UUID,
    paper_id: str = Query(..., min_length=1, max_length=500),
    user: dict = Depends(require_current_user),
):
    try:
        remove_paper_from_workspace(user["id"], user["access_token"], str(workspace_id), paper_id)
        return {"removed": True, "workspace_id": str(workspace_id), "paper_id": paper_id}
    except WorkspaceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.get("/api/paper")
def paper_details_by_id(id: str = Query(..., min_length=1, max_length=500)):
    try:
        return get_paper_metadata(id)
    except PaperNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PipelineError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.get("/api/paper-status")
def paper_status_by_id(paper_id: str = Query(..., min_length=1, max_length=500), user: dict = Depends(require_current_user)):
    record = get_ingestion_status(paper_id, user["id"])
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
def ingest(request: IngestRequest, background_tasks: BackgroundTasks, user: dict = Depends(require_current_user)):
    try:
        record = start_ingestion(request.paper_id, user["id"])
        if record.get("stage") == "queued":
            background_tasks.add_task(ingest_paper, request.paper_id, user["id"])
        return record
    except PaperNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/papers/{paper_id:path}/status")
def paper_status(paper_id: str, user: dict = Depends(require_current_user)):
    record = get_ingestion_status(paper_id, user["id"])
    if not record:
        return {"paper_id": paper_id, "status": "discovered", "message": "This paper has not been added to the research index."}
    return record


@app.get("/api/papers/{paper_id:path}/chunks")
def paper_chunks(paper_id: str, limit: int = Query(100, ge=1, le=500), user: dict = Depends(require_current_user)):
    try:
        return {"paper_id": paper_id, "chunks": get_paper_chunks(paper_id, limit, user["id"])}
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/graph/paper/{paper_id:path}")
def graph_for_paper(paper_id: str, user: dict = Depends(require_current_user)):
    try:
        return get_graph_for_paper(paper_id, user["id"])
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/graph/search")
def graph_search(q: str = Query(..., min_length=1, max_length=200), limit: int = Query(20, ge=1, le=100), user: dict = Depends(require_current_user)):
    try:
        return {"results": get_graph_search(q, limit, user["id"])}
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/graph")
def graph_all(limit: int = Query(500, ge=1, le=2000), user: dict = Depends(require_current_user)):
    try:
        return get_graph(limit, user["id"])
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/graph/paper")
def graph_for_paper_by_id(paper_id: str = Query(..., min_length=1, max_length=500), user: dict = Depends(require_current_user)):
    try:
        return get_graph_for_paper(paper_id, user["id"])
    except PipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/api/rag/query")
def rag(request: RagRequest, user: dict = Depends(require_current_user)):
    try:
        if request.workspace_ids:
            paper_ids = resolve_workspace_paper_ids(user["id"], user["access_token"], request.workspace_ids)
            if not paper_ids:
                return {"answer": "The selected workspace scope contains no papers. Add papers to the selected workspace before asking a question.", "answer_type": "insufficient_context", "citations": [], "graph_evidence": []}
        else:
            paper_ids = request.paper_ids or []
        return query_research(request.question, paper_ids, user["id"])
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
def legacy_chat(query: str = Query(..., min_length=3), paper_ids: list[str] = Query(..., min_length=1, max_length=50), user: dict = Depends(require_current_user)):
    try:
        return query_research(query, paper_ids, user["id"])
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
