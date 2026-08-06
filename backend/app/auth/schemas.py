from pydantic import BaseModel, ConfigDict
from typing import Optional, Generic, TypeVar, Any
import uuid
from datetime import datetime

from app.models.user import UserStatus, SessionStatus
from app.models.tenant import TenantStatus, TenantTier, TenantMembershipStatus

T = TypeVar("T")

class StandardResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operation successful"
    data: Optional[T] = None

class ErrorDetail(BaseModel):
    code: str
    message: str
    request_id: str

class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail

class LoginRequest(BaseModel):
    email: str
    password: str
    device_info: Optional[dict[str, Any]] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    status: UserStatus
    is_superuser: bool
    email_verified: bool
    last_login_at: Optional[datetime] = None

class TenantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    slug: str
    domain: Optional[str] = None
    status: TenantStatus
    tier: TenantTier

class MembershipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    role_id: uuid.UUID
    status: TenantMembershipStatus
    joined_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    status: SessionStatus
    expires_at: datetime
    created_at: datetime

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in: int = 900  # Usually 15 min, can be dynamic
    user: UserResponse
    session: SessionResponse

class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in: int = 900

class MeResponse(BaseModel):
    user: UserResponse
    session: SessionResponse
    tenant: Optional[TenantResponse] = None
    membership: Optional[MembershipResponse] = None
