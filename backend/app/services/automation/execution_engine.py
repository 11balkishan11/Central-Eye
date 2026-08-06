import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.automation import AutomationExecution, ExecutionStepResult
from app.services.automation.context import ExecutionContext
from app.services.automation.registry import AutomationRegistry
from app.services.knowledge.models import InfrastructureKnowledge

class ExecutionEngine:
    """
    Executes an approved AutomationExecution by traversing the Plan's DAG.
    """
    def __init__(self, db: Session):
        self.db = db

    def execute(self, execution_id: uuid.UUID, knowledge_snapshot: InfrastructureKnowledge):
        execution = self.db.query(AutomationExecution).filter_by(id=execution_id).first()
        if not execution or execution.status != "APPROVED":
            raise ValueError("Execution not found or not approved")
            
        execution.status = "RUNNING"
        execution.started_at = datetime.now(timezone.utc)
        self.db.commit()
        
        plan = execution.plan
        context = ExecutionContext(
            execution_id=execution.id,
            plan_id=plan.id,
            knowledge_snapshot=knowledge_snapshot,
            correlation_id=str(uuid.uuid4())
        )
        
        # MVP: Sequential topological execution
        # We assume `plan.steps` is already topologically sorted for this sprint.
        success = True
        
        for step_def in plan.steps:
            step_id = step_def["id"]
            action_id = step_def["action"]
            params = step_def.get("params", {})
            
            # Create Step Result
            step_result = ExecutionStepResult(
                execution_id=execution.id,
                step_id=step_id,
                action_id=action_id,
                status="RUNNING",
                started_at=datetime.now(timezone.utc)
            )
            self.db.add(step_result)
            self.db.commit()
            
            try:
                action = AutomationRegistry.get_action(action_id)
                action.validate(context, params)
                
                # Execute with simple retry logic
                output = action.execute(context, params)
                
                step_result.status = "SUCCESS"
                step_result.output = output
            except Exception as e:
                step_result.status = "FAILED"
                step_result.error_message = str(e)
                success = False
            
            step_result.completed_at = datetime.now(timezone.utc)
            self.db.commit()
            
            if not success:
                break
                
        execution.status = "COMPLETED" if success else "FAILED"
        execution.completed_at = datetime.now(timezone.utc)
        self.db.commit()
        
        return execution.status
