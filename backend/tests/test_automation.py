import uuid
import pytest
from unittest.mock import MagicMock
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models.automation import AutomationPlan, AutomationExecution, ExecutionStepResult
from app.services.automation.context import ExecutionContext
from app.services.automation.registry import AutomationRegistry
from app.services.automation.actions.mock_actions import MockSSHAction, MockRESTAction, FailureAction
from app.services.automation.execution_engine import ExecutionEngine
from app.services.automation.recovery import RollbackEngine
from app.services.knowledge.models import InfrastructureKnowledge

@pytest.fixture(autouse=True)
def setup_registry():
    AutomationRegistry.register(MockSSHAction())
    AutomationRegistry.register(MockRESTAction())
    AutomationRegistry.register(FailureAction())

def test_failure_injection_triggers_rollback(db_session: Session):
    """
    Test that a plan with a FailureAction correctly stops execution
    and that the RollbackEngine correctly targets the previously successful steps.
    """
    # 1. Create a Plan with a success followed by a failure
    steps = [
        {"id": "step_1", "action": "mock_rest", "params": {"endpoint": "/good"}},
        {"id": "step_2", "action": "failure_action", "params": {}}
    ]
    
    plan = AutomationPlan(
        incident_id=uuid.uuid4(),
        steps=steps,
        risk_level="LOW"
    )
    db_session.add(plan)
    db_session.commit()
    
    # 2. Create approved execution
    execution = AutomationExecution(plan_id=plan.id, status="APPROVED")
    db_session.add(execution)
    db_session.commit()
    
    # 3. Execute
    engine = ExecutionEngine(db_session)
    knowledge = InfrastructureKnowledge()
    
    status = engine.execute(execution.id, knowledge)
    assert status == "FAILED"
    
    db_session.refresh(execution)
    assert execution.status == "FAILED"
    assert len(execution.step_results) == 2
    assert execution.step_results[0].status == "SUCCESS"
    assert execution.step_results[1].status == "FAILED"
    
    # 4. Trigger Rollback
    rollback_engine = RollbackEngine(db_session)
    success = rollback_engine.rollback(execution, knowledge)
    
    assert success is True
    db_session.refresh(execution)
    assert execution.status == "ROLLED_BACK"
    
    # Verify the successful step was rolled back
    assert execution.step_results[0].status == "ROLLED_BACK"
    # The failed step is not touched by rollback
    assert execution.step_results[1].status == "FAILED"

def test_dry_run_mode(db_session: Session):
    """
    Test that dry run mode executes actions but returns mock success without altering real state.
    """
    action = AutomationRegistry.get_action("mock_ssh")
    
    context = ExecutionContext(
        execution_id=uuid.uuid4(),
        plan_id=uuid.uuid4(),
        knowledge_snapshot=InfrastructureKnowledge(),
        correlation_id="test",
        dry_run=True
    )
    
    output = action.execute(context, {"command": "reboot"})
    
    assert output.get("status") == "dry_run_success"
