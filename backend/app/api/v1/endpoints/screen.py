from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from app.services.queries.engine import QueryEngine
from app.services.bff.screen_engine import ScreenEngine
from app.api.v1.endpoints.query import get_query_engine, get_query_context
from app.services.queries.schema import QueryContext
from app.services.bff.screens.dashboard import DashboardScreen

router = APIRouter()

def get_screen_engine(query_engine: QueryEngine = Depends(get_query_engine), db: Session = Depends(get_db)) -> ScreenEngine:
    return ScreenEngine(db, query_engine)

@router.get("/{screen_name}")
def get_screen(
    screen_name: str,
    engine: ScreenEngine = Depends(get_screen_engine),
    context: QueryContext = Depends(get_query_context)
):
    """
    BFF Screen endpoint.
    Orchestrates multiple internal queries and returns a composed UI definition.
    """
    # Simple registry for MVP
    screens = {
        "dashboard": DashboardScreen
    }
    
    config = screens.get(screen_name.lower())
    if not config:
        raise HTTPException(status_code=404, detail=f"Screen {screen_name} not found")
        
    return engine.execute_screen(config, context)
