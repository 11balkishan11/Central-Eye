import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

from app.models.base import Base
from app.models.events import OutboxEvent, StoredEvent, DeadLetter, SubscriberCheckpoint
from app.services.events.envelope import EventEnvelope
from app.services.events.dispatcher import EventDispatcherWorker
from app.services.events.bus import InMemoryDomainEventBus

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    yield db
    db.close()

def test_outbox_dispatcher(db_session):
    # Mock EventBus
    bus = InMemoryDomainEventBus()
    
    # Insert an outbox event
    envelope = EventEnvelope(
        event_type="FactUpdated",
        aggregate_id="res-123",
        aggregate_type="Resource",
        tenant_id="t1",
        payload={"fact_group_id": "hostname", "payload": {"hostname": "switch-01"}}
    )
    
    outbox = OutboxEvent(
        aggregate_id="res-123",
        tenant_id="t1",
        status="PENDING",
        payload=envelope.model_dump(mode="json")
    )
    db_session.add(outbox)
    db_session.commit()
    
    # Run dispatcher manually (mocking the loop and db session)
    dispatcher = EventDispatcherWorker(bus, batch_size=50)
    
    # Monkey-patch SessionLocal to use our in-memory test session
    import app.services.events.dispatcher
    app.services.events.dispatcher.SessionLocal = lambda: db_session
    
    # Process batch
    dispatcher._process_batch()
    
    # Verify Outbox updated
    updated_outbox = db_session.query(OutboxEvent).first()
    assert updated_outbox.status == "PUBLISHED"
    
    # Verify StoredEvent created
    stored = db_session.query(StoredEvent).first()
    assert stored is not None
    assert stored.event_type == "FactUpdated"
    assert stored.aggregate_id == "res-123"

def test_dead_letter_routing(db_session):
    # Setup Projection Engine
    from app.services.projections.engine import ProjectionEngine
    from app.services.projections.registry import ProjectionRegistry
    
    bus = InMemoryDomainEventBus()
    registry = ProjectionRegistry()
    
    # Add a broken handler
    class BrokenHandler:
        projection_name = "broken_projection"
        def handle_factupdated(self, event, context, db):
            raise ValueError("Intentional crash")
            
    registry.register(BrokenHandler())
    
    engine = ProjectionEngine(bus, registry, db_session)
    engine.start()
    
    # Publish envelope directly to bus (simulate dispatcher)
    envelope = EventEnvelope(
        event_type="FactUpdated",
        aggregate_id="res-123",
        aggregate_type="Resource",
        tenant_id="t1",
        payload={"fact_group_id": "hostname", "payload": {"hostname": "switch-01"}}
    )
    
    bus.publish(envelope.model_dump(mode="json"))
    
    # Verify DLQ
    dlq = db_session.query(DeadLetter).first()
    assert dlq is not None
    assert dlq.subscriber_name == "broken_projection"
    assert "Intentional crash" in dlq.exception_message
    
    # Verify checkpoint was NOT updated
    checkpoint = db_session.query(SubscriberCheckpoint).first()
    assert checkpoint is None or checkpoint.last_event_id != envelope.event_id
