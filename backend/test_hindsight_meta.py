import asyncio
import httpx
import memory_client
import json

async def run():
    client = memory_client.HindsightClient()
    meta = {
        "incident_id": "INC-123",
        "service_name": "unknown",
        "severity": "MEDIUM",
        "time_to_resolve_mins": 30,
        "alert_text": "hello",
        "root_cause": "world",
        "tags": "[]",
        "resolution_steps": "[]"
    }
    async with httpx.AsyncClient() as hc:
        r = await hc.post(client._bank_url("/memories"), headers=client.headers, json={"items": [{"content": "Test large meta", "metadata": meta}]})
        print("WRITE:", r.status_code, r.text)

asyncio.run(run())
