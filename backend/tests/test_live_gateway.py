import pytest
from typing import Any

from app.services.live.protocol import PresentationEventV1
from app.services.live.coalescer import PriorityCoalescer
from app.services.live.delta import DeltaEngine
from app.services.live.permissions import AuthorizationFilter
from app.services.live.session import LiveSession, LiveSessionContext, SessionManager

class MockWebSocket:
    def __init__(self):
        self.sent_messages = []
        
    async def send_json(self, data: Any):
        self.sent_messages.append(data)
        
    async def accept(self):
        pass

@pytest.fixture
def session_manager():
    return SessionManager()

@pytest.mark.asyncio
async def test_priority_coalescer(session_manager):
    coalescer = PriorityCoalescer()
    
    ws = MockWebSocket()
    context = LiveSessionContext(session_id="s1", tenant_id="t1", user_id="u1", roles=[], permissions=[])
    session = LiveSession(ws, context)
    await session_manager.connect(session)
    
    # Send a critical event
    crit = PresentationEventV1(event_id="e1", event_type="IncidentUpdatedV1", tenant_id="t1", timestamp="now", payload={})
    await coalescer.dispatch(session, crit)
    
    # Should dispatch immediately
    assert len(ws.sent_messages) == 1
    
    # Send normal event
    norm = PresentationEventV1(event_id="e2", event_type="DeviceUpdatedV1", tenant_id="t1", timestamp="now", payload={})
    await coalescer.dispatch(session, norm)
    
    # Should not dispatch yet
    assert len(ws.sent_messages) == 1
    
    # Flush
    await coalescer.flush_normal(session_manager)
    assert len(ws.sent_messages) == 2
    assert ws.sent_messages[1]["type"] == "Batch"

def test_authorization_filter():
    internal_event = {"tenant_id": "t1"}
    
    # Valid
    assert AuthorizationFilter.is_authorized(internal_event, "t1") is True
    
    # Invalid
    assert AuthorizationFilter.is_authorized(internal_event, "t2") is False

def test_delta_engine():
    old_state = {
        "nodes": [{"id": "A", "val": 1}, {"id": "B", "val": 1}]
    }
    new_state = {
        "nodes": [{"id": "B", "val": 2}, {"id": "C", "val": 1}]
    }
    
    delta = DeltaEngine.compute_topology_delta("t1", old_state, new_state)
    payload = delta.payload
    
    assert len(payload.added_nodes) == 1
    assert payload.added_nodes[0]["id"] == "C"
    
    assert len(payload.removed_nodes) == 1
    assert payload.removed_nodes[0] == "A"
    
    assert len(payload.updated_nodes) == 1
    assert payload.updated_nodes[0]["id"] == "B"
