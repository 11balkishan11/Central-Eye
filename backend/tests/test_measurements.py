import uuid
from app.models.observation import Observation
from app.services.twin.measurement_router import MeasurementRouter

# Mock store
class MockMeasurementStore:
    def __init__(self):
        self.measurements = []
    def write(self, measurement):
        self.measurements.append(measurement)
        return True
    def write_batch(self, measurements):
        self.measurements.extend(measurements)
        return True

def test_measurement_routing():
    store = MockMeasurementStore()
    router = MeasurementRouter(store)
    
    obs = Observation(
        tenant_id="t1",
        collector_id="snmp1",
        resource_id=str(uuid.uuid4()),
        payload={
            "hostname": "sw01",
            "cpu_usage": 45.5,
            "temperature": 32.0,
            "os_version": "17.6"
        }
    )
    
    facts = router.extract_and_route(obs)
    
    assert "hostname" in facts
    assert "os_version" in facts
    assert "cpu_usage" not in facts
    
    assert len(store.measurements) == 2
    
    cpu = next(m for m in store.measurements if m.metric == "cpu_usage")
    assert cpu.value == 45.5
    assert cpu.unit == "%"
    
    temp = next(m for m in store.measurements if m.metric == "temperature")
    assert temp.value == 32.0
    assert temp.unit == "C"
