import uuid
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.orm import Session

from app.models.resource import Resource
from app.services.graph.graph_query_service import GraphQueryService
from app.services.graph.graph_snapshot_service import GraphSnapshotService
from app.services.events.event_query_service import EventQueryService
from app.services.graph.dependency_engine import DependencyEngine

class InfrastructureContext(BaseModel):
    """
    The frozen, unified context object provided to Engines, Correlation, AI, and Simulations.
    """
    resource: Optional[Resource]
    facts: List[Any] = Field(default_factory=list)
    graph_neighbors: List[Resource] = Field(default_factory=list)
    upstream_dependencies: List[Resource] = Field(default_factory=list)
    downstream_dependencies: List[Resource] = Field(default_factory=list)
    dependency_tree: Dict[str, Any] = Field(default_factory=dict)
    graph_snapshot: Dict[str, Any] = Field(default_factory=dict)
    recent_history: List[Dict[str, Any]] = Field(default_factory=list)
    active_findings: List[Dict[str, Any]] = Field(default_factory=list)
    policies: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timeline: List[Dict[str, Any]] = Field(default_factory=list)
    
    model_config = ConfigDict(arbitrary_types_allowed=True)


class ContextAssembler:
    """
    Orchestrates the assembly of InfrastructureContext without knowing the caller's identity.
    """
    def __init__(self, db: Session):
        self.db = db
        self.gqs = GraphQueryService(db)
        self.snapshot_service = GraphSnapshotService(db)
        self.event_service = EventQueryService(db)
        self.dependency_engine = DependencyEngine(db)

    def build(self, resource_id: uuid.UUID) -> InfrastructureContext:
        """
        Gathers context from all sub-providers.
        """
        resource = self.db.query(Resource).filter(Resource.id == resource_id).first()
        if not resource:
            return InfrastructureContext(resource=None)
            
        # Graph Providers
        neighbors = self.gqs.neighbors(resource_id)
        upstream = self.gqs.upstream(resource_id)
        downstream = self.gqs.downstream(resource_id)
        tree = self.dependency_engine.build_dependency_tree(resource_id)
        
        # History & Timelines
        snapshot = self.snapshot_service.snapshot(resource_id)
        timeline = self.event_service.get_resource_timeline(resource_id, limit=20)
        
        # Metadata
        metadata = {
            "importance": resource.importance,
            "business_service": resource.business_service,
            "sla_tier": resource.sla_tier,
            "owner_team": resource.owner_team,
            "environment": resource.environment,
            "tags": resource.tags
        }
        
        # Convert timeline to dicts for MVP
        timeline_dicts = [
            {
                "event_type": t.event_type,
                "occurred_at": t.occurred_at.isoformat(),
                "actor": t.actor
            } for t in timeline
        ]
        
        return InfrastructureContext(
            resource=resource,
            facts=[], # To be loaded via FactProvider
            graph_neighbors=neighbors,
            upstream_dependencies=upstream,
            downstream_dependencies=downstream,
            dependency_tree=tree,
            graph_snapshot=snapshot,
            recent_history=[],
            active_findings=[], # To be loaded via FindingProvider
            policies=[], # To be loaded via PolicyProvider
            metadata=metadata,
            timeline=timeline_dicts
        )
