from pydantic import BaseModel, Field
import uuid
from typing import Optional
from datetime import datetime
from app.models.tenant import SiteStatus

class SiteBase(BaseModel):
    name: str = Field(..., max_length=128)
    code: str = Field(..., max_length=64, pattern=r'^[a-z0-9-]+$')
    timezone: str = Field(default="UTC")
    description: Optional[str] = None

class SiteCreate(SiteBase):
    pass

class SiteUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=128)
    code: Optional[str] = Field(default=None, max_length=64, pattern=r'^[a-z0-9-]+$')
    timezone: Optional[str] = None
    description: Optional[str] = None
    status: Optional[SiteStatus] = None

class SiteStatusUpdate(BaseModel):
    status: SiteStatus

class SiteResponse(SiteBase):
    id: uuid.UUID
    organization_id: uuid.UUID
    status: SiteStatus
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SiteListResponse(BaseModel):
    items: list[SiteResponse]
    total: int
    skip: int
    limit: int
