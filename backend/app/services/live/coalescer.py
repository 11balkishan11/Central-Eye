from typing import Dict, List, Any

from app.services.live.protocol import PresentationEventV1
from app.services.live.session import LiveSession

class PriorityCoalescer:
    """
    Batches PresentationEvents into queues based on latency requirements.
    Critical: <50ms (basically immediate)
    Normal: 250ms (UI Updates)
    Metric: 1000ms (Telemetry)
    """
    def __init__(self):
        # We store queues per session_id to isolate batching
        self._normal_queue: Dict[str, List[PresentationEventV1]] = {}
        self._metric_queue: Dict[str, List[PresentationEventV1]] = {}
        
    async def dispatch(self, session: LiveSession, event: PresentationEventV1):
        """Routes event to the correct queue based on type."""
        
        # Categorize
        if "Metric" in event.event_type:
            queue_type = "metric"
        elif "Incident" in event.event_type or "Offline" in event.event_type:
            queue_type = "critical"
        else:
            queue_type = "normal"
            
        if queue_type == "critical":
            # Immediate push
            await session.send(event.model_dump())
            
        elif queue_type == "normal":
            sid = session.context.session_id
            if sid not in self._normal_queue:
                self._normal_queue[sid] = []
            self._normal_queue[sid].append(event)
            
        elif queue_type == "metric":
            sid = session.context.session_id
            if sid not in self._metric_queue:
                self._metric_queue[sid] = []
            self._metric_queue[sid].append(event)
            
    async def flush_normal(self, session_manager: Any):
        """Should be called every ~250ms by a background task"""
        for sid, events in list(self._normal_queue.items()):
            if not events:
                continue
            session = session_manager.get_session(sid)
            if session:
                # In real app we'd coalesce duplicates (e.g. only send latest metric)
                batch = {"type": "Batch", "events": [e.model_dump() for e in events]}
                await session.send(batch)
            self._normal_queue[sid] = []
            
    async def flush_metric(self, session_manager: Any):
        """Should be called every ~1000ms by a background task"""
        for sid, events in list(self._metric_queue.items()):
            if not events:
                continue
            session = session_manager.get_session(sid)
            if session:
                batch = {"type": "Batch", "events": [e.model_dump() for e in events]}
                await session.send(batch)
            self._metric_queue[sid] = []

priority_coalescer = PriorityCoalescer()
