from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Any, List
import uuid

from app.db.session import get_db
from app.models.resource import Resource, ResourceState, Relationship, RelationshipState

router = APIRouter()

@router.get("/nodes")
async def get_nodes(
    db: AsyncSession = Depends(get_db),
) -> Any:
    # Get all resources with their latest state
    stmt = select(Resource).options(
        selectinload(Resource.states),
        selectinload(Resource.aliases)
    )
    result = await db.execute(stmt)
    resources = result.scalars().all()
    
    nodes = []
    for r in resources:
        latest_state = None
        if r.states:
            # Assumes ordered or we just take the last appended
            r.states.sort(key=lambda s: s.observed_at, reverse=True)
            latest_state = r.states[0].attributes

        aliases = [a.alias_value for a in r.aliases]
        
        nodes.append({
            "id": r.id,
            "type": r.resource_type,
            "tenant_id": r.tenant_id,
            "attributes": latest_state or {},
            "aliases": aliases
        })
    return nodes

@router.get("/edges")
async def get_edges(
    db: AsyncSession = Depends(get_db),
) -> Any:
    stmt = select(Relationship).options(
        selectinload(Relationship.states)
    )
    result = await db.execute(stmt)
    relationships = result.scalars().all()
    
    edges = []
    for rel in relationships:
        latest_state = None
        if rel.states:
            rel.states.sort(key=lambda s: s.observed_at, reverse=True)
            latest_state = rel.states[0].attributes
            
        edges.append({
            "id": rel.id,
            "source": rel.source_id,
            "target": rel.target_id,
            "type": rel.relationship_type,
            "attributes": latest_state or {}
        })
    return edges
