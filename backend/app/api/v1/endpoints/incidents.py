import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.models.incident import Incident
from app.services.correlation.incident_lifecycle import IncidentLifecycleManager

router = APIRouter()

class StatusUpdateRequest(BaseModel):
    status: str
    actor: str = "api_user"

@router.get("/")
def list_incidents(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    return db.query(Incident).offset(skip).limit(limit).all()

@router.get("/{incident_id}")
def get_incident(
    incident_id: uuid.UUID,
    db: Session = Depends(get_db)
) -> Any:
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.post("/{incident_id}/status")
def update_status(
    incident_id: uuid.UUID,
    req: StatusUpdateRequest,
    db: Session = Depends(get_db)
) -> Any:
    manager = IncidentLifecycleManager(db)
    try:
        incident = manager.transition(incident_id, req.status, req.actor)
        return incident
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
