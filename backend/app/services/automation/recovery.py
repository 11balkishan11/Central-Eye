from typing import Any
from sqlalchemy.orm import Session
from app.models.automation import AutomationExecution
from app.services.automation.registry import AutomationRegistry
from app.services.automation.context import ExecutionContext
from app.services.knowledge.models import InfrastructureKnowledge

class RecoveryDecisionEngine:
    def decide(self, execution: AutomationExecution) -> str:
        """
        Determines whether to retry, rollback, or require manual intervention.
        """
        # MVP logic: always rollback on failure for now
        return "ROLLBACK"

class RollbackEngine:
    def __init__(self, db: Session):
        self.db = db
        
    def rollback(self, execution: AutomationExecution, knowledge_snapshot: InfrastructureKnowledge):
        """
        Executes rollback for previously successful steps in reverse order.
        """
        execution.status = "ROLLING_BACK"
        self.db.commit()
        
        context = ExecutionContext(
            execution_id=execution.id,
            plan_id=execution.plan_id,
            knowledge_snapshot=knowledge_snapshot,
            correlation_id=str(execution.id)
        )
        
        # Get successful steps and reverse them
        successful_steps = [s for s in execution.step_results if s.status == "SUCCESS"]
        successful_steps.reverse()
        
        for step in successful_steps:
            try:
                action = AutomationRegistry.get_action(step.action_id)
                # In real code, we'd retrieve the step params from the plan
                # Mocking params for MVP rollback
                params = {} 
                action.rollback(context, params, step.output or {})
                step.status = "ROLLED_BACK"
            except Exception as e:
                # If a rollback fails, we definitely need human intervention
                execution.status = "MANUAL_INTERVENTION_REQUIRED"
                self.db.commit()
                return False
                
            self.db.commit()
            
        execution.status = "ROLLED_BACK"
        self.db.commit()
        return True
