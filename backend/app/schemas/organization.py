from pydantic import BaseModel, Field
import uuid
from typing import Optional
from datetime import datetime
from app.models.tenant import OrganizationStatus

class OrganizationBase(BaseModel):
    name: str = Field(..., max_length=128)
    slug: str = Field(..., max_length=64, pattern=r'^[a-z0-9-]+$')
    description: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=128)
    slug: Optional[str] = Field(default=None, max_length=64, pattern=r'^[a-z0-9-]+$')
    description: Optional[str] = None
    status: Optional[OrganizationStatus] = None

class OrganizationStatusUpdate(BaseModel):
    status: OrganizationStatus

class OrganizationResponse(OrganizationBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    status: OrganizationStatus
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class OrganizationListResponse(BaseModel):
    items: list[OrganizationResponse]
    total: int
    skip: int
    limit: int
