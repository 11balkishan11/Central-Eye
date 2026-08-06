from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.services.events.replay import ReplayEngine
from app.models.events import DeadLetter

router = APIRouter()

# MVP Dependency injection
def get_replay_engine(db: Session = Depends(get_db)) -> ReplayEngine:
    from app.main import domain_event_bus
    return ReplayEngine(db, domain_event_bus)

@router.post("/replay")
def trigger_replay(
    tenant_id: Optional[str] = None,
    aggregate_id: Optional[str] = None,
    from_time: Optional[datetime] = None,
    to_time: Optional[datetime] = None,
    background_tasks: BackgroundTasks = None,
    engine: ReplayEngine = Depends(get_replay_engine)
):
    """
    Triggers an event replay. 
    In MVP this runs synchronously or via background task.
    """
    if background_tasks:
        background_tasks.add_task(engine.replay, tenant_id, aggregate_id, from_time, to_time)
        return {"status": "replay_queued"}
    else:
        count = engine.replay(tenant_id, aggregate_id, from_time, to_time)
        return {"status": "replayed", "count": count}

@router.get("/dlq")
def get_dead_letters(db: Session = Depends(get_db)):
    """
    Retrieves all dead letter events for operational review.
    """
    return db.query(DeadLetter).all()

@router.post("/dlq/{dlq_id}/retry")
def retry_dead_letter(dlq_id: str, db: Session = Depends(get_db)):
    """
    Re-injects a dead letter back into the event bus for processing.
    """
    dlq = db.query(DeadLetter).filter(DeadLetter.id == dlq_id).first()
    if not dlq:
        raise HTTPException(status_code=404, detail="DeadLetter not found")
        
    envelope = dlq.payload
    
    from app.main import domain_event_bus
    domain_event_bus.publish(envelope)
    
    # If successful, remove from DLQ
    db.delete(dlq)
    db.commit()
    return {"status": "retried"}
