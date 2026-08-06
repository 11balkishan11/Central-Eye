from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

class ObservationEnvelope(BaseModel):
    """
    Separates transport metadata from the actual observation payload.
    Ensures the ObservationBus and IdentityResolution engines have standard fields to operate on.
    """
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    tenant_id: str
    collector_id: str
    collection_job_id: Optional[str] = None
    
    # Priority for processing (0 = highest)
    priority: int = 100
    received_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Allows versioning of the observation schema itself
    schema_version: str = "1.0"
    trace_id: Optional[str] = None
    
    # The actual payload from the collector
    payload: Dict[str, Any]
    
    # Evidence gathered by the collector for this specific payload
    evidence: Dict[str, Any] = Field(default_factory=dict)
