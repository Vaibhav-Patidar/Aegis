"""
AegisMemory — Core memory and retrieval layer for Aegis.

Handles:
- Text embedding via HuggingFace Inference API (all-MiniLM-L6-v2, 384 dimensions)
- Incident storage in Supabase with pgvector embeddings
- Semantic similarity search via Supabase RPC
- Diagnosis synthesis via Groq (Llama 3.3 70B) with graceful degradation
"""

import asyncio
import json
import logging
import os
import re
from typing import List
from uuid import UUID, uuid4

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException
from groq import Groq

from app.database import get_supabase

load_dotenv()

logger = logging.getLogger(__name__)

HUGGINGFACE_API_KEY: str = os.getenv("HUGGINGFACE_API_KEY", "")
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"

HF_API_URL = (
    "https://api-inference.huggingface.co/pipeline/feature-extraction/"
    "sentence-transformers/all-MiniLM-L6-v2"
)


class AegisMemory:
    """
    Core memory engine for Aegis.

    Uses HuggingFace Inference API for embeddings (zero local RAM),
    Supabase pgvector for storage/search, and Groq for LLM synthesis.
    """

    def __init__(self):
        self.groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

    # ------------------------------------------------------------------
    # Method 1: Embed text via HuggingFace Inference API
    # ------------------------------------------------------------------
    async def embed_text(self, text: str) -> List[float]:
        """
        Call HuggingFace Inference API to get embeddings.

        Model: sentence-transformers/all-MiniLM-L6-v2
        Output: 384-dimensional vector
        Free tier: ~30,000 requests/month

        Raises:
            HTTPException 503: If the HF API is unavailable or times out.
        """
        if not HUGGINGFACE_API_KEY:
            raise HTTPException(
                status_code=503,
                detail="Embedding service not configured. Set HUGGINGFACE_API_KEY.",
            )

        headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
        payload = {
            "inputs": text,
            "options": {"wait_for_model": True},
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    HF_API_URL, headers=headers, json=payload
                )
                response.raise_for_status()
                embedding = response.json()

                # HF returns nested list for some models — flatten if needed
                if isinstance(embedding, list) and len(embedding) > 0:
                    if isinstance(embedding[0], list):
                        embedding = embedding[0]

                return embedding

        except httpx.TimeoutException:
            logger.error("HuggingFace Inference API timed out")
            raise HTTPException(
                status_code=503,
                detail="Embedding service temporarily unavailable. Please retry in a moment.",
            )
        except httpx.HTTPStatusError as e:
            logger.error(
                "HuggingFace API returned %s: %s",
                e.response.status_code,
                e.response.text[:200],
            )
            raise HTTPException(
                status_code=503,
                detail="Embedding service temporarily unavailable. Please retry in a moment.",
            )
        except Exception as e:
            logger.error("Unexpected error calling HuggingFace API: %s", str(e))
            raise HTTPException(
                status_code=503,
                detail="Embedding service temporarily unavailable. Please retry in a moment.",
            )

    # ------------------------------------------------------------------
    # Method 2: Store an incident with its embedding
    # ------------------------------------------------------------------
    async def store_incident(self, incident_data: dict, org_id: UUID) -> UUID:
        """
        Store an incident in Supabase with a vector embedding.

        Concatenates key fields into a searchable string, embeds it,
        and inserts into the incidents table.

        Args:
            incident_data: Dict with title, service, severity, root_cause, resolution
            org_id: Organization UUID (from JWT, never from frontend)

        Returns:
            The UUID of the newly created incident.
        """
        title = incident_data.get("title", "")
        service = incident_data.get("service", "")
        severity = incident_data.get("severity", "")
        root_cause = incident_data.get("root_cause", "")
        resolution = incident_data.get("resolution", "")
        resolution_time_minutes = incident_data.get("resolution_time_minutes")

        # Build a rich text string for embedding
        embed_string = (
            f"{title}. Service: {service}. "
            f"Root cause: {root_cause}. Resolution: {resolution}"
        )

        embedding = await self.embed_text(embed_string)

        incident_id = str(uuid4())

        row = {
            "id": incident_id,
            "org_id": str(org_id),
            "title": title,
            "service": service,
            "severity": severity,
            "root_cause": root_cause,
            "resolution": resolution,
            "resolution_time_minutes": resolution_time_minutes,
            "embedding": embedding,
        }

        supabase = get_supabase()
        try:
            result = supabase.table("incidents").insert(row).execute()
        except Exception as e:
            logger.error("Failed to store incident: %s", str(e))
            raise HTTPException(
                status_code=500,
                detail="Failed to store incident in database",
            )

        return UUID(incident_id)

    # ------------------------------------------------------------------
    # Method 3: Semantic similarity search
    # ------------------------------------------------------------------
    async def search_similar(
        self, query_text: str, org_id: UUID, top_k: int = 3
    ) -> List[dict]:
        """
        Find similar historical incidents using vector similarity search.

        Embeds the query text, then calls the Supabase match_incidents()
        RPC function which performs cosine similarity search filtered by org_id.

        Args:
            query_text: The error description or stack trace to search against.
            org_id: Organization UUID for data isolation.
            top_k: Maximum number of results to return.

        Returns:
            List of matching incidents with similarity scores.
        """
        query_embedding = await self.embed_text(query_text)

        supabase = get_supabase()
        try:
            result = supabase.rpc(
                "match_incidents",
                {
                    "query_embedding": query_embedding,
                    "query_org_id": str(org_id),
                    "match_threshold": 0.3,
                    "match_count": top_k,
                },
            ).execute()
        except Exception as e:
            logger.error("Similarity search RPC failed: %s", str(e))
            return []

        if not result.data:
            return []

        return result.data

    # ------------------------------------------------------------------
    # Method 4: LLM-powered diagnosis synthesis
    # ------------------------------------------------------------------
    async def synthesize_diagnosis(
        self, query: str, matches: List[dict]
    ) -> dict:
        """
        Synthesize a diagnosis using Groq (Llama 3.3 70B) based on
        the query and similar historical incidents.

        Graceful degradation: if Groq fails, returns raw search matches
        without LLM synthesis.

        Args:
            query: The original error description or stack trace.
            matches: List of similar incidents from search_similar().

        Returns:
            dict with root_cause, confidence, affected_subsystem,
            resolution_steps, matches, and reasoning.
        """
        if not matches:
            return {
                "root_cause": "No similar historical incidents found",
                "confidence": 0,
                "affected_subsystem": "unknown",
                "resolution_steps": [],
                "matches": [],
                "reasoning": "No historical data available for comparison.",
            }

        # Build context from matches
        context_blocks = ""
        for i, match in enumerate(matches[:5], 1):
            context_blocks += (
                f"\n--- Historical Incident {i} (Similarity: {match.get('similarity', 0):.2f}) ---\n"
                f"Title: {match.get('title', 'N/A')}\n"
                f"Service: {match.get('service', 'N/A')}\n"
                f"Severity: {match.get('severity', 'N/A')}\n"
                f"Root Cause: {match.get('root_cause', 'N/A')}\n"
                f"Resolution: {match.get('resolution', 'N/A')}\n"
                f"Resolution Time: {match.get('resolution_time_minutes', 'N/A')} minutes\n"
            )

        system_prompt = (
            "You are a senior Site Reliability Engineer with deep expertise in "
            "distributed systems, microservices, and production incident response. "
            "You have access to a historical incident memory system. "
            "Analyze the current incident using historical context and respond with "
            "ONLY valid JSON — no markdown, no code fences, no extra text."
        )

        user_prompt = (
            f"CURRENT INCIDENT:\n{query}\n\n"
            f"SIMILAR HISTORICAL INCIDENTS:\n{context_blocks}\n\n"
            "Based on the historical incidents above, provide a diagnosis. "
            "Respond with ONLY this JSON structure:\n"
            "{\n"
            '  "root_cause": "specific technical root cause based on patterns",\n'
            '  "confidence": 75,\n'
            '  "affected_subsystem": "name of the affected subsystem or service",\n'
            '  "resolution_steps": ["step 1", "step 2", "step 3"],\n'
            '  "reasoning": "explanation referencing the historical incidents"\n'
            "}\n\n"
            "Set confidence between 0-100 based on how closely historical "
            "incidents match. Higher if multiple incidents show the same pattern."
        )

        if not self.groq_client:
            logger.warning("Groq client not configured — returning raw matches")
            return self._fallback_response(matches)

        try:
            # Run Groq call in a thread since the SDK is synchronous
            def _call_groq():
                return self.groq_client.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    max_tokens=1024,
                    temperature=0.1,
                )

            response = await asyncio.to_thread(_call_groq)
            content = response.choices[0].message.content.strip()

            # Clean markdown fences if present
            if content.startswith("```"):
                content = re.sub(r"^```(?:json)?\s*", "", content)
                content = re.sub(r"\s*```$", "", content)

            # Strip <think> tags if present
            think_match = re.search(r"</think>\s*", content, re.DOTALL)
            if think_match:
                content = content[think_match.end():]

            content = content.strip()
            parsed = json.loads(content)

            # Attach the raw matches to the response
            parsed["matches"] = [
                {
                    "id": m.get("id"),
                    "title": m.get("title"),
                    "service": m.get("service"),
                    "severity": m.get("severity"),
                    "root_cause": m.get("root_cause"),
                    "resolution": m.get("resolution"),
                    "similarity": m.get("similarity", 0),
                }
                for m in matches
            ]

            # Ensure all expected fields exist
            parsed.setdefault("root_cause", "Unable to determine")
            parsed.setdefault("confidence", 0)
            parsed.setdefault("affected_subsystem", "unknown")
            parsed.setdefault("resolution_steps", [])
            parsed.setdefault("reasoning", "")

            return parsed

        except json.JSONDecodeError as e:
            logger.error("Groq returned malformed JSON: %s", str(e))
            return self._fallback_response(matches)
        except Exception as e:
            logger.error("Groq synthesis failed: %s", str(e))
            return self._fallback_response(matches)

    def _fallback_response(self, matches: List[dict]) -> dict:
        """
        Graceful degradation when Groq is unavailable.
        Returns the raw search matches without LLM synthesis.
        """
        top = matches[0] if matches else {}
        return {
            "root_cause": top.get("root_cause", "LLM unavailable — see similar incidents"),
            "confidence": 30 if matches else 0,
            "affected_subsystem": top.get("service", "unknown"),
            "resolution_steps": [
                top.get("resolution", "Review similar incidents for resolution guidance")
            ] if top.get("resolution") else ["Review similar incidents manually"],
            "matches": [
                {
                    "id": m.get("id"),
                    "title": m.get("title"),
                    "service": m.get("service"),
                    "severity": m.get("severity"),
                    "root_cause": m.get("root_cause"),
                    "resolution": m.get("resolution"),
                    "similarity": m.get("similarity", 0),
                }
                for m in matches
            ],
            "reasoning": "LLM synthesis unavailable. Results are based on vector similarity search only.",
        }


# Module-level singleton
memory = AegisMemory()
