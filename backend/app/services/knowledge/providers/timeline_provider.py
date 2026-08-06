import uuid
from typing import Dict, Any, Optional, List
from app.services.knowledge.providers.base_provider import BaseKnowledgeProvider
from app.services.events.event_query_service import EventQueryService

class TimelineProvider(BaseKnowledgeProvider):
    def fetch(self, entity_id: uuid.UUID, entity_type: str = "Resource", **kwargs) -> Optional[List[Dict[str, Any]]]:
        service = EventQueryService(self.db)
        if entity_type == "Resource":
            events = service.get_resource_timeline(entity_id)
        elif entity_type == "Incident":
            # For incidents, we often want the causality chain of the trigger event
            # We'll just fetch events where aggregate_id = incident.id for now
            # The orchestrator will handle fetching causality via correlation_id if needed
            events = []
        else:
            return None
            
        return [
            {
                "id": str(e.id),
                "event_type": e.event_type,
                "occurred_at": e.occurred_at.isoformat(),
                "actor": e.actor,
                "payload": e.payload,
                "correlation_id": str(e.correlation_id) if e.correlation_id else None,
                "causation_id": str(e.causation_id) if e.causation_id else None
            } for e in events
        ]
        
    def fetch_causality_chain(self, correlation_id: uuid.UUID) -> List[Dict[str, Any]]:
        service = EventQueryService(self.db)
        events = service.get_causality_chain(correlation_id)
        return [
            {
                "id": str(e.id),
                "event_type": e.event_type,
                "occurred_at": e.occurred_at.isoformat(),
                "actor": e.actor,
                "payload": e.payload,
                "correlation_id": str(e.correlation_id) if e.correlation_id else None,
                "causation_id": str(e.causation_id) if e.causation_id else None
            } for e in events
        ]
