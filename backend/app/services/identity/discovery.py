import uuid
from sqlalchemy.orm import Session
from app.models.resource import Resource

class DiscoveryEngine:
    """
    Handles resources that failed Identity Resolution (meaning they are unknown).
    Seeds the Digital Twin with a new Resource in the 'NEW' or 'DISCOVERED' state.
    """
    def __init__(self, db: Session):
        self.db = db
        
    def discover(self, tenant_id: str, payload_hints: dict) -> str:
        """
        Creates a new resource and returns its ID.
        """
        new_resource_id = str(uuid.uuid4())
        
        # In MVP, we might just create a stub Resource record.
        # In reality, this would emit an event, or directly create the Resource record 
        # with state = DISCOVERED.
        resource = Resource(
            id=new_resource_id,
            tenant_id=tenant_id,
            name=payload_hints.get("hostname", f"Unknown Device ({payload_hints.get('ip_address', 'No IP')})"),
            type="Device", # Basic default
            # state=ResourceLifecycleState.DISCOVERED.value # if we add this column to Resource
        )
        self.db.add(resource)
        self.db.commit()
        
        return new_resource_id
