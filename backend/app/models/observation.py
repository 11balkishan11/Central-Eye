import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.models.base import Base

class Observation(Base):
    __tablename__ = "observations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    tenant_id = Column(String, index=True, nullable=False)
    
    collector_id = Column(String, nullable=False, index=True)
    resource_id = Column(String, nullable=True, index=True) # Optional: Can be null for discovery observations
    
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    
    # Standardized observation schema
    payload = Column(JSONB, nullable=False)
    
    # Evidence tracking instead of simple confidence
    evidence = Column(JSONB, nullable=False, default={})
    
    # Used to detect immutable tampering (e.g. hash of payload + collector secret)
    signature = Column(String, nullable=True)

    def __repr__(self):
        return f"<Observation {self.id} from {self.collector_id}>"
