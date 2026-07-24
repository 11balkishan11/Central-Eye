import uuid
from datetime import datetime
from typing import Optional, Dict, Any

from sqlalchemy import String, Integer, DateTime, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base

class OutboxEvent(Base):
    """
    Transactional Outbox pattern implementation.
    Events are inserted here synchronously in the same transaction as the domain changes.
    A background worker will read from this table and publish to Redis/Kafka.
    """
    __tablename__ = "outbox_events"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    event_type: Mapped[str] = mapped_column(String, index=True)
    aggregate: Mapped[str] = mapped_column(String, index=True)
    aggregate_id: Mapped[uuid.UUID] = mapped_column(index=True)
    tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(index=True)
    
    payload: Mapped[Dict[str, Any]] = mapped_column(JSONB)
    actor: Mapped[Optional[uuid.UUID]] = mapped_column()
    version: Mapped[int] = mapped_column(Integer, default=1)
    
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    
    # State tracking for the outbox publisher
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), default=None)
    error_message: Mapped[Optional[str]] = mapped_column(String, default=None)
    retries: Mapped[int] = mapped_column(Integer, default=0)

    __table_args__ = (
        Index("ix_outbox_events_unpublished", "occurred_at", postgresql_where="published_at IS NULL"),
    )
