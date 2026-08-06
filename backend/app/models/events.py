from sqlalchemy import Column, String, JSON, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid
from app.models.base import Base

class OutboxEvent(Base):
    """
    Pending events waiting to be dispatched.
    States: PENDING -> PROCESSING -> PUBLISHED -> ARCHIVED
    """
    __tablename__ = "outbox_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aggregate_id = Column(String, index=True, nullable=False)
    tenant_id = Column(String, index=True, nullable=False)
    status = Column(String, index=True, default="PENDING")
    
    payload = Column(JSON, nullable=False) # The EventEnvelope
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class StoredEvent(Base):
    """
    The immutable, append-only Event Store.
    """
    __tablename__ = "event_store"
    
    event_id = Column(UUID(as_uuid=True), primary_key=True) # from EventEnvelope
    aggregate_id = Column(String, index=True, nullable=False)
    tenant_id = Column(String, index=True, nullable=False)
    
    event_type = Column(String, index=True, nullable=False)
    event_version = Column(Integer, nullable=False)
    
    payload = Column(JSON, nullable=False) # The raw DomainEvent payload
    metadata_json = Column(JSON, nullable=False) # Extracted envelope metadata
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

class SubscriberCheckpoint(Base):
    """
    Tracks how far each subscriber (e.g. TopologyProjection) has read.
    """
    __tablename__ = "subscriber_checkpoints"
    
    subscriber_name = Column(String, primary_key=True)
    tenant_id = Column(String, primary_key=True)
    
    last_event_id = Column(UUID(as_uuid=True), nullable=True)
    last_event_created_at = Column(DateTime(timezone=True), nullable=True)
    
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class DeadLetter(Base):
    """
    Operational table for poison events that crashed a subscriber.
    """
    __tablename__ = "dead_letters"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    subscriber_name = Column(String, index=True, nullable=False)
    
    payload = Column(JSON, nullable=False) # EventEnvelope
    exception_message = Column(String, nullable=False)
    stacktrace = Column(String, nullable=True)
    
    attempts = Column(Integer, default=1)
    failed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    next_retry_at = Column(DateTime(timezone=True), nullable=True)
    
    operator_notes = Column(String, nullable=True)
