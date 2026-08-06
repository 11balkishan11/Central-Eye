from typing import Dict, List, Any, Optional
from pydantic import BaseModel
import time
import asyncio
from fastapi import WebSocket

class LiveSessionContext(BaseModel):
    session_id: str
    tenant_id: str
    user_id: str
    roles: List[str]
    permissions: List[str]
    subscriptions: List[str] = []
    device_type: str = "web"
    client_version: str = "1.0.0"
    last_seen: float = 0.0

class LiveSession:
    """Wraps a FastAPI WebSocket with a rich context."""
    def __init__(self, websocket: WebSocket, context: LiveSessionContext):
        self.websocket = websocket
        self.context = context
        self.context.last_seen = time.time()
        self.queue: asyncio.Queue = asyncio.Queue(maxsize=1000)
        self._flush_task = asyncio.create_task(self._flush_loop())
        
    async def send(self, payload: Any):
        """Puts payload in the immediate queue or sends directly if not batching."""
        try:
            # For immediate dispatch, just send
            # If queue is full, we might drop or handle backpressure here
            await self.websocket.send_json(payload)
        except Exception as e:
            print(f"Error sending to session {self.context.session_id}: {e}")
            
    async def _flush_loop(self):
        """Background loop to process queue if needed in future for batching."""
        pass
        
    def ping(self):
        self.context.last_seen = time.time()
        
    def cancel(self):
        self._flush_task.cancel()


class SessionManager:
    """Manages active live sessions."""
    def __init__(self):
        self._sessions: Dict[str, LiveSession] = {}
        
    async def connect(self, session: LiveSession):
        await session.websocket.accept()
        self._sessions[session.context.session_id] = session
        
    async def disconnect(self, session_id: str):
        session = self._sessions.get(session_id)
        if session:
            session.cancel()
            del self._sessions[session_id]
            
    def get_session(self, session_id: str) -> Optional[LiveSession]:
        return self._sessions.get(session_id)
        
    def get_sessions_for_tenant(self, tenant_id: str) -> List[LiveSession]:
        return [s for s in self._sessions.values() if s.context.tenant_id == tenant_id]

session_manager = SessionManager()
