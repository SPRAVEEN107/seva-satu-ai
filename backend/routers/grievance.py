import random
import string
from typing import List
from fastapi import APIRouter, HTTPException
from services import ai_service, db_service
from models.grievance import (
    GrievanceSubmit, GrievanceResponse, GrievanceStatusResponse, 
    GrievanceTimelineEvent, GrievanceAdminItem, GrievanceAdminUpdate
)
from datetime import datetime

router = APIRouter()


@router.post("/submit", response_model=GrievanceResponse)
async def submit_grievance(request: GrievanceSubmit):
    """Submit a new grievance. AI classifies the department."""
    if not request.description or len(request.description) < 10:
        raise HTTPException(status_code=400, detail="Description must be at least 10 characters")

    # AI classification
    classification = await ai_service.classify_grievance(
        description=request.description,
        category=request.category,
    )

    grievance_data = {
        "citizen_id": request.citizen_id,
        "category": request.category,
        "description": request.description,
        "department": classification["department"],
        "priority": classification["priority"],
        "estimated_days": classification["estimated_days"],
        "district": request.district,
        "state": request.state,
    }

    try:
        tracking_id = await db_service.save_grievance(grievance_data)
    except Exception as e:
        print(f"[ERROR] Failed to save grievance to DB: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return GrievanceResponse(
        tracking_id=tracking_id,
        department=classification["department"],
        sub_department=classification.get("sub_department"),
        status="received",
        priority=classification["priority"],
        estimated_days=classification["estimated_days"],
        message=f"Your grievance has been registered. Track it with ID: {tracking_id}",
    )


@router.get("/track/{tracking_id}")
async def track_grievance(tracking_id: str):
    """Track an existing grievance by tracking ID."""
    try:
        data = await db_service.get_grievance_status(tracking_id)
        if not data:
            raise HTTPException(status_code=404, detail="Grievance not found")

        timeline = [
            GrievanceTimelineEvent(
                event_text=t["event_text"],
                status=t["status"],
                created_at=t["created_at"],
            )
            for t in data.get("timeline", [])
        ]

        return GrievanceStatusResponse(
            tracking_id=data["tracking_id"],
            category=data["category"],
            description=data["description"],
            department=data["department"],
            status=data["status"],
            priority=data["priority"],
            estimated_days=data["estimated_days"],
            timeline=timeline,
            created_at=data["created_at"],
            last_updated=data["last_updated"],
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/all", response_model=List[GrievanceAdminItem])
async def get_all_grievances_admin():
    """Admin endpoint to see all grievances."""
    try:
        data = await db_service.get_all_grievances()
        print(f"[ADMIN] Retrieved {len(data)} grievances from DB")
        results = []
        for i, item in enumerate(data):
            try:
                results.append(GrievanceAdminItem(**item))
            except Exception as ve:
                print(f"[ADMIN] Row {i} failed validation: {ve}")
                # Append a fallback if one row fails but others might work
                results.append(GrievanceAdminItem(
                    id=item.get("id"),
                    tracking_id=item.get("tracking_id", "ERROR-VAL"),
                    description=item.get("description", "Validation Error"),
                    category=item.get("category", "Error"),
                    department="Error", status="error"
                ))
        return results
    except Exception as e:
        print(f"[ADMIN] CRITICAL ERROR in get_all_grievances_admin: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/admin/update/{tracking_id}")
async def update_grievance_status_admin(tracking_id: str, request: GrievanceAdminUpdate):
    """Admin endpoint to update status, department and assigned handler."""
    try:
        success = await db_service.update_grievance_admin(
            tracking_id=tracking_id,
            status=request.status,
            department=request.department,
            event_text=request.event_text,
            assigned_to_name=request.assigned_to_name,
            assigned_to_employee_id=request.assigned_to_employee_id,
        )
        if not success:
            raise HTTPException(status_code=404, detail="Grievance not found")
        return {"message": "Grievance updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
