import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

from app.models.base import Base
from app.services.events.bus import InMemoryDomainEventBus
from app.services.events.domain import FactUpdated, RelationshipAdded
from app.services.projections.registry import ProjectionRegistry
from app.services.projections.engine import ProjectionEngine
from app.services.projections.builders.inventory import InventoryProjectionBuilder
from app.services.projections.builders.topology import TopologyProjectionBuilder
from app.models.projections import InventoryProjectionModel, TopologyProjectionModel

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    yield db
    db.close()

def test_inventory_projection_idempotency(db_session):
    bus = InMemoryDomainEventBus()
    registry = ProjectionRegistry()
    registry.register(InventoryProjectionBuilder())
    engine = ProjectionEngine(bus, registry, db_session)
    
    resource_id = str(uuid.uuid4())
    
    # Event 1 (Version 1)
    event1 = FactUpdated(
        tenant_id="t1",
        version=1,
        resource_id=resource_id,
        fact_group_id="hostname",
        payload={"hostname": "switch-01"}
    )
    engine.handle_event(event1)
    
    model = db_session.query(InventoryProjectionModel).first()
    assert model.hostname == "switch-01"
    assert model.last_event_version == 1
    
    # Event 2 (Version 2)
    event2 = FactUpdated(
        tenant_id="t1",
        version=2,
        resource_id=resource_id,
        fact_group_id="vendor",
        payload={"vendor": "Cisco"}
    )
    engine.handle_event(event2)
    
    model = db_session.query(InventoryProjectionModel).first()
    assert model.hostname == "switch-01"
    assert model.vendor == "Cisco"
    assert model.last_event_version == 2
    
    # Event 3 (Duplicate/Old Version 1) - Should be ignored
    event3 = FactUpdated(
        tenant_id="t1",
        version=1,
        resource_id=resource_id,
        fact_group_id="hostname",
        payload={"hostname": "wrong-switch-01"}
    )
    engine.handle_event(event3)
    
    model = db_session.query(InventoryProjectionModel).first()
    assert model.hostname == "switch-01" # Remains unchanged due to idempotency
    assert model.last_event_version == 2

def test_topology_projection(db_session):
    bus = InMemoryDomainEventBus()
    registry = ProjectionRegistry()
    registry.register(TopologyProjectionBuilder())
    engine = ProjectionEngine(bus, registry, db_session)
    
    res1 = str(uuid.uuid4())
    res2 = str(uuid.uuid4())
    
    event1 = RelationshipAdded(
        tenant_id="t1",
        source_resource_id=res1,
        target_resource_id=res2,
        relationship_type="connected_to",
        version=1
    )
    engine.handle_event(event1)
    
    model = db_session.query(TopologyProjectionModel).first()
    assert len(model.nodes) == 2
    assert len(model.links) == 1
    assert model.links[0]["source"] == res1
