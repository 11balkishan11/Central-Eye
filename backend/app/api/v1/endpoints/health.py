from fastapi import APIRouter
from typing import Any

router = APIRouter()

@router.get("/live", summary="Liveness Probe")
async def health_live() -> Any:
    return {"status": "ok", "message": "Service is live"}

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
