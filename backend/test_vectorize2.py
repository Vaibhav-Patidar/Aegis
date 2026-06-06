import asyncio
from memory_client import HindsightClient
import httpx

async def test():
    client = HindsightClient()
    incident = {
        "id": "test-456",
        "service_name": "test-svc",
        "alert_text": "Test alert text",
        "resolution_steps": ["step 1"],
        "similar_incidents": [{"id": "xyz"}]
    }
    async with httpx.AsyncClient(timeout=client.timeout) as http:
        res = await client.write(incident)
        print("WRITE SUCCESS:", res)

asyncio.run(test())
