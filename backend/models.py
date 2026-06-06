from typing import Literal, List, Optional

from pydantic import BaseModel, Field


class IncidentRequest(BaseModel):
    alert_text: str = Field(min_length=10)


class SimilarIncident(BaseModel):
    id: str
    incident_id: str | None = None
    service_name: str
    alert_text: str
    root_cause: str
    resolution_steps: list[str]
    severity: str
    time_to_resolve_mins: int
    match_score: float


class DiagnosisResponse(BaseModel):
    suggested_severity: str
    root_cause: str
    resolution_steps: List[str]
    similar_incidents: list[SimilarIncident]
    mttr_estimate_mins: int
    memory_used: bool
    suggested_service: str = "platform-core"
    suggested_severity: str = "MEDIUM"


class ResolveRequest(BaseModel):
    incident_id: str
    alert_text: str
    service_name: str
    actual_root_cause: str
    actual_resolution_steps: list[str]
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    time_to_resolve_mins: int
    post_mortem_summary: str
    tags: list[str] = []


class ResolveResponse(BaseModel):
    success: bool
    hindsight_id: str
    memory_count: int


class StoredIncident(BaseModel):
    id: Optional[str] = None
    incident_id: Optional[str] = None
    alert_text: str
    service_name: str
    actual_root_cause: str
    actual_resolution_steps: List[str]
    severity: str
    time_to_resolve_mins: int
    post_mortem_summary: Optional[str] = None
    tags: List[str] = []
    timestamp: Optional[str] = None
    similar_incidents: list[SimilarIncident] = []


class StatsResponse(BaseModel):
    total_incidents: int
    memory_count: int
    severity_distribution: dict[str, int]
    avg_time_to_resolve_mins: float
    most_affected_service: str

