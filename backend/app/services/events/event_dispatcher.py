from sqlalchemy.orm import Session
from app.models.platform_event import PlatformEvent

class EventDispatcher:
    """
    Responsible ONLY for reading persisted events and routing them to handlers.
    (e.g., Correlation Engine, Auditing, Webhooks).
    """
    
    def dispatch(self, event: PlatformEvent, db: Session):
        """
        Routes the event to interested subscribers.
        For MVP, we just manually invoke the EventFilter for the Correlation pipeline.
        """
        # In a real system, this would be an async task queue or Kafka consumer.
        from app.services.correlation.event_filter import EventFilter
        
        filter_service = EventFilter(db)
        filter_service.process(event)
