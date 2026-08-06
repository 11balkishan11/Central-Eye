from abc import ABC, abstractmethod
from typing import List
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone

from app.services.collectors.envelope import ObservationEnvelope
from app.models.base import Base

class ObservationQueueModel(Base):
    """
    PostgreSQL table backing the PostgresBus implementation.
    """
    __tablename__ = "observation_queue"
    
    id = Column(UUID(as_uuid=True), primary_key=True)
    tenant_id = Column(String, index=True, nullable=False)
    priority = Column(Integer, default=100, index=True)
    status = Column(String, default="QUEUED", index=True) # QUEUED, PROCESSING, FAILED, COMPLETED
    payload = Column(JSONB, nullable=False) # Stores the serialized envelope
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class ObservationBus(ABC):
    @abstractmethod
    def publish(self, envelope: ObservationEnvelope) -> bool:
        pass
        
    @abstractmethod
    def consume(self, batch_size: int = 10) -> List[ObservationEnvelope]:
        pass
        
    @abstractmethod
    def ack(self, envelope_id: uuid.UUID):
        pass

class PostgresBus(ObservationBus):
    """
    MVP Postgres-backed observation queue. 
    Separate from JobQueue. Used specifically for high-throughput buffering of observations.
    """
    def __init__(self, db: Session):
        self.db = db
        
    def publish(self, envelope: ObservationEnvelope) -> bool:
        db_obj = ObservationQueueModel(
            id=envelope.id,
            tenant_id=envelope.tenant_id,
            priority=envelope.priority,
            payload=envelope.dict()
        )
        self.db.add(db_obj)
        self.db.commit()
        return True
        
    def consume(self, batch_size: int = 10) -> List[ObservationEnvelope]:
        # MVP: Simple pull, normally we'd use SELECT FOR UPDATE SKIP LOCKED
        # for concurrent workers.
        items = self.db.query(ObservationQueueModel).filter(
            ObservationQueueModel.status == "QUEUED"
        ).order_by(ObservationQueueModel.priority.asc(), ObservationQueueModel.created_at.asc()).limit(batch_size).all()
        
        envelopes = []
        for item in items:
            item.status = "PROCESSING"
            envelopes.append(ObservationEnvelope(**item.payload))
            
        if items:
            self.db.commit()
            
        return envelopes
        
    def ack(self, envelope_id: uuid.UUID):
        item = self.db.query(ObservationQueueModel).filter(ObservationQueueModel.id == envelope_id).first()
        if item:
            item.status = "COMPLETED"
            self.db.commit()
