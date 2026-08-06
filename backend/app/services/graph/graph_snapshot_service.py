import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.resource import Resource, ResourceState

class GraphSnapshotService:
    """
    Reconstructs historical topology and states for a resource and its relationships.
    """
    def __init__(self, db: Session):
        self.db = db

    def snapshot(self, resource_id: uuid.UUID, timestamp: Optional[datetime] = None) -> Dict[str, Any]:
        """
        Return the state of the resource and its immediate graph at a specific point in time.
        If timestamp is None, returns the current snapshot.
        """
        if timestamp is None:
            timestamp = datetime.now(timezone.utc)
            
        # 1. Get the resource state active at that timestamp
        # MVP Implementation: Just get the latest state before the timestamp
        resource = self.db.query(Resource).filter(Resource.id == resource_id).first()
        if not resource:
            return {}
            
        state_query = self.db.query(ResourceState).filter(
            ResourceState.resource_id == resource_id,
            ResourceState.observed_at <= timestamp
        ).order_by(ResourceState.observed_at.desc()).first()
        
        attributes = state_query.attributes if state_query else {}
        
        # 2. Get the active relationships at that timestamp
        # In MVP, we might not have full temporal relationships modeled perfectly, 
        # so we will just mock the structure for Sprint 3.
        
        return {
            "resource_id": str(resource_id),
            "timestamp": timestamp.isoformat(),
            "attributes": attributes,
            "metadata": {
                "importance": resource.importance,
                "business_service": resource.business_service,
                "sla_tier": resource.sla_tier,
                "owner_team": resource.owner_team,
                "environment": resource.environment,
                "tags": resource.tags
            },
            "relationships": [] # To be expanded with RelationshipState querying
        }
