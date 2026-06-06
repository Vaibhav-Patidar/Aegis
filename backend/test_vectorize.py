import asyncio
from memory_client import HindsightClient
import httpx

async def test():
    client = HindsightClient()
    incident = {
        "id": "test-123",
        "service_name": "test-svc",
        "alert_text": "Test alert text for vectorize",
        "resolution_steps": ["step 1"]
    }
    async with httpx.AsyncClient(timeout=client.timeout) as http:
        res = await http.post(
            client._bank_url("/memories"),
            headers=client.headers,
            json={"items": [{"content": "Test text", "metadata": incident}]}
        )
        print("WRITE:", res.status_code, res.text)

asyncio.run(test())
