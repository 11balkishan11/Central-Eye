from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.resource import Resource

class ImpactAnalyzer:
    """
    Answers: Which of these dependencies are actually affected?
    Filters the structural dependency tree based on active state, redundancy, and health.
    """
    def __init__(self, db: Session):
        self.db = db

    def analyze_impact(self, dependency_tree: Dict[str, Any]) -> List[Resource]:
        """
        Takes the structural dependency tree and determines which nodes are truly impacted.
        Returns a list of impacted Resource objects.
        """
        impacted_resources = []
        
        # MVP: Assume all downstream nodes are impacted
        # In a real scenario, this would check if paths are redundant, if nodes are active, etc.
        node_ids = [n["id"] for n in dependency_tree.get("nodes", [])]
        
        if node_ids:
            impacted_resources = self.db.query(Resource).filter(Resource.id.in_(node_ids)).all()
            
        return impacted_resources
