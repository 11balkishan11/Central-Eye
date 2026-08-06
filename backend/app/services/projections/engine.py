from typing import Dict, Any, List
from sqlalchemy.orm import Session
import uuid
import datetime

from app.services.events.bus import DomainEventBus
from app.services.projections.registry import ProjectionRegistry
from app.services.projections.models import ProjectionContext, ProjectionHealth
from app.services.events.checkpoint_store import CheckpointStore
from app.models.events import DeadLetter
from app.models.events import StoredEvent
from app.services.live.broadcaster import presentation_bus

class ProjectionEngine:
    """
    Subscribes to Event Envelopes and routes them to registered Projection Handlers.
    Provides methods to force rebuilds of specific projections.
    Features Checkpointing and DLQ routing.
    """
    def __init__(self, event_bus: DomainEventBus, registry: ProjectionRegistry, db: Session):
        self.event_bus = event_bus
        self.registry = registry
        self.db = db
        self.checkpoint_store = CheckpointStore(db)
        
    def start(self):
        """
        Binds to the EventBus.
        """
        # Subscribe to all event types by wildcard for MVP
        self.event_bus.subscribe("*", self.handle_envelope)
        
    def handle_envelope(self, envelope: dict):
        """
        Routes the envelope to all handlers that implement a handler for it.
        """
        event_type = envelope.get("event_type", "")
        handler_method_name = f"handle_{event_type.lower()}"
        
        # Hydrate a fake event object for compatibility with old handlers
        # In a real system, we'd deserialize properly
        class FakeEvent:
            def __init__(self, d):
                self.__dict__.update(d)
        
        event_payload = envelope.get("payload", {})
        event_payload["event_id"] = envelope.get("event_id")
        event_payload["tenant_id"] = envelope.get("tenant_id")
        event_payload["version"] = envelope.get("event_version", 1)
        event_payload["resource_id"] = envelope.get("aggregate_id")
        event = FakeEvent(event_payload)
        
        context = ProjectionContext(
            event_id=uuid.UUID(envelope.get("event_id")) if envelope.get("event_id") else uuid.uuid4(),
            tenant_id=envelope.get("tenant_id", "default"),
            correlation_id=envelope.get("correlation_id"),
            rebuild_reason="incremental_update"
        )
        
        for handler in self.registry.get_all_handlers():
            if hasattr(handler, handler_method_name):
                method = getattr(handler, handler_method_name)
                try:
                    # Execute the update
                    method(event, context, self.db)
                    self.db.commit()
                    
                    # 4. Notify Presentation Bus
                    presentation_bus.publish({
                        "type": "ProjectionUpdated",
                        "projection": type(handler).__name__,
                        "tenant_id": context.tenant_id,
                        "event_type": event_type,
                        "event_data": envelope
                    })
                    
                    # Update Checkpoint
                    self.checkpoint_store.update_checkpoint(
                        subscriber_name=handler.projection_name,
                        tenant_id=context.tenant_id,
                        event_id=context.event_id,
                        event_created_at=datetime.datetime.now(datetime.timezone.utc)
                    )
                except Exception as e:
                    self.db.rollback()
                    print(f"Error updating projection {handler.projection_name}: {e}")
                    # Route to DLQ
                    dlq = DeadLetter(
                        event_id=context.event_id,
                        subscriber_name=handler.projection_name,
                        payload=envelope,
                        exception_message=str(e),
                        stacktrace=None # we could use traceback format_exc here
                    )
                    self.db.add(dlq)
                    self.db.commit()
                    
    def rebuild(self, projection_name: str, tenant_id: str):
        """
        Forces a full rebuild of a specific projection.
        """
        handler = self.registry.get_handler_by_name(projection_name)
        
        context = ProjectionContext(
            tenant_id=tenant_id,
            rebuild_reason="manual_rebuild"
        )
        
        if hasattr(handler, "rebuild"):
            handler.rebuild(context, self.db)
            
    def get_health(self) -> List[ProjectionHealth]:
        """
        Retrieves health metrics for all active projections.
        """
        return [
            ProjectionHealth(projection_name=h.projection_name)
            for h in self.registry.get_all_handlers()
        ]
