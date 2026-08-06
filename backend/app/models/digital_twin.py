import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
import enum

from app.models.base import Base

class ResourceLifecycleState(str, enum.Enum):
    UNKNOWN = "UNKNOWN"
    DISCOVERED = "DISCOVERED"
    OBSERVED = "OBSERVED"
    VERIFIED = "VERIFIED"
    DEGRADED = "DEGRADED"
    UNREACHABLE = "UNREACHABLE"
    DECOMMISSIONED = "DECOMMISSIONED"

class FactVersion(Base):
    """
    Versioned facts forming the core of the Digital Twin.
    Reconciler creates new versions instead of mutating existing rows.
    """
    __tablename__ = "fact_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    tenant_id = Column(String, index=True, nullable=False)
    
    fact_group_id = Column(String, index=True, nullable=False) # Groups versions of the same logical fact
    resource_id = Column(String, index=True, nullable=False)
    
    version = Column(String, nullable=False) # e.g. v1, v2
    
    valid_from = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    valid_to = Column(DateTime(timezone=True), nullable=True) # Null means currently active
    
    # E.g. {"hostname": "SW-01"}
    payload = Column(JSONB, nullable=False)
    
    # e.g. {"confidence": 0.98, "sources": ["snmp", "ssh"], "timestamp": ...}
    evidence = Column(JSONB, nullable=False, default={})

class TwinRelationship(Base):
    """
    Directional relationships between resources in the Digital Twin.
    """
    __tablename__ = "twin_relationships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    tenant_id = Column(String, index=True, nullable=False)
    
    source_resource_id = Column(String, index=True, nullable=False)
    target_resource_id = Column(String, index=True, nullable=False)
    
    relationship_type = Column(String, nullable=False) # e.g. CONNECTED_TO, HOSTS
    
    valid_from = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    valid_to = Column(DateTime(timezone=True), nullable=True)
    
    evidence = Column(JSONB, nullable=False, default={})
