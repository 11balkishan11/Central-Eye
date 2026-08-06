import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from sqlalchemy import String, DateTime, Boolean, Integer, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

def utc_now():
    return datetime.now(timezone.utc)

class Policy(Base):
    __tablename__ = "policies"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    
    versions: Mapped[List["PolicyVersion"]] = relationship(back_populates="policy", cascade="all, delete-orphan")
    assignments: Mapped[List["PolicyAssignment"]] = relationship(back_populates="policy", cascade="all, delete-orphan")

class PolicyVersion(Base):
    __tablename__ = "policy_versions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    policy_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("policies.id", ondelete="CASCADE"), index=True)
    
    version: Mapped[int] = mapped_column(Integer)
    engine: Mapped[str] = mapped_column(String, default="configuration", server_default="configuration")
    match_criteria: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    rule_schema: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    
    policy: Mapped["Policy"] = relationship(back_populates="versions")
    evaluations: Mapped[List["PolicyEvaluation"]] = relationship("PolicyEvaluation", back_populates="policy_version", cascade="all, delete-orphan")

class PolicyAssignment(Base):
    __tablename__ = "policy_assignments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    policy_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("policies.id", ondelete="CASCADE"), index=True)
    resource_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("resources.id", ondelete="CASCADE"), index=True)
    
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    
    policy: Mapped["Policy"] = relationship(back_populates="assignments")
    resource: Mapped["Resource"] = relationship("Resource")
