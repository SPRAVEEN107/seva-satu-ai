"""
Run this script once to add assigned_to_name and assigned_to_employee_id columns
to the grievances table in NeonDB.
"""
import asyncio
import asyncpg

DATABASE_URL = "postgresql://neondb_owner:npg_Wa59IxfRqCPZ@ep-floral-dew-aigr97xy-pooler.c-4.us-east-1.aws.neon.tech/SevaSetuDB?sslmode=require"

async def migrate():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        print("Connected to DB. Running migration...")
        await conn.execute("""
            ALTER TABLE grievances
            ADD COLUMN IF NOT EXISTS assigned_to_name VARCHAR(100),
            ADD COLUMN IF NOT EXISTS assigned_to_employee_id VARCHAR(30);
        """)
        print("✅ Migration complete: added assigned_to_name, assigned_to_employee_id to grievances table.")
    finally:
        await conn.close()

asyncio.run(migrate())
