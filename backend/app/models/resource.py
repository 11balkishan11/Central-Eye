import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

from sqlalchemy import String, DateTime, ForeignKey, Index, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

def utc_now():
    return datetime.now(timezone.utc)

class Observation(Base):
    """Raw observation exactly as received from a collector."""
    __tablename__ = "observations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    collector_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True) # e.g. which collector sent this
    source_type: Mapped[str] = mapped_column(String, index=True) # e.g. "snmp", "wmi", "aws"
    resource_hint: Mapped[str] = mapped_column(String, index=True) # e.g. "10.0.0.12"
    payload: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class Fact(Base):
    """Verified, immutable truth derived from observations."""
    __tablename__ = "facts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    observation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("observations.id"), nullable=True)
    
    category: Mapped[str] = mapped_column(String, index=True) # e.g. "identity", "telemetry", "configuration"
    key: Mapped[str] = mapped_column(String) # e.g. "cpu", "firmware", "mac"
    value: Mapped[Any] = mapped_column(JSONB) # e.g. 27, "17.3.4"
    
    confidence: Mapped[float] = mapped_column(default=1.0) # 0.0 to 1.0
    processed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    __table_args__ = (
        Index("ix_facts_category_key", "category", "key"),
    )


class Resource(Base):
    """The central entity in the Knowledge Graph."""
    __tablename__ = "resources"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    resource_type: Mapped[str] = mapped_column(String, index=True) # e.g. "SWITCH", "SERVER", "VM"
    
    # Metadata for Blast Radius & Graph Intelligence
    importance: Mapped[Optional[int]] = mapped_column(Integer, nullable=True) # e.g. 1-100
    business_service: Mapped[Optional[str]] = mapped_column(String, nullable=True, index=True)
    sla_tier: Mapped[Optional[str]] = mapped_column(String, nullable=True, index=True) # e.g. "gold", "silver"
    owner_team: Mapped[Optional[str]] = mapped_column(String, nullable=True, index=True)
    environment: Mapped[Optional[str]] = mapped_column(String, nullable=True, index=True) # e.g. "production", "staging"
    tags: Mapped[Optional[List[str]]] = mapped_column(JSONB, default=list)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    
    aliases: Mapped[List["ResourceAlias"]] = relationship(back_populates="resource", cascade="all, delete-orphan")
    states: Mapped[List["ResourceState"]] = relationship(back_populates="resource", cascade="all, delete-orphan")

    # For fast traversal
    source_relationships: Mapped[List["Relationship"]] = relationship("Relationship", foreign_keys="Relationship.source_id", back_populates="source")
    target_relationships: Mapped[List["Relationship"]] = relationship("Relationship", foreign_keys="Relationship.target_id", back_populates="target")


class ResourceAlias(Base):
    """Used by Identity Matching to resolve facts to resources."""
    __tablename__ = "resource_aliases"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resource_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("resources.id", ondelete="CASCADE"), index=True)
    
    alias_type: Mapped[str] = mapped_column(String, index=True) # e.g. "MAC", "IP", "HOSTNAME"
    alias_value: Mapped[str] = mapped_column(String, index=True) # e.g. "AA:BB:CC", "10.0.0.5"
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    resource: Mapped["Resource"] = relationship(back_populates="aliases")

    __table_args__ = (
        Index("ix_aliases_type_value", "alias_type", "alias_value"),
    )


class ResourceState(Base):
    """Immutable state history of a resource."""
    __tablename__ = "resource_states"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resource_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("resources.id", ondelete="CASCADE"), index=True)
    
    attributes: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    processed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    resource: Mapped["Resource"] = relationship(back_populates="states")


class Relationship(Base):
    """Edges in the Knowledge Graph."""
    __tablename__ = "relationships"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("resources.id", ondelete="CASCADE"), index=True)
    target_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("resources.id", ondelete="CASCADE"), index=True)
    
    relationship_type: Mapped[str] = mapped_column(String, index=True) # e.g. "connected_to", "depends_on"
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    source: Mapped["Resource"] = relationship("Resource", foreign_keys=[source_id], back_populates="source_relationships")
    target: Mapped["Resource"] = relationship("Resource", foreign_keys=[target_id], back_populates="target_relationships")
    
    states: Mapped[List["RelationshipState"]] = relationship(back_populates="relationship", cascade="all, delete-orphan")


class RelationshipState(Base):
    """Immutable state history of a relationship."""
    __tablename__ = "relationship_states"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    relationship_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("relationships.id", ondelete="CASCADE"), index=True)
    
    attributes: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    processed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    relationship: Mapped["Relationship"] = relationship(back_populates="states")
