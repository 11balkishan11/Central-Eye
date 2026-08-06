import asyncio
from sqlalchemy.orm import Session

from app.services.live.broadcaster import presentation_bus
from app.services.live.translator import PresentationTranslator
from app.services.live.permissions import AuthorizationFilter
from app.services.live.coalescer import priority_coalescer
from app.services.live.subscriptions import subscription_engine
from app.services.live.session import session_manager

class LiveGateway:
    """
    The orchestrator for the Live Distribution Layer.
    Binds the Presentation Bus to the pipeline.
    """
    def __init__(self, db: Session):
        self.db = db
        self.translator = PresentationTranslator(db)
        
    def start(self):
        """Bind to presentation bus and start background flusher tasks"""
        presentation_bus.subscribe(self._handle_projection_event)
        
        # Start coalescer flush loops
        asyncio.create_task(self._flush_normal_loop())
        asyncio.create_task(self._flush_metric_loop())
        
    async def _flush_normal_loop(self):
        while True:
            await asyncio.sleep(0.25) # 250ms
            await priority_coalescer.flush_normal(session_manager)
            
    async def _flush_metric_loop(self):
        while True:
            await asyncio.sleep(1.0) # 1000ms
            await priority_coalescer.flush_metric(session_manager)
            
    def _handle_projection_event(self, internal_event: dict):
        """Runs the pipeline: Auth -> Translate -> Route -> Coalesce -> Send"""
        # Note: in real implementation, this would be an async task queue 
        # since it's bridging sync SQLAlchemy with async WebSockets.
        # For MVP we simulate it with asyncio.create_task.
        asyncio.create_task(self._process_pipeline(internal_event))
        
    async def _process_pipeline(self, internal_event: dict):
        tenant_id = internal_event.get("tenant_id")
        
        # 1. Authorization
        if not AuthorizationFilter.is_authorized(internal_event, tenant_id):
            return
            
        # 2. Translation
        presentation_event = self.translator.translate(internal_event)
        if not presentation_event:
            return
            
        # 3. Routing via Subscriptions
        # E.g. DeviceUpdatedV1 maps to topic "inventory"
        topic = "inventory" if "Device" in presentation_event.event_type else "topology"
        subs = subscription_engine.get_subscriptions(topic)
        
        # 4. Dispatch to Coalescer per session
        for session_id, sub in subs:
            session = session_manager.get_session(session_id)
            if session:
                # We could apply sub.filters here before sending
                await priority_coalescer.dispatch(session, presentation_event)
