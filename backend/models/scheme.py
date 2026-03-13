from pydantic import BaseModel, Field
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime


class SchemeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    ministry: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    benefit_amount: Optional[str] = None
    eligibility_criteria: Optional[dict[str, Any]] = None
    apply_url: Optional[str] = None
    state_specific: Optional[str] = "ALL"
    is_active: Optional[bool] = True


class SchemeCreate(SchemeBase):
    pass


class SchemeResponse(SchemeBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class SchemeListResponse(BaseModel):
    schemes: List[SchemeResponse]
    total: int
    page: int
    limit: int


class SchemeFilters(BaseModel):
    state: Optional[str] = None
    category: Optional[str] = None
    income_range: Optional[str] = None
    age: Optional[str] = None
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)


class SuggestedScheme(BaseModel):
    name: str
    ministry: Optional[str] = None
    benefit: Optional[str] = None
    match_score: Optional[int] = None
    apply_url: Optional[str] = None
    eligibility_reason: Optional[str] = None
    category: Optional[str] = None
