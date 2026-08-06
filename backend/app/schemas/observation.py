from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

class ObservationCreate(BaseModel):
    collector_id: uuid.UUID
    source_type: str
    resource_hint: str
    payload: Dict[str, Any]
    tenant_id: uuid.UUID  # Passing this explicitly from collector for MVP

class ObservationResponse(BaseModel):
    id: uuid.UUID
    collector_id: Optional[uuid.UUID]
    source_type: str
    resource_hint: str
    payload: Dict[str, Any]
    observed_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
