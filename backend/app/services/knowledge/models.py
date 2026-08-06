from enum import Enum
from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class KnowledgeQueryProfile(str, Enum):
    ROOT_CAUSE = "ROOT_CAUSE"
    EXEC_SUMMARY = "EXEC_SUMMARY"
    TOPOLOGY = "TOPOLOGY"
    QNA = "QNA"
    REMEDIATION = "REMEDIATION"
    INVESTIGATION = "INVESTIGATION"
    AUTOMATION = "AUTOMATION"
    FULL = "FULL"

class InfrastructureKnowledge(BaseModel):
    """
    The immutable, single-source-of-truth DTO for the platform's current state.
    Sliced by KnowledgeQueryProfile. No SQLAlchemy sessions allowed.
    """
    knowledge_version: str = "1.0"
    snapshot_timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Core Identity
    resource: Optional[Dict[str, Any]] = None
    incident: Optional[Dict[str, Any]] = None
    
    # Sliced Data
    topology: Optional[List[Dict[str, Any]]] = None
    timeline: Optional[List[Dict[str, Any]]] = None
    facts: Optional[List[Dict[str, Any]]] = None
    evaluations: Optional[List[Dict[str, Any]]] = None
    incidents: Optional[List[Dict[str, Any]]] = None
    blast_radius: Optional[List[Dict[str, Any]]] = None
    policies: Optional[List[Dict[str, Any]]] = None
    metadata: Optional[Dict[str, Any]] = None
    graph_snapshot: Optional[Dict[str, Any]] = None
    historical_facts: Optional[List[Dict[str, Any]]] = None # Shows versioned history and evidence
    
    model_config = ConfigDict(arbitrary_types_allowed=False, frozen=True)
