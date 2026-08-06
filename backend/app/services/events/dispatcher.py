import asyncio
import uuid
from app.database import SessionLocal
from app.services.workers.manager import BaseWorker
from app.models.events import OutboxEvent, StoredEvent
from app.services.events.bus import DomainEventBus

class EventDispatcherWorker(BaseWorker):
    """
    Polls the OutboxEvent table using FOR UPDATE SKIP LOCKED.
    Moves events from PENDING -> PROCESSING -> PUBLISHED.
    Copies events to the immutable StoredEvent log.
    Routes events to the DomainEventBus for in-memory dispatch to subscriber queues.
    """
    def __init__(self, event_bus: DomainEventBus, poll_interval_sec: float = 0.5, batch_size: int = 50):
        self.event_bus = event_bus
        self.poll_interval_sec = poll_interval_sec
        self.batch_size = batch_size
        
    @property
    def name(self) -> str:
        return "EventDispatcherWorker"
        
    async def run(self):
        while True:
            try:
                self._process_batch()
            except Exception as e:
                print(f"Error in {self.name}: {e}")
            await asyncio.sleep(self.poll_interval_sec)
            
    def _process_batch(self):
        # We need a new session per batch since this is a background loop
        with SessionLocal() as db:
            # PostgreSQL specific polling: FOR UPDATE SKIP LOCKED
            # This safely allows multiple dispatcher instances to run without locking each other
            pending_events = db.query(OutboxEvent).filter(
                OutboxEvent.status == "PENDING"
            ).order_by(
                OutboxEvent.created_at.asc()
            ).limit(self.batch_size).with_for_update(skip_locked=True).all()
            
            if not pending_events:
                return
                
            for outbox in pending_events:
                outbox.status = "PROCESSING"
            db.commit()
            
            for outbox in pending_events:
                try:
                    # Parse Envelope
                    payload = outbox.payload
                    
                    # 1. Store in immutable log
                    stored = StoredEvent(
                        event_id=uuid.UUID(payload.get("event_id")),
                        aggregate_id=outbox.aggregate_id,
                        tenant_id=outbox.tenant_id,
                        event_type=payload.get("event_type"),
                        event_version=payload.get("event_version", 1),
                        payload=payload.get("payload", {}),
                        metadata_json=payload.get("metadata", {})
                    )
                    db.add(stored)
                    
                    # 2. Dispatch to memory bus for active subscribers
                    # In a real system, DomainEvent needs to be constructed back from the payload
                    # For MVP, we'll just push the raw envelope dict, or a generic DomainEvent
                    # (In Python MVP, we can just pass the payload dict to subscribers if they expect it)
                    self.event_bus.publish(payload) 
                    
                    # 3. Mark as published
                    outbox.status = "PUBLISHED"
                    
                except Exception as e:
                    print(f"Failed to process outbox event {outbox.id}: {e}")
                    # In a robust system, maybe mark as FAILED or retry later
                    # For MVP, we keep it PROCESSING and let it timeout or investigate
                    pass
                    
            db.commit()
