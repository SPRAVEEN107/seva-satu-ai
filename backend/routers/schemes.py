from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from services import db_service

router = APIRouter()


@router.get("/list")
async def list_schemes(
    state: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    income_range: Optional[str] = Query(None),
    age: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """List schemes with filters. Supports pagination."""
    filters = {
        "state": state,
        "category": category,
        "income_range": income_range,
        "age": age,
        "page": page,
        "limit": limit,
    }

    try:
        schemes, total = await db_service.get_schemes(filters)
    except Exception as e:
        # Return mock data if DB unavailable
        schemes = _mock_schemes()
        total = len(schemes)

    return {
        "schemes": schemes,
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.get("/{scheme_id}")
async def get_scheme(scheme_id: str):
    """Get full details for a specific scheme."""
    try:
        scheme = await db_service.get_scheme_by_id(scheme_id)
        if not scheme:
            raise HTTPException(status_code=404, detail="Scheme not found")
        return scheme
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _mock_schemes():
    return [
        {
            "id": "mock-1",
            "name": "PM Kisan Samman Nidhi",
            "ministry": "Ministry of Agriculture",
            "category": "Agriculture",
            "description": "Direct income support of ₹6000/year to small and marginal farmers.",
            "benefit_amount": "₹6,000/year",
            "eligibility_criteria": {"occupation": ["farmer"], "income_max": 600000},
            "apply_url": "https://pmkisan.gov.in",
            "state_specific": "ALL",
            "is_active": True,
        },
        {
            "id": "mock-2",
            "name": "Ayushman Bharat PM-JAY",
            "ministry": "Ministry of Health",
            "category": "Health",
            "description": "Health insurance coverage of ₹5 lakh per family per year.",
            "benefit_amount": "₹5,00,000 health cover/year",
            "eligibility_criteria": {"income_max": 500000},
            "apply_url": "https://pmjay.gov.in",
            "state_specific": "ALL",
            "is_active": True,
        },
        {
            "id": "mock-3",
            "name": "Pradhan Mantri Awas Yojana",
            "ministry": "Ministry of Housing",
            "category": "Housing",
            "description": "Financial assistance for construction/purchase of pucca house.",
            "benefit_amount": "Up to ₹2.67 lakh subsidy",
            "eligibility_criteria": {"income_max": 1800000, "housing_status": "no_house"},
            "apply_url": "https://pmaymis.gov.in",
            "state_specific": "ALL",
            "is_active": True,
        },
    ]
