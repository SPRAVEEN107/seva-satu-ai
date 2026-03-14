import asyncpg
import os
import uuid
from datetime import datetime
from typing import Optional
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

_pool: Optional[asyncpg.Pool] = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        # Emergency Fallback logic for presentation
        urls_to_try = [DATABASE_URL]
        
        # If using pooler, try direct host as backup
        if "-pooler" in DATABASE_URL:
            direct_url = DATABASE_URL.replace("-pooler", "")
            urls_to_try.append(direct_url)
        
        # Try simplified URL (without extra params that might confuse Render/asyncpg)
        if "?" in DATABASE_URL:
            base_url = DATABASE_URL.split("?")[0] + "?sslmode=require"
            if base_url not in urls_to_try:
                urls_to_try.append(base_url)

        last_error = None
        for attempt, url in enumerate(urls_to_try):
            try:
                masked_url = url.split('@')[-1].split('?')[0]
                print(f"[DB] Attempt {attempt+1}: Connecting to {masked_url}...")
                
                _pool = await asyncpg.create_pool(
                    url,
                    min_size=1,
                    max_size=5, # Reduced for stability on free tiers
                    command_timeout=30,
                    timeout=10,
                )
                print(f"[DB] Success! Connected on attempt {attempt+1}")
                return _pool
            except Exception as e:
                print(f"[DB] Attempt {attempt+1} failed: {e}")
                last_error = e
        
        # If all attempts fail
        print(f"[DB] CRITICAL: All connection attempts failed.")
        raise HTTPException(
            status_code=500,
            detail=f"[v11-Fallback] Database Unavailable: {str(last_error)}. Fix: Check Neon Console for 'Allowed IPs' or Typo in Render Env Vars."
        )
    return _pool


async def close_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


# ─── Citizens ────────────────────────────────────────────────────────────────

async def get_citizen(citizen_id: str) -> Optional[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM citizens WHERE id = $1", uuid.UUID(citizen_id)
        )
        return dict(row) if row else None


async def create_citizen(data: dict) -> str:
    pool = await get_pool()
    async with pool.acquire() as conn:
        citizen_id = await conn.fetchval(
            """INSERT INTO citizens (name, phone, state, district, age, gender,
               occupation, annual_income, caste_category, land_ownership, family_size)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
               RETURNING id""",
            data.get("name"),
            data.get("phone"),
            data.get("state"),
            data.get("district"),
            data.get("age"),
            data.get("gender"),
            data.get("occupation"),
            data.get("annual_income"),
            data.get("caste_category"),
            data.get("land_ownership", False),
            data.get("family_size"),
        )
        return str(citizen_id)


# ─── Schemes ─────────────────────────────────────────────────────────────────

async def get_schemes(filters: dict) -> tuple[list[dict], int]:
    pool = await get_pool()
    conditions = ["is_active = TRUE"]
    params: list = []
    param_idx = 1

    if filters.get("state"):
        conditions.append(
            f"(state_specific = 'ALL' OR state_specific = ${param_idx})"
        )
        params.append(filters["state"])
        param_idx += 1

    if filters.get("category"):
        conditions.append(f"category ILIKE ${param_idx}")
        params.append(f"%{filters['category']}%")
        param_idx += 1

    where_clause = " AND ".join(conditions)
    page = filters.get("page", 1)
    limit = filters.get("limit", 20)
    offset = (page - 1) * limit

    async with pool.acquire() as conn:
        total = await conn.fetchval(
            f"SELECT COUNT(*) FROM schemes WHERE {where_clause}", *params
        )
        rows = await conn.fetch(
            f"SELECT * FROM schemes WHERE {where_clause} ORDER BY name LIMIT {limit} OFFSET {offset}",
            *params,
        )
        return [dict(r) for r in rows], total


async def get_scheme_by_id(scheme_id: str) -> Optional[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM schemes WHERE id = $1", uuid.UUID(scheme_id)
        )
        return dict(row) if row else None


async def get_all_schemes() -> list[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM schemes WHERE is_active = TRUE")
        return [dict(r) for r in rows]


# ─── Applications ─────────────────────────────────────────────────────────────

async def save_application(citizen_id: str, scheme_id: str) -> dict:
    pool = await get_pool()
    ref_number = f"SAV-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """INSERT INTO applications (citizen_id, scheme_id, reference_number)
               VALUES ($1, $2, $3)
               RETURNING id, reference_number, status, applied_at""",
            uuid.UUID(citizen_id),
            uuid.UUID(scheme_id),
            ref_number,
        )
        return dict(row)


async def get_citizen_applications(citizen_id: str) -> list[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """SELECT a.id, a.reference_number, a.status, a.applied_at,
                      a.last_updated, a.notes, s.name as scheme_name
               FROM applications a
               JOIN schemes s ON a.scheme_id = s.id
               WHERE a.citizen_id = $1
               ORDER BY a.applied_at DESC""",
            uuid.UUID(citizen_id),
        )
        return [dict(r) for r in rows]


# ─── Grievances ──────────────────────────────────────────────────────────────

async def save_grievance(data: dict) -> str:
    pool = await get_pool()
    tracking_id = f"GRV-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
    print(f"[DB] Saving grievance: category={data.get('category')}, tracking_id={tracking_id}")
    
    # Safely parse citizen_id - None is OK (anonymous submission)
    citizen_id_val = None
    raw_cid = data.get("citizen_id")
    if raw_cid:
        try:
            citizen_id_val = uuid.UUID(str(raw_cid))
        except (ValueError, AttributeError):
            print(f"[DB] Warning: Invalid citizen_id '{raw_cid}', saving as anonymous")
            citizen_id_val = None

    async with pool.acquire() as conn:
        async with conn.transaction():
            grievance_id = await conn.fetchval(
                """INSERT INTO grievances (citizen_id, category, description,
                   department, tracking_id, priority, estimated_days, district, state)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                   RETURNING id""",
                citizen_id_val,
                data.get("category", "Other"),
                data.get("description", ""),
                data.get("department", "General Administration"),
                tracking_id,
                data.get("priority", "normal"),
                data.get("estimated_days", 30),
                data.get("district"),
                data.get("state"),
            )
            print(f"[DB] Grievance inserted with id={grievance_id}")
            # Insert initial timeline event
            await conn.execute(
                """INSERT INTO grievance_timeline (grievance_id, event_text, status)
                   VALUES ($1, $2, $3)""",
                grievance_id,
                "Grievance received and registered successfully.",
                "received",
            )
    print(f"[DB] ✅ Grievance saved successfully: {tracking_id}")
    return tracking_id


async def get_grievance_status(tracking_id: str) -> Optional[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM grievances WHERE tracking_id = $1", tracking_id
        )
        if not row:
            return None
        grievance = dict(row)

        timeline_rows = await conn.fetch(
            """SELECT event_text, status, created_at
               FROM grievance_timeline
               WHERE grievance_id = $1
               ORDER BY created_at ASC""",
            row["id"],
        )
        grievance["timeline"] = [dict(t) for t in timeline_rows]
        return grievance


async def get_all_grievances() -> list[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """SELECT g.id, g.tracking_id, g.category, g.description, g.department,
                      g.status, g.priority, g.estimated_days, g.district, g.state,
                      g.assigned_to_name, g.assigned_to_employee_id,
                      g.created_at, g.last_updated,
                      c.name as citizen_name
               FROM grievances g
               LEFT JOIN citizens c ON g.citizen_id = c.id
               ORDER BY g.created_at DESC"""
        )
        return [dict(r) for r in rows]


async def update_grievance_admin(tracking_id: str, status: Optional[str] = None,
                                department: Optional[str] = None, event_text: Optional[str] = None,
                                assigned_to_name: Optional[str] = None,
                                assigned_to_employee_id: Optional[str] = None) -> bool:
    pool = await get_pool()
    async with pool.acquire() as conn:
        # Get grievance id
        row = await conn.fetchrow("SELECT id, status FROM grievances WHERE tracking_id = $1", tracking_id)
        if not row:
            return False
        
        grievance_id = row["id"]
        old_status = row["status"]
        new_status = status or old_status

        async with conn.transaction():
            # Update grievance table
            updates = []
            params = []
            idx = 1
            if status:
                updates.append(f"status = ${idx}")
                params.append(status)
                idx += 1
            if department:
                updates.append(f"department = ${idx}")
                params.append(department)
                idx += 1
            if assigned_to_name is not None:
                updates.append(f"assigned_to_name = ${idx}")
                params.append(assigned_to_name)
                idx += 1
            if assigned_to_employee_id is not None:
                updates.append(f"assigned_to_employee_id = ${idx}")
                params.append(assigned_to_employee_id)
                idx += 1
            
            if updates:
                updates.append(f"last_updated = NOW()")
                params.append(tracking_id)
                query = f"UPDATE grievances SET {', '.join(updates)} WHERE tracking_id = ${idx}"
                await conn.execute(query, *params)

            # Add timeline event
            await conn.execute(
                """INSERT INTO grievance_timeline (grievance_id, event_text, status)
                   VALUES ($1, $2, $3)""",
                grievance_id,
                event_text or f"Status updated to {new_status.replace('_', ' ')}.",
                new_status,
            )
        return True


# ─── Chat History ─────────────────────────────────────────────────────────────

async def save_chat_message(citizen_id: Optional[str], message: str, response: str, language: str = "en"):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """INSERT INTO chat_history (citizen_id, message, response, language)
               VALUES ($1, $2, $3, $4)""",
            uuid.UUID(citizen_id) if citizen_id else None,
            message,
            response,
            language,
        )
