from sqlalchemy.orm import Session
from app.models.platform_event import PlatformEvent
from app.models.incident import Incident

class CorrelationRules:
    """
    Declarative engine deciding if an event belongs to an incident.
    """
    def __init__(self, db: Session):
        self.db = db
        # In a real system, these would be loaded from DB or YAML configuration
        self.rules = [
            {
                "name": "Same Resource within 1 hour",
                "same_resource": True,
                "time_window_minutes": 60,
                "action": "MERGE"
            },
            {
                "name": "Neighbor Resource within 5 mins",
                "dependency_distance": 1,
                "time_window_minutes": 5,
                "action": "MERGE"
            }
        ]

    def evaluate(self, event: PlatformEvent, incident: Incident) -> str:
        """
        Evaluate rules against the event and incident.
        Returns 'MERGE', 'IGNORE', or 'NEW' (implicit).
        """
        # MVP: Hardcode simple logic representing the declarative rules
        
        # Rule 1: Same Resource
        if event.aggregate_type == "Resource":
            # Check if this resource is already in the incident's affected resources
            affected_ids = [str(r.id) for r in incident.affected_resources]
            if str(event.aggregate_id) in affected_ids:
                # Check time window (simplistic)
                time_diff = event.occurred_at - incident.created_at
                if time_diff.total_seconds() < 3600:
                    return "MERGE"
                    
        return "NEW"
