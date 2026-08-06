import uuid
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.resource import Resource
from app.services.graph.graph_query_service import GraphQueryService

class DependencyEngine:
    """
    Answers: What depends on this?
    Constructs the structural dependency tree using GraphQueryService.
    """
    def __init__(self, db: Session):
        self.gqs = GraphQueryService(db)

    def build_dependency_tree(self, resource_id: uuid.UUID) -> Dict[str, Any]:
        """
        Builds a hierarchical tree of downstream dependencies.
        """
        downstream = self.gqs.downstream(resource_id)
        
        # MVP: A flat list representation of the dependency structural footprint
        # A full implementation would construct the actual nested tree using adjacency lists
        
        return {
            "root_id": str(resource_id),
            "total_dependencies": len(downstream),
            "nodes": [{"id": str(r.id), "type": r.resource_type} for r in downstream]
        }
