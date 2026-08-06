import uuid
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session


from app.db.session import get_db
from app.models.automation import AutomationExecution
from app.services.automation.planner import AutomationPlanner
from app.services.automation.governance import PolicyGuard, ApprovalEngine
from app.services.automation.execution_engine import ExecutionEngine
from app.services.knowledge.knowledge_service import KnowledgeService
from app.services.knowledge.models import KnowledgeQueryProfile

router = APIRouter()

@router.post("/incident/{incident_id}/plan")
def generate_plan(
    incident_id: uuid.UUID,
    recommendation: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Any:
    # 1. Fetch Knowledge
    knowledge_service = KnowledgeService(db)
    knowledge = knowledge_service.build(incident_id, "Incident", KnowledgeQueryProfile.AUTOMATION)
    
    # 2. Generate Plan
    planner = AutomationPlanner(db)
    plan = planner.generate_plan(incident_id, recommendation, knowledge)
    
    # 3. Governance
    guard = PolicyGuard()
    if not guard.validate(plan):
        raise HTTPException(status_code=400, detail="Plan failed policy validation")
        
    approval = ApprovalEngine()
    status = approval.evaluate(plan)
    
    # 4. Create Execution shell
    execution = AutomationExecution(plan_id=plan.id, status=status)
    db.add(execution)
    db.commit()
    db.refresh(execution)
    
    return {
        "plan_id": plan.id,
        "execution_id": execution.id,
        "status": status,
        "risk_level": plan.risk_level
    }

@router.post("/execution/{execution_id}/approve")
def approve_execution(
    execution_id: uuid.UUID,
    db: Session = Depends(get_db)
) -> Any:
    execution = db.query(AutomationExecution).filter_by(id=execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
        
    if execution.status != "WAITING_FOR_APPROVAL":
        raise HTTPException(status_code=400, detail="Execution is not waiting for approval")
        
    execution.status = "APPROVED"
    execution.initiator = "human_user" # Normally from JWT
    db.commit()
    
    return {"status": "APPROVED"}

@router.post("/execution/{execution_id}/run")
def run_execution(
    execution_id: uuid.UUID,
    db: Session = Depends(get_db)
) -> Any:
    execution = db.query(AutomationExecution).filter_by(id=execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
        
    knowledge_service = KnowledgeService(db)
    knowledge = knowledge_service.build(execution.plan.incident_id, "Incident", KnowledgeQueryProfile.AUTOMATION)
    
    engine = ExecutionEngine(db)
    try:
        final_status = engine.execute(execution_id, knowledge)
        return {"status": final_status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
