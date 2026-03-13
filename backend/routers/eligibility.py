from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services import ai_service
from services.recommendation import pre_filter_schemes

router = APIRouter()


class EligibilityRequest(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = None
    caste_category: Optional[str] = None
    land_ownership: Optional[bool] = False
    family_size: Optional[int] = None
    name: Optional[str] = None


@router.post("/check")
async def check_eligibility(request: EligibilityRequest):
    """
    Check scheme eligibility based on citizen profile.
    Uses rule-based pre-filter + AI scoring.
    """
    profile = request.model_dump()

    # Step 1: Rule-based pre-filter
    candidates = pre_filter_schemes(profile)
    candidate_names = [c["name"] for c in candidates]

    # Step 2: AI deep scoring
    try:
        ai_result = await ai_service.check_eligibility_ai(profile)
    except Exception:
        ai_result = []

    # Merge rule scores with AI results
    merged = {}
    for c in candidates:
        merged[c["name"]] = {
            "name": c["name"],
            "match_score": c["match_score"],
            "category": None,
            "ministry": None,
            "benefit": None,
            "apply_url": None,
            "eligibility_reason": "Based on your profile, you likely qualify for this scheme.",
        }

    for ai_scheme in ai_result:
        name = ai_scheme.get("name", "")
        if name in merged:
            merged[name].update(ai_scheme)
        else:
            merged[name] = ai_scheme

    eligible_schemes = sorted(
        merged.values(),
        key=lambda x: x.get("match_score", 0),
        reverse=True,
    )[:5]

    return {
        "eligible_schemes": eligible_schemes,
        "total_matched": len(eligible_schemes),
        "profile_summary": {
            "name": profile.get("name", "Citizen"),
            "state": profile.get("state"),
            "occupation": profile.get("occupation"),
        },
    }
