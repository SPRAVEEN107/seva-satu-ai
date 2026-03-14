import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "")

async def test_conn():
    print(f"Testing connection to DB...")
    try:
        # Using the same parameters as db_service.py fix
        pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=1,
            max_size=5,
            command_timeout=30,
            timeout=10, # The fix
        )
        async with pool.acquire() as conn:
            val = await conn.fetchval("SELECT 1")
            print(f"Successfully connected! Result of SELECT 1: {val}")
        await pool.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_conn())
