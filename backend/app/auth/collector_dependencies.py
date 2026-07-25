from fastapi import Depends, Request, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import uuid
from sqlalchemy.future import select

from app.db.session import get_db
from app.auth.token_service import TokenService
from app.core.config import settings
from app.models.device import Collector

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_token_service() -> TokenService:
    return TokenService()

async def get_current_collector(
    token: str = Depends(oauth2_scheme),
    token_service: TokenService = Depends(get_token_service),
    db: AsyncSession = Depends(get_db)
) -> Collector:
    """
    Validates a Collector JWT Access Token and returns the Collector model.
    """
    try:
        payload = token_service.decode_collector_token(token, audience=settings.JWT_ACCESS_AUDIENCE)
        if payload.get("type") != "collector_access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        collector_id_str = payload.get("sub")
        if not collector_id_str:
            raise HTTPException(status_code=401, detail="Missing subject in token")
            
        collector_id = uuid.UUID(collector_id_str)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")
        
    result = await db.execute(select(Collector).where(Collector.id == collector_id))
    collector = result.scalar_one_or_none()
    
    if not collector:
        raise HTTPException(status_code=401, detail="Collector not found")
        
    return collector
