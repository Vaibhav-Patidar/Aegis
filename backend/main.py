import logging
import random
from collections import Counter
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from uuid import uuid4
import hashlib
import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from llm_client import GroqClient
from memory_client import HindsightClient
from models import (
    DiagnosisResponse,
    IncidentRequest,
    ResolveRequest,
    ResolveResponse,
    SimilarIncident,
    StatsResponse,
    StoredIncident,
)


def extract_service_name(alert_text: str) -> str:
    known_services = [
        "auth-service", "payments-api", "payments-gateway", "product-catalog",
        "inventory-db", "notification-worker", "api-gateway", "search-service",
        "recommendation-engine", "session-store", "order-service", "checkout-api",
        "user-profile-db", "cdn-router", "search-indexer"
    ]
    text_lower = alert_text.lower()
    for service in known_services:
        if service in text_lower:
            return service
    for service in known_services:
        core = service.split("-")[0]
        if core in text_lower:
            return service
    return "platform-core"

def infer_severity(alert_text: str) -> str:
    text = alert_text.lower()
    if any(k in text for k in ["critical", "p99", "payment", "cert expir", "ssl", "down", "outage"]):
        return "CRITICAL"
    if any(k in text for k in ["oom", "disk full", "connection pool", "exhausted", "timeout", "spike"]):
        return "HIGH"
    if any(k in text for k in ["latency", "slow", "lag", "warn", "degraded"]):
        return "MEDIUM"
    return "LOW"

def generate_incident_id() -> str:
    return f"INC-{random.randint(1000, 9999)}"


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

memory = HindsightClient()
llm = GroqClient()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Incident Response Agent started")
    logger.info("Hindsight Project ID: %s", settings.hindsight_project_id)
    yield


app = FastAPI(
    title=settings.app_title,
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/incident", response_model=DiagnosisResponse)
async def diagnose_incident(request: IncidentRequest):
    search_results = await memory.search(request.alert_text, top_k=settings.hindsight_top_k)

    similar_incidents_data = [
        {
            "id": r.get("id", ""),
            "incident_id": r.get("incident_id"),
            "service_name": r.get("service_name", ""),
            "alert_text": r.get("alert_text", ""),
            "root_cause": r.get("root_cause", ""),
            "resolution_steps": r.get("resolution_steps", []),
            "severity": r.get("severity", ""),
            "time_to_resolve_mins": r.get("time_to_resolve_mins", 0),
            "match_score": r.get("match_score", 0.0),
        }
        for r in search_results
    ]

    service_name = extract_service_name(request.alert_text)
    suggested_severity = infer_severity(request.alert_text)

    analysis = await llm.analyze(request.alert_text, similar_incidents_data, service_name, suggested_severity)

    similar_incidents = [
        SimilarIncident(
            id=r.get("id", ""),
            incident_id=r.get("incident_id"),
            service_name=r.get("service_name", ""),
            alert_text=r.get("alert_text", ""),
            root_cause=r.get("root_cause", ""),
            resolution_steps=r.get("resolution_steps", []),
            severity=r.get("severity", ""),
            time_to_resolve_mins=r.get("time_to_resolve_mins", 0),
            match_score=r.get("match_score", 0.0),
        )
        for r in search_results
    ]

    return DiagnosisResponse(
        root_cause=analysis.get("root_cause", ""),
        confidence=analysis.get("confidence", 0.0),
        resolution_steps=analysis.get("resolution_steps", []),
        similar_incidents=similar_incidents,
        mttr_estimate_mins=analysis.get("mttr_estimate_mins", 0),
        memory_used=len(similar_incidents) > 0,
        suggested_service=service_name,
        suggested_severity=suggested_severity,
    )


@app.post("/resolve", response_model=ResolveResponse)
async def resolve_incident(request: ResolveRequest):
    svc_name = request.service_name
    if not svc_name or svc_name.strip() in ("", "unknown"):
        svc_name = extract_service_name(request.alert_text)

    inc_id = request.incident_id
    if not inc_id or inc_id.strip() == "":
        inc_id = generate_incident_id()

    incident_dict = {
        "id": str(uuid4()),
        "incident_id": inc_id,
        "service_name": svc_name,
        "alert_text": request.alert_text,
        "actual_root_cause": request.actual_root_cause,
        "actual_resolution_steps": request.actual_resolution_steps,
        "severity": request.severity,
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "tags": request.tags,
        "post_mortem_summary": request.post_mortem_summary,
        "time_to_resolve_mins": request.time_to_resolve_mins,
    }

    hindsight_id = await memory.write(incident_dict)
    count = await memory.count()

    return ResolveResponse(
        success=True,
        hindsight_id=hindsight_id,
        memory_count=count,
    )


@app.get("/incidents", response_model=list[StoredIncident])
async def list_incidents():
    results = await memory.search("incident", top_k=50)
    return [
        StoredIncident(
            id=r.get("id", ""),
            incident_id=r.get("incident_id"),
            service_name=r.get("service_name", ""),
            alert_text=r.get("alert_text", ""),
            actual_root_cause=r.get("actual_root_cause", r.get("root_cause", "")),
            actual_resolution_steps=r.get("actual_resolution_steps", r.get("resolution_steps", [])),
            severity=r.get("severity", ""),
            timestamp=r.get("timestamp", ""),
            tags=r.get("tags", []),
            post_mortem_summary=r.get("post_mortem_summary", ""),
            time_to_resolve_mins=r.get("time_to_resolve_mins", 0),
            similar_incidents=[
                SimilarIncident(
                    id=s.get("id", ""),
                    incident_id=s.get("incident_id"),
                    service_name=s.get("service_name", ""),
                    alert_text=s.get("alert_text", ""),
                    root_cause=s.get("root_cause", ""),
                    resolution_steps=s.get("resolution_steps", []),
                    severity=s.get("severity", ""),
                    time_to_resolve_mins=s.get("time_to_resolve_mins", 0),
                    match_score=s.get("match_score", 0.0),
                )
                for s in r.get("similar_incidents", [])
            ]
        )
        for r in results
    ]


@app.get("/stats", response_model=StatsResponse)
async def get_stats():
    results = await memory.search("incident", top_k=100)
    total = len(results)
    count = await memory.count()

    severity_counts = Counter(r.get("severity", "UNKNOWN") for r in results)
    severity_distribution = dict(severity_counts)

    resolve_times = [
        r.get("time_to_resolve_mins", 0)
        for r in results
        if r.get("time_to_resolve_mins")
    ]
    avg_mttr = sum(resolve_times) / len(resolve_times) if resolve_times else 0.0

    service_counts = Counter(
        (r.get("service_name") if r.get("service_name") not in (None, "unknown", "") else extract_service_name(r.get("alert_text", "")))
        for r in results
    )
    most_affected = service_counts.most_common(1)[0][0] if service_counts else "unknown"

    return StatsResponse(
        total_incidents=total,
        memory_count=count,
        severity_distribution=severity_distribution,
        avg_time_to_resolve_mins=round(avg_mttr, 1),
        most_affected_service=most_affected,
    )


@app.get("/health")
async def health_check():
    return {"status": "ok", "memory_count": await memory.count()}

