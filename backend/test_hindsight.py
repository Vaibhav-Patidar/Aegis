import asyncio
import httpx
import memory_client

async def run():
    client = memory_client.HindsightClient()
    async with httpx.AsyncClient() as hc:
        r = await hc.post(client._bank_url("/memories"), headers=client.headers, json={"items": [{"content": "Test incident", "metadata": {"severity": "CRITICAL", "service_name": "test-service"}}]})
        print("WRITE:", r.status_code, r.text)
        
        await asyncio.sleep(2)
        r2 = await hc.post(client._bank_url("/memories/recall"), headers=client.headers, json={"query": "Test incident", "top_k": 1})
        print("RECALL:", r2.status_code, r2.text)

asyncio.run(run())
