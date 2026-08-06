from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from app.runtime.clock import Clock

class RuntimeContext(BaseModel):
    """
    Universal context object for the Platform Runtime.
    Tracks correlation across the entire execution graph.
    """
    tenant_id: str = "default_tenant"
    actor: str = "system"
    correlation_id: str = Field(description="Correlates an entire distributed saga")
    trace_id: str = Field(description="Correlates a specific trace span")
    request_id: Optional[str] = None
    permissions: List[str] = Field(default_factory=list)
    feature_flags: Dict[str, bool] = Field(default_factory=dict)
    
    def now(self):
        return Clock.now()
