from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any

from app.db.session import get_db
from app.schemas.observation import ObservationCreate, ObservationResponse
from app.services.observation_service import ObservationService

router = APIRouter()

@router.post("/", response_model=ObservationResponse, status_code=status.HTTP_201_CREATED)
async def create_observation(
    *,
    db: AsyncSession = Depends(get_db),
    observation_in: ObservationCreate,
) -> Any:
    """
    Ingest a new raw Observation from a Collector.
    This goes through the pipeline: Normalization -> Fact -> Identity -> Knowledge Graph.
    """
    service = ObservationService(db)
    
    try:
        obs = await service.process_observation(
            collector_id=observation_in.collector_id,
            source_type=observation_in.source_type,
            resource_hint=observation_in.resource_hint,
            payload=observation_in.payload,
            tenant_id=observation_in.tenant_id
        )
        return obs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process observation: {str(e)}"
        )
