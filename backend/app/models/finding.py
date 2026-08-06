import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from sqlalchemy import String, DateTime, Boolean, Integer, ForeignKey, Index, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

def utc_now():
    return datetime.now(timezone.utc)

class PolicyEvaluation(Base):
    """The result of evaluating a resource against a specific policy version."""
    __tablename__ = "policy_evaluations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    policy_version_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("policy_versions.id", ondelete="CASCADE"), index=True)
    resource_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("resources.id", ondelete="CASCADE"), index=True)
    finding_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("findings.id", ondelete="SET NULL"), nullable=True, index=True)
    
    status: Mapped[str] = mapped_column(String, index=True) # PASS, FAIL, UNKNOWN, NOT_APPLICABLE, SKIPPED, ERROR
    
    # Metadata
    engine_name: Mapped[str] = mapped_column(String) # e.g. "ConfigurationEngine"
    engine_version: Mapped[str] = mapped_column(String) # e.g. "1.0"
    trigger: Mapped[str] = mapped_column(String, default="API", server_default="API") # e.g. OBSERVATION, MANUAL, SCHEDULED, API, TEST_RUNNER
    evaluation_duration_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    fact_snapshot_timestamp: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    trace: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True) # Full evaluation trace
    
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    finished_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    
    policy_version: Mapped["PolicyVersion"] = relationship(back_populates="evaluations")
    resource: Mapped["Resource"] = relationship("Resource")
    finding: Mapped[Optional["Finding"]] = relationship("Finding", back_populates="evaluations")
    evidence: Mapped[List["Evidence"]] = relationship("Evidence", back_populates="evaluation", cascade="all, delete-orphan")

class Finding(Base):
    """A logical grouping of failed evaluations representing a deviation or incident."""
    __tablename__ = "findings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    resource_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("resources.id", ondelete="CASCADE"), index=True)
    
    origin_engine: Mapped[str] = mapped_column(String, index=True) # e.g. "ConfigurationEngine", "SecurityEngine"
    severity: Mapped[str] = mapped_column(String, index=True) # INFO, LOW, MEDIUM, HIGH, CRITICAL
    status: Mapped[str] = mapped_column(String, index=True, default="OPEN") # OPEN, ACKNOWLEDGED, RESOLVED, CLOSED
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    resource: Mapped["Resource"] = relationship("Resource")
    evaluations: Mapped[List["PolicyEvaluation"]] = relationship("PolicyEvaluation", back_populates="finding")
    states: Mapped[List["FindingState"]] = relationship("FindingState", back_populates="finding", cascade="all, delete-orphan")

class FindingState(Base):
    """Immutable history of the finding lifecycle."""
    __tablename__ = "finding_states"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    finding_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("findings.id", ondelete="CASCADE"), index=True)
    
    status: Mapped[str] = mapped_column(String, index=True)
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    changed_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True) # null if system generated
    
    finding: Mapped["Finding"] = relationship("Finding", back_populates="states")

class Evidence(Base):
    """The underlying facts supporting an evaluation."""
    __tablename__ = "evidence"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evaluation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("policy_evaluations.id", ondelete="CASCADE"), index=True)
    fact_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("facts.id", ondelete="SET NULL"), nullable=True, index=True)
    
    source: Mapped[str] = mapped_column(String) # e.g. 'SNMP', 'LLDP'
    weight: Mapped[int] = mapped_column(Integer, default=0)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    
    evaluation: Mapped["PolicyEvaluation"] = relationship("PolicyEvaluation", back_populates="evidence")
    fact: Mapped[Optional["Fact"]] = relationship("Fact")
