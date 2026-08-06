import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.incident import Incident
from app.services.events.event_publisher import EventPublisher
from app.services.events.taxonomy import PlatformEventType

class IncidentLifecycleManager:
    """
    Absolute authority on Incident state transitions.
    """
    def __init__(self, db: Session):
        self.db = db
        self.publisher = EventPublisher(db)

    def transition(self, incident_id: uuid.UUID, new_status: str, actor: str = "system") -> Incident:
        """
        Transitions incident state and emits lifecycle events.
        """
        valid_statuses = {"OPEN", "ACKNOWLEDGED", "INVESTIGATING", "RESOLVED", "CLOSED"}
        if new_status not in valid_statuses:
            raise ValueError(f"Invalid status {new_status}")
            
        incident = self.db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            raise ValueError("Incident not found")
            
        old_status = incident.status
        if old_status == new_status:
            return incident
            
        incident.status = new_status
        if new_status in ("RESOLVED", "CLOSED"):
            incident.resolved_at = datetime.now(timezone.utc)
            
        self.db.commit()
        
        event_type = PlatformEventType.INCIDENT_RESOLVED if new_status == "RESOLVED" else PlatformEventType.INCIDENT_CLOSED
        
        self.publisher.publish(
            event_type,
            "Incident",
            incident.id,
            {"old_status": old_status, "new_status": new_status},
            actor=actor
        )
        
        return incident
