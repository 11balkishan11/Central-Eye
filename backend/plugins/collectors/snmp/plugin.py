from typing import Dict, Any, List, Generator
from datetime import datetime, timezone

from app.sdk.collectors.base import BaseCollector, CollectorContext, CollectorHealth
from app.services.collectors.envelope import ObservationEnvelope
from app.services.collectors.builder import ObservationBuilder

class SNMPCollector(BaseCollector):
    """
    Reference SNMP Collector plugin.
    """
    
    @property
    def collector_id(self) -> str:
        return "snmp_v2c_collector"
        
    def supported_resource_types(self) -> List[str]:
        return ["Device", "Router", "Switch"]
        
    def authenticate(self, context: CollectorContext) -> bool:
        return "snmp_community" in context.credentials
        
    def validate_target(self, target: Dict[str, Any]) -> bool:
        return "ip_address" in target
        
    def estimate_cost(self, target: Dict[str, Any]) -> int:
        return 1
        
    def discover(self, context: CollectorContext, target: Dict[str, Any]) -> Generator[ObservationEnvelope, None, None]:
        # MVP: Yield a basic discovery envelope
        builder = ObservationBuilder(
            tenant_id=context.tenant_id,
            collector_id=self.collector_id,
            collection_job_id=context.collection_job_id
        )
        builder.with_fact("ip_address", target["ip_address"], trust=0.9, source_hint="snmp_target")
        builder.with_fact("sys_description", "Cisco IOS Software, Catalyst 3850", trust=0.9)
        
        yield builder.build()
        
    def collect(self, context: CollectorContext, target: Dict[str, Any]) -> Generator[ObservationEnvelope, None, None]:
        # In MVP, just re-yield discovery for now
        yield from self.discover(context, target)
        
    def stream(self, context: CollectorContext, target: Dict[str, Any]) -> Generator[ObservationEnvelope, None, None]:
        pass
        
    def health(self) -> CollectorHealth:
        return CollectorHealth(
            availability=1.0,
            latency_ms=10,
            error_rate=0.0,
            success_rate=1.0,
            last_poll=datetime.now(timezone.utc),
            queue_depth=0
        )
