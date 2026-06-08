"""
Diagnosis endpoint — the core intelligence layer.

Accepts a stack trace or error description, finds similar historical
incidents via vector search, and synthesizes a diagnosis using Groq.
Rate limited to 10 requests/minute per IP.
"""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.auth import get_current_user
from app.memory import memory

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/diagnose", tags=["diagnose"])


class DiagnoseRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=5000)


class DiagnoseMatch(BaseModel):
    id: str | None = None
    title: str | None = None
    service: str | None = None
    severity: str | None = None
    root_cause: str | None = None
    resolution: str | None = None
    similarity: float = 0.0


class DiagnoseResponse(BaseModel):
    root_cause: str
    confidence: int = 0
    affected_subsystem: str = "unknown"
    resolution_steps: list[str] = []
    matches: list[DiagnoseMatch] = []
    reasoning: str = ""


@router.post("", response_model=DiagnoseResponse)
@limiter.limit("10/minute")
async def diagnose(
    request: Request,
    body: DiagnoseRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Analyze a stack trace or error description against historical incidents.

    1. Embeds the text via HuggingFace Inference API
    2. Searches for similar historical incidents in Supabase (pgvector)
    3. Synthesizes a diagnosis using Groq (Llama 3.3 70B)
    4. Falls back to raw search results if Groq is unavailable
    """
    org_id = current_user["org_id"]

    # Log truncated text for debugging (never log full traces)
    logger.info(
        "Diagnosis request: org=%s, text=%s, timestamp=%s",
        org_id,
        body.text[:200],
        datetime.now(timezone.utc).isoformat(),
    )

    # Step 1 & 2: Semantic search
    matches = await memory.search_similar(body.text, org_id)

    logger.info(
        "Search returned %d matches for org=%s",
        len(matches),
        org_id,
    )

    # Step 3: LLM synthesis (with graceful degradation)
    diagnosis = await memory.synthesize_diagnosis(body.text, matches)

    return DiagnoseResponse(
        root_cause=diagnosis.get("root_cause", "Unable to determine"),
        confidence=diagnosis.get("confidence", 0),
        affected_subsystem=diagnosis.get("affected_subsystem", "unknown"),
        resolution_steps=diagnosis.get("resolution_steps", []),
        matches=[
            DiagnoseMatch(**m) for m in diagnosis.get("matches", [])
        ],
        reasoning=diagnosis.get("reasoning", ""),
    )
