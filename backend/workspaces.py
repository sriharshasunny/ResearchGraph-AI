"""RLS-backed Supabase operations for per-user research workspaces."""
from __future__ import annotations

import os
from typing import Any
from urllib.parse import quote

import requests


class WorkspaceError(RuntimeError):
    pass


def _request(
    method: str,
    resource: str,
    access_token: str,
    *,
    params: dict[str, str] | None = None,
    body: dict[str, Any] | list[dict[str, Any]] | None = None,
    prefer: str | None = None,
) -> Any:
    base_url = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
    anon_key = os.getenv("SUPABASE_ANON_KEY", "").strip()
    if not base_url or not anon_key:
        raise WorkspaceError("Supabase workspace storage is not configured on the backend.")
    if not access_token:
        raise WorkspaceError("A verified Supabase session is required.")

    headers = {
        "apikey": anon_key,
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }
    if body is not None:
        headers["Content-Type"] = "application/json"
    if prefer:
        headers["Prefer"] = prefer

    try:
        response = requests.request(
            method,
            f"{base_url}/rest/v1/{resource}",
            params=params,
            json=body,
            headers=headers,
            timeout=(5, 20),
        )
    except requests.RequestException as exc:
        raise WorkspaceError("Supabase workspace storage could not be reached.") from exc

    if response.status_code in {401, 403}:
        raise WorkspaceError("Supabase denied access to this workspace or paper.")
    if response.status_code == 404:
        raise WorkspaceError("The requested workspace or paper membership was not found.")
    if response.status_code >= 400:
        raise WorkspaceError(f"Supabase workspace request failed ({response.status_code}).")

    if response.status_code == 204 or not response.content:
        return []
    try:
        return response.json()
    except ValueError as exc:
        raise WorkspaceError("Supabase returned an invalid workspace response.") from exc


def list_workspaces(access_token: str) -> list[dict[str, Any]]:
    result = _request(
        "GET",
        "research_workspaces",
        access_token,
        params={"select": "id,name,description,created_at,updated_at", "order": "created_at.desc"},
    )
    return result if isinstance(result, list) else []


def create_workspace(
    user_id: str,
    access_token: str,
    name: str,
    description: str = "",
) -> dict[str, Any]:
    result = _request(
        "POST",
        "research_workspaces",
        access_token,
        body={"user_id": user_id, "name": name.strip(), "description": description.strip()},
        prefer="return=representation",
    )
    if not isinstance(result, list) or not result:
        raise WorkspaceError("Supabase did not return the created workspace.")
    return result[0]


def delete_workspace(user_id: str, access_token: str, workspace_id: str) -> None:
    _request(
        "DELETE",
        "research_workspaces",
        access_token,
        params={"id": f"eq.{workspace_id}", "user_id": f"eq.{user_id}"},
        prefer="return=minimal",
    )


def list_workspace_papers(user_id: str, access_token: str, workspace_id: str) -> list[dict[str, Any]]:
    result = _request(
        "GET",
        "workspace_papers",
        access_token,
        params={
            "select": "paper_id,added_at,research_papers(metadata)",
            "workspace_id": f"eq.{workspace_id}",
            "user_id": f"eq.{user_id}",
            "order": "added_at.desc",
        },
    )
    papers: list[dict[str, Any]] = []
    for row in result if isinstance(result, list) else []:
        paper = row.get("research_papers") or {}
        papers.append({
            "paper_id": row.get("paper_id"),
            "added_at": row.get("added_at"),
            "metadata": paper.get("metadata") or {},
        })
    return papers


def add_paper_to_workspace(
    user_id: str,
    access_token: str,
    workspace_id: str,
    paper_id: str,
    metadata: dict[str, Any],
) -> dict[str, Any]:
    # Store one per-user paper record; it may be linked to several workspaces.
    _request(
        "POST",
        "research_papers",
        access_token,
        params={"on_conflict": "user_id,paper_id"},
        body={"user_id": user_id, "paper_id": paper_id, "metadata": metadata},
        prefer="resolution=merge-duplicates,return=representation",
    )
    # Membership is separate from the paper record, so removing it from one
    # workspace never removes the paper from another workspace or its indexes.
    result = _request(
        "POST",
        "workspace_papers",
        access_token,
        params={"on_conflict": "workspace_id,paper_id"},
        body={"user_id": user_id, "workspace_id": workspace_id, "paper_id": paper_id},
        prefer="resolution=ignore-duplicates,return=representation",
    )
    if isinstance(result, list) and result:
        return result[0]
    return {"user_id": user_id, "workspace_id": workspace_id, "paper_id": paper_id}


def remove_paper_from_workspace(
    user_id: str,
    access_token: str,
    workspace_id: str,
    paper_id: str,
) -> None:
    _request(
        "DELETE",
        "workspace_papers",
        access_token,
        params={
            "workspace_id": f"eq.{workspace_id}",
            "paper_id": f"eq.{paper_id}",
            "user_id": f"eq.{user_id}",
        },
        prefer="return=minimal",
    )


def resolve_workspace_paper_ids(
    user_id: str,
    access_token: str,
    workspace_ids: list[str],
    *,
    max_papers: int = 50,
) -> list[str]:
    unique_workspace_ids = list(dict.fromkeys(value.strip() for value in workspace_ids if isinstance(value, str) and value.strip()))
    if not unique_workspace_ids:
        return []
    if len(unique_workspace_ids) > 20:
        raise WorkspaceError("A maximum of 20 workspaces can be combined in one research query.")

    # UUIDs are validated in the API layer; quote each value for PostgREST's in.(...) syntax.
    workspace_filter = "in.(" + ",".join(quote(value, safe="-") for value in unique_workspace_ids) + ")"
    rows = _request(
        "GET",
        "workspace_papers",
        access_token,
        params={
            "select": "paper_id",
            "workspace_id": workspace_filter,
            "user_id": f"eq.{user_id}",
            "order": "added_at.desc",
        },
    )
    paper_ids = list(dict.fromkeys(
        row["paper_id"] for row in rows
        if isinstance(row, dict) and isinstance(row.get("paper_id"), str) and row["paper_id"].strip()
    ))
    return paper_ids[:max_papers]
