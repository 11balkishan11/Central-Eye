from sqlalchemy.orm import Session
from app.models.platform_event import PlatformEvent
from app.services.events.taxonomy import PlatformEventType

class EventFilter:
    """
    Intercepts domain events and decides which ones should trigger Correlation.
    """
    def __init__(self, db: Session):
        self.db = db

    def process(self, event: PlatformEvent):
        """
        Only pass relevant events to the Candidate Builder.
        """
        # We only correlate topology changes, findings, or critical metric events
        relevant_types = {
            PlatformEventType.FINDING_OPENED.value,
            PlatformEventType.FINDING_RESOLVED.value,
            PlatformEventType.RESOURCE_STATE_CHANGED.value,
            PlatformEventType.RELATIONSHIP_CREATED.value,
            PlatformEventType.RELATIONSHIP_REMOVED.value
        }
        
        if event.event_type in relevant_types:
            from app.services.correlation.candidate_builder import CandidateBuilder
            CandidateBuilder(self.db).build_candidates(event)
