from typing import Any, List
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.auth.authorization_dependencies import extract_tenant_id
from app.models.finding import Finding, PolicyEvaluation

router = APIRouter()

@router.get("/", response_model=List[Any])
def get_findings(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
) -> Any:
    """
    Retrieve findings with simple confidence derivation.
    """
    findings = db.query(Finding).filter(Finding.tenant_id == tenant_id).offset(skip).limit(limit).all()
    
    results = []
    for f in findings:
        # Calculate derived confidence
        evidence_count = 0
        for eval in f.evaluations:
            evidence_count += len(eval.evidence)
            
        confidence = 100 if evidence_count >= 2 else 80
        
        results.append({
            "id": f.id,
            "resource_id": f.resource_id,
            "origin_engine": f.origin_engine,
            "severity": f.severity,
            "status": f.status,
            "created_at": f.created_at,
            "confidence": confidence,
            "evidence_count": evidence_count,
            "evaluation_ids": [e.id for e in f.evaluations]
        })
        
    return results

@router.get("/{finding_id}")
def get_finding(
    finding_id: uuid.UUID,
    db: Session = Depends(get_db),
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
) -> Any:
    """
    Get finding by ID.
    """
    finding = db.query(Finding).filter(Finding.id == finding_id, Finding.tenant_id == tenant_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
        
    evidence_count = 0
    sources = []
    for eval in finding.evaluations:
        evidence_count += len(eval.evidence)
        for ev in eval.evidence:
            if ev.source not in sources:
                sources.append(ev.source)
                
    confidence = 100 if evidence_count >= 2 else 80
    
    return {
        "id": finding.id,
        "resource_id": finding.resource_id,
        "origin_engine": finding.origin_engine,
        "severity": finding.severity,
        "status": finding.status,
        "created_at": finding.created_at,
        "confidence": confidence,
        "evidence_count": evidence_count,
        "sources": sources,
        "evaluations": [{
            "id": e.id,
            "status": e.status,
            "engine_name": e.engine_name,
            "engine_version": e.engine_version
        } for e in finding.evaluations]
    }

@router.get("/evaluations/{eval_id}")
def get_evaluation(
    eval_id: uuid.UUID,
    db: Session = Depends(get_db),
    tenant_id: uuid.UUID = Depends(extract_tenant_id), # Just to enforce auth if needed
) -> Any:
    """
    Get detailed evaluation by ID.
    """
    evaluation = db.query(PolicyEvaluation).filter(PolicyEvaluation.id == eval_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
        
    return {
        "id": evaluation.id,
        "resource_id": evaluation.resource_id,
        "policy_version_id": evaluation.policy_version_id,
        "finding_id": evaluation.finding_id,
        "status": evaluation.status,
        "engine_name": evaluation.engine_name,
        "engine_version": evaluation.engine_version,
        "evaluation_duration_ms": evaluation.evaluation_duration_ms,
        "evaluated_at": evaluation.evaluated_at,
        "evidence": [{
            "id": ev.id,
            "source": ev.source,
            "weight": ev.weight,
            "timestamp": ev.timestamp
        } for ev in evaluation.evidence]
    }
