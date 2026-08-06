from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Any

from app.services.live.session import LiveSession, LiveSessionContext, session_manager
from app.services.live.subscriptions import subscription_engine, Subscription

router = APIRouter()

@router.websocket("/live")
async def websocket_live_endpoint(websocket: WebSocket):
    """
    Main WebSocket endpoint for React UI.
    """
    # In a real app, we'd extract token from query params or headers
    tenant_id = "t1" # mock
    
    context = LiveSessionContext(
        session_id=str(id(websocket)), # naive id
        tenant_id=tenant_id,
        user_id="user1",
        roles=[],
        permissions=["inventory:read", "topology:read"]
    )
    
    session = LiveSession(websocket, context)
    await session_manager.connect(session)
    
    try:
        while True:
            data = await websocket.receive_json()
            # Handle incoming commands like SUBSCRIBE
            cmd = data.get("command")
            if cmd == "subscribe":
                topic = data.get("topic")
                sub = Subscription(subscription_id=data.get("id", "sub1"), topic=topic)
                subscription_engine.add_subscription(session.context.session_id, sub)
                
                # MVP Snapshot: Normally we'd route to QueryEngine here
                if sub.snapshot_on_subscribe:
                    await session.send({"type": "Snapshot", "topic": topic, "data": []})
                    
            elif cmd == "ping":
                session.ping()
                
    except WebSocketDisconnect:
        await session_manager.disconnect(session.context.session_id)
        subscription_engine.remove_session(session.context.session_id)
