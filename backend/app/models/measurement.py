from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid

from app.models.base import Base

class Measurement(Base):
    """
    Time-series measurement data, separated from static/versioned Facts.
    Stored in Postgres for MVP, easily migrated to TimescaleDB or InfluxDB later.
    """
    __tablename__ = "measurements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, index=True, nullable=False)
    resource_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    
    # Categorization
    category = Column(String, index=True, nullable=False) # e.g., 'Performance', 'Environment', 'Network'
    metric = Column(String, index=True, nullable=False)   # e.g., 'cpu_usage', 'temperature', 'latency'
    
    value = Column(Float, nullable=False)
    unit = Column(String, nullable=True) # e.g., '%', 'C', 'ms'
    
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    collector_id = Column(String, nullable=False)
