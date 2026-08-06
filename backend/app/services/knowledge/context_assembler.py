import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.services.knowledge.models import InfrastructureKnowledge, KnowledgeQueryProfile
from app.services.knowledge.providers.incident_provider import IncidentProvider
from app.services.knowledge.providers.graph_provider import GraphProvider
from app.services.knowledge.providers.timeline_provider import TimelineProvider
# We would have other providers like FactProvider, PolicyProvider, etc.

class ContextAssembler:
    """
    Assembles InfrastructureKnowledge DTOs from individual providers.
    Uses KnowledgeQueryProfile to determine which providers to load, saving tokens.
    """
    def __init__(self, db: Session):
        self.db = db
        self.incident_provider = IncidentProvider(db)
        self.graph_provider = GraphProvider(db)
        self.timeline_provider = TimelineProvider(db)

    def assemble(self, entity_id: uuid.UUID, entity_type: str, profile: KnowledgeQueryProfile) -> InfrastructureKnowledge:
        # Base setup
        incident_data = None
        resource_data = None
        topology = None
        blast_radius = None
        timeline = None
        
        if entity_type == "Incident":
            incident_data = self.incident_provider.fetch(entity_id, "Incident")
            if not incident_data:
                raise ValueError("Incident not found")
                
            # Usually incidents revolve around a root cause resource
            root_res_id = incident_data.get("root_cause_resource_id")
            if root_res_id:
                root_res_id = uuid.UUID(root_res_id)
        elif entity_type == "Resource":
            root_res_id = entity_id
            # resource_data = self.resource_provider.fetch(...)
        else:
            raise ValueError(f"Unsupported entity type: {entity_type}")

        # Slice data based on profile
        if profile in (KnowledgeQueryProfile.ROOT_CAUSE, KnowledgeQueryProfile.EXEC_SUMMARY, KnowledgeQueryProfile.FULL):
            if root_res_id:
                blast_radius = self.graph_provider.fetch_blast_radius(root_res_id)
                # Fetch causality chain if we have an incident
                # We would normally find the correlation_id of the INCIDENT_OPENED event
                # For MVP, we'll fetch timeline of root resource
                timeline = self.timeline_provider.fetch(root_res_id, "Resource")
                
        if profile in (KnowledgeQueryProfile.TOPOLOGY, KnowledgeQueryProfile.FULL):
            if root_res_id:
                topology = self.graph_provider.fetch(root_res_id, "Resource")
                
        return InfrastructureKnowledge(
            snapshot_timestamp=datetime.now(timezone.utc),
            incident=incident_data,
            resource=resource_data,
            topology=topology,
            blast_radius=blast_radius,
            timeline=timeline
        )
