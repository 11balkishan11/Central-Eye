import uuid
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.automation import AutomationPlan
from app.services.knowledge.models import InfrastructureKnowledge

class AutomationPlanner:
    """
    Consumes AI recommendations and generates immutable Automation Plans.
    """
    def __init__(self, db: Session):
        self.db = db
        
    def generate_plan(self, incident_id: uuid.UUID, recommendation: Dict[str, Any], knowledge: InfrastructureKnowledge) -> AutomationPlan:
        """
        In a full implementation, this uses the Knowledge layer and Policies
        to deterministically resolve the recommendation into discrete registry actions.
        For MVP, we map a mock recommendation into a sequential DAG.
        """
        # MVP: hardcoded DAG for testing
        steps = [
            {
                "id": "step_1",
                "action": "mock_rest",
                "params": {"endpoint": "/api/v1/mock/disable"},
                "depends_on": []
            },
            {
                "id": "step_2",
                "action": "mock_ssh",
                "params": {"command": "systemctl restart service"},
                "depends_on": ["step_1"]
            }
        ]
        
        plan = AutomationPlan(
            incident_id=incident_id,
            steps=steps,
            risk_level="MEDIUM", # Calculated in full implementation
            estimated_duration_ms=1500,
            affected_resources=[str(r.get("id")) for r in knowledge.topology] if knowledge.topology else [],
            rollback_plan={"strategy": "reverse_dag"},
            verification_plan={"rules": ["ping", "policy_eval"]},
            knowledge_snapshot_id=str(knowledge.snapshot_timestamp.timestamp())
        )
        
        self.db.add(plan)
        self.db.commit()
        self.db.refresh(plan)
        
        return plan
