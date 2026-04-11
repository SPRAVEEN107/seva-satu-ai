import asyncio
from services.db_service import get_pool
from dotenv import load_dotenv
import os

load_dotenv()

async def check_db():
    print(f"DATABASE_URL: {os.getenv('DATABASE_URL')}")
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            citizens = await conn.fetch("SELECT id, name, phone FROM citizens")
            print(f"Found {len(citizens)} citizens:")
            for c in citizens:
                print(f" - {c['name']} ({c['phone']}) [ID: {c['id']}]")
            
            schemes = await conn.fetchval("SELECT count(*) FROM schemes")
            print(f"Total schemes: {schemes}")
    except Exception as e:
        print(f"Error connecting to DB: {e}")

if __name__ == "__main__":
    asyncio.run(check_db())
