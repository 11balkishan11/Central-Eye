from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import String, Enum, ForeignKey, DateTime, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base

class JobStatus(str, enum.Enum):
    PENDING = "PENDING"
    LEASED = "LEASED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class JobType(str, enum.Enum):
    ICMP_PING = "ICMP_PING"
    SNMP_POLL = "SNMP_POLL"
    DISCOVERY = "DISCOVERY"

class CollectorJob(Base):
    __tablename__ = "collector_jobs"
    
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    site_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("sites.id", ondelete="SET NULL"), index=True)
    
    assigned_collector_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("collectors.id", ondelete="SET NULL"), index=True)
    leased_by: Mapped[Optional[str]] = mapped_column(String)  # machine_id or identifier
    lease_token: Mapped[Optional[str]] = mapped_column(String, index=True)
    
    type: Mapped[JobType] = mapped_column(Enum(JobType, native_enum=True), index=True)
    status: Mapped[JobStatus] = mapped_column(Enum(JobStatus, native_enum=True), default=JobStatus.PENDING, index=True)
    priority: Mapped[int] = mapped_column(Integer, default=10, index=True)
    
    payload: Mapped[dict] = mapped_column(JSONB, default=dict)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    lease_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), index=True)
    
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    max_attempts: Mapped[int] = mapped_column(Integer, default=3)
    
    result: Mapped[Optional[dict]] = mapped_column(JSONB)
    error_message: Mapped[Optional[str]] = mapped_column(String)

class CollectorEventType(str, enum.Enum):
    REGISTERED = "REGISTERED"
    HEARTBEAT = "HEARTBEAT"
    HEARTBEAT_MISSED = "HEARTBEAT_MISSED"
    OFFLINE = "OFFLINE"
    ONLINE = "ONLINE"
    TOKEN_REFRESH = "TOKEN_REFRESH"
    JOB_LEASED = "JOB_LEASED"
    JOB_STARTED = "JOB_STARTED"
    JOB_COMPLETED = "JOB_COMPLETED"
    JOB_FAILED = "JOB_FAILED"

class CollectorEvent(Base):
    __tablename__ = "collector_events"
    
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    collector_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("collectors.id", ondelete="SET NULL"), index=True)
    
    event_type: Mapped[CollectorEventType] = mapped_column(Enum(CollectorEventType, native_enum=True), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    
    details: Mapped[Optional[dict]] = mapped_column(JSONB)
    correlation_id: Mapped[Optional[str]] = mapped_column(String, index=True)
