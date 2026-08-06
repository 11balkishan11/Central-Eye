import uuid
# ruff: noqa: F821
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import String, DateTime, ForeignKey, Index, Float, Table, Column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

def utc_now():
    return datetime.now(timezone.utc)

# Mapping table for Incident -> Finding
incident_finding_association = Table(
    "incident_findings",
    Base.metadata,
    Column("incident_id", UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="CASCADE"), primary_key=True),
    Column("finding_id", UUID(as_uuid=True), ForeignKey("findings.id", ondelete="CASCADE"), primary_key=True)
)

# Mapping table for Incident -> Resource (Affected Resources)
incident_resource_association = Table(
    "incident_resources",
    Base.metadata,
    Column("incident_id", UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="CASCADE"), primary_key=True),
    Column("resource_id", UUID(as_uuid=True), ForeignKey("resources.id", ondelete="CASCADE"), primary_key=True)
)

class Incident(Base):
    """
    Correlated group of findings representing a single operational event.
    """
    __tablename__ = "incidents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # State
    status: Mapped[str] = mapped_column(String, index=True, default="OPEN") # OPEN, ACKNOWLEDGED, INVESTIGATING, RESOLVED, CLOSED
    
    # Enrichment
    severity: Mapped[str] = mapped_column(String, index=True) # e.g. "CRITICAL", "HIGH"
    priority: Mapped[str] = mapped_column(String, index=True, default="P3") # e.g. "P1", "P2"
    blast_radius: Mapped[str] = mapped_column(String, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=1.0)
    
    # Causality
    root_cause_resource_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("resources.id"), nullable=True)
    
    # Context
    affected_business_services: Mapped[list] = mapped_column(JSONB, default=list)
    timeline_summary: Mapped[dict] = mapped_column(JSONB, default=dict)
    
    # Timing
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    supporting_findings: Mapped[List["Finding"]] = relationship(secondary=incident_finding_association)
    affected_resources: Mapped[List["Resource"]] = relationship(secondary=incident_resource_association)
    
    __table_args__ = (
        Index("ix_incidents_status_severity", "status", "severity"),
    )
