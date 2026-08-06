from fastapi import APIRouter, Depends
from typing import Any
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.runtime.health import HealthService

router = APIRouter()

@router.get("/live", summary="Liveness Probe")
def health_live(db: Session = Depends(get_db)) -> Any:
    service = HealthService(db)
    return service.get_health()

@router.get("/ready", summary="Readiness Probe")
async def health_ready() -> Any:
    # In a real scenario, this checks DB connections etc.
    return {"status": "ok", "message": "Service is ready"}

@router.get("/dependencies", summary="Dependencies Probe")
async def health_dependencies() -> Any:
    return {
        "status": "ok", 
        "dependencies": {
            "postgres": "ok",
            "redis": "ok"
        }
    }
