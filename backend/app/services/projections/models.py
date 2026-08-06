from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid
from typing import Optional

class ProjectionContext(BaseModel):
    """
    Context injected into every ProjectionHandler during a rebuild or update.
    """
    event_id: Optional[uuid.UUID] = None
    tenant_id: str
    correlation_id: Optional[str] = None
    trace_id: Optional[str] = None
    rebuild_reason: str = "incremental_update"
    schema_version: str = "1.0"
    
class ProjectionHealth(BaseModel):
    """
    Exposes the health and operational status of a specific Projection.
    """
    projection_name: str
    is_healthy: bool = True
    lag_ms: int = 0
    events_behind: int = 0
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_rebuild_duration_ms: int = 0
    total_failures: int = 0
    last_exception: Optional[str] = None
