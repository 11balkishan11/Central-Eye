import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base

def utc_now():
    return datetime.now(timezone.utc)

class PlatformEvent(Base):
    """
    Immutable domain event emitted by any platform service.
    """
    __tablename__ = "platform_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type: Mapped[str] = mapped_column(String, index=True) # From Taxonomy
    
    # What was affected
    aggregate_type: Mapped[str] = mapped_column(String, index=True) # e.g. "Resource", "Incident"
    aggregate_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)
    
    # When and by whom
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)
    actor: Mapped[str] = mapped_column(String, default="system")
    
    # Traceability
    correlation_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)
    causation_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=True)
    
    # Context
    payload: Mapped[dict] = mapped_column(JSONB, default=dict)

    __table_args__ = (
        Index("ix_platform_events_type_time", "event_type", "occurred_at"),
    )
