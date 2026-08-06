import uuid
from sqlalchemy.orm import Session
from app.models.platform_event import PlatformEvent
from app.models.incident import Incident
from app.models.finding import Finding
from app.models.resource import Resource
from app.services.events.event_publisher import EventPublisher
from app.services.events.taxonomy import PlatformEventType

class IncidentAggregator:
    """
    Produces and updates the rich Incident entity.
    """
    def __init__(self, db: Session):
        self.db = db
        self.publisher = EventPublisher(db)

    def create_new_incident(self, trigger_event: PlatformEvent) -> Incident:
        """Create a new incident based on a trigger event (e.g. FindingOpened)."""
        incident = Incident(
            severity="HIGH", # Would be calculated via ContextAssembler -> BlastRadius
            priority="P2",
            root_cause_resource_id=trigger_event.aggregate_id if trigger_event.aggregate_type == "Resource" else None
        )
        self.db.add(incident)
        self.db.flush()
        
        # Link resource if applicable
        if trigger_event.aggregate_type == "Resource":
            res = self.db.query(Resource).filter(Resource.id == trigger_event.aggregate_id).first()
            if res:
                incident.affected_resources.append(res)
                
        # If payload contains finding_id, link finding
        finding_id = trigger_event.payload.get("finding_id")
        if finding_id:
            finding = self.db.query(Finding).filter(Finding.id == uuid.UUID(finding_id)).first()
            if finding:
                incident.supporting_findings.append(finding)
                
        self.db.commit()
        
        # Publish IncidentOpened event, using the trigger's correlation_id to maintain the chain
        self.publisher.publish(
            PlatformEventType.INCIDENT_OPENED,
            "Incident",
            incident.id,
            {"reason": "New finding triggered incident"},
            correlation_id=trigger_event.correlation_id,
            causation_id=trigger_event.id
        )
        
        return incident
        
    def merge_event_into_incident(self, event: PlatformEvent, incident: Incident):
        """Update an existing incident with a new event."""
        # E.g., link new findings, re-evaluate severity, update affected resources
        finding_id = event.payload.get("finding_id")
        if finding_id:
            finding = self.db.query(Finding).filter(Finding.id == uuid.UUID(finding_id)).first()
            if finding and finding not in incident.supporting_findings:
                incident.supporting_findings.append(finding)
                
        self.db.commit()
        
        self.publisher.publish(
            PlatformEventType.INCIDENT_MERGED,
            "Incident",
            incident.id,
            {"merged_event_id": str(event.id)},
            correlation_id=event.correlation_id,
            causation_id=event.id
        )
