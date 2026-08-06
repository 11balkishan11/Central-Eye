from typing import Dict, Any, List, Generator
from datetime import datetime, timezone

from app.sdk.collectors.base import BaseCollector, CollectorContext, CollectorHealth
from app.services.collectors.envelope import ObservationEnvelope
from app.services.collectors.builder import ObservationBuilder

class RESTCollector(BaseCollector):
    """
    Reference REST API Collector plugin.
    """
    
    @property
    def collector_id(self) -> str:
        return "rest_api_collector"
        
    def supported_resource_types(self) -> List[str]:
        return ["API", "CloudService"]
        
    def authenticate(self, context: CollectorContext) -> bool:
        return "api_key" in context.credentials
        
    def validate_target(self, target: Dict[str, Any]) -> bool:
        return "url" in target
        
    def estimate_cost(self, target: Dict[str, Any]) -> int:
        return 2
        
    def discover(self, context: CollectorContext, target: Dict[str, Any]) -> Generator[ObservationEnvelope, None, None]:
        builder = ObservationBuilder(
            tenant_id=context.tenant_id,
            collector_id=self.collector_id,
            collection_job_id=context.collection_job_id
        )
        builder.with_fact("url", target["url"], trust=1.0, source_hint="rest_target")
        builder.with_fact("status", "OK", trust=0.9)
        
        yield builder.build()
        
    def collect(self, context: CollectorContext, target: Dict[str, Any]) -> Generator[ObservationEnvelope, None, None]:
        yield from self.discover(context, target)
        
    def stream(self, context: CollectorContext, target: Dict[str, Any]) -> Generator[ObservationEnvelope, None, None]:
        pass
        
    def health(self) -> CollectorHealth:
        return CollectorHealth(
            availability=1.0,
            latency_ms=20,
            error_rate=0.0,
            success_rate=1.0,
            last_poll=datetime.now(timezone.utc),
            queue_depth=0
        )
