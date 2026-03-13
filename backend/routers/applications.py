from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import db_service
from datetime import datetime

router = APIRouter()


class ApplicationRequest(BaseModel):
    citizen_id: str
    scheme_id: str


@router.post("/apply")
async def apply_for_scheme(request: ApplicationRequest):
    """Apply for a government scheme."""
    try:
        result = await db_service.save_application(
            citizen_id=request.citizen_id,
            scheme_id=request.scheme_id,
        )
        return {
            "application_id": str(result["id"]),
            "reference_number": result["reference_number"],
            "status": result["status"],
            "applied_at": result["applied_at"],
            "next_steps": [
                "Your application has been submitted successfully.",
                "You will receive an SMS confirmation within 24 hours.",
                "Visit the scheme portal to upload required documents.",
                "Track your application status using your reference number.",
            ],
        }
    except Exception as e:
        if "duplicate" in str(e).lower():
            raise HTTPException(status_code=409, detail="You have already applied for this scheme")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{citizen_id}")
async def get_application_status(citizen_id: str):
    """Get all applications for a citizen."""
    try:
        apps = await db_service.get_citizen_applications(citizen_id)
        return {
            "applications": [
                {
                    "application_id": str(a["id"]),
                    "scheme_name": a["scheme_name"],
                    "status": a["status"],
                    "reference_number": a["reference_number"],
                    "applied_at": a["applied_at"],
                    "last_updated": a["last_updated"],
                    "notes": a.get("notes"),
                }
                for a in apps
            ],
            "total": len(apps),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
