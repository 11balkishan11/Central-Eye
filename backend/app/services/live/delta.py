from typing import Any, Dict
from app.services.live.protocol import PresentationEventV1, TopologyDeltaV1
import uuid
import datetime

class DeltaEngine:
    """
    Computes diffs for large data structures to send over the wire.
    """
    @staticmethod
    def compute_topology_delta(tenant_id: str, old_state: Dict[str, Any], new_state: Dict[str, Any]) -> PresentationEventV1:
        # MVP: Naive diffing
        old_nodes = {n["id"]: n for n in old_state.get("nodes", [])}
        new_nodes = {n["id"]: n for n in new_state.get("nodes", [])}
        
        added_nodes = [n for k, n in new_nodes.items() if k not in old_nodes]
        removed_nodes = [k for k in old_nodes.keys() if k not in new_nodes]
        updated_nodes = [n for k, n in new_nodes.items() if k in old_nodes and old_nodes[k] != n]
        
        payload = TopologyDeltaV1(
            topology_id="master_topology",
            added_nodes=added_nodes,
            removed_nodes=removed_nodes,
            updated_nodes=updated_nodes
        )
        
        return PresentationEventV1(
            event_id=str(uuid.uuid4()),
            event_type="TopologyDeltaV1",
            tenant_id=tenant_id,
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            payload=payload
        )
