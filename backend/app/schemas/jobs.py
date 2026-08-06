from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class JobPullRequest(BaseModel):
    available_capacity: int
    capabilities: List[str]

class JobDefinition(BaseModel):
    job_id: UUID
    type: str
    target_ip: Optional[str] = None
    timeout_ms: int = 5000
    payload: dict
    lease_token: str
    lease_expires_at: datetime

class JobPullResponse(BaseModel):
    jobs: List[JobDefinition]

class JobStartRequest(BaseModel):
    lease_token: str

class JobCompleteRequest(BaseModel):
    lease_token: str
    result: dict

class JobFailRequest(BaseModel):
    lease_token: str
    error_message: str

class JobGenericResponse(BaseModel):
    success: bool
    message: str
