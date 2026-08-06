from sqlalchemy.orm import Session
from datetime import datetime, timezone

from typing import Any
from app.services.projections.registry import ProjectionHandler
from app.services.projections.models import ProjectionContext
from app.models.projections import TopologyProjectionModel

class TopologyProjectionBuilder(ProjectionHandler):
    """
    Maintains the pre-computed Topology graph for the UI.
    Subscribes to FactUpdated (to update Node metadata) and RelationshipAdded (to add Links).
    """
    
    def handle_relationshipadded(self, event: Any, context: ProjectionContext, db: Session):
        # We assume a single master topology for MVP
        topology_id = "master_topology"
        
        model = db.query(TopologyProjectionModel).filter(
            TopologyProjectionModel.topology_id == topology_id
        ).first()
        
        if not model:
            model = TopologyProjectionModel(
                topology_id=topology_id,
                tenant_id=event.tenant_id,
                nodes=[],
                links=[],
                last_event_version=0
            )
            db.add(model)
            
        if event.version <= model.last_event_version and context.rebuild_reason != "manual_rebuild":
            return
            
        # Add nodes if they don't exist
        existing_nodes = {n["id"] for n in model.nodes}
        if event.source_resource_id not in existing_nodes:
            model.nodes.append({"id": event.source_resource_id, "label": event.source_resource_id})
        if event.target_resource_id not in existing_nodes:
            model.nodes.append({"id": event.target_resource_id, "label": event.target_resource_id})
            
        # Add link
        new_link = {
            "source": event.source_resource_id,
            "target": event.target_resource_id,
            "type": event.relationship_type
        }
        
        # Prevent duplicates
        if not any(l["source"] == new_link["source"] and l["target"] == new_link["target"] for l in model.links):
            model.links.append(new_link)
            
        # Due to SQLAlchemy JSON tracking, we must force the update
        model.nodes = list(model.nodes)
        model.links = list(model.links)
            
        model.last_event_version = event.version
        model.last_updated = datetime.now(timezone.utc)
        db.commit()

    def handle_factupdated(self, event: Any, context: ProjectionContext, db: Session):
        topology_id = "master_topology"
        model = db.query(TopologyProjectionModel).filter(
            TopologyProjectionModel.topology_id == topology_id
        ).first()
        
        if not model or event.version <= model.last_event_version:
            return
            
        # Update node metadata (e.g. hostname)
        if event.fact_group_id == "hostname" and "hostname" in event.payload:
            for node in model.nodes:
                if node["id"] == event.resource_id:
                    node["label"] = event.payload["hostname"]
                    
            model.nodes = list(model.nodes)
            model.last_event_version = event.version
            model.last_updated = datetime.now(timezone.utc)
            db.commit()
            
    def rebuild(self, context: ProjectionContext, db: Session):
        pass
