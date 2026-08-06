import uuid
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models.platform_event import PlatformEvent
from app.services.events.taxonomy import PlatformEventType

class EventPublisher:
    """
    Responsible ONLY for writing domain events to the EventStore (PlatformEvent table).
    """
    def __init__(self, db: Session):
        self.db = db

    def publish(
        self,
        event_type: PlatformEventType,
        aggregate_type: str,
        aggregate_id: uuid.UUID,
        payload: Dict[str, Any],
        actor: str = "system",
        correlation_id: Optional[uuid.UUID] = None,
        causation_id: Optional[uuid.UUID] = None
    ) -> PlatformEvent:
        """
        Creates and persists an immutable PlatformEvent.
        """
        if correlation_id is None:
            # If no correlation chain exists, this event starts a new one
            correlation_id = uuid.uuid4()
            
        event = PlatformEvent(
            event_type=event_type.value,
            aggregate_type=aggregate_type,
            aggregate_id=aggregate_id,
            payload=payload,
            actor=actor,
            correlation_id=correlation_id,
            causation_id=causation_id
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        
        # After persisting, we would typically notify the dispatcher.
        # For this single-process MVP, we might call the dispatcher synchronously or fire-and-forget.
        # In a real distributed system, Postgres triggers an outbox which pushes to Kafka.
        from app.services.events.event_dispatcher import EventDispatcher
        EventDispatcher().dispatch(event, self.db)
        
        return event
