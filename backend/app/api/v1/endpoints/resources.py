import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.auth.authorization_dependencies import extract_tenant_id
from app.models.resource import Resource
from app.models.policy import PolicyAssignment, Policy
from app.models.finding import PolicyEvaluation, Finding

router = APIRouter()

@router.get("/{resource_id}/policies")
def get_resource_policies(
    resource_id: uuid.UUID,
    db: Session = Depends(get_db),
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
) -> Any:
    """
    Policy Assignment Inspector for a given resource.
    Returns assigned policies, compliance status, last evaluated time, etc.
    """
    resource = db.query(Resource).filter(
        Resource.id == resource_id,
        Resource.tenant_id == tenant_id
    ).first()
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
        
    # Get all policies assigned to this resource (simplified: get all active policies for tenant for now, 
    # since we don't have complex assignment matching yet in the minimal slice)
    # Actually, let's query PolicyAssignment if they exist.
    _ = db.query(PolicyAssignment).filter(
        PolicyAssignment.target_type == "network_device"  # Hardcoded for Sprint 1 minimal slice
    ).all()
    
    # Let's get active policies for the tenant
    policies = db.query(Policy).filter(Policy.tenant_id == tenant_id, Policy.is_active.is_(True)).all()
    
    results = []
    
    for policy in policies:
        # Find latest evaluation for this policy and resource
        latest_eval = db.query(PolicyEvaluation).filter(
            PolicyEvaluation.resource_id == resource_id,
            PolicyEvaluation.policy_version_id.in_([v.id for v in policy.versions])
        ).order_by(PolicyEvaluation.evaluated_at.desc()).first()
        
        # Check if there's an active finding
        active_finding = db.query(Finding).filter(
            Finding.resource_id == resource_id,
            Finding.policy_id == policy.id,
            Finding.status == "OPEN"
        ).first()
        
        results.append({
            "policy_id": policy.id,
            "policy_name": policy.name,
            "assigned": True,
            "latest_evaluation": {
                "status": latest_eval.status if latest_eval else "NEVER_EVALUATED",
                "evaluated_at": latest_eval.evaluated_at if latest_eval else None,
            },
            "compliance": "FAIL" if active_finding or (latest_eval and latest_eval.status == "FAIL") else "PASS" if latest_eval else "UNKNOWN",
            "current_finding": {
                "id": active_finding.id,
                "severity": active_finding.severity
            } if active_finding else None,
            "next_scheduled": "System Managed" # Placeholder
        })
        
    return results
