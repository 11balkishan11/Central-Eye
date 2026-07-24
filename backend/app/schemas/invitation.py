from pydantic import BaseModel, EmailStr
import uuid
from datetime import datetime
from app.models.tenant import InvitationStatus

class InvitationCreate(BaseModel):
    email: EmailStr
    role_id: uuid.UUID # The role we intend to give them upon acceptance (passed in context or stored temporarily)

class InvitationAccept(BaseModel):
    token: str

class InvitationResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    email: str
    status: InvitationStatus
    expires_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class InvitationListResponse(BaseModel):
    items: list[InvitationResponse]
    total: int
