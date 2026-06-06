import asyncio
from memory_client import HindsightClient

async def test():
    client = HindsightClient()
    res = await client.search("test")
    print(res)

asyncio.run(test())
