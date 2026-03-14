import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def test_conn():
    hosts = [DATABASE_URL, DATABASE_URL.replace("-pooler", "")]
    for url in hosts:
        print(f"Testing connection to: {url.split('@')[-1].split('?')[0]}")
        try:
            conn = await asyncpg.connect(url, timeout=10)
            print(f"Successfully connected using: {'pooler' if '-pooler' in url else 'direct host'}")
            await conn.close()
        except Exception as e:
            print(f"Failed to connect: {e}")

if __name__ == "__main__":
    asyncio.run(test_conn())
