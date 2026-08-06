from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.models.events import SubscriberCheckpoint

class CheckpointStore:
    """
    Manages checkpoints for event subscribers to support resume and replay.
    """
    def __init__(self, db: Session):
        self.db = db
        
    def get_checkpoint(self, subscriber_name: str, tenant_id: str) -> SubscriberCheckpoint:
        checkpoint = self.db.query(SubscriberCheckpoint).filter(
            SubscriberCheckpoint.subscriber_name == subscriber_name,
            SubscriberCheckpoint.tenant_id == tenant_id
        ).first()
        
        if not checkpoint:
            checkpoint = SubscriberCheckpoint(
                subscriber_name=subscriber_name,
                tenant_id=tenant_id
            )
            self.db.add(checkpoint)
            self.db.commit()
            self.db.refresh(checkpoint)
            
        return checkpoint
        
    def update_checkpoint(self, subscriber_name: str, tenant_id: str, event_id: uuid.UUID, event_created_at: datetime):
        checkpoint = self.get_checkpoint(subscriber_name, tenant_id)
        checkpoint.last_event_id = event_id
        checkpoint.last_event_created_at = event_created_at
        self.db.commit()
