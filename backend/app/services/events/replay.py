from sqlalchemy.orm import Session
from sqlalchemy import asc
from typing import Optional, List
import uuid
from datetime import datetime

from app.models.events import StoredEvent
from app.services.events.bus import DomainEventBus

class ReplayEngine:
    """
    Reads historical events from the StoredEvent log and dispatches them.
    Can target specific tenants, aggregates, or time ranges.
    """
    def __init__(self, db: Session, event_bus: DomainEventBus):
        self.db = db
        self.event_bus = event_bus
        
    def replay(self, 
               tenant_id: Optional[str] = None, 
               aggregate_id: Optional[str] = None,
               from_time: Optional[datetime] = None,
               to_time: Optional[datetime] = None):
        """
        Replays matching events through the event bus.
        Subscribers should handle these idempotently using version checks.
        """
        query = self.db.query(StoredEvent)
        
        if tenant_id:
            query = query.filter(StoredEvent.tenant_id == tenant_id)
        if aggregate_id:
            query = query.filter(StoredEvent.aggregate_id == aggregate_id)
        if from_time:
            query = query.filter(StoredEvent.created_at >= from_time)
        if to_time:
            query = query.filter(StoredEvent.created_at <= to_time)
            
        events = query.order_by(asc(StoredEvent.created_at)).all()
        
        replayed_count = 0
        for stored in events:
            # Reconstruct envelope from stored event
            envelope = {
                "event_id": str(stored.event_id),
                "aggregate_id": stored.aggregate_id,
                "tenant_id": stored.tenant_id,
                "event_type": stored.event_type,
                "event_version": stored.event_version,
                "payload": stored.payload,
                "metadata": stored.metadata_json,
                "is_replay": True # special flag for subscribers if they care
            }
            
            self.event_bus.publish(envelope)
            replayed_count += 1
            
        return replayed_count
