import asyncio
import json
import logging
import re

from fastapi import HTTPException
from groq import Groq

from config import settings
from prompts import build_diagnosis_prompt

logger = logging.getLogger(__name__)


class GroqClient:
    def __init__(self):
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = settings.groq_model

    async def analyze(self, alert_text: str, similar_incidents: list[dict], service_name: str, severity: str) -> dict:
        messages = build_diagnosis_prompt(alert_text, similar_incidents, service_name, severity)


        def _call():
            return self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=settings.max_tokens,
                temperature=0.1,
            )

        response = await asyncio.to_thread(_call)
        content = response.choices[0].message.content

        cleaned = content.strip()

        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)

        think_match = re.search(r"</think>\s*", cleaned, re.DOTALL)
        if think_match:
            cleaned = cleaned[think_match.end():]

        cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            logger.error("LLM returned malformed JSON: %s", content[:500])
            raise HTTPException(status_code=500, detail="LLM returned malformed response")
