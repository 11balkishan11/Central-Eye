import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.services.graph.graph_query_service import GraphQueryService
from app.services.graph.graph_snapshot_service import GraphSnapshotService
from app.services.graph.dependency_engine import DependencyEngine
from app.services.graph.impact_analyzer import ImpactAnalyzer
from app.services.graph.blast_radius_scorer import BlastRadiusScorer

router = APIRouter()

@router.get("/{resource_id}/neighbors")
def get_neighbors(
    resource_id: uuid.UUID,
    db: Session = Depends(get_db)
) -> Any:
    """Get immediate neighbors for a resource."""
    gqs = GraphQueryService(db)
    return gqs.neighbors(resource_id)

@router.get("/{resource_id}/dependencies")
def get_dependencies(
    resource_id: uuid.UUID,
    db: Session = Depends(get_db)
) -> Any:
    """Get all downstream dependencies."""
    engine = DependencyEngine(db)
    return engine.build_dependency_tree(resource_id)

@router.get("/{resource_id}/blast-radius")
def get_blast_radius(
    resource_id: uuid.UUID,
    db: Session = Depends(get_db)
) -> Any:
    """Calculate the blast radius if this resource fails."""
    dep_engine = DependencyEngine(db)
    analyzer = ImpactAnalyzer(db)
    scorer = BlastRadiusScorer()
    
    # 1. Structural dependencies
    tree = dep_engine.build_dependency_tree(resource_id)
    
    # 2. What is actually impacted?
    impacted = analyzer.analyze_impact(tree)
    
    # 3. Score the impact
    score_result = scorer.score_impact(impacted)
    
    return {
        "resource_id": str(resource_id),
        "blast_radius": score_result,
        "impacted_nodes_count": len(impacted)
    }

@router.get("/{resource_id}/history")
def get_history(
    resource_id: uuid.UUID,
    timestamp: Optional[datetime] = None,
    db: Session = Depends(get_db)
) -> Any:
    """Get a point-in-time snapshot of the resource."""
    snapshot_service = GraphSnapshotService(db)
    return snapshot_service.snapshot(resource_id, timestamp)

@router.get("/{resource_id}/timeline")
def get_timeline(
    resource_id: uuid.UUID,
    db: Session = Depends(get_db)
) -> Any:
    """Get the chronological timeline of all events, states, and changes."""
    # MVP: Mock timeline
    return [
        {"timestamp": datetime.utcnow().isoformat(), "event": "CREATED", "details": "Resource discovered"}
    ]

@router.get("/{resource_id}/subgraph")
def get_subgraph(
    resource_id: uuid.UUID,
    depth: int = 2,
    db: Session = Depends(get_db)
) -> Any:
    """Get a localized subgraph (nodes and edges) for UI visualization."""
    gqs = GraphQueryService(db)
    return gqs.subgraph(resource_id, depth)
