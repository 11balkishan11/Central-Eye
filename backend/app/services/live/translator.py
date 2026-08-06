from typing import Any, Dict, Optional
import uuid
import datetime

from app.services.live.protocol import PresentationEventV1, DeviceUpdatedV1
from app.services.projections.models import ProjectionContext
from app.models.projections import InventoryProjectionModel
from sqlalchemy.orm import Session

class PresentationTranslator:
    """
    Translates Projection State into UI-stable Presentation Contracts.
    """
    def __init__(self, db: Session):
        self.db = db
        
    def translate(self, internal_event: Dict[str, Any]) -> Optional[PresentationEventV1]:
        """
        Takes a 'ProjectionUpdated' event from PresentationBus and maps to Presentation Contracts.
        """
        projection = internal_event.get("projection")
        tenant_id = internal_event.get("tenant_id")
        event_data = internal_event.get("event_data", {})
        
        # 1. Map Inventory updates to DeviceUpdatedV1
        if projection == "InventoryProjectionBuilder":
            resource_id = event_data.get("aggregate_id") or event_data.get("payload", {}).get("resource_id")
            if not resource_id:
                return None
                
            # Hydrate from Read Model
            model = self.db.query(InventoryProjectionModel).filter(
                InventoryProjectionModel.resource_id == resource_id,
                InventoryProjectionModel.tenant_id == tenant_id
            ).first()
            
            if not model:
                return None # Might have been deleted, could emit DeviceRemoved
                
            payload = DeviceUpdatedV1(
                resource_id=model.resource_id,
                name=model.hostname or "unknown",
                vendor=model.vendor or "unknown",
                model=model.model or "unknown",
                status=model.state,
                ip=model.ip_address or "unknown",
                health="ok", # Mocked for now
                capabilities=model.capabilities or []
            )
            
            return PresentationEventV1(
                event_id=str(uuid.uuid4()),
                event_type="DeviceUpdatedV1",
                tenant_id=tenant_id,
                timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                payload=payload
            )
            
        # Other projections handled similarly...
        return None
