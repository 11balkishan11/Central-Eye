from typing import Any, Callable, Dict, List, Optional
import datetime
import uuid
import logging
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

class DomainEvent(BaseModel):
    """
    Standardized base class for all domain events.
    """
    event_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    event_type: str
    aggregate: str
    aggregate_id: uuid.UUID
    tenant_id: Optional[uuid.UUID] = None
    occurred_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    actor: Optional[uuid.UUID] = None
    payload: Dict[str, Any]
    version: int = 1

class DomainEventBus:
    """
    A lightweight, in-memory domain event bus for Phase 6.
    Allows decoupling domain logic from side-effects (e.g. Audit, Notification).
    Future phases can replace this with Redis Streams, Kafka, or RabbitMQ.
    """
    def __init__(self):
        self._subscribers: Dict[str, List[Callable[[DomainEvent], None]]] = {}

    def subscribe(self, event_type: str, handler: Callable[[DomainEvent], None]) -> None:
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(handler)

    def publish(self, event: DomainEvent) -> None:
        """
        Publishes the event synchronously.
        For production at scale, this should dispatch to a background worker or external broker.
        """
        logger.info(f"Published DomainEvent: {event.event_type} - {event.event_id}")
        handlers = self._subscribers.get(event.event_type, [])
        for handler in handlers:
            try:
                handler(event)
            except Exception as e:
                logger.error(f"Error handling event {event.event_type} by {handler}: {e}")

# Global instance for simplicity in Phase 6
event_bus = DomainEventBus()
