import uuid
from typing import Dict, Any, Optional, List
from app.services.knowledge.providers.base_provider import BaseKnowledgeProvider
from app.services.graph.graph_query_service import GraphQueryService
from app.services.graph.dependency_engine import DependencyEngine

class GraphProvider(BaseKnowledgeProvider):
    def fetch(self, entity_id: uuid.UUID, entity_type: str = "Resource", **kwargs) -> Optional[List[Dict[str, Any]]]:
        if entity_type != "Resource":
            return None
            
        gqs = GraphQueryService(self.db)
        return gqs.get_subgraph(entity_id, depth=2)
        
    def fetch_blast_radius(self, entity_id: uuid.UUID) -> List[Dict[str, Any]]:
        engine = DependencyEngine(self.db)
        radius = engine.calculate_blast_radius(entity_id)
        return [
            {
                "resource_id": str(r.resource.id),
                "name": r.resource.name,
                "type": r.resource.type,
                "distance": r.distance,
                "impact_score": r.impact_score
            } for r in radius
        ]
