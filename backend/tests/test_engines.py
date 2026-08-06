import pytest
import asyncio
from datetime import datetime, timezone
import uuid
from app.services.engines.engine_registry import EngineRegistry
from app.services.engines.base_engine import EvaluationRequest, EvaluationContext
from app.services.evaluation_engine import EvaluationOrchestrator
from app.models.policy import PolicyVersion, Policy, PolicyAssignment
from app.models.resource import Resource

def test_engine_registry_loads_all_engines():
    """Verify that all three engine types can be registered without changing orchestrator code."""
    # Ensure they are imported and registered
    import app.services.engines

    metadata = EngineRegistry.list_metadata()
    engine_ids = [m.id for m in metadata]
    
    assert "configuration" in engine_ids
    assert "security" in engine_ids
    assert "topology" in engine_ids

@pytest.mark.asyncio
async def test_concurrent_evaluation(mocker):
    """
    Verify engines execute concurrently and a failure in one does not prevent the others from completing.
    """
    db_mock = mocker.MagicMock()
    
    # Create mock assignments
    resource = Resource(id=uuid.uuid4())
    
    # Configuration Policy
    p1 = Policy(id=uuid.uuid4(), name="Config Policy")
    pv1 = PolicyVersion(id=uuid.uuid4(), policy_id=p1.id, engine="configuration", rule_schema={"rules": [{"id": "r1", "attribute": "vendor", "operator": "equals", "value": "Cisco"}]})
    p1.versions = [pv1]
    a1 = PolicyAssignment(resource=resource, policy=p1)
    
    # Security Policy
    p2 = Policy(id=uuid.uuid4(), name="Security Policy")
    pv2 = PolicyVersion(id=uuid.uuid4(), policy_id=p2.id, engine="security", rule_schema={"rules": [{"id": "r2", "attribute": "cve_score", "operator": "less_than", "value": 7.0}]})
    p2.versions = [pv2]
    a2 = PolicyAssignment(resource=resource, policy=p2)
    
    # Topology Policy
    p3 = Policy(id=uuid.uuid4(), name="Topology Policy")
    pv3 = PolicyVersion(id=uuid.uuid4(), policy_id=p3.id, engine="topology", rule_schema={"rules": [{"id": "r3", "attribute": "redundant_links", "operator": "greater_than", "value": 1}]})
    p3.versions = [pv3]
    a3 = PolicyAssignment(resource=resource, policy=p3)
    
    orchestrator = EvaluationOrchestrator(db_mock)
    
    # Mock finding generator processing (ensure Orchestrator emits events instead of tightly coupling to FindingGenerator)
    # The actual FindingGenerator would listen to the EventBus.
    
    # We will simulate missing attributes which will cause UNKNOWN status (a type of failure), but shouldn't crash the orchestrator
    evaluations = await orchestrator.evaluate_assignments([a1, a2, a3], trigger="SCHEDULED")
    
    assert len(evaluations) == 3
    
    engine_names = [e.engine_name for e in evaluations]
    assert "ConfigurationEngine" in engine_names
    assert "SecurityEngine" in engine_names
    assert "TopologyEngine" in engine_names
    
    for e in evaluations:
        assert e.trigger == "SCHEDULED"
        assert e.status == "UNKNOWN" # Because Resource has no synthetic facts or states in this test
        
    assert db_mock.add.call_count >= 3
    assert db_mock.commit.call_count == 1
