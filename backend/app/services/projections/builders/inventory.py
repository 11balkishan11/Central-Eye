from sqlalchemy.orm import Session
from datetime import datetime, timezone

from typing import Any
from app.services.projections.registry import ProjectionHandler
from app.services.projections.models import ProjectionContext
from app.models.projections import InventoryProjectionModel

class InventoryProjectionBuilder(ProjectionHandler):
    """
    Maintains the InventoryProjectionModel.
    Subscribes to FactUpdated and ResourceStateChanged.
    """
    
    def handle_factupdated(self, event: Any, context: ProjectionContext, db: Session):
        """
        Updates the flattened inventory row when a relevant fact changes.
        """
        model = db.query(InventoryProjectionModel).filter(
            InventoryProjectionModel.resource_id == event.resource_id
        ).first()
        
        if not model:
            # Create if it doesn't exist (e.g. out of order events)
            model = InventoryProjectionModel(
                resource_id=event.resource_id,
                tenant_id=event.tenant_id,
                last_event_version=0
            )
            db.add(model)
            
        # Idempotency Check
        if event.version <= model.last_event_version and context.rebuild_reason != "manual_rebuild":
            return # Ignore old events
            
        # Map fact to column
        if event.fact_group_id == "hostname" and "hostname" in event.payload:
            model.hostname = event.payload["hostname"]
        elif event.fact_group_id == "ip_address" and "ip_address" in event.payload:
            model.ip_address = event.payload["ip_address"]
        elif event.fact_group_id == "mac_address" and "mac_address" in event.payload:
            model.mac_address = event.payload["mac_address"]
        elif event.fact_group_id == "vendor" and "vendor" in event.payload:
            model.vendor = event.payload["vendor"]
        elif event.fact_group_id == "model" and "model" in event.payload:
            model.model = event.payload["model"]
        elif event.fact_group_id == "capabilities" and "capabilities" in event.payload:
            model.capabilities = event.payload["capabilities"]
            
        model.last_event_version = event.version
        model.last_updated = datetime.now(timezone.utc)
        db.commit()

    def handle_resourcestatechanged(self, event: Any, context: ProjectionContext, db: Session):
        model = db.query(InventoryProjectionModel).filter(
            InventoryProjectionModel.resource_id == event.resource_id
        ).first()
        
        if not model:
            model = InventoryProjectionModel(
                resource_id=event.resource_id,
                tenant_id=event.tenant_id,
                last_event_version=0
            )
            db.add(model)
            
        if event.version <= model.last_event_version and context.rebuild_reason != "manual_rebuild":
            return
            
        model.state = event.new_state
        model.last_event_version = event.version
        model.last_updated = datetime.now(timezone.utc)
        db.commit()
        
    def rebuild(self, context: ProjectionContext, db: Session):
        # MVP: In a real system, this truncates the table and queries the entire 
        # DigitalTwin current state to re-populate it.
        pass
