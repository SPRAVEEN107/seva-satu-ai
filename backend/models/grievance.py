from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class GrievanceBase(BaseModel):
    category: str = Field(..., min_length=1)
    description: str = Field(..., min_length=10)
    district: Optional[str] = None
    state: Optional[str] = None


class GrievanceSubmit(GrievanceBase):
    citizen_id: Optional[str] = None


class GrievanceResponse(BaseModel):
    tracking_id: str
    department: str
    sub_department: Optional[str] = None
    status: str
    priority: str
    estimated_days: int
    message: str


class GrievanceTimelineEvent(BaseModel):
    event_text: str
    status: str
    created_at: datetime


class GrievanceStatusResponse(BaseModel):
    tracking_id: str
    category: str
    description: str
    department: str
    status: str
    priority: str
    estimated_days: int
    timeline: List[GrievanceTimelineEvent]
    created_at: datetime
    last_updated: datetime


class GrievanceAdminUpdate(BaseModel):
    status: Optional[str] = None
    department: Optional[str] = None
    event_text: Optional[str] = None


class GrievanceAdminItem(BaseModel):
    id: UUID
    tracking_id: Optional[str] = None
    citizen_name: Optional[str]
    category: str
    description: str
    department: str
    status: str
    priority: str
    estimated_days: int
    created_at: datetime
    last_updated: datetime


class GrievanceClassification(BaseModel):
    department: str
    sub_department: Optional[str] = None
    priority: str = "normal"
    estimated_days: int = 30


class ApplicationBase(BaseModel):
    citizen_id: str
    scheme_id: str


class ApplicationResponse(BaseModel):
    application_id: str
    reference_number: str
    scheme_name: Optional[str] = None
    status: str
    next_steps: List[str]
    applied_at: datetime


class ApplicationStatusItem(BaseModel):
    application_id: str
    scheme_name: str
    status: str
    reference_number: str
    applied_at: datetime
    last_updated: datetime
    notes: Optional[str] = None


class ApplicationsListResponse(BaseModel):
    applications: List[ApplicationStatusItem]
    total: int
