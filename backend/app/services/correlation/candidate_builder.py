from sqlalchemy.orm import Session
from datetime import timedelta
from app.models.platform_event import PlatformEvent
from app.models.incident import Incident

class CandidateBuilder:
    """
    Groups nearby events by resource, dependency, topology, or time to form correlation candidates.
    """
    def __init__(self, db: Session):
        self.db = db

    def build_candidates(self, trigger_event: PlatformEvent):
        """
        Identify active incidents that this event might belong to.
        """
        # Find all incidents currently open or investigating
        active_incidents = self.db.query(Incident).filter(
            Incident.status.in_(["OPEN", "ACKNOWLEDGED", "INVESTIGATING"])
        ).all()
        
        candidates = []
        for incident in active_incidents:
            # We would normally query if the incident's affected resources overlap with this event's resource
            # For MVP, we just consider all active incidents as candidates
            candidates.append(incident)
            
        from app.services.correlation.correlation_rules import CorrelationRules
        rules_engine = CorrelationRules(self.db)
        
        merged = False
        for candidate in candidates:
            decision = rules_engine.evaluate(trigger_event, candidate)
            if decision == "MERGE":
                from app.services.correlation.incident_aggregator import IncidentAggregator
                IncidentAggregator(self.db).merge_event_into_incident(trigger_event, candidate)
                merged = True
                break
                
        if not merged:
            # If no merge happened, create a new incident if this is a FindingOpened
            from app.services.events.taxonomy import PlatformEventType
            if trigger_event.event_type == PlatformEventType.FINDING_OPENED.value:
                from app.services.correlation.incident_aggregator import IncidentAggregator
                IncidentAggregator(self.db).create_new_incident(trigger_event)
