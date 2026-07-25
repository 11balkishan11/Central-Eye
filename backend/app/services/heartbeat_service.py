from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
from app.models.device import Collector
from app.schemas.heartbeat import HeartbeatRequest, HeartbeatResponse
from app.models.job import CollectorEvent, CollectorEventType

class HeartbeatService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def process_heartbeat(self, collector: Collector, request: HeartbeatRequest, correlation_id: str | None = None) -> HeartbeatResponse:
        collector.last_heartbeat = datetime.now(timezone.utc)
        collector.capacity_percent = float(request.cpu_percent)
        
        event = CollectorEvent(
            tenant_id=collector.tenant_id,
            collector_id=collector.id,
            event_type=CollectorEventType.HEARTBEAT,
            correlation_id=correlation_id,
            details={"cpu": request.cpu_percent, "memory": request.memory_mb_used}
        )
        self.db.add(event)
        
        await self.db.commit()
        
        return HeartbeatResponse(
            heartbeat_interval_seconds=60,
            poll_interval_seconds=30,
            log_level="INFO",
            jobs_enabled=True,
            minimum_collector_version="1.0.0"
        )
