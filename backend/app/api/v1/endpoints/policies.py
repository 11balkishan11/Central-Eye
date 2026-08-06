from typing import Any, List
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.auth.authorization_dependencies import extract_tenant_id
from app.models.policy import Policy, PolicyVersion
from app.models.resource import Resource
from app.schemas.policy import PolicyCreate, PolicyResponse, PolicyTestRequest
from app.services.operator_registry import OperatorRegistry
from app.services.evaluation_engine import EvaluationOrchestrator
from app.services.engines.engine_registry import EngineRegistry

router = APIRouter()

@router.get("/engines")
def get_engines() -> Any:
    """
    Retrieve engine registry metadata.
    """
    return EngineRegistry.list_metadata()

@router.get("/operators")
def get_operators() -> Any:
    """
    Retrieve operator registry metadata.
    """
    return OperatorRegistry.list_operators()

@router.get("/", response_model=List[PolicyResponse])
def read_policies(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
) -> Any:
    """
    Retrieve policies for the current tenant.
    """
    policies = db.query(Policy).filter(Policy.tenant_id == tenant_id).offset(skip).limit(limit).all()
    return policies

@router.post("/", response_model=PolicyResponse)
def create_policy(
    *,
    db: Session = Depends(get_db),
    policy_in: PolicyCreate,
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
) -> Any:
    """
    Create new policy.
    """
    # Create the base policy
    db_policy = Policy(
        tenant_id=tenant_id,
        name=policy_in.name,
        description=policy_in.description,
        is_active=policy_in.is_active,
    )
    db.add(db_policy)
    db.flush()
    
    # Create the first version
    db_version = PolicyVersion(
        policy_id=db_policy.id,
        version=1,
        engine=policy_in.version.engine,
        match_criteria=policy_in.version.match_criteria,
        rule_schema=policy_in.version.rule_schema.dict(),
    )
    db.add(db_version)
    db.commit()
    db.refresh(db_policy)
    return db_policy

@router.post("/{policy_id}/test")
def test_policy(
    policy_id: uuid.UUID,
    request: PolicyTestRequest,
    db: Session = Depends(get_db),
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
) -> Any:
    """
    Test a policy against a specific resource or synthetic facts (dry-run).
    """
    db_policy = db.query(Policy).filter(
        Policy.id == policy_id, 
        Policy.tenant_id == tenant_id
    ).first()
    
    if not db_policy:
        raise HTTPException(status_code=404, detail="Policy not found")
        
    latest_version = db_policy.versions[-1] if db_policy.versions else None
    if not latest_version:
        raise HTTPException(status_code=404, detail="Policy has no versions")
        
    resource = None
    if request.resource_id:
        resource = db.query(Resource).filter(
            Resource.id == request.resource_id,
            Resource.tenant_id == tenant_id
        ).first()
        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")
            
    orchestrator = EvaluationOrchestrator(db)
    evaluation = orchestrator.evaluate_resource_sync(
        resource=resource,
        policy_version=latest_version,
        synthetic_facts=request.facts,
        dry_run=True,
        trigger="TEST_RUNNER"
    )
    
    return {
        "status": evaluation.status,
        "trace": evaluation.trace
    }

@router.get("/{policy_id}", response_model=PolicyResponse)
def read_policy(
    *,
    db: Session = Depends(get_db),
    policy_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
) -> Any:
    """
    Get policy by ID.
    """
    policy = db.query(Policy).filter(Policy.id == policy_id, Policy.tenant_id == tenant_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy
