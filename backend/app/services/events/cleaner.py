import asyncio
from datetime import datetime, timedelta, timezone
from app.database import SessionLocal
from app.services.workers.manager import BaseWorker
from app.models.events import OutboxEvent

class OutboxCleanerWorker(BaseWorker):
    """
    Periodically cleans up old PUBLISHED outbox events to prevent the table from growing forever.
    Moves PUBLISHED to ARCHIVED, or just deletes them based on retention policy.
    """
    def __init__(self, poll_interval_sec: float = 60.0, retention_hours: int = 24):
        self.poll_interval_sec = poll_interval_sec
        self.retention_hours = retention_hours
        
    @property
    def name(self) -> str:
        return "OutboxCleanerWorker"
        
    async def run(self):
        while True:
            try:
                self._cleanup()
            except Exception as e:
                print(f"Error in {self.name}: {e}")
            await asyncio.sleep(self.poll_interval_sec)
            
    def _cleanup(self):
        with SessionLocal() as db:
            cutoff_time = datetime.now(timezone.utc) - timedelta(hours=self.retention_hours)
            
            # Find published events older than retention
            old_events = db.query(OutboxEvent).filter(
                OutboxEvent.status == "PUBLISHED",
                OutboxEvent.updated_at < cutoff_time
            ).limit(1000).all()
            
            for event in old_events:
                # In MVP, we just delete them to save space. 
                # Alternatively, set to ARCHIVED if we had an archive table
                db.delete(event)
                
            db.commit()
