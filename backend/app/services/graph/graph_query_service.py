import uuid
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.models.resource import Resource
from app.repositories.graph_repository import GraphRepository
from app.services.graph.graph_cache import cache_instance as cache

class GraphQueryService:
    """
    Central abstraction for all graph traversals. 
    Does not contain business logic for scoring or impact.
    """
    def __init__(self, db: Session):
        self.repo = GraphRepository(db)

    def neighbors(self, resource_id: uuid.UUID) -> List[Resource]:
        """Fetch immediate neighbors."""
        # Simple cache wrapper example
        cached = cache.get_neighbors(resource_id)
        if cached is not None:
            # We would normally deserialize back to models here, but for MVP we might just rely on DB
            # For this MVP, let's just bypass cache serialization complexity and use the repo, 
            # or treat cached as the definitive list if we implemented it fully.
            pass
            
        res = self.repo.get_neighbors(resource_id)
        # cache.put_neighbors(resource_id, [r.__dict__ for r in res]) # Simplified
        return res

    def upstream(self, resource_id: uuid.UUID) -> List[Resource]:
        """Fetch all transitive upstream dependencies."""
        return self.repo.get_upstream(resource_id)

    def downstream(self, resource_id: uuid.UUID) -> List[Resource]:
        """Fetch all transitive downstream dependencies."""
        return self.repo.get_downstream(resource_id)

    def path(self, source_id: uuid.UUID, target_id: uuid.UUID) -> List[Resource]:
        """Find shortest path between two resources."""
        # MVP: Naive implementation or defer to future sprint. 
        # For now, return empty or implement a basic BFS using self.neighbors.
        return []

    def subgraph(self, resource_id: uuid.UUID, depth: int = 2) -> Dict[str, Any]:
        """Return a localized subgraph around the resource."""
        # MVP: Just return the resource and its immediate neighbors.
        neighbors = self.neighbors(resource_id)
        
        nodes = [{"id": str(resource_id)}] + [{"id": str(n.id)} for n in neighbors]
        edges = [{"source": str(resource_id), "target": str(n.id)} for n in neighbors] # Simplified
        
        return {
            "nodes": nodes,
            "edges": edges
        }
