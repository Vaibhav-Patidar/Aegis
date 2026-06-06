import asyncio
from memory_client import HindsightClient
import httpx

async def test():
    client = HindsightClient()
    async with httpx.AsyncClient(timeout=client.timeout) as http:
        res = await http.post(
            client._bank_url("/memories/recall"),
            headers=client.headers,
            json={"query": "incident", "top_k": 1}
        )
        print("RAW RESPONSE:", res.json())

asyncio.run(test())
