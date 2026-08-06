from typing import List
from sqlalchemy.orm import Session
import uuid
import datetime

from app.models.digital_twin import FactVersion
from app.models.events import OutboxEvent
from app.services.events.domain import FactUpdated, ResourceStateChanged
from app.services.events.envelope import EventEnvelope

class TwinPublisher:
    """
    Publishes domain events when the Digital Twin state changes.
    Instead of publishing directly, it inserts OutboxEvents into the same DB session
    to guarantee consistency. The EventDispatcher background worker picks them up.
    """
    def __init__(self, db: Session):
        self.db = db
        
    def _create_envelope(self, event_type: str, aggregate_id: str, tenant_id: str, event_version: int, payload: dict) -> dict:
        envelope = EventEnvelope(
            event_type=event_type,
            aggregate_id=aggregate_id,
            aggregate_type="Resource",
            tenant_id=tenant_id,
            event_version=event_version,
            payload=payload
        )
        return envelope.model_dump(mode="json")
        
    def emit_fact_updated(self, facts: List[FactVersion]):
        """
        Inserts FactUpdated OutboxEvents into the current transaction.
        """
        for fact in facts:
            event_payload = FactUpdated(
                fact_group_id=fact.fact_group_id,
                payload=fact.payload
            ).model_dump(mode="json")
            
            version = int(fact.version) if fact.version.isdigit() else 1
            envelope_dict = self._create_envelope(
                event_type="FactUpdated",
                aggregate_id=str(fact.resource_id),
                tenant_id=fact.tenant_id,
                event_version=version,
                payload=event_payload
            )
            
            outbox = OutboxEvent(
                aggregate_id=str(fact.resource_id),
                tenant_id=fact.tenant_id,
                status="PENDING",
                payload=envelope_dict
            )
            self.db.add(outbox)
            
    def emit_resource_state_changed(self, tenant_id: str, resource_id: str, old_state: str, new_state: str, version: int = 1):
        """
        Inserts ResourceStateChanged OutboxEvent into the current transaction.
        """
        event_payload = ResourceStateChanged(
            old_state=old_state,
            new_state=new_state
        ).model_dump(mode="json")
        
        envelope_dict = self._create_envelope(
            event_type="ResourceStateChanged",
            aggregate_id=resource_id,
            tenant_id=tenant_id,
            event_version=version,
            payload=event_payload
        )
        
        outbox = OutboxEvent(
            aggregate_id=resource_id,
            tenant_id=tenant_id,
            status="PENDING",
            payload=envelope_dict
        )
        self.db.add(outbox)
