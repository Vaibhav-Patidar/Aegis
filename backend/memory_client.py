import json
import logging

import httpx
from fastapi import HTTPException

from config import settings

logger = logging.getLogger(__name__)

BASE_URL = "https://api.hindsight.vectorize.io"


class HindsightClient:
    def __init__(self):
        self.bank_id = settings.hindsight_project_id
        self.headers = {
            "Authorization": f"Bearer {settings.hindsight_api_key}",
            "Content-Type": "application/json",
        }
        self.timeout = httpx.Timeout(30.0)

    def _bank_url(self, path: str = "") -> str:
        return f"{BASE_URL}/v1/default/banks/{self.bank_id}{path}"

    def _parse_result(self, item: dict, index: int) -> dict:
        text = item.get("text", "")
        meta = item.get("metadata", {})
        
        # Try to parse the text in case it still has JSON
        try:
            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end > start:
                return json.loads(text[start:end])
        except (json.JSONDecodeError, ValueError):
            pass
            
        tags_val = meta.get("tags", "[]")
        try:
            tags = json.loads(tags_val) if isinstance(tags_val, str) else tags_val
        except (json.JSONDecodeError, TypeError):
            tags = []
            
        res_val = meta.get("resolution_steps", "[]")
        try:
            resolution_steps = json.loads(res_val) if isinstance(res_val, str) else res_val
        except (json.JSONDecodeError, TypeError):
            resolution_steps = []

        try:
            time_to_resolve_mins = int(meta.get("time_to_resolve_mins", 30))
        except ValueError:
            time_to_resolve_mins = 30

        return {
            "id": item.get("id", f"mem-{index}"),
            "incident_id": meta.get("incident_id", ""),
            "service_name": meta.get("service_name", "unknown"),
            "alert_text": meta.get("alert_text", text),
            "root_cause": meta.get("root_cause", text),
            "resolution_steps": resolution_steps,
            "severity": meta.get("severity", "MEDIUM"),
            "time_to_resolve_mins": time_to_resolve_mins,
            "match_score": 0.5,
            "timestamp": item.get("mentioned_at", ""),
            "tags": tags,
            "post_mortem_summary": text,
        }

    async def search(self, query: str, top_k: int = 3) -> list[dict]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self._bank_url("/memories/recall"),
                    headers=self.headers,
                    json={"query": query, "top_k": top_k},
                )
                response.raise_for_status()
                data = response.json()
                raw_results = data.get("results", [])
                seen_ids = set()
                parsed = []
                for i, item in enumerate(raw_results):
                    incident = self._parse_result(item, i)
                    incident_id = incident.get("id", "")
                    if incident_id and incident_id not in seen_ids:
                        seen_ids.add(incident_id)
                        parsed.append(incident)
                return parsed
        except (httpx.HTTPError, Exception) as e:
            logger.error("Hindsight search failed: %s", e)
            return []

    async def write(self, incident: dict) -> str:
        try:
            # Prepare natural language content for Vectorize to process
            text_content = f"Alert: {incident.get('alert_text', '')} | Root Cause: {incident.get('root_cause', '')} | Resolution: {', '.join(incident.get('resolution_steps', []))}"
            
            # Store structured data in metadata
            meta = {
                "incident_id": str(incident.get("incident_id", "")),
                "service_name": str(incident.get("service_name", "unknown")),
                "severity": str(incident.get("severity", "MEDIUM")),
                "time_to_resolve_mins": str(incident.get("time_to_resolve_mins", 30)),
                "alert_text": str(incident.get("alert_text", "")),
                "root_cause": str(incident.get("root_cause", "")),
                "tags": json.dumps(incident.get("tags", [])),
                "resolution_steps": json.dumps(incident.get("resolution_steps", []))
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self._bank_url("/memories"),
                    headers=self.headers,
                    json={"items": [{"content": text_content, "metadata": meta}]},
                )
                response.raise_for_status()
                data = response.json()
                return str(data.get("operation_id") or incident.get("id", "seeded"))
        except (httpx.HTTPError, Exception) as e:
            logger.error("Hindsight write failed: %s", e)
            raise HTTPException(status_code=502, detail="Hindsight memory service unreachable")

    async def count(self) -> int:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    self._bank_url("/documents?limit=1"),
                    headers=self.headers,
                )
                response.raise_for_status()
                data = response.json()
                return data.get("total", 0)
        except (httpx.HTTPError, Exception) as e:
            logger.error("Hindsight count failed: %s", e)
            return 0

