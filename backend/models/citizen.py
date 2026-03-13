from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class CitizenBase(BaseModel):
    aadhaar_number: str = Field(..., min_length=12, max_length=12)
    name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=15)
    state: Optional[str] = None
    district: Optional[str] = None
    age: Optional[int] = Field(None, ge=1, le=120)
    gender: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = Field(None, ge=0)
    caste_category: Optional[str] = None
    land_ownership: Optional[bool] = False
    family_size: Optional[int] = Field(None, ge=1)


class CitizenCreate(CitizenBase):
    pass


class CitizenUpdate(BaseModel):
    name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = None
    caste_category: Optional[str] = None
    land_ownership: Optional[bool] = None
    family_size: Optional[int] = None


class CitizenResponse(CitizenBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class CitizenProfile(BaseModel):
    """Lightweight profile for AI context"""
    name: str
    state: Optional[str] = None
    district: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = None
    caste_category: Optional[str] = None
    land_ownership: Optional[bool] = False
    family_size: Optional[int] = None
