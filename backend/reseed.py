import asyncio
import json
import httpx
from pathlib import Path
from memory_client import HindsightClient
from config import settings

async def main():
    client = HindsightClient()
    async with httpx.AsyncClient(timeout=client.timeout) as http_client:
        response = await http_client.delete(
            client._bank_url("/memories"),
            headers=client.headers
        )
        if response.status_code == 200:
            print("Cleared memories.")
        else:
            print(f"Delete response: {response.status_code}")

    count_before = await client.count()
    print(f"Count before: {count_before}")

    data_path = Path(__file__).parent / "data" / "incidents2.json"
    with open(data_path) as f:
        incidents = json.load(f)

    total = len(incidents)
    for i, incident in enumerate(incidents):
        await client.write(incident)
        if (i + 1) % 10 == 0 or i + 1 == total:
            print(f"Seeded {i + 1}/{total}")

    count_after = await client.count()
    print(f"Count after: {count_after}")

if __name__ == "__main__":
    asyncio.run(main())
