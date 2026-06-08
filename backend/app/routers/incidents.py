"""
Incident CRUD endpoints.

All endpoints require JWT authentication and filter by org_id
derived from the token — never from request params.
"""

import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.auth import get_current_user
from app.database import get_supabase
from app.memory import memory

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/incidents", tags=["incidents"])


# ------------------------------------------------------------------
# Request / Response Models
# ------------------------------------------------------------------

class IncidentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    service: str = Field(..., min_length=1, max_length=200)
    severity: str = Field(..., pattern=r"^(LOW|MEDIUM|HIGH|CRITICAL)$")
    root_cause: str = Field(..., min_length=1)
    resolution: str = Field(..., min_length=1)
    resolution_time_minutes: Optional[int] = Field(None, ge=0)


class IncidentResponse(BaseModel):
    id: str
    org_id: str
    title: str
    service: str
    severity: str
    root_cause: str
    resolution: str
    resolution_time_minutes: Optional[int] = None
    created_at: Optional[str] = None


class IncidentListResponse(BaseModel):
    incidents: list[IncidentResponse]
    total: int


class IncidentCreateResponse(BaseModel):
    id: str
    message: str


# ------------------------------------------------------------------
# POST /incidents — Store a new incident
# ------------------------------------------------------------------

@router.post("", response_model=IncidentCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(
    body: IncidentCreate,
    current_user: dict = Depends(get_current_user),
):
    """Store a new incident with its vector embedding. org_id is from JWT only."""
    org_id: UUID = current_user["org_id"]

    incident_data = {
        "title": body.title,
        "service": body.service,
        "severity": body.severity,
        "root_cause": body.root_cause,
        "resolution": body.resolution,
        "resolution_time_minutes": body.resolution_time_minutes,
    }

    incident_id = await memory.store_incident(incident_data, org_id)

    logger.info(
        "Incident stored: id=%s, org=%s, title=%s",
        incident_id,
        org_id,
        body.title[:200],
    )

    return IncidentCreateResponse(
        id=str(incident_id),
        message="Incident stored successfully",
    )


# ------------------------------------------------------------------
# GET /incidents — List incidents for the org
# ------------------------------------------------------------------

@router.get("", response_model=IncidentListResponse)
async def list_incidents(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: str = Query("", max_length=500),
    current_user: dict = Depends(get_current_user),
):
    """
    List incidents for the authenticated user's organization.
    Supports pagination (skip/limit) and optional text search on title and root_cause.
    """
    org_id = str(current_user["org_id"])
    supabase = get_supabase()

    try:
        query = (
            supabase.table("incidents")
            .select("id, org_id, title, service, severity, root_cause, resolution, resolution_time_minutes, created_at", count="exact")
            .eq("org_id", org_id)
            .order("created_at", desc=True)
            .range(skip, skip + limit - 1)
        )

        if search.strip():
            # Search on title OR root_cause using ilike
            query = query.or_(
                f"title.ilike.%{search}%,root_cause.ilike.%{search}%"
            )

        result = query.execute()

    except Exception as e:
        logger.error("Failed to list incidents: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve incidents",
        )

    incidents = [
        IncidentResponse(
            id=str(row["id"]),
            org_id=str(row["org_id"]),
            title=row["title"],
            service=row["service"],
            severity=row["severity"],
            root_cause=row["root_cause"],
            resolution=row["resolution"],
            resolution_time_minutes=row.get("resolution_time_minutes"),
            created_at=row.get("created_at"),
        )
        for row in (result.data or [])
    ]

    return IncidentListResponse(
        incidents=incidents,
        total=result.count if result.count is not None else len(incidents),
    )


# ------------------------------------------------------------------
# GET /incidents/{id} — Get a single incident
# ------------------------------------------------------------------

@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a single incident. Verifies it belongs to the user's org."""
    org_id = str(current_user["org_id"])
    supabase = get_supabase()

    try:
        result = (
            supabase.table("incidents")
            .select("id, org_id, title, service, severity, root_cause, resolution, resolution_time_minutes, created_at")
            .eq("id", incident_id)
            .eq("org_id", org_id)
            .single()
            .execute()
        )
    except Exception as e:
        logger.error("Failed to get incident %s: %s", incident_id, str(e))
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    if not result.data:
        raise HTTPException(status_code=404, detail="Incident not found")

    row = result.data
    return IncidentResponse(
        id=str(row["id"]),
        org_id=str(row["org_id"]),
        title=row["title"],
        service=row["service"],
        severity=row["severity"],
        root_cause=row["root_cause"],
        resolution=row["resolution"],
        resolution_time_minutes=row.get("resolution_time_minutes"),
        created_at=row.get("created_at"),
    )


# ------------------------------------------------------------------
# DELETE /incidents/{id} — Delete an incident
# ------------------------------------------------------------------

@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_incident(
    incident_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete an incident. Verifies it belongs to the user's org first."""
    org_id = str(current_user["org_id"])
    supabase = get_supabase()

    # Verify the incident belongs to this org before deleting
    try:
        check = (
            supabase.table("incidents")
            .select("id")
            .eq("id", incident_id)
            .eq("org_id", org_id)
            .single()
            .execute()
        )
    except Exception:
        raise HTTPException(status_code=404, detail="Incident not found")

    if not check.data:
        raise HTTPException(status_code=404, detail="Incident not found")

    try:
        supabase.table("incidents").delete().eq("id", incident_id).eq("org_id", org_id).execute()
    except Exception as e:
        logger.error("Failed to delete incident %s: %s", incident_id, str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to delete incident",
        )

    logger.info("Incident deleted: id=%s, org=%s", incident_id, org_id)
