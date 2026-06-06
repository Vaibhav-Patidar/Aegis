import asyncio
import json
from pathlib import Path

from memory_client import HindsightClient


async def main():
    client = HindsightClient()
    data_path = Path(__file__).parent / "data" / "incidents.json"

    with open(data_path) as f:
        incidents = json.load(f)

    total = len(incidents)
    for i, incident in enumerate(incidents):
        await client.write(incident)
        print(f"Seeded incident {i + 1}/{total}: {incident['id']}")

    print(f"Seeding complete. {total} incidents loaded into Hindsight.")


asyncio.run(main())
