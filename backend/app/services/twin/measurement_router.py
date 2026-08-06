from typing import Dict, Any, List
from app.models.measurement import Measurement
from app.services.measurements.store import MeasurementStore
from app.models.observation import Observation
import uuid

class MeasurementRouter:
    """
    Separates Measurements (metrics) from Facts and routes them to the MeasurementStore.
    """
    def __init__(self, store: MeasurementStore):
        self.store = store
        
    def extract_and_route(self, observation: Observation) -> Dict[str, Any]:
        """
        Extracts metrics from the observation payload, routes them to TSDB,
        and returns the remaining payload (Facts) for Twin reconciliation.
        """
        facts = {}
        measurements: List[Measurement] = []
        
        # In MVP, we use simple heuristic. Real system would use a schema definition.
        metric_keys = {"cpu_usage", "memory_usage", "temperature", "latency", "throughput"}
        
        for k, v in observation.payload.items():
            if k in metric_keys:
                category = "Performance"
                unit = None
                if k == "temperature":
                    category = "Environment"
                    unit = "C"
                elif k == "cpu_usage":
                    unit = "%"
                
                # Assume resource_id is known at this stage (after Identity Resolution)
                if observation.resource_id:
                    measurements.append(Measurement(
                        tenant_id=observation.tenant_id,
                        resource_id=uuid.UUID(observation.resource_id),
                        category=category,
                        metric=k,
                        value=float(v),
                        unit=unit,
                        collector_id=observation.collector_id
                    ))
            else:
                facts[k] = v
                
        if measurements:
            self.store.write_batch(measurements)
            
        return facts
