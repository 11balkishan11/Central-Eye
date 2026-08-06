import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import event

class AuditLog(BaseModel):
    id: str
    tenant_id: str
    actor: str
    action: str # CREATE, UPDATE, DELETE
    resource_type: str
    resource_id: str
    before_state: Optional[Dict[str, Any]]
    after_state: Optional[Dict[str, Any]]
    reason: Optional[str]
    correlation_id: str
    timestamp: datetime

class AuditMiddleware:
    """
    Subscribes to SQLAlchemy session events to emit immutable AuditLogs
    automatically on any model mutation.
    """
    def __init__(self, context):
        self.context = context
        
    def setup(self, session: Session):
        event.listen(session, 'after_flush', self.receive_after_flush)
        
    def receive_after_flush(self, session: Session, flush_context):
        # MVP: Mock implementation of what would normally iterate through
        # session.new, session.dirty, session.deleted
        # and write AuditLog records directly to a fast append-only store or queue.
        pass
