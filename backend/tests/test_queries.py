import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.projections import InventoryProjectionModel, TopologyProjectionModel
from app.services.queries.schema import QueryRequestV1, QueryFilter, FilterOp, QueryContext
from app.services.queries.cache import MemoryQueryCache
from app.services.queries.engine import QueryEngine
# Ensure handlers are imported to register themselves
import app.services.queries.handlers.inventory 
import app.services.queries.handlers.topology

from app.services.bff.screen_engine import ScreenEngine, ScreenConfig, WidgetConfig

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    yield db
    db.close()

def test_inventory_query(db_session):
    # Setup test data
    db_session.add(InventoryProjectionModel(resource_id="sw1", tenant_id="t1", vendor="Cisco", hostname="switch-01"))
    db_session.add(InventoryProjectionModel(resource_id="sw2", tenant_id="t1", vendor="Arista", hostname="switch-02"))
    db_session.add(InventoryProjectionModel(resource_id="sw3", tenant_id="t2", vendor="Cisco", hostname="switch-03"))
    db_session.commit()

    cache = MemoryQueryCache()
    engine = QueryEngine(db_session, cache)
    context = QueryContext(tenant_id="t1", permissions=["inventory:read"])
    
    # Test DSL filtering and tenant isolation
    request = QueryRequestV1(
        query="InventoryQuery",
        filter=[QueryFilter(field="vendor", op=FilterOp.EQ, value="Cisco")]
    )
    
    response = engine.execute(request, context)
    
    assert len(response.data) == 1
    assert response.data[0]["resource_id"] == "sw1"
    assert response.telemetry["rows_returned"] == 1
    
    # Test caching
    assert response.telemetry["cache_hit"] is False
    
    # Run again to hit cache
    cached_response = engine.execute(request, context)
    assert cached_response.telemetry["cache_hit"] is True

def test_topology_query(db_session):
    db_session.add(TopologyProjectionModel(
        topology_id="master_topology",
        tenant_id="t1",
        nodes=[{"id": "A"}, {"id": "B"}, {"id": "C"}],
        links=[{"source": "A", "target": "B"}, {"source": "B", "target": "C"}]
    ))
    db_session.commit()
    
    cache = MemoryQueryCache()
    engine = QueryEngine(db_session, cache)
    context = QueryContext(tenant_id="t1", permissions=["topology:read"])
    
    # Test path operation
    request = QueryRequestV1(
        query="TopologyQuery",
        parameters={"operation": "path", "source": "A", "target": "C"}
    )
    
    response = engine.execute(request, context)
    assert len(response.data["nodes"]) == 3 # A, B, C
    assert response.metadata["path_length"] == 3
    
    # Test neighbors operation
    request_neighbors = QueryRequestV1(
        query="TopologyQuery",
        parameters={"operation": "neighbors", "node_id": "C"}
    )
    
    resp_n = engine.execute(request_neighbors, context)
    assert len(resp_n.data["nodes"]) == 2 # B, C
    
def test_bff_screen_engine(db_session):
    db_session.add(InventoryProjectionModel(resource_id="sw1", tenant_id="t1", vendor="Cisco"))
    db_session.commit()
    
    cache = MemoryQueryCache()
    q_engine = QueryEngine(db_session, cache)
    screen_engine = ScreenEngine(db_session, q_engine)
    context = QueryContext(tenant_id="t1", permissions=["inventory:read", "topology:read"])
    
    config = ScreenConfig(
        name="TestScreen",
        layout="grid",
        widgets=[
            WidgetConfig(
                id="w1", title="W1", component="Card",
                query=QueryRequestV1(query="InventoryQuery")
            )
        ]
    )
    
    screen = screen_engine.execute_screen(config, context)
    
    assert screen["screen_name"] == "TestScreen"
    assert len(screen["widgets"]) == 1
    assert screen["widgets"][0]["data"][0]["resource_id"] == "sw1"
