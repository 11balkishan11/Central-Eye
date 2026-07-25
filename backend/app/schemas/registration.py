from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class RegistrationRequest(BaseModel):
    registration_key: str
    hostname: str
    platform: str
    python_version: str
    collector_version: str
    machine_id: str
    capabilities: List[str]

class RegistrationResponse(BaseModel):
    collector_id: UUID
    tenant_id: UUID
    site_id: Optional[UUID]
    access_token: str
    refresh_token: str
