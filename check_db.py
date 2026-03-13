import asyncio
import os
import sys

# Add backend to sys.path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from services.db_service import get_pool, close_pool
from dotenv import load_dotenv

# Load env from backend/.env
load_dotenv("backend/.env")

async def check_tables():
    pool = await get_pool()
    if not pool:
        print("Failed to initialize pool.")
        return

    async with pool.acquire() as conn:
        tables = await conn.fetch("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        print("Found tables:")
        for table in tables:
            print(f"- {table['table_name']}")

if __name__ == "__main__":
    os.chdir("backend")
    asyncio.run(check_tables())
