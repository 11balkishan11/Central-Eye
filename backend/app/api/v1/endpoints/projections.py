from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.projections import InventoryProjectionModel, TopologyProjectionModel
from app.services.projections.engine import ProjectionEngine
from app.services.projections.models import ProjectionHealth

router = APIRouter()

# MVP Dependency injection
def get_projection_engine() -> ProjectionEngine:
    from app.main import projection_engine
    return projection_engine

@router.get("/health", response_model=List[ProjectionHealth])
def get_projection_health(
    engine: ProjectionEngine = Depends(get_projection_engine)
):
    """
    Returns the health status of all registered projections.
    """
    if not engine:
        raise HTTPException(status_code=503, detail="Projection engine not initialized")
    return engine.get_health()

@router.get("/inventory")
def get_inventory(db: Session = Depends(get_db)):
    """
    O(1) read endpoint for the React frontend's inventory table.
    """
    return db.query(InventoryProjectionModel).all()

@router.get("/topology")
def get_topology(db: Session = Depends(get_db)):
    """
    O(1) read endpoint for the React frontend's ReactFlow graph.
    """
    topology = db.query(TopologyProjectionModel).filter(
        TopologyProjectionModel.topology_id == "master_topology"
    ).first()
    
    if not topology:
        return {"nodes": [], "links": []}
        
    return {
        "nodes": topology.nodes,
        "links": topology.links,
        "last_updated": topology.last_updated
    }

@router.post("/{projection_name}/rebuild")
def rebuild_projection(
    projection_name: str,
    background_tasks: BackgroundTasks,
    tenant_id: str = "t1", # MVP hardcoded
    engine: ProjectionEngine = Depends(get_projection_engine)
):
    """
    Triggers a manual background rebuild of a projection.
    """
    if not engine:
        raise HTTPException(status_code=503, detail="Projection engine not initialized")
        
    background_tasks.add_task(engine.rebuild, projection_name, tenant_id)
    return {"status": "rebuild_queued", "projection": projection_name}
