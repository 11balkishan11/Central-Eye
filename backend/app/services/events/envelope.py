from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid
from typing import Dict, Any, Optional

class EventEnvelope(BaseModel):
    """
    Standardized wrapper for all Domain Events traveling through the platform.
    Ensures consistent routing, debugging, and replay capabilities.
    """
    event_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    event_type: str
    aggregate_id: str
    aggregate_type: str
    tenant_id: str
    
    # Traceability
    correlation_id: Optional[str] = None
    causation_id: Optional[str] = None
    
    # Versioning
    schema_version: str = "1.0"
    event_version: int = 1
    
    # Producer details
    producer: str = "twin_transaction"
    
    # Timing
    occurred_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    stored_at: Optional[datetime] = None # Set by dispatcher
    
    payload: Dict[str, Any]
    metadata: Dict[str, Any] = Field(default_factory=dict)
