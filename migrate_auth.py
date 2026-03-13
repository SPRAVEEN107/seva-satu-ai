import psycopg2
import os
from dotenv import load_dotenv
import pathlib

# Always load from the backend/.env file relative to THIS script's location
base_dir = pathlib.Path(__file__).parent
load_dotenv(base_dir / "backend" / ".env")

DB_URL = os.getenv("DATABASE_URL")

def run_migration():
    print(f"Connecting to DB...")
    if not DB_URL:
        print("ERROR: DATABASE_URL is not set. Make sure backend/.env exists.")
        return
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()

        print("Dropping existing tables to recreate with Aadhaar schema...")
        cur.execute("DROP TABLE IF EXISTS grievance_timeline, chat_history, grievances, applications, schemes, citizens CASCADE;")
        print("Dropped all existing tables.")

        schema_path = base_dir / "backend" / "database" / "schema.sql"
        with open(schema_path, "r", encoding="utf-8") as f:
            schema_sql = f.read()

        cur.execute(schema_sql)
        print("Successfully applied new schema with Aadhaar authentication + seeded schemes!")

        conn.commit()
        cur.close()
        conn.close()
        print("Migration complete!")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    run_migration()
