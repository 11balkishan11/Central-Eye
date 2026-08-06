import uuid
import pytest
from unittest.mock import MagicMock
from datetime import datetime, timezone

from app.services.events.event_publisher import EventPublisher
from app.services.events.taxonomy import PlatformEventType
from app.models.platform_event import PlatformEvent
from app.models.incident import Incident
from app.services.correlation.incident_lifecycle import IncidentLifecycleManager
from app.services.correlation.correlation_rules import CorrelationRules

@pytest.fixture
def mock_db():
    return MagicMock()

def test_causality_chain(mock_db):
    """
    Test that publishing an event properly links it to the causality chain if correlation_id is provided.
    """
    publisher = EventPublisher(mock_db)
    
    correlation_id = uuid.uuid4()
    causation_id = uuid.uuid4()
    
    event = publisher.publish(
        event_type=PlatformEventType.FINDING_OPENED,
        aggregate_type="Finding",
        aggregate_id=uuid.uuid4(),
        payload={"message": "test"},
        correlation_id=correlation_id,
        causation_id=causation_id
    )
    
    assert event.correlation_id == correlation_id
    assert event.causation_id == causation_id
    assert event.event_type == PlatformEventType.FINDING_OPENED.value
    
def test_declarative_rules(mock_db):
    """
    Test that the simple declarative rule merges events on the same resource within the time window.
    """
    rules = CorrelationRules(mock_db)
    
    res_id = uuid.uuid4()
    
    event = PlatformEvent(
        aggregate_type="Resource",
        aggregate_id=res_id,
        occurred_at=datetime.now(timezone.utc)
    )
    
    mock_res = MagicMock()
    mock_res.id = res_id
    
    incident = Incident(
        created_at=datetime.now(timezone.utc)
    )
    incident.affected_resources = [mock_res]
    
    # Should merge because it's the same resource and within the time window
    decision = rules.evaluate(event, incident)
    assert decision == "MERGE"
    
def test_incident_lifecycle(mock_db):
    """
    Test that IncidentLifecycleManager correctly enforces valid transitions and sets resolved_at.
    """
    manager = IncidentLifecycleManager(mock_db)
    
    incident = Incident(id=uuid.uuid4(), status="OPEN")
    
    # Mock DB query
    query_mock = MagicMock()
    query_mock.filter.return_value.first.return_value = incident
    mock_db.query.return_value = query_mock
    
    # Valid transition
    updated = manager.transition(incident.id, "ACKNOWLEDGED")
    assert updated.status == "ACKNOWLEDGED"
    assert updated.resolved_at is None
    
    # Valid transition to resolved
    updated = manager.transition(incident.id, "RESOLVED")
    assert updated.status == "RESOLVED"
    assert updated.resolved_at is not None
    
    # Invalid transition
    with pytest.raises(ValueError):
        manager.transition(incident.id, "INVALID_STATE")
