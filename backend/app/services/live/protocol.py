from enum import Enum
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

class DeliveryPolicy(str, Enum):
    FIRE_AND_FORGET = "fire_and_forget"
    RELIABLE = "reliable"
    LATEST_ONLY = "latest_only"
    COALESCED = "coalesced"
    SNAPSHOT_THEN_DELTA = "snapshot_then_delta"

class PresentationEventV1(BaseModel):
    """Base wrapper for all UI-bound events."""
    event_id: str
    event_type: str
    tenant_id: str
    timestamp: str
    payload: Any

# --- Specific UI Event Payloads ---

class DeviceUpdatedV1(BaseModel):
    resource_id: str
    name: str
    vendor: str
    model: str
    status: str
    ip: str
    health: str
    capabilities: List[str]

class TopologyDeltaV1(BaseModel):
    topology_id: str
    added_nodes: List[Dict[str, Any]] = Field(default_factory=list)
    removed_nodes: List[str] = Field(default_factory=list)
    updated_nodes: List[Dict[str, Any]] = Field(default_factory=list)
    added_edges: List[Dict[str, Any]] = Field(default_factory=list)
    removed_edges: List[str] = Field(default_factory=list)
    
class DashboardMetricUpdatedV1(BaseModel):
    metric_id: str
    value: float
    unit: str

class IncidentUpdatedV1(BaseModel):
    incident_id: str
    status: str
    severity: str
    description: str

class NotificationV1(BaseModel):
    id: str
    title: str
    message: str
    level: str # info, warn, error
