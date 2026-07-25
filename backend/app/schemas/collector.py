from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class CollectorRead(BaseModel):
    id: UUID
    tenant_id: UUID
    site_id: Optional[UUID]
    name: str
    machine_id: str
    platform: Optional[str]
    python_version: Optional[str]
    version: Optional[str]
    last_heartbeat: Optional[datetime]
    capacity_percent: float
    capabilities: List[str]

    model_config = ConfigDict(from_attributes=True)
