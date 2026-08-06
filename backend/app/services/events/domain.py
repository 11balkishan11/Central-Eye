from pydantic import BaseModel
from typing import Dict, Any, Optional

class DomainEventPayload(BaseModel):
    """
    Base class for specific domain event payloads.
    These are embedded within the `EventEnvelope`.
    """
    pass

class FactUpdated(DomainEventPayload):
    fact_group_id: str
    payload: Dict[str, Any]

class RelationshipAdded(DomainEventPayload):
    target_resource_id: str
    relationship_type: str

class ResourceStateChanged(DomainEventPayload):
    old_state: str
    new_state: str

class MeasurementReceived(DomainEventPayload):
    category: str
    metric: str
    value: float
    unit: Optional[str] = None
