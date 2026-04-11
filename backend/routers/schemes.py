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
            "id": "mock-1", "name": "PM Kisan Samman Nidhi", "ministry": "Ministry of Agriculture",
            "category": "Agriculture", "description": "Direct income support of ₹6000/year to small and marginal farmers.", "benefit_amount": "₹6,000/year", "eligibility_criteria": {"occupation": ["farmer"]}, "apply_url": "https://pmkisan.gov.in", "state_specific": "ALL", "is_active": True
        },
        {
            "id": "mock-2", "name": "Ayushman Bharat PM-JAY", "ministry": "Ministry of Health",
            "category": "Health", "description": "Health insurance coverage of ₹5 lakh per family.", "benefit_amount": "₹5,00,000 health cover/year", "eligibility_criteria": {"income_max": 500000}, "apply_url": "https://pmjay.gov.in", "state_specific": "ALL", "is_active": True
        },
        {
            "id": "mock-3", "name": "Pradhan Mantri Awas Yojana", "ministry": "Ministry of Housing",
            "category": "Housing", "description": "Financial assistance for construction/purchase of pucca house.", "benefit_amount": "Up to ₹2.67 lakh subsidy", "eligibility_criteria": {"housing_status": "no_house"}, "apply_url": "https://pmaymis.gov.in", "state_specific": "ALL", "is_active": True
        },
        {
            "id": "mock-4", "name": "Nai Roshni Scheme", "ministry": "Ministry of Minority Affairs",
            "category": "Minority", "description": "Leadership development program for minority women.", "benefit_amount": "Training and stipend", "eligibility_criteria": {"community": "minority"}, "apply_url": "https://minorityaffairs.gov.in", "state_specific": "ALL", "is_active": True
        },
        {
            "id": "mock-5", "name": "Venture Capital Fund for SCs", "ministry": "Ministry of Social Justice",
            "category": "SC/ST", "description": "Promotes entrepreneurship among Scheduled Castes.", "benefit_amount": "Financial assistance", "eligibility_criteria": {"caste_category": ["SC"]}, "apply_url": "https://vcfsc.in", "state_specific": "ALL", "is_active": True
        },
        {
            "id": "mock-6", "name": "Antyodaya Anna Yojana (AAY)", "ministry": "Ministry of Consumer Affairs",
            "category": "BPL", "description": "Provides highly subsidized food grains to the poorest of poor.", "benefit_amount": "35kg food grains per family/month", "eligibility_criteria": {"bpl_card": True}, "apply_url": "https://dfpd.gov.in", "state_specific": "ALL", "is_active": True
        },
        {
            "id": "mock-7", "name": "National Means-cum-Merit Scholarship", "ministry": "Ministry of Education",
            "category": "Education", "description": "Awarded to meritorious students of economically weaker sections.", "benefit_amount": "₹12,000 per annum", "eligibility_criteria": {"income_max": 350000}, "apply_url": "https://scholarships.gov.in", "state_specific": "ALL", "is_active": True
        },
        {
            "id": "mock-8", "name": "Startup India Scheme", "ministry": "Ministry of Commerce",
            "category": "Business", "description": "Supports entrepreneurs in building robust startup ecosystems.", "benefit_amount": "Tax exemptions and support", "eligibility_criteria": {"is_entrepreneur": True}, "apply_url": "https://www.startupindia.gov.in", "state_specific": "ALL", "is_active": True
        },
        {
            "id": "mock-9", "name": "Prime Ministers Employment Generation Programme", "ministry": "Ministry of MSME",
            "category": "Employment", "description": "Credit-linked subsidy program to generate self-employment.", "benefit_amount": "Subsidy up to 35% on project cost", "eligibility_criteria": {"employment_status": "unemployed"}, "apply_url": "https://kviconline.gov.in", "state_specific": "ALL", "is_active": True
        },
        {
            "id": "mock-10", "name": "Mahila Samman Savings Certificate", "ministry": "Ministry of Finance",
            "category": "Women", "description": "Small savings scheme backed by the government designed explicitly for women.", "benefit_amount": "7.5% fixed interest rate", "eligibility_criteria": {"gender": "female"}, "apply_url": "https://www.indiapost.gov.in", "state_specific": "ALL", "is_active": True
        }
    ]
