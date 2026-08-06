import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.platform_event import PlatformEvent

class EventQueryService:
    """
    Answers: Give me every important event about Resource X between T1 and T2.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_resource_timeline(
        self, 
        resource_id: uuid.UUID, 
        start_time: Optional[datetime] = None, 
        end_time: Optional[datetime] = None,
        limit: int = 100
    ) -> List[PlatformEvent]:
        """Fetch chronological timeline for a specific resource."""
        query = self.db.query(PlatformEvent).filter(
            PlatformEvent.aggregate_id == resource_id,
            PlatformEvent.aggregate_type == "Resource"
        )
        
        if start_time:
            query = query.filter(PlatformEvent.occurred_at >= start_time)
        if end_time:
            query = query.filter(PlatformEvent.occurred_at <= end_time)
            
        return query.order_by(PlatformEvent.occurred_at.asc()).limit(limit).all()

    def get_causality_chain(self, correlation_id: uuid.UUID) -> List[PlatformEvent]:
        """Fetch all events participating in a specific causal chain."""
        return self.db.query(PlatformEvent).filter(
            PlatformEvent.correlation_id == correlation_id
        ).order_by(PlatformEvent.occurred_at.asc()).all()
